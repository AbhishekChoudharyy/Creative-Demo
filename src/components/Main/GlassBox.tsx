'use client';

import { FC, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { soundManager } from '@/lib/sound';

export const GlassBox: FC = () => {
  const groupRef = useRef<any>(null);
  const boxRef = useRef<any>(null);

  // Drag rotation state
  const isDragging = useRef(false);
  const previousPointerPosition = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });

  // Extruded beveled circle geometry matching the metal circle in the carousel
  const circleGeom = useMemo(() => {
    const s = new THREE.Shape();
    s.absarc(0, 0, 1.15, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, 0.70, 0, Math.PI * 2, true);
    s.holes.push(hole);

    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.28,
      bevelEnabled: true,
      bevelThickness: 0.07,
      bevelSize: 0.06,
      bevelSegments: 4,
      curveSegments: 64,
    });
    g.center();
    return g;
  }, []);

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
      {/* 3D Transparent Beveled Circle Ring matching the Carousel shape */}
      <mesh ref={boxRef}>
        <primitive object={circleGeom} attach="geometry" />
        <MeshTransmissionMaterial
          backside
          transmission={0.99}
          roughness={0.015}
          thickness={0.35}
          ior={1.48}
          chromaticAberration={0.08}
          anisotropy={0.15}
          distortion={0.08}
          distortionScale={0.3}
          temporalDistortion={0.0}
          clearcoat={1.0}
          clearcoatRoughness={0.01}
          color="#ffffff"
          attenuationColor="#ffffff"
          attenuationDistance={14.0}
          reflectivity={0.85}
          resolution={512}
          samples={6}
        />
      </mesh>
    </group>
  );
};
