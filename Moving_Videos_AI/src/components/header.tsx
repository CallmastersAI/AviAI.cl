"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    const normalized = href.replace(/\/$/, "");
    if (normalized === "/intranet") return pathname === "/intranet" || pathname === "/intranet/";
    return pathname === normalized || pathname.startsWith(normalized + "/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/intranet" className="flex items-center gap-2.5">
          <span className="text-xl font-bold tracking-tight text-white">
            REVELA
          </span>
          <span className="hidden text-xs font-medium tracking-widest text-violet-400 uppercase sm:inline-block">
            AI Video Staging
          </span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Navegación principal">
          <Link
            href="/intranet"
            aria-current={isActive("/intranet") ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
              isActive("/intranet")
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            )}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Nuevo Proyecto</span>
            <span className="sr-only sm:hidden">Nuevo Proyecto</span>
          </Link>
          <Link
            href="/intranet/gallery"
            aria-current={isActive("/intranet/gallery") ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
              isActive("/intranet/gallery")
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            )}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Galería</span>
            <span className="sr-only sm:hidden">Galería</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
