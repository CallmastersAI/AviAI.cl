import { NextResponse } from "next/server";
import { runPipeline } from "@/lib/pipeline/engine";
import { DESIGN_STYLES, type DesignStyle } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { projectId, style } = await req.json();

    if (!projectId || !style) {
      return NextResponse.json({ error: "Missing projectId or style" }, { status: 400 });
    }

    const styleInfo = DESIGN_STYLES[style as DesignStyle];
    const stylePrompt = styleInfo?.prompt || "";

    // Fire-and-forget — pipeline runs in background
    runPipeline(projectId, style, stylePrompt).catch((err) => {
      console.error(`Pipeline failed for ${projectId}:`, err);
    });

    return NextResponse.json({ status: "started", projectId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to start pipeline";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
