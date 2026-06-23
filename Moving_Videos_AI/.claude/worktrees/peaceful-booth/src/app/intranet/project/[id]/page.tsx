"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PipelineTracker } from "@/components/pipeline-tracker";
import { VideoPlayer } from "@/components/video-player";
import { Confetti } from "@/components/confetti";
import { ErrorBoundary } from "@/components/error-boundary";
import { useProjects } from "@/lib/store";
import { usePipelineSSE } from "@/hooks/use-pipeline-sse";
import { DESIGN_STYLES } from "@/lib/types";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { projects, updateProject, addLog, setCurrentProject } = useProjects();
  const project = projects.find((p) => p.id === projectId);
  const pipelineStarted = useRef(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Start pipeline via API
  useEffect(() => {
    if (!project || pipelineStarted.current) return;
    if (project.status === "complete") return;

    pipelineStarted.current = true;
    setCurrentProject(projectId);

    const timer = setTimeout(() => {
      fetch("/api/pipeline/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, style: project.style }),
      }).catch(() => {
        // Pipeline start failed — will fall back on SSE reconnect
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [project, projectId, setCurrentProject]);

  // SSE connection for real-time progress
  const handleSSEProgress = useCallback(
    (event: { stage: string; stepIndex: number; progress: number; log: { timestamp: string; stage: string; message: string; type: string } }) => {
      updateProject(projectId, {
        status: event.stage as any,
        progress: event.progress,
        currentStep: event.stepIndex,
      });
      addLog(projectId, event.log as any);
    },
    [projectId, updateProject, addLog]
  );

  const handleSSEComplete = useCallback(() => {
    updateProject(projectId, {
      completedAt: new Date().toISOString(),
      videoUrl: `/api/projects/${projectId}/video`,
      thumbnailUrl: `/api/projects/${projectId}/thumbnail`,
    });
    setShowConfetti(true);
    setTimeout(() => setShowVideo(true), 500);
  }, [projectId, updateProject]);

  const handleSSEError = useCallback(
    (error: string) => {
      updateProject(projectId, { status: "error" as any });
      addLog(projectId, {
        timestamp: new Date().toISOString(),
        stage: "error" as any,
        message: error,
        type: "error",
      });
    },
    [projectId, updateProject, addLog]
  );

  usePipelineSSE({
    projectId,
    enabled: !!project && project.status !== "complete" && project.status !== "error" && pipelineStarted.current,
    onProgress: handleSSEProgress,
    onComplete: handleSSEComplete,
    onError: handleSSEError,
  });

  useEffect(() => {
    if (project?.status === "complete") {
      setShowVideo(true);
    }
  }, [project?.status]);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted-foreground">Proyecto no encontrado</p>
        <Button variant="ghost" render={<Link href="/intranet" />}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>
    );
  }

  const styleInfo = DESIGN_STYLES[project.style];
  const isComplete = project.status === "complete";

  return (
    <ErrorBoundary fallbackMessage="Error al cargar el proyecto. Intenta recargar la página.">
      <Confetti active={showConfetti} />
      <div className="min-h-[calc(100vh-64px)]">
        {/* Header bar */}
        <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" render={<Link href="/intranet" />}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Atrás
              </Button>
              <div>
                <h1 className="text-lg font-semibold">{project.name}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {styleInfo?.label ?? project.style}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {project.images.length} imagen
                    {project.images.length !== 1 ? "es" : ""}
                  </span>
                  {isComplete && (
                    <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/20 text-xs">
                      Completado
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {isComplete && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Share2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Compartir</span>
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5"
                  render={
                    <a
                      href={`/api/projects/${projectId}/video`}
                      download={`${project.name}.mp4`}
                    />
                  }
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Descargar 4K</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: Video preview + images */}
            <div className="lg:col-span-3 space-y-6">
              {/* Video area */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {showVideo && isComplete ? (
                  <div className="rounded-xl overflow-hidden border border-border/50 bg-card">
                    <VideoPlayer
                      videoUrl={project.videoUrl}
                      thumbnailUrl={project.thumbnailUrl}
                      projectName={project.name}
                    />
                  </div>
                ) : (
                  <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
                    <div className="relative aspect-video bg-black/50">
                      {project.images[0]?.preview && (
                        <img
                          src={project.images[0].preview}
                          alt="Preview"
                          className="h-full w-full object-cover opacity-40"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{
                              repeat: Infinity,
                              duration: 2,
                              ease: "easeInOut",
                            }}
                            className="mx-auto mb-3 h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center"
                          >
                            <div className="h-6 w-6 rounded-full bg-primary/40 animate-pulse" />
                          </motion.div>
                          <p className="text-sm font-medium text-foreground/80">
                            Procesando video...
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 font-mono">
                            {project.progress}% completado
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Source images */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Imágenes fuente
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {project.images.map((img) => (
                    <div
                      key={img.id}
                      className="aspect-square rounded-lg overflow-hidden border border-border/50 bg-card"
                    >
                      <img
                        src={img.preview}
                        alt={img.originalName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right: Pipeline tracker */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <PipelineTracker
                  currentStep={project.currentStep}
                  status={project.status}
                  logs={project.logs}
                  progress={project.progress}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
