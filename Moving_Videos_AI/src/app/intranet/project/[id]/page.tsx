"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import Link from "next/link";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PipelineTracker } from "@/components/pipeline-tracker";
import { VideoPlayer } from "@/components/video-player";
import { useProjects } from "@/lib/store";
import {
  simulatePipeline,
  type ProgressUpdate,
} from "@/lib/pipeline-simulation";
import { DESIGN_STYLES } from "@/lib/types";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { projects, updateProject, addLog, setCurrentProject } = useProjects();
  const project = projects.find((p) => p.id === projectId);
  const pipelineStarted = useRef(false);
  const [showVideo, setShowVideo] = useState(false);

  // Capture the thumbnail URL once at render time — stable ref avoids stale closure
  const thumbnailPreview = useRef<string | null>(project?.images[0]?.preview ?? null);

  const handleProgress = useCallback(
    (update: ProgressUpdate) => {
      updateProject(projectId, {
        status: update.stage,
        progress: update.progress,
        currentStep: update.stepIndex,
        ...(update.stage === "complete"
          ? {
              completedAt: new Date().toISOString(),
              videoUrl: "/demo-video.mp4",
              thumbnailUrl: thumbnailPreview.current,
            }
          : {}),
      });
      addLog(projectId, update.log);
    },
    [projectId, updateProject, addLog]
  );

  useEffect(() => {
    if (!project || pipelineStarted.current) return;
    if (project.status === "complete") return;

    pipelineStarted.current = true;
    setCurrentProject(projectId);

    const controller = new AbortController();

    const timer = setTimeout(() => {
      simulatePipeline(projectId, handleProgress, controller.signal, project.style).then(() => {
        if (!controller.signal.aborted) {
          setTimeout(() => setShowVideo(true), 500);
        }
      });
    }, 800);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [project, projectId, handleProgress, setCurrentProject]);

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
    <div className="min-h-[calc(100vh-64px)]">
      {/* Header bar */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" aria-label="Volver al inicio" render={<Link href="/intranet" />}>
              <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
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
              <Button variant="outline" size="sm" className="gap-1.5" aria-label="Compartir proyecto">
                <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Compartir</span>
                <span className="sr-only sm:hidden">Compartir</span>
              </Button>
              <Button size="sm" className="gap-1.5" aria-label="Descargar video en 4K">
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Descargar 4K</span>
                <span className="sr-only sm:hidden">Descargar 4K</span>
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
                  {/* Before/After preview simulation */}
                  <div className="relative aspect-video bg-black/50">
                    {project.images[0]?.preview && (
                      <Image
                        src={project.images[0].preview}
                        alt="Preview"
                        fill
                        className="object-cover opacity-40"
                        unoptimized
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
                          aria-hidden="true"
                          className="mx-auto mb-3 h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center"
                        >
                          <div className="h-6 w-6 rounded-full bg-primary/40 animate-pulse" />
                        </motion.div>
                        <p className="text-sm font-medium text-foreground/80">
                          Procesando video...
                        </p>
                        <p
                          className="text-xs text-muted-foreground mt-1 font-mono"
                          aria-live="polite"
                          aria-atomic="true"
                          aria-label={`Progreso: ${project.progress} por ciento completado`}
                        >
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
                    className="relative aspect-square rounded-lg overflow-hidden border border-border/50 bg-card"
                  >
                    <Image
                      src={img.preview}
                      alt={img.originalName}
                      fill
                      className="object-cover"
                      unoptimized
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
  );
}
