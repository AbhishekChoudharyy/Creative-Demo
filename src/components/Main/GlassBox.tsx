'use client';

import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Html } from '@react-three/drei';
import * as THREE from 'three';
import { soundManager } from '@/lib/sound';
import { generateFractureSystem } from './fractureGeometry';

export const GlassBox: FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches);
  }, []);

  const groupRef = useRef<THREE.Group>(null);
  const boxRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);
  const crackLinesRef = useRef<THREE.LineSegments>(null);
  const crackLineMatRef = useRef<THREE.LineBasicMaterial>(null);

  // Drag rotation state — starts tilted so the first frame matches the reference
  const isDragging = useRef(false);
  const previousPointerPosition = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0.22, y: 0.72 });
  const currentRotation = useRef({ x: 0.22, y: 0.72 });

  // Hover & Fracture Animation State
  const isHovered = useRef(false);
  const [isHoveredState, setIsHoveredState] = useState(false);
  const hoverTimer = useRef(0);
  const fractureProgress = useRef(0);
  const hasFracturedSoundPlayed = useRef(false);
  const hasReassembleSoundPlayed = useRef(false);
  const currentHoverPoint = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const targetHoverPoint = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));

  // Precomputed procedural 3D crystal fracture system
  const fractureSystem = useMemo(() => generateFractureSystem(), []);

  // Extruded beveled solid circular lens/disc (exact default state)
  const circleGeom = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches);
    const s = new THREE.Shape();
    s.absarc(0, 0, 1.15, 0, Math.PI * 2, false);

    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.10,
      bevelSize: 0.08,
      bevelSegments: isMobile ? 4 : 10,
      curveSegments: isMobile ? 32 : 64,
    });
    g.center();
    g.computeVertexNormals();
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
    lockScroll();
    isDragging.current = true;
    previousPointerPosition.current = { x: e.clientX, y: e.clientY };
    soundManager.startDrag();
    soundManager.playClick();
  };

  const updatePointerLocal = (e: any) => {
    if (!groupRef.current) return;
    const local = new THREE.Vector3();
    groupRef.current.worldToLocal(local.copy(e.point));
    targetHoverPoint.current.set(local.x, local.y);
  };

  const handlePointerEnter = (e: any) => {
    e.stopPropagation();
    if (isHovered.current) return;
    isHovered.current = true;
    setIsHoveredState(true);
    updatePointerLocal(e);
    currentHoverPoint.current.copy(targetHoverPoint.current);
    soundManager.playHeroHover();
  };

  const handlePointerMoveHit = (e: any) => {
    updatePointerLocal(e);
  };

  const handlePointerLeave = (e: any) => {
    e.stopPropagation();
    if (!isHovered.current) return;
    isHovered.current = false;
    setIsHoveredState(false);
    if (fractureProgress.current > 0.08) {
      soundManager.playCrystalRecede();
    }
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - previousPointerPosition.current.x;
      const deltaY = e.clientY - previousPointerPosition.current.y;

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

  useFrame((state, delta) => {
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
    // Anticlockwise tilt in the red-arrow direction (world Z), stays during drag
    group.rotation.z = 0.38;

    // ── ULTRA-FAST MAGNETIC GLASS FRACTURE & REWIND ANIMATION ──
    const dt = Math.min(delta, 0.05);

    if (isHovered.current) {
      // Explosive physical burst into fractured state
      fractureProgress.current += (1.0 - fractureProgress.current) * Math.min(1.0, dt * 12.0);
      if (fractureProgress.current > 0.98) {
        fractureProgress.current = 1.0;
      }
    } else {
      // Ultra-fast magnetic rewind back into unified crystal
      fractureProgress.current += (0.0 - fractureProgress.current) * Math.min(1.0, dt * 14.5);
      // Instant snap threshold: once within 8%, immediately snap shut to 0 so no broken lines linger!
      if (fractureProgress.current < 0.08) {
        fractureProgress.current = 0.0;
      }
    }

    const p = fractureProgress.current;

    // Smoothly track the localized hover point across the crystal face
    currentHoverPoint.current.lerp(targetHoverPoint.current, 0.22);

    // Position the interactive "HOLD AND DRAG" circular follower ring over the cursor
    if (ringRef.current) {
      ringRef.current.position.set(currentHoverPoint.current.x, currentHoverPoint.current.y, 0.28);
    }

    // Switch between intact circle geometry and 3D fractured shards geometry
    if (boxRef.current) {
      if (p <= 0.001) {
        if (boxRef.current.geometry !== circleGeom) {
          boxRef.current.geometry = circleGeom;
        }
        boxRef.current.position.set(0, 0, 0);
      } else {
        if (boxRef.current.geometry !== fractureSystem.mergedGeometry) {
          boxRef.current.geometry = fractureSystem.mergedGeometry;
        }
        // Always pass currentHoverPoint so shards rewind directly along the exact reverse trajectory
        fractureSystem.update(p, t, currentHoverPoint.current);
      }
    }

    // Instant physical crack seam flash right as the real crystal breaks open
    if (crackLinesRef.current && crackLineMatRef.current) {
      if (p > 0.005 && p < 0.45) {
        crackLinesRef.current.visible = true;
        const flashIntensity = Math.sin((p / 0.45) * Math.PI) * 0.75;
        crackLineMatRef.current.opacity = flashIntensity;
      } else {
        crackLinesRef.current.visible = false;
        crackLineMatRef.current.opacity = 0;
      }
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerDown={handlePointerDown}
    >
      {/* Invisible hit-test proxy mesh ensuring solid, flicker-free hover detection across the entire crystal volume */}
      <mesh
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMoveHit}
        onPointerLeave={handlePointerLeave}
        position={[0, 0, 0]}
      >
        <sphereGeometry args={[1.35, 32, 16]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* ── 3D BEVELED OPTICAL CRYSTAL GLASS DISC & FRACTURE SHARDS ──
          Both intact circle and 3D shards use this exact same MeshTransmissionMaterial,
          guaranteeing identical transparent optical glass with real refraction & dispersion! */}
      <mesh ref={boxRef}>
        <primitive object={circleGeom} attach="geometry" />
        <MeshTransmissionMaterial
          backside={!isMobile}
          transmission={1.0}
          roughness={0.0}
          thickness={0.22}
          ior={1.44}
          chromaticAberration={isMobile ? 0.015 : 0.03}
          anisotropy={0.0}
          distortion={0.0}
          distortionScale={0.0}
          temporalDistortion={0.0}
          clearcoat={1.0}
          clearcoatRoughness={0.0}
          color="#ffffff"
          attenuationColor="#e0f2fe"
          attenuationDistance={20.0}
          reflectivity={0.90}
          resolution={isMobile ? 384 : 768}
          samples={isMobile ? 4 : 8}
        />
      </mesh>

      {/* ── INTERACTIVE "HOLD AND DRAG" CURSOR FOLLOWER CIRCLE (Magnifying Glass Pop) ──
          Spawns tiny (scale 6%) and pops out with an elastic spring into an optical magnifying circle */}
      <group ref={ringRef} position={[0, 0, 0.28]}>
        <Html center style={{ pointerEvents: 'none' }}>
          <div
            style={{
              transition: isHoveredState
                ? 'transform 0.44s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.20s ease-out'
                : 'transform 0.22s ease-in, opacity 0.18s ease-in',
              transform: isHoveredState ? 'scale(1)' : 'scale(0.06)',
              opacity: isHoveredState ? 1 : 0,
            }}
            className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full border-[1.8px] border-white flex items-center justify-center select-none pointer-events-none shadow-[0_0_35px_rgba(255,255,255,0.25),inset_0_0_25px_rgba(255,255,255,0.12)] bg-gradient-to-tr from-white/[0.04] via-transparent to-white/[0.10] backdrop-blur-[0.5px]"
          >
            {/* Concentric inner optical reticle ring */}
            <div className="absolute inset-2 sm:inset-2.5 rounded-full border border-white/30 pointer-events-none" />

            {/* Precision optical tick marks at cardinal positions */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-2 sm:h-2.5 bg-white/80 pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-2 sm:h-2.5 bg-white/80 pointer-events-none" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-2 sm:w-2.5 bg-white/80 pointer-events-none" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-0.5 w-2 sm:w-2.5 bg-white/80 pointer-events-none" />

            {/* Subtle center optical crosshair hint */}
            <div className="absolute w-2 h-2 rounded-full border border-white/40 pointer-events-none" />

            {/* Magnifying Glass Center Callout */}
            <span className="relative z-10 text-[10.5px] sm:text-[11.5px] font-mono font-bold tracking-[0.24em] text-white uppercase text-center select-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] px-3">
              HOLD AND DRAG
            </span>
          </div>
        </Html>
      </group>

      {/* ── PRE-FRACTURE INTERNAL CRACK SEAMS (Brief illumination) ── */}
      <lineSegments ref={crackLinesRef} geometry={fractureSystem.crackLinesGeometry} visible={false}>
        <lineBasicMaterial
          ref={crackLineMatRef}
          color="#ffffff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
};
