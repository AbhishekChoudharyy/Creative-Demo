'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { soundManager } from '@/lib/sound';

gsap.registerPlugin(ScrollTrigger);

const statements = [
  "Space is the canvas.",
  "Beyond the rectangle.",
  "Storytelling in three dimensions.",
  "Sensory cognition.",
  "Zero limits, zero boundaries."
];

export default function Manifesto() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLHeadingElement | null)[]>([]);

  useEffect(() => {
    let lastIndex = -1;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${statements.length * 100}%`,
          pin: true,
          anticipatePin: 1,
          scrub: 0.8,
          onUpdate: (self) => {
            const rawIndex = self.progress * statements.length;
            const index = Math.min(
              Math.floor(rawIndex),
              statements.length - 1
            );

            if (index !== lastIndex) {
              // Play directional whoosh based on scroll direction
              if (self.direction === 1) {
                soundManager.playWhooshUp(0.35);
              } else {
                soundManager.playWhooshDown(0.3);
              }
              lastIndex = index;
            }
          }
        }
      });

      // Animate each statement in and out smoothly using GSAP instead of buggy CSS transitions
      textRefs.current.forEach((el, i) => {
        if (!el) return;

        // Set initial values
        if (i > 0) {
          gsap.set(el, { opacity: 0, scale: 0.9, filter: 'blur(8px)' });
        } else {
          gsap.set(el, { opacity: 1, scale: 1, filter: 'blur(0px)' });
        }

        // Build transition timeline slots
        if (i > 0) {
          // Fade/Scale/Blur in the current statement
          tl.to(el, {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.5,
            ease: "power2.out"
          }, i - 0.2);
        }

        if (i < statements.length - 1) {
          // Fade/Scale/Blur out the current statement before the next one starts
          tl.to(el, {
            opacity: 0,
            scale: 0.9,
            filter: 'blur(8px)',
            duration: 0.5,
            ease: "power2.in"
          }, i + 0.5);
        }
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="h-screen bg-[#1E65E5] text-black overflow-hidden relative flex items-center justify-center">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-[#00A6B2]/30 rounded-full blur-[150px] animate-pulse"></div>
      </div>

      <div className="relative z-10 container mx-auto text-center px-4">
         {statements.map((text, i) => (
           <h2 
             key={i}
             ref={el => { textRefs.current[i] = el; }}
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-[6vw] md:text-[5vw] font-heading font-bold uppercase leading-tight text-black"
           >
             {text}
           </h2>
         ))}
      </div>
      
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-xs font-mono tracking-[0.2em] text-[#C0C6CF]">
        ( THE MANIFESTO )
      </div>
    </section>
  );
}
