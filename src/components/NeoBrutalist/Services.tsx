'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { soundManager } from '@/lib/sound';
import AsciiScramble from './AsciiScramble';

gsap.registerPlugin(ScrollTrigger);

const services = [
  { 
    id: 1, 
    title: 'Experiential Marketing', 
    category: 'Strategy & Events', 
    img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2000',
    desc: 'We design high-impact brand activations, immersive corporate exhibitions, and large-scale MICE experiences. Integrating spatial storytelling and structural technology, we build unforgettable environments that connect brands directly to their audiences.'
  },
  { 
    id: 2, 
    title: 'Anamorphic 3D Displays', 
    category: 'Out of Home', 
    img: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=2000',
    desc: 'Engineering state-of-the-art 3D digital billboards and volumetric optical illusions that capture massive public attention. We produce hyper-realistic, forced-perspective CGI content optimized for urban digital screens.'
  },
  { 
    id: 3, 
    title: 'Experience Design', 
    category: 'Interaction', 
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000',
    desc: 'Developing interactive digital-physical worlds and responsive installations. Blending gesture tracking, spatial audio, and sensory triggers, we construct environments that morph dynamically in response to human presence.'
  },
  { 
    id: 4, 
    title: 'Multimedia Production', 
    category: 'CGI & Motion', 
    img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000',
    desc: 'High-fidelity projection mapping spectacles and bespoke visual content production. From conceptual rendering to real-time animation, we shape the sensory layers that transform any physical architecture into a living canvas.'
  },
];

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const [activeImage, setActiveImage] = useState(services[0].img);
  const [openIndex, setOpenIndex] = useState<number | null>(null); // starts collapsed

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Setup reveal element centering
      gsap.set(revealRef.current, { xPercent: -50, yPercent: -50 });

      // List Item Reveal
      const items = listRef.current?.children;
      if (items) {
        Array.from(items).forEach((item) => {
          gsap.fromTo(item, 
            { y: 50, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              scrollTrigger: {
                trigger: item,
                start: "top 95%",
                toggleActions: "play reverse play reverse",
              }
            }
          );
        });
      }

      // Mouse Move Effect for Image Reveal
      const moveReveal = (e: MouseEvent) => {
        if (!revealRef.current) return;
        
        gsap.to(revealRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.5,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      };

      window.addEventListener('mousemove', moveReveal);
      return () => window.removeEventListener('mousemove', moveReveal);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleMouseEnter = (img: string) => {
    setActiveImage(img);
    gsap.to(revealRef.current, { scale: 1, opacity: 1, duration: 0.3 });
  };

  const handleMouseLeave = () => {
    gsap.to(revealRef.current, { scale: 0, opacity: 0, duration: 0.3 });
  };

  return (
    <section ref={sectionRef} id="services" className="py-24 bg-[#123C73] text-black relative z-10 overflow-hidden">
      
      {/* Floating Reveal Image - Fixed position relative to viewport */}
      <div 
        ref={revealRef} 
        className="fixed top-0 left-0 w-[300px] h-[400px] pointer-events-none z-[100] opacity-0 scale-0 hidden md:block rounded-lg overflow-hidden shadow-2xl"
        style={{ willChange: 'transform' }}
      >
        <img src={activeImage} alt="Service Preview" className="w-full h-full object-cover" />
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start mb-20">
          <h2 className="text-6xl md:text-8xl font-bold mb-8 md:mb-0 font-heading">
            <AsciiScramble text="Our" /><br /><AsciiScramble text="Expertise" />
          </h2>
          <p className="max-w-xs text-sm uppercase tracking-wide text-black/70 pt-4 font-mono">
            Comprehensive design solutions for forward-thinking brands.
          </p>
        </div>

        <ul ref={listRef} className="border-t border-black/20">
          {services.map((service, idx) => (
            <li 
              key={service.id} 
              className="group border-b border-black/20 relative overflow-hidden cursor-pointer"
              onMouseEnter={() => {
                handleMouseEnter(service.img);
                soundManager.playHover();
              }}
              onMouseLeave={handleMouseLeave}
              onClick={() => {
                soundManager.playClick();
                setOpenIndex(openIndex === idx ? null : idx);
              }}
            >
              <div className="relative z-10 flex justify-between items-center py-12 px-4 group-hover:px-8 transition-all duration-500">
                <div className="flex items-baseline gap-8">
                  <span className="text-xs font-mono text-black/50 group-hover:text-white transition-colors">0{service.id}</span>
                  <h3 className="text-3xl md:text-5xl group-hover:text-white transition-colors group-hover:translate-x-4 duration-500">{service.title}</h3>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-xs uppercase tracking-widest opacity-0 md:opacity-100 group-hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 delay-75">
                    {service.category}
                  </span>
                  <ArrowUpRight className={`w-8 h-8 text-black/50 transition-all duration-500 ${openIndex === idx ? 'text-white rotate-90' : 'group-hover:text-white group-hover:rotate-45'}`} />
                </div>
              </div>

              {/* Dropdown Paragraph container with White Transmissive Glassmorphism */}
              <div 
                className={`overflow-hidden transition-all duration-500 ease-out ${openIndex === idx ? 'max-h-[350px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="pb-12 pl-4 pr-4 md:pl-[120px] max-w-3xl">
                  <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-xl p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.15)]">
                    <p className="text-lg md:text-xl leading-relaxed font-light text-white">
                      {service.desc}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
