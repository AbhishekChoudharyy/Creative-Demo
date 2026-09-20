'use client';

import React, { useState } from 'react';
import FooterShapes from './FooterShapes';
import { soundManager } from '@/lib/sound';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isFooterHovered, setIsFooterHovered] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    soundManager.playClick();
    setIsSubscribed(true);
    setTimeout(() => {
      soundManager.playChime();
    }, 150);
  };

  const scrollToTop = () => {
    soundManager.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      id="footer"
      onMouseEnter={() => setIsFooterHovered(true)}
      onMouseLeave={() => setIsFooterHovered(false)}
      className="relative w-full min-h-[380px] sm:min-h-[420px] lg:min-h-[460px] text-white select-none flex flex-col justify-between px-6 sm:px-10 md:px-14 lg:px-20 pt-6 sm:pt-8 pb-8 sm:pb-12 max-w-[1440px] mx-auto z-[40]"
    >
      {/* ── 3D Magnetic Cluster (Glossy Black Shapes — Centered in Footer Zone) ── */}
      <div className="absolute inset-0 z-[1] pointer-events-auto">
        <FooterShapes isHovered={isFooterHovered} />
      </div>


      {/* ── BOTTOM ROW: 3-ZONE COMPOSITION (Left: Text + Badges, Center: Open 3D, Right: Newsletter) ── */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 lg:gap-8 mt-auto pt-10 sm:pt-14">
        
        {/* LEFT ZONE: ORIGO ATELIER + INTERACTIVE BADGES */}
        <div className="flex flex-col items-start leading-[0.86] select-none pointer-events-none max-w-sm lg:max-w-md">
          {/* LINE 1: ORIGO */}
          <h2
            className="text-[11vw] sm:text-[8vw] lg:text-[5.4vw] xl:text-[5.2vw] font-bold text-white uppercase tracking-[-0.04em] scale-y-[1.04] origin-bottom-left drop-shadow-[0_4px_16px_rgba(0,0,0,0.16)]"
            style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
          >
            ORIGO
          </h2>

          {/* LINE 2: ATELIER */}
          <h2
            className="text-[11vw] sm:text-[8vw] lg:text-[5.4vw] xl:text-[5.2vw] font-black text-white uppercase tracking-[-0.02em] -mt-1 sm:-mt-1.5 lg:-mt-2 scale-y-[1.02] origin-top-left drop-shadow-[0_4px_16px_rgba(0,0,0,0.16)]"
            style={{ fontFamily: "var(--font-heading), 'Syne', 'Inter', 'Manrope', sans-serif" }}
          >
            ATELIER
          </h2>

          {/* DUAL CIRCULAR BADGES + BACK TO TOP */}
          <div className="flex items-center gap-2 mt-3 sm:mt-4 pointer-events-auto">
            <button
              type="button"
              onClick={() => soundManager.playClick()}
              onMouseEnter={() => soundManager.playHover()}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-mono font-bold shadow-md border border-white/20 cursor-pointer hover:scale-110 active:scale-95 transition-transform select-none"
              title="Origo Atelier"
              aria-label="Origo Brand Signature"
            >
              N
            </button>
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                soundManager.toggleMute();
              }}
              onMouseEnter={() => soundManager.playHover()}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-mono font-bold shadow-md border border-white/20 cursor-pointer hover:scale-110 active:scale-95 transition-transform select-none"
              title="Toggle Audio / Mute"
              aria-label="Toggle Audio"
            >
              M
            </button>
            <button
              type="button"
              onClick={scrollToTop}
              onMouseEnter={() => soundManager.playHover()}
              className="h-6 sm:h-7 px-2.5 rounded-full bg-black/80 hover:bg-black text-white flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono font-bold tracking-wider shadow-md border border-white/20 cursor-pointer hover:scale-105 active:scale-95 transition-all select-none uppercase"
              title="Back to Top"
              aria-label="Back to Top"
            >
              <span>↑</span>
              <span>TOP</span>
            </button>
          </div>
        </div>

        {/* CENTER ZONE IS AIRY & OPEN FOR THE 3D SCULPTURE */}

        {/* RIGHT ZONE: NEWSLETTER / COMMUNITY */}
        <div className="flex flex-col items-start text-left text-white z-10 max-w-sm pb-1 pointer-events-auto">
          {/* HEADING */}
          <span className="inline-block border-b border-white/60 pb-1 text-base sm:text-lg lg:text-xl font-heading font-black uppercase tracking-wider text-white mb-2">
            JOIN THE ATELIER
          </span>

          {/* SUBTITLE */}
          <p className="text-[9px] sm:text-[10px] font-mono font-medium tracking-[0.06em] uppercase text-white/85 leading-[1.4] mb-3 select-none">
            SIGN UP TO BE PART OF OUR GROWING CREATIVE & TECH COMMUNITY
          </p>

          {/* [ ENTER YOUR EMAIL ADDRESS ] INTERACTIVE INPUT */}
          <form onSubmit={handleSubscribe} className="w-full">
            <div className="flex items-center text-xs sm:text-sm font-mono uppercase tracking-[0.14em] text-white py-1 border-b border-white/40 focus-within:border-white transition-colors">
              <span className="font-bold mr-1.5 select-none text-white/90">[</span>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (isSubscribed) setIsSubscribed(false);
                }}
                placeholder="ENTER YOUR EMAIL ADDRESS"
                className="bg-transparent border-none outline-none text-white placeholder:text-white/60 uppercase text-[9px] sm:text-[10px] font-mono tracking-[0.10em] w-full min-w-[200px] focus:ring-0 cursor-text selection:bg-white selection:text-[#1E90FF]"
                required
              />
              <button
                type="submit"
                onMouseEnter={() => soundManager.playHover()}
                className="ml-1.5 font-bold select-none text-white/90 hover:text-white transition-colors cursor-pointer px-1"
                aria-label="Subscribe with email"
              >
                ]
              </button>
            </div>
            {isSubscribed && (
              <p className="text-[9.5px] font-mono text-white mt-1.5 tracking-wider animate-fadeIn">
                ✓ THANK YOU FOR CONNECTING WITH US.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
