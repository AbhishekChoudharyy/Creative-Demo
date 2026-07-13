'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function Marquee() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Infinite Horizontal Scroll
    const ctx = gsap.context(() => {
      gsap.to(".marquee-inner", {
        xPercent: -50,
        repeat: -1,
        duration: 16,
        ease: "linear",
      });
    }, marqueeRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={marqueeRef} className="py-8 md:py-12 overflow-hidden bg-black text-white border-y border-zinc-800 select-none">
      <div className="marquee-inner flex whitespace-nowrap w-fit items-center">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-16 px-8">
            {/* White OG logo merged into the black marquee background */}
            <img 
              src="/2d logo.jpeg" 
              alt="OG logo" 
              className="h-10 md:h-16 object-contain" 
            />
            
            {/* Elegant four-pointed sparkle separator */}
            <span className="text-2xl md:text-4xl text-[#a1a1aa]">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
