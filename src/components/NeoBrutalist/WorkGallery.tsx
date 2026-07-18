'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { soundManager } from '@/lib/sound';

gsap.registerPlugin(ScrollTrigger);

interface Project {
  id: number;
  title: string;
  cat: string;
  year: string;
  img: string;
}

const projects: Project[] = [
  { id: 1, title: "Arcadia", cat: "Experiential Exhibition", year: "2025", img: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=2670&auto=format&fit=crop" },
  { id: 2, title: "Hyperluminal", cat: "Anamorphic 3D Billboard", year: "2025", img: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop" },
  { id: 3, title: "Synapse", cat: "Projection Mapping Spectacle", year: "2026", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop" },
  { id: 4, title: "Aether", cat: "Physical-Digital Installation", year: "2026", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" },
  { id: 5, title: "Lumina", cat: "Interactive Sensory Environment", year: "2025", img: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=2616&auto=format&fit=crop" },
  { id: 6, title: "Nexus", cat: "Experiential Retail Activation", year: "2026", img: "https://images.unsplash.com/photo-1515462277126-2dd0c162007a?q=80&w=2670&auto=format&fit=crop" }
];

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => soundManager.playHover()}
      onClick={() => soundManager.playClick()}
    >
      <div className="work-card-inner relative overflow-hidden aspect-[4/3] mb-4">
        <img 
          src={project.img} 
          alt={project.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:opacity-0 transition-opacity duration-500"></div>
      </div>
      <div className="flex justify-between items-end border-b border-black/20 group-hover:border-white pb-3 transition-colors duration-300">
        <div>
          <h3 className="text-3xl md:text-4xl font-heading mb-1 text-black group-hover:text-white transition-colors duration-300">{project.title}</h3>
          <span className="text-xs font-mono text-black/70 group-hover:text-white transition-colors duration-300">{project.cat}</span>
        </div>
        <span className="text-xs font-mono text-black/70 group-hover:text-white transition-colors duration-300">{project.year}</span>
      </div>
    </div>
  );
};

export default function WorkGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax effect: Left column moves slower, Right column moves faster
      if (window.innerWidth > 768) {
        gsap.to(leftColRef.current, {
          yPercent: 5,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1
          }
        });

        gsap.to(rightColRef.current, {
          yPercent: -15,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1
          }
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="work" className="relative bg-[#1E65E5] text-black pt-24 pb-48 md:pb-72 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-24 flex flex-col items-center text-center">
            <h2 className="text-[12vw] leading-[0.8] font-heading font-black z-10 text-black">
              SELECTED
            </h2>
            <h2 className="text-[12vw] leading-[0.8] font-heading font-black text-transparent z-10 -mt-4 md:-mt-10" style={{ WebkitTextStroke: "1px #000" }}>
              WORKS
            </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24 px-4 md:px-12">
          
          {/* Left Column - Starts normal, moves down slowly */}
          <div ref={leftColRef} className="flex flex-col gap-12 md:gap-20 pt-0 md:pt-24">
            {projects.filter((_, i) => i % 2 === 0).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {/* Right Column - Starts lower, moves up faster */}
          <div ref={rightColRef} className="flex flex-col gap-12 md:gap-20 md:translate-y-24">
            {projects.filter((_, i) => i % 2 !== 0).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
