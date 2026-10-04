import * as THREE from 'three';

export interface ShardMeta {
  vertexOffset: number;
  vertexCount: number;
  basePositions: Float32Array;
  baseNormals: Float32Array;
  restPosition: THREE.Vector3;
  hingeOrigin: THREE.Vector3;
  hingeAxis: THREE.Vector3;
  turnAngle: number;
  outwardVector: THREE.Vector3;
  outwardDist: number;
}

export interface MergedFractureSystem {
  mergedGeometry: THREE.BufferGeometry;
  crackLinesGeometry: THREE.BufferGeometry;
  shards: ShardMeta[];
  update: (progress: number, time: number, hoverPoint?: THREE.Vector2 | null, dt?: number) => void;
}

/**
 * Smooth vertex normals across all coincident vertices (shared 3D coordinates):
 * Completely eliminates faceted flat-shading on curved arcs and break seams,
 * giving every crystal shard 100% smooth, continuous, rounded normal shading.
 */
export function smoothGeometryNormals(geom: THREE.BufferGeometry) {
  const posAttr = geom.attributes.position;
  const normAttr = geom.attributes.normal;
  if (!posAttr || !normAttr) return;

  const count = posAttr.count;
  const hashPrecision = 1e4;
  const posMap = new Map<string, number[]>();

  for (let i = 0; i < count; i++) {
    const x = Math.round(posAttr.getX(i) * hashPrecision);
    const y = Math.round(posAttr.getY(i) * hashPrecision);
    const z = Math.round(posAttr.getZ(i) * hashPrecision);
    const key = `${x}_${y}_${z}`;
    let list = posMap.get(key);
    if (!list) {
      list = [];
      posMap.set(key, list);
    }
    list.push(i);
  }

  const avg = new THREE.Vector3();
  const v = new THREE.Vector3();

  for (const indices of posMap.values()) {
    if (indices.length <= 1) continue;

    avg.set(0, 0, 0);
    for (const idx of indices) {
      v.fromBufferAttribute(normAttr, idx);
      avg.add(v);
    }

    if (avg.lengthSq() > 1e-6) {
      avg.normalize();
      for (const idx of indices) {
        normAttr.setXYZ(idx, avg.x, avg.y, avg.z);
      }
    }
  }

  normAttr.needsUpdate = true;
}

/**
 * Procedural 3D Architectural Hollow Ring Fracture System:
 * - 8 Asymmetric, randomized crystal shards with faceted break seams matching the KODE.IMMERSIVE reference
 * - Localized cursor affinity: The shard closest to the cursor breaks outward significantly,
 *   while the rest break only subtly (baseline ~20%).
 * - Organic wave propagation delay & buttery smooth spring inertia damping
 * - 100% mathematical rest alignment with hollow center (radius 0.70)
 */
