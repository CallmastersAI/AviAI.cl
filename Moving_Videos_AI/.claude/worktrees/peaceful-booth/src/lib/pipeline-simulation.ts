import { PIPELINE_STEPS, type PipelineStage, type LogEntry } from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProgressUpdate {
  stage: PipelineStage;
  stepIndex: number;
  progress: number; // 0-100 overall
  stageProgress: number; // 0-100 within stage
  log: LogEntry;
}

export type OnProgressCallback = (update: ProgressUpdate) => void;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createLog(
  stage: PipelineStage,
  message: string,
  type: LogEntry["type"] = "info"
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    stage,
    message,
    type,
  };
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Sub-step messages per stage
// ---------------------------------------------------------------------------

const STAGE_MESSAGES: Record<string, { msg: string; type: LogEntry["type"] }[]> = {
  color_grade: [
    { msg: "Analyzing source image histogram...", type: "info" },
    { msg: "Detecting white balance: 5620K (daylight bias)", type: "info" },
    { msg: "Normalizing exposure to EV 0.0 ±0.3", type: "info" },
    { msg: "Applying LUT profile: Cinematic Warm", type: "info" },
    { msg: "Converting color space: sRGB → Rec.709", type: "info" },
    { msg: "Sharpening with adaptive unsharp mask (radius 1.2, amount 0.8)", type: "info" },
    { msg: "Color grade complete — perceptual delta E < 2.0", type: "success" },
  ],
  ai_furnish: [
    { msg: "Higsfield API: uploading source frame (2048×1536)", type: "info" },
    { msg: "Higsfield API: analyzing room geometry — 4 walls detected", type: "info" },
    { msg: "Segmenting floor plane and wall boundaries...", type: "info" },
    { msg: "Computing vanishing points for perspective alignment", type: "info" },
    { msg: "Style prompt injected: proportional modern furniture set", type: "info" },
    { msg: "Generating furniture layout — 7 objects placed", type: "info" },
    { msg: "Applying shadow and ambient occlusion pass", type: "info" },
    { msg: "Higsfield API: blending furnished layer at 98.4% confidence", type: "info" },
    { msg: "Quality check: furniture scale ratio validated (0.97–1.03x)", type: "success" },
    { msg: "AI furnishing complete — 2048×1536 output ready", type: "success" },
  ],
  animate: [
    { msg: "Kling AI 2.1: initializing img2video pipeline", type: "info" },
    { msg: "Kling AI 2.1: encoding source frame as latent seed", type: "info" },
    { msg: "Generating keyframes 1/48 — camera dolly-in motion", type: "info" },
    { msg: "Generating keyframes 12/48 — furniture pop-in effect", type: "info" },
    { msg: "Generating keyframes 24/48 — ambient particle system", type: "info" },
    { msg: "Generating keyframes 36/48 — light sweep transition", type: "info" },
    { msg: "Generating keyframes 48/48 — final hold frame", type: "info" },
    { msg: "Kling AI 2.1: temporal smoothing pass (optical flow)", type: "info" },
    { msg: "Kling AI 2.1: motion vector consistency check passed", type: "success" },
    { msg: "Animation render complete — 48 frames @ 24fps (2.0s clip)", type: "success" },
  ],
  compose: [
    { msg: "Remotion: loading project composition template", type: "info" },
    { msg: "Remotion: importing 48-frame animation sequence", type: "info" },
    { msg: "Applying speed ramp: ease-in 0.3s → 1x → ease-out 0.3s", type: "info" },
    { msg: "Adding motion blur (shutter angle 180°, samples 8)", type: "info" },
    { msg: "Compositing before/after wipe transition (diagonal)", type: "info" },
    { msg: "Overlaying watermark and branding lower-third", type: "info" },
    { msg: "Audio: mixing ambient room tone + whoosh SFX", type: "info" },
    { msg: "Remotion: final composition rendered — 4.2s @ 24fps", type: "success" },
  ],
  export: [
    { msg: "Real-ESRGAN: upscaling 2048×1536 → 3840×2160 (4K)", type: "info" },
    { msg: "Real-ESRGAN: denoising pass complete (sigma 0.4)", type: "info" },
    { msg: "ffmpeg: encoding H.264 (CRF 18, preset slow)", type: "info" },
    { msg: "ffmpeg: writing MP4 container — bitrate ~28 Mbps", type: "info" },
    { msg: "Generating thumbnail at frame 24 (best keyframe)", type: "info" },
    { msg: "Export complete — output: 3840×2160, 4.2s, 14.7 MB", type: "success" },
  ],
};

// ---------------------------------------------------------------------------
// Simulation engine
// ---------------------------------------------------------------------------

export async function simulatePipeline(
  projectId: string,
  onProgress: OnProgressCallback
): Promise<void> {
  const totalEstimated = PIPELINE_STEPS.reduce(
    (sum, s) => sum + s.estimatedSeconds,
    0
  );

  let elapsedTotal = 0;

  for (let stepIndex = 0; stepIndex < PIPELINE_STEPS.length; stepIndex++) {
    const step = PIPELINE_STEPS[stepIndex];
    const messages = STAGE_MESSAGES[step.id] ?? [];
    const stageDuration = step.estimatedSeconds * 1000; // ms
    const intervalPerMessage =
      messages.length > 0 ? stageDuration / messages.length : stageDuration;

    // Emit stage start
    onProgress({
      stage: step.id,
      stepIndex,
      progress: Math.round((elapsedTotal / totalEstimated) * 100),
      stageProgress: 0,
      log: createLog(step.id, `▶ Starting ${step.label} (${step.tool})`),
    });

    for (let i = 0; i < messages.length; i++) {
      await wait(intervalPerMessage);

      const stageProgress = Math.round(((i + 1) / messages.length) * 100);
      const elapsedStage = ((i + 1) / messages.length) * step.estimatedSeconds;
      const overallProgress = Math.min(
        99,
        Math.round(((elapsedTotal + elapsedStage) / totalEstimated) * 100)
      );

      onProgress({
        stage: step.id,
        stepIndex,
        progress: overallProgress,
        stageProgress,
        log: createLog(step.id, messages[i].msg, messages[i].type),
      });
    }

    elapsedTotal += step.estimatedSeconds;
  }

  // Final completion
  onProgress({
    stage: "complete",
    stepIndex: PIPELINE_STEPS.length,
    progress: 100,
    stageProgress: 100,
    log: createLog("complete", "Pipeline finished — video ready for preview", "success"),
  });
}
