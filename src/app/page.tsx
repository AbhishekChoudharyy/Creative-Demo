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
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";


const Main = dynamic(() => import("@/components/Main").then((mod) => mod.Main), {
  ssr: false,
});


const logoPath = "/og.png";

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
  const [scrollCount, setScrollCount] = useState(0);

  // Navbar counter: 000 → 100 based on total page scroll distance
  useEffect(() => {
    const updateCount = () => {
      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) {
        setScrollCount(0);
        return;
      }
      const pct = Math.min(100, Math.max(0, Math.round((window.scrollY / maxScroll) * 100)));
      setScrollCount(pct);
    };
    updateCount();
    window.addEventListener('scroll', updateCount, { passive: true });
    window.addEventListener('resize', updateCount);
    return () => {
      window.removeEventListener('scroll', updateCount);
      window.removeEventListener('resize', updateCount);
    };
  }, []);

  // ── Cinematic color-flash: Work → Shapes boundary par Shapes section ka
  // exact blue poore viewport ko le leta hai, phir section reveal hota hai.
  // Har boundary cross (dono direction) + Shapes ke end pe bhi trigger hota hai.
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const overlay = flashRef.current;
    const shapesSection = document.getElementById('services-carousel');
    if (!overlay || !shapesSection) return;

    // Jump instantly (no smooth scrolling) so a section fills the
    // entire viewport while the screen is fully covered by the flash.
    const jumpToSection = (el: HTMLElement) => {
      const targetTop = el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset);
      window.scrollTo({ top: targetTop, behavior: 'instant' as ScrollBehavior });
    };

    // Fast-forward ALL scroll animations inside a section so it appears
    // fully formed under the flash — no entrance animations playing.
    const fastForwardSection = (section: HTMLElement) => {
      ScrollTrigger.getAll().forEach((st) => {
        const trig = st.trigger as Element | null;
        const pinned = st.pin as Element | null;
        const inside =
          (trig && section.contains(trig)) ||
          (pinned && section.contains(pinned));
        if (!inside) return;
        const anim = (st as unknown as { animation?: gsap.core.Tween }).animation;
        if (anim) {
          anim.progress(1);
        }
      });
    };

    // One flash at a time — the two direction flashes stay fully separate
    let flashActive = false;

    const runFlash = (color: string, target: HTMLElement | null) => {
      if (flashActive) return;
      flashActive = true;
      gsap.killTweensOf(overlay);

      const tl = gsap.timeline({
        onComplete: () => {
          flashActive = false;
        },
      });
      tl.set(overlay, { display: 'block', background: color, opacity: 0 })
        // Smooth flash pop to full color
        .to(overlay, { opacity: 1, duration: 0.12, ease: 'power2.in' })
        // While fully covered: snap to the target section + fast-forward it
        .call(
          () => {
            if (target) {
              jumpToSection(target);
              fastForwardSection(target);
            }
          },
          undefined,
          0.12
        )
        // Hold full color while the section settles underneath
        .to(overlay, { opacity: 1, duration: 0.18, ease: 'none' })
        // Smooth fade away, revealing the section in its final state
        .to(overlay, { opacity: 0, duration: 0.45, ease: 'power2.inOut' })
        .set(overlay, { display: 'none' });
    };

    // Work → Shapes: blue flash (Shapes section's own color), full viewport
    const shapesColor = window.getComputedStyle(shapesSection).backgroundColor || '#1E90FF';
    const flashToShapes = () => runFlash(shapesColor, shapesSection);

    // Shapes → Work: white flash, Work section fast-forwarded
    const flashBackToWork = () => {
      const workSection = document.getElementById('work');
      if (!workSection) return;
      runFlash('#FFFFFF', workSection);
    };

    // Work → Shapes: fires the INSTANT the Work section ends — one scroll
    // past work's end and the Shapes section takes over the full viewport,
    // fast-forwarded, with no extra scrolling needed.
    const stA = ScrollTrigger.create({
      trigger: shapesSection,
      start: 'top bottom-=1px',
      onEnter: flashToShapes,
    });

    // Shapes → Work: fires only when the Shapes page is already filling the
    // viewport and the user keeps scrolling up — white flash → Work.
    const stB = ScrollTrigger.create({
      trigger: shapesSection,
      start: 'top top+=1px',
      onLeaveBack: flashBackToWork,
    });

    return () => {
      stA.kill();
      stB.kill();
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

  return (
    <div className="min-h-screen bg-[#1E90FF] text-[#0A1F44] selection:bg-[#0A1F44]/10 relative">
      <CustomCursor />

      {/* Section-change color flash layer (color set dynamically per trigger) */}
      <div
        ref={flashRef}
        aria-hidden="true"
        className="fixed inset-0 z-[99998] pointer-events-none"
        style={{ display: 'none' }}
      />
      {bootState !== 'booted' && (
        <div className={`fixed inset-0 bg-[#080808] z-[9999] flex flex-col items-center justify-center font-mono select-none transition-all duration-700 ease-in-out ${isExiting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'}`}>
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

          <div className="flex flex-col items-center max-w-xs w-full px-4 text-center z-10 space-y-12">

            {/* Title and Subtitle */}
            <div className="space-y-4 flex flex-col items-center">
              <img
                src="/logo-white-transparent.png"
                alt="Origo Atelier"
                className="w-36 md:w-44 h-auto object-contain"
              />
              <p className="text-[10px] text-white/70 tracking-[0.4em] uppercase font-bold">
                FROM ORIGIN TO EXCELLENCE
              </p>
            </div>

            {/* Content Area */}
            <div className="w-full h-12 flex items-center justify-center">
              {bootState === 'loading' ? (
                <div className="flex flex-col items-center space-y-3 w-full">
                  <span className="text-[10px] text-white/50 tracking-[0.25em] font-medium uppercase">
                    LOADING • {progress}%
                  </span>
                  <div className="w-24 h-[1px] bg-white/10 relative overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 left-0 bg-white transition-all duration-150 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    soundManager.playBootSound();
                    setIsExiting(true);
                    setTimeout(() => {
                      setBootState('booted');
                    }, 700);
                  }}
                  onMouseEnter={() => soundManager.playHover()}
                  className="px-8 py-2.5 border border-white/20 hover:border-white text-white hover:bg-white hover:text-[#0A1F44] transition-all duration-300 font-bold uppercase text-[10px] tracking-[0.3em] cursor-pointer focus:outline-none"
                >
                  ENTER
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Sticky Navbar (fixed, always on top of every section) */}
      <div className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-5 sm:px-8 py-5 sm:py-8 pointer-events-auto text-xs font-mono tracking-widest text-[#0A1F44] uppercase mix-blend-normal">
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-75 transition-opacity min-h-[44px]">
          <img
            src="/logo-black-transparent.png"
            alt="Origo Atelier"
            className="h-11 md:h-14 w-auto object-contain"
          />
        </div>
        <span
          className="font-extrabold text-xs sm:text-sm font-mono absolute left-1/2 -translate-x-1/2 hidden sm:inline tracking-[0.2em] text-[#0A1F44]"
          style={{ textTransform: 'none' }}
        >
          Origo Atelier
        </span>
        <div className="flex items-center gap-4 sm:gap-8">
          <button
            onClick={handleToggleMute}
            onMouseEnter={() => soundManager.playHover()}
            className="min-h-[44px] inline-flex items-center hover:opacity-75 transition-opacity cursor-pointer font-medium px-1"
          >
            [ SOUND {isMuted ? 'OFF' : 'ON'} ]
          </button>
          <span className="opacity-80 hidden md:inline">[ {String(scrollCount).padStart(3, '0')} ]</span>
          <button
            onClick={() => {
              soundManager.playClick();
              const contactSection = document.getElementById("contact");
              contactSection?.scrollIntoView({ behavior: "smooth" });
            }}
            onMouseEnter={() => soundManager.playHover()}
            className="min-h-[44px] inline-flex items-center hover:opacity-75 transition-opacity cursor-pointer font-bold px-1"
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
      <ImmersiveCarousel />
      <Services />

      {/* Unified Contact & Footer Section */}
      <ContactForm />
    </div>
  );
}
