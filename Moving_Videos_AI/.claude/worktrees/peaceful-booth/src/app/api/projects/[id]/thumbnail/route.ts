import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import fs from "fs/promises";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const thumbnailPath = storage.getPath(projectId, "output", "thumbnail.jpg");

  try {
    const buffer = await fs.readFile(thumbnailPath);
    return new Response(buffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Thumbnail not found" }, { status: 404 });
  }
}
