'use client';

import React, {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Html, Lightformer, Preload } from '@react-three/drei';
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
/* ─────────────────────────────────────────────────────────────
   Tubular 3D Shapes with Liquid Molten Vertex Displacement:
   - Torus for Circle, Rounded Tubular Square, Rounded Tubular Triangle
   - Tube radius 0.36 matching hero 3D thickness with circular cross-section
   - Interactive liquid molten bulge & ripple shader displacement on hover/drag
───────────────────────────────────────────────────────────── */
function ShapeMesh({ shape }: { shape: string }) {
  const geom = useMemo(() => {
    // 1. Hollow Square / Rectangle Frame with subtle rounded corners
    if (shape === 'rectangle') {
      const w_out = 1.15;
      const h_out = 1.15;
      const r_out = 0.14; // subtle elegant rounded corners

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

      // Subdivided inner cutout hole matching hero's wall thickness with subtle rounded corners
      const w_in = 0.52;
      const h_in = 0.52;
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
        depth: 0.58,
        bevelEnabled: true,
        bevelThickness: 0.10,
        bevelSize: 0.08,
        bevelSegments: 16,
        curveSegments: 32,
        steps: 6,
      });
      g.center();
      g.computeVertexNormals();
      return g;
    }

    // 2. Hollow Triangle Frame with subtle rounded corners (slightly larger size)
    if (shape === 'triangle') {
      const R_out = 1.66;
      const cr_out = 0.20; // subtle rounded corners on triangle
      const cornersOut = [
        new THREE.Vector2(0, R_out),
        new THREE.Vector2(R_out * Math.cos(-Math.PI / 6), R_out * Math.sin(-Math.PI / 6)),
        new THREE.Vector2(R_out * Math.cos(7 * Math.PI / 6), R_out * Math.sin(7 * Math.PI / 6)),
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
      const pStart0 = new THREE.Vector2().copy(c0).addScaledVector(new THREE.Vector2().subVectors(c0, cornersOut[2]).normalize(), -cr_out);
      const pEnd0 = new THREE.Vector2().copy(c0).addScaledVector(new THREE.Vector2().subVectors(cornersOut[1], c0).normalize(), cr_out);
      s.lineTo(pStart0.x, pStart0.y);
      s.quadraticCurveTo(c0.x, c0.y, pEnd0.x, pEnd0.y);
      s.closePath();

      // Inner triangular cutout hole with subtle rounded corners
      const R_in = 0.88;
      const cr_in = 0.11;
      const cornersIn = [
        new THREE.Vector2(0, R_in),
        new THREE.Vector2(R_in * Math.cos(7 * Math.PI / 6), R_in * Math.sin(7 * Math.PI / 6)),
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
      const hpStart0 = new THREE.Vector2().copy(h0).addScaledVector(new THREE.Vector2().subVectors(h0, cornersIn[2]).normalize(), -cr_in);
      const hpEnd0 = new THREE.Vector2().copy(h0).addScaledVector(new THREE.Vector2().subVectors(cornersIn[1], h0).normalize(), cr_in);
      hole.lineTo(hpStart0.x, hpStart0.y);
      hole.quadraticCurveTo(h0.x, h0.y, hpEnd0.x, hpEnd0.y);
      hole.closePath();
      s.holes.push(hole);

      const g = new THREE.ExtrudeGeometry(s, {
        depth: 0.58,
        bevelEnabled: true,
        bevelThickness: 0.10,
        bevelSize: 0.08,
        bevelSegments: 16,
        curveSegments: 32,
        steps: 6,
      });
      g.center();
      g.computeVertexNormals();
      return g;
    }

    // 3. Hollow Circle / Tyre Ring (slightly larger size and extra chunky thickness)
    const s = new THREE.Shape();
    s.absarc(0, 0, 1.30, 0, Math.PI * 2, false);

    const hole = new THREE.Path();
    hole.absarc(0, 0, 0.70, 0, Math.PI * 2, true);
    s.holes.push(hole);

    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.58,
      bevelEnabled: true,
      bevelThickness: 0.10,
      bevelSize: 0.08,
      bevelSegments: 16,
      curveSegments: 128,
      steps: 6,
    });
    g.center();
    g.computeVertexNormals();
    return g;
  }, [shape]);

  return <primitive object={geom} attach="geometry" />;
}

