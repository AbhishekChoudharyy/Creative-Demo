"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { soundManager } from "@/lib/sound";

import Intro from "@/components/NeoBrutalist/Intro";
import WorkGallery from "@/components/NeoBrutalist/WorkGallery";
import ImmersiveCarousel from "@/components/NeoBrutalist/ImmersiveCarousel";
import Team from "@/components/NeoBrutalist/Team";
import Services from "@/components/NeoBrutalist/Services";
import ContactForm from "@/components/NeoBrutalist/ContactForm";
import CustomCursor from "@/components/CustomCursor";
import BlurText from "@/components/NeoBrutalist/BlurText";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";


const Main = dynamic(() => import("@/components/Main").then((mod) => mod.Main), {
  ssr: false,
});


const navItems = [
  {
    label: "Experience Design",
    bgColor: "#1c1917",
    textColor: "#ffffff",
    links: [
      { label: "Interactive Spaces", href: "#work" },
      { label: "Spatial Design", href: "#work" },
      { label: "Sensory Engineering", href: "#work" }
    ]
  },
  {
    label: "Anamorphic 3D",
    bgColor: "#09090b",
    textColor: "#ffffff",
    links: [
      { label: "Digital Billboards", href: "#work" },
      { label: "Visual Illusions", href: "#work" },
      { label: "CGI Production", href: "#work" }
    ]
  },
  {
    label: "Experiential Marketing",
    bgColor: "#27272a",
    textColor: "#ffffff",
    links: [
      { label: "Brand Activations", href: "#work" },
      { label: "Immersive Events", href: "#work" },
      { label: "Projection Spectacles", href: "#work" }
    ]
  }
];

