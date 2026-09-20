'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { soundManager } from '@/lib/sound';

interface Project {
  id: number;
  title: string;
  client: string;
  cat: string;
  year: string;
  img: string;
}

const CATEGORIES = [
  { key: 'ALL', label: 'All' },
  { key: 'AUTOMOTIVE EXPERIENCES', label: 'Automotive' },
  { key: 'EXHIBITIONS & BRAND EXPERIENCES', label: 'Exhibitions' },
  { key: 'EVENTS & ACTIVATIONS', label: 'Events' },
  { key: 'SHOWROOM DESIGN', label: 'Showrooms' },
  { key: 'SOCIAL MEDIA & CONTENT', label: 'Social' },
  { key: 'PRINT & OOH', label: 'Print' },
];

const ALL_PROJECTS: Project[] = [
  {
    id: 1,
    title: 'Jeep Meridian — Launch',
    client: 'Jeep India',
    cat: 'AUTOMOTIVE EXPERIENCES',
    year: '2024',
    img: '/layers/1.jpg',
  },
  {
    id: 2,
    title: 'Neuron Energy — Bharat Mobility Expo',
    client: 'Neuron Energy',
    cat: 'EXHIBITIONS & BRAND EXPERIENCES',
    year: '2025',
    img: '/layers/2.jpg',
  },
  {
    id: 3,
    title: 'VH1 Supersonic — Nexa Lounge',
    client: 'Maruti Suzuki Nexa',
    cat: 'EVENTS & ACTIVATIONS',
    year: '2023',
    img: '/layers/3.jpg',
  },
  {
    id: 4,
    title: 'Teknofeet — Showroom Design',
    client: 'Teknofeet',
    cat: 'SHOWROOM DESIGN',
    year: '2024',
    img: '/layers/4.jpg',
  },
  {
    id: 5,
    title: 'Citroën Basalt — Mall Activation',
    client: 'Citroën India',
    cat: 'AUTOMOTIVE EXPERIENCES',
    year: '2024',
    img: '/layers/5.jpg',
  },
  {
    id: 6,
    title: 'Glen Appliances — 25 Years Celebration',
    client: 'Glen Home Appliances',
    cat: 'EVENTS & ACTIVATIONS',
    year: '2024',
    img: '/layers/6.jpg',
  },
  {
    id: 7,
    title: 'Greaves — Auto Expo',
    client: 'Greaves Cotton',
    cat: 'EXHIBITIONS & BRAND EXPERIENCES',
    year: '2024',
    img: '/layers/7.jpg',
  },
  {
    id: 8,
    title: 'Faces Canada — OOH & Store Print',
    client: 'Faces Canada',
    cat: 'PRINT & OOH',
    year: '2023',
    img: '/layers/8.jpg',
  },
  {
    id: 9,
    title: 'Mr. Makhana — Social Media',
    client: 'Mr. Makhana',
    cat: 'SOCIAL MEDIA & CONTENT',
    year: '2024',
    img: '/layers/9.jpg',
  },
  {
    id: 10,
    title: 'Hero Cycles — Dealers Meet',
    client: 'Hero Cycles',
    cat: 'EVENTS & ACTIVATIONS',
    year: '2023',
    img: '/layers/10.jpg',
  },
];

