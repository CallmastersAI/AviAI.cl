"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DESIGN_STYLES } from "@/lib/types";
import type { Project } from "@/lib/types";

const STATUS_CONFIG = {
  processing: {
    label: "Procesando",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    icon: Clock,
  },
  complete: {
    label: "Completo",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    icon: CheckCircle2,
  },
  error: {
    label: "Error",
    className: "bg-red-500/15 text-red-400 border-red-500/30",
    icon: AlertCircle,
  },
} as const;

function getStatusKey(status: string): keyof typeof STATUS_CONFIG {
  if (status === "complete") return "complete";
  if (status === "error") return "error";
  return "processing";
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusKey = getStatusKey(project.status);
  const statusInfo = STATUS_CONFIG[statusKey];
  const StatusIcon = statusInfo.icon;
  const styleLabel = DESIGN_STYLES[project.style]?.label ?? project.style;
  const thumbnail =
    project.thumbnailUrl ?? project.images[0]?.preview ?? null;

  const formattedDate = new Date(project.createdAt).toLocaleDateString(
    "es-CL",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

  const statusText = STATUS_CONFIG[statusKey].label;

  return (
    <Link
      href={`/intranet/project/${project.id}`}
      aria-label={`${project.name} — estilo ${styleLabel}, ${statusText}. Creado el ${formattedDate}`}
    >
      <Card className="group overflow-hidden border-zinc-800 bg-zinc-900/60 transition-colors hover:border-violet-500/40 hover:bg-zinc-900">
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={project.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized={thumbnail.startsWith("blob:")}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-xs text-zinc-600">Sin preview</span>
            </div>
          )}

          {/* Status badge overlay — decorative, info already in Link aria-label */}
          <Badge
            variant="outline"
            aria-hidden="true"
            className={cn(
              "absolute right-2 top-2 gap-1 text-[10px]",
              statusInfo.className
            )}
          >
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </Badge>
        </div>

        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {project.name}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">{formattedDate}</p>
            </div>
            <Badge
              variant="outline"
              className="shrink-0 border-violet-500/30 bg-violet-500/10 text-[10px] text-violet-400"
            >
              {styleLabel}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
