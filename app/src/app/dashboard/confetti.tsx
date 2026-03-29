'use client';

import { useEffect, useRef } from 'react';

interface Props {
  active: boolean;
  onDone?: () => void;
}

// Lättviktig canvas-konfetti utan extra beroenden
export function Confetti({ active, onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      w: number; h: number; color: string; rotation: number; rotSpeed: number;
      life: number;
    }> = [];

    // Skapa 80 konfetti-bitar från toppen
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: canvas.width * (0.3 + Math.random() * 0.4),
        y: -20 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 3 + 2,
        w: Math.random() * 8 + 4,
        h: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        life: 1,
      });
    }

    let frame: number;
    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      let alive = false;

      for (const p of particles) {
        if (p.life <= 0) continue;
        alive = true;

        p.x += p.vx;
        p.vy += 0.12; // gravitation
        p.y += p.vy;
        p.vx *= 0.99;
        p.rotation += p.rotSpeed;

        // Fade ut mot slutet
        if (p.y > canvas!.height * 0.7) {
          p.life -= 0.02;
        }

        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rotation);
        ctx!.globalAlpha = Math.max(0, p.life);
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx!.restore();
      }

      if (alive) {
        frame = requestAnimationFrame(draw);
      } else {
        onDone?.();
      }
    }
    frame = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(frame);
  }, [active, onDone]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[100] pointer-events-none"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