/* ─────────────────────────────────────────────────────────────
   ORIGO GEOMETRIC UNWOVEN SHADERS
   - Cards tear apart into Circle (○), Rectangle (□), and Triangle (△)
     fragments matching Origo Atelier's geometric brand concept!
   - 16:9 ratio, calm velocity, smooth dissolving
───────────────────────────────────────────────────────────── */
const VERTEX_SHADER = /* glsl */ `
  attribute float aThread;   // ribbon index, 0 .. threads-1
  attribute float aRim;      // -1 at top edge, +1 at bottom

  uniform float uTime;
  uniform float uHalfWidth;  // half the viewport width, in pixels
  uniform float uZone;       // depth of the tear zone at each edge, in pixels
  uniform float uStrength;   // global master switch
  uniform float uWobble;     // motion reduction flag
  uniform float uSeed;       // per-card seed

  varying vec2  vUv;
  varying float vTear;       // 0 = woven solid, 1 = fully shattered
  varying float vRim;
  varying float vRandom;

  float hash(float n) {
    return fract(sin(n * 127.1 + 311.7) * 43758.5453);
  }

  void main() {
    vUv = uv;
    vRim = aRim;

    vec4 world = modelMatrix * vec4(position, 1.0);
    float x = world.x;

    // How far into the geometric tear zone is this vertex?
    float left  = 1.0 - smoothstep(-uHalfWidth, -uHalfWidth + uZone, x);
    float right = smoothstep(uHalfWidth - uZone, uHalfWidth, x);
    float tear  = max(left, right) * uStrength;

    float direction = x < 0.0 ? -1.0 : 1.0;

    float randomA = hash(aThread + uSeed * 57.0);
    float randomB = hash(aThread * 3.7 + uSeed * 91.0);
    vRandom = randomA;

    // Smooth ramp so cards stay solid across the viewing area
    float t = pow(tear, 1.7);

    // Escape speed for flying geometric particles
    float run = t * (30.0 + randomA * 140.0);
    run *= 0.90 + 0.10 * sin(uTime * (0.6 + randomB * 1.2) + randomA * 6.2831);
    world.x += direction * run;

    // Vertical dispersion of geometric fragments
    world.y += (randomA - 0.5) * 50.0 * t * t;

    // Subtle, gentle floating motion
    world.y += sin(world.x * 0.015 + uTime * (0.8 + randomA * 1.1) + randomA * 6.2831)
               * (2.5 + 5.0 * randomA) * t * uWobble;

    vTear = tear;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform sampler2D uMap;
  uniform vec2  uCardSize;    // px
  uniform float uRadius;      // px
  uniform float uImageAspect; // width / height of texture
  uniform vec3  uBgColor;     // background electric blue blend color
  uniform float uSeed;
  uniform float uSectionOpacity;

  varying vec2  vUv;
  varying float vTear;
  varying float vRim;
  varying float vRandom;

  float sdRoundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    float tear = vTear;

    // ─────────────────────────────────────────────────────────
    // ORIGO GEOMETRIC FRAGMENTATION (Circle, Rectangle, Triangle)
    // ─────────────────────────────────────────────────────────
    // 28 rows x 50 cols = finer, delicate geometric mosaic across 16:9 card
    float rows = 28.0;
    float cols = 50.0;

    vec2 cellCoord = vec2(vUv.x * cols, vUv.y * rows);
    vec2 cellIndex = floor(cellCoord);
    vec2 localP = fract(cellCoord) - 0.5;

    // Deterministic pseudo-random seed per geometric cell
    float cellSeed = cellIndex.x * 12.9898 + cellIndex.y * 78.233 + uSeed * 43.17;
    float cellRand = fract(sin(cellSeed) * 43758.5453);

    // Tumble rotation as fragments tear and scatter
    float rot = (cellRand - 0.5) * 3.14159 * smoothstep(0.08, 0.85, tear) * 1.4;
    float cR = cos(rot);
    float sR = sin(rot);
    vec2 p = vec2(localP.x * cR - localP.y * sR, localP.x * sR + localP.y * cR);

    float shapeDist = 0.0;

    if (cellRand < 0.333) {
      // 1. ○ CIRCLE FRAGMENT (Dainty Origo Singularity)
      float radius = mix(0.70, 0.28, smoothstep(0.05, 0.80, tear));
      shapeDist = length(p) - radius;
    } else if (cellRand < 0.666) {
      // 2. □ RECTANGLE / SQUARE FRAGMENT (Dainty Origo Dimension)
      float halfSize = mix(0.66, 0.25, smoothstep(0.05, 0.80, tear));
      vec2 d = abs(p) - vec2(halfSize) + 0.025;
      shapeDist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - 0.025;
    } else {
      // 3. △ TRIANGLE FRAGMENT (Dainty Origo Form)
      float triSize = mix(0.72, 0.29, smoothstep(0.05, 0.80, tear));
      vec2 tp = p;
      if (fract(cellRand * 5.7) > 0.5) tp.y = -tp.y; // Alternate orientations
      const float k = 1.7320508;
      tp.x = abs(tp.x) - triSize;
      tp.y = tp.y + triSize / k;
      if (tp.x + k * tp.y > 0.0) tp = vec2(tp.x - k * tp.y, -k * tp.x - tp.y) * 0.5;
      tp.x -= clamp(tp.x, -2.0 * triSize, 0.0);
      shapeDist = -length(tp) * sign(tp.y);
    }

    // Antialiased geometric mask
    float shapeMask = 1.0 - smoothstep(-0.025, 0.025, shapeDist);

    // Transition smoothly from 100% solid continuous card into Circle/Square/Triangle fragments
    float geometryAlpha = mix(1.0, shapeMask, smoothstep(0.06, 0.38, tear));

    // Card outer silhouette (rounded 16:9 card)
    vec2 cardP = (vUv - 0.5) * uCardSize;
    float cardAlpha = 1.0 - smoothstep(-1.5, 0.5, sdRoundBox(cardP, uCardSize * 0.5, uRadius));

    // Outer edge fade
    float fade = 1.0 - smoothstep(0.85, 1.0, tear) * 0.55;
    float alpha = cardAlpha * geometryAlpha * fade * uSectionOpacity;
    if (alpha < 0.003) discard;

    // Sample cover-fitted image texture
    float cardAspect = uCardSize.x / uCardSize.y;
    vec2 scale = cardAspect > uImageAspect
      ? vec2(1.0, uImageAspect / cardAspect)
      : vec2(cardAspect / uImageAspect, 1.0);
    vec3 color = texture2D(uMap, (vUv - 0.5) * scale + 0.5).rgb;

    // Specular bevel highlight along the edges of the geometric fragments
    float rimGlint = smoothstep(0.025, 0.0, abs(shapeDist)) * smoothstep(0.1, 0.7, tear);
    color += rimGlint * 0.22;

    // Bleach seamlessly into the electric blue background
    color = mix(color, uBgColor, smoothstep(0.60, 1.0, tear) * 0.85);

    gl_FragColor = vec4(color, alpha);
  }
`;

