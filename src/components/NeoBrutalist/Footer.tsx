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
      className="relative w-full min-h-[380px] sm:min-h-[420px] lg:min-h-[460px] text-white select-none flex flex-col justify-between px-6 sm:px-10 md:px-14 lg:px-20 pt-8 sm:pt-12 pb-8 sm:pb-12 max-w-[1440px] mx-auto z-[40]"
    >
      {/* ── 3D Magnetic Cluster (Glossy Black Shapes — Centered in Footer Zone) ── */}
      <div className="absolute inset-0 z-[1] pointer-events-auto">
        <FooterShapes isHovered={isFooterHovered} />
      </div>

      {/* ── FOOTER CONTENT ROW: Logo at Bottom-Left, 3 Buttons at Bottom-Right ── */}
      <div className="relative z-10 w-full flex flex-row justify-between items-end gap-3 mt-auto pt-10 sm:pt-14">
        
        {/* LEFT ZONE: OFFICIAL WHITE LOGO (Bottom Left) */}
        <div className="flex items-end select-none">
          <img
            src="/logo-white-transparent.png"
            alt="Origo Atelier"
            className="w-20 sm:w-28 lg:w-32 xl:w-36 h-auto object-contain pointer-events-none drop-shadow-[0_4px_20px_rgba(0,0,0,0.18)]"
          />
        </div>

        {/* RIGHT ZONE: 3 BUTTONS AT BOTTOM RIGHT (Crisp White on Mobile & Desktop) */}
        <div className="flex items-center gap-2 sm:gap-2.5 pb-0.5 sm:pb-1 pointer-events-auto">
          {/* Instagram Button */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundManager.playClick()}
            onMouseEnter={() => soundManager.playHover()}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#0A1F44] hover:text-[#0A1F44] flex items-center justify-center shadow-md border border-black/10 hover:border-[#0A1F44]/30 cursor-pointer hover:scale-110 active:scale-95 transition-transform select-none"
            title="Instagram"
            aria-label="Instagram"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
          </a>

          {/* Facebook Button */}
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundManager.playClick()}
            onMouseEnter={() => soundManager.playHover()}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#0A1F44] hover:text-[#0A1F44] flex items-center justify-center shadow-md border border-black/10 hover:border-[#0A1F44]/30 cursor-pointer hover:scale-110 active:scale-95 transition-transform select-none"
            title="Facebook"
            aria-label="Facebook"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.82 0-1.611.211-1.996.61-.385.399-.444.97-.444 1.916v1.454h4.484l-.587 3.667h-3.897v7.98c4.606-.949 8.082-5.01 8.082-9.873 0-5.568-4.512-10.08-10.08-10.08S2.238 8.25 2.238 13.818c0 4.863 3.476 8.924 8.082 9.873z" />
            </svg>
          </a>

          {/* Top Button */}
          <button
            type="button"
            onClick={scrollToTop}
            onMouseEnter={() => soundManager.playHover()}
            className="h-7 sm:h-8 px-2.5 sm:px-3.5 rounded-full bg-white hover:bg-white/95 text-[#0A1F44] flex items-center gap-1.5 text-[10px] sm:text-[10.5px] font-mono font-bold tracking-wider shadow-md border border-black/10 hover:border-[#0A1F44]/30 cursor-pointer hover:scale-105 active:scale-95 transition-all select-none uppercase"
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
