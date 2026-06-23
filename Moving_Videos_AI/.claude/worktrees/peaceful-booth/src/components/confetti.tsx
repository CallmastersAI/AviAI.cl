"use client";

import { useEffect, useState } from "react";

const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd", "#6ee7b7", "#fbbf24", "#f472b6"];
const PARTICLE_COUNT = 40;

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; color: string; delay: number; rotation: number; scale: number }[]
  >([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    setParticles(
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        x: randomBetween(-120, 120),
        y: randomBetween(-200, -60),
        color: COLORS[i % COLORS.length],
        delay: randomBetween(0, 0.4),
        rotation: randomBetween(0, 360),
        scale: randomBetween(0.5, 1.2),
      }))
    );

    const timer = setTimeout(() => setParticles([]), 3000);
    return () => clearTimeout(timer);
  }, [active]);

  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute animate-confetti-burst"
          style={{
            "--confetti-x": `${p.x}px`,
            "--confetti-y": `${p.y}px`,
            "--confetti-rotation": `${p.rotation}deg`,
            animationDelay: `${p.delay}s`,
            width: `${8 * p.scale}px`,
            height: `${8 * p.scale}px`,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
