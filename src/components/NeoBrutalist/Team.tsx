'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { soundManager } from '@/lib/sound';
import AsciiScramble from './AsciiScramble';

gsap.registerPlugin(ScrollTrigger);

const team = [
  { name: "Abhay Mallick", role: "Founder / Developer", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop" },
  { name: "Sarah J.", role: "Design Lead", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop" },
  { name: "Davide R.", role: "Tech Director", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop" },
];

export default function Team() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".team-card", {
        y: 100,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play reverse play reverse",
          onEnter: () => {
            soundManager.playCardReveal();
          },
          onEnterBack: () => {
            soundManager.playCardReveal();
          }
        }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-[#050505] text-[#e1e1e1]">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-24 text-center">
          <span className="text-xs font-mono uppercase tracking-widest border border-white/20 px-4 py-2 rounded-full">The Minds</span>
          <h2 className="mt-8 text-5xl md:text-7xl font-heading font-bold uppercase leading-none">
            <AsciiScramble text="Collective" /><br/><AsciiScramble text="Consciousness" />
          </h2>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, i) => (
            <div
              key={i}
              className="team-card group cursor-pointer"
              onMouseEnter={() => soundManager.playHover()}
              onClick={() => soundManager.playClick()}
            >
              <div className="relative overflow-hidden aspect-[3/4] mb-6">
                <img 
                  src={member.img} 
                  alt={member.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <div className="border-t border-white/20 pt-4 flex justify-between items-end">
                <h3 className="text-2xl font-serif-italic">{member.name}</h3>
                <span className="text-xs uppercase tracking-widest text-gray-500">{member.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
