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
    <section ref={sectionRef} className="py-32 md:py-56 bg-[#1E90FF] text-black overflow-hidden px-4">
      <div className="container mx-auto">
        
        <div className="flex flex-col text-[7vw] md:text-[6vw] leading-[1.1] font-heading uppercase font-bold tracking-tight">
          
          <div className="intro-line-wrap overflow-hidden flex flex-wrap items-baseline gap-4">
             <AsciiScramble text="Every" className="char" />
             <AsciiScramble text="experience" className="char font-serif italic font-light text-black/60 lowercase" />
             <AsciiScramble text="begins" className="char" />
          </div>

          <div className="intro-line-wrap overflow-hidden flex flex-wrap items-baseline gap-4 pl-[4vw]">
             <AsciiScramble text="With An" className="char text-transparent" style={{ WebkitTextStroke: "1px #000" }} />
             <AsciiScramble text="Idea." className="char" />
          </div>

          <div className="intro-line-wrap overflow-hidden flex flex-wrap items-baseline gap-4">
             <AsciiScramble text="From" className="char" />
             <AsciiScramble text="origin to" className="char font-serif italic font-light text-[#F7F7F5] lowercase" />
             <AsciiScramble text="Excellence." className="char" />
          </div>

        </div>

        <div className="mt-28 md:mt-32 w-full flex justify-end">
          <div className="w-full md:w-5/12 text-base md:text-lg font-light text-black/90 font-mono leading-relaxed border-l border-black/20 pl-8 space-y-4">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-black/60 block">
              // WHAT WE BELIEVE
            </span>
            <p>
              <strong className="font-bold text-black">“Origo” means Origin</strong> — the starting point from which every idea, form and creation begins. Every great design begins with a simple origin and evolves into something extraordinary.
            </p>
            <p className="text-black/80">
              We believe in finding the origin of that idea and building from there. The objective is not simply to create something visually impressive, but to create experiences that connect, engage, inspire and endure.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
