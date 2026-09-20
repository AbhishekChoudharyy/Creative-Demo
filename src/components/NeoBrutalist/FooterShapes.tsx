'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, Preload } from '@react-three/drei';
import * as THREE from 'three';

/* ─────────────────────────────────────────────────────────────
   Footer Magnetic Shape Cluster
   - Reuses the exact 3 signature shapes from the Shapes section:
     Circle (ring) / Square (frame) / Triangle (frame)
   - Glossy black, clumped into a magnetic ball that bulges
     toward the cursor like a magnet — reference: KODE footer
────────────────────────────────────────────────────────────── */

function useShapeGeometries() {
  return useMemo(() => {
    const make = (shape: string) => {
      // Hollow Square / Rectangle Frame (same as Shapes section)
      if (shape === 'rectangle') {
        const s = new THREE.Shape();
        s.moveTo(-1.15, -1.15);
        s.lineTo(1.15, -1.15);
        s.lineTo(1.15, 1.15);
        s.lineTo(-1.15, 1.15);
        s.closePath();
        const hole = new THREE.Path();
        hole.moveTo(-0.92, -0.92);
        hole.lineTo(-0.92, 0.92);
        hole.lineTo(0.92, 0.92);
        hole.lineTo(0.92, -0.92);
        hole.closePath();
        s.holes.push(hole);
        const g = new THREE.ExtrudeGeometry(s, {
          depth: 0.22,
          bevelEnabled: true,
          bevelThickness: 0.05,
          bevelSize: 0.05,
          bevelSegments: 8,
        });
        g.center();
        g.computeVertexNormals();
        return g;
      }

      // Hollow Triangle Frame
      if (shape === 'triangle') {
        const s = new THREE.Shape();
        const R_out = 1.48;
        s.moveTo(0, R_out);
        s.lineTo(R_out * Math.cos(-Math.PI / 6), R_out * Math.sin(-Math.PI / 6));
        s.lineTo(R_out * Math.cos((7 * Math.PI) / 6), R_out * Math.sin((7 * Math.PI) / 6));
        s.closePath();
        const R_in = 0.98;
        const hole = new THREE.Path();
        hole.moveTo(0, R_in);
        hole.lineTo(R_in * Math.cos((7 * Math.PI) / 6), R_in * Math.sin((7 * Math.PI) / 6));
        hole.lineTo(R_in * Math.cos(-Math.PI / 6), R_in * Math.sin(-Math.PI / 6));
        hole.closePath();
        s.holes.push(hole);
        const g = new THREE.ExtrudeGeometry(s, {
          depth: 0.22,
          bevelEnabled: true,
          bevelThickness: 0.05,
          bevelSize: 0.05,
          bevelSegments: 8,
        });
        g.center();
        g.computeVertexNormals();
        return g;
      }

      // Hollow Circle / Ring Frame
      if (shape === 'circle') {
        const s = new THREE.Shape();
        s.absarc(0, 0, 1.25, 0, Math.PI * 2, false);
        const hole = new THREE.Path();
        hole.absarc(0, 0, 1.02, 0, Math.PI * 2, true);
        s.holes.push(hole);
        const g = new THREE.ExtrudeGeometry(s, {
          depth: 0.22,
          bevelEnabled: true,
          bevelThickness: 0.05,
          bevelSize: 0.05,
          bevelSegments: 10,
          curveSegments: 96,
        });
        g.center();
        g.computeVertexNormals();
        return g;
      }

      // Solid Donut (torus) — KODE-style 3D "O"
      if (shape === 'donut') {
        const g = new THREE.TorusGeometry(1.0, 0.52, 40, 96);
        g.computeVertexNormals();
        return g;
      }

      // Solid Plus / Cross — KODE-style 3D "+"
      const s = new THREE.Shape();
      const a = 0.42;
      const L = 1.35;
      s.moveTo(-a, -L);
      s.lineTo(a, -L);
      s.lineTo(a, -a);
      s.lineTo(L, -a);
      s.lineTo(L, a);
      s.lineTo(a, a);
      s.lineTo(a, L);
      s.lineTo(-a, L);
      s.lineTo(-a, a);
      s.lineTo(-L, a);
      s.lineTo(-L, -a);
      s.lineTo(-a, -a);
      s.closePath();
      const g = new THREE.ExtrudeGeometry(s, {
        depth: 0.42,
        bevelEnabled: true,
        bevelThickness: 0.12,
        bevelSize: 0.12,
        bevelSegments: 10,
      });
      g.center();
      g.computeVertexNormals();
      return g;
    };

    return {
      circle: make('circle'),
      rectangle: make('rectangle'),
      triangle: make('triangle'),
      donut: make('donut'),
      plus: make('plus'),
    } as Record<string, THREE.BufferGeometry>;
  }, []);
}

