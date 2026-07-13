import { useEffect, useRef } from 'react';

import { Vector2 } from 'three';
import { addEventListener, scoped, vevet } from 'vevet';

export function useMouseMoveDelta(onUpdateProp: (delta: Vector2) => void) {
  const prevMouseRef = useRef<Vector2>(new Vector2(NaN, NaN));

  useEffect(() => {
    // Skip cursor movement tracking on mobile viewports
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return undefined;
    }

    const handleMouseMove = addEventListener(window, 'mousemove', (evt) => {
      const prev = prevMouseRef.current;

      const x = scoped(evt.clientX, vevet.width / 2, vevet.width);
      const y = scoped(evt.clientY, vevet.height / 2, vevet.height);

      if (Number.isNaN(prev.x) || Number.isNaN(prev.y)) {
        prev.x = x;
        prev.y = y;
      }

      const dx = x - prev.x;
      const dy = y - prev.y;

      prev.x = x;
      prev.y = y;

      onUpdateProp(new Vector2(dx, dy));
    });

    const handleTouchStart = () => {
      prevMouseRef.current.set(NaN, NaN);
    };

    const handleTouchMove = (evt: TouchEvent) => {
      if (evt.touches.length === 0) return;
      const touch = evt.touches[0];
      const prev = prevMouseRef.current;

      const x = scoped(touch.clientX, vevet.width / 2, vevet.width);
      const y = scoped(touch.clientY, vevet.height / 2, vevet.height);

      if (Number.isNaN(prev.x) || Number.isNaN(prev.y)) {
        prev.x = x;
        prev.y = y;
      }

      const dx = x - prev.x;
      const dy = y - prev.y;

      prev.x = x;
      prev.y = y;

      onUpdateProp(new Vector2(dx, dy));
    };

    const handleTouchEnd = () => {
      prevMouseRef.current.set(NaN, NaN);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      handleMouseMove();
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onUpdateProp]);
}