function buildRibbonGeometry(width: number, height: number, threads: number, segments: number) {
  const columns = segments + 1;
  const perThread = columns * 2;
  const total = threads * perThread;

  const positions = new Float32Array(total * 3);
  const uvs = new Float32Array(total * 2);
  const rims = new Float32Array(total);
  const threadIds = new Float32Array(total);
  const indices: number[] = [];

  let v = 0;
  for (let t = 0; t < threads; t++) {
    for (let row = 0; row < 2; row++) {
      const vy = (t + row) / threads;
      for (let c = 0; c < columns; c++) {
        const ux = c / segments;
        positions[v * 3 + 0] = (ux - 0.5) * width;
        positions[v * 3 + 1] = (vy - 0.5) * height;
        positions[v * 3 + 2] = 0;
        uvs[v * 2 + 0] = ux;
        uvs[v * 2 + 1] = vy;
        rims[v] = row === 0 ? -1 : 1;
        threadIds[v] = t;
        v++;
      }
    }

    const base = t * perThread;
    for (let c = 0; c < segments; c++) {
      const bl = base + c;
      const br = base + c + 1;
      const tl = base + columns + c;
      const tr = base + columns + c + 1;
      indices.push(bl, br, tl, br, tr, tl);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setAttribute('aRim', new THREE.BufferAttribute(rims, 1));
  geometry.setAttribute('aThread', new THREE.BufferAttribute(threadIds, 1));
  geometry.setIndex(indices);
  return geometry;
}

function drawPlaceholderPlate(seed: number): HTMLCanvasElement {
  const w = 960, h = 540; // 16:9 ratio
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  let s = seed * 9301 + 49297;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };

  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#09090b');
  grad.addColorStop(1, '#18181b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) {
    const cx = rnd() * w;
    const cy = rnd() * h;
    const r = (0.25 + rnd() * 0.40) * w;
    const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    radGrad.addColorStop(0, '#1E90FF44');
    radGrad.addColorStop(1, '#00000000');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.globalCompositeOperation = 'source-over';

  return canvas;
}

export default function WorkGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const activeCategoryRef = useRef('ALL');
  const [currentIndex, setCurrentIndex] = useState(1);
  const slideByRef = useRef<(dir: number) => void>(() => {});
  const switchCategoryRef = useRef<(newCat: string) => void>(() => {});
  const isTweeningRef = useRef(false);
  const targetUnitRef = useRef(0);
  const filterScrollRef = useRef<HTMLDivElement>(null);
  const desktopFilterScrollRef = useRef<HTMLDivElement>(null);

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'ALL') return ALL_PROJECTS;
    return ALL_PROJECTS.filter((p) => p.cat === activeCategory);
  }, [activeCategory]);

  const motionRef = useRef({ velocity: 0, offset: 0 });

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof window === 'undefined') return;

    // 16:9 Widescreen Card Configuration with Finer Origo Geometry Fragmentation
    const CONFIG = {
      threads: 28,
      segments: 50, // Finer 50 columns x 28 rows
      cardMaxHeight: 340,
      cardAspect: 16 / 9, // Exact 16:9 widescreen ratio
      cardGapRatio: 0.08,
      cardRadius: 18, // Clean rounded corners matching mockup screenshot
      scrollSpeed: 18, // Subtle, slow continuous drift on desktop
      flingMax: 2600,
      tearZoneRatio: 0.22,
      tearZoneMax: 260,
    };

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    stage.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);

    const shared = {
      uTime: { value: 0 },
      uHalfWidth: { value: 1 },
      uZone: { value: 1 },
      uStrength: { value: 0 },
      uWobble: { value: 1 },
      uCardSize: { value: new THREE.Vector2(1, 1) },
      uRadius: { value: CONFIG.cardRadius },
      uBgColor: { value: new THREE.Color('#D8ECFD') },
      uSectionOpacity: { value: 1.0 },
    };

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('');

    // Pre-cache all project textures & materials once in GPU memory to prevent black flash
    const textureMap = new Map<number, { texture: THREE.Texture; material: THREE.ShaderMaterial; project: Project }>();

    ALL_PROJECTS.forEach((proj, i) => {
      const texture = textureLoader.load(
        proj.img,
        (loadedTex) => {
          loadedTex.colorSpace = THREE.SRGBColorSpace;
          loadedTex.generateMipmaps = true;
          loadedTex.minFilter = THREE.LinearMipmapLinearFilter;
          loadedTex.magFilter = THREE.LinearFilter;
          loadedTex.needsUpdate = true;
        },
        undefined,
        () => {
          const fallbackPlate = drawPlaceholderPlate(proj.id * 17);
          const canvasTexture = new THREE.CanvasTexture(fallbackPlate);
          canvasTexture.colorSpace = THREE.SRGBColorSpace;
          material.uniforms.uMap.value = canvasTexture;
        }
      );

      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms: {
          uMap: { value: texture },
          uCardSize: shared.uCardSize,
          uRadius: shared.uRadius,
          uTime: shared.uTime,
          uHalfWidth: shared.uHalfWidth,
          uZone: shared.uZone,
          uStrength: shared.uStrength,
          uWobble: shared.uWobble,
          uBgColor: shared.uBgColor,
          uSectionOpacity: shared.uSectionOpacity,
          uImageAspect: { value: 16 / 9 },
          uSeed: { value: (i * 13.37) % 10 },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

      textureMap.set(proj.id, { texture, material, project: proj });
    });

    let currentProjects: Project[] = ALL_PROJECTS;
    let geometry: THREE.BufferGeometry | null = null;
    let cards: { mesh: THREE.Mesh; baseX: number }[] = [];
    let viewportWidth = 1;
    let viewportHeight = 1;
    let cardWidth = 560;
    let cardHeight = 315;
    let pitch = 640;
    let stripSpan = 1;

    function rebuildStrip() {
      cards.forEach((c) => {
        scene.remove(c.mesh);
        const origMat = textureMap.get(c.mesh.userData?.projId)?.material;
        if (c.mesh.material && c.mesh.material !== origMat) {
          (c.mesh.material as THREE.Material).dispose();
        }
      });
      cards = [];
      if (geometry) geometry.dispose();

      geometry = buildRibbonGeometry(cardWidth, cardHeight, CONFIG.threads, CONFIG.segments);

      const activeSlots = currentProjects.map((p) => textureMap.get(p.id)!).filter(Boolean);
      const count = Math.max(activeSlots.length, 3);
      // Ensure sufficient cards to cover viewport + continuous loop
      const minCardsNeeded = Math.ceil(viewportWidth / pitch) + 4;
      const repeats = Math.max(1, Math.ceil(minCardsNeeded / count));
      const totalCards = count * repeats;
      stripSpan = totalCards * pitch;
      const half = stripSpan / 2;

      for (let i = 0; i < totalCards; i++) {
        const slot = activeSlots[i % activeSlots.length];
        const mesh = new THREE.Mesh(geometry, slot.material);
        mesh.userData = { projId: slot.project.id };
        scene.add(mesh);
        cards.push({ mesh, baseX: i * pitch });
      }

      // Initialize with center card aligned
      motion.offset = -half;
      motion.velocity = 0;
      targetUnitRef.current = 0;
    }

    function resize() {
      if (!stage || !renderer) return;
      viewportWidth = stage.clientWidth;
      viewportHeight = stage.clientHeight;

      renderer.setSize(viewportWidth, viewportHeight);
      camera.left = -viewportWidth / 2;
      camera.right = viewportWidth / 2;
      camera.top = viewportHeight / 2;
      camera.bottom = -viewportHeight / 2;
      camera.updateProjectionMatrix();

      const isMobile = viewportWidth < 768;
      if (isMobile) {
        cardWidth = Math.min(Math.round(viewportWidth * 0.86), 350);
        cardHeight = Math.round(cardWidth / CONFIG.cardAspect);
        const gap = Math.max(16, Math.round(cardWidth * 0.06));
        pitch = cardWidth + gap;

        const centerEdge = cardWidth / 2;
        const sideEdge = pitch - cardWidth / 2;
        const tearStart = (centerEdge + sideEdge) / 2;
        shared.uZone.value = Math.max(26, (viewportWidth / 2) - tearStart);
      } else {
        cardHeight = Math.min(CONFIG.cardMaxHeight, Math.max(260, viewportHeight * 0.72));
        cardWidth = cardHeight * CONFIG.cardAspect; // 16:9
        const gap = Math.max(26, Math.round(cardWidth * CONFIG.cardGapRatio));
        pitch = cardWidth + gap;

        const centerEdge = cardWidth / 2;
        const sideEdge = pitch - cardWidth / 2;
        const tearStart = (centerEdge + sideEdge) / 2;
        shared.uZone.value = Math.max(60, (viewportWidth / 2) - tearStart);
      }

      shared.uHalfWidth.value = viewportWidth / 2;
      shared.uCardSize.value.set(cardWidth, cardHeight);

      rebuildStrip();
    }

    const motion = motionRef.current;
    motion.velocity = 0;

    // Smooth category switcher: Center-card-only animation on Mobile, Full-strip dissolve on Desktop
    switchCategoryRef.current = (newCat: string) => {
      soundManager.playClick();
      if (newCat === activeCategoryRef.current) return;
      activeCategoryRef.current = newCat;
      setActiveCategory(newCat);

      const isMobile = viewportWidth < 768;

      if (isMobile) {
        // MOBILE ONLY: Side cards stay stable, ONLY the center card executes the entrance animation
        currentProjects = newCat === 'ALL'
          ? ALL_PROJECTS
          : ALL_PROJECTS.filter((p) => p.cat === newCat);

        rebuildStrip();
        targetUnitRef.current = 0;
        setCurrentIndex(1);

        // Center card is cards[0] aligned at position.x = 0
        const centerCard = cards[0];
        if (centerCard) {
          // Clone material so only the center card animates
          centerCard.mesh.material = (centerCard.mesh.material as THREE.ShaderMaterial).clone();
          const mat = centerCard.mesh.material as THREE.ShaderMaterial;
          mat.uniforms.uSectionOpacity = { value: 0 };
          mat.uniforms.uStrength = { value: 0 };

          centerCard.mesh.userData.isEntranceTweening = true;
          centerCard.mesh.scale.set(0.86, 0.86, 1);

          gsap.killTweensOf(mat.uniforms.uSectionOpacity);
          gsap.killTweensOf(mat.uniforms.uStrength);
          gsap.killTweensOf(centerCard.mesh.scale);

          // Center card opacity fade in
          gsap.to(mat.uniforms.uSectionOpacity, {
            value: 1,
            duration: 0.35,
            ease: 'power2.out',
          });

          // Center card scale-pop punch
          gsap.to(centerCard.mesh.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 0.50,
            ease: 'back.out(1.5)',
            onComplete: () => {
              if (centerCard.mesh) {
                centerCard.mesh.userData.isEntranceTweening = false;
              }
            },
          });

          // Center card delicate geometric shatter bloom
          gsap.to(mat.uniforms.uStrength, {
            value: 1,
            duration: 1.2,
            delay: 0.05,
            ease: 'power2.out',
          });
        }
      } else {
        // DESKTOP: Smooth cinematic dissolve across the entire strip
        gsap.killTweensOf(shared.uSectionOpacity);
        gsap.killTweensOf(shared.uStrength);

        gsap.to(shared.uSectionOpacity, {
          value: 0,
          duration: 0.22,
          ease: 'power2.in',
          onComplete: () => {
            currentProjects = newCat === 'ALL'
              ? ALL_PROJECTS
              : ALL_PROJECTS.filter((p) => p.cat === newCat);

            rebuildStrip();
            targetUnitRef.current = 0;
            setCurrentIndex(1);

            shared.uStrength.value = 0;
            gsap.to(shared.uSectionOpacity, {
              value: 1,
              duration: 0.38,
              ease: 'power2.out',
            });
            gsap.to(shared.uStrength, {
              value: 1,
              duration: 1.6,
              delay: 0.08,
              ease: 'power2.out',
            });
          },
        });
      }
    };

    // Smooth navigation function attached to ref for button clicks with ZERO stuckness
    slideByRef.current = (dir: number) => {
      soundManager.playClick();
      const half = stripSpan / 2;

      // If neither tweening nor dragging, sync targetUnitRef cleanly with current position
      if (!isTweeningRef.current && !dragging) {
        targetUnitRef.current = Math.round((motion.offset + half) / pitch);
      }

      // Increment / decrement target unit cleanly
      targetUnitRef.current += dir;
      const targetOffset = targetUnitRef.current * pitch - half;

      const total = currentProjects.length;
      if (total > 0) {
        const rawIdx = ((targetUnitRef.current % total) + total) % total;
        setCurrentIndex(rawIdx + 1);
      }

      isTweeningRef.current = true;
      gsap.killTweensOf(motion);
      gsap.to(motion, {
        offset: targetOffset,
        duration: 0.72,
        ease: 'power3.out',
        overwrite: 'auto',
        onComplete: () => {
          isTweeningRef.current = false;
        },
      });
    };

    // Delayed, smooth cinematic bloom: cards start solid and gently, slowly shatter into geometric fragments
    shared.uStrength.value = 0;
    gsap.killTweensOf(shared.uStrength);
    gsap.to(shared.uStrength, {
      value: 1,
      duration: 2.8,
      delay: 0.8,
      ease: 'power2.out',
    });

    let dragging = false;
    let lastX = 0, lastTime = 0, dragVelocity = 0;

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      lastTime = performance.now();
      dragVelocity = 0;
      isTweeningRef.current = false;
      stage.classList.add('cursor-grabbing');
      stage.setPointerCapture(event.pointerId);
      gsap.killTweensOf(motion);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dx = event.clientX - lastX;
      const dt = Math.max(1, now - lastTime) / 1000;
      motion.offset -= dx;
      dragVelocity = -dx / dt;
      lastX = event.clientX;
      lastTime = now;
    };

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove('cursor-grabbing');
      const half = stripSpan / 2;

      const currentUnit = (motion.offset + half) / pitch;
      let targetUnit = Math.round(currentUnit);

      if (Math.abs(dragVelocity) > 260) {
        targetUnit += dragVelocity > 0 ? 1 : -1;
      }
      targetUnitRef.current = targetUnit;

      const targetOffset = targetUnit * pitch - half;
      const total = currentProjects.length;
      if (total > 0) {
        const rawIdx = ((targetUnit % total) + total) % total;
        setCurrentIndex(rawIdx + 1);
      }

      isTweeningRef.current = true;
      gsap.killTweensOf(motion);
      gsap.to(motion, {
        offset: targetOffset,
        duration: 0.75,
        ease: 'power3.out',
        overwrite: 'auto',
        onComplete: () => {
          isTweeningRef.current = false;
        },
      });
    };

    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    stage.addEventListener('lostpointercapture', endDrag);

    const tickerCallback = (time: number, deltaMS: number) => {
      shared.uTime.value = time;

      const isMobile = viewportWidth < 768;
      // On desktop: drift infinitely when not dragging and no button slide active
      if (!isMobile && !dragging && !isTweeningRef.current) {
        motion.offset += CONFIG.scrollSpeed * (deltaMS / 1000);
      }

      const half = stripSpan / 2;
      for (const card of cards) {
        const x = ((card.baseX - motion.offset) % stripSpan + stripSpan) % stripSpan;
        card.mesh.position.x = x - half;

        if (isMobile) {
          if (!card.mesh.userData?.isEntranceTweening) {
            const dist = Math.abs(card.mesh.position.x);
            // Center card is full scale (1.0); cards toward the edges scale down slightly to ~0.90
            const s = Math.max(0.90, 1.0 - (dist / pitch) * 0.10);
            card.mesh.scale.set(s, s, 1);
          }
        }
      }

      renderer?.render(scene, camera);
    };

    gsap.ticker.add(tickerCallback);

    window.addEventListener('resize', resize);
    resize();

    // Keyboard navigation (Left / Right arrow keys)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        slideByRef.current(1);
      } else if (e.key === 'ArrowLeft') {
        slideByRef.current(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyDown);
      stage.removeEventListener('pointerdown', onPointerDown);
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerup', endDrag);
      stage.removeEventListener('pointercancel', endDrag);
      stage.removeEventListener('lostpointercapture', endDrag);

      gsap.ticker.remove(tickerCallback);

      cards.forEach((c) => scene.remove(c.mesh));
      if (geometry) geometry.dispose();
      textureMap.forEach((s) => {
        s.texture.dispose();
        s.material.dispose();
      });
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement.parentNode === stage) {
          stage.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="work"
      className="relative bg-white text-[#0A1F44] pt-8 sm:pt-14 md:pt-22 pb-12 sm:pb-16 md:pb-24 overflow-hidden select-none"
    >
      {/* ── DIAGONAL BLUE GRADIENT BAND (Top-Left to Bottom-Right) ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 40px, black 240px)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 40px, black 240px)',
        }}
      >
        {/* Soft atmospheric cloud texture rotated along the diagonal */}
        <div
          className="absolute -top-[50%] -left-[35%] w-[170%] h-[200%] pointer-events-none"
          style={{
            backgroundImage: 'url(/works-carousel-bg.png)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            transform: 'rotate(25deg)',
            opacity: 0.70,
            filter: 'blur(10px)',
          }}
        />

        {/* Thick luminous diagonal gradient beam (Direction: Top-Left to Bottom-Right) */}
        <div
          className="absolute -top-[55%] -left-[35%] w-[170%] h-[210%] pointer-events-none"
          style={{
            transform: 'rotate(25deg)',
            background:
              'linear-gradient(180deg, transparent 0%, transparent 33%, rgba(30, 144, 255, 0.08) 39%, rgba(30, 144, 255, 0.35) 44%, rgba(30, 144, 255, 0.75) 50%, rgba(30, 144, 255, 0.35) 56%, rgba(30, 144, 255, 0.08) 61%, transparent 67%, transparent 100%)',
            filter: 'blur(35px)',
          }}
        />

        {/* Intense core watercolor wash through the diagonal axis */}
        <div
          className="absolute top-1/2 left-1/2 w-[160%] h-[360px] pointer-events-none"
          style={{
            transform: 'translate(-50%, -50%) rotate(25deg)',
            background:
              'radial-gradient(ellipse 75% 55% at 50% 50%, rgba(30, 144, 255, 0.65) 0%, rgba(56, 163, 255, 0.40) 45%, rgba(30, 144, 255, 0.08) 75%, transparent 100%)',
            filter: 'blur(45px)',
          }}
        />
      </div>

      {/* Ultra-smooth blending border: dissolves seamlessly from Intro's 100% white ground into Works */}
      <div
        className="absolute top-0 left-0 right-0 h-40 sm:h-52 lg:h-64 pointer-events-none z-[1]"
        style={{
          background:
            'linear-gradient(to bottom, #FFFFFF 0%, #FFFFFF 20%, rgba(255, 255, 255, 0.88) 45%, rgba(255, 255, 255, 0.45) 75%, transparent 100%)',
        }}
      />

      {/* ── TOP-RIGHT WHITISH VEIL (Keeps the area to the right of SELECTED WORKS clean & whitish on mobile & desktop) ── */}
      <div
        className="absolute top-0 right-0 w-full sm:w-[80%] lg:w-[65%] h-[380px] sm:h-[440px] pointer-events-none z-[1]"
        style={{
          background:
            'radial-gradient(ellipse 95% 90% at 100% 0%, #FFFFFF 0%, #FFFFFF 55%, rgba(255, 255, 255, 0.95) 72%, rgba(255, 255, 255, 0.45) 88%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 40px, black 200px)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 40px, black 200px)',
        }}
      />

      <div className="w-full relative z-10">
        
        {/* ── DESKTOP HEADER (lg and up): ASYMMETRICAL EDITORIAL LAYOUT ── */}
        {/* Left: SELECTED WORKS | Right: 3-Line Paragraph + Category Filter Capsule (Aligned to Top & Flush Right) */}
        <div className="hidden lg:flex w-full max-w-[1440px] mx-auto px-8 md:px-12 items-stretch justify-between select-none">
          {/* LEFT SIDE: SELECTED WORKS */}
          <div className="flex flex-col items-start text-left">
            <h2
              className="text-[5.5vw] xl:text-[5.2vw] leading-[0.96] uppercase text-[#0A1F44] font-bold tracking-[-0.03em]"
              style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
            >
              SELECTED
            </h2>
            <h2
              className="text-[5.5vw] xl:text-[5.2vw] leading-[0.96] uppercase text-[#0A1F44] font-bold tracking-[-0.03em] mt-1"
              style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
            >
              WORKS
            </h2>
          </div>

          {/* RIGHT SIDE: 3-LINE EDITORIAL PARAGRAPH + FILTER CAPSULE FLUSH RIGHT (Aligned to WORKS level) */}
          <div className="flex flex-col items-end justify-between self-stretch text-right pt-1 pb-1">
            <p className="text-[10px] xl:text-[10.5px] font-mono font-medium tracking-[0.06em] text-[#0A1F44]/75 uppercase leading-[1.5] max-w-sm select-none">
              IDEAS SHAPED INTO EXPERIENCES.<br />
              A SELECTION OF WORK DRIVEN BY DETAIL,<br />
              INTENT AND VISUAL CLARITY.
            </p>

            {/* Compact Filter Row Aligned to WORKS text level with Circular Arrow Buttons */}
            <div className="flex items-center justify-end gap-1.5 sm:gap-2">
              {/* Left Arrow Button */}
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  desktopFilterScrollRef.current?.scrollBy({ left: -115, behavior: 'smooth' });
                }}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-white text-[#0A1F44] border border-[#0A1F44]/15 shadow-[0_2px_0_rgba(10,31,68,0.12),0_4px_8px_rgba(10,31,68,0.06)] -translate-y-[0.5px] active:translate-y-[1px] active:shadow-[0_0.5px_0_rgba(10,31,68,0.12)] flex items-center justify-center text-xs font-mono font-bold transition-all duration-150 cursor-pointer select-none"
                aria-label="Scroll filter left"
              >
                ←
              </button>

              {/* Compact Curved Outer Capsule Container (Fits exactly 4 categories at a time) */}
              <div className="w-[342px] xl:w-[354px] overflow-hidden rounded-full border border-white/80 bg-white/95 backdrop-blur-md shadow-[0_3px_16px_rgba(10,31,68,0.06)] p-1">
                <div
                  ref={desktopFilterScrollRef}
                  className="overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1 rounded-full py-0.5 px-0.5"
                >
                  {CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.key;
                    return (
                      <button
                        key={cat.key}
                        onClick={() => {
                          switchCategoryRef.current(cat.key);
                        }}
                        onMouseEnter={() => soundManager.playHover()}
                        className={`relative flex-shrink-0 min-h-[30px] px-3.5 xl:px-4 py-1 text-[11px] font-mono font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer select-none rounded-full flex items-center justify-center ${
                          isActive
                            ? 'bg-[#0A1F44] text-white shadow-[0_2.5px_0_#000000,0_5px_10px_rgba(10,31,68,0.35)] -translate-y-[1px]'
                            : 'text-[#0A1F44]/65 hover:text-[#0A1F44] hover:bg-[#0A1F44]/5 font-medium'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Arrow Button */}
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  desktopFilterScrollRef.current?.scrollBy({ left: 115, behavior: 'smooth' });
                }}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-white text-[#0A1F44] border border-[#0A1F44]/15 shadow-[0_2px_0_rgba(10,31,68,0.12),0_4px_8px_rgba(10,31,68,0.06)] -translate-y-[0.5px] active:translate-y-[1px] active:shadow-[0_0.5px_0_rgba(10,31,68,0.12)] flex items-center justify-center text-xs font-mono font-bold transition-all duration-150 cursor-pointer select-none"
                aria-label="Scroll filter right"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* ── MOBILE HEADER (< lg): STACKED WITH CENTERED FILTER & CIRCULAR ARROWS ── */}
        <div className="lg:hidden w-full flex flex-col">
          {/* Heading & paragraph */}
          <div className="w-full px-6 sm:px-8 flex flex-col items-start text-left select-none">
            <h2
              className="text-[13vw] sm:text-[9.5vw] leading-[0.96] uppercase text-[#0A1F44] font-bold tracking-[-0.03em]"
              style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
            >
              SELECTED
            </h2>
            <h2
              className="text-[13vw] sm:text-[9.5vw] leading-[0.96] uppercase text-[#0A1F44] font-bold tracking-[-0.03em] mt-1 sm:mt-1.5"
              style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
            >
              WORKS
            </h2>

            <p className="text-[10px] sm:text-[11px] font-mono font-medium tracking-[0.06em] text-[#0A1F44]/75 uppercase text-left leading-[1.6] mt-5 sm:mt-6 max-w-sm select-none">
              IDEAS SHAPED INTO EXPERIENCES.<br />
              A SELECTION OF WORK DRIVEN BY DETAIL,<br />
              INTENT AND VISUAL CLARITY.
            </p>
          </div>

          {/* Filter Row with circular arrows & horizontal scrollable capsule */}
          <div className="w-full px-4 sm:px-8 mt-6 sm:mt-7 flex items-center justify-center gap-2 sm:gap-3">
            {/* Left Arrow Button (White Circular Keycap) */}
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                filterScrollRef.current?.scrollBy({ left: -140, behavior: 'smooth' });
              }}
              className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#0A1F44] border border-[#0A1F44]/15 shadow-[0_2.5px_0_rgba(10,31,68,0.12),0_4px_10px_rgba(10,31,68,0.06)] -translate-y-[1px] active:translate-y-[1px] active:shadow-[0_0.5px_0_rgba(10,31,68,0.12)] flex items-center justify-center text-xs sm:text-sm font-mono font-bold transition-all duration-150 cursor-pointer select-none"
              aria-label="Scroll filter left"
            >
              ←
            </button>

            {/* Permanently Curved Outer Capsule Container */}
            <div className="max-w-[calc(100vw-110px)] sm:max-w-max overflow-hidden rounded-full border border-white/80 bg-white/95 backdrop-blur-md shadow-[0_4px_20px_rgba(10,31,68,0.06)] p-1 sm:p-1.5">
              <div
                ref={filterScrollRef}
                className="overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1.5 rounded-full py-0.5 px-1"
              >
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={(e) => {
                        switchCategoryRef.current(cat.key);
                        e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                      }}
                      onMouseEnter={() => soundManager.playHover()}
                      className={`relative flex-shrink-0 min-h-[34px] sm:min-h-[38px] px-4 sm:px-6 py-1.5 sm:py-2 text-[11px] sm:text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer select-none rounded-full flex items-center justify-center ${
                        isActive
                          ? 'bg-[#0A1F44] text-white shadow-[0_3.5px_0_#000000,0_7px_14px_rgba(10,31,68,0.35)] -translate-y-[1px]'
                          : 'text-[#0A1F44]/65 hover:text-[#0A1F44] hover:bg-[#0A1F44]/5 font-medium'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Arrow Button (White Circular Keycap) */}
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                filterScrollRef.current?.scrollBy({ left: 140, behavior: 'smooth' });
              }}
              className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#0A1F44] border border-[#0A1F44]/15 shadow-[0_2.5px_0_rgba(10,31,68,0.12),0_4px_10px_rgba(10,31,68,0.06)] -translate-y-[1px] active:translate-y-[1px] active:shadow-[0_0.5px_0_rgba(10,31,68,0.12)] flex items-center justify-center text-xs sm:text-sm font-mono font-bold transition-all duration-150 cursor-pointer select-none"
              aria-label="Scroll filter right"
            >
              →
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            ORIGO GEOMETRIC UNWOVEN LOOM (Cards Carousel)
            - 1 Card centered 100% solid & full
            - 2 Side cards peeking
        ══════════════════════════════════════════════ */}
        <div className="relative w-full overflow-hidden mt-4 sm:mt-6 md:mt-8 mb-3 sm:mb-5 md:mb-6">
          <div
            ref={stageRef}
            className="relative z-10 w-full h-[255px] sm:h-[330px] md:h-[420px] cursor-grab touch-pan-y"
            style={{ willChange: 'transform' }}
          />
        </div>

        {/* ── CENTERED INTERACTIVE PREV & NEXT NAVIGATION BUTTONS (BLACK KEYBOARD KEYCAPS WITH < > CHEVRONS) ── */}
        <div className="relative z-20 mx-auto px-4 mt-5 sm:mt-7 flex items-center justify-center gap-3.5 sm:gap-4 select-none">
          <button
            type="button"
            onClick={() => slideByRef.current(-1)}
            onMouseEnter={() => soundManager.playHover()}
            className="group relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#0A1F44] text-white border-t border-white/25 border-x border-[#0A1F44] border-b border-[#0A1F44] shadow-[0_3.5px_0_#000000,0_7px_14px_rgba(10,31,68,0.35)] -translate-y-[1px] hover:-translate-y-[2px] hover:shadow-[0_4.5px_0_#000000,0_9px_18px_rgba(10,31,68,0.45)] active:translate-y-[2px] active:shadow-[0_0.5px_0_#000000,0_2px_4px_rgba(10,31,68,0.25)] transition-all duration-150 flex items-center justify-center cursor-pointer select-none"
            aria-label="Previous Project"
          >
            <svg
              className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-200 ease-out group-hover:-translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.8}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => slideByRef.current(1)}
            onMouseEnter={() => soundManager.playHover()}
            className="group relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#0A1F44] text-white border-t border-white/25 border-x border-[#0A1F44] border-b border-[#0A1F44] shadow-[0_3.5px_0_#000000,0_7px_14px_rgba(10,31,68,0.35)] -translate-y-[1px] hover:-translate-y-[2px] hover:shadow-[0_4.5px_0_#000000,0_9px_18px_rgba(10,31,68,0.45)] active:translate-y-[2px] active:shadow-[0_0.5px_0_#000000,0_2px_4px_rgba(10,31,68,0.25)] transition-all duration-150 flex items-center justify-center cursor-pointer select-none"
            aria-label="Next Project"
          >
            <svg
              className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.8}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

      </div>

      {/* Bottom Atmospheric Dissolve: Sky smoothly dissolving into ImmersiveCarousel (#1E90FF) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 md:h-40 pointer-events-none z-[1]"
        style={{
          background: 'linear-gradient(to bottom, rgba(30, 144, 255, 0) 0%, rgba(30, 144, 255, 0.20) 35%, rgba(30, 144, 255, 0.65) 75%, #1E90FF 100%)',
        }}
      />
    </section>
  );
}
