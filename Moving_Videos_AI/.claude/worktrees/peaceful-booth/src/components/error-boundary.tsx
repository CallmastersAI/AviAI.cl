"use client";

import { Component, type ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Algo salió mal
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {this.props.fallbackMessage || "Ocurrió un error inesperado. Intenta de nuevo."}
          </p>
          {this.state.error && (
            <details className="mt-4 max-w-md text-left">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                Detalles del error
              </summary>
              <pre className="mt-2 rounded-lg bg-zinc-900 p-3 text-xs text-red-400 overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <Button
            onClick={this.handleRetry}
            variant="outline"
            className="mt-6 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
