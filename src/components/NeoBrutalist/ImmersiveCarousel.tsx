'use client';

import React, {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, Preload } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { soundManager } from '@/lib/sound';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────
   Origo Story Data — Preserved exactly as originally structured:
   - 01: Circle
   - 02: Square
   - 03: Triangle
───────────────────────────────────────────────────────────── */
const SLIDES = [
  {
    index: '01',
    numLabel: 'STAGE 01 // SINGULARITY',
    title: '○ CIRCLE',
    subtitle: 'Eternal. Whole. Continuous.',
    shape: 'circle',
    story:
      'Represents motion, wholeness, unity and the continuous flow of ideas. The circle is the unbroken loop of thought — the singular origin where every creative idea begins.',
    meta: 'GEOMETRY: CIRCLE // ETERNAL FLOW',
    role: 'THE ORIGIN OF UNITY & FLOW',
  },
  {
    index: '02',
    numLabel: 'STAGE 02 // DIMENSION',
    title: '□ SQUARE',
    subtitle: 'Stability. Structure. Foundation.',
    shape: 'rectangle',
    story:
      'Represents order, reliability, structure and the foundation that holds everything together. The square establishes spatial presence and structural discipline.',
    meta: 'GEOMETRY: QUAD // STRUCTURAL MATRIX',
    role: 'THE ORIGIN OF SPATIAL STRUCTURE',
  },
  {
    index: '03',
    numLabel: 'STAGE 03 // ELEVATION',
    title: '△ TRIANGLE',
    subtitle: 'Direction. Balance. Transformation.',
    shape: 'triangle',
    story:
      'Represents purpose, progress, balance, strength and the drive to evolve. The dynamic apex elevates foundational concepts into enduring, impactful experiences.',
    meta: 'GEOMETRY: DELTA // TRANSFORMATION',
    role: 'THE ORIGIN OF PURPOSE & PROGRESS',
  },
];

/* ─────────────────────────────────────────────────────────────
   Straightforward 3D Shapes: Circle, Triangle & Rectangle (Extruded Frames with Bevel)
───────────────────────────────────────────────────────────── */
function ShapeMesh({ shape }: { shape: string }) {
  const geom = useMemo(() => {
    // 1. Solid Rectangle / Square Plate with Bevel
    if (shape === 'rectangle') {
      const s = new THREE.Shape();
      const w = 1.05;
      const h = 1.05;
      s.moveTo(-w, -h);
      s.lineTo(w, -h);
      s.lineTo(w, h);
      s.lineTo(-w, h);
      s.closePath();

      const g = new THREE.ExtrudeGeometry(s, {
        depth: 0.28,
        bevelEnabled: true,
        bevelThickness: 0.08,
        bevelSize: 0.07,
        bevelSegments: 8,
      });
      g.center();
      g.computeVertexNormals();
      return g;
    }

    // 2. Solid Triangle Prism with Bevel
    if (shape === 'triangle') {
      const s = new THREE.Shape();
      const R_out = 1.42;
      s.moveTo(0, R_out);
      s.lineTo(R_out * Math.cos(-Math.PI / 6), R_out * Math.sin(-Math.PI / 6));
      s.lineTo(R_out * Math.cos(7 * Math.PI / 6), R_out * Math.sin(7 * Math.PI / 6));
      s.closePath();

      const g = new THREE.ExtrudeGeometry(s, {
        depth: 0.28,
        bevelEnabled: true,
        bevelThickness: 0.08,
        bevelSize: 0.07,
        bevelSegments: 8,
      });
      g.center();
      g.computeVertexNormals();
      return g;
    }

    // 3. Solid Circle Disc with Bevel
    const s = new THREE.Shape();
    s.absarc(0, 0, 1.15, 0, Math.PI * 2, false);

    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.28,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.07,
      bevelSegments: 16,
      curveSegments: 96,
    });
    g.center();
    g.computeVertexNormals();
    return g;
  }, [shape]);

  return <primitive object={geom} attach="geometry" />;
}

/* ─────────────────────────────────────────────────────────────
   Interactive Chrome Metal 3D Model
   Pure, unobstructed in the center, freely rotatable with physics
───────────────────────────────────────────────────────────── */
interface ShapeProps {
  slideIndex: number;
  onFirstDrag: () => void;
}

