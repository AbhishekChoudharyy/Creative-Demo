"use client";

import { useState, useEffect } from "react";
import Marquee from "@/components/Marque";
import dynamic from "next/dynamic";
import { soundManager } from "@/lib/sound";

import Intro from "@/components/NeoBrutalist/Intro";
import WorkGallery from "@/components/NeoBrutalist/WorkGallery";
import Process from "@/components/NeoBrutalist/Process";
import Manifesto from "@/components/NeoBrutalist/Manifesto";
import Team from "@/components/NeoBrutalist/Team";
import Services from "@/components/NeoBrutalist/Services";
import MarqueeSection from "@/components/NeoBrutalist/Marquee";
import { LayersAnimation } from "@/components/NeoBrutalist/LayersAnimation";
import ContactForm from "@/components/NeoBrutalist/ContactForm";
import Footer from "@/components/NeoBrutalist/Footer";

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
        data[i+1] = value;   // G
        data[i+2] = value;   // B
        data[i+3] = 16;      // A (subtle opacity)
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
    <div className="min-h-screen bg-[#1E54A8] text-black selection:bg-black/10 relative">
      {bootState !== 'booted' && (
        <div className={`fixed inset-0 bg-[#0D1B2A] z-[9999] flex flex-col items-center justify-center font-mono select-none transition-all duration-700 ease-in-out ${isExiting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'}`}>
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          
          <div className="flex flex-col items-center max-w-xs w-full px-4 text-center z-10 space-y-12">
            
            {/* Title and Subtitle */}
            <div className="space-y-2">
              <h1 className="text-white text-5xl md:text-6xl font-heading font-extrabold tracking-[0.2em] translate-x-[0.1em] transition-all">
                FLOWORX
              </h1>
              <p className="text-[9px] text-[#C0C6CF] tracking-[0.4em] uppercase font-bold">
                FLOWORX COLLECTIVE
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
                      className="absolute top-0 bottom-0 left-0 bg-[#00A6B2] transition-all duration-150 ease-out"
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
                  className="px-8 py-2.5 border border-white/20 hover:border-white text-white hover:bg-[#00A6B2] hover:text-black transition-all duration-300 font-bold uppercase text-[10px] tracking-[0.3em] cursor-pointer focus:outline-none"
                >
                  ENTER
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      <div className="noise-overlay"></div>
      {/* SECTION 1: HERO */}
      <section className="relative min-h-screen flex flex-col justify-between overflow-hidden px-6 lg:px-8 bg-[#1E54A8]">
        {/* Ball of Glass Interactive 3D Canvas Background (Z-Index 20) */}
        <div className="absolute inset-0 z-20 w-full h-full">
          <Main />
          {/* Seamless transparent transition to match the navy flow */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-transparent pointer-events-none" />
        </div>

        {/* Flat Immersive Navbar (Z-Index 30) */}
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-8 py-8 pointer-events-auto text-xs font-mono tracking-widest text-black uppercase">
          <span className="font-extrabold cursor-pointer hover:opacity-75 transition-opacity">
            FLOWORX
          </span>
          <span className="font-extrabold absolute left-1/2 -translate-x-1/2 hidden sm:inline tracking-[0.2em]">
            FLOWORX COLLECTIVE
          </span>
          <div className="flex items-center gap-6 sm:gap-8">
            <button
              onClick={handleToggleMute}
              onMouseEnter={() => soundManager.playHover()}
              className="hover:opacity-75 transition-opacity cursor-pointer font-medium"
            >
              [ SOUND {isMuted ? 'OFF' : 'ON'} ]
            </button>
            <span className="opacity-80 hidden md:inline">[ 001 ]</span>
            <button
              onClick={() => {
                soundManager.playClick();
                const contactSection = document.getElementById("contact");
                contactSection?.scrollIntoView({ behavior: "smooth" });
              }}
              onMouseEnter={() => soundManager.playHover()}
              className="hover:opacity-75 transition-opacity cursor-pointer font-bold"
            >
              CONTACT
            </button>
          </div>
        </div>

        {/* Floating teal dot decoration */}
        <div className="absolute left-[8%] top-1/2 -translate-y-1/2 flex items-center justify-center select-none pointer-events-none hidden md:flex z-30">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00A6B2] shadow-[0_0_10px_rgba(0,166,178,0.8)] animate-pulse" />
        </div>

        {/* Bottom HUD layout (Z-Index 30) */}
        <div className="absolute bottom-8 left-0 right-0 z-30 flex items-center justify-between px-8 pointer-events-auto text-[10px] md:text-xs font-mono tracking-widest text-black uppercase">
          <div className="flex-1" />

          <div
            onClick={() => {
              soundManager.playClick();
              const contactSection = document.getElementById("contact");
              contactSection?.scrollIntoView({ behavior: "smooth" });
            }}
            onMouseEnter={() => soundManager.playHover()}
            className="flex-1 flex flex-col items-center gap-1 cursor-pointer hover:opacity-75 transition-opacity text-center font-bold"
          >
            <span>SCROLL FOR MORE</span>
          </div>

          <div className="flex-1 text-right font-medium">
            [ AR ]
          </div>
        </div>
      </section>

      {/* Original Marquee right after Hero */}
      <Marquee />

      {/* Neo-Brutalist Portfolio Sections */}
      <Intro />
      <Services />
      <Manifesto />
      <WorkGallery />

      {/* Layers Animation Reveal Section (Codrops Variation 1) */}
      <LayersAnimation />

      {/* Contact Form Section */}
      <ContactForm />

      {/* Rebranded Orange Footer */}
      <Footer />
    </div>
  );
}
