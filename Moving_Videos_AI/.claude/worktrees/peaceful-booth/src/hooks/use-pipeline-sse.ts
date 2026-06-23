"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { PipelineStage, LogEntry } from "@/lib/types";

interface SSEEvent {
  projectId: string;
  stage: PipelineStage;
  stepIndex: number;
  progress: number;
  stageProgress: number;
  log: LogEntry;
}

interface UsePipelineSSEOptions {
  projectId: string;
  enabled: boolean;
  onProgress: (event: SSEEvent) => void;
  onComplete: () => void;
  onError: (error: string) => void;
}

export function usePipelineSSE({
  projectId,
  enabled,
  onProgress,
  onComplete,
  onError,
}: UsePipelineSSEOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnects = 5;

  const connect = useCallback(() => {
    if (!projectId || !enabled) return;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(`/api/pipeline/status/${projectId}`);
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;
    };

    es.onmessage = (event) => {
      try {
        const data: SSEEvent = JSON.parse(event.data);
        onProgress(data);

        if (data.stage === "complete") {
          onComplete();
          es.close();
          setIsConnected(false);
        } else if (data.stage === "error") {
          onError(data.log.message);
          es.close();
          setIsConnected(false);
        }
      } catch {
        // Invalid JSON, skip
      }
    };

    es.onerror = () => {
      es.close();
      setIsConnected(false);

      // Reconnect with exponential backoff
      if (reconnectAttempts.current < maxReconnects) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 16000);
        reconnectAttempts.current++;
        setTimeout(connect, delay);
      } else {
        onError("Lost connection to pipeline — max reconnect attempts reached");
      }
    };
  }, [projectId, enabled, onProgress, onComplete, onError]);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        setIsConnected(false);
      }
    };
  }, [connect, enabled]);

  return { isConnected };
}