/* ─────────────────────────────────────────────────────────────
   Interactive Black Liquid Molten 3D Models (All 3 Shapes)
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
  const ringRef = useRef<THREE.Group>(null);
  const [isHoveredState, setIsHoveredState] = useState(false);

  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const prevPtr = useRef({ x: 0, y: 0 });
  const targetRot = useRef({ x: 0.18, y: -0.62 });
  const currentRot = useRef({ x: 0.18, y: -0.62 });

  // Interaction tracking
  const isHovered = useRef(false);
  const hoverPointTarget = useRef(new THREE.Vector3(0, 0.85, 0.45));
  const hoverPointCurrent = useRef(new THREE.Vector3(0, 0.85, 0.45));

  const liquidUniforms = useRef({
    uTime: { value: 0 },
    uHover: { value: 0.0 },
    uHoverPoint: { value: new THREE.Vector3(0, 0.85, 0.45) },
    uDragSpeed: { value: 0 },
  });

  // Unified Liquid Material for Circle, Rectangle and Triangle
  const liquidMaterial = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: '#080808',
      roughness: 0.25,
      metalness: 0.10,
      clearcoat: 0.60,
      clearcoatRoughness: 0.12,
      reflectivity: 0.80,
      envMapIntensity: 0.90,
      side: THREE.DoubleSide,
      transparent: false,
      depthWrite: true,
      depthTest: true,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = liquidUniforms.current.uTime;
      shader.uniforms.uHover = liquidUniforms.current.uHover;
      shader.uniforms.uHoverPoint = liquidUniforms.current.uHoverPoint;
      shader.uniforms.uDragSpeed = liquidUniforms.current.uDragSpeed;

      shader.vertexShader = `
        uniform float uTime;
        uniform float uHover;
        uniform vec3 uHoverPoint;
        uniform float uDragSpeed;

        float getLiquidDisplacement(vec3 p, vec3 n, float t, vec3 hPt, float hAmt, float drag) {
          float dist = length(p - hPt);
          float bulgeRadius = 1.35;
          if (dist >= bulgeRadius) return 0.0;

          float normDist = dist / bulgeRadius;
          float falloff = smoothstep(1.0, 0.0, normDist);
          // Smooth cosine bell dome (calm, steady, matching reference Image 3)
          float dome = 0.5 * (1.0 + cos(normDist * 3.14159265));
          // Viscous perimeter crease indentation matching Image 3
          float crease = -sin(normDist * 3.14159265) * (1.0 - normDist) * 0.025;

          // Slow organic liquid undulation
          float slowLiquid = sin(t * 1.5 + normDist * 4.5) * 0.018 * (1.0 - normDist);

          // Strictly positive outward displacement so geometry is 100% solid and never cuts inwards
          float disp = max(0.0, (dome * (0.20 + drag * 0.10) + crease + slowLiquid) * falloff);
          return disp * hAmt;
        }
      ` + shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <beginnormal_vertex>',
        `
        #include <beginnormal_vertex>
        float d0 = getLiquidDisplacement(position, normal, uTime, uHoverPoint, uHover, uDragSpeed);
        vec3 displacedP0 = position + normal * d0;
        if (d0 > 0.0001) {
          vec3 vTangent = normalize(abs(normal.y) < 0.99 ? cross(normal, vec3(0.0, 1.0, 0.0)) : cross(normal, vec3(1.0, 0.0, 0.0)));
          vec3 vBitangent = normalize(cross(normal, vTangent));
          float delta = 0.02;
          vec3 p1 = position + vTangent * delta;
          vec3 p2 = position + vBitangent * delta;
          float d1 = getLiquidDisplacement(p1, normal, uTime, uHoverPoint, uHover, uDragSpeed);
          float d2 = getLiquidDisplacement(p2, normal, uTime, uHoverPoint, uHover, uDragSpeed);
          vec3 displacedP1 = p1 + normal * d1;
          vec3 displacedP2 = p2 + normal * d2;
          vec3 computedNorm = cross(displacedP1 - displacedP0, displacedP2 - displacedP0);
          if (length(computedNorm) > 0.00001) {
            objectNormal = normalize(computedNorm);
          }
        }
        `
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        vec3 transformed = displacedP0;
        `
      );
    };

    mat.customProgramCacheKey = () => 'liquid_unified_v4';
    return mat;
  }, []);

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
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('hide-cursor-for-3d');
      }
    };
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - prevPtr.current.x;
      const dy = e.clientY - prevPtr.current.y;
      targetRot.current.y += dx * 0.055;
      targetRot.current.x += dy * 0.055;
      targetRot.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, targetRot.current.x));
      prevPtr.current = { x: e.clientX, y: e.clientY };
      const speed = Math.sqrt(dx * dx + dy * dy);
      soundManager.updateDrag(speed);
      liquidUniforms.current.uDragSpeed.value = Math.min(3.0, liquidUniforms.current.uDragSpeed.value + speed * 0.04);
    };

    const onUp = () => {
      if (isDragging.current) {
        soundManager.stopDrag();
        soundManager.playClick();
      }
      isDragging.current = false;
      if (!isHovered.current) {
        setIsHoveredState(false);
        if (typeof document !== 'undefined') {
          document.body.classList.remove('hide-cursor-for-3d');
        }
      }
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

    liquidUniforms.current.uTime.value = t;

    // Slow, silky liquid hover transition
    const targetHoverVal = isHovered.current || isDragging.current ? 1.0 : 0.0;
    liquidUniforms.current.uHover.value = THREE.MathUtils.lerp(
      liquidUniforms.current.uHover.value,
      targetHoverVal,
      0.035
    );

    // Viscous liquid pointer inertia
    hoverPointCurrent.current.lerp(hoverPointTarget.current, 0.055);
    liquidUniforms.current.uHoverPoint.value.copy(hoverPointCurrent.current);

    if (ringRef.current) {
      ringRef.current.position.set(hoverPointCurrent.current.x, hoverPointCurrent.current.y, 0.44);
    }

    liquidUniforms.current.uDragSpeed.value = THREE.MathUtils.lerp(
      liquidUniforms.current.uDragSpeed.value,
      0.0,
      0.06
    );

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

  const handlePointerMoveHit = (e: any) => {
    if (e.point && groupRef.current) {
      const local = groupRef.current.worldToLocal(e.point.clone());
      hoverPointTarget.current.copy(local);
      isHovered.current = true;
      setIsHoveredState(true);
      if (typeof document !== 'undefined') {
        document.body.classList.add('hide-cursor-for-3d');
      }
    }
  };

  const handlePointerOver = (e: any) => {
    isHovered.current = true;
    setIsHoveredState(true);
    if (typeof document !== 'undefined') {
      document.body.classList.add('hide-cursor-for-3d');
    }
    if (e.point && groupRef.current) {
      const local = groupRef.current.worldToLocal(e.point.clone());
      hoverPointTarget.current.copy(local);
    }
  };

  const handlePointerOut = () => {
    isHovered.current = false;
    if (!isDragging.current) {
      setIsHoveredState(false);
      if (typeof document !== 'undefined') {
        document.body.classList.remove('hide-cursor-for-3d');
      }
    }
  };

  const scale = isMobile ? 0.55 : 0.95;

  return (
    <group
      ref={groupRef}
      scale={scale}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMoveHit}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {SLIDES.map((s, idx) => (
        <mesh
          key={s.shape}
          ref={(el) => {
            meshRefs.current[idx] = el;
          }}
          visible={idx === slideIndex}
          scale={idx === slideIndex ? [1, 1, 1] : [0.001, 0.001, 0.001]}
          material={liquidMaterial}
        >
          <ShapeMesh shape={s.shape} />
        </mesh>
      ))}

      {/* ── INTERACTIVE "HOLD AND DRAG" CURSOR FOLLOWER CIRCLE (Matching Reference Image) ── */}
      <group ref={ringRef} position={[0, 0, 0.44]}>
        <Html center style={{ pointerEvents: 'none' }}>
          <div
            style={{
              transformOrigin: 'center center',
              transition: isHoveredState
                ? 'transform 0.42s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease-out'
                : 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.20s ease-in',
              transform: isHoveredState ? 'scale(1)' : 'scale(0)',
              opacity: isHoveredState ? 1 : 0,
            }}
            className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full border-[1.8px] border-white flex items-center justify-center select-none pointer-events-none shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            {/* Magnifying Glass Center Callout matching reference image */}
            <span className="relative z-10 text-[11px] sm:text-[12px] font-mono font-bold tracking-[0.24em] text-white uppercase text-center select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] px-3">
              HOLD AND DRAG
            </span>
          </div>
        </Html>
      </group>
    </group>
  );
}

