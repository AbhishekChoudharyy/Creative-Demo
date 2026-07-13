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
    title: "Discovery",
    desc: "We don't start with solutions. We start with questions. We deconstruct your brand to its atomic level, understanding the chaos before we implement the order."
  },
  {
    num: "02",
    title: "Strategy",
    desc: "Chaos needs a container. We build the strategic framework that will hold the vision. Positioning, voice, and visual direction are defined here."
  },
  {
    num: "03",
    title: "Execution",
    desc: "Where the rubber meets the road. We deploy high-fidelity design, motion, and code. No templates. No shortcuts. Just pure craftsmanship."
  },
  {
    num: "04",
    title: "Launch",
    desc: "The reveal. We manage the deployment, ensure performance across the globe, and hand over the keys to your new digital empire."
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
    <section ref={sectionRef} className="py-24 bg-[#050505] text-[#e1e1e1] border-t border-zinc-800">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row mb-24 justify-between items-end">
          <h2 className="text-[10vw] md:text-[8vw] leading-[0.8] tracking-tighter process-title font-heading font-black">
            <AsciiScramble text="THE" /><br/><AsciiScramble text="PROCESS" />
          </h2>
          <p className="max-w-md text-lg mt-8 md:mt-0 font-medium text-zinc-400">
            Our methodology is a blend of rigorous strategy and unbridled creativity.
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
                  <h3 className="text-3xl md:text-6xl font-normal group-hover:translate-x-4 transition-transform duration-500 font-serif-italic">
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
                <div className="pb-12 md:pl-[120px] max-w-2xl">
                  <p className="text-xl md:text-2xl leading-relaxed font-light text-zinc-400">
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
