'use client';

import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Html } from '@react-three/drei';
import * as THREE from 'three';
import { soundManager } from '@/lib/sound';
import { generateFractureSystem, smoothGeometryNormals } from './fractureGeometry';

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
  const targetRotation = useRef({ x: -0.70, y: 1 });
  const currentRotation = useRef({ x: -0.70, y: 1 });

  // Hover & Fracture Animation State
  const isHovered = useRef(false);
  const [isHoveredState, setIsHoveredState] = useState(false);
  const hoverTimer = useRef(0);
  const fractureProgress = useRef(0);
  const progressVelocity = useRef(0);
  const hasFracturedSoundPlayed = useRef(false);
  const hasReassembleSoundPlayed = useRef(false);
  const currentHoverPoint = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const targetHoverPoint = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));

  // Precomputed procedural 3D crystal fracture system
  const fractureSystem = useMemo(() => generateFractureSystem(), []);

  // Extruded beveled hollow circular ring (refined hollow proportions & silky curve resolution)
  const circleGeom = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches);
    const s = new THREE.Shape();
    s.absarc(0, 0, 1.15, 0, Math.PI * 2, false);

    // Refined concentric inner circular hole (slightly smaller hollow aperture)
    const hole = new THREE.Path();
    hole.absarc(0, 0, 0.62, 0, Math.PI * 2, true);
    s.holes.push(hole);

    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.40,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.06,
      bevelSegments: isMobile ? 8 : 16,
      curveSegments: isMobile ? 64 : 128,
    });
    g.center();
    g.computeVertexNormals();
    smoothGeometryNormals(g);
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
    if (typeof document !== 'undefined') {
      document.body.classList.add('hide-cursor-for-3d');
    }
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
    if (!isDragging.current && typeof document !== 'undefined') {
      document.body.classList.remove('hide-cursor-for-3d');
    }
  };

  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('hide-cursor-for-3d');
      }
    };
  }, []);

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
      if (!isHovered.current && typeof document !== 'undefined') {
        document.body.classList.remove('hide-cursor-for-3d');
      }
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
      if (typeof document !== 'undefined') {
        document.body.classList.remove('hide-cursor-for-3d');
      }
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
    group.rotation.z = 0.10;

    // ── BUTTERY-SMOOTH PROCEDURAL GLASS FRACTURE & MAGNETIC REWIND ──
    const dt = Math.min(delta, 0.033);
    const targetP = isHovered.current ? 1.0 : 0.0;
    const springK = isHovered.current ? 88.0 : 96.0;
    const damping = isHovered.current ? 12.8 : 14.0;
    const force = (targetP - fractureProgress.current) * springK;
    progressVelocity.current += (force - progressVelocity.current * damping) * dt;
    fractureProgress.current += progressVelocity.current * dt;

    if (fractureProgress.current < 0.0008) {
      fractureProgress.current = 0.0;
      progressVelocity.current = 0.0;
    } else if (fractureProgress.current > 0.9992) {
      fractureProgress.current = 1.0;
      progressVelocity.current = 0.0;
    }

    const p = fractureProgress.current;

    // Smoothly track the localized hover point across the crystal face with buttery liquid inertia
    currentHoverPoint.current.lerp(targetHoverPoint.current, 0.12);

    // Position the interactive "HOLD AND DRAG" circular follower ring over the cursor
    if (ringRef.current) {
      ringRef.current.position.set(currentHoverPoint.current.x, currentHoverPoint.current.y, 0.28);
    }

    // Switch between intact circle geometry and 3D fractured shards geometry
    if (boxRef.current) {
      if (p <= 0.0008) {
        if (boxRef.current.geometry !== circleGeom) {
          boxRef.current.geometry = circleGeom;
        }
        boxRef.current.position.set(0, 0, 0);
      } else {
        if (boxRef.current.geometry !== fractureSystem.mergedGeometry) {
          boxRef.current.geometry = fractureSystem.mergedGeometry;
        }
        // Pass currentHoverPoint and dt for organic wave delay and smooth per-shard physics
        fractureSystem.update(p, t, currentHoverPoint.current, dt);
      }
    }

    // Pure crystal aesthetic: suppress harsh wireframe flash for a clean, luxury look
    if (crackLinesRef.current) {
      crackLinesRef.current.visible = false;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerDown={handlePointerDown}
    >
      {/* Invisible hit-test proxy mesh ensuring smooth, flicker-free hover detection across the entire circle INCLUDING hollow center */}
      <mesh
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMoveHit}
        onPointerLeave={handlePointerLeave}
        position={[0, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[1.28, 1.28, 0.45, 48]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* ── 3D BEVELED OPTICAL CRYSTAL GLASS DISC & FRACTURE SHARDS ──
          Both intact circle and 3D shards use this exact same MeshTransmissionMaterial,
          guaranteeing identical transparent optical glass with real refraction & dispersion! */}
      <mesh ref={boxRef}>
        <primitive object={circleGeom} attach="geometry" />
        <MeshTransmissionMaterial
          backside={false}
          transmission={1.0}
          roughness={0.0}
          thickness={0.35}
          ior={1.42}
          chromaticAberration={isMobile ? 0.01 : 0.02}
          anisotropy={0.0}
          distortion={0.0}
          distortionScale={0.0}
          temporalDistortion={0.0}
          clearcoat={1.0}
          clearcoatRoughness={0.0}
          color="#ffffff"
          attenuationColor="#ffffff"
          attenuationDistance={100.0}
          reflectivity={0.65}
          resolution={isMobile ? 512 : 1024}
          samples={isMobile ? 3 : 6}
        />
      </mesh>

      {/* ── INTERACTIVE "HOLD AND DRAG" CURSOR FOLLOWER CIRCLE (Magnifying Glass Pop) ──
          Animates from zero size (scale 0) up to full size (scale 1) with buttery spring inertia */}
      <group ref={ringRef} position={[0, 0, 0.28]}>
        <Html center style={{ pointerEvents: 'none' }}>
          <div
            style={{
              transformOrigin: 'center center',
              transition: isHoveredState
                ? 'transform 0.48s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.28s ease-out, filter 0.28s ease-out'
                : 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s ease-in, filter 0.22s ease-in',
              transform: isHoveredState ? 'scale(1)' : 'scale(0)',
              opacity: isHoveredState ? 1 : 0,
              filter: isHoveredState ? 'blur(0px)' : 'blur(6px)',
            }}
            className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full border-[1.8px] border-white flex items-center justify-center select-none pointer-events-none shadow-[0_0_35px_rgba(255,255,255,0.25),inset_0_0_25px_rgba(255,255,255,0.12)] bg-gradient-to-tr from-white/[0.04] via-transparent to-white/[0.10]"
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
