"use client";

import { onParticle } from "@lib/particlesBus";
import React, { useEffect, useRef } from "react";

export function ParticleLayer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number; color: string }[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    const onResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    };
    onResize();
    window.addEventListener('resize', onResize);

    const unsub = onParticle(({ x, y, color = '#3fd8ff' }) => {
      for (let i = 0; i < 24; i++) {
        const a = (Math.random() * Math.PI * 2);
        const s = 0.003 + Math.random() * 0.01;
        particlesRef.current.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, color });
      }
    });

    const loop = () => {
      const ctxW = canvas.width, ctxH = canvas.height;
      ctx.clearRect(0,0,ctxW,ctxH);
      const now = performance.now();
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.0003; // gravity
        p.life -= 0.02;
      });
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
      for (const p of particlesRef.current) {
        ctx.beginPath();
        ctx.fillStyle = hexToRgba(p.color, Math.max(0, p.life));
        ctx.arc(p.x * ctxW, p.y * ctxH, 3 * (p.life + 0.2), 0, Math.PI*2);
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', onResize);
      unsub();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />
}

function hexToRgba(hex: string, a: number) {
  const m = hex.match(/#([0-9a-f]{6})/i);
  if (!m) return `rgba(63,216,255,${a})`;
  const i = parseInt(m[1], 16);
  const r = (i >> 16) & 255;
  const g = (i >> 8) & 255;
  const b = i & 255;
  return `rgba(${r},${g},${b},${a})`;
}