function MetalHeroObject({ slideIndex, onFirstDrag }: ShapeProps) {
  const { size } = useThree();
  const isMobile = size.width < 768;

  const groupRef = useRef<THREE.Group>(null!);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const prevPtr = useRef({ x: 0, y: 0 });
  const targetRot = useRef({ x: 0.08, y: -0.2 });
  const currentRot = useRef({ x: 0.08, y: -0.2 });

  useEffect(() => {
    if (slideIndex === 0) {
      targetRot.current = { x: 0.05, y: -0.15 };
    } else if (slideIndex === 1) {
      targetRot.current = { x: 0.16, y: 0.25 };
    } else {
      targetRot.current = { x: -0.12, y: 0.32 };
    }
  }, [slideIndex]);

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

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - prevPtr.current.x;
      const dy = e.clientY - prevPtr.current.y;
      targetRot.current.y += dx * 0.055;
      targetRot.current.x += dy * 0.055;
      targetRot.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, targetRot.current.x));
      prevPtr.current = { x: e.clientX, y: e.clientY };
      soundManager.updateDrag(Math.sqrt(dx * dx + dy * dy));
    };

    const onUp = () => {
      if (isDragging.current) {
        soundManager.stopDrag();
        soundManager.playClick();
      }
      isDragging.current = false;
      unlockScroll();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    window.addEventListener('blur', onUp);
    document.addEventListener('visibilitychange', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      window.removeEventListener('blur', onUp);
      document.removeEventListener('visibilitychange', onUp);
      soundManager.stopDrag();
      unlockScroll();
    };
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Position lowered on mobile so it sits cleanly between the top story and bottom controls
    const baseY = isMobile ? -0.26 : 0;
    groupRef.current.position.y = baseY + Math.sin(t * 1.0) * 0.035;

    // Smooth inertia interpolation
    currentRot.current.x += (targetRot.current.x - currentRot.current.x) * 0.08;
    currentRot.current.y += (targetRot.current.y - currentRot.current.y) * 0.08;
    groupRef.current.rotation.x = currentRot.current.x;
    groupRef.current.rotation.y = currentRot.current.y;

    // Smoothly scale active mesh and hide inactive meshes
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const isActive = i === slideIndex;
      const targetScale = isActive ? 1.0 : 0.001;
      mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);
      mesh.visible = mesh.scale.x > 0.01;
    });
  });

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    lockScroll();
    isDragging.current = true;
    prevPtr.current = { x: e.clientX, y: e.clientY };
    soundManager.startDrag();
    soundManager.playClick();
    if (!hasDragged.current) {
      hasDragged.current = true;
      onFirstDrag();
    }
  };

  // Preserved exactly as existing scale
  const scale = isMobile ? 0.72 : 1.35;

  return (
    <group ref={groupRef} scale={scale} onPointerDown={handlePointerDown}>
      {SLIDES.map((s, idx) => (
        <mesh
          key={s.shape}
          ref={(el) => {
            meshRefs.current[idx] = el;
          }}
          visible={idx === slideIndex}
          scale={idx === slideIndex ? [1, 1, 1] : [0.001, 0.001, 0.001]}
        >
          <ShapeMesh shape={s.shape} />
          {/* Polished mirror chrome: metallic 1.0, low roughness, cold silver reflection */}
          <meshPhysicalMaterial
            color="#ffffff"
            metalness={1.0}
            roughness={0.10}
            clearcoat={0.30}
            clearcoatRoughness={0.06}
            reflectivity={1.0}
            envMapIntensity={2.6}
          />
        </mesh>
      ))}
    </group>
  );
}

