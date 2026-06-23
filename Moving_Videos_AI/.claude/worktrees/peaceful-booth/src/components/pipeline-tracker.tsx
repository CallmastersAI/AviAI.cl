"use client";

import { useRef, useEffect } from "react";
import {
  Palette,
  Sparkles,
  Film,
  Layers,
  Download,
  Check,
  Loader2,
  Circle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { PIPELINE_STEPS } from "@/lib/types";
import type { PipelineStage, LogEntry } from "@/lib/types";

const STEP_ICONS: Record<string, React.ElementType> = {
  color_grade: Palette,
  ai_furnish: Sparkles,
  animate: Film,
  compose: Layers,
  export: Download,
};

interface PipelineTrackerProps {
  currentStep: number;
  status: PipelineStage;
  logs: LogEntry[];
  progress: number;
}

function StepIcon({
  stepId,
  state,
}: {
  stepId: string;
  state: "pending" | "active" | "complete";
}) {
  const Icon = STEP_ICONS[stepId] ?? Circle;

  if (state === "complete") {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600">
        <Check className="h-4 w-4 text-white" />
      </div>
    );
  }

  if (state === "active") {
    return (
      <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-violet-600">
        <Loader2 className="h-4 w-4 animate-spin text-white" />
        <span className="absolute inset-0 animate-ping rounded-full bg-violet-500 opacity-30" />
      </div>
    );
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900">
      <Icon className="h-4 w-4 text-zinc-500" />
    </div>
  );
}

function getStepState(
  index: number,
  currentStep: number,
  status: PipelineStage
): "pending" | "active" | "complete" {
  if (status === "complete") return "complete";
  if (status === "error") {
    if (index < currentStep) return "complete";
    if (index === currentStep) return "active";
    return "pending";
  }
  if (index < currentStep) return "complete";
  if (index === currentStep) return "active";
  return "pending";
}

const LOG_COLORS: Record<LogEntry["type"], string> = {
  info: "text-zinc-400",
  success: "text-emerald-400",
  warning: "text-amber-400",
  error: "text-red-400",
};

export function PipelineTracker({
  currentStep,
  status,
  logs,
  progress,
}: PipelineTrackerProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <Progress value={progress} className="h-2" />

      {/* Vertical timeline */}
      <div className="relative space-y-0">
        {PIPELINE_STEPS.map((step, i) => {
          const state = getStepState(i, currentStep, status);
          const isLast = i === PIPELINE_STEPS.length - 1;

          return (
            <div key={step.id} className="flex gap-4">
              {/* Icon column + connector */}
              <div className="flex flex-col items-center">
                <StepIcon stepId={step.id} state={state} />
                {!isLast && (
                  <div
                    className={cn(
                      "w-0.5 flex-1 min-h-6",
                      state === "complete" ? "bg-emerald-600" : "bg-zinc-800"
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className={cn("pb-6", isLast && "pb-0")}>
                <p
                  className={cn(
                    "text-sm font-medium leading-8",
                    state === "active"
                      ? "text-white"
                      : state === "complete"
                        ? "text-emerald-400"
                        : "text-zinc-500"
                  )}
                >
                  {step.label}
                </p>
                <p className="text-xs text-zinc-500">{step.tool}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Console log */}
      {logs.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="ml-2 text-xs text-zinc-500">pipeline.log</span>
          </div>
          <ScrollArea className="h-48">
            <div className="p-3 font-mono text-xs leading-relaxed">
              <AnimatePresence initial={false}>
                {logs.map((entry, i) => (
                  <motion.div
                    key={`${entry.timestamp}-${i}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex gap-2"
                  >
                    <span className="shrink-0 text-zinc-600">
                      {new Date(entry.timestamp).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                    <span className={LOG_COLORS[entry.type]}>
                      {entry.message}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={logEndRef} />
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
