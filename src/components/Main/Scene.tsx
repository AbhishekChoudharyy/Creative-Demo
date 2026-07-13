import { FC, useRef } from 'react';
import { useThree } from '@react-three/fiber';

import { Text } from '@react-three/drei';
import { Group, Vector3 } from 'three';

import { useAnimatableVec3 } from '@/hooks/useAnimatableVec3';
import { useDeviceOrientationDelta } from '@/hooks/useDeviceOrientationDelta';
import { useMouseMoveDelta } from '@/hooks/useMouseMoveDelta';
import { useScreenPositionDelta } from '@/hooks/useScreenPositionDelta';

import { GlassBox } from './GlassBox';

const rotation = Math.PI * 0.6;

export const Scene: FC = () => {
  const groupRef = useRef<Group>(null);

  const { iterateTarget: iteratePositionTarget } = useAnimatableVec3(
    ({ x, y }) => {
      const group = groupRef.current;
      if (!group) return;

      group.position.set(x, -y, 0);
    },
    0.02,
    0.1,
  );

  const { iterateTarget: iterateRotationTarget } = useAnimatableVec3(
    ({ x, y, z }) => {
      const group = groupRef.current;
      if (!group) return;

      group.rotation.set(y * rotation, x * rotation, z * rotation);
    },
    0.02,
    0.1,
  );

  const { width } = useThree((state) => state.size);
  const viewport = useThree((state) => state.viewport);
  const isMobile = width < 768;
  const responsiveScale = isMobile ? 1.35 : 2.0;

  useMouseMoveDelta(({ x, y }) => {
    if (isMobile) return;
    const vec = new Vector3(x, y, 0);

    iteratePositionTarget(vec);
    iterateRotationTarget(vec);
  });

  useScreenPositionDelta(({ x, y }) => {
    if (isMobile) return;
    const strength = 5;
    const vec = new Vector3(-x * strength, -y * strength, 0);

    iteratePositionTarget(vec);
    iterateRotationTarget(vec);
  });

  useDeviceOrientationDelta(({ gamma, beta }) => {
    if (isMobile) return;
    const rotationStrength = 0.05;
    const rotationVector = new Vector3(
      gamma * rotationStrength,
      beta * rotationStrength,
      0,
    );

    const positionStrength = 0.075;
    const positionVector = new Vector3(
      gamma * positionStrength,
      beta * positionStrength,
      0,
    );

    iterateRotationTarget(rotationVector);
    iteratePositionTarget(positionVector);
  });

  return (
    <>
      <color attach="background" args={["#fe5416"]} />

      {/* Overhead directional light */}
      <directionalLight position={[0, 6, 0]} intensity={2.2} />

      {/* Soft overhead area light reflection card
      <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      */}

      {/* Long horizontal white emissive light strip for clean glossy reflection across center */}
      <mesh position={[0, 2.0, 3.2]} rotation={[-Math.PI / 5, 0, 0]}>
        <planeGeometry args={[22, 0.12]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>

      {/* Hero display text rendered inside the WebGL canvas, allowing it to be refracted by the glass chevron */}
      <group scale={[1, 1.35, 1]} position={[0, 0, -1.5]}>
        <Text
          font="https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKfsukDQ.ttf"
          fontSize={isMobile ? viewport.width * 0.23 : viewport.width * 0.135}
          color="#000000"
          maxWidth={viewport.width * 0.98}
          textAlign="center"
          letterSpacing={-0.05}
          lineHeight={0.76}
          anchorX="center"
          anchorY="middle"
        >
          {"CREATIVE\nDESIGN\nAGENCY"}
        </Text>
      </group>

      <group ref={groupRef} scale={responsiveScale}>
        <GlassBox />
      </group>
    </>
  );
};

