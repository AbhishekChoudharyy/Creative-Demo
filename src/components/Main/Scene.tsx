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
  const responsiveScale = isMobile ? Math.max(0.96, Math.min(viewport.width * 0.35, 1.02)) : 1.38;

  return (
    <>
      <color attach="background" args={["#1E90FF"]} />

      {/* ── Studio Icy Lighting Setup (Pure Procedural Lighting, 0 Images) ── */}
      <ambientLight intensity={isMobile ? 1.4 : 1.2} color="#f0f9ff" />

      {/* TOP FLARE KEY LIGHT: Brilliant highlight at 12 o'clock on the beveled rim */}
      <directionalLight position={[0, 7.5, 4.5]} intensity={isMobile ? 3.8 : 3.4} color="#ffffff" />

      {/* BOTTOM FLARE ACCENT LIGHT: Symmetrical highlight at 6 o'clock on the beveled rim */}
      <directionalLight position={[0, -6.5, 4.0]} intensity={isMobile ? 3.2 : 2.8} color="#ffffff" />

      {/* SIDE SCULPTING LIGHTS: Thin crisp edge silhouettes with icy blue tint */}
      <directionalLight position={[-7, 0, 3.5]} intensity={isMobile ? 2.4 : 2.0} color="#38bdf8" />
      <directionalLight position={[7, 0, 3.5]} intensity={isMobile ? 2.2 : 1.8} color="#ffffff" />

      {/* BACK RIM LIGHT: Crystalline edge separation */}
      <directionalLight position={[0, 8, -4]} intensity={isMobile ? 2.8 : 2.4} color="#ffffff" />
      <directionalLight position={[0, -8, -4]} intensity={isMobile ? 2.2 : 1.8} color="#38bdf8" />

      {/* 100% Image-Free Procedural Icy Crystal Reflections via Lightformers */}
      <Environment resolution={512}>
        {/* Top 12 o'clock brilliant flare streak */}
        <Lightformer
          form="rect"
          intensity={6.5}
          position={[0, 4.2, 2.0]}
          scale={[6.8, 0.8, 1]}
          color="#ffffff"
        />
        {/* Bottom 6 o'clock brilliant flare streak */}
        <Lightformer
          form="rect"
          intensity={5.0}
          position={[0, -4.2, 2.0]}
          scale={[5.8, 0.7, 1]}
          color="#ffffff"
        />
        {/* Left cool icy rim streak */}
        <Lightformer
          form="rect"
          intensity={4.0}
          position={[-4.8, 0, 2.0]}
          scale={[1.0, 7.0, 1]}
          color="#e0f2fe"
        />
        {/* Right crisp silver rim streak */}
        <Lightformer
          form="rect"
          intensity={4.0}
          position={[4.8, 0, 2.0]}
          scale={[1.0, 7.0, 1]}
          color="#ffffff"
        />
        {/* Icy glacial glow behind */}
        <Lightformer
          form="circle"
          intensity={2.2}
          position={[0, 0, -4.0]}
          scale={7.5}
          color="#7dd3fc"
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

