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

  return (
    <footer
      id="footer"
      onMouseEnter={() => setIsFooterHovered(true)}
      onMouseLeave={() => setIsFooterHovered(false)}
      className="relative w-full min-h-[380px] sm:min-h-[420px] lg:min-h-[450px] bg-[#1E90FF] text-white overflow-hidden select-none flex flex-col justify-between px-6 sm:px-10 lg:px-14 py-6 sm:py-8 lg:py-9 z-[40]"
    >
      {/* ── Atmospheric Background Cross/Depth Silhouette ── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-30" aria-hidden="true">
        <div
          className="absolute -top-[20%] left-[10%] w-[120px] sm:w-[220px] h-[140%] bg-gradient-to-b from-black/20 via-black/10 to-transparent rotate-45 blur-2xl pointer-events-none"
        />
        <div
          className="absolute -top-[20%] right-[22%] w-[120px] sm:w-[220px] h-[140%] bg-gradient-to-b from-black/20 via-black/10 to-transparent -rotate-45 blur-2xl pointer-events-none"
        />
      </div>

      {/* ── 3D Magnetic Cluster (Glossy Black Shapes — Dead Center) ── */}
      <div className="absolute inset-0 z-[1] pointer-events-auto">
        <FooterShapes isHovered={isFooterHovered} />
      </div>

      {/* ── TOP ROW: STUDIO ADDRESS & COPYRIGHT (Aligned to Far Right) ── */}
      <div className="relative z-10 w-full flex justify-end items-start pointer-events-auto">
        <div className="flex flex-col items-end text-right font-mono uppercase tracking-[0.08em] select-none text-white">
          <div className="text-[10px] sm:text-[10.5px] lg:text-[11px] leading-[1.5] font-medium text-white/95">
            <p>41 MITCHELL STREET</p>
            <p>LONDON EC1V 3QD</p>
            <p>UNITED KINGDOM</p>
          </div>
          <p className="text-[9px] sm:text-[9.5px] text-white/80 tracking-[0.14em] font-medium mt-2 sm:mt-2.5">
            2025 KODE / ALL RIGHTS RESERVED
          </p>
        </div>
      </div>

      {/* ── BOTTOM ROW: 3-ZONE COMPOSITION (Left: Text + Badges, Center: Open 3D, Right: Connect) ── */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-8 mt-auto">
        
        {/* LEFT ZONE: ORIGO ATELIER + DUAL BADGES (Max width ~36% so center 3D remains open) */}
        <div className="flex flex-col items-start leading-[0.86] select-none pointer-events-none max-w-sm lg:max-w-md">
          {/* LINE 1: ORIGO */}
          <h2
            className="text-[10.5vw] sm:text-[8vw] lg:text-[5.6vw] xl:text-[5.4vw] font-bold text-white uppercase tracking-[-0.04em] scale-y-[1.04] origin-bottom-left drop-shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
            style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
          >
            ORIGO
          </h2>

          {/* LINE 2: ATELIER */}
          <h2
            className="text-[10.5vw] sm:text-[8vw] lg:text-[5.6vw] xl:text-[5.4vw] font-black text-white uppercase tracking-[-0.02em] -mt-1 sm:-mt-1.5 lg:-mt-2 scale-y-[1.02] origin-top-left drop-shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
            style={{ fontFamily: "var(--font-heading), 'Syne', 'Inter', 'Manrope', sans-serif" }}
          >
            ATELIER
          </h2>

          {/* DUAL CIRCULAR BADGES [N] & [M] AT BOTTOM LEFT */}
          <div className="flex items-center gap-1.5 mt-2.5 sm:mt-3 pointer-events-auto">
            <div
              onClick={() => soundManager.playClick()}
              onMouseEnter={() => soundManager.playHover()}
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-mono font-bold shadow-md border border-white/20 cursor-pointer hover:scale-110 active:scale-95 transition-transform select-none"
              title="Origo Atelier"
            >
              N
            </div>
            <div
              onClick={() => soundManager.playClick()}
              onMouseEnter={() => soundManager.playHover()}
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-mono font-bold shadow-md border border-white/20 cursor-pointer hover:scale-110 active:scale-95 transition-transform select-none"
              title="Mute / Audio"
            >
              M
            </div>
          </div>
        </div>

        {/* CENTER ZONE IS AIRY & OPEN FOR THE 3D SCULPTURE */}

        {/* RIGHT ZONE: LET'S CONNECT + EMAIL SIGNUP */}
        <div className="flex flex-col items-start text-left text-white z-10 max-w-xs pb-1 pointer-events-auto">
          {/* LET'S CONNECT with underline */}
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              soundManager.playClick();
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onMouseEnter={() => soundManager.playHover()}
            className="inline-block border-b-2 border-white pb-0.5 text-lg sm:text-xl lg:text-[22px] font-extrabold uppercase tracking-tight text-white hover:opacity-80 transition-opacity cursor-pointer mb-2"
          >
            LET&apos;S CONNECT
          </a>

          {/* SUBTITLE */}
          <p className="text-[9px] sm:text-[9.5px] font-mono font-medium tracking-[0.06em] uppercase text-white/90 leading-[1.4] mb-2.5 select-none">
            SIGN UP TO BE PART OF OUR GROWING<br />TECH COMMUNITY
          </p>

          {/* [ ENTER YOUR EMAIL ADDRESS ] INTERACTIVE INPUT */}
          <form onSubmit={handleSubscribe} className="w-full">
            <div className="flex items-center text-xs sm:text-sm font-mono uppercase tracking-[0.14em] text-white py-0.5">
              <span className="font-bold mr-1.5 select-none text-white/90">[</span>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (isSubscribed) setIsSubscribed(false);
                }}
                placeholder="ENTER YOUR EMAIL ADDRESS"
                className="bg-transparent border-none outline-none text-white placeholder:text-white/70 uppercase text-[9px] sm:text-[10px] font-mono tracking-[0.10em] w-full min-w-[190px] focus:ring-0 cursor-text selection:bg-white selection:text-[#1E90FF]"
                required
              />
              <button
                type="submit"
                onMouseEnter={() => soundManager.playHover()}
                className="ml-1.5 font-bold select-none text-white/90 hover:text-white transition-colors cursor-pointer"
                aria-label="Subscribe with email"
              >
                ]
              </button>
            </div>
            {isSubscribed && (
              <p className="text-[9px] font-mono text-white/95 mt-1 tracking-wider animate-fadeIn">
                ✓ THANK YOU FOR CONNECTING WITH US.
              </p>
            )}
          </form>
        </div>
      </div>
    </footer>
  );
}
