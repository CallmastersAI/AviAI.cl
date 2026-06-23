import { PIPELINE_STEPS, type PipelineStage, type LogEntry } from "@/lib/types";
import { emitProgress, setResult, scheduleCleanup, type PipelineEvent } from "./state";
import { storage } from "@/lib/storage";

// Stage implementations
import { runColorGrade } from "./stages/color-grade";
import { runAiFurnish } from "./stages/ai-furnish";
import { runAnimate } from "./stages/animate";
import { runCompose } from "./stages/compose";
import { runExport } from "./stages/export";

export interface StageContext {
  projectId: string;
  style: string;
  stylePrompt: string;
  imagePaths: string[];
  onProgress: (msg: string, type?: LogEntry["type"], stageProgress?: number) => void;
}

export interface StageResult {
  outputPaths: string[];
}

type StageFn = (ctx: StageContext) => Promise<StageResult>;

const STAGE_FNS: Record<string, StageFn> = {
  color_grade: runColorGrade,
  ai_furnish: runAiFurnish,
  animate: runAnimate,
  compose: runCompose,
  export: runExport,
};

function createLog(stage: PipelineStage, message: string, type: LogEntry["type"] = "info"): LogEntry {
  return { timestamp: new Date().toISOString(), stage, message, type };
}

export async function runPipeline(
  projectId: string,
  style: string,
  stylePrompt: string
): Promise<void> {
  const totalEstimated = PIPELINE_STEPS.reduce((sum, s) => sum + s.estimatedSeconds, 0);
  let elapsedTotal = 0;
  let currentPaths: string[] = await storage.getOriginals(projectId);

  try {
    for (let stepIndex = 0; stepIndex < PIPELINE_STEPS.length; stepIndex++) {
      const step = PIPELINE_STEPS[stepIndex];
      const stageFn = STAGE_FNS[step.id];

      // Emit stage start
      emitProgress(projectId, {
        projectId,
        stage: step.id,
        stepIndex,
        progress: Math.round((elapsedTotal / totalEstimated) * 100),
        stageProgress: 0,
        log: createLog(step.id, `▶ Starting ${step.label} (${step.tool})`),
      });

      const ctx: StageContext = {
        projectId,
        style,
        stylePrompt,
        imagePaths: currentPaths,
        onProgress: (msg, type = "info", stageProgress = 50) => {
          const elapsedStage = (stageProgress / 100) * step.estimatedSeconds;
          const overallProgress = Math.min(
            99,
            Math.round(((elapsedTotal + elapsedStage) / totalEstimated) * 100)
          );
          emitProgress(projectId, {
            projectId,
            stage: step.id,
            stepIndex,
            progress: overallProgress,
            stageProgress,
            log: createLog(step.id, msg, type),
          });
        },
      };

      if (stageFn) {
        const result = await stageFn(ctx);
        if (result.outputPaths.length > 0) {
          currentPaths = result.outputPaths;
        }
      }

      elapsedTotal += step.estimatedSeconds;
    }

    // Set result paths
    const videoPath = currentPaths[0] || "";
    const thumbnailPath = storage.getPath(projectId, "output", "thumbnail.jpg");
    setResult(projectId, videoPath, thumbnailPath);

    // Final completion
    emitProgress(projectId, {
      projectId,
      stage: "complete",
      stepIndex: PIPELINE_STEPS.length,
      progress: 100,
      stageProgress: 100,
      log: createLog("complete", "Pipeline finished — video ready for preview", "success"),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    emitProgress(projectId, {
      projectId,
      stage: "error",
      stepIndex: 0,
      progress: 0,
      stageProgress: 0,
      log: createLog("error", `Pipeline failed: ${message}`, "error"),
    });
  } finally {
    scheduleCleanup(projectId);
  }
}
