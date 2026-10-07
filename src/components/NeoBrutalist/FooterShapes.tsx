'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, Preload } from '@react-three/drei';
import * as THREE from 'three';
import { soundManager } from '@/lib/sound';

/* ─────────────────────────────────────────────────────────────
   Footer Magnetic Shape Cluster
   - Sleek Volumetric 3D shapes (Rectangle, Triangle, Circle) with
     refined thickness, rounded corners, and crisp bevels.
   - Dynamic size hierarchy: mix of large hero pieces, medium bodies,
     and small floating accent shapes.
   - 360° Organic dispersion: elements freely scatter in ALL directions
     (upward +Y, downward -Y, left, right, and depth).
   - Sticky magnetic cluster by default (stays tightly clumped like on mobile);
     scatters outward ONLY when cursor specifically hovers directly over the shapes.
────────────────────────────────────────────────────────────── */

function useShapeGeometries() {
  return useMemo(() => {
    const make = (shape: string) => {
      // 1. Hollow Square / Rectangle Frame with rounded corners & sleek thickness
      if (shape === 'rectangle') {
        const w_out = 1.15;
        const h_out = 1.15;
        const r_out = 0.14;

        const s = new THREE.Shape();
        s.moveTo(-w_out + r_out, -h_out);
        s.lineTo(w_out - r_out, -h_out);
        s.quadraticCurveTo(w_out, -h_out, w_out, -h_out + r_out);
        s.lineTo(w_out, h_out - r_out);
        s.quadraticCurveTo(w_out, h_out, w_out - r_out, h_out);
        s.lineTo(-w_out + r_out, h_out);
        s.quadraticCurveTo(-w_out, h_out, -w_out, h_out - r_out);
        s.lineTo(-w_out, -h_out + r_out);
        s.quadraticCurveTo(-w_out, -h_out, -w_out + r_out, -h_out);
        s.closePath();

        const w_in = 0.64;
        const h_in = 0.64;
        const r_in = 0.08;
        const hole = new THREE.Path();
        hole.moveTo(-w_in + r_in, -h_in);
        hole.quadraticCurveTo(-w_in, -h_in, -w_in, -h_in + r_in);
        hole.lineTo(-w_in, h_in - r_in);
        hole.quadraticCurveTo(-w_in, h_in, -w_in + r_in, h_in);
        hole.lineTo(w_in - r_in, h_in);
        hole.quadraticCurveTo(w_in, h_in, w_in, h_in - r_in);
        hole.lineTo(w_in, -h_in + r_in);
        hole.quadraticCurveTo(w_in, -h_in, w_in - r_in, -h_in);
        hole.closePath();
        s.holes.push(hole);

        const g = new THREE.ExtrudeGeometry(s, {
          depth: 0.38,
          bevelEnabled: true,
          bevelThickness: 0.07,
          bevelSize: 0.06,
          bevelSegments: 12,
          curveSegments: 28,
        });
        g.center();
        g.computeVertexNormals();
        return g;
      }

      // 2. Hollow Triangle Frame with rounded corners & sleek thickness
      if (shape === 'triangle') {
        const R_out = 1.62;
        const cr_out = 0.20;
        const cornersOut = [
          new THREE.Vector2(0, R_out),
          new THREE.Vector2(R_out * Math.cos(-Math.PI / 6), R_out * Math.sin(-Math.PI / 6)),
          new THREE.Vector2(R_out * Math.cos((7 * Math.PI) / 6), R_out * Math.sin((7 * Math.PI) / 6)),
        ];

        const s = new THREE.Shape();
        for (let i = 0; i < 3; i++) {
          const curr = cornersOut[i];
          const next = cornersOut[(i + 1) % 3];
          const prev = cornersOut[(i + 2) % 3];
          const dirFromPrev = new THREE.Vector2().subVectors(curr, prev).normalize();
          const dirToNext = new THREE.Vector2().subVectors(next, curr).normalize();
          const pStart = new THREE.Vector2().copy(curr).addScaledVector(dirFromPrev, -cr_out);
          const pEnd = new THREE.Vector2().copy(curr).addScaledVector(dirToNext, cr_out);

          if (i === 0) {
            s.moveTo(pEnd.x, pEnd.y);
          } else {
            s.lineTo(pStart.x, pStart.y);
            s.quadraticCurveTo(curr.x, curr.y, pEnd.x, pEnd.y);
          }
        }
        const c0 = cornersOut[0];
        const pStart0 = new THREE.Vector2()
          .copy(c0)
          .addScaledVector(new THREE.Vector2().subVectors(c0, cornersOut[2]).normalize(), -cr_out);
        const pEnd0 = new THREE.Vector2()
          .copy(c0)
          .addScaledVector(new THREE.Vector2().subVectors(cornersOut[1], c0).normalize(), cr_out);
        s.lineTo(pStart0.x, pStart0.y);
        s.quadraticCurveTo(c0.x, c0.y, pEnd0.x, pEnd0.y);
        s.closePath();

        const R_in = 0.98;
        const cr_in = 0.11;
        const cornersIn = [
          new THREE.Vector2(0, R_in),
          new THREE.Vector2(R_in * Math.cos((7 * Math.PI) / 6), R_in * Math.sin((7 * Math.PI) / 6)),
          new THREE.Vector2(R_in * Math.cos(-Math.PI / 6), R_in * Math.sin(-Math.PI / 6)),
        ];

        const hole = new THREE.Path();
        for (let i = 0; i < 3; i++) {
          const curr = cornersIn[i];
          const next = cornersIn[(i + 1) % 3];
          const prev = cornersIn[(i + 2) % 3];
          const dirFromPrev = new THREE.Vector2().subVectors(curr, prev).normalize();
          const dirToNext = new THREE.Vector2().subVectors(next, curr).normalize();
          const pStart = new THREE.Vector2().copy(curr).addScaledVector(dirFromPrev, -cr_in);
          const pEnd = new THREE.Vector2().copy(curr).addScaledVector(dirToNext, cr_in);

          if (i === 0) {
            hole.moveTo(pEnd.x, pEnd.y);
          } else {
            hole.lineTo(pStart.x, pStart.y);
            hole.quadraticCurveTo(curr.x, curr.y, pEnd.x, pEnd.y);
          }
        }
        const h0 = cornersIn[0];
        const hpStart0 = new THREE.Vector2()
          .copy(h0)
          .addScaledVector(new THREE.Vector2().subVectors(h0, cornersIn[2]).normalize(), -cr_in);
        const hpEnd0 = new THREE.Vector2()
          .copy(h0)
          .addScaledVector(new THREE.Vector2().subVectors(cornersIn[1], h0).normalize(), cr_in);
        hole.lineTo(hpStart0.x, hpStart0.y);
        hole.quadraticCurveTo(h0.x, h0.y, hpEnd0.x, hpEnd0.y);
        hole.closePath();
        s.holes.push(hole);

        const g = new THREE.ExtrudeGeometry(s, {
          depth: 0.38,
          bevelEnabled: true,
          bevelThickness: 0.07,
          bevelSize: 0.06,
          bevelSegments: 12,
          curveSegments: 28,
        });
        g.center();
        g.computeVertexNormals();
        return g;
      }

      // 3. Hollow Circle / Ring with sleek volumetric profile
      const s = new THREE.Shape();
      s.absarc(0, 0, 1.28, 0, Math.PI * 2, false);
      const hole = new THREE.Path();
      hole.absarc(0, 0, 0.82, 0, Math.PI * 2, true);
      s.holes.push(hole);
      const g = new THREE.ExtrudeGeometry(s, {
        depth: 0.38,
        bevelEnabled: true,
        bevelThickness: 0.07,
        bevelSize: 0.06,
        bevelSegments: 12,
        curveSegments: 112,
      });
      g.center();
      g.computeVertexNormals();
      return g;
    };

    return {
      circle: make('circle'),
      rectangle: make('rectangle'),
      triangle: make('triangle'),
    } as Record<string, THREE.BufferGeometry>;
  }, []);
}

