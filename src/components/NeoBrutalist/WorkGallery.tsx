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
  'ALL',
  'AUTOMOTIVE EXPERIENCES',
  'EXHIBITIONS & BRAND EXPERIENCES',
  'EVENTS & ACTIVATIONS',
  'SHOWROOM DESIGN',
  'SOCIAL MEDIA & CONTENT',
  'PRINT & OOH',
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
    float alpha = cardAlpha * geometryAlpha * fade;
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

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'ALL') return ALL_PROJECTS;
    return ALL_PROJECTS.filter((p) => p.cat === activeCategory);
  }, [activeCategory]);

  const motionRef = useRef({ velocity: 36, offset: 0 });

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
      cardRadius: 14,
      scrollSpeed: 36,    // Calm, luxurious auto-drift
      flingMax: 2600,
      tearZoneRatio: 0.20,
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
    };

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('');

    const slots = filteredProjects.map((proj, i) => {
      // Direct TextureLoader for local images with SRGBColorSpace
      const texture = textureLoader.load(
        proj.img,
        (loadedTex) => {
          loadedTex.colorSpace = THREE.SRGBColorSpace;
          loadedTex.minFilter = THREE.LinearFilter;
          loadedTex.magFilter = THREE.LinearFilter;
          loadedTex.wrapS = loadedTex.wrapT = THREE.ClampToEdgeWrapping;
          loadedTex.needsUpdate = true;
          if (loadedTex.image && loadedTex.image.naturalWidth) {
            material.uniforms.uImageAspect.value = loadedTex.image.naturalWidth / loadedTex.image.naturalHeight;
          }
        }
      );
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.generateMipmaps = false;

      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uMap: { value: texture },
          uSeed: { value: (i + 1) * 0.731 },
          uImageAspect: { value: 16 / 9 },
          uTime: shared.uTime,
          uHalfWidth: shared.uHalfWidth,
          uZone: shared.uZone,
          uStrength: shared.uStrength,
          uWobble: shared.uWobble,
          uCardSize: shared.uCardSize,
          uRadius: shared.uRadius,
          uBgColor: shared.uBgColor,
        },
      });

      // Same-origin Image loader (no crossOrigin header) ensures local files always render
      const img = new Image();
      img.onload = () => {
        texture.image = img;
        texture.needsUpdate = true;
        if (img.naturalWidth && img.naturalHeight) {
          material.uniforms.uImageAspect.value = img.naturalWidth / img.naturalHeight;
        }
      };
      img.src = proj.img;
      if (img.complete && img.naturalWidth > 0) {
        texture.image = img;
        texture.needsUpdate = true;
        material.uniforms.uImageAspect.value = img.naturalWidth / img.naturalHeight;
      }

      return { texture, material };
    });

    const cards: { mesh: THREE.Mesh; baseX: number }[] = [];
    let geometry: THREE.BufferGeometry | null = null;
    let cardWidth = 0, cardHeight = 0, pitch = 0, stripSpan = 0;
    let viewportWidth = 0, viewportHeight = 0;

    function rebuildStrip() {
      cards.forEach((card) => scene.remove(card.mesh));
      cards.length = 0;
      if (geometry) geometry.dispose();

      geometry = buildRibbonGeometry(cardWidth, cardHeight, CONFIG.threads, CONFIG.segments);

      const count = Math.max(8, Math.ceil((viewportWidth + pitch * 3) / pitch));
      stripSpan = count * pitch;

      for (let i = 0; i < count; i++) {
        const slotIdx = i % slots.length;
        const mesh = new THREE.Mesh(geometry, slots[slotIdx].material);
        mesh.frustumCulled = false;
        scene.add(mesh);
        cards.push({ mesh, baseX: i * pitch });
      }
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
      cardHeight = isMobile
        ? Math.min(210, viewportHeight * 0.65)
        : Math.min(CONFIG.cardMaxHeight, viewportHeight * 0.72);
      cardWidth = cardHeight * CONFIG.cardAspect; // 16:9
      pitch = cardWidth + Math.max(isMobile ? 14 : 26, cardWidth * CONFIG.cardGapRatio);

      shared.uHalfWidth.value = viewportWidth / 2;
      shared.uZone.value = Math.min(viewportWidth * CONFIG.tearZoneRatio, CONFIG.tearZoneMax);
      shared.uCardSize.value.set(cardWidth, cardHeight);

      rebuildStrip();
    }

    const baseSpeed = CONFIG.scrollSpeed;
    const motion = motionRef.current;
    motion.velocity = baseSpeed;

    gsap.to(shared.uStrength, { value: 1, duration: 1.5, ease: 'power3.inOut', delay: 0.2 });

    let dragging = false;
    let lastX = 0, lastTime = 0, dragVelocity = 0;

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      lastTime = performance.now();
      dragVelocity = 0;
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
      dragVelocity += (-dx / dt - dragVelocity) * 0.35;
      lastX = event.clientX;
      lastTime = now;
    };

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove('cursor-grabbing');
      motion.velocity = gsap.utils.clamp(-CONFIG.flingMax, CONFIG.flingMax, dragVelocity);
      gsap.to(motion, { velocity: baseSpeed, duration: 2.2, ease: 'power3.out' });
    };

    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    stage.addEventListener('lostpointercapture', endDrag);

    const tickerCallback = (time: number, deltaMS: number) => {
      if (!dragging) {
        motion.offset += motion.velocity * (deltaMS / 1000);
      }
      shared.uTime.value = time;

      const half = stripSpan / 2;
      for (const card of cards) {
        const x = ((card.baseX - motion.offset) % stripSpan + stripSpan) % stripSpan;
        card.mesh.position.x = x - half;
      }

      renderer?.render(scene, camera);
    };

    gsap.ticker.add(tickerCallback);

    window.addEventListener('resize', resize);
    resize();

    return () => {
      window.removeEventListener('resize', resize);
      stage.removeEventListener('pointerdown', onPointerDown);
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerup', endDrag);
      stage.removeEventListener('pointercancel', endDrag);
      stage.removeEventListener('lostpointercapture', endDrag);

      gsap.ticker.remove(tickerCallback);

      cards.forEach((c) => scene.remove(c.mesh));
      if (geometry) geometry.dispose();
      slots.forEach((s) => {
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
  }, [filteredProjects]);

  return (
    <section
      ref={sectionRef}
      id="work"
      className="relative bg-[#EAF2FC] text-black pt-16 md:pt-24 pb-16 md:pb-24 overflow-hidden select-none"
    >
      {/* Attached Panoramic Sky Background Image */}
      <div
        className="absolute inset-0 pointer-events-none z-0 bg-cover bg-top"
        style={{
          backgroundImage: 'url(/works-carousel-bg.png)',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Top Atmospheric Dissolve: Wide whitish-blue blend spreading from Intro down through Works heading */}
      <div
        className="absolute top-0 left-0 right-0 h-64 sm:h-80 md:h-[460px] lg:h-[540px] pointer-events-none z-[1]"
        style={{
          background:
            'linear-gradient(to bottom, #EAF2FC 0%, rgba(234, 242, 252, 0.96) 20%, rgba(234, 242, 252, 0.70) 50%, rgba(234, 242, 252, 0.25) 78%, rgba(234, 242, 252, 0) 100%)',
        }}
      />

      <div className="w-full relative z-10">
        
        {/* Brutalist Section Header — Blending begins right here */}
        <div className="mb-10 md:mb-14 flex flex-col items-center text-center px-4">
          <h2 className="text-[12vw] leading-[0.8] font-heading font-black z-10 text-black tracking-tight">
            SELECTED
          </h2>
          <h2
            className="text-[12vw] leading-[0.8] font-heading font-black text-transparent z-10 -mt-3 md:-mt-8 tracking-tight"
            style={{ WebkitTextStroke: '2px #000' }}
          >
            WORKS
          </h2>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-10 px-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundManager.playClick();
                setActiveCategory(cat);
              }}
              onMouseEnter={() => soundManager.playHover()}
              className={`min-h-[38px] px-3.5 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs font-mono uppercase tracking-wider transition-all duration-300 border cursor-pointer ${
                activeCategory === cat
                  ? 'bg-black text-white border-black font-bold shadow-md'
                  : 'bg-transparent text-black/75 border-black/25 hover:border-black hover:text-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════
            ORIGO GEOMETRIC UNWOVEN LOOM (Cards Carousel)
        ══════════════════════════════════════════════ */}
        <div className="relative w-full overflow-hidden my-4 py-8 sm:py-12 md:py-14">
          <div
            ref={stageRef}
            className="relative z-10 w-full h-[260px] sm:h-[340px] md:h-[420px] cursor-grab touch-pan-y"
            style={{ willChange: 'transform' }}
          />
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
