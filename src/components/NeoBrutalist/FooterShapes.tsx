'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { soundManager } from '@/lib/sound';

/* ─────────────────────────────────────────────────────────────
   Custom Extruded Geometric Shapes:
   - 1. Hollow Rounded Rectangle / Square Frame
   - 2. Hollow Rounded Triangle Frame
   - 3. Hollow Circular Ring
────────────────────────────────────────────────────────────── */

function createShapeGeometries(): Record<string, THREE.BufferGeometry> {
  // 1. Hollow Square / Rectangle Frame with rounded corners & sleek thickness
  const makeRectangle = () => {
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
      bevelSegments: 8,
      curveSegments: 24,
    });
    g.center();
    g.computeVertexNormals();
    return g;
  };

  // 2. Hollow Triangle Frame with rounded corners & sleek thickness
  const makeTriangle = () => {
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
      bevelSegments: 8,
      curveSegments: 24,
    });
    g.center();
    g.computeVertexNormals();
    return g;
  };

  // 3. Hollow Circle / Ring with sleek volumetric profile
  const makeCircle = () => {
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
      bevelSegments: 8,
      curveSegments: 48,
    });
    g.center();
    g.computeVertexNormals();
    return g;
  };

  return {
    rectangle: makeRectangle(),
    triangle: makeTriangle(),
    circle: makeCircle(),
  };
}

/* ─────────────────────────────────────────────────────────────
   Ballpit Physics Simulation Engine (Adapted from React Bits)
   - Pairwise elastic collision detection
   - Cursor collider repulsion (controlSphere0)
   - Wall bounce boundary containment (maxX, maxY, maxZ)
   - Real-time tumbling angular velocity
   - Gentle center attraction spring
────────────────────────────────────────────────────────────── */

interface BallpitConfig {
  count: number;
  gravity: number;
  friction: number;
  wallBounce: number;
  maxVelocity: number;
  maxX: number;
  maxY: number;
  maxZ: number;
  controlSphere0: boolean;
  size0: number;
}

const tmpF = new THREE.Vector3();
const tmpI = new THREE.Vector3();
const tmpO = new THREE.Vector3();
const tmpV = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const tmpN = new THREE.Vector3();
const tmpDiff = new THREE.Vector3();
const tmpJ = new THREE.Vector3();
const tmpH = new THREE.Vector3();
const tmpT = new THREE.Vector3();

class BallpitPhysics {
  config: BallpitConfig;
  positionData: Float32Array;
  velocityData: Float32Array;
  sizeData: Float32Array;
  rotationData: Float32Array;
  angularVelData: Float32Array;
  center = new THREE.Vector3();
  homeCenter = new THREE.Vector3(0, 0, 0);

  constructor(config: BallpitConfig, isMobile: boolean) {
    this.config = config;
    const count = config.count;
    this.positionData = new Float32Array(3 * count).fill(0);
    this.velocityData = new Float32Array(3 * count).fill(0);
    this.sizeData = new Float32Array(count).fill(1);
    this.rotationData = new Float32Array(3 * count).fill(0);
    this.angularVelData = new Float32Array(3 * count).fill(0);
    this.initPositions(isMobile);
  }

  initPositions(isMobile: boolean) {
    const { config, positionData, sizeData, rotationData, angularVelData } = this;
    const count = config.count;

    // Cursor sphere at index 0
    sizeData[0] = config.size0;
    this.center.toArray(positionData, 0);

    const H = isMobile ? 1.4 : 1.8;
    const W = isMobile ? 1.3 : 2.2;
    const D = 0.8;

    for (let i = 1; i < count; i++) {
      const idx = 3 * i;
      // Size distribution: large hero, medium, small accent
      const sizeType = Math.random();
      let scale = 0.28;
      if (sizeType < 0.25) {
        scale = isMobile ? 0.38 : 0.46; // large
      } else if (sizeType < 0.70) {
        scale = isMobile ? 0.26 : 0.32; // medium
      } else {
        scale = isMobile ? 0.17 : 0.20; // small
      }
      sizeData[i] = scale * 1.35; // collision radius

      // Organic distributed spread in 3D footer volume
      const u = (i / count) * Math.PI * 2;
      const spreadX = Math.sin(2 * u) * W + (Math.random() - 0.5) * 1.2;
      const spreadY = Math.sin(u) * H + (Math.random() - 0.5) * 0.9;
      const spreadZ = Math.cos(u) * D + (Math.random() - 0.5) * 0.6;

      positionData[idx] = spreadX;
      positionData[idx + 1] = spreadY;
      positionData[idx + 2] = spreadZ;

      // Random initial rotations & tumbling rates
      rotationData[idx] = Math.random() * Math.PI * 2;
      rotationData[idx + 1] = Math.random() * Math.PI * 2;
      rotationData[idx + 2] = Math.random() * Math.PI * 2;

      angularVelData[idx] = (Math.random() - 0.5) * 0.8;
      angularVelData[idx + 1] = (Math.random() - 0.5) * 0.8;
      angularVelData[idx + 2] = (Math.random() - 0.5) * 0.8;
    }
  }

