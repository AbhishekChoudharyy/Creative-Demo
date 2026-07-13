'use client';

import { FC, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';

import { DeviceOrientationButton } from '../DeviceOrientationButton';
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
          OG CUBE LOADING
        </span>
      </div>
    </Html>
  );
};

export const Main: FC = () => {
  return (
    <div className={styles.scene}>
      <DeviceOrientationButton />

      <Canvas
        dpr={[0.8, 3]}
        camera={{ fov: 60 }}
        style={{ touchAction: 'pan-y' }}
      >
        <Suspense fallback={<CanvasLoader />}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
};
