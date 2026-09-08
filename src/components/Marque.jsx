import React from "react";

function Marquee() {
  return (
    <div className="w-full py-6 md:py-8 bg-black border-y border-zinc-800/40 overflow-hidden relative z-40 select-none">
      <div className="flex whitespace-nowrap">
        {/* Track 1 */}
        <div className="flex shrink-0 gap-8 items-center animate-marquee select-none pr-8">
          <span className="text-lg md:text-xl font-mono text-[#C0C6CF] uppercase tracking-wider flex items-center gap-6">
            <span className="font-bold text-white">ORIGO ATELIER</span>
            <span className="text-[#00A6B2]">✦</span>
            <span className="text-sm tracking-widest text-[#00A6B2]">○ △ □</span>
            <span className="text-[#00A6B2]">✦</span>
            <span>FROM ORIGIN TO <span className="text-white font-bold">EXCELLENCE</span></span>
            <span className="text-[#00A6B2]">✦</span>
            <img src="/Logo Design - final -V2-05.png" alt="Origo Atelier" className="h-8 md:h-10 object-contain" />
            <span className="text-[#00A6B2]">✦</span>
            <span>EXPERIENTIAL <span className="text-white font-bold">SOLUTIONS</span></span>
            <span className="text-[#00A6B2]">✦</span>
            <span>EVERY EXPERIENCE BEGINS WITH <span className="text-white font-bold">AN IDEA</span></span>
            <span className="text-[#00A6B2]">✦</span>
          </span>
        </div>
        
        {/* Track 2 for seamless loop */}
        <div className="flex shrink-0 gap-8 items-center animate-marquee select-none pr-8" aria-hidden="true">
          <span className="text-lg md:text-xl font-mono text-[#C0C6CF] uppercase tracking-wider flex items-center gap-6">
            <span className="font-bold text-white">ORIGO ATELIER</span>
            <span className="text-[#00A6B2]">✦</span>
            <span className="text-sm tracking-widest text-[#00A6B2]">○ △ □</span>
            <span className="text-[#00A6B2]">✦</span>
            <span>FROM ORIGIN TO <span className="text-white font-bold">EXCELLENCE</span></span>
            <span className="text-[#00A6B2]">✦</span>
            <img src="/Logo Design - final -V2-05.png" alt="Origo Atelier" className="h-8 md:h-10 object-contain" />
            <span className="text-[#00A6B2]">✦</span>
            <span>EXPERIENTIAL <span className="text-white font-bold">SOLUTIONS</span></span>
            <span className="text-[#00A6B2]">✦</span>
            <span>EVERY EXPERIENCE BEGINS WITH <span className="text-white font-bold">AN IDEA</span></span>
            <span className="text-[#00A6B2]">✦</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Marquee;