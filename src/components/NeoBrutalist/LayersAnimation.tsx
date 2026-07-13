'use client';

import { FC, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { soundManager } from '@/lib/sound';

const SLIDES = [
  {
    title: "EXPERIENCE",
    desc: "Sensory activations designed to connect human emotion to spatial architecture. We build interactive physical-digital installations that blend architecture, sound, and visual design."
  },
  {
    title: "ILLUSION",
    desc: "Volumetric 3D anamorphic billboards that redefine urban spaces and public advertising. We engineer forced-perspective visual content that creates three-dimensional depth on standard flat screens."
  },
  {
    title: "MAPPING",
    desc: "High-fidelity projection mapping and interactive digital art designed to transform any physical environment. We map complex architectural surfaces to turn structures into storytelling mediums."
  }
];

const LAYERS_IMAGES = [
  "/layers/1.jpg",
  "/layers/2.jpg",
  "/layers/3.jpg",
  "/layers/4.jpg",
  "/layers/5.jpg",
  "/layers/6.jpg"
];

export const LayersAnimation: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const layerItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const layerImagesRef = useRef<(HTMLDivElement | null)[]>([]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const isAnimating = useRef(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    // Preload and decode images asynchronously on mount to prevent click transition freezes
    LAYERS_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
      if (img.decode) {
        img.decode().catch((err) => {
          console.warn(`Failed to preload/decode image: ${src}`, err);
        });
      }
    });
  }, []);

  // Set initial states
  useEffect(() => {
    // Hide all contents except active one
    contentRefs.current.forEach((el, i) => {
      if (el) {
        if (i !== currentIndex) {
          el.style.visibility = 'hidden';
          el.style.pointerEvents = 'none';
        } else {
          el.style.visibility = 'visible';
          el.style.pointerEvents = 'auto';
        }
      }
    });

    // Hide layer items initially
    layerItemsRef.current.forEach((el) => {
      if (el) {
        gsap.set(el, { opacity: 0, clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' });
      }
    });
  }, []);

  const handleTransition = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    soundManager.playWhooshUp(0.25);

    const nextIndex = (currentIndex + 1) % SLIDES.length;

    const activeContent = contentRefs.current[currentIndex];
    const nextContent = contentRefs.current[nextIndex];
    const layerItems = layerItemsRef.current.filter(Boolean) as HTMLDivElement[];
    const layerImages = layerImagesRef.current.filter(Boolean) as HTMLDivElement[];

    if (!activeContent || !nextContent || layerItems.length === 0) {
      isAnimating.current = false;
      return;
    }

    const activeTitle = activeContent.querySelector('.slide-title');
    const activeDesc = activeContent.querySelector('.slide-desc');
    const nextTitle = nextContent.querySelector('.slide-title');
    const nextDesc = nextContent.querySelector('.slide-desc');

    // Create GSAP transition timeline
    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating.current = false;
      }
    });

    // Reset next content elements positions
    gsap.set([nextTitle, nextDesc], { yPercent: 150 });

    // 1. Reset layer positions (Clip-Path wipe from bottom) - keep opacity: 0 initially to avoid GPU layout rendering lag,
    // but set the first layer's opacity to 1 immediately so its initial wipe is fully visible without frame drops
    gsap.set(layerItems, { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' });
    gsap.set(layerItems[0], { opacity: 1 });
    
    tl.to(layerItems, {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      duration: 1.2,
      ease: 'power3.inOut',
      stagger: {
        each: 0.15,
        onStart: function(this: any) {
          const targets = this.targets();
          if (targets && targets.length > 0) {
            // Set opacity of active stagger layer to 1 dynamically when it starts animating to prevent rendering all 6 layers simultaneously
            gsap.set(targets[0], { opacity: 1 });
          }
        },
        onComplete: function(this: any) {
          const targets = this.targets();
          if (targets && targets.length > 0) {
            const el = targets[0] as HTMLDivElement;
            const idx = layerItems.indexOf(el);
            if (idx > 0) {
              // Set opacity of covered previous layer to 0 for GPU performance
              gsap.set(layerItems[idx - 1], { opacity: 0 });
            }
          }
        }
      }
    }, 0);

    // 2. Animate brightness of layer background images to look high-contrast (skipped on mobile for GPU performance)
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (!isMobile) {
      tl.fromTo(layerImages, 
        { yPercent: 0, filter: 'brightness(30%)' },
        {
          filter: 'brightness(100%)',
          duration: 1.2,
          ease: 'power3.inOut',
          stagger: 0.15
        }, 
        0
      );
    }

    // 3. Animate current slide text up and out
    tl.to([activeTitle, activeDesc], {
      yPercent: -150,
      stagger: -0.04,
      duration: 0.8,
      ease: 'power3.in'
    }, 0);

    // 4. Midway callback: toggle active index in state and hide previous content wrapper
    tl.add(() => {
      setCurrentIndex(nextIndex);
      activeContent.style.visibility = 'hidden';
      activeContent.style.pointerEvents = 'none';
      
      // Reveal the next content wrapper
      nextContent.style.visibility = 'visible';
      nextContent.style.pointerEvents = 'auto';
      
      soundManager.playWhooshDown(0.15);
    }, 0.7);

    // 5. Animate new slide text up and in
    tl.to([nextTitle, nextDesc], {
      yPercent: 0,
      stagger: -0.1,
      duration: 0.9,
      ease: 'expo.out'
    }, 0.75);

    // 6. Clip-out the last layer (collapsing upward) to reveal the new content underneath
    const lastItem = layerItems[layerItems.length - 1];
    tl.to(lastItem, {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
      duration: 0.9,
      ease: 'power4.inOut',
      onComplete: () => {
        gsap.set(lastItem, { opacity: 0 });
      }
    }, '>');
  };

  return (
    <div
      ref={containerRef}
      onClick={handleTransition}
      className="relative w-full min-h-screen bg-[#fe5416] flex items-center justify-center overflow-hidden cursor-pointer select-none border-t border-black/10"
    >
      {/* Background Grid Accent Lines */}
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-1 pointer-events-none opacity-40">
        <div className="border-r border-black/10 h-full" />
        <div className="border-r border-black/10 h-full" />
        <div className="border-r border-black/10 h-full" />
      </div>

      {/* Fullscreen Animation Layers */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-20">
        {LAYERS_IMAGES.map((imgSrc, i) => (
          <div
            key={i}
            ref={(el) => { layerItemsRef.current[i] = el; }}
            className="absolute inset-0 w-full h-full overflow-hidden opacity-0"
            style={isMobile ? undefined : { willChange: 'clip-path' }}
          >
            <div
              ref={(el) => { layerImagesRef.current[i] = el; }}
              className="absolute inset-0 w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${imgSrc})` }}
            />
          </div>
        ))}
      </div>

      {/* Content Slides */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 flex flex-col justify-center min-h-[55vh] md:min-h-[60vh]">
        <div className="relative w-full grid grid-cols-1 grid-rows-1 items-center">
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              ref={(el) => { contentRefs.current[i] = el; }}
              className="col-start-1 row-start-1 w-full flex flex-col overflow-hidden"
            >
              <h2 className="slide-title text-5xl xs:text-6xl sm:text-8xl md:text-[11vw] font-heading font-black tracking-tighter text-black uppercase leading-none select-none">
                {slide.title}
              </h2>
              <p className="slide-desc text-md sm:text-lg md:text-xl font-mono text-black/85 max-w-2xl mt-4 sm:mt-8 leading-relaxed select-none border-l border-black/20 pl-6">
                {slide.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive HUD labels */}
      <div className="absolute top-12 left-8 md:left-16 font-mono text-[10px] tracking-[0.2em] text-black/50 uppercase pointer-events-none">
        CREATIVE AGENCY // LABS
      </div>
      
      <div className="absolute top-12 right-8 md:right-16 font-mono text-[10px] tracking-[0.2em] text-black/60 uppercase pointer-events-none flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
        VARIATION_01
      </div>

      <div className="absolute bottom-12 right-8 md:right-16 font-mono text-[10px] tracking-[0.2em] text-black/50 uppercase pointer-events-none">
        0{currentIndex + 1} / 0{SLIDES.length}
      </div>

      <div className="absolute bottom-12 left-8 md:left-16 pointer-events-none select-none">
        <div className="bg-black/10 text-black/80 font-mono text-[10px] md:text-xs font-bold px-4 py-2 border border-black/10 rounded-full backdrop-blur-sm flex items-center gap-2.5 transition-all">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-black/80"></span>
          </span>
          <span className="tracking-[0.18em]">CLICK ANYWHERE TO REVEAL</span>
        </div>
      </div>
    </div>
  );
};