function Cluster({ count, isMobile }: { count: number; isMobile: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshesRef = useRef<Array<THREE.Mesh | null>>([]);
  const geometries = useShapeGeometries();
  const pointer = useThree((state) => state.pointer);
  const camera = useThree((state) => state.camera);
  const hoverStrength = useRef(0);
  const hoveredCount = useRef(0);
  const isDirectHoverRef = useRef(false);
  const isTappedRef = useRef(false);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTap = (e?: any) => {
    if (!isMobile) return;
    if (e && e.stopPropagation) e.stopPropagation();
    soundManager.playClick();
    isTappedRef.current = !isTappedRef.current;

    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    if (isTappedRef.current) {
      // Auto-return to tight knot after 3.2s
      tapTimeoutRef.current = setTimeout(() => {
        isTappedRef.current = false;
      }, 3200);
    }
  };

  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    };
  }, []);

  const items = useMemo(() => {
    const shapes = ['circle', 'triangle', 'rectangle'];
    const arr: Array<{
      shape: string;
      base: THREE.Vector3;
      rot: THREE.Euler;
      scale: number;
      tumble: number;
      offset: THREE.Vector3;
      scatterVector: THREE.Vector3;
    }> = [];

    // 3D Infinity / Lemniscate Ribbon Formation:
    // Vertical figure-8 with crossing in center (bich) and lobes up/down (upar/niche)
    const H = 1.35; // Vertical half-span (top & bottom lobes)
    const W = 1.25; // Horizontal width of lobes
    const D = 0.52; // Depth separation at the crossover waist

    for (let i = 0; i < count; i++) {
      // Evenly distributed along the infinity curve with slight natural jitter
      const u = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * ((Math.PI * 2) / count) * 0.45;

      // Spine curve of the 3D Infinity (Figure-8 / Lemniscate):
      // - At u = 0, PI: center waist (bich) -> x = 0, y = 0, z = +-D
      // - At u = PI/2: top apex (upar) -> x = 0, y = +H, z = 0
      // - At u = 3*PI/2: bottom apex (niche) -> x = 0, y = -H, z = 0
      const spineX = W * Math.sin(2 * u);
      const spineY = H * Math.sin(u);
      const spineZ = D * Math.cos(u);
      const spine = new THREE.Vector3(spineX, spineY, spineZ);

      // Distance from center along Y: e in [0, 1]
      // e ~ 0 at center (bich); e ~ 1 at top/bottom (upar & niche)
      const e = Math.abs(Math.sin(u));

      // Size Hierarchy: "chote bich, bade upar niche"
      // Center (bich): compact small satellites & accent shapes (~0.16 - 0.22)
      // Apexes (upar/niche): hero large volumetric shapes (~0.48 - 0.56)
      const scaleMin = 0.17;
      const scaleMax = 0.52;
      const scale = scaleMin + (scaleMax - scaleMin) * Math.pow(e, 1.25) + (Math.random() - 0.5) * 0.05;

      // Organic volumetric ribbon thickness around the spine:
      // Tighter tube at the waist (bich), slightly more spread in the outer lobes
      const jitterRadius = 0.10 + 0.22 * Math.pow(e, 0.7);
      const jitterAngle = Math.random() * Math.PI * 2;
      const jitterDepth = (Math.random() - 0.5) * 0.35;
      const baseX = spineX + Math.cos(jitterAngle) * jitterRadius;
      const baseY = spineY + Math.sin(jitterAngle) * jitterRadius;
      const baseZ = spineZ + jitterDepth;

      // 360° Organic 3D scatter vector:
      // Outward burst along spine normal + 3D radial dispersion
      const spineNormal = spine.length() > 0.05 ? spine.clone().normalize() : new THREE.Vector3(0, 1, 0);
      const randomScatter = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ).normalize();
      const speed = 1.1 + Math.random() * 0.9;
      const scatterVector = spineNormal
        .clone()
        .multiplyScalar(1.3)
        .add(randomScatter.multiplyScalar(0.7))
        .normalize()
        .multiplyScalar(speed * 1.35);

      arr.push({
        shape: shapes[i % shapes.length],
        base: new THREE.Vector3(baseX, baseY, baseZ),
        rot: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ),
        scale,
        tumble: 0.15 + Math.random() * 0.35,
        offset: new THREE.Vector3(),
        scatterVector,
      });
    }
    return arr;
  }, [count]);

  const tmpWorld = useMemo(() => new THREE.Vector3(), []);
  const tmpTarget = useMemo(() => new THREE.Vector3(), []);
  const tmpDir = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const group = groupRef.current;
    if (!group) return;

    // Slow cinematic tumble of the whole cluster
    group.rotation.y += delta * 0.08;
    group.rotation.x = Math.sin(t * 0.12) * 0.09;

    // Magnetic cursor target projected onto the cluster plane (z ≈ 0)
    tmpTarget.set(pointer.x, pointer.y, 0.5).unproject(camera);
    tmpDir.copy(tmpTarget).sub(camera.position).normalize();
    const planeDist = -camera.position.z / tmpDir.z;
    tmpTarget.copy(camera.position).add(tmpDir.multiplyScalar(planeDist));

    // Distance from cursor to the cluster center in world coordinates
    const cursorDist = Math.hypot(tmpTarget.x, tmpTarget.y);

    if (isMobile) {
      // On mobile: triggered exclusively by tap/touch burst
      isDirectHoverRef.current = isTappedRef.current;
    } else {
      // TARGETED HOVER (Desktop): Only scatter if cursor is directly over the cluster shapes
      // Otherwise stay clumped and stuck together ("pass chipak jynge jese mobile me hai")
      if (cursorDist < 1.55 || hoveredCount.current > 0) {
        isDirectHoverRef.current = true;
      } else if (cursorDist > 2.15 && hoveredCount.current === 0) {
        isDirectHoverRef.current = false;
      }
    }

    const dt = Math.min(delta, 0.05);

    if (isDirectHoverRef.current) {
      // Scatter dynamically away from cursor / center
      hoverStrength.current += (1.0 - hoverStrength.current) * Math.min(1.0, dt * 11.5);
    } else {
      // Fast magnetic snap back into tight knot
      hoverStrength.current += (0.0 - hoverStrength.current) * Math.min(1.0, dt * 14.0);
      if (hoverStrength.current < 0.01) hoverStrength.current = 0.0;
    }
    const scatter = hoverStrength.current;

    const damp = isDirectHoverRef.current ? (1 - Math.pow(0.00005, dt)) : (1 - Math.pow(0.00000001, dt));

    meshesRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const item = items[i];
      if (!item) return;

      tmpWorld.copy(item.base).applyEuler(group.rotation);
      tmpWorld.addScaledVector(item.scatterVector, scatter * 1.4);

      // Magnetic bulge when hovering (desktop only)
      if (!isMobile) {
        const dist = tmpWorld.distanceTo(tmpTarget);
        const pull = Math.max(0, 1 - dist / 3.4);
        tmpWorld.lerp(tmpTarget, pull * 0.22 * (1 - scatter * 0.7));
      }

      item.offset.lerp(tmpWorld, damp);
      mesh.position.copy(item.offset);

      mesh.rotation.x += delta * (item.tumble + scatter * 3.2);
      mesh.rotation.y += delta * (item.tumble * 0.7 + scatter * 2.8);
      mesh.rotation.z += delta * (scatter * 2.0);
    });
  });

  return (
    <group
      ref={groupRef}
      scale={isMobile ? 0.74 : 1.05}
      onPointerDown={(e) => {
        if (isMobile) handleTap(e);
      }}
    >
      {items.map((item, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshesRef.current[i] = el;
          }}
          geometry={geometries[item.shape]}
          position={item.base}
          rotation={item.rot}
          scale={item.scale}
          onPointerDown={(e) => {
            if (isMobile) handleTap(e);
          }}
          onPointerOver={(e) => {
            if (isMobile) return;
            e.stopPropagation();
            hoveredCount.current++;
          }}
          onPointerOut={(e) => {
            if (isMobile) return;
            e.stopPropagation();
            hoveredCount.current = Math.max(0, hoveredCount.current - 1);
          }}
        >
          <meshStandardMaterial
            color="#141923"
            roughness={0.07}
            metalness={0.86}
            envMapIntensity={2.8}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function FooterShapes() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return () => window.removeEventListener('resize', checkMobile);
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0 z-0 pointer-events-auto" aria-hidden="true">
      {inView && (
        <Canvas
          frameloop="always"
          dpr={[1, 1.5]}
          gl={{ powerPreference: 'high-performance', antialias: true, alpha: true }}
          camera={{ fov: 40, position: [0.0, 0.0, 6.2] }}
          style={{ touchAction: 'pan-y', pointerEvents: 'auto' }}
        >
          <ambientLight intensity={0.85} color="#dbeafe" />
          <directionalLight position={[3, 5, 4]} intensity={2.6} color="#ffffff" />
          <directionalLight position={[-4, -2, 3]} intensity={1.5} color="#93c5fd" />
          <Suspense fallback={null}>
            <Environment resolution={256}>
              <Lightformer form="rect" intensity={4.2} position={[0, 3.5, 2]} scale={[7, 0.7, 1]} color="#ffffff" />
              <Lightformer form="rect" intensity={2.8} position={[0, -3.5, 2]} scale={[6, 0.6, 1]} color="#dbeafe" />
              <Lightformer form="rect" intensity={2.4} position={[-4, 0, 2]} scale={[0.8, 6, 1]} color="#93c5fd" />
              <Lightformer form="rect" intensity={2.4} position={[4, 0, 2]} scale={[0.8, 6, 1]} color="#ffffff" />
              <Lightformer form="circle" intensity={1.8} position={[0, 0, -4]} scale={7} color="#60a5fa" />
            </Environment>
            <Cluster count={isMobile ? 18 : 28} isMobile={isMobile} />
            <Preload all />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