  applyImpulseAt(point: THREE.Vector3, strength = 0.24, radius = 3.8) {
    const { count } = this.config;
    for (let i = 1; i < count; i++) {
      const base = 3 * i;
      tmpI.fromArray(this.positionData, base);
      tmpB.fromArray(this.velocityData, base);

      tmpDiff.copy(tmpI).sub(point);
      const dist = tmpDiff.length();
      if (dist < radius && dist > 0.001) {
        const force = (1 - dist / radius) * strength;
        tmpDiff.normalize().multiplyScalar(force);
        tmpB.add(tmpDiff);
        tmpB.clampLength(0, this.config.maxVelocity * 1.5);
        tmpB.toArray(this.velocityData, base);

        // Impart tumble spin
        this.angularVelData[base] += (Math.random() - 0.5) * 2.5;
        this.angularVelData[base + 1] += (Math.random() - 0.5) * 2.5;
        this.angularVelData[base + 2] += (Math.random() - 0.5) * 2.5;
      }
    }
  }

  update(delta: number) {
    const { config, center, positionData, sizeData, velocityData, rotationData, angularVelData } = this;
    const count = config.count;

    // 1. Follow cursor / touch collider at index 0
    if (config.controlSphere0) {
      tmpF.fromArray(positionData, 0);
      tmpF.lerp(center, 0.18).toArray(positionData, 0);
      tmpV.set(0, 0, 0).toArray(velocityData, 0);
    }

    // 2. Velocity update with floating center spring, friction, & clamp
    const dt = Math.min(delta, 0.04);
    for (let i = 1; i < count; i++) {
      const base = 3 * i;
      tmpI.fromArray(positionData, base);
      tmpB.fromArray(velocityData, base);

      // Gentle centering spring keeps shapes organically afloat in footer
      const springForce = 0.0028;
      tmpB.x += (this.homeCenter.x - tmpI.x) * springForce;
      tmpB.y += (this.homeCenter.y - tmpI.y) * springForce;
      tmpB.z += (this.homeCenter.z - tmpI.z) * springForce * 1.2;

      // Gravity (0 for zero-g floating)
      if (config.gravity !== 0) {
        tmpB.y -= dt * config.gravity * sizeData[i];
      }

      tmpB.multiplyScalar(config.friction);
      tmpB.clampLength(0, config.maxVelocity);

      tmpI.add(tmpB);
      tmpI.toArray(positionData, base);
      tmpB.toArray(velocityData, base);

      // Rotation tumble updated with velocity damping
      rotationData[base] += angularVelData[base] * dt;
      rotationData[base + 1] += angularVelData[base + 1] * dt;
      rotationData[base + 2] += angularVelData[base + 2] * dt;

      angularVelData[base] *= 0.992;
      angularVelData[base + 1] *= 0.992;
      angularVelData[base + 2] *= 0.992;
    }

    // 3. Pairwise elastic collisions (Ballpit physics core)
    for (let i = 1; i < count; i++) {
      const base = 3 * i;
      tmpI.fromArray(positionData, base);
      tmpB.fromArray(velocityData, base);
      const radius = sizeData[i];

      for (let j = i + 1; j < count; j++) {
        const otherBase = 3 * j;
        tmpO.fromArray(positionData, otherBase);
        tmpN.fromArray(velocityData, otherBase);
        const otherRadius = sizeData[j];

        tmpDiff.copy(tmpO).sub(tmpI);
        const dist = tmpDiff.length();
        const sumRadius = radius + otherRadius;

        if (dist < sumRadius && dist > 0.0001) {
          const overlap = sumRadius - dist;
          tmpJ.copy(tmpDiff).normalize().multiplyScalar(0.5 * overlap);
          tmpH.copy(tmpJ).multiplyScalar(Math.max(tmpB.length(), 0.85));
          tmpT.copy(tmpJ).multiplyScalar(Math.max(tmpN.length(), 0.85));

          tmpI.sub(tmpJ);
          tmpB.sub(tmpH);
          tmpI.toArray(positionData, base);
          tmpB.toArray(velocityData, base);

          tmpO.add(tmpJ);
          tmpN.add(tmpT);
          tmpO.toArray(positionData, otherBase);
          tmpN.toArray(velocityData, otherBase);

          // Tumble spin exchange on collision
          angularVelData[base] += (Math.random() - 0.5) * 0.4;
          angularVelData[otherBase] += (Math.random() - 0.5) * 0.4;
        }
      }

      // 4. Cursor / Touch collider repulsion (Plow-through effect)
      if (config.controlSphere0) {
        tmpDiff.copy(tmpF).sub(tmpI);
        const dist = tmpDiff.length();
        const sumRadius0 = radius + sizeData[0];

        if (dist < sumRadius0 && dist > 0.0001) {
          const diff = sumRadius0 - dist;
          tmpJ.copy(tmpDiff.normalize()).multiplyScalar(diff);
          tmpH.copy(tmpJ).multiplyScalar(Math.max(tmpB.length(), 1.8));

          tmpI.sub(tmpJ);
          tmpB.sub(tmpH);

          // Rapid tumble kick when plowed by cursor
          angularVelData[base] += (Math.random() - 0.5) * 2.2;
          angularVelData[base + 1] += (Math.random() - 0.5) * 2.2;
        }
      }

      // 5. Boundary wall bounce containment (maxX, maxY, maxZ)
      if (Math.abs(tmpI.x) + radius > config.maxX) {
        tmpI.x = Math.sign(tmpI.x) * (config.maxX - radius);
        tmpB.x = -tmpB.x * config.wallBounce;
      }
      if (Math.abs(tmpI.y) + radius > config.maxY) {
        tmpI.y = Math.sign(tmpI.y) * (config.maxY - radius);
        tmpB.y = -tmpB.y * config.wallBounce;
      }
      if (Math.abs(tmpI.z) + radius > config.maxZ) {
        tmpI.z = Math.sign(tmpI.z) * (config.maxZ - radius);
        tmpB.z = -tmpB.z * config.wallBounce;
      }

      tmpI.toArray(positionData, base);
      tmpB.toArray(velocityData, base);
    }
  }
}

