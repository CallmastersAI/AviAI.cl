"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  Download,
  Maximize,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  videoUrl: string | null;
  thumbnailUrl: string | null;
  projectName: string;
}

export function VideoPlayer({
  videoUrl,
  thumbnailUrl,
  projectName,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
    // State is driven by onPlay/onPause events — no manual setPlaying needed
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const toggleFullscreen = () => {
    videoRef.current?.requestFullscreen();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = Number(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Placeholder when no video
  if (!videoUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={projectName}
            fill
            className="object-cover opacity-40"
            unoptimized={thumbnailUrl.startsWith("blob:")}
          />
        ) : (
          <div className="h-full w-full bg-zinc-900" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            <Loader2 className="h-10 w-10 text-violet-400" />
          </motion.div>
          <p className="text-sm font-medium text-zinc-300">Procesando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative aspect-video w-full overflow-hidden rounded-xl border border-zinc-800 bg-black">
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl ?? undefined}
        aria-label={projectName}
        className="h-full w-full object-contain"
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onClick={togglePlay}
      />

      {/* Controls overlay */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity",
          "opacity-0 group-hover:opacity-100"
        )}
      >
        {/* Seek bar */}
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          disabled={duration === 0}
          aria-label="Posición de reproducción"
          aria-valuetext={`${formatTime(currentTime)} de ${formatTime(duration)}`}
          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 accent-violet-500 disabled:cursor-default disabled:opacity-50"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              aria-label={playing ? "Pausar video" : "Reproducir video"}
              className="h-8 w-8 text-white hover:bg-white/10"
            >
              {playing ? (
                <Pause className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Play className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              aria-label={muted ? "Activar sonido" : "Silenciar video"}
              aria-pressed={muted}
              className="h-8 w-8 text-white hover:bg-white/10"
            >
              {muted ? (
                <VolumeX className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Volume2 className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
            <span className="text-xs text-zinc-400" aria-live="off">
              <span className="sr-only">Tiempo: </span>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Descargar video en MP4"
              className="h-8 w-8 text-white hover:bg-white/10"
              render={<a href={videoUrl} download={`${projectName}.mp4`} />}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              aria-label="Ver en pantalla completa"
              className="h-8 w-8 text-white hover:bg-white/10"
            >
              <Maximize className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
