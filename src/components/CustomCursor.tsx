'use client';

import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
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
    if (!dot) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let targetX = x;
    let targetY = y;
    let scale = 1;
    let targetScale = 1;
    let raf = 0;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      dot.style.opacity = '1';
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const interactive = target?.closest(
        'a, button, [role="button"], input, textarea, select, label, .cursor-pointer'
      );
      targetScale = interactive ? 2.1 : 1;
    };

    const onMouseLeave = () => {
      dot.style.opacity = '0';
    };

    const loop = () => {
      x += (targetX - x) * 0.24;
      y += (targetY - y) * 0.24;
      scale += (targetScale - scale) * 0.16;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="hidden lg:block fixed top-0 left-0 z-[100000] pointer-events-none opacity-0 transition-opacity duration-200"
    >
      <div
        className="w-3.5 h-3.5 rounded-full border-0 border-none outline-none"
        style={{
          background: '#0A1F44',
          boxShadow: 'none',
          border: 'none',
          outline: 'none',
        }}
      />
    </div>
  );
}
