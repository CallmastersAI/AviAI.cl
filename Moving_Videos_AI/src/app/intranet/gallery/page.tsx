"use client";

import { motion } from "framer-motion";
import { FolderOpen, Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/project-card";
import { useProjects } from "@/lib/store";

export default function GalleryPage() {
  const { projects } = useProjects();

  const sorted = [...projects].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Galería</h1>
            <p className="mt-1 text-muted-foreground" aria-live="polite" aria-atomic="true">
              {projects.length} proyecto{projects.length !== 1 ? "s" : ""}{" "}
              generado{projects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button className="gap-2" render={<Link href="/intranet" />}>
            <Plus className="h-4 w-4" />
            Nuevo Proyecto
          </Button>
        </div>

        {sorted.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold">Sin proyectos aún</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              Sube fotos de espacios vacíos y genera videos con amoblado virtual
              impulsado por IA.
            </p>
            <Button className="mt-6 gap-2" render={<Link href="/intranet" />}>
              <Plus className="h-4 w-4" />
              Crear primer proyecto
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
