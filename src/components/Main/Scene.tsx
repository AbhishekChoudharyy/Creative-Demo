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

      {/* Ambient light for natural fill */}
      <ambientLight intensity={isMobile ? 2.6 : 2.0} />

      {/* Balanced front key light */}
      <directionalLight position={[0, 4, 6]} intensity={isMobile ? 3.2 : 2.5} color="#ffffff" />

      {/* Top backlight/fill */}
      <directionalLight position={[0, 8, -2]} intensity={isMobile ? 2.8 : 2.2} color="#ffffff" />

      {/* Side teal rim light for brand accent glints */}
      <directionalLight position={[-6, 2, 4]} intensity={isMobile ? 2.8 : 2.2} color="#00A6B2" />

      {/* Right side fill light */}
      <directionalLight position={[6, 2, 4]} intensity={isMobile ? 2.4 : 1.8} color="#ffffff" />

      {/* Soft spotlight on the glass crystal */}
      <spotLight position={[0, 5, 5]} angle={0.8} penumbra={0.8} intensity={isMobile ? 2.6 : 2.0} color="#ffffff" />

      {/* Soft front point light */}
      <pointLight position={[0, 0, 4.5]} intensity={isMobile ? 2.4 : 1.8} color="#ffffff" />

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

