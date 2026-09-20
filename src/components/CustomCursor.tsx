'use client';

import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Only show the custom dot cursor on precise (mouse/trackpad) pointers
    if (!window.matchMedia('(pointer: fine)').matches) return;
    setEnabled(true);
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
      className="fixed top-0 left-0 z-[100000] pointer-events-none opacity-0 transition-opacity duration-200"
    >
      <div
        className="w-3 h-3 rounded-full"
        style={{
          background: '#0A1F44',
          boxShadow: '0 0 0 1.5px rgba(255,255,255,0.9), 0 0 12px rgba(10,31,68,0.35)',
        }}
      />
    </div>
  );
}
