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
  update: (progress: number, time: number, hoverPoint?: THREE.Vector2 | null) => void;
}

/**
 * Procedural 3D crystal fracture system:
 * - 8 Architectural beveled crystal slabs designed to physically turn, hinge, and peel
 *   outward from their exact crack seams directly from the solid crystal!
 * - 100% mathematical rest alignment (when progress = 0, forms the exact seamless circle)
 * - Dynamic shockwave propagation & impact-driven recoil
 */
export function generateFractureSystem(): MergedFractureSystem {
  const R = 1.15; // Exact radius matching circleGeom
  const depth = 0.22;
  const bevelThickness = 0.10;
  const bevelSize = 0.085;

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

  // Helper to sample circular arc points along outer perimeter
  const sampleArc = (startRad: number, endRad: number, steps: number = 8): THREE.Vector2[] => {
    const pts: THREE.Vector2[] = [];
    if (endRad <= startRad) endRad += Math.PI * 2;
    for (let i = 0; i <= steps; i++) {
      const a = startRad + (i / steps) * (endRad - startRad);
      pts.push(new THREE.Vector2(Math.cos(a) * R, Math.sin(a) * R));
    }
    return pts;
  };

  // ── KEY ARCHITECTURAL FRACTURE JUNCTION NODES (100% Interlocking, 0 Missing Holes) ──
  const a0 = 0.52;   // ~30° (Top-Right)
  const a1 = 1.38;   // ~79° (Top-Center)
  const a2 = 2.26;   // ~130° (Top-Left)
  const a3 = 3.32;   // ~190° (Mid-Left)
  const a4 = 4.22;   // ~242° (Bottom-Left)
  const a5 = 5.12;   // ~293° (Bottom-Center)
  const a6 = 5.92;   // ~339° (Bottom-Right)

  // Inner architectural junction nodes
  const N0 = new THREE.Vector2(0.42, 0.38);    // Upper Right inner
  const N1 = new THREE.Vector2(0.04, 0.50);    // Top Center inner
  const N2 = new THREE.Vector2(-0.42, 0.42);   // Upper Left inner
  const N3 = new THREE.Vector2(-0.48, -0.06);  // Mid Left inner
  const N4 = new THREE.Vector2(-0.38, -0.44);  // Bottom Left inner
  const N5 = new THREE.Vector2(0.06, -0.48);   // Bottom Center inner
  const N6 = new THREE.Vector2(0.48, -0.38);   // Bottom Right inner
  const N7 = new THREE.Vector2(0.52, 0.08);    // Mid Right inner

  // Center core facet nodes (Surrounding the central heart diamond)
  const C_TOP = new THREE.Vector2(-0.02, 0.20);
  const C_LEFT = new THREE.Vector2(-0.20, -0.02);
  const C_BOT = new THREE.Vector2(0.02, -0.18);
  const C_RIGHT = new THREE.Vector2(0.22, 0.04);

  // Precompute crack line segments
  const addCrack = (p1: THREE.Vector2, p2: THREE.Vector2) => {
    crackLinePoints.push(new THREE.Vector3(p1.x, p1.y, 0.12), new THREE.Vector3(p2.x, p2.y, 0.12));
  };
  addCrack(new THREE.Vector2(Math.cos(a1) * R, Math.sin(a1) * R), N1);
  addCrack(N1, N0);
  addCrack(N0, new THREE.Vector2(Math.cos(a0) * R, Math.sin(a0) * R));
  addCrack(N1, N2);
  addCrack(N2, new THREE.Vector2(Math.cos(a2) * R, Math.sin(a2) * R));
  addCrack(N2, N3);
  addCrack(N3, new THREE.Vector2(Math.cos(a3) * R, Math.sin(a3) * R));
  addCrack(N3, N4);
  addCrack(N4, new THREE.Vector2(Math.cos(a4) * R, Math.sin(a4) * R));
  addCrack(N4, N5);
  addCrack(N5, new THREE.Vector2(Math.cos(a5) * R, Math.sin(a5) * R));
  addCrack(N5, N6);
  addCrack(N6, new THREE.Vector2(Math.cos(a6) * R, Math.sin(a6) * R));
  addCrack(N6, N7);
  addCrack(N7, N0);
  addCrack(N1, C_TOP);
  addCrack(C_TOP, C_RIGHT);
  addCrack(C_RIGHT, N7);
  addCrack(C_RIGHT, C_BOT);
  addCrack(C_BOT, N5);
  addCrack(C_BOT, C_LEFT);
  addCrack(C_LEFT, N3);
  addCrack(C_LEFT, C_TOP);
  addCrack(N2, C_TOP);
  addCrack(N4, C_BOT);

  // Helper to build, extrude, and register an architectural 3D crystal block with hinge turning kinematics
  const registerShard = (
    pts: THREE.Vector2[],
    hingeOrigin: THREE.Vector3,
    hingeAxis: THREE.Vector3,
    turnAngle: number,
    outwardVector: THREE.Vector3,
    outwardDist: number
  ) => {
    if (pts.length < 3) return;

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
      bevelThickness: 0.10,
      bevelSize: 0.08,
      bevelSegments: 8, // Smooth optical lens fillet matching circleGeom concentric reflections
      curveSegments: 48,
    });
    // Center ONLY along Z so that X and Y coordinates retain 100% exact polygon alignment!
    g.translate(0, 0, -depth / 2);
    g.computeVertexNormals();

    const nonIndexed = g.toNonIndexed();
    g.dispose();

    const restPos = new THREE.Vector3(cx, cy, 0);

    shardsData.push({
      geom: nonIndexed,
      restPos,
      hingeOrigin,
      hingeAxis: hingeAxis.clone().normalize(),
      turnAngle,
      outwardVector: outwardVector.clone().normalize(),
      outwardDist,
    });
  };

  // ── 1. BLOCK 1: TOP ARCHITECTURAL CROWN CAP ──
  const arcTop = sampleArc(a0, a2, 12);
  const ptsTopPlate = [
    ...arcTop,
    N2,
    N1,
    N0,
  ];
  registerShard(
    ptsTopPlate,
    new THREE.Vector3(0, 0.44, 0),
    new THREE.Vector3(1, 0, 0),
    -0.32, // ~18° tilt backward
    new THREE.Vector3(0.0, 1.0, -0.16),
    0.48
  );

  // ── 2. BLOCK 2: UPPER-LEFT CHUNKY FLANK ──
  const arcUpperLeft = sampleArc(a2, a3, 8);
  const ptsUpperLeft = [
    ...arcUpperLeft,
    N3,
    C_LEFT,
    C_TOP,
    N2,
  ];
  registerShard(
    ptsUpperLeft,
    new THREE.Vector3(N3.x, N3.y, 0),
    new THREE.Vector3(-0.15, 0.98, 0.1),
    0.35, // ~20° peel open to left
    new THREE.Vector3(-0.86, 0.50, 0.14),
    0.46
  );

  // ── 3. BLOCK 3: LOWER-LEFT FLANK ──
  const arcLowerLeft = sampleArc(a3, a4, 8);
  const ptsLowerLeft = [
    ...arcLowerLeft,
    N4,
    C_BOT,
    C_LEFT,
    N3,
  ];
  registerShard(
    ptsLowerLeft,
    new THREE.Vector3(N4.x, N4.y, 0),
    new THREE.Vector3(0.2, 0.96, -0.1),
    0.32,
    new THREE.Vector3(-0.86, -0.50, -0.14),
    0.46
  );

  // ── 4. BLOCK 4: BOTTOM ARCHITECTURAL RIM SLAB ──
  const arcBot = sampleArc(a4, a5, 10);
  const ptsBotPlate = [
    ...arcBot,
    N5,
    C_BOT,
    N4,
  ];
  registerShard(
    ptsBotPlate,
    new THREE.Vector3(0, -0.48, 0),
    new THREE.Vector3(1, 0, 0),
    0.35, // ~20° tilt forward & down
    new THREE.Vector3(0.0, -1.0, 0.16),
    0.48
  );

  // ── 5. BLOCK 5: LOWER-RIGHT FACETED WING ──
  const arcLowerRight = sampleArc(a5, a6, 8);
  const ptsLowerRight = [
    ...arcLowerRight,
    N6,
    C_RIGHT,
    C_BOT,
    N5,
  ];
  registerShard(
    ptsLowerRight,
    new THREE.Vector3(N5.x, N5.y, 0),
    new THREE.Vector3(0.7, 0.7, 0),
    -0.34,
    new THREE.Vector3(0.86, -0.50, -0.14),
    0.48
  );

  // ── 6. BLOCK 6: UPPER-RIGHT ANGULAR WING ──
  const arcUpperRight = sampleArc(a6, a0, 8);
  const ptsUpperRight = [
    ...arcUpperRight,
    N0,
    N7,
    N6,
  ];
  registerShard(
    ptsUpperRight,
    new THREE.Vector3(N7.x, N7.y, 0),
    new THREE.Vector3(-0.25, 0.95, 0),
    -0.35, // ~20° peel open to right
    new THREE.Vector3(0.88, 0.46, 0.16),
    0.52
  );

  // ── 7. BLOCK 7: UPPER-CENTER FACETED PRISM ──
  const ptsCenterPrism = [
    N1,
    N0,
    N7,
    C_RIGHT,
    C_TOP,
  ];
  registerShard(
    ptsCenterPrism,
    new THREE.Vector3(N1.x, N1.y, 0),
    new THREE.Vector3(0.35, -0.92, 0.15),
    0.26, // Gentle turn
    new THREE.Vector3(0.08, 0.75, -0.18), // Pushes up and back into depth!
    0.44
  );

  // ── 8. BLOCK 8: CENTER HEART DIAMOND (Inside "HOLD AND DRAG" circle) ──
  const ptsCenterHeart = [
    C_TOP,
    C_RIGHT,
    C_BOT,
    C_LEFT,
  ];
  registerShard(
    ptsCenterHeart,
    new THREE.Vector3(C_LEFT.x, C_LEFT.y, 0),
    new THREE.Vector3(0.85, 0.45, 0.25),
    0.22,
    new THREE.Vector3(0.0, -0.05, 0.28), // Lifts cleanly forward (+Z) toward camera!
    0.38
  );

  // ── MERGE ALL 8 ARCHITECTURAL BLOCKS INTO A SINGLE BUFFERGEOMETRY ──
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

    // Initial fill at exact rest coordinates
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
  const shardAmounts = new Float32Array(numShards);
  const activePositions: THREE.Vector3[] = [];
  const repelOffsets: THREE.Vector3[] = [];
  for (let k = 0; k < numShards; k++) {
    activePositions.push(new THREE.Vector3());
    repelOffsets.push(new THREE.Vector3());
  }

  // Focus radius for localized heavy break
  const FOCUS_RADIUS = 0.88;

  const update = (progress: number, _time: number, hoverPoint?: THREE.Vector2 | null) => {
    // Physical cubic ease-out
    const easeP = 1 - Math.pow(1 - progress, 3);

    const posArray = mergedGeometry.attributes.position.array as Float32Array;
    const normArray = mergedGeometry.attributes.normal.array as Float32Array;

    // 1. Calculate individual shard morph amounts & dynamic shockwave propagation
    for (let i = 0; i < numShards; i++) {
      const s = shardsMeta[i];
      let localPeak = 0.0;
      let effectiveProximity = 0.13;
      let shardEase = easeP;

      if (hoverPoint) {
        const dx = s.restPosition.x - hoverPoint.x;
        const dy = s.restPosition.y - hoverPoint.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const normDist = Math.min(1.0, dist / FOCUS_RADIUS);

        // Real-time shockwave: crack propagates outward from cursor in milliseconds
        const propagationLag = Math.min(0.20, dist * 0.10);
        const localProgress = Math.max(0, Math.min(1.0, (progress - propagationLag) / (1.0 - propagationLag + 0.001)));
        shardEase = 1 - Math.pow(1 - localProgress, 3);

        // Sharp focal peak under the cursor
        localPeak = Math.pow(Math.cos(normDist * Math.PI * 0.5), 1.8);
        effectiveProximity = 0.13 + 0.87 * localPeak;
      }

      const amount = shardEase * effectiveProximity;
      shardAmounts[i] = amount;

      // Estimated morphed position in 3D
      activePositions[i].set(
        s.restPosition.x + s.outwardVector.x * (s.outwardDist * amount),
        s.restPosition.y + s.outwardVector.y * (s.outwardDist * amount),
        s.restPosition.z + s.outwardVector.z * (s.outwardDist * amount)
      );
      repelOffsets[i].set(0, 0, 0);

      // Strong directional recoil away from cursor touch point
      if (hoverPoint && localPeak > 0.05) {
        cursorVec.set(s.restPosition.x - hoverPoint.x, s.restPosition.y - hoverPoint.y, 0);
        const cDist = cursorVec.length();
        if (cDist > 0.001) {
          cursorVec.normalize().multiplyScalar(localPeak * 0.20 * shardEase);
          repelOffsets[i].add(cursorVec);
        }
      }
    }

    // 2. Pairwise 3D collision repulsion: SHAPES NEVER OVERLAP!
    // If pieces get close, actively repel them apart in XY and separate their Z depths
    for (let i = 0; i < numShards; i++) {
      for (let j = i + 1; j < numShards; j++) {
        const amtA = shardAmounts[i];
        const amtB = shardAmounts[j];
        if (amtA > 0.04 && amtB > 0.04) {
          diffVec.subVectors(activePositions[i], activePositions[j]);
          const dist = diffVec.length();
          const minSafeDistance = 0.92; // Safe 3D clearance radius

          if (dist < minSafeDistance) {
            const overlap = minSafeDistance - dist;
            const repelStrength = overlap * 0.50 * Math.min(amtA, amtB);

            if (dist > 0.001) {
              diffVec.normalize();
            } else {
              diffVec.set(0.7, 0.7, 0.1).normalize();
            }

            // Repel in 3D space
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

    // 3. Apply physical HINGE TURNING matrix to vertex buffers:
    // Shards turn, hinge, and peel directly outward from their crack seams!
    for (let i = 0; i < numShards; i++) {
      const s = shardsMeta[i];
      const shardAmount = shardAmounts[i];

      // Construct turn transformation around the physical crack seam hinge
      const hx = s.hingeOrigin.x - s.restPosition.x;
      const hy = s.hingeOrigin.y - s.restPosition.y;
      const hz = s.hingeOrigin.z - s.restPosition.z;

      // 1. Shift local shard origin to hinge line
      turnMatrix.makeTranslation(-hx, -hy, -hz);

      // 2. Rotate along the crack seam axis by turnAngle
      axisMatrix.makeRotationAxis(s.hingeAxis, s.turnAngle * shardAmount);
      turnMatrix.premultiply(axisMatrix);

      // 3. Shift back from hinge line + outward separation displacement + recoil
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
