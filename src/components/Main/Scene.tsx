import { FC, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Environment, Lightformer, Text } from '@react-three/drei';
import { Group } from 'three';

import { GlassBox } from './GlassBox';

export const Scene: FC = () => {
  const groupRef = useRef<Group>(null);
  const { width } = useThree((state) => state.size);
  const viewport = useThree((state) => state.viewport);
  const isMobile = width < 768;
  const responsiveScale = isMobile ? Math.max(0.82, Math.min(viewport.width * 0.30, 0.88)) : 1.38;

  return (
    <>
      <color attach="background" args={["#1E90FF"]} />

      {/* ── Studio Lighting: Polished, glossy specular lighting with zero blowout / clipping ── */}
      <ambientLight intensity={1.2} color="#f0f9ff" />

      {/* Main Studio Key Light */}
      <directionalLight position={[5, 8, 5]} intensity={1.8} color="#ffffff" />

      {/* Studio Fill Light */}
      <directionalLight position={[-6, -3, 4]} intensity={1.2} color="#e0f2fe" />

      {/* Gentle Rim Accent */}
      <directionalLight position={[0, 6, -4]} intensity={1.2} color="#ffffff" />

      {/* High-Resolution Studio Environment with Soft Circular Softboxes (zero harsh horizontal bars) */}
      <Environment resolution={1024}>
        {/* Overhead broad studio softbox for smooth, glossy corner curvature */}
        <Lightformer
          form="circle"
          intensity={2.2}
          position={[0, 6.0, 3.0]}
          scale={[8.0, 8.0, 1]}
          color="#ffffff"
        />
        {/* Right studio softbox */}
        <Lightformer
          form="circle"
          intensity={1.6}
          position={[6.0, 1.0, 3.0]}
          scale={[6.0, 6.0, 1]}
          color="#ffffff"
        />
        {/* Left cool studio fill */}
        <Lightformer
          form="circle"
          intensity={1.4}
          position={[-6.0, 1.0, 3.0]}
          scale={[6.0, 6.0, 1]}
          color="#e0f2fe"
        />
        {/* Bottom soft bounce fill */}
        <Lightformer
          form="circle"
          intensity={1.2}
          position={[0, -5.0, 2.0]}
          scale={[7.0, 7.0, 1]}
          color="#dbeafe"
        />
        {/* Back diffuse backlight */}
        <Lightformer
          form="circle"
          intensity={1.5}
          position={[0, 0, -5.0]}
          scale={[10.0, 10.0, 1]}
          color="#93c5fd"
        />
      </Environment>

      {/* Hero display text rendered inside the WebGL canvas, allowing it to be refracted by the glass ring */}
      <group scale={isMobile ? [1, 1.38, 1] : [1, 1.35, 1]} position={[0, 0, -1.5]}>
        <Text
          font="/fonts/OTBrut-Bold.ttf"
          fontSize={isMobile ? viewport.width * 0.185 : viewport.width * 0.102}
          color="#0A1F44"
          maxWidth={isMobile ? viewport.width * 1.12 : viewport.width * 0.98}
          textAlign="center"
          letterSpacing={-0.035}
          lineHeight={0.86}
          anchorX="center"
          anchorY="middle"
        >
          {"FROM ORIGIN\nTO EXPERIENCE."}
        </Text>
      </group>

      {/* Start frame: initial tilt comes from GlassBox rotation refs; group kept neutral */}
      <group ref={groupRef} scale={responsiveScale} position={[0, 0.1, 0]}>
        <GlassBox />
      </group>
    </>
  );
};

