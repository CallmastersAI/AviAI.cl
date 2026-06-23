"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Upload,
  Palette,
  Rocket,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/upload-zone";
import { StyleSelector } from "@/components/style-selector";
import { useProjects } from "@/lib/store";
import type { ProjectImage, DesignStyle } from "@/lib/types";

type WizardStep = "upload" | "style" | "confirm";

const STEPS: { id: WizardStep; label: string; icon: React.ReactNode }[] = [
  { id: "upload", label: "Subir fotos", icon: <Upload className="h-4 w-4" /> },
  {
    id: "style",
    label: "Elegir estilo",
    icon: <Palette className="h-4 w-4" />,
  },
  {
    id: "confirm",
    label: "Generar video",
    icon: <Rocket className="h-4 w-4" />,
  },
];

export default function IntranetPage() {
  const router = useRouter();
  const { createProject } = useProjects();

  const [step, setStep] = useState<WizardStep>("upload");
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<DesignStyle | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  const canAdvance =
    (step === "upload" && images.length > 0) ||
    (step === "style" && selectedStyle !== null) ||
    step === "confirm";

  const handleNext = useCallback(() => {
    if (step === "upload" && images.length > 0) setStep("style");
    else if (step === "style" && selectedStyle) setStep("confirm");
  }, [step, images.length, selectedStyle]);

  const handleBack = useCallback(() => {
    if (step === "style") setStep("upload");
    else if (step === "confirm") setStep("style");
  }, [step]);

  const handleLaunch = useCallback(async () => {
    if (!selectedStyle || images.length === 0) return;
    setIsLaunching(true);

    const projectId = uuidv4();
    const projectName = `Proyecto ${new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`;

    // Upload images to server
    try {
      const formData = new FormData();
      const roomTypes: Record<number, string> = {};

      images.forEach((img, i) => {
        if (img.file) {
          formData.append(`image-${i}`, img.file);
          roomTypes[i] = img.roomType;
        }
      });

      formData.append("metadata", JSON.stringify({
        projectId,
        style: selectedStyle,
        roomTypes,
      }));

      await fetch("/api/projects", { method: "POST", body: formData });
    } catch {
      // Continue even if upload fails — simulation mode will work
    }

    createProject({
      id: projectId,
      name: projectName,
      style: selectedStyle,
      images,
    });

    setTimeout(() => {
      router.push(`/intranet/project/${projectId}`);
    }, 600);
  }, [selectedStyle, images, createProject, router]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      {/* Step indicator */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (i < currentStepIndex) {
                      setStep(s.id);
                    }
                  }}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    i === currentStepIndex
                      ? "bg-primary text-primary-foreground"
                      : i < currentStepIndex
                        ? "bg-muted text-foreground hover:bg-muted/80 cursor-pointer"
                        : "text-muted-foreground cursor-default"
                  }`}
                >
                  {s.icon}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-px w-8 ${i < currentStepIndex ? "bg-primary/50" : "bg-border"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 mx-auto w-full max-w-5xl px-6 py-8">
        <AnimatePresence mode="wait">
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">
                  Sube las fotos del espacio
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Arrastra hasta 10 fotos de las habitaciones que quieres
                  transformar. Cada foto genera un video independiente.
                </p>
              </div>
              <UploadZone images={images} onImagesChange={setImages} />
            </motion.div>
          )}

          {step === "style" && (
            <motion.div
              key="style"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">
                  Elige el estilo de amoblado
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Selecciona cómo quieres que se vean las habitaciones. Cada
                  mueble será proporcionado al espacio real.
                </p>
              </div>
              <StyleSelector
                selected={selectedStyle}
                onSelect={setSelectedStyle}
              />
            </motion.div>
          )}

          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="text-center max-w-lg">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Todo listo para generar
                </h1>
                <p className="mt-3 text-muted-foreground">
                  {images.length} foto{images.length !== 1 ? "s" : ""} en estilo{" "}
                  <span className="text-foreground font-medium capitalize">
                    {selectedStyle}
                  </span>
                  . El pipeline procesará automáticamente las 5 etapas de IA.
                </p>

                {/* Summary cards */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border/50 bg-card p-4 text-left">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Imágenes
                    </p>
                    <p className="mt-1 text-2xl font-bold font-mono">
                      {images.length}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-card p-4 text-left">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Tiempo estimado
                    </p>
                    <p className="mt-1 text-2xl font-bold font-mono">
                      ~{images.length * 30}s
                    </p>
                  </div>
                </div>

                {/* Preview thumbnails */}
                <div className="mt-6 flex justify-center gap-2 flex-wrap">
                  {images.slice(0, 6).map((img) => (
                    <div
                      key={img.id}
                      className="h-16 w-16 rounded-lg overflow-hidden border border-border/50"
                    >
                      <img
                        src={img.preview}
                        alt={img.originalName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                  {images.length > 6 && (
                    <div className="h-16 w-16 rounded-lg border border-border/50 flex items-center justify-center bg-muted">
                      <span className="text-xs text-muted-foreground">
                        +{images.length - 6}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  size="lg"
                  className="mt-8 gap-2 px-8"
                  onClick={handleLaunch}
                  disabled={isLaunching}
                >
                  {isLaunching ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: "linear",
                        }}
                      >
                        <Sparkles className="h-4 w-4" />
                      </motion.div>
                      Iniciando pipeline...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4" />
                      Generar Videos
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      {step !== "confirm" && (
        <div className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === "upload"}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Atrás
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canAdvance}
              className="gap-2"
            >
              Siguiente
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
