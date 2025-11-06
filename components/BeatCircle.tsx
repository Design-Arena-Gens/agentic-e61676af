"use client";

import { useAudioEngine } from "@lib/audio/engine";
import { useTheme } from "@lib/themes";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const RINGS = 4; // tracks
const STEPS = 16;

export function BeatCircle({ onTrigger }: { onTrigger?: () => void }) {
  const { pattern, toggleStep } = useAudioEngine();
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth * dpr;
    const h = canvas.clientHeight * dpr;
    canvas.width = w; canvas.height = h;
    ctx.clearRect(0,0,w,h);

    const cx = w/2, cy = h/2;
    const baseR = Math.min(w, h) * 0.35;

    for (let r = 0; r < RINGS; r++) {
      const inner = baseR * (r+0.2) / (RINGS+0.2);
      const outer = baseR * (r+1) / (RINGS+0.2) + 12;
      for (let s = 0; s < STEPS; s++) {
        const a0 = (s / STEPS) * Math.PI * 2 - Math.PI/2;
        const a1 = ((s+1) / STEPS) * Math.PI * 2 - Math.PI/2;
        const on = pattern[r][s] === 1;
        ctx.beginPath();
        ctx.arc(cx, cy, inner, a0, a1);
        ctx.arc(cx, cy, outer, a1, a0, true);
        ctx.closePath();
        ctx.fillStyle = on ? theme.ringColors[r % theme.ringColors.length] : 'rgba(255,255,255,0.05)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // center glow
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 0.4);
    grad.addColorStop(0, 'rgba(63,216,255,0.3)');
    grad.addColorStop(1, 'rgba(63,216,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, baseR * 0.45, 0, Math.PI*2); ctx.fill();
  }, [pattern, theme]);

  useEffect(() => { draw(); }, [draw]);

  const handlePointer = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const cx = 0.5, cy = 0.5;
    const dx = px - cx, dy = py - cy;
    const angle = Math.atan2(dy, dx) + Math.PI/2; // start at top
    let step = Math.floor(((angle < 0 ? angle + Math.PI*2 : angle) / (Math.PI*2)) * STEPS);
    step = Math.max(0, Math.min(STEPS-1, step));
    const dist = Math.hypot(dx, dy);
    const ring = Math.floor(dist / 0.35 * (RINGS+0.2)) - 0;
    if (ring >= 0 && ring < RINGS) {
      toggleStep(ring, step);
      onTrigger?.();
    }
  }, [toggleStep, onTrigger]);

  return (
    <div className="relative w-full max-w-md">
      <canvas
        ref={canvasRef}
        className="h-[54dvh] w-full touch-none select-none"
        onPointerDown={(e) => { setDragging(true); handlePointer(e); }}
        onPointerMove={(e) => { if (dragging) handlePointer(e); }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      />
    </div>
  );
}
