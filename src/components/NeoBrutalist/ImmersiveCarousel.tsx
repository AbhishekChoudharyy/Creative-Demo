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
   Origo Story & Services Data matching KODE Immersive structure:
   - 001: IDEATE (Circle)
   - 002: CREATE (Square)
   - 003: ELEVATE (Triangle)
───────────────────────────────────────────────────────────── */
const SLIDES = [
  {
    index: '01',
    num: '001',
    word: 'IDEATE',
    shape: 'circle',
    manifesto: [
      'WE',
      'DEFINE OBJECTIVES',
      'SHARE IDEAS',
      'EXPLORE THE POSSIBILITIES WITH TECH',
      'AND AGREE A CONCEPT',
    ],
    services: [
      'VIRTUAL, MIXED & AUGMENTED REALITY',
      'SPATIAL COMPUTING & GENERATIVE AI',
      'HOLOGRAPHIC & PROJECTION MAPPING',
      'LOCATION-BASED BRAND EXPERIENCES',
    ],
  },
  {
    index: '02',
    num: '002',
    word: 'CREATE',
    shape: 'rectangle',
    manifesto: [
      'WE',
      'SHAPE THE ARCHITECTURE',
      'FORM THE FOUNDATION',
      'DISCIPLINE THE MATRIX',
      'AND BUILD THE SYSTEM',
    ],
    services: [
      'INTERACTIVE 3D & REAL-TIME WEBGL',
      'SPATIAL ENVIRONMENTS & ARCHITECTURE',
      'PHYSICAL-DIGITAL PRODUCT INTEGRATION',
      'MULTISENSORY BRAND INSTALLATIONS',
    ],
  },
  {
    index: '03',
    num: '003',
    word: 'DELIVER',
    shape: 'triangle',
    manifesto: [
      'WE',
      'DEPLOY THE EXPERIENCE',
      'SCALE WITH PRECISION',
      'LAUNCH THE UNFORGETTABLE',
      'AND DELIVER EXCELLENCE',
    ],
    services: [
      'GLOBAL BRAND ACTIVATIONS & MICE',
      'FLAGSHIP IMMERSIVE ENVIRONMENTS',
      'TRANSFORMATIVE LIVE EXPERIENCES',
      'ENDURING OMNICHANNEL EXCELLENCE',
    ],
  },
];

