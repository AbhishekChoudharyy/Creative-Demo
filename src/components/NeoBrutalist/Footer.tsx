'use client';

import FuzzyText from './FuzzyText';

export default function Footer() {
  return (
    <footer
      className="relative select-none overflow-hidden rounded-t-[36px] sm:rounded-t-[56px] -mt-10 z-40"
      style={{ background: '#1E90FF' }}
    >
      <div className="min-h-[42vh] px-6 sm:px-10 lg:px-16 py-16 flex items-center justify-center">
        <FuzzyText
          fontSize="clamp(2.6rem, 11vw, 10.5rem)"
          fontWeight={900}
          fontFamily="'ERF Neot', 'OT Brut', sans-serif"
          color="#FFFFFF"
          baseIntensity={0.18}
          hoverIntensity={0.6}
          enableHover
        >
          Origo Atelier
        </FuzzyText>
      </div>
    </footer>
  );
}
