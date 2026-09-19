import { FC, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Group } from 'three';

import { GlassBox } from './GlassBox';

export const Scene: FC = () => {
  const groupRef = useRef<Group>(null);
  const { width } = useThree((state) => state.size);
  const viewport = useThree((state) => state.viewport);
  const isMobile = width < 768;
  const responsiveScale = isMobile ? 0.72 : 1.38;

  return (
    <>
      <color attach="background" args={["#1E90FF"]} />

      {/* Radiant ambient light for bright, high-clarity illumination */}
      <ambientLight intensity={isMobile ? 2.5 : 2.0} />

      {/* Sharp studio directional lights for specular glass reflections */}
      <directionalLight position={[0, 6, 7]} intensity={isMobile ? 2.6 : 2.2} color="#ffffff" />
      <directionalLight position={[0, 10, -2]} intensity={isMobile ? 2.0 : 1.6} color="#ffffff" />
      <directionalLight position={[-7, 3, 5]} intensity={isMobile ? 2.2 : 1.8} color="#ffffff" />
      <directionalLight position={[7, 3, 5]} intensity={isMobile ? 2.0 : 1.6} color="#ffffff" />

      {/* Hero display text rendered inside the WebGL canvas, allowing it to be refracted by the glass ring */}
      <group scale={[1, 1.35, 1]} position={[0, 0, -1.5]}>
        <Text
          font="https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKfsukDQ.ttf"
          fontSize={isMobile ? viewport.width * 0.165 : viewport.width * 0.102}
          color="#000000"
          maxWidth={viewport.width * 0.98}
          textAlign="center"
          letterSpacing={-0.04}
          lineHeight={0.82}
          anchorX="center"
          anchorY="middle"
        >
          {"FROM ORIGIN\nTO EXPERIENCE."}
        </Text>
      </group>

      <group ref={groupRef} scale={responsiveScale}>
        <GlassBox />
      </group>
    </>
  );
};

