"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DESIGN_STYLES } from "@/lib/types";
import type { DesignStyle } from "@/lib/types";

interface StyleSelectorProps {
  selected: DesignStyle | null;
  onSelect: (style: DesignStyle) => void;
}

export function StyleSelector({ selected, onSelect }: StyleSelectorProps) {
  const styles = Object.entries(DESIGN_STYLES) as [
    DesignStyle,
    (typeof DESIGN_STYLES)[DesignStyle],
  ][];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {styles.map(([key, style]) => {
        const isSelected = selected === key;

        return (
          <motion.button
            key={key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(key)}
            className={cn(
              "relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-colors",
              "bg-zinc-900/60 hover:bg-zinc-900",
              isSelected
                ? "border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.25)]"
                : "border-zinc-800"
            )}
          >
            {isSelected && (
              <motion.div
                layoutId="style-glow"
                className="pointer-events-none absolute inset-0 rounded-xl border-2 border-violet-500"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}

            <div className="flex items-center gap-2">
              {style.palette.map((color, i) => (
                <span
                  key={i}
                  className="h-4 w-4 rounded-full border border-zinc-700"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <div>
              <p className="text-sm font-semibold text-white">{style.label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">
                {style.description}
              </p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
