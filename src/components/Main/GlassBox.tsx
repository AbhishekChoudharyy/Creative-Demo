'use client';

import { FC, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { soundManager } from '@/lib/sound';

export const GlassBox: FC = () => {
  const { size } = useThree();
  const isMobile = size.width < 768;

  const groupRef = useRef<any>(null);
  const boxRef = useRef<any>(null);

  // Drag rotation state
  const isDragging = useRef(false);
  const previousPointerPosition = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });

  // Torus geometry for circular glass ring (optimized for mobile 60fps)
  const torusArgs: [number, number, number, number] = useMemo(
    () => (isMobile ? [0.96, 0.42, 32, 64] : [0.96, 0.42, 48, 96]),
    [isMobile]
  );



  const lockScroll = () => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.touchAction = 'none';
    document.body.style.touchAction = 'none';
  };

  const unlockScroll = () => {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.documentElement.style.touchAction = '';
    document.body.style.touchAction = '';
  };

  const handlePointerDown = (e: any) => {
    e.stopPropagation();

    // Freeze browser viewport scroll when dragging
    lockScroll();

    isDragging.current = true;
    previousPointerPosition.current = { x: e.clientX, y: e.clientY };
    soundManager.startDrag();
    soundManager.playClick();
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - previousPointerPosition.current.x;
      const deltaY = e.clientY - previousPointerPosition.current.y;

      // Rotate chevron based on drag delta
      targetRotation.current.y += deltaX * 0.065;
      targetRotation.current.x += deltaY * 0.065;
      targetRotation.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotation.current.x));

      previousPointerPosition.current = { x: e.clientX, y: e.clientY };

      const speed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      soundManager.updateDrag(speed);
    };

    const handlePointerUp = () => {
      if (isDragging.current) {
        soundManager.stopDrag();
        soundManager.playClick();
      }
      isDragging.current = false;

      // Restore default scrolling on release
      unlockScroll();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    window.addEventListener('blur', handlePointerUp);
    document.addEventListener('visibilitychange', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('blur', handlePointerUp);
      document.removeEventListener('visibilitychange', handlePointerUp);
      soundManager.stopDrag();
      unlockScroll();
    };
  }, []);

  // Block native touch scrolling while actively dragging 3D shape
  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      if (isDragging.current) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };
    window.addEventListener('touchmove', preventScroll, { passive: false });
    return () => {
      window.removeEventListener('touchmove', preventScroll);
    };
  }, []);



  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;
    const t = state.clock.getElapsedTime();

    // Smooth floating animation (gentle and serene)
    group.position.y = Math.sin(t * 1.0) * 0.03;

    // Smooth lerp to target dragging rotation
    currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.1;
    currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.1;

    group.rotation.x = currentRotation.current.x;
    group.rotation.y = currentRotation.current.y;
  });

  return (
    <group
      ref={groupRef}
      onPointerDown={handlePointerDown}
    >
      {/* 3D Polished Glass Torus Circle Ring */}
      <mesh ref={boxRef}>
        <torusGeometry args={torusArgs} />
        <MeshTransmissionMaterial
          backside
          transmission={1.0}
          roughness={0.045}
          thickness={isMobile ? 0.28 : 0.65}
          ior={1.42}
          chromaticAberration={isMobile ? 0.03 : 0.08}
          anisotropy={isMobile ? 0.1 : 0.5}
          distortion={isMobile ? 0.1 : 0.2}
          distortionScale={0.5}
          temporalDistortion={0.0}
          clearcoat={0.7}
          clearcoatRoughness={0.08}
          color="#f0f7ff"
          attenuationColor="#e0f2fe"
          attenuationDistance={3.5}
          reflectivity={0.8}
          resolution={isMobile ? 256 : 512}
          samples={isMobile ? 1 : 6}
        />
      </mesh>
    </group>
  );
};
