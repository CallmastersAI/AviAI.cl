"use client";

import Link from "next/link";
import { Plus, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/intranet/" className="flex items-center gap-2.5">
          <span className="text-xl font-bold tracking-tight text-white">
            REVELA
          </span>
          <span className="hidden text-xs font-medium tracking-widest text-violet-400 uppercase sm:inline-block">
            AI Video Staging
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/intranet/"
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
              "text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            )}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Proyecto</span>
          </Link>
          <Link
            href="/intranet/gallery"
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
              "text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Galería</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
