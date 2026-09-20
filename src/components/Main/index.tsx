'use client';

import { FC, Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, Preload } from '@react-three/drei';

import { Scene } from './Scene';
import styles from './styles.module.css';

// Custom 3D HTML fallback loader
const CanvasLoader: FC = () => {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center gap-3 w-56 text-center select-none pointer-events-none">
        {/* Spinning loading indicator */}
        <div className="w-8 h-8 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
        
        {/* Pulsing load label */}
        <span className="text-[10px] font-mono text-[#a1a1aa] tracking-[0.2em] uppercase animate-pulse">
          ORIGO 3D LOADING
        </span>
      </div>
    </Html>
  );
};

export const Main: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [dpr, setDpr] = useState<[number, number]>([1, 1.5]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches;
    setDpr(isMobile ? [1, 1.25] : [1, 1.8]);

    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={styles.scene}>
      <Canvas
        frameloop={isVisible ? 'always' : 'never'}
        dpr={dpr}
        gl={{ powerPreference: 'high-performance', antialias: true, alpha: true }}
        camera={{ fov: 60 }}
        style={{ touchAction: 'pan-y' }}
      >
        <Suspense fallback={<CanvasLoader />}>
          <Scene />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
};
