'use client';

import React, { useState } from 'react';
import FooterShapes from './FooterShapes';
import { soundManager } from '@/lib/sound';

export default function Footer() {
  const [isFooterHovered, setIsFooterHovered] = useState(false);

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


      {/* ── BOTTOM ROW: Left: ORIGO ATELIER | Right: 3 Transparent Glass Buttons ── */}
      <div className="relative z-10 w-full flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-8 mt-auto pt-10 sm:pt-14">
        
        {/* LEFT ZONE: ORIGO (ERF Neot Black) + ATELIER (Thin) */}
        <div className="flex flex-col items-start leading-[0.86] select-none pointer-events-none max-w-sm lg:max-w-md">
          {/* LINE 1: ORIGO with public/fonts/ERFNeot-Black.ttf */}
          <h2
            className="text-[12vw] sm:text-[8.5vw] lg:text-[5.8vw] xl:text-[5.5vw] font-black text-white uppercase tracking-[-0.03em] scale-y-[1.02] origin-bottom-left drop-shadow-[0_4px_16px_rgba(0,0,0,0.16)]"
            style={{ fontFamily: "'ERF Neot', sans-serif" }}
          >
            ORIGO
          </h2>

          {/* LINE 2: ATELIER (Ultra Thin) */}
          <h2
            className="text-[12vw] sm:text-[8.5vw] lg:text-[5.8vw] xl:text-[5.5vw] text-white uppercase tracking-[0.04em] -mt-1 sm:-mt-2 lg:-mt-2.5 scale-y-[1.01] origin-top-left drop-shadow-[0_4px_16px_rgba(0,0,0,0.16)]"
            style={{
              fontFamily: "var(--font-heading), 'Syne', 'Inter', 'Manrope', sans-serif",
              fontWeight: 200,
            }}
          >
            ATELIER
          </h2>
        </div>

        {/* RIGHT ZONE: ONLY THE THREE GLASS BUTTONS (N, M, TOP) */}
        <div className="flex items-center gap-2.5 sm:gap-3 pointer-events-auto z-10 pb-1 self-start sm:self-end">
          <button
            type="button"
            onClick={() => soundManager.playClick()}
            onMouseEnter={() => soundManager.playHover()}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/25 active:bg-white/35 text-white flex items-center justify-center text-[10.5px] sm:text-[11px] font-mono font-bold shadow-md border border-white/30 backdrop-blur-md cursor-pointer hover:scale-110 active:scale-95 transition-all select-none"
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
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/25 active:bg-white/35 text-white flex items-center justify-center text-[10.5px] sm:text-[11px] font-mono font-bold shadow-md border border-white/30 backdrop-blur-md cursor-pointer hover:scale-110 active:scale-95 transition-all select-none"
            title="Toggle Audio / Mute"
            aria-label="Toggle Audio"
          >
            M
          </button>
          <button
            type="button"
            onClick={scrollToTop}
            onMouseEnter={() => soundManager.playHover()}
            className="h-7 sm:h-8 px-3 rounded-full bg-white/10 hover:bg-white/25 active:bg-white/35 text-white flex items-center gap-1.5 text-[9.5px] sm:text-[10.5px] font-mono font-bold tracking-wider shadow-md border border-white/30 backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95 transition-all select-none uppercase"
            title="Back to Top"
            aria-label="Back to Top"
          >
            <span>↑</span>
            <span>TOP</span>
          </button>
        </div>
      </div>
    </div>
  );
}