export function generateFractureSystem(): MergedFractureSystem {
  const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches);
  const R = 1.15; // Outer radius matching circleGeom
  const R_inner = 0.62; // Inner hollow radius matching circleGeom hole
  const depth = 0.40; // Increased thickness matching chunky reference 3D glass
  const bevelThickness = 0.08;
  const bevelSize = 0.06;

  // 8 Asymmetric, organic cut angles matching the reference image's randomized composition:
  // - Top crown chunk (large dominant slab)
  // - Top-right wing
  // - Mid-right chip
  // - Lower-right chunky wing
  // - Bottom monument chunk (broad heavy slab)
  // - Lower-left wedge
  // - Mid-left wing
  // - Upper-left accent
  const angles = [0.65, 1.55, 2.25, 2.85, 3.85, 4.80, 5.45, 6.25, 0.65 + Math.PI * 2];
  const arcSteps = isMobile ? 12 : 20;

  const shardsData: {
    geom: THREE.BufferGeometry;
    restPos: THREE.Vector3;
    hingeOrigin: THREE.Vector3;
    hingeAxis: THREE.Vector3;
    turnAngle: number;
    outwardVector: THREE.Vector3;
    outwardDist: number;
  }[] = [];

  const crackLinePoints: THREE.Vector3[] = [];

  // Helper to sample circular arc points along specified radius with high smoothness
  const sampleArc = (startRad: number, endRad: number, steps: number, radius: number): THREE.Vector2[] => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= steps; i++) {
      const a = startRad + (i / steps) * (endRad - startRad);
      pts.push(new THREE.Vector2(Math.cos(a) * radius, Math.sin(a) * radius));
    }
    return pts;
  };

  // Precompute smooth intermediate break points along each seam (clean architectural cuts)
  const cutPoints: THREE.Vector2[] = [];
  const rMid = (R + R_inner) / 2;
  for (let i = 0; i < 8; i++) {
    const a = angles[i];
    // Gentle smooth facet offset avoiding any sharp pinched vertices
    const aFacet = a + (i % 2 === 0 ? 0.016 : -0.016);
    cutPoints.push(new THREE.Vector2(Math.cos(aFacet) * rMid, Math.sin(aFacet) * rMid));
  }

  // Refined outward displacement distances for a controlled, elegant, high-end separation
  const shardKinematics = [
    // 0. Top Crown Chunk (bursts up and outward +Y, tilts back)
    { out: new THREE.Vector3(0.38, 0.88, 0.28), hinge: new THREE.Vector3(0.96, -0.15, 0), turn: -0.32, dist: 0.28 },
    // 1. Top-Right Wing (bursts up-right)
    { out: new THREE.Vector3(-0.28, 0.92, 0.18), hinge: new THREE.Vector3(-0.55, 0.82, 0.12), turn: 0.28, dist: 0.26 },
    // 2. Mid-Right Chip (bursts up-left)
    { out: new THREE.Vector3(-0.80, 0.54, 0.25), hinge: new THREE.Vector3(0.12, 0.98, -0.10), turn: -0.24, dist: 0.23 },
    // 3. Lower-Right Chunky Wing (bursts far-left)
    { out: new THREE.Vector3(-0.92, -0.24, 0.18), hinge: new THREE.Vector3(0.68, 0.72, 0.08), turn: 0.26, dist: 0.26 },
    // 4. Bottom Monument Chunk (heavy slab bursts down-left and outward)
    { out: new THREE.Vector3(-0.35, -0.90, 0.30), hinge: new THREE.Vector3(0.98, 0.08, 0), turn: 0.32, dist: 0.29 },
    // 5. Lower-Left Wedge (bursts down-right)
    { out: new THREE.Vector3(0.35, -0.90, 0.18), hinge: new THREE.Vector3(-0.62, 0.76, -0.12), turn: -0.25, dist: 0.24 },
    // 6. Mid-Left Wing (bursts far-right)
    { out: new THREE.Vector3(0.85, -0.44, 0.25), hinge: new THREE.Vector3(0.18, 0.97, 0.10), turn: 0.28, dist: 0.27 },
    // 7. Upper-Left Accent (bursts up-right)
    { out: new THREE.Vector3(0.90, 0.32, 0.18), hinge: new THREE.Vector3(0.82, 0.56, -0.10), turn: -0.24, dist: 0.25 },
  ];

  for (let i = 0; i < 8; i++) {
    const aStart = angles[i];
    const aEnd = angles[i + 1];
    const aMid = (aStart + aEnd) / 2;

    const startCutMid = cutPoints[i];
    const endCutMid = cutPoints[(i + 1) % 8];

    // Faceted crack line segments along the radial seam between adjacent ring shards
    crackLinePoints.push(
      new THREE.Vector3(Math.cos(aStart) * R, Math.sin(aStart) * R, 0.12),
      new THREE.Vector3(startCutMid.x, startCutMid.y, 0.12),
      new THREE.Vector3(startCutMid.x, startCutMid.y, 0.12),
      new THREE.Vector3(Math.cos(aStart) * R_inner, Math.sin(aStart) * R_inner, 0.12)
    );

    // Build closed 2D polygon of the hollow ring shard with faceted seams
    const outerArc = sampleArc(aStart, aEnd, arcSteps, R);
    const innerArc = sampleArc(aEnd, aStart, arcSteps, R_inner);
    const pts = [
      ...outerArc,
      endCutMid,
      ...innerArc,
      startCutMid,
    ];

    let cx = 0;
    let cy = 0;
    for (const p of pts) {
      cx += p.x;
      cy += p.y;
    }
    cx /= pts.length;
    cy /= pts.length;

    const shape = new THREE.Shape();
    shape.moveTo(pts[0].x - cx, pts[0].y - cy);
    for (let k = 1; k < pts.length; k++) {
      shape.lineTo(pts[k].x - cx, pts[k].y - cy);
    }
    shape.closePath();

    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness,
      bevelSize,
      bevelSegments: isMobile ? 6 : 10,
      curveSegments: isMobile ? 24 : 40,
    });
    g.translate(0, 0, -depth / 2);
    g.computeVertexNormals();

    const nonIndexed = g.index ? g.toNonIndexed() : g;
    if (g !== nonIndexed) g.dispose();

    // Average normals across coincident vertices so all cut edges and curved arcs shade with buttery smooth normals
    smoothGeometryNormals(nonIndexed);

    const restPos = new THREE.Vector3(cx, cy, 0);
    const kin = shardKinematics[i];
    // Hinge centered on the shard's centroid so rotation cleanly accompanies pure outward expansion
    const hingeOrigin = restPos.clone();

    shardsData.push({
      geom: nonIndexed,
      restPos,
      hingeOrigin,
      hingeAxis: kin.hinge.clone().normalize(),
      turnAngle: kin.turn,
      outwardVector: kin.out.clone().normalize(),
      outwardDist: kin.dist,
    });
  }

  // ── MERGE ALL 8 CRYSTAL SHARDS INTO A SINGLE BUFFERGEOMETRY ──
  let totalVertices = 0;
  for (const s of shardsData) {
    totalVertices += s.geom.attributes.position.count;
  }

  const mergedPosArray = new Float32Array(totalVertices * 3);
  const mergedNormArray = new Float32Array(totalVertices * 3);

  const shardsMeta: ShardMeta[] = [];
  let currentVOffset = 0;

  for (const s of shardsData) {
    const count = s.geom.attributes.position.count;
    const pArray = s.geom.attributes.position.array as Float32Array;
    const nArray = s.geom.attributes.normal.array as Float32Array;

    const basePos = new Float32Array(count * 3);
    const baseNorm = new Float32Array(count * 3);
    basePos.set(pArray);
    baseNorm.set(nArray);

    for (let j = 0; j < count; j++) {
      const idx = j * 3;
      const dest = (currentVOffset + j) * 3;
      mergedPosArray[dest] = pArray[idx] + s.restPos.x;
      mergedPosArray[dest + 1] = pArray[idx + 1] + s.restPos.y;
      mergedPosArray[dest + 2] = pArray[idx + 2] + s.restPos.z;

      mergedNormArray[dest] = nArray[idx];
      mergedNormArray[dest + 1] = nArray[idx + 1];
      mergedNormArray[dest + 2] = nArray[idx + 2];
    }

    shardsMeta.push({
      vertexOffset: currentVOffset,
      vertexCount: count,
      basePositions: basePos,
      baseNormals: baseNorm,
      restPosition: s.restPos,
      hingeOrigin: s.hingeOrigin,
      hingeAxis: s.hingeAxis,
      turnAngle: s.turnAngle,
      outwardVector: s.outwardVector,
      outwardDist: s.outwardDist,
    });

    currentVOffset += count;
    s.geom.dispose();
  }

  const mergedGeometry = new THREE.BufferGeometry();
  mergedGeometry.setAttribute('position', new THREE.BufferAttribute(mergedPosArray, 3));
  mergedGeometry.setAttribute('normal', new THREE.BufferAttribute(mergedNormArray, 3));

  const crackLinesGeometry = new THREE.BufferGeometry().setFromPoints(crackLinePoints);

  // Cached math structures for zero-allocation 60fps animation loop
  const turnMatrix = new THREE.Matrix4();
  const axisMatrix = new THREE.Matrix4();
  const normalMatrix = new THREE.Matrix3();
  const diffVec = new THREE.Vector3();
  const cursorVec = new THREE.Vector3();

  const numShards = shardsMeta.length;
  // Per-shard continuous physics state: maintains smooth momentum & wave delay
  const currentAmounts = new Float32Array(numShards);
  const targetAmounts = new Float32Array(numShards);
  const shardDistances = new Float32Array(numShards);
  const activePositions: THREE.Vector3[] = [];
  const repelOffsets: THREE.Vector3[] = [];
  for (let k = 0; k < numShards; k++) {
    activePositions.push(new THREE.Vector3());
    repelOffsets.push(new THREE.Vector3());
  }

  let lastProgress = -1;
  let lastHoverX = -999;
  let lastHoverY = -999;

  const update = (progress: number, _time: number, hoverPoint?: THREE.Vector2 | null, dt?: number) => {
    const deltaSeconds = Math.min(dt || 0.016, 0.05);

    // 1. Calculate per-shard distance from cursor and identify the closest shard
    let minDist = 999;
    if (hoverPoint && progress > 0.001) {
      for (let i = 0; i < numShards; i++) {
        const dx = shardsMeta[i].restPosition.x - hoverPoint.x;
        const dy = shardsMeta[i].restPosition.y - hoverPoint.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        shardDistances[i] = dist;
        if (dist < minDist) minDist = dist;
      }
    }

    // 2. Compute target break amounts with localized cursor affinity ("chipak ke rhta h"):
    // Refined subtle baseline fracture for architectural integrity, closest shard responds smoothly
    const BASE_BREAK = 0.08;
    for (let i = 0; i < numShards; i++) {
      if (progress <= 0.001 || !hoverPoint) {
        targetAmounts[i] = 0.0;
      } else {
        const relativeDist = shardDistances[i] - minDist;
        // Exponential falloff centered on the closest shard
        const focusWeight = Math.exp(-relativeDist * 3.2);
        targetAmounts[i] = progress * (BASE_BREAK + (1.0 - BASE_BREAK) * focusWeight);
      }

      // Organic wave delay & buttery smooth inertia damping:
      // Nearest shard reacts with snappy responsiveness; distant shards follow with silky organic lag
      const relativeDist = hoverPoint ? Math.max(0, shardDistances[i] - minDist) : 0;
      const springRate = progress > 0.001
        ? Math.max(8.0, 16.0 - relativeDist * 4.5) // Fast, snappy, responsive wave propagation
        : 16.0; // Fast silky rewind rate when unhovering

      currentAmounts[i] += (targetAmounts[i] - currentAmounts[i]) * Math.min(1.0, deltaSeconds * springRate);
      if (progress <= 0.001 && currentAmounts[i] < 0.002) {
        currentAmounts[i] = 0.0;
      }
    }

    const hx = hoverPoint ? hoverPoint.x : 0;
    const hy = hoverPoint ? hoverPoint.y : 0;
    const deltaP = Math.abs(progress - lastProgress);
    const deltaH = Math.hypot(hx - lastHoverX, hy - lastHoverY);

    // Check if any shard is still in motion
    let isMoving = false;
    for (let i = 0; i < numShards; i++) {
      if (Math.abs(currentAmounts[i] - targetAmounts[i]) > 0.001 || currentAmounts[i] > 0.001) {
        isMoving = true;
        break;
      }
    }

    if (!isMoving && deltaP < 0.0006 && deltaH < 0.004) return;
    lastProgress = progress;
    lastHoverX = hx;
    lastHoverY = hy;

    const posArray = mergedGeometry.attributes.position.array as Float32Array;
    const normArray = mergedGeometry.attributes.normal.array as Float32Array;

    // 3. Compute active 3D positions and recoil
    for (let i = 0; i < numShards; i++) {
      const s = shardsMeta[i];
      const amount = currentAmounts[i];

      activePositions[i].set(
        s.restPosition.x + s.outwardVector.x * (s.outwardDist * amount),
        s.restPosition.y + s.outwardVector.y * (s.outwardDist * amount),
        s.restPosition.z + s.outwardVector.z * (s.outwardDist * amount)
      );
      repelOffsets[i].set(0, 0, 0);

      // Controlled outward boost for the focused shard
      if (hoverPoint && amount > 0.35) {
        const boost = (amount - 0.35) * 0.10;
        repelOffsets[i].x += s.outwardVector.x * boost;
        repelOffsets[i].y += s.outwardVector.y * boost;
        repelOffsets[i].z += 0.06 * boost;
      }
    }

    // 4. Pairwise 3D collision repulsion between adjacent shards to ensure clean separation
    for (let i = 0; i < numShards; i++) {
      for (let j = i + 1; j < numShards; j++) {
        const amtA = currentAmounts[i];
        const amtB = currentAmounts[j];
        if (amtA > 0.04 && amtB > 0.04) {
          diffVec.subVectors(activePositions[i], activePositions[j]);
          const dist = diffVec.length();
          const minSafeDistance = 0.34;

          if (dist < minSafeDistance) {
            const overlap = minSafeDistance - dist;
            const repelStrength = overlap * 0.45 * Math.min(amtA, amtB);

            if (dist > 0.001) {
              diffVec.normalize();
            } else {
              diffVec.set(0.7, 0.7, 0.1).normalize();
            }

            repelOffsets[i].x += diffVec.x * repelStrength;
            repelOffsets[i].y += diffVec.y * repelStrength;
            repelOffsets[i].z += diffVec.z * repelStrength * 0.5;

            repelOffsets[j].x -= diffVec.x * repelStrength;
            repelOffsets[j].y -= diffVec.y * repelStrength;
            repelOffsets[j].z -= diffVec.z * repelStrength * 0.5;
          }
        }
      }
    }

    // 5. Apply physical HINGE TURNING and 3D DISPLACEMENT matrix to vertex buffers
    for (let i = 0; i < numShards; i++) {
      const s = shardsMeta[i];
      const shardAmount = currentAmounts[i];

      const hx = s.hingeOrigin.x - s.restPosition.x;
      const hy = s.hingeOrigin.y - s.restPosition.y;
      const hz = s.hingeOrigin.z - s.restPosition.z;

      // 1. Shift local shard origin to hinge line
      turnMatrix.makeTranslation(-hx, -hy, -hz);

      // 2. Rotate along the 3D hinge axis by turnAngle * shardAmount
      axisMatrix.makeRotationAxis(s.hingeAxis, s.turnAngle * shardAmount);
      turnMatrix.premultiply(axisMatrix);

      // 3. Shift back from hinge line + outward 3D separation displacement + recoil
      const dispX = hx + s.restPosition.x + s.outwardVector.x * (s.outwardDist * shardAmount) + repelOffsets[i].x;
      const dispY = hy + s.restPosition.y + s.outwardVector.y * (s.outwardDist * shardAmount) + repelOffsets[i].y;
      const dispZ = hz + s.restPosition.z + s.outwardVector.z * (s.outwardDist * shardAmount) + repelOffsets[i].z;
      axisMatrix.makeTranslation(dispX, dispY, dispZ);
      turnMatrix.premultiply(axisMatrix);

      normalMatrix.getNormalMatrix(turnMatrix);

      const m = turnMatrix.elements;
      const nm = normalMatrix.elements;

      const vOffset = s.vertexOffset * 3;
      const count = s.vertexCount;
      const baseP = s.basePositions;
      const baseN = s.baseNormals;

      for (let j = 0; j < count; j++) {
        const idx = j * 3;
        const dest = vOffset + idx;

        const bx = baseP[idx];
        const by = baseP[idx + 1];
        const bz = baseP[idx + 2];

        posArray[dest] = m[0] * bx + m[4] * by + m[8] * bz + m[12];
        posArray[dest + 1] = m[1] * bx + m[5] * by + m[9] * bz + m[13];
        posArray[dest + 2] = m[2] * bx + m[6] * by + m[10] * bz + m[14];

        const nx = baseN[idx];
        const ny = baseN[idx + 1];
        const nz = baseN[idx + 2];

        normArray[dest] = nm[0] * nx + nm[3] * ny + nm[6] * nz;
        normArray[dest + 1] = nm[1] * nx + nm[4] * ny + nm[7] * nz;
        normArray[dest + 2] = nm[2] * nx + nm[5] * ny + nm[8] * nz;
      }
    }

    mergedGeometry.attributes.position.needsUpdate = true;
    mergedGeometry.attributes.normal.needsUpdate = true;
  };

  return {
    mergedGeometry,
    crackLinesGeometry,
    shards: shardsMeta,
    update,
  };
}
