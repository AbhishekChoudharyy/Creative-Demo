'use client';

import React, { useEffect, useRef } from 'react';
import { soundManager } from '@/lib/sound';

function Eye() {
  const eyeRef = useRef<HTMLDivElement>(null);
  const pupilRef = useRef<HTMLDivElement>(null);
  const lastAngleRef = useRef(0);
  const lastPlayTimeRef = useRef(0);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!eyeRef.current || !pupilRef.current) return;

      const eye = eyeRef.current.getBoundingClientRect();
      const eyeCenterX = eye.left + eye.width / 2;
      const eyeCenterY = eye.top + eye.height / 2;

      const angle = Math.atan2(
        e.clientY - eyeCenterY,
        e.clientX - eyeCenterX
      );

      const maxDistance = eye.width < 80 ? 12 : 25;
      const x = Math.cos(angle) * maxDistance;
      const y = Math.sin(angle) * maxDistance;

      pupilRef.current.style.transform = `translate(${x}px, ${y}px)`;

      // Rate limited organic mechanical tracking ticks
      const angleDiff = Math.abs(angle - lastAngleRef.current);
      const now = Date.now();
      if (angleDiff > 0.45 && now - lastPlayTimeRef.current > 220) {
        soundManager.playEyeMoveTick();
        lastAngleRef.current = angle;
        lastPlayTimeRef.current = now;
      }
    }

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={eyeRef}
      className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-white flex items-center justify-center"
    >
      <div className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 relative rounded-full bg-[#111111] flex items-center justify-center">
        <div
          ref={pupilRef}
          className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-white transition-transform duration-75"
        />
      </div>
    </div>
  );
}

export default function EyesCTA() {
  return (
    <section className="relative min-h-[70vh] flex flex-col justify-center items-center bg-[#f5f5f7] py-20 sm:py-28 md:py-36 text-center overflow-hidden">
      <div className="flex flex-col items-center justify-center px-6 w-full">
        {/* Main Heading */}
        <h2 className="text-5xl xs:text-6xl sm:text-7xl lg:text-[120px] pointer-events-none font-heading font-white leading-[0.9] text-black uppercase tracking-tight">
          READY TO
          <br />
          BUILD THE
          <br />
          FUTURE?
        </h2>

        {/* Eyes overlaid on the text */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-[140%] flex gap-8 sm:gap-14 md:gap-24 pointer-events-none z-10">
          <Eye />
          <Eye />
        </div>

        {/* CTA Button */}
        <a
          href="#work"
          onMouseEnter={() => soundManager.playHover()}
          onClick={(e) => {
            e.preventDefault();
            soundManager.playClick();
            const workSection = document.getElementById("work");
            workSection?.scrollIntoView({ behavior: "smooth" });
          }}
          className="group mt-12 relative cursor-pointer px-12 sm:px-16 py-3 sm:py-4 rounded-full font-heading font-bold text-sm sm:text-base flex gap-2 text-black justify-center items-center overflow-hidden bg-black/5 border border-black/10 backdrop-blur-md uppercase tracking-wider hover:border-black transition-all duration-300"
        >
          {/* Wipe animation with Black */}
          <span
            className="
              absolute inset-0 bg-black
              -translate-y-full
              transition-transform duration-300 ease-out
              group-hover:translate-y-0
              z-0
            "
          />
          <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors duration-300">
            <span className="w-1.5 h-1.5 rounded-full bg-black group-hover:bg-white transition-colors duration-300" />
            <span>Explore Floworx Collective</span>
            <span className="w-1.5 h-1.5 rounded-full bg-black opacity-0 group-hover:opacity-100 group-hover:bg-white transition-all duration-300" />
          </span>
        </a>
      </div>
    </section>
  );
}