/* ─────────────────────────────────────────────────────────────
   Main Footer 3D Component with Ballpit Physics + Custom Shapes
────────────────────────────────────────────────────────────── */

export default function FooterShapes() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 22 : 36;

    // 1. Renderer Setup with high-performance ACES tone mapping
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // 2. Camera & Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 8.8);
    camera.lookAt(0, 0, 0);

    // 3. Environment Map (Studio room environment for liquid obsidian reflections)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTexture = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.95);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.6);
    dirLight1.position.set(3, 5, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x93c5fd, 1.6);
    dirLight2.position.set(-4, -2, 3);
    scene.add(dirLight2);

    // 5. Shared Material: Glossy dark obsidian chrome
    const shapeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x141923,
      roughness: 0.07,
      metalness: 0.88,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      envMap: envTexture,
      envMapIntensity: 2.8,
    });

    // 6. Geometries
    const geometries = createShapeGeometries();
    const shapeTypes = ['rectangle', 'triangle', 'circle'];

    // 7. Physics Config & Engine
    const config: BallpitConfig = {
      count,
      gravity: 0,
      friction: 0.985,
      wallBounce: 0.90,
      maxVelocity: 0.20,
      maxX: 4.8,
      maxY: 2.8,
      maxZ: 1.6,
      controlSphere0: false,
      size0: isMobile ? 1.4 : 1.75,
    };

    const physics = new BallpitPhysics(config, isMobile);

    // 8. Mesh Creation: Our custom geometric shapes!
    const meshes: THREE.Mesh[] = [];
    for (let i = 1; i < count; i++) {
      const type = shapeTypes[i % shapeTypes.length];
      const mesh = new THREE.Mesh(geometries[type], shapeMaterial);
      const scale = physics.sizeData[i] / 1.35;
      mesh.scale.setScalar(scale);
      scene.add(mesh);
      meshes.push(mesh);
    }

    // 9. Resize & Viewport Boundary Updates
    const updateDimensions = () => {
      const width = container.offsetWidth || window.innerWidth;
      const height = container.offsetHeight || 500;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      // World size at z = 0
      const vFOV = (camera.fov * Math.PI) / 180;
      const wHeight = 2 * Math.tan(vFOV / 2) * camera.position.z;
      const wWidth = wHeight * camera.aspect;

      config.maxX = (wWidth / 2) * 0.94;
      config.maxY = (wHeight / 2) * 0.92;
      config.maxZ = 1.8;
    };
    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);

    // 10. Pointer & Touch Interaction (Ballpit's Raycaster System)
    const raycaster = new THREE.Raycaster();
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersectPos = new THREE.Vector3();
    const pointerPos = new THREE.Vector2();

    const updatePointerWorld = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      pointerPos.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerPos.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointerPos, camera);
      raycaster.ray.intersectPlane(planeZ, intersectPos);

      physics.center.copy(intersectPos);
      config.controlSphere0 = true;
    };

    const onPointerMove = (e: PointerEvent) => {
      updatePointerWorld(e.clientX, e.clientY);
    };

    const onPointerLeave = () => {
      config.controlSphere0 = false;
    };

    const onClick = (e: MouseEvent) => {
      updatePointerWorld(e.clientX, e.clientY);
      physics.applyImpulseAt(intersectPos, 0.28, 4.5);
      soundManager.playClick();
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updatePointerWorld(touch.clientX, touch.clientY);
        physics.applyImpulseAt(intersectPos, 0.22, 3.8);
        soundManager.playClick();
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updatePointerWorld(touch.clientX, touch.clientY);
      }
    };

    const onTouchEnd = () => {
      config.controlSphere0 = false;
    };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', onPointerLeave);
    container.addEventListener('click', onClick);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    container.addEventListener('touchcancel', onTouchEnd, { passive: true });

    // 11. Render & Simulation Loop with Off-Screen Pausing
    let isIntersecting = true;
    let isTabVisible = true;
    let rafId: number | null = null;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      rafId = requestAnimationFrame(animate);
      if (!isIntersecting || !isTabVisible) return;

      const delta = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      // Step physics
      physics.update(delta);

      // Synchronize meshes with physics buffers
      for (let i = 0; i < meshes.length; i++) {
        const mesh = meshes[i];
        const dataIdx = 3 * (i + 1);

        mesh.position.set(
          physics.positionData[dataIdx],
          physics.positionData[dataIdx + 1],
          physics.positionData[dataIdx + 2]
        );

        mesh.rotation.set(
          physics.rotationData[dataIdx],
          physics.rotationData[dataIdx + 1],
          physics.rotationData[dataIdx + 2]
        );
      }

      renderer.render(scene, camera);
    };
    rafId = requestAnimationFrame(animate);

    // 12. Visibility & Intersection Management (Zero CPU/GPU waste when offscreen)
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
      },
      { threshold: 0.02 }
    );
    intersectionObserver.observe(container);

    const onVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // 13. Teardown & Disposal
    return () => {
      if (rafId) cancelAnimationFrame(rafId);

      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      container.removeEventListener('click', onClick);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);

      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);

      shapeMaterial.dispose();
      envTexture.dispose();
      Object.values(geometries).forEach((g) => g.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 pointer-events-auto select-none"
      style={{ touchAction: 'pan-y' }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
