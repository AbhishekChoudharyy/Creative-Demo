'use client';

import TextPressure from './TextPressure';

export default function Footer() {
  return (
    <footer
      className="relative select-none overflow-hidden z-[45]"
      style={{
        // Continuation of the form's gradient: brand blue at the very end
        background: 'linear-gradient(180deg, #1E90FF 0%, #1E90FF 100%)',
      }}
    >
      <div className="min-h-[36vh] px-4 sm:px-10 lg:px-24 pt-10 pb-20 flex items-end justify-center">
        {/* ORIGO starts BOLD, ATELIER stays THIN — same line, one flow */}
        <div className="relative w-full flex items-end gap-3 sm:gap-5">
          <div className="relative h-[110px] sm:h-[150px] md:h-[200px]" style={{ flex: '5 1 0%' }}>
            <TextPressure
              text="ORIGO"
              fontFamily="'ERF Neot', 'OT Brut', sans-serif"
              flex
              width={false}
              weight={false}
              italic={false}
              alpha={false}
              stroke={false}
              scale
              textColor="#FFFFFF"
              minFontSize={24}
            />
          </div>
          <div className="relative h-[110px] sm:h-[150px] md:h-[200px]" style={{ flex: '7 1 0%' }}>
            <TextPressure
              text="ATELIER"
              fontFamily="'FF Identification Std Five C Regular', 'FF Identification Std', 'Manrope', sans-serif"
              flex
              width={false}
              weight={false}
              italic={false}
              alpha={false}
              stroke={false}
              scale
              textColor="#FFFFFF"
              minFontSize={24}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
