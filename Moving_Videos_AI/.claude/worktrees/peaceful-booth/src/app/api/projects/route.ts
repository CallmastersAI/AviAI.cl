import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const metadataRaw = formData.get("metadata");

    if (!metadataRaw || typeof metadataRaw !== "string") {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const metadata = JSON.parse(metadataRaw);
    const { projectId, style, roomTypes } = metadata;

    if (!projectId || !style) {
      return NextResponse.json({ error: "Missing projectId or style" }, { status: 400 });
    }

    await storage.ensureProject(projectId);

    const savedImages: { id: string; path: string; roomType: string }[] = [];

    // Process uploaded files
    const entries = Array.from(formData.entries());
    for (const [key, value] of entries) {
      if (key.startsWith("image-") && value instanceof Blob) {
        const index = parseInt(key.replace("image-", ""), 10);
        const buffer = Buffer.from(await value.arrayBuffer());
        const ext = value.type === "image/png" ? "png" : "jpg";
        const filename = `original-${index}.${ext}`;
        const path = await storage.saveOriginal(projectId, filename, buffer);

        savedImages.push({
          id: `img-${index}`,
          path,
          roomType: roomTypes?.[index] || "living",
        });
      }
    }

    return NextResponse.json({
      id: projectId,
      style,
      images: savedImages,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
