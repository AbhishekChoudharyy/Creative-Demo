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
 * Procedural 3D Crystal Hollow Ring Fracture System:
 * - 8 Architectural beveled crystal ring segments designed to physically turn, hinge, and peel
 *   outward from their exact radial crack seams directly from the hollow ring!
 * - 100% mathematical rest alignment with hollow center (when progress = 0, forms the exact seamless ring)
 * - Retains the center hole (radius 0.55) completely open and hollow at all times
 * - Dynamic shockwave propagation & impact-driven recoil
 */
export function generateFractureSystem(): MergedFractureSystem {
  const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches);
  const R = 1.15; // Exact outer radius matching circleGeom
  const R_inner = 0.70; // Exact inner radius matching hollow circleGeom hole
  const depth = 0.22;
  const bevelThickness = 0.08;
  const bevelSize = 0.06;

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

  // Helper to sample circular arc points along specified radius
  const sampleArc = (startRad: number, endRad: number, steps: number, radius: number): THREE.Vector2[] => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= steps; i++) {
      const a = startRad + (i / steps) * (endRad - startRad);
      pts.push(new THREE.Vector2(Math.cos(a) * radius, Math.sin(a) * radius));
    }
    return pts;
  };

  // 8 Architectural radial sector angles spanning the full 360-degree circle
  const angles = [0.38, 1.18, 1.96, 2.75, 3.53, 4.32, 5.10, 5.89, 0.38 + Math.PI * 2];
  const arcSteps = isMobile ? 6 : 10;

  for (let i = 0; i < 8; i++) {
    const aStart = angles[i];
    const aEnd = angles[i + 1];
    const aMid = (aStart + aEnd) / 2;

    // Crack line along the radial seam between adjacent ring shards (outer rim to inner hole)
    crackLinePoints.push(
      new THREE.Vector3(Math.cos(aStart) * R, Math.sin(aStart) * R, 0.12),
      new THREE.Vector3(Math.cos(aStart) * R_inner, Math.sin(aStart) * R_inner, 0.12)
    );

    // Build closed 2D polygon of the hollow ring segment
    const outerArc = sampleArc(aStart, aEnd, arcSteps, R);
    const innerArc = sampleArc(aEnd, aStart, arcSteps, R_inner);
    const pts = [...outerArc, ...innerArc];

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
      bevelSegments: isMobile ? 4 : 8,
      curveSegments: isMobile ? 32 : 48,
    });
    g.translate(0, 0, -depth / 2);
    g.computeVertexNormals();

    const nonIndexed = g.index ? g.toNonIndexed() : g;
    if (g !== nonIndexed) g.dispose();

    const restPos = new THREE.Vector3(cx, cy, 0);

    // Radial outward push vector with subtle alternating Z depth
    const outwardVec = new THREE.Vector3(
      Math.cos(aMid),
      Math.sin(aMid),
      i % 2 === 0 ? 0.14 : -0.14
    ).normalize();

    // Hinge axis tangential to the ring arc
    const hingeAxis = new THREE.Vector3(-Math.sin(aMid), Math.cos(aMid), 0).normalize();
    const hingeOrigin = new THREE.Vector3(Math.cos(aMid) * R_inner, Math.sin(aMid) * R_inner, 0);

    shardsData.push({
      geom: nonIndexed,
      restPos,
      hingeOrigin,
      hingeAxis,
      turnAngle: i % 2 === 0 ? 0.28 : -0.28,
      outwardVector: outwardVec,
      outwardDist: 0.44,
    });
  }

  // ── MERGE ALL 8 HOLLOW RING BLOCKS INTO A SINGLE BUFFERGEOMETRY ──
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

  let lastProgress = -1;
  let lastHoverX = -999;
  let lastHoverY = -999;

  const update = (progress: number, _time: number, hoverPoint?: THREE.Vector2 | null) => {
    // If progress is at 0, nothing to morph
    if (progress <= 0.0001) return;

    const hx = hoverPoint ? hoverPoint.x : 0;
    const hy = hoverPoint ? hoverPoint.y : 0;
    const deltaP = Math.abs(progress - lastProgress);
    const deltaH = Math.hypot(hx - lastHoverX, hy - lastHoverY);

    // If resting or barely moved, skip vertex buffer upload
    if (deltaP < 0.0006 && deltaH < 0.004) return;
    lastProgress = progress;
    lastHoverX = hx;
    lastHoverY = hy;

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

      // Directional recoil away from cursor touch point
      if (hoverPoint && localPeak > 0.05) {
        cursorVec.set(s.restPosition.x - hoverPoint.x, s.restPosition.y - hoverPoint.y, 0);
        const cDist = cursorVec.length();
        if (cDist > 0.001) {
          cursorVec.normalize().multiplyScalar(localPeak * 0.20 * shardEase);
          repelOffsets[i].add(cursorVec);
        }
      }
    }

    // 2. Pairwise 3D collision repulsion between adjacent ring shards
    for (let i = 0; i < numShards; i++) {
      for (let j = i + 1; j < numShards; j++) {
        const amtA = shardAmounts[i];
        const amtB = shardAmounts[j];
        if (amtA > 0.04 && amtB > 0.04) {
          diffVec.subVectors(activePositions[i], activePositions[j]);
          const dist = diffVec.length();
          const minSafeDistance = 0.46; // Safe 3D clearance for ring segments

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

    // 3. Apply physical HINGE TURNING matrix to vertex buffers
    for (let i = 0; i < numShards; i++) {
      const s = shardsMeta[i];
      const shardAmount = shardAmounts[i];

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