/* ─────────────────────────────────────────────────────────────
   Hollow 3D Architectural Shapes: Circle, Triangle & Square
   - Hollow metallic frames with beveled profiles matching reference blueprint
   - Only the perimeter lines/beams are rendered, completely see-through in the center
───────────────────────────────────────────────────────────── */
function ShapeMesh({ shape }: { shape: string }) {
  const geom = useMemo(() => {
    // 1. Hollow Square / Rectangle Frame
    if (shape === 'rectangle') {
      const s = new THREE.Shape();
      const w_out = 1.15;
      const h_out = 1.15;
      s.moveTo(-w_out, -h_out);
      s.lineTo(w_out, -h_out);
      s.lineTo(w_out, h_out);
      s.lineTo(-w_out, h_out);
      s.closePath();

      // Inner cutout hole (Frame beam thickness ~0.23)
      const w_in = 0.92;
      const h_in = 0.92;
      const hole = new THREE.Path();
      hole.moveTo(-w_in, -h_in);
      hole.lineTo(-w_in, h_in);
      hole.lineTo(w_in, h_in);
      hole.lineTo(w_in, -h_in);
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

    // 2. Hollow Triangle Frame
    if (shape === 'triangle') {
      const s = new THREE.Shape();
      const R_out = 1.48;
      s.moveTo(0, R_out);
      s.lineTo(R_out * Math.cos(-Math.PI / 6), R_out * Math.sin(-Math.PI / 6));
      s.lineTo(R_out * Math.cos(7 * Math.PI / 6), R_out * Math.sin(7 * Math.PI / 6));
      s.closePath();

      // Inner triangular cutout hole
      const R_in = 0.98;
      const hole = new THREE.Path();
      hole.moveTo(0, R_in);
      hole.lineTo(R_in * Math.cos(7 * Math.PI / 6), R_in * Math.sin(7 * Math.PI / 6));
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

    // 3. Hollow Circle / Ring Frame
    const s = new THREE.Shape();
    const R_out = 1.25;
    s.absarc(0, 0, R_out, 0, Math.PI * 2, false);

    // Inner circular cutout hole
    const R_in = 1.02;
    const hole = new THREE.Path();
    hole.absarc(0, 0, R_in, 0, Math.PI * 2, true);
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
  }, [shape]);

  return <primitive object={geom} attach="geometry" />;
}

/* ─────────────────────────────────────────────────────────────
   Interactive Chrome Metal 3D Model (100% Preserved)
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
  const targetRot = useRef({ x: 0.18, y: -0.62 });
  const currentRot = useRef({ x: 0.18, y: -0.62 });

  useEffect(() => {
    if (slideIndex === 0) {
      targetRot.current = { x: 0.18, y: -0.62 };
    } else if (slideIndex === 1) {
      targetRot.current = { x: 0.18, y: 0.35 };
    } else {
      targetRot.current = { x: 0.16, y: -0.58 };
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

    const baseY = isMobile ? 0.65 : 0;
    groupRef.current.position.y = baseY + Math.sin(t * 1.0) * 0.035;

    currentRot.current.x += (targetRot.current.x - currentRot.current.x) * 0.08;
    currentRot.current.y += (targetRot.current.y - currentRot.current.y) * 0.08;
    groupRef.current.rotation.x = currentRot.current.x;
    groupRef.current.rotation.y = currentRot.current.y;

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

  const scale = isMobile ? 0.55 : 0.95;

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
      <directionalLight position={[0, 8, 7]} intensity={isMobile ? 3.4 : 3.0} color="#ffffff" />
      <directionalLight position={[-5, 2, 4]} intensity={isMobile ? 3.2 : 2.8} color="#ffffff" />
      <directionalLight position={[-7, -2, 4]} intensity={isMobile ? 2.8 : 2.4} color="#38bdf8" />
      <directionalLight position={[7, 2, 4]} intensity={isMobile ? 1.4 : 1.2} color="#e0f2fe" />
      <directionalLight position={[0, 6, -5]} intensity={isMobile ? 2.0 : 1.6} color="#ffffff" />
    </>
  );
}

function SceneShadow() {
  const { size } = useThree();
  const isMobile = size.width < 768;
  if (isMobile) return null;

  return (
    <ContactShadows
      position={[0, -1.35, 0]}
      opacity={0.30}
      scale={4.2}
      blur={2.2}
      far={3.5}
      color="#001a33"
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Origo Services Carousel Component
   Matched 100% to KODE Immersive Reference Layout
───────────────────────────────────────────────────────────── */
export default function ImmersiveCarousel() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null!);
  const contentRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setIsVisible(entry.isIntersecting));
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const goToSlide = (idx: number) => {
    if (idx === slideIndex) return;
    soundManager.playClick();
    if (idx > slideIndex) {
      soundManager.playWhooshUp(0.35);
    } else {
      soundManager.playWhooshDown(0.3);
    }
    setSlideIndex(idx);
  };

  const handleNext = () => {
    const nextIdx = (slideIndex + 1) % SLIDES.length;
    goToSlide(nextIdx);
  };

  const handleToggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    soundManager.setMuted(nextState);
    if (!nextState) {
      soundManager.playClick();
    }
  };

  /* Smooth scroll scrubbing */
  useEffect(() => {
    let lastIdx = -1;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        id: 'origo-carousel-trigger',
        trigger: containerRef.current,
        start: 'top top',
        end: `+=${(SLIDES.length - 1) * 100}%`,
        pin: true,
        anticipatePin: 1,
        scrub: 0.6,
        onUpdate: (self) => {
          const raw = self.progress * (SLIDES.length - 1);
          const idx = Math.min(Math.round(raw), SLIDES.length - 1);

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
      className="relative z-10 w-full h-screen overflow-hidden select-none bg-[#1E90FF] text-black flex flex-col justify-between px-6 sm:px-10 md:px-14 py-6 sm:py-8"
    >
      {/* ── Subtle Ambient Background Texture ── */}
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

      {/* ── TOP BAR: ONLY OUR SERVICES in top left ── */}
      <div className="relative z-30 w-full flex items-center justify-between pointer-events-none text-black uppercase">
        <span className="text-xs sm:text-sm font-mono font-bold tracking-[0.25em]">
          OUR SERVICES
        </span>
      </div>

      {/* ══════════════════════════════════════════════
          3D CANVAS — STANDING HEROIC IN CENTER (Transparent to reveal typography behind)
      ══════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-20 w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing pointer-events-auto">
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
          style={{ touchAction: 'pan-y', background: 'transparent' }}
        >
          <StudioLights />

          <Suspense fallback={null}>
            <Environment resolution={512}>
              <Lightformer
                form="rect"
                intensity={6.5}
                position={[0, 5, 2.5]}
                scale={[14, 3, 1]}
                target={[0, 0, 0]}
                color="#ffffff"
              />
              <Lightformer
                form="rect"
                intensity={2.0}
                position={[0, -4, 2]}
                scale={[10, 2.5, 1]}
                target={[0, 0, 0]}
                color="#e0f2fe"
              />
              <Lightformer
                form="rect"
                intensity={5.2}
                position={[-6, 0.5, 2.5]}
                scale={[4, 12, 1]}
                target={[0, 0, 0]}
                color="#7dd3fc"
              />
              <Lightformer
                form="rect"
                intensity={4.0}
                position={[-3.8, 2.8, 3]}
                scale={[2, 6, 1]}
                target={[0, 0, 0]}
                color="#ffffff"
              />
              <Lightformer
                form="rect"
                intensity={3.8}
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

            <SceneShadow />

            <Preload all />
          </Suspense>
        </Canvas>
      </div>

      {/* ── LOWER SECTION ── */}
      <div className="w-full flex flex-col pointer-events-auto mt-auto mb-4 sm:mb-8 md:mb-16 lg:mb-20">
        {/* ══════════════════════════════════════════════
            1. DESKTOP / TABLET LAYOUT (hidden on mobile, flex on md+)
        ══════════════════════════════════════════════ */}
        <div className="hidden md:flex flex-col w-full">
          {/* Row: 001 (left) ... IDEATE / CREATE / DELIVER (right) resting just above line */}
          <div className="relative z-10 w-full flex items-end justify-between px-1 sm:px-3 pb-0.5 sm:pb-1 pointer-events-none">
            <span
              className="text-[13vw] sm:text-[11vw] md:text-[9.5vw] font-black leading-none tracking-tighter text-black select-none whitespace-nowrap"
              style={{ fontFamily: "'OT Brut', 'Bodoni Moda', 'Playfair Display', Didot, serif" }}
            >
              {currentSlide.num}
            </span>

            <span
              className="text-[13vw] sm:text-[11vw] md:text-[9.5vw] font-black leading-none tracking-tight text-black text-right select-none whitespace-nowrap"
              style={{ fontFamily: "'OT Brut', 'Bodoni Moda', 'Playfair Display', Didot, serif" }}
            >
              {currentSlide.word}
            </span>
          </div>

          {/* Crisp dividing line (Passes behind 3D model) */}
          <div className="relative z-10 w-full border-b border-black mb-3 sm:mb-4 pointer-events-none" />

          {/* Lower Two-Column Information Grid */}
          <div className="relative z-30 w-full flex justify-between items-start gap-6 pointer-events-auto">
            <div className="font-mono text-[12px] md:text-[13px] tracking-wider leading-relaxed uppercase text-black font-semibold space-y-0.5">
              {currentSlide.manifesto.map((line, idx) => (
                <p key={idx} className={idx === 0 ? 'mb-1 font-bold' : ''}>
                  {line}
                </p>
              ))}
            </div>

            <div className="flex flex-col items-end text-right">
              <button
                onClick={handleNext}
                onMouseEnter={() => soundManager.playHover()}
                className="text-xs font-mono font-bold tracking-widest uppercase text-black hover:opacity-75 transition-opacity cursor-pointer mb-2 sm:mb-3"
              >
                NEXT
              </button>

              <div className="font-mono text-xs sm:text-[12px] md:text-[13px] tracking-wider leading-relaxed uppercase text-black font-medium space-y-0.5">
                {currentSlide.services.map((item, idx) => (
                  <p key={idx}>{item}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            2. MOBILE LAYOUT (flex on mobile, hidden on md+)
            Refined with Neo-Brutalist Typography Hierarchy & Design Principles
        ══════════════════════════════════════════════ */}
        <div className="flex md:hidden flex-col w-full relative z-30">
          {/* Dividing line right underneath the 3D shape */}
          <div className="w-full border-b border-black mb-3.5 sm:mb-4 pointer-events-none" />

          {/* Stacked 001 and IDEATE / CREATE / DELIVER with crisp typography hierarchy */}
          <div
            onClick={handleNext}
            className="flex flex-col items-start select-none pointer-events-auto cursor-pointer active:opacity-75 transition-opacity"
            title="Tap to advance"
          >
            <span
              className="text-[17vw] sm:text-[15vw] font-black tracking-tighter text-black select-none leading-[0.88]"
              style={{ fontFamily: "'OT Brut', 'Bodoni Moda', 'Playfair Display', Didot, serif" }}
            >
              {currentSlide.num}
            </span>
            <span
              className="text-[17vw] sm:text-[15vw] font-black tracking-tight text-black select-none leading-[0.88] mt-1 sm:mt-1.5"
              style={{ fontFamily: "'OT Brut', 'Bodoni Moda', 'Playfair Display', Didot, serif" }}
            >
              {currentSlide.word}
            </span>
          </div>

          {/* Manifesto copy directly below IDEATE */}
          <div className="font-mono text-[11.5px] sm:text-[12px] tracking-[0.06em] leading-[1.65] uppercase text-black font-semibold space-y-0.5 mt-4 sm:mt-5 pointer-events-none">
            {currentSlide.manifesto.map((line, idx) => (
              <p key={idx} className={idx === 0 ? 'mb-1 font-bold' : ''}>
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* ── BOTTOM RIGHT CORNER TAG: [ AR ] ── */}
        <div className="relative z-30 w-full flex justify-end pt-2 sm:pt-1 pointer-events-none text-[10px] sm:text-xs font-mono tracking-widest text-black font-semibold">
          [ AR ]
        </div>
      </div>
    </section>
  );
}
