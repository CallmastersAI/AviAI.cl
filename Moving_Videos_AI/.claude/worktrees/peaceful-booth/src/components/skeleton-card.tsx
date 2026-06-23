import { cn } from "@/lib/utils";

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60",
        className
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-violet-500/5 to-transparent" />
      </div>
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 rounded bg-zinc-800 animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-zinc-800/60 animate-pulse" />
      </div>
    </div>
  );
}
