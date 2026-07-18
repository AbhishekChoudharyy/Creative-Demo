import React from "react";

function Marquee() {
  return (
    <div className="w-full py-6 md:py-8 bg-black border-y border-zinc-800/40 overflow-hidden relative z-40 select-none">
      <div className="flex whitespace-nowrap">
        {/* Track 1 */}
        <div className="flex shrink-0 gap-8 items-center animate-marquee select-none pr-8">
          <span className="text-lg md:text-xl font-mono text-[#C0C6CF] uppercase tracking-wider flex items-center gap-6">
            <span>FLOWORX.COLLECTIVE</span>
            <span className="text-[#00A6B2]">✦</span>
            <img src="/2d logo.jpeg" alt="logo" className="h-7 md:h-10 object-contain" />
            <span className="text-[#00A6B2]">✦</span>
            <span>THE FUTURE OF <span className="text-white">DESIGN</span></span>
            <span className="text-[#00A6B2]">✦</span>
            <img src="/2d logo.jpeg" alt="logo" className="h-7 md:h-10 object-contain" />
            <span className="text-[#00A6B2]">✦</span>
            <span>EXPERIENCE <span className="text-white">STUDIO</span></span>
            <span className="text-[#00A6B2]">✦</span>
            <img src="/2d logo.jpeg" alt="logo" className="h-7 md:h-10 object-contain" />
            <span className="text-[#00A6B2]">✦</span>
          </span>
        </div>
        
        {/* Track 2 for seamless loop */}
        <div className="flex shrink-0 gap-8 items-center animate-marquee select-none pr-8" aria-hidden="true">
          <span className="text-lg md:text-xl font-mono text-[#C0C6CF] uppercase tracking-wider flex items-center gap-6">
            <span>FLOWORX.COLLECTIVE</span>
            <span className="text-[#00A6B2]">✦</span>
            <img src="/2d logo.jpeg" alt="logo" className="h-7 md:h-10 object-contain" />
            <span className="text-[#00A6B2]">✦</span>
            <span>THE FUTURE OF <span className="text-white">DESIGN</span></span>
            <span className="text-[#00A6B2]">✦</span>
            <img src="/2d logo.jpeg" alt="logo" className="h-7 md:h-10 object-contain" />
            <span className="text-[#00A6B2]">✦</span>
            <span>EXPERIENCE <span className="text-white">STUDIO</span></span>
            <span className="text-[#00A6B2]">✦</span>
            <img src="/2d logo.jpeg" alt="logo" className="h-7 md:h-10 object-contain" />
            <span className="text-[#00A6B2]">✦</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Marquee;