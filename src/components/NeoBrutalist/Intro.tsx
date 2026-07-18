'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AsciiScramble from './AsciiScramble';

gsap.registerPlugin(ScrollTrigger);

export default function Intro() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const lines = gsap.utils.toArray('.intro-line-wrap');
      
      lines.forEach((line: any) => {
        gsap.fromTo(line.querySelectorAll('.char'), 
          { y: 100, opacity: 0, rotateX: -90 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            stagger: { each: 0.02 },
            duration: 1,
            ease: "power4.out",
            scrollTrigger: {
              trigger: line,
              start: "top 80%",
              toggleActions: "play reverse play reverse",
            }
          }
        );
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 md:py-56 bg-[#1E54A8] text-black overflow-hidden px-4">
      <div className="container mx-auto">
        
        <div className="flex flex-col text-[7vw] md:text-[6vw] leading-[1.1] font-heading uppercase font-bold tracking-tight">
          
          <div className="intro-line-wrap overflow-hidden flex flex-wrap items-baseline gap-4">
             <AsciiScramble text="We" className="char" />
             <AsciiScramble text="don't just" className="char font-serif italic font-light text-black/60 lowercase" />
             <AsciiScramble text="build" className="char" />
          </div>

          <div className="intro-line-wrap overflow-hidden flex flex-wrap items-baseline gap-4 pl-[5vw]">
             <AsciiScramble text="Digital" className="char text-transparent" style={{ WebkitTextStroke: "1px #000" }} />
             <AsciiScramble text="Experiences." className="char" />
          </div>

          <div className="intro-line-wrap overflow-hidden flex flex-wrap items-baseline gap-4">
             <AsciiScramble text="We" className="char" />
             <AsciiScramble text="engineer" className="char font-serif italic font-light text-[#F7F7F5] lowercase" />
             <AsciiScramble text="Cults." className="char" />
          </div>

        </div>

        <div className="mt-32 w-full flex justify-end">
          <div className="w-full md:w-1/3 text-lg md:text-xl font-light text-black/85 font-mono leading-relaxed border-l border-black/20 pl-8">
            <p>
              At <span className="text-[#F7F7F5] italic font-serif">Floworx Collective</span>, we bridge the gap between imagination and technology. We craft high-impact volumetric 3D billboards, spatial designs, and interactive experiences that build enduring brands.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
