import { subscribe, getState, type PipelineEvent } from "@/lib/pipeline/state";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send current state first (replay)
      const currentState = getState(projectId);
      if (currentState) {
        for (const log of currentState.logs) {
          const replayEvent: PipelineEvent = {
            projectId,
            stage: log.stage,
            stepIndex: currentState.currentStep,
            progress: currentState.progress,
            stageProgress: 0,
            log,
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(replayEvent)}\n\n`)
          );
        }

        // If already complete or error, close immediately
        if (currentState.stage === "complete" || currentState.stage === "error") {
          controller.close();
          return;
        }
      }

      // Subscribe to new events
      const unsubscribe = subscribe(projectId, (event: PipelineEvent) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );

          if (event.stage === "complete" || event.stage === "error") {
            controller.close();
          }
        } catch {
          // Stream already closed
          unsubscribe();
        }
      });

      // Cleanup on client disconnect
      req.signal.addEventListener("abort", () => {
        unsubscribe();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
