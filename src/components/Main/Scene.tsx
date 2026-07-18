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
      <color attach="background" args={["#1E65E5"]} />

      {/* Ambient light boosted for mobile visibility */}
      <ambientLight intensity={isMobile ? 3.2 : 2.2} />

      {/* Strong front key light */}
      <directionalLight position={[0, 4, 6]} intensity={isMobile ? 5.0 : 4.0} color="#ffffff" />

      {/* Top backlight/fill */}
      <directionalLight position={[0, 8, -2]} intensity={isMobile ? 4.0 : 3.0} color="#ffffff" />

      {/* Side teal rim light for brand accent glints */}
      <directionalLight position={[-6, 2, 4]} intensity={isMobile ? 4.0 : 3.0} color="#00A6B2" />

      {/* Right side fill light */}
      <directionalLight position={[6, 2, 4]} intensity={isMobile ? 3.5 : 2.5} color="#ffffff" />

      {/* Targeted spotlight directly focused on the crystal element */}
      <spotLight position={[0, 5, 5]} angle={0.8} penumbra={0.8} intensity={isMobile ? 6.0 : 4.0} color="#ffffff" />

      {/* Front point light targeting 3D element */}
      <pointLight position={[0, 0, 4.5]} intensity={isMobile ? 5.5 : 4.0} color="#ffffff" />

      {/* Hero display text rendered inside the WebGL canvas, allowing it to be refracted by the glass chevron */}
      <group scale={[1, 1.35, 1]} position={[0, 0, -1.5]}>
        <Text
          font="https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKfsukDQ.ttf"
          fontSize={isMobile ? viewport.width * 0.21 : viewport.width * 0.125}
          color="#000000"
          maxWidth={viewport.width * 0.98}
          textAlign="center"
          letterSpacing={-0.05}
          lineHeight={0.76}
          anchorX="center"
          anchorY="middle"
        >
          {"FLOWORX\nCOLLECTIVE"}
        </Text>
      </group>

      <group ref={groupRef} scale={responsiveScale}>
        <GlassBox />
      </group>
    </>
  );
};