function StudioLights() {
  const { size } = useThree();
  const isMobile = size.width < 768;

  return (
    <>
      <ambientLight intensity={isMobile ? 1.0 : 0.8} />
      {/* KEY LIGHT: Large bright directional light above and slightly in front */}
      <directionalLight
        position={[0, 8, 7]}
        intensity={isMobile ? 3.4 : 3.0}
        color="#ffffff"
      />
      {/* RIM / EDGE LIGHT: Subtle cool white/blue rim reflection along edges */}
      <directionalLight
        position={[-7, -3, 4]}
        intensity={isMobile ? 2.8 : 2.4}
        color="#38bdf8"
      />
      {/* FILL LIGHT: Very subtle cool fill from opposite side */}
      <directionalLight
        position={[7, 2, 4]}
        intensity={isMobile ? 1.4 : 1.2}
        color="#e0f2fe"
      />
      {/* Back rim light for separation */}
      <directionalLight
        position={[0, 6, -5]}
        intensity={isMobile ? 2.0 : 1.6}
        color="#ffffff"
      />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Origo Carousel Component
   Surrounding environment, DOM layout, text, and styling preserved completely
───────────────────────────────────────────────────────────── */
export default function ImmersiveCarousel() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null!);
  const storyRef = useRef<HTMLDivElement>(null!);

  /* Pause WebGL render loop when section is scrolled out of viewport */
  useEffect(() => {
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

  /* Direct jump on stage click */
  const goToSlide = (c: number) => {
    soundManager.playClick();
    const st = ScrollTrigger.getById('origo-carousel-trigger');
    if (st) {
      const targetScroll = st.start + (c / (SLIDES.length - 1)) * (st.end - st.start);
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  };

  /* Smooth unblur & fade on slide change */
  useEffect(() => {
    if (storyRef.current) {
      gsap.fromTo(
        storyRef.current,
        { opacity: 0, y: 20, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.48, ease: 'power2.out' }
      );
    }
  }, [slideIndex]);

  /* Smooth scroll scrubbing matching the Manifesto section */
  useEffect(() => {
    let lastIdx = -1;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        id: 'origo-carousel-trigger',
        trigger: containerRef.current,
        start: 'top top',
        end: `+=${SLIDES.length * 100}%`,
        pin: true,
        anticipatePin: 1,
        scrub: 0.8,
        onUpdate: (self) => {
          const raw = self.progress * SLIDES.length;
          const idx = Math.min(Math.floor(raw), SLIDES.length - 1);

          if (idx !== lastIdx) {
            if (self.direction === 1) {
              soundManager.playWhooshUp(0.35);
            } else {
              soundManager.playWhooshDown(0.3);
            }
            lastIdx = idx;
            setSlideIndex(idx);
          }
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const currentSlide = SLIDES[slideIndex] || SLIDES[0];

  return (
    <section
      ref={containerRef}
      id="services-carousel"
      className="relative w-full h-screen overflow-hidden select-none bg-[#1E90FF] text-black"
    >
      {/* ── Subtle Ambient Background Texture (Preserved exactly as existing) ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          zIndex: 1,
          backgroundImage: `
            radial-gradient(rgba(0,0,0,0.12) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      />

      {/* ══════════════════════════════════════════════
          3D CANVAS — STANDING HEROIC IN CENTER
      ══════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-10 w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing">
        <Canvas
          frameloop={isVisible ? 'always' : 'never'}
          dpr={[1, 2]}
          gl={{
            powerPreference: 'high-performance',
            antialias: true,
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.15,
          }}
          camera={{ fov: 48, position: [0, 0, 5] }}
          style={{ touchAction: 'pan-y' }}
        >
          <color attach="background" args={['#1E90FF']} />
          <StudioLights />

          {/* 100% Image-Free Pure Studio & Icy Lightformers for Chrome Metal */}
          <Suspense fallback={null}>
            <Environment resolution={512}>
              {/* KEY LIGHT: Large soft rectangular light positioned above and in front */}
              <Lightformer
                form="rect"
                intensity={6.0}
                position={[0, 5, 2.5]}
                scale={[14, 3, 1]}
                target={[0, 0, 0]}
                color="#ffffff"
              />
              {/* FILL: Very subtle cool fill light from below */}
              <Lightformer
                form="rect"
                intensity={1.8}
                position={[0, -4, 2]}
                scale={[10, 2.5, 1]}
                target={[0, 0, 0]}
                color="#e0f2fe"
              />
              {/* RIM / EDGE LIGHT: Subtle cool white/blue rim reflection */}
              <Lightformer
                form="rect"
                intensity={4.2}
                position={[-6, 0, 2.5]}
                scale={[3, 12, 1]}
                target={[0, 0, 0]}
                color="#38bdf8"
              />
              {/* RIM / OPPOSITE: Crisp silver rim reflection */}
              <Lightformer
                form="rect"
                intensity={4.2}
                position={[6, 0, 2.5]}
                scale={[3, 12, 1]}
                target={[0, 0, 0]}
                color="#ffffff"
              />
            </Environment>

            <MetalHeroObject
              slideIndex={slideIndex}
              onFirstDrag={() => setHasInteracted(true)}
            />

            {/* Soft, subtle contact shadow beneath the objects */}
            <ContactShadows
              position={[0, -1.65, 0]}
              opacity={0.35}
              scale={5.5}
              blur={2.4}
              far={4}
              color="#001a33"
            />

            <Preload all />
          </Suspense>
        </Canvas>
      </div>

      {/* ── Interactive Drag Hint Pill (Preserved exactly as existing) ── */}
      {!hasInteracted && (
        <div className="absolute bottom-[20%] md:top-[70%] md:bottom-auto left-1/2 -translate-x-1/2 z-20 pointer-events-none select-none">
          <span className="text-[8.5px] md:text-[10px] font-mono font-bold tracking-[0.25em] uppercase px-3.5 py-1.5 bg-black/10 backdrop-blur-md rounded-full border border-black/20 text-black animate-pulse">
            HOLD & DRAG 3D MODEL
          </span>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          LEFT FLANK: ORIGO STORY (Preserved exactly as existing)
      ══════════════════════════════════════════════ */}
      <div className="absolute left-6 md:left-14 top-6 sm:top-8 md:top-1/2 md:-translate-y-1/2 z-20 max-w-[320px] sm:max-w-sm lg:max-w-md pointer-events-none">
        <div
          ref={storyRef}
          key={currentSlide.index}
          className="flex flex-col space-y-1.5 md:space-y-2.5"
        >
          {/* Stage Tag */}
          <span className="text-[9px] md:text-[10px] font-mono font-bold tracking-[0.28em] uppercase text-black/60">
            {currentSlide.numLabel}
          </span>

          {/* Header: Stage Number & Title */}
          <div className="flex items-baseline gap-3 pt-0.5">
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(36px, 7vw, 88px)',
                lineHeight: 0.9,
                fontWeight: 800,
                letterSpacing: '-0.04em',
                color: '#000000',
              }}
            >
              {currentSlide.index}
            </div>

            <div className="space-y-0.5">
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-heading font-extrabold uppercase tracking-tight text-black">
                {currentSlide.title}
              </h3>
              <p className="text-[11px] sm:text-xs md:text-sm font-serif italic text-black/70">
                {currentSlide.subtitle}
              </p>
            </div>
          </div>

          {/* Concise Story Copy */}
          <p className="text-[10.5px] md:text-xs font-mono font-medium tracking-[0.05em] text-black/80 leading-relaxed pt-0.5 line-clamp-3 md:line-clamp-none">
            {currentSlide.story}
          </p>

          {/* Role stamp */}
          <span className="hidden sm:inline text-[8.5px] md:text-[9.5px] font-mono font-bold tracking-[0.2em] uppercase text-black/50 pt-1">
            // {currentSlide.role}
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          STAGE SELECTOR & METADATA (Preserved exactly as existing)
      ══════════════════════════════════════════════ */}
      <div className="absolute left-1/2 -translate-x-1/2 md:left-auto md:right-12 bottom-[11%] md:top-1/2 md:-translate-y-1/2 z-20 flex flex-row md:flex-col items-center md:items-end gap-2 md:space-y-4 pointer-events-auto">
        {/* Shape Metadata Pill (Desktop only) */}
        <div className="hidden md:flex flex-col items-end space-y-1 pointer-events-none">
          <span className="text-[9px] font-mono font-bold tracking-[0.22em] uppercase text-black/50">
            // FORM PARAMETERS
          </span>
          <span className="text-[10px] md:text-xs font-mono font-bold tracking-[0.16em] uppercase text-black">
            {currentSlide.meta}
          </span>
        </div>

        {/* Stage Selector Dots / Buttons */}
        <div className="flex items-center gap-2">
          {SLIDES.map((s, idx) => (
            <button
              key={s.index}
              onClick={() => goToSlide(idx)}
              className={`px-3 py-1.5 font-mono text-[10px] md:text-xs tracking-[0.2em] transition-all cursor-pointer rounded-sm ${
                idx === slideIndex
                  ? 'bg-black text-white font-bold shadow-md'
                  : 'bg-black/10 hover:bg-black/20 text-black font-medium'
              }`}
            >
              [ 0{idx + 1} ]
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          BOTTOM FOOTER BAR (Preserved exactly as existing)
      ══════════════════════════════════════════════ */}
      <div className="absolute bottom-6 md:bottom-8 left-6 md:left-12 right-6 md:right-12 z-30 flex items-center justify-between pointer-events-none text-[9px] md:text-[10.5px] font-mono tracking-[0.22em] uppercase text-black/60">
        <span>ORIGO ATELIER // FROM ORIGIN TO EXCELLENCE</span>
        <span className="hidden sm:inline">SCROLL TO MORPH FORMS ↓</span>
        <span>[ 3D VOLUMETRIC SPACE ]</span>
      </div>
    </section>
  );
}
