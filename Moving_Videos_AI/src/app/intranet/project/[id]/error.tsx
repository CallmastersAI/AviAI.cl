"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ProjectError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
        <AlertCircle className="h-8 w-8 text-red-400" />
      </div>

      <div>
        <h1 className="text-xl font-semibold text-foreground">Error en el pipeline</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          Ocurrió un problema al procesar el proyecto. Puedes intentar de nuevo
          o volver al inicio.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-muted-foreground/50">
            ref: {error.digest}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" render={<Link href="/intranet" />}>
          <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
          Volver al inicio
        </Button>
        <Button size="sm" onClick={reset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </Button>
      </div>
    </div>
  );
}
