import { NextResponse } from "next/server";
import { getState } from "@/lib/pipeline/state";
import { storage } from "@/lib/storage";
import fs from "fs/promises";
import path from "path";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;

  // Check pipeline state for video path
  const state = getState(projectId);
  let videoPath = state?.videoPath;

  if (!videoPath) {
    // Try to find video in output directory
    videoPath = storage.getPath(projectId, "output", "final.mp4");
  }

  try {
    const stat = await fs.stat(videoPath);
    const fileSize = stat.size;
    const range = req.headers.get("range");

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const fileHandle = await fs.open(videoPath, "r");
      const buffer = Buffer.alloc(chunkSize);
      await fileHandle.read(buffer, 0, chunkSize, start);
      await fileHandle.close();

      return new Response(buffer, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": String(chunkSize),
          "Content-Type": "video/mp4",
        },
      });
    }

    const fileBuffer = await fs.readFile(videoPath);
    return new Response(fileBuffer, {
      headers: {
        "Content-Length": String(fileSize),
        "Content-Type": "video/mp4",
        "Accept-Ranges": "bytes",
      },
    });
  } catch {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }
}
