'use client';

import { useEffect, useRef, useState } from 'react';

interface TrailPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  maxAge: number;
  r: number;
  g: number;
  b: number;
  size: number;
}

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => {
      const isMobileScreen = window.innerWidth < 1024;
      const isCoarse = window.matchMedia('(pointer: coarse)').matches;
      const canHover = window.matchMedia('(hover: hover)').matches;
      return !isMobileScreen && !isCoarse && canHover;
    };

    setEnabled(checkIsDesktop());

    const onResize = () => {
      setEnabled(checkIsDesktop());
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const canvas = canvasRef.current;
    if (!dot || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let targetX = x;
    let targetY = y;
    let prevX = x;
    let prevY = y;
    let scale = 1;
    let targetScale = 1;
    let isHidden = false;

    const points: TrailPoint[] = [];

    // Color interpolation: White on blue/dark background, Blue on white/light background
    // Default start with White
    let currentColor = { r: 255, g: 255, b: 255 };
    let targetColor = { r: 255, g: 255, b: 255 };

    const detectColorAt = (px: number, py: number) => {
      try {
        let el = document.elementFromPoint(px, py);
        while (el && el !== document.body && el !== document.documentElement) {
          // Explicit section IDs or classes
          const id = el.id;
          if (id === 'intro' || id === 'work' || id === 'gallery') {
            return { r: 30, g: 144, b: 255 }; // Electric Royal Blue on white sections
          }
          if (id === 'contact' || id === 'hero' || id === 'services') {
            return { r: 255, g: 255, b: 255 }; // Crisp Luminous White on blue/dark sections
          }

          const classList = el.classList;
          if (classList.contains('bg-white') || classList.contains('bg-[#f4f4f4]')) {
            return { r: 30, g: 144, b: 255 };
          }
          if (classList.contains('bg-[#0A1F44]') || classList.contains('bg-black') || classList.contains('bg-[#000B18]')) {
            return { r: 255, g: 255, b: 255 };
          }

          const bg = window.getComputedStyle(el).backgroundColor;
          if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
            const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (match) {
              const cr = parseInt(match[1]);
              const cg = parseInt(match[2]);
              const cb = parseInt(match[3]);
              const lum = (0.299 * cr + 0.587 * cg + 0.114 * cb) / 255;
              // If background is light (lum > 0.5) -> Blue trail; if dark/blue -> White trail
              return lum > 0.55 ? { r: 30, g: 144, b: 255 } : { r: 255, g: 255, b: 255 };
            }
          }
          el = el.parentElement;
        }
      } catch {
        // Fallback
      }
      return { r: 255, g: 255, b: 255 };
    };

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (document.body.classList.contains('hide-cursor-for-3d')) {
        dot.style.opacity = '0';
        isHidden = true;
        return;
      }
      dot.style.opacity = '1';
      isHidden = false;

      targetColor = detectColorAt(targetX, targetY);

      // Add trail points
      const dx = targetX - prevX;
      const dy = targetY - prevY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 3 && !isHidden) {
        const steps = Math.min(8, Math.floor(dist / 4));
        for (let i = 0; i <= steps; i++) {
          const t = steps === 0 ? 1 : i / steps;
          const px = prevX + dx * t;
          const py = prevY + dy * t;
          points.push({
            x: px,
            y: py,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            age: 0,
            maxAge: 26,
            r: currentColor.r,
            g: currentColor.g,
            b: currentColor.b,
            size: 4.0,
          });
        }
        prevX = targetX;
        prevY = targetY;
      }
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const interactive = target?.closest(
        'a, button, [role="button"], input, textarea, select, label, .cursor-pointer'
      );
      targetScale = interactive ? 1.8 : 1;
    };

    const onMouseLeave = () => {
      dot.style.opacity = '0';
      isHidden = true;
    };

    let raf = 0;
    const loop = () => {
      x += (targetX - x) * 0.28;
      y += (targetY - y) * 0.28;
      scale += (targetScale - scale) * 0.16;

      // Color lerp
      currentColor.r += (targetColor.r - currentColor.r) * 0.14;
      currentColor.g += (targetColor.g - currentColor.g) * 0.14;
      currentColor.b += (targetColor.b - currentColor.b) * 0.14;

      const r = Math.round(currentColor.r);
      const g = Math.round(currentColor.g);
      const b = Math.round(currentColor.b);

      // Update cursor dot position and color
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
      dot.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;

      // Render Trail on Canvas
      ctx.clearRect(0, 0, width, height);

      // Update points
      for (let i = points.length - 1; i >= 0; i--) {
        const pt = points[i];
        pt.age++;
        pt.x += pt.vx;
        pt.y += pt.vy;
        if (pt.age >= pt.maxAge) {
          points.splice(i, 1);
        }
      }

      // Draw smooth fluid ribbon trail
      if (points.length > 2 && !isHidden) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];
          const life = 1 - p1.age / p1.maxAge;
          const alpha = Math.max(0, Math.min(1, life * 0.85));

          const pr = Math.round(p1.r);
          const pg = Math.round(p1.g);
          const pb = Math.round(p1.b);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);

          ctx.strokeStyle = `rgba(${pr}, ${pg}, ${pb}, ${alpha})`;
          ctx.lineWidth = Math.max(1, p1.size * life);
          ctx.shadowBlur = 10 * life;
          ctx.shadowColor = `rgba(${pr}, ${pg}, ${pb}, ${alpha * 0.7})`;
          ctx.stroke();
        }

        ctx.restore();
      }

      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* Fullscreen smooth fluid ribbon canvas mouse trail */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[99990] will-change-transform"
        style={{ width: '100vw', height: '100vh' }}
      />

      {/* Leading interactive custom cursor dot */}
      <div
        ref={dotRef}
        data-custom-cursor
        aria-hidden="true"
        className="hidden lg:block fixed top-0 left-0 z-[100000] pointer-events-none opacity-0 transition-opacity duration-200"
      >
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{
            background: '#0A1F44',
          }}
        />
      </div>
    </>
  );
}