export default function Home() {
  const [bootState, setBootState] = useState<'loading' | 'ready' | 'booted'>('loading');
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const flashRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [scrollCount, setScrollCount] = useState(0);
  const [isOverWhite, setIsOverWhite] = useState(false);
  const triggerFlashForwardRef = useRef<(() => void) | null>(null);

  // Navbar dynamic vertical scroll movement with buttery delay lerp & end fade-out
  useEffect(() => {
    let rafId = 0;
    let isRunning = true;
    let lastY = window.scrollY;

    // Physics interpolation state
    let targetY = 0;
    let currentY = 0;
    let targetOpacity = 1;
    let currentOpacity = 1;

    const updateTargets = () => {
      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - window.innerHeight;
      const progress = maxScroll <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / maxScroll));

      const count = Math.round(progress * 100);
      setScrollCount(count);

      // Trigger flash and forward at 30%–31% scroll count when scrolling forward (downward)
      const isScrollingDown = window.scrollY > lastY;
      lastY = window.scrollY;
      if (isScrollingDown && count >= 30 && count <= 31) {
        triggerFlashForwardRef.current?.();
      }

      const navEl = navRef.current;
      const navHeight = navEl ? navEl.offsetHeight : 80;
      const maxTravel = Math.max(0, window.innerHeight - navHeight);
      targetY = progress * maxTravel;

      // Gracefully fade out towards the very end of the page (starts at 90%, completely hidden at 100%)
      if (progress > 0.90) {
        const fadeRatio = (progress - 0.90) / (1 - 0.90);
        targetOpacity = Math.max(0, 1 - fadeRatio);
      } else {
        targetOpacity = 1;
      }
    };

    const loop = () => {
      if (!isRunning) return;

      // Buttery smooth organic inertia lerp with gentle delay (0.075 damping)
      currentY += (targetY - currentY) * 0.075;
      currentOpacity += (targetOpacity - currentOpacity) * 0.085;

      const navEl = navRef.current;
      if (navEl) {
        navEl.style.transform = `translate3d(0, ${currentY.toFixed(2)}px, 0)`;
        navEl.style.opacity = currentOpacity < 0.005 ? '0' : currentOpacity.toFixed(3);
        navEl.style.pointerEvents = currentOpacity < 0.08 ? 'none' : 'auto';
      }

      // Check section background at current interpolated position for contrast
      const navHeight = navEl ? navEl.offsetHeight : 80;
      const checkY = currentY + navHeight / 2;
      const introEl = document.getElementById('intro');
      const workEl = document.getElementById('work');
      const contactEl = document.getElementById('contact');

      let overWhite = false;
      if (introEl) {
        const rect = introEl.getBoundingClientRect();
        if (rect.top <= checkY && rect.bottom >= checkY) overWhite = true;
      }
      if (workEl) {
        const rect = workEl.getBoundingClientRect();
        if (rect.top <= checkY && rect.bottom >= checkY) overWhite = true;
      }
      if (contactEl) {
        const rect = contactEl.getBoundingClientRect();
        if (rect.top <= checkY && rect.top + 340 >= checkY) overWhite = true;
      }
      const gapEl = document.getElementById('works-shapes-gap');
      if (gapEl) {
        const rect = gapEl.getBoundingClientRect();
        if (rect.top <= checkY && rect.top + rect.height * 0.45 >= checkY) overWhite = true;
      }

      setIsOverWhite(overWhite);

      rafId = requestAnimationFrame(loop);
    };

    updateTargets();
    currentY = targetY;
    currentOpacity = targetOpacity;
    rafId = requestAnimationFrame(loop);

    window.addEventListener('scroll', updateTargets, { passive: true });
    window.addEventListener('resize', updateTargets);

    return () => {
      isRunning = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', updateTargets);
      window.removeEventListener('resize', updateTargets);
    };
  }, []);

  // ── Cinematic color-flash: Work → Shapes boundary par Shapes section ka
  // exact blue poore viewport ko le leta hai, phir section reveal hota hai.
  // Har boundary cross (dono direction) + Shapes ke end pe bhi trigger hota hai.
  // ── Cinematic color-flash: Work ↔ Shapes boundary ──
  // Highly optimized for mobile: ignoreMobileResize, momentum cooldown, GPU accelerated layer, and natural landing.
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const overlay = flashRef.current;
    const shapesSection = document.getElementById('services-carousel');
    const workSection = document.getElementById('work');
    const gapSection = document.getElementById('works-shapes-gap');
    if (!overlay || !shapesSection || !workSection) return;

    let isFlashing = false;
    let lastFlashTime = 0;
    const COOLDOWN_MS = 1000;

    const runFlash = (color: string, destination: 'shapes' | 'work') => {
      const now = Date.now();
      if (isFlashing || now - lastFlashTime < COOLDOWN_MS) return;

      isFlashing = true;
      lastFlashTime = now;
      gsap.killTweensOf(overlay);

      const tl = gsap.timeline({
        onComplete: () => {
          isFlashing = false;
          lastFlashTime = Date.now();
          ScrollTrigger.refresh();
        },
      });

      tl.set(overlay, { display: 'block', background: color, opacity: 0 })
        // Smooth cinematic transition into full color
        .to(overlay, { opacity: 1, duration: 0.28, ease: 'power2.inOut' })
        // While fully masked: jump instantly to destination
        .call(
          () => {
            if (destination === 'shapes') {
              const targetTop = shapesSection.getBoundingClientRect().top + (window.scrollY || window.pageYOffset);
              window.scrollTo({ top: Math.round(targetTop), behavior: 'instant' as ScrollBehavior });
            } else {
              // Returning to Work: frame the 3D cards carousel nicely in view
              const currentWorkTop = workSection.getBoundingClientRect().top + (window.scrollY || window.pageYOffset);
              const stageEl = workSection.querySelector('.cursor-grab') as HTMLElement | null;
              let targetTop: number;
              if (stageEl) {
                const stageRect = stageEl.getBoundingClientRect();
                const stageAbsTop = stageRect.top + (window.scrollY || window.pageYOffset);
                targetTop = stageAbsTop - Math.max(20, (window.innerHeight - stageRect.height) / 2);
              } else {
                targetTop = currentWorkTop + Math.max(0, workSection.offsetHeight - window.innerHeight);
              }
              window.scrollTo({ top: Math.max(0, Math.round(targetTop)), behavior: 'instant' as ScrollBehavior });
            }
          },
          undefined,
          0.28
        )
        // Brief hold so the new section renders stably underneath
        .to(overlay, { opacity: 1, duration: 0.10, ease: 'none' })
        // Silky fade out revealing the new section
        .to(overlay, { opacity: 0, duration: 0.45, ease: 'power2.out' })
        .set(overlay, { display: 'none' });
    };

    // Work → Shapes ONLY: blue flash & forward jump
    const shapesColor = window.getComputedStyle(shapesSection).backgroundColor || '#1E90FF';
    const flashToShapes = () => {
      const shapesRect = shapesSection.getBoundingClientRect();
      // Ensure we are scrolling forward towards shapes (shapes is still below)
      if (shapesRect.top > window.innerHeight * 0.12) {
        runFlash(shapesColor, 'shapes');
      }
    };

    triggerFlashForwardRef.current = flashToShapes;

    // Trigger exactly at 30%–31% scroll count for Work → Shapes ONLY
    const stA = ScrollTrigger.create({
      start: () => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        return maxScroll * 0.305;
      },
      onEnter: () => {
        flashToShapes();
      },
    });

    return () => {
      triggerFlashForwardRef.current = null;
      stA.kill();
    };
  }, []);

  useEffect(() => {
    setIsMuted(soundManager.getMutedState());
  }, []);

  useEffect(() => {
    // Generate a static noise pattern on client side to avoid expensive SVG feTurbulence filters which lag scrolling on mobile devices
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const imgData = ctx.createImageData(128, 128);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const value = Math.floor(Math.random() * 255);
        data[i] = value;     // R
        data[i + 1] = value;   // G
        data[i + 2] = value;   // B
        data[i + 3] = 16;      // A (subtle opacity)
      }
      ctx.putImageData(imgData, 0, 0);
      const dataUrl = canvas.toDataURL();
      const overlay = document.querySelector('.noise-overlay') as HTMLElement;
      if (overlay) {
        overlay.style.backgroundImage = `url(${dataUrl})`;
      }
    }
  }, []);

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
  };

  useEffect(() => {
    if (bootState === 'loading') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setBootState('ready');
            return 100;
          }
          const increment = Math.floor(Math.random() * 12) + 6;
          return Math.min(100, prev + increment);
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [bootState]);

  useEffect(() => {
    if (bootState !== 'booted') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [bootState]);

  useEffect(() => {
    if (bootState === 'booted' && !isMuted) {
      soundManager.playBackgroundMusic();
    }
  }, [bootState, isMuted]);

  return (
    <div className="min-h-screen bg-[#1E90FF] text-[#0A1F44] selection:bg-[#0A1F44]/10 relative">
      <CustomCursor />

      {/* Section-change color flash layer (color set dynamically per trigger) */}
      <div
        ref={flashRef}
        aria-hidden="true"
        className="fixed inset-0 z-[99998] pointer-events-none will-change-[opacity] transform-gpu"
        style={{ display: 'none', transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
      />
      {bootState !== 'booted' && (
        <div className={`fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center font-mono select-none transition-all duration-700 ease-in-out ${isExiting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex flex-col items-center px-6 text-center z-10">

            {/* Brand Lockup: Exact spacing and proportional size matching reference image */}
            <div className="inline-flex flex-col items-stretch w-fit max-w-[90vw] select-none text-[#0A1F44] normal-case">
              <BlurText
                text="Origo"
                delay={60}
                duration={0.75}
                stagger={0.06}
                direction="bottom"
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none text-[#0A1F44] normal-case font-erf text-left"
                style={{ fontFamily: "'ERF Neot', sans-serif", textTransform: 'none' }}
              />
              <BlurText
                text="ATELIER"
                delay={260}
                duration={0.75}
                stagger={0.045}
                direction="bottom"
                className="w-full flex justify-between items-center text-[10px] sm:text-xs md:text-sm lg:text-base font-bold uppercase leading-none text-[#1E90FF] font-sans mt-2 sm:mt-2.5 md:mt-3"
                style={{ fontWeight: 700, color: '#1E90FF' }}
              />
            </div>

            {/* Content / Action Area */}
            <div className="mt-8 sm:mt-12 md:mt-14 h-10 flex items-center justify-center">
              {bootState === 'loading' ? (
                <div className="flex flex-col items-center gap-2.5">
                  <span className="text-[11px] sm:text-xs font-mono tracking-[0.3em] text-[#0A1F44]/60 uppercase">
                    [ LOADING • {progress}% ]
                  </span>
                  <div className="w-24 sm:w-28 h-[1px] bg-[#0A1F44]/15 relative overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 left-0 bg-[#0A1F44] transition-all duration-150 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    soundManager.playBootSound();
                    soundManager.playBackgroundMusic();
                    setIsExiting(true);
                    setTimeout(() => {
                      setBootState('booted');
                    }, 700);
                  }}
                  onMouseEnter={() => soundManager.playHover()}
                  className="text-xs sm:text-sm font-mono tracking-[0.3em] text-[#0A1F44]/80 hover:text-[#0A1F44] transition-all duration-300 cursor-pointer focus:outline-none uppercase hover:tracking-[0.4em]"
                >
                  [ ENTER ]
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Sticky Navbar (scrolls down from start of viewport to end of viewport, staying at bottom at end of site) */}
      <div
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-5 sm:px-8 py-5 sm:py-8 pointer-events-auto text-xs font-mono tracking-widest uppercase mix-blend-normal will-change-transform"
      >
        {/* Brand Lockup: Origo ATELIER (Replaces logo image, active on desktop & mobile) */}
        <div
          onClick={() => {
            soundManager.playClick();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center select-none cursor-pointer hover:opacity-75 transition-opacity min-h-[44px] normal-case"
        >
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span
              className="text-base sm:text-lg leading-none tracking-[0.02em] font-bold normal-case text-[#0A1F44]"
              style={{ fontFamily: "'ERF Neot', sans-serif", textTransform: 'none' }}
            >
              Origo
            </span>
            <span
              className="text-[10px] sm:text-[11.5px] font-extralight uppercase tracking-[0.26em] leading-none font-sans transition-colors duration-300"
              style={{
                fontWeight: 200,
                color: isOverWhite ? '#1E90FF' : '#FFFFFF',
              }}
            >
              ATELIER
            </span>
          </div>
        </div>

        {/* Right Navigation Controls */}
        <div
          className="flex items-center gap-2.5 sm:gap-4 md:gap-8 transition-colors duration-300"
          style={{ color: isOverWhite ? '#0A1F44' : '#FFFFFF' }}
        >
          <button
            onClick={handleToggleMute}
            onMouseEnter={() => soundManager.playHover()}
            aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
            className="min-h-[44px] inline-flex items-center hover:opacity-75 transition-opacity cursor-pointer font-medium px-0.5 sm:px-1"
          >
            {/* Mobile: Sleek Mute / Unmute Icon */}
            <span className="sm:hidden flex items-center justify-center">
              {isMuted ? (
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fillOpacity="0.2" />
                  <line x1="22" y1="9" x2="16" y2="15" />
                  <line x1="16" y1="9" x2="22" y2="15" />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fillOpacity="0.2" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              )}
            </span>
            {/* Desktop: [ SOUND ON / OFF ] */}
            <span className="hidden sm:inline">
              [ SOUND {isMuted ? 'OFF' : 'ON'} ]
            </span>
          </button>
          <span className="opacity-80 inline font-mono">[ {String(scrollCount).padStart(3, '0')} ]</span>
          <button
            onClick={() => {
              soundManager.playClick();
              const contactSection = document.getElementById("contact");
              contactSection?.scrollIntoView({ behavior: "smooth" });
            }}
            onMouseEnter={() => soundManager.playHover()}
            className="min-h-[44px] inline-flex items-center hover:opacity-75 transition-opacity cursor-pointer font-bold px-0.5 sm:px-1"
          >
            CONTACT
          </button>
        </div>
      </div>

      <div className="noise-overlay"></div>
      {/* SECTION 1: HERO */}
      <section className="relative min-h-screen flex flex-col justify-between overflow-hidden px-6 lg:px-8 bg-[#1E90FF]">
        {/* Ball of Glass Interactive 3D Canvas Background (Z-Index 20) */}
        <div className="absolute inset-0 z-20 w-full h-full">
          <Main />
        </div>

        {/* Soft atmospheric dissolve into Intro pure white canvas (removes any dark seam) */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.18) 25%, rgba(255, 255, 255, 0.58) 60%, rgba(255, 255, 255, 0.92) 88%, #FFFFFF 100%)',
          }}
          aria-hidden="true"
        />
      </section>
      {/* Neo-Brutalist Portfolio Sections */}
      <Intro />
      <WorkGallery />

      {/* Extra scroll buffer gap between Works and Shapes — footer jese soft organic gradient */}
      <div
        id="works-shapes-gap"
        className="relative w-full h-[32vh] sm:h-[42vh] md:h-[50vh] pointer-events-none select-none"
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 24%, #F0F6FD 40%, #C4E1FD 56%, #70B4F9 70%, #1E90FF 82%, #1E90FF 100%)',
        }}
        aria-hidden="true"
      />

      <ImmersiveCarousel />
      <Services />

      {/* Unified Contact & Footer Section */}
      <ContactForm />
    </div>
  );
}
