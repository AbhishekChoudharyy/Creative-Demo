'use client';

import React, { useEffect, useRef } from 'react';
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
      ScrollTrigger.create({
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

          // Use gsap.set() driven by scroll position — CSS transitions handle the easing
          textRefs.current.forEach((el, i) => {
            if (!el) return;
            if (i === index) {
              el.style.opacity = '1';
              el.style.transform = 'scale(1)';
              el.style.filter = 'blur(0px)';
            } else {
              el.style.opacity = '0';
              el.style.transform = 'scale(0.9)';
              el.style.filter = 'blur(8px)';
            }
          });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="h-screen bg-[#fe5416] text-black overflow-hidden relative flex items-center justify-center">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-white/15 rounded-full blur-[150px] animate-pulse"></div>
      </div>

      <div className="relative z-10 container mx-auto text-center px-4">
         {statements.map((text, i) => (
           <h2 
             key={i}
             ref={el => { textRefs.current[i] = el; }}
             className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-[6vw] md:text-[5vw] font-heading font-bold uppercase leading-tight text-black ${i === 0 ? 'opacity-100' : 'opacity-0 scale-90 blur-sm'}`}
             style={{ transition: 'opacity 0.35s ease, transform 0.35s ease, filter 0.35s ease' }}
           >
             {text}
           </h2>
         ))}
      </div>
      
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-xs font-mono tracking-[0.2em] text-black/50">
        ( THE MANIFESTO )
      </div>
    </section>
  );
}
