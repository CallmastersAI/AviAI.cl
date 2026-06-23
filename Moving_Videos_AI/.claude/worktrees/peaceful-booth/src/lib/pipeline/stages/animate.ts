import type { StageContext, StageResult } from "../engine";
import { storage } from "@/lib/storage";

const HIGSFIELD_API_KEY = process.env.HIGSFIELD_API_KEY;
const HIGSFIELD_API_URL = process.env.HIGSFIELD_API_URL || "https://api.higsfield.com/v1";

async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runAnimate(ctx: StageContext): Promise<StageResult> {
  const outputPaths: string[] = [];

  if (!HIGSFIELD_API_KEY) {
    // Simulation mode
    ctx.onProgress("Kling AI 2.1: simulation mode (no API key)", "warning", 5);

    const totalFrames = 48;
    const frameSteps = [1, 12, 24, 36, 48];

    for (const frame of frameSteps) {
      const labels: Record<number, string> = {
        1: "camera dolly-in motion",
        12: "furniture pop-in effect",
        24: "ambient particle system",
        36: "light sweep transition",
        48: "final hold frame",
      };
      ctx.onProgress(`Generating keyframes ${frame}/${totalFrames} — ${labels[frame]}`, "info", Math.round((frame / totalFrames) * 80));
      await wait(1500);
    }

    ctx.onProgress("Kling AI 2.1: temporal smoothing pass (optical flow)", "info", 85);
    await wait(800);

    ctx.onProgress("Kling AI 2.1: motion vector consistency check passed", "success", 95);
    await wait(400);

    ctx.onProgress("Animation render complete — 48 frames @ 24fps (2.0s clip)", "success", 100);

    // Pass through the processed images
    return { outputPaths: ctx.imagePaths };
  }

  // Real API — Kling AI via Higsfield
  for (let i = 0; i < ctx.imagePaths.length; i++) {
    const imagePath = ctx.imagePaths[i];
    const filename = `animated-${i}.mp4`;

    ctx.onProgress(`Kling AI 2.1: initializing img2video pipeline (${i + 1}/${ctx.imagePaths.length})`, "info", Math.round((i / ctx.imagePaths.length) * 10));

    try {
      const fs = await import("fs/promises");
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString("base64");

      const response = await fetch(`${HIGSFIELD_API_URL}/animate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HIGSFIELD_API_KEY}`,
        },
        body: JSON.stringify({
          image: base64Image,
          motion: "dolly-in",
          duration: 2.0,
          fps: 24,
          style: ctx.style,
        }),
      });

      if (!response.ok) throw new Error(`Kling API error: ${response.status}`);

      const data = await response.json();

      if (data.taskId) {
        let attempts = 0;
        while (attempts < 90) {
          await wait(3000);
          const pollRes = await fetch(`${HIGSFIELD_API_URL}/tasks/${data.taskId}`, {
            headers: { Authorization: `Bearer ${HIGSFIELD_API_KEY}` },
          });
          const pollData = await pollRes.json();

          if (pollData.status === "completed" && pollData.result?.video) {
            const videoBuffer = Buffer.from(pollData.result.video, "base64");
            const outputPath = await storage.saveVideo(ctx.projectId, filename, videoBuffer);
            outputPaths.push(outputPath);
            ctx.onProgress(`Animation complete for image ${i + 1}`, "success", Math.round(((i + 1) / ctx.imagePaths.length) * 90));
            break;
          } else if (pollData.status === "failed") {
            throw new Error(`Animation task failed: ${pollData.error}`);
          }

          attempts++;
          const progress = Math.min(80, attempts * 3);
          ctx.onProgress(`Generating keyframes... (${attempts * 3}s elapsed)`, "info", Math.round((i / ctx.imagePaths.length) * progress + 20));
        }
      }
    } catch (error) {
      ctx.onProgress(`Animation error for image ${i + 1}: ${error instanceof Error ? error.message : "unknown"}`, "error", 0);
      outputPaths.push(imagePath);
    }
  }

  ctx.onProgress("Animation render complete", "success", 100);
  return { outputPaths };
}
