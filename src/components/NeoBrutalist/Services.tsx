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
    title: 'EXPERIENTIAL SOLUTIONS', 
    category: 'Immersive Experiences', 
    img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2000',
    desc: "Bringing brands to life through immersive experiences that people don't just see, but feel and remember."
  },
  { 
    id: 2, 
    title: 'BRAND ACTIVATION', 
    category: 'Engagement & Impact', 
    img: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=2000',
    desc: 'Creating bold and memorable brand experiences that spark attention, engagement and connection.'
  },
  { 
    id: 3, 
    title: 'MICE', 
    category: 'Conferences & Events', 
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000',
    desc: 'Creating experiences for conferences, fashion shows, exhibitions and events that inspire, engage and connect.'
  },
  { 
    id: 4, 
    title: 'CAMPAIGN & CONTENT DESIGNING', 
    category: 'Design & Campaigns', 
    img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000',
    desc: 'Turning powerful ideas into purposeful stories through design, content and campaigns that connect, engage and inspire action.'
  },
  { 
    id: 5, 
    title: 'RETAIL MARKETING', 
    category: 'Retail Environments', 
    img: 'https://images.unsplash.com/photo-1515462277126-2dd0c162007a?q=80&w=2000',
    desc: 'Creating retail experiences that attract attention, engage shoppers and turn interactions into action.'
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

      // Mouse Move Effect for Image Reveal (Desktop only)
      let moveReveal: ((e: MouseEvent) => void) | null = null;
      if (window.innerWidth >= 768) {
        moveReveal = (e: MouseEvent) => {
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
      }

      return () => {
        if (moveReveal) window.removeEventListener('mousemove', moveReveal);
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleMouseEnter = (img: string) => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;
    setActiveImage(img);
    gsap.to(revealRef.current, { scale: 1, opacity: 1, duration: 0.3 });
  };

  const handleMouseLeave = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;
    gsap.to(revealRef.current, { scale: 0, opacity: 0, duration: 0.3 });
  };

  return (
    <section
      ref={sectionRef}
      id="services"
      className="pt-6 sm:pt-8 md:pt-10 pb-20 sm:pb-24 bg-[#1E90FF] text-[#0A1F44] relative z-20 overflow-hidden will-change-transform transform-gpu -mt-4 sm:-mt-8 md:-mt-10"
    >
      
      {/* Floating Reveal Image - Fixed position relative to viewport */}
      <div 
        ref={revealRef} 
        className="fixed top-0 left-0 w-[260px] h-[340px] pointer-events-none z-[100] opacity-0 scale-0 hidden md:block rounded-lg overflow-hidden shadow-2xl"
        style={{ willChange: 'transform' }}
      >
        <img src={activeImage} alt="Service Preview" className="w-full h-full object-cover" />
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start select-none mb-8 sm:mb-10 md:mb-12">
          {/* LEFT SIDE: WHAT WE DO (Stacked ERF Neot Heading - exact solid & stroke mix matching Contact Form) */}
          <div className="flex flex-col items-start text-left">
            <h2
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.96] uppercase text-[#0A1F44] font-black tracking-[-0.02em] whitespace-nowrap"
              style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
            >
              <AsciiScramble text="WHAT WE DO" />
            </h2>
          </div>

          {/* RIGHT SIDE: 3-LINE EDITORIAL PARAGRAPH */}
          <div className="flex flex-col items-start lg:items-end text-left lg:text-right pt-4 lg:pt-2">
            <p
              className="text-[10px] sm:text-xs font-mono font-medium tracking-[0.06em] text-[#0A1F44]/75 uppercase leading-[1.6] max-w-xs select-none"
              style={{ fontFamily: "'FF Identification Std Five C Regular', 'FF Identification Std', monospace, sans-serif" }}
            >
              EXPERIENTIAL SOLUTIONS THAT INSPIRE,<br />
              ENGAGE AND ENDURE.<br />
              FROM ORIGIN TO EXCELLENCE.
            </p>
          </div>
        </div>

        <ul ref={listRef} className="border-t border-white/25">
          {services.map((service, idx) => (
            <li 
              key={service.id} 
              className="group border-b border-white/25 relative overflow-hidden cursor-pointer"
              onMouseEnter={() => {
                handleMouseEnter(service.img);
                soundManager.playHover();
              }}
              onMouseLeave={handleMouseLeave}
              onClick={() => {
                soundManager.playClick();
                setOpenIndex(openIndex === idx ? null : idx);
                if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                  setTimeout(() => {
                    ScrollTrigger.refresh();
                  }, 520);
                }
              }}
            >
              <div className="relative z-10 flex justify-between items-center py-5 sm:py-6 md:py-7 px-2 sm:px-4 group-hover:px-4 sm:group-hover:px-6 transition-all duration-300">
                <div className="flex items-baseline gap-4 sm:gap-6 min-w-0 pr-2">
                  <span
                    className="text-xs sm:text-sm font-mono text-white/70 group-hover:text-black transition-colors shrink-0 tracking-wider"
                    style={{ fontFamily: "'FF Identification Std Five C Regular', 'FF Identification Std', monospace, sans-serif" }}
                  >
                    0{service.id}
                  </span>
                  <h3
                    className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white group-hover:text-black transition-colors duration-200 break-words font-semibold tracking-tight"
                    style={{ fontFamily: "'FF Identification Std Five C Regular', 'FF Identification Std', monospace, sans-serif" }}
                  >
                    {service.title}
                  </h3>
                </div>
                
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  <span
                    className="text-[10px] sm:text-xs uppercase tracking-widest text-white/80 group-hover:text-black transition-colors duration-200 hidden sm:inline font-mono"
                    style={{ fontFamily: "'FF Identification Std Five C Regular', 'FF Identification Std', monospace, sans-serif" }}
                  >
                    {service.category}
                  </span>
                  <ArrowUpRight className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${openIndex === idx ? 'text-black rotate-90' : 'text-white/80 group-hover:text-black group-hover:rotate-45'}`} />
                </div>
              </div>

              {/* Dropdown Paragraph container with White Transmissive Glassmorphism */}
              <div 
                className={`overflow-hidden transition-all duration-500 ease-out ${openIndex === idx ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="pb-8 pl-4 pr-4 sm:pl-12 md:pl-16 max-w-2xl">
                  <div className="bg-white/15 border border-white/20 backdrop-blur-sm sm:backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-[0_8px_32px_0_rgba(10,31,68,0.15)]">
                    <div className="flex flex-row items-start gap-3 sm:gap-5">
                      <p
                        className="text-[11px] sm:text-sm leading-[1.55] sm:leading-relaxed font-normal text-white/95 flex-1"
                        style={{ fontFamily: "'FF Identification Std Five C Regular', 'FF Identification Std', monospace, sans-serif" }}
                      >
                        {service.desc}
                      </p>
                      {/* Mobile-only preview image — same image as the desktop hover reveal */}
                      <img
                        src={service.img}
                        alt={service.title}
                        className="md:hidden w-28 h-36 sm:w-32 sm:h-40 rounded-xl object-cover shrink-0 border border-white/30 shadow-lg"
                      />
                    </div>
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