function Cluster({ count, isHovered = false }: { count: number; isHovered?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshesRef = useRef<Array<THREE.Mesh | null>>([]);
  const geometries = useShapeGeometries();
  const pointer = useThree((state) => state.pointer);
  const camera = useThree((state) => state.camera);
  const hoverStrength = useRef(0);
  const [inHover, setInHover] = useState(false);

  const items = useMemo(() => {
    // Only 3 signature Origo shapes: Circle, Triangle, Rectangle
    const shapes = ['circle', 'triangle', 'rectangle'];
    const arr: Array<{
      shape: string;
      base: THREE.Vector3;
      rot: THREE.Euler;
      scale: number;
      tumble: number;
      offset: THREE.Vector3;
      scatterVector: THREE.Vector3;
      glass: boolean;
    }> = [];
    for (let i = 0; i < count; i++) {
      // Clumped magnetic cluster centered behind typography
      const r = 0.52 + Math.random() * 0.85;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      // Controlled 3D scatter vector:
      // Upar repel na ho — only Left (-X), Right (+X), Downward (-Y) and Depth (Z)
      const dirAngle = Math.random() * Math.PI * 2;
      const speed = 0.95 + Math.random() * 0.85;
      // Downward only: Y is strictly negative (-Y), never upward (+Y)
      const yScatter = -(0.25 + Math.random() * 0.95) * speed;
      const scatterVector = new THREE.Vector3(
        Math.cos(dirAngle) * speed * 1.25, // Left & Right
        yScatter,                          // Strictly Downward (never up)
        Math.sin(dirAngle) * speed * 0.85  // Depth Z (front & back)
      );

      arr.push({
        shape: shapes[i % shapes.length],
        base: new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta) * 0.85,
          r * Math.cos(phi)
        ),
        rot: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ),
        scale: 0.36 + Math.random() * 0.28,
        tumble: 0.16 + Math.random() * 0.35,
        offset: new THREE.Vector3(),
        scatterVector,
        glass: false,
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
    group.rotation.y += delta * 0.09;
    group.rotation.x = Math.sin(t * 0.12) * 0.1;

    // Magnetic cursor target projected onto the cluster plane (z ≈ 0)
    tmpTarget.set(pointer.x, pointer.y, 0.5).unproject(camera);
    tmpDir.copy(tmpTarget).sub(camera.position).normalize();
    const planeDist = -camera.position.z / tmpDir.z;
    tmpTarget.copy(camera.position).add(tmpDir.multiplyScalar(planeDist));
    // Do not let magnetic pull drag shapes upwards beyond the upper footer boundary
    tmpTarget.y = Math.min(tmpTarget.y, 0.25);

    const dt = Math.min(delta, 0.05);

    // Hover = instant physical scatter in ONE go ("ek baar me bikhad jaye"):
    // Unhover = instant magnetic snap ("wapas magnet jese firse chipak jaye"):
    const activeHover = inHover || isHovered;
    if (activeHover) {
      // Explosive instant burst in 1 go
      hoverStrength.current += (1.0 - hoverStrength.current) * Math.min(1.0, dt * 13.5);
    } else {
      // Ultra-fast magnetic rewind back into unified knot
      hoverStrength.current += (0.0 - hoverStrength.current) * Math.min(1.0, dt * 15.5);
      if (hoverStrength.current < 0.01) hoverStrength.current = 0.0;
    }
    const scatter = hoverStrength.current;

    // Fast snappy damp for instant magnetic sticking
    const damp = activeHover ? (1 - Math.pow(0.00005, dt)) : (1 - Math.pow(0.00000001, dt));

    meshesRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const item = items[i];
      if (!item) return;

      // Base position rotated into current world orientation
      tmpWorld.copy(item.base).applyEuler(group.rotation);

      // Controlled 3D scatter outward (left, right, downward, depth)
      tmpWorld.addScaledVector(item.scatterVector, scatter * 1.3);

      // Prevent any upward drift during scatter: keep Y at or below initial rest Y
      if (scatter > 0.02 && tmpWorld.y > item.base.y + 0.05) {
        tmpWorld.y = item.base.y + 0.05;
      }

      // Magnetic pull: shapes near the cursor bulge toward it
      const dist = tmpWorld.distanceTo(tmpTarget);
      const pull = Math.max(0, 1 - dist / 3.5);

      tmpWorld.lerp(tmpTarget, pull * 0.22 * (1 - scatter * 0.7));

      item.offset.lerp(tmpWorld, damp);
      mesh.position.copy(item.offset);

      // Energetic tumbling and spinning during scatter
      mesh.rotation.x += delta * (item.tumble + scatter * 3.2);
      mesh.rotation.y += delta * (item.tumble * 0.7 + scatter * 2.8);
      mesh.rotation.z += delta * (scatter * 2.0);
    });
  });

  return (
    <group
      ref={groupRef}
      scale={1.05}
    >
      {/* Invisible plane over entire 3D space so any hover triggers instant scatter */}
      <mesh
        position={[0, 0, 0]}
        onPointerOver={() => setInHover(true)}
        onPointerOut={() => setInHover(false)}
      >
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {items.map((item, i) => (
        <mesh
          key={i}
          ref={el => {
            meshesRef.current[i] = el;
          }}
          geometry={geometries[item.shape]}
          position={item.base}
          rotation={item.rot}
          scale={item.scale}
        >
          <meshStandardMaterial
            color="#161c28"
            roughness={0.10}
            metalness={0.78}
            envMapIntensity={2.5}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function FooterShapes({ isHovered = false }: { isHovered?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
      {inView && (
        <Canvas
          frameloop="always"
          dpr={[1, 1.5]}
          gl={{ powerPreference: 'high-performance', antialias: true, alpha: true }}
          camera={{ fov: 40, position: [0.0, -0.15, 6.0] }}
          style={{ touchAction: 'pan-y' }}
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
            <Cluster count={isMobile ? 14 : 26} isHovered={isHovered} />
            <Preload all />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}

