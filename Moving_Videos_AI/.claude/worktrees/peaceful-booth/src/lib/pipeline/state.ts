import { EventEmitter } from "events";
import type { PipelineStage, LogEntry } from "@/lib/types";

export interface PipelineEvent {
  projectId: string;
  stage: PipelineStage;
  stepIndex: number;
  progress: number;
  stageProgress: number;
  log: LogEntry;
}

interface PipelineStateEntry {
  stage: PipelineStage;
  progress: number;
  currentStep: number;
  logs: LogEntry[];
  videoPath: string | null;
  thumbnailPath: string | null;
  emitter: EventEmitter;
}

const states = new Map<string, PipelineStateEntry>();

export function getOrCreateState(projectId: string): PipelineStateEntry {
  if (!states.has(projectId)) {
    states.set(projectId, {
      stage: "uploading",
      progress: 0,
      currentStep: 0,
      logs: [],
      videoPath: null,
      thumbnailPath: null,
      emitter: new EventEmitter(),
    });
  }
  return states.get(projectId)!;
}

export function emitProgress(projectId: string, event: PipelineEvent): void {
  const state = getOrCreateState(projectId);
  state.stage = event.stage;
  state.progress = event.progress;
  state.currentStep = event.stepIndex;
  state.logs.push(event.log);
  state.emitter.emit("progress", event);
}

export function setResult(projectId: string, videoPath: string, thumbnailPath: string): void {
  const state = getOrCreateState(projectId);
  state.videoPath = videoPath;
  state.thumbnailPath = thumbnailPath;
}

export function subscribe(projectId: string, handler: (event: PipelineEvent) => void): () => void {
  const state = getOrCreateState(projectId);
  state.emitter.on("progress", handler);
  return () => {
    state.emitter.off("progress", handler);
  };
}

export function getState(projectId: string): PipelineStateEntry | undefined {
  return states.get(projectId);
}

export function cleanup(projectId: string): void {
  const state = states.get(projectId);
  if (state) {
    state.emitter.removeAllListeners();
    states.delete(projectId);
  }
}

// Auto cleanup after 5 minutes
export function scheduleCleanup(projectId: string): void {
  setTimeout(() => cleanup(projectId), 5 * 60 * 1000);
}