function StudioLights() {
  const { size } = useThree();
  const isMobile = size.width < 768;

  return (
    <>
      <ambientLight intensity={isMobile ? 0.7 : 0.5} />
      <directionalLight position={[0, 8, 7]} intensity={isMobile ? 3.0 : 2.5} color="#ffffff" />
      <directionalLight position={[-5, 2, 4]} intensity={isMobile ? 2.5 : 2.0} color="#ffffff" />
      <directionalLight position={[-7, -2, 4]} intensity={isMobile ? 2.0 : 1.5} color="#ffffff" />
      <directionalLight position={[7, 2, 4]} intensity={isMobile ? 1.5 : 1.2} color="#ffffff" />
      <directionalLight position={[0, 6, -5]} intensity={isMobile ? 1.8 : 1.4} color="#ffffff" />
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
      className="relative z-10 w-full h-screen overflow-hidden select-none bg-[#1E90FF] text-[#0A1F44] flex flex-col justify-between px-6 sm:px-10 md:px-14 py-6 sm:py-8"
    >
      {/* ── Subtle Ambient Background Texture ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          zIndex: 1,
          backgroundImage: `
            radial-gradient(rgba(10,31,68,0.12) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      />

      {/* ── TOP BAR: ONLY OUR SERVICES in top left ── */}
      <div className="relative z-30 w-full flex items-center justify-between pointer-events-none text-[#0A1F44] uppercase">
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
                intensity={3.0}
                position={[0, 6, 2]}
                scale={[8, 2, 1]}
                target={[0, 0, 0]}
                color="#ffffff"
              />
              <Lightformer
                form="rect"
                intensity={1.5}
                position={[0, -4, 2]}
                scale={[6, 1.5, 1]}
                target={[0, 0, 0]}
                color="#ffffff"
              />
              <Lightformer
                form="rect"
                intensity={2.0}
                position={[-5, 3, 2]}
                scale={[3, 5, 1]}
                target={[0, 0, 0]}
                color="#ffffff"
              />
              <Lightformer
                form="rect"
                intensity={2.5}
                position={[5, 2, -2]}
                scale={[3, 6, 1]}
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
              className="text-[13vw] sm:text-[11vw] md:text-[9.5vw] font-black leading-none tracking-tighter text-[#0A1F44] select-none whitespace-nowrap"
              style={{ fontFamily: "'OT Brut', 'Bodoni Moda', 'Playfair Display', Didot, serif" }}
            >
              {currentSlide.num}
            </span>

            <span
              className="text-[13vw] sm:text-[11vw] md:text-[9.5vw] font-black leading-none tracking-tight text-[#0A1F44] text-right select-none whitespace-nowrap"
              style={{ fontFamily: "'OT Brut', 'Bodoni Moda', 'Playfair Display', Didot, serif" }}
            >
              {currentSlide.word}
            </span>
          </div>

          {/* Crisp dividing line (Passes behind 3D model) */}
          <div className="relative z-10 w-full border-b border-[#0A1F44] mb-3 sm:mb-4 pointer-events-none" />

          {/* Lower Two-Column Information Grid */}
          <div className="relative z-30 w-full flex justify-between items-start gap-6 pointer-events-auto">
            <div className="font-mono text-[12px] md:text-[13px] tracking-wider leading-relaxed uppercase text-[#0A1F44] font-semibold space-y-0.5">
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
                className="text-xs font-mono font-bold tracking-widest uppercase text-[#0A1F44] hover:opacity-75 transition-opacity cursor-pointer mb-2 sm:mb-3"
              >
                NEXT
              </button>

              <div className="font-mono text-xs sm:text-[12px] md:text-[13px] tracking-wider leading-relaxed uppercase text-[#0A1F44] font-medium space-y-0.5">
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
          <div className="w-full border-b border-[#0A1F44] mb-3.5 sm:mb-4 pointer-events-none" />

          {/* Stacked 001 and IDEATE / CREATE / DELIVER with crisp typography hierarchy */}
          <div
            onClick={handleNext}
            className="flex flex-col items-start select-none pointer-events-auto cursor-pointer active:opacity-75 transition-opacity"
            title="Tap to advance"
          >
            <span
              className="text-[17vw] sm:text-[15vw] font-black tracking-tighter text-[#0A1F44] select-none leading-[0.88]"
              style={{ fontFamily: "'OT Brut', 'Bodoni Moda', 'Playfair Display', Didot, serif" }}
            >
              {currentSlide.num}
            </span>
            <span
              className="text-[17vw] sm:text-[15vw] font-black tracking-tight text-[#0A1F44] select-none leading-[0.88] mt-1 sm:mt-1.5"
              style={{ fontFamily: "'OT Brut', 'Bodoni Moda', 'Playfair Display', Didot, serif" }}
            >
              {currentSlide.word}
            </span>
          </div>

          {/* Manifesto copy directly below IDEATE */}
          <div className="font-mono text-[11.5px] sm:text-[12px] tracking-[0.06em] leading-[1.65] uppercase text-[#0A1F44] font-semibold space-y-0.5 mt-4 sm:mt-5 pointer-events-none">
            {currentSlide.manifesto.map((line, idx) => (
              <p key={idx} className={idx === 0 ? 'mb-1 font-bold' : ''}>
                {line}
              </p>
            ))}
          </div>
        </div>


      </div>
    </section>
  );
}
