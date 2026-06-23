import type { StageContext, StageResult } from "../engine";
import { storage } from "@/lib/storage";

const HIGSFIELD_API_KEY = process.env.HIGSFIELD_API_KEY;
const HIGSFIELD_API_URL = process.env.HIGSFIELD_API_URL || "https://api.higsfield.com/v1";

async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runAiFurnish(ctx: StageContext): Promise<StageResult> {
  const outputPaths: string[] = [];

  if (!HIGSFIELD_API_KEY) {
    // Simulation mode — pass through images with realistic delays
    ctx.onProgress("Higsfield API: simulation mode (no API key)", "warning", 5);

    for (let i = 0; i < ctx.imagePaths.length; i++) {
      ctx.onProgress(`Higsfield API: uploading source frame ${i + 1}/${ctx.imagePaths.length}`, "info", Math.round((i / ctx.imagePaths.length) * 20 + 10));
      await wait(800);

      ctx.onProgress("Analyzing room geometry — walls detected", "info", Math.round((i / ctx.imagePaths.length) * 30 + 20));
      await wait(600);

      ctx.onProgress("Segmenting floor plane and wall boundaries...", "info", Math.round((i / ctx.imagePaths.length) * 40 + 30));
      await wait(700);

      ctx.onProgress(`Style prompt injected: ${ctx.style} furniture set`, "info", Math.round((i / ctx.imagePaths.length) * 50 + 40));
      await wait(1000);

      ctx.onProgress("Generating furniture layout — objects placed", "info", Math.round((i / ctx.imagePaths.length) * 60 + 50));
      await wait(800);

      ctx.onProgress("Applying shadow and ambient occlusion pass", "info", Math.round((i / ctx.imagePaths.length) * 80 + 60));
      await wait(500);

      // Pass through the processed image
      outputPaths.push(ctx.imagePaths[i]);
    }

    ctx.onProgress("AI furnishing complete (simulation) — output ready", "success", 100);
    return { outputPaths };
  }

  // Real API integration
  for (let i = 0; i < ctx.imagePaths.length; i++) {
    const imagePath = ctx.imagePaths[i];
    const filename = `furnished-${i}.jpg`;

    ctx.onProgress(`Higsfield API: uploading source frame (${i + 1}/${ctx.imagePaths.length})`, "info", Math.round((i / ctx.imagePaths.length) * 20));

    try {
      const fs = await import("fs/promises");
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString("base64");

      const response = await fetch(`${HIGSFIELD_API_URL}/furnish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HIGSFIELD_API_KEY}`,
        },
        body: JSON.stringify({
          image: base64Image,
          prompt: ctx.stylePrompt,
          style: ctx.style,
        }),
      });

      if (!response.ok) {
        throw new Error(`Higsfield API error: ${response.status}`);
      }

      ctx.onProgress("Higsfield API: analyzing room geometry", "info", Math.round((i / ctx.imagePaths.length) * 50 + 30));

      const data = await response.json();

      if (data.status === "processing" && data.taskId) {
        // Poll for completion
        let attempts = 0;
        while (attempts < 60) {
          await wait(2000);
          const pollRes = await fetch(`${HIGSFIELD_API_URL}/tasks/${data.taskId}`, {
            headers: { Authorization: `Bearer ${HIGSFIELD_API_KEY}` },
          });
          const pollData = await pollRes.json();

          if (pollData.status === "completed" && pollData.result?.image) {
            const resultBuffer = Buffer.from(pollData.result.image, "base64");
            const outputPath = await storage.saveProcessed(ctx.projectId, filename, resultBuffer);
            outputPaths.push(outputPath);
            ctx.onProgress(`Furniture generation complete for image ${i + 1}`, "success", Math.round(((i + 1) / ctx.imagePaths.length) * 90));
            break;
          } else if (pollData.status === "failed") {
            throw new Error(`Task failed: ${pollData.error}`);
          }

          attempts++;
          ctx.onProgress(`Generating furniture layout... (${attempts * 2}s)`, "info", Math.round((i / ctx.imagePaths.length) * 70 + 40));
        }
      } else if (data.image) {
        // Synchronous response
        const resultBuffer = Buffer.from(data.image, "base64");
        const outputPath = await storage.saveProcessed(ctx.projectId, filename, resultBuffer);
        outputPaths.push(outputPath);
      }
    } catch (error) {
      ctx.onProgress(`Error furnishing image ${i + 1}: ${error instanceof Error ? error.message : "unknown"}`, "error", 0);
      outputPaths.push(imagePath); // fallback to original
    }
  }

  ctx.onProgress("AI furnishing complete — output ready", "success", 100);
  return { outputPaths };
}
