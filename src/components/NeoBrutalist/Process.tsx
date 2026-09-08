'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus, Minus } from 'lucide-react';
import { soundManager } from '@/lib/sound';
import AsciiScramble from './AsciiScramble';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    num: "01",
    title: "CONTEXT",
    subtitle: "Understand before we create.",
    desc: "We immerse ourselves in the brief, the people, the purpose and the possibilities."
  },
  {
    num: "02",
    title: "CONCEPT",
    subtitle: "Turn thought into direction.",
    desc: "We create meaningful concepts that bring clarity and direction."
  },
  {
    num: "03",
    title: "CREATE",
    subtitle: "Transform concepts into experiences.",
    desc: "We turn concepts into immersive and impactful experiences."
  },
  {
    num: "04",
    title: "DETAIL",
    subtitle: "Refine every element.",
    desc: "We refine every element with precision, purpose and attention to detail."
  },
  {
    num: "05",
    title: "DELIVER EXPERIENCE",
    subtitle: "Bring the idea to life.",
    desc: "From events and exhibitions to immersive environments, we create experiences that inspire, endure and create memories."
  }
];

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".process-title", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play reverse play reverse",
        }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="approach" className="py-24 bg-[#050505] text-[#e1e1e1] border-t border-zinc-800">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row mb-24 justify-between items-end">
          <h2 className="text-[10vw] md:text-[8vw] leading-[0.8] tracking-tighter process-title font-heading font-black">
            <AsciiScramble text="OUR" /><br/><AsciiScramble text="APPROACH" />
          </h2>
          <p className="max-w-md text-base md:text-lg mt-8 md:mt-0 font-medium text-zinc-400 font-mono">
            Every experience begins with an idea. We believe in finding the origin of that idea and building from there.
          </p>
        </div>

        <div className="border-t border-zinc-800">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="border-b border-zinc-800 cursor-pointer group"
              onMouseEnter={() => soundManager.playHover()}
              onClick={() => {
                soundManager.playClick();
                setOpenIndex(openIndex === index ? null : index);
              }}
            >
              <div className="py-8 md:py-12 flex justify-between items-center pr-4">
                <div className="flex items-baseline gap-8 md:gap-16">
                  <span className="font-mono text-sm md:text-base opacity-50 text-zinc-500">({step.num})</span>
                  <h3 className="text-3xl md:text-5xl font-normal group-hover:translate-x-4 transition-transform duration-500 font-heading tracking-wide text-white">
                    {step.title}
                  </h3>
                </div>
                <div className="relative w-6 h-6">
                  <div className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ${openIndex === index ? 'rotate-180' : 'rotate-0'}`}>
                    {openIndex === index ? <Minus className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                  </div>
                </div>
              </div>
              
              <div 
                className={`overflow-hidden transition-all duration-700 ease-out ${openIndex === index ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="pb-12 md:pl-[120px] max-w-2xl space-y-2">
                  <p className="text-lg md:text-xl font-medium text-white font-mono">
                    {step.subtitle}
                  </p>
                  <p className="text-base md:text-lg leading-relaxed font-light text-zinc-400">
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
