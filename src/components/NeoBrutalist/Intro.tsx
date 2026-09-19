'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { soundManager } from '@/lib/sound';

interface AnimatedWordConfig {
  id: string;
  ref: React.RefObject<HTMLSpanElement | null>;
  openDirection: 'left' | 'right';
  maxOpenDistance: number;
  maxOuterDistance: number;
}

export default function Intro() {
  const sectionRef = useRef<HTMLElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);

  // Individual refs for animated words
  const everyRef = useRef<HTMLSpanElement>(null);
  const experienceRef = useRef<HTMLSpanElement>(null);
  const beginsRef = useRef<HTMLSpanElement>(null);
  const withRef = useRef<HTMLSpanElement>(null);
  const ideaRef = useRef<HTMLSpanElement>(null);
  const fromRef = useRef<HTMLSpanElement>(null);
  const originRef = useRef<HTMLSpanElement>(null);
  const toRef = useRef<HTMLSpanElement>(null);
  const excellenceRef = useRef<HTMLSpanElement>(null);

  // Extra mobile pairs refs
  const shapingRef = useRef<HTMLSpanElement>(null);
  const formsRef = useRef<HTMLSpanElement>(null);
  const thatRef = useRef<HTMLSpanElement>(null);
  const connectRef = useRef<HTMLSpanElement>(null);
  const inspireRef = useRef<HTMLSpanElement>(null);
  const endureRef = useRef<HTMLSpanElement>(null);

  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);
  const currentHoveredIdRef = useRef<string | null>(null);
  const lastSoundRef = useRef<number>(0);

  // Animated words config: all active on hover
  const animatedWords: AnimatedWordConfig[] = [
    { id: 'every', ref: everyRef, openDirection: 'right', maxOpenDistance: 80, maxOuterDistance: 30 },
    { id: 'experience', ref: experienceRef, openDirection: 'left', maxOpenDistance: 80, maxOuterDistance: 30 },
    { id: 'begins', ref: beginsRef, openDirection: 'right', maxOpenDistance: 75, maxOuterDistance: 35 },
    { id: 'with', ref: withRef, openDirection: 'left', maxOpenDistance: 75, maxOuterDistance: 30 },
    { id: 'idea', ref: ideaRef, openDirection: 'right', maxOpenDistance: 75, maxOuterDistance: 30 },
    { id: 'from', ref: fromRef, openDirection: 'right', maxOpenDistance: 80, maxOuterDistance: 30 },
    { id: 'origin', ref: originRef, openDirection: 'left', maxOpenDistance: 80, maxOuterDistance: 30 },
    { id: 'to', ref: toRef, openDirection: 'right', maxOpenDistance: 75, maxOuterDistance: 35 },
    { id: 'excellence', ref: excellenceRef, openDirection: 'left', maxOpenDistance: 80, maxOuterDistance: 30 },
    { id: 'shaping', ref: shapingRef, openDirection: 'right', maxOpenDistance: 70, maxOuterDistance: 25 },
    { id: 'forms', ref: formsRef, openDirection: 'left', maxOpenDistance: 70, maxOuterDistance: 25 },
    { id: 'that', ref: thatRef, openDirection: 'right', maxOpenDistance: 70, maxOuterDistance: 25 },
    { id: 'connect', ref: connectRef, openDirection: 'right', maxOpenDistance: 70, maxOuterDistance: 25 },
    { id: 'inspire', ref: inspireRef, openDirection: 'left', maxOpenDistance: 70, maxOuterDistance: 25 },
    { id: 'endure', ref: endureRef, openDirection: 'left', maxOpenDistance: 70, maxOuterDistance: 25 },
  ];

  const wordDirStateRef = useRef<Record<string, 'left' | 'right'>>({
    every: 'right',
    experience: 'left',
    begins: 'right',
    with: 'left',
    idea: 'right',
    from: 'right',
    origin: 'left',
    to: 'right',
    excellence: 'left',
    shaping: 'right',
    forms: 'left',
    that: 'right',
    connect: 'right',
    inspire: 'left',
    endure: 'left',
  });

  const wordClickCountRef = useRef<Record<string, number>>({});

  /**
   * Safe Viewport Clamped Travel Calculation:
   * - Strict mathematical clamp: NO word can EVER exceed the screen boundary.
   * - A 24px (mobile) to 48px (desktop) safety padding is strictly enforced at all times.
   * - Left-anchored words glide inwards to the right; right-anchored words glide inwards to the left.
   */
  const getTargetX = (item: AnimatedWordConfig, el: HTMLElement) => {
    if (typeof window === 'undefined') return 0;
    const isMobile = window.innerWidth < 768;
    const screenWidth = window.innerWidth;
    const safetyMargin = isMobile ? 24 : 48;

    // Get current GSAP translation to derive the unshifted base position
    const currentX = (gsap.getProperty(el, 'x') as number) || 0;
    const rect = el.getBoundingClientRect();
    const baseLeft = rect.left - currentX;
    const baseRight = rect.right - currentX;

    // Calculate maximum allowable shift without bleeding past screen edges:
    // baseLeft + targetX >= safetyMargin => targetX >= safetyMargin - baseLeft
    // baseRight + targetX <= screenWidth - safetyMargin => targetX <= (screenWidth - safetyMargin) - baseRight
    const minAllowedX = safetyMargin - baseLeft;
    const maxAllowedX = (screenWidth - safetyMargin) - baseRight;

    if (minAllowedX >= maxAllowedX) {
      return 0; // Word is wider than safe viewport
    }

    const dir = wordDirStateRef.current[item.id] || item.openDirection;

    // Distance tuned for premium, controlled brutalist editorial motion:
    // Left-anchored words move inwards (+X); right-anchored words move inwards (-X).
    const maxShift = isMobile
      ? (dir === item.openDirection ? 35 : 18)
      : (dir === item.openDirection ? 80 : 35);

    const rawX = dir === 'right' ? maxShift : -maxShift;

    // Hard mathematical clamp guarantees 100% viewport safety
    return Math.max(minAllowedX, Math.min(maxAllowedX, rawX));
  };

  const playHoverSound = () => {
    const now = Date.now();
    if (now - lastSoundRef.current > 120) {
      lastSoundRef.current = now;
      soundManager.playHover();
    }
  };

  /**
   * Smooth Return:
   * Returns all words back to starting position (x: 0) with smooth ease.
   */
  const resetAllWords = () => {
    currentHoveredIdRef.current = null;

    animatedWords.forEach((item) => {
      wordDirStateRef.current[item.id] =
        wordDirStateRef.current[item.id] === 'left' ? 'right' : 'left';
    });

    animatedWords.forEach((item) => {
      const el = item.ref.current;
      if (!el) return;
      const elAny = el as any;
      elAny._isTez = false;
      elAny._isSlowTweening = false;
      gsap.to(el, {
        x: 0,
        scale: 1,
        duration: 1.4,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    });
  };

  /**
   * Unified Interaction Trigger (Used by both Desktop and Mobile):
   * 1. Active word moves fast (~0.85s, power3.out).
   * 2. All other words drift in graceful slow motion (~2.8s, power2.out).
   * 3. Direction alternates on every interaction.
   * 4. Delayed smooth return to starting point (1.4s) after inactivity.
   */
  const triggerWordInteraction = (activeId: string) => {
    if (typeof window === 'undefined') return;

    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }

    currentHoveredIdRef.current = activeId;
    playHoverSound();

    // Toggle direction for active word
    wordDirStateRef.current[activeId] =
      wordDirStateRef.current[activeId] === 'left' ? 'right' : 'left';

    animatedWords.forEach((item) => {
      const el = item.ref.current;
      if (!el) return;

      const isFast = item.id === activeId;
      const targetX = getTargetX(item, el);
      const elAny = el as any;

      if (isFast) {
        elAny._isTez = true;
        gsap.to(el, {
          x: targetX,
          duration: 0.85,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      } else {
        if (!elAny._isSlowTweening || elAny._isTez) {
          elAny._isTez = false;
          elAny._isSlowTweening = true;
          gsap.to(el, {
            x: targetX,
            duration: 2.8,
            ease: 'power2.out',
            overwrite: 'auto',
            onComplete: () => {
              elAny._isSlowTweening = false;
            },
          });
        }
      }
    });

    // Auto-return timer for touch / tap interactions
    leaveTimerRef.current = setTimeout(() => {
      resetAllWords();
    }, 900);
  };

  /**
   * Hover physics:
   * 1. The word currently hovered moves at a smooth, controlled pace (~0.85s).
   * 2. ALL other words move in graceful slow motion (~2.8s).
   * 3. On mobile, movement is towards center to end without ever crossing screen edges.
   */
  const updateWordAnimations = (clientX: number, clientY: number) => {
    if (typeof window === 'undefined') return;

    let hoveredWordId: string | null = null;
    let closestDist = Infinity;
    let closestWordId: string | null = null;

    animatedWords.forEach((item) => {
      const el = item.ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const isInside =
        clientX >= rect.left - 20 &&
        clientX <= rect.right + 20 &&
        clientY >= rect.top - 20 &&
        clientY <= rect.bottom + 20;

      if (isInside) {
        hoveredWordId = item.id;
      }

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dist = Math.hypot(clientX - centerX, clientY - centerY);

      if (dist < closestDist) {
        closestDist = dist;
        closestWordId = item.id;
      }
    });

    const activeFastId = hoveredWordId || (closestDist < 250 ? closestWordId : null);

    if (activeFastId && activeFastId !== currentHoveredIdRef.current) {
      currentHoveredIdRef.current = activeFastId;
      playHoverSound();
      wordDirStateRef.current[activeFastId] =
        wordDirStateRef.current[activeFastId] === 'left' ? 'right' : 'left';
    }

    animatedWords.forEach((item) => {
      const el = item.ref.current;
      if (!el) return;

      const isFast = item.id === activeFastId;
      const targetX = getTargetX(item, el);
      const elAny = el as any;

      if (isFast) {
        elAny._isTez = true;
        gsap.to(el, {
          x: targetX,
          duration: 0.85,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      } else {
        if (!elAny._isSlowTweening || elAny._isTez) {
          elAny._isTez = false;
          elAny._isSlowTweening = true;
          gsap.to(el, {
            x: targetX,
            duration: 2.8,
            ease: 'power2.out',
            overwrite: 'auto',
            onComplete: () => {
              elAny._isSlowTweening = false;
            },
          });
        }
      }
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }

    const { clientX, clientY } = e;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      updateWordAnimations(clientX, clientY);
    });
  };

  const handlePointerEnter = (e: React.PointerEvent) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    updateWordAnimations(e.clientX, e.clientY);
  };

  const handlePointerLeave = () => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    currentHoveredIdRef.current = null;

    animatedWords.forEach((item) => {
      wordDirStateRef.current[item.id] =
        wordDirStateRef.current[item.id] === 'left' ? 'right' : 'left';
    });

    leaveTimerRef.current = setTimeout(() => {
      animatedWords.forEach((item) => {
        const el = item.ref.current;
        if (!el) return;
        const elAny = el as any;
        elAny._isTez = false;
        elAny._isSlowTweening = false;
        gsap.to(el, {
          x: 0,
          scale: 1,
          duration: 1.4,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      });
    }, 650);
  };

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="intro"
      className="relative w-full min-h-screen text-black overflow-hidden flex flex-col justify-between px-3 sm:px-8 lg:px-16 pt-6 sm:pt-8 md:pt-12 pb-6 select-none"
      style={{
        background: 'linear-gradient(to bottom, #F4F8FD 0%, #EFF5FC 50%, #EAF2FC 100%)',
      }}
    >
      {/* ── Pristine Subtle Micro-Grid Overlay (Zero papery grit) ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `radial-gradient(rgba(30, 144, 255, 0.12) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* ══════════════════════════════════════════════
          MAIN EDITORIAL TYPOGRAPHY POSTER
          - Starting Point aligned exactly with user reference:
            Col A (0%): EVERY, AN •, FROM
            Col B (~22%): BEGINS, IDEA., TO (perfect vertical line!)
            Col C (100%): EXPERIENCE, WITH, ORIGIN, EXCELLENCE.
      ══════════════════════════════════════════════ */}
      <div
        ref={posterRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className="relative z-10 w-full max-w-[1700px] mx-auto pt-1 md:pt-4 flex flex-col md:gap-y-6 cursor-default"
      >
        
        {/* ── PAIR 1: EVERY ... EXPERIENCE ── */}
        <div className="w-full flex flex-col md:flex-row md:justify-between items-start md:items-baseline leading-[0.92] sm:leading-[0.94] md:leading-[0.92] gap-y-2 sm:gap-y-2.5 md:gap-y-0 mb-2 sm:mb-2.5 md:mb-0">
          <h2
            className="self-start text-left pl-1 sm:pl-3 md:pl-0 intro-reveal-text uppercase text-black font-semibold tracking-[-0.04em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] md:text-[clamp(40px,7.2vw,118px)] scale-y-[1.08] md:scale-y-[1.06] origin-bottom-left"
            style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
          >
            <span
              ref={everyRef}
              onClick={() => triggerWordInteraction('every')}
              onPointerDown={() => triggerWordInteraction('every')}
              className="inline-block cursor-pointer select-none"
              style={{ display: 'inline-block', willChange: 'transform' }}
            >
              EVERY
            </span>
          </h2>
          <h2
            className="self-end text-right pr-1 sm:pr-3 md:pr-0 intro-reveal-text uppercase text-black font-semibold tracking-[-0.04em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] md:text-[clamp(40px,7.2vw,118px)] scale-y-[1.08] md:scale-y-[1.06] origin-bottom-right"
            style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
          >
            <span
              ref={experienceRef}
              onClick={() => triggerWordInteraction('experience')}
              onPointerDown={() => triggerWordInteraction('experience')}
              className="inline-block cursor-pointer select-none"
              style={{ display: 'inline-block', willChange: 'transform' }}
            >
              EXPERIENCE
            </span>
          </h2>
        </div>

        {/* ── PAIR 2: BEGINS (Mobile: pl-10, Desktop: md:pl-[22%]) ... WITH (Right) ── */}
        <div className="w-full flex flex-col md:flex-row md:justify-between items-start md:items-baseline leading-[0.92] sm:leading-[0.94] md:leading-[0.92] gap-y-2 sm:gap-y-2.5 md:gap-y-0 mb-2 sm:mb-2.5 md:mb-0">
          <h2
            className="self-start text-left pl-10 sm:pl-20 md:pl-[22%] intro-reveal-text uppercase text-black font-semibold tracking-[-0.04em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] md:text-[clamp(40px,7.2vw,118px)] scale-y-[1.08] md:scale-y-[1.06] origin-bottom-left"
            style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
          >
            <span
              ref={beginsRef}
              onClick={() => triggerWordInteraction('begins')}
              onPointerDown={() => triggerWordInteraction('begins')}
              className="inline-block cursor-pointer select-none"
              style={{ display: 'inline-block', willChange: 'transform' }}
            >
              BEGINS
            </span>
          </h2>
          <h2
            className="self-end text-right pr-10 sm:pr-20 md:pr-0 intro-reveal-text uppercase text-black font-semibold tracking-[-0.04em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] md:text-[clamp(40px,7.2vw,118px)] scale-y-[1.08] md:scale-y-[1.06] origin-bottom-right"
            style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
          >
            <span
              ref={withRef}
              onClick={() => triggerWordInteraction('with')}
              onPointerDown={() => triggerWordInteraction('with')}
              className="inline-block cursor-pointer select-none"
              style={{ display: 'inline-block', willChange: 'transform' }}
            >
              WITH
            </span>
          </h2>
        </div>

        {/* ── PAIR 3: AN • ... IDEA. ── */}
        <div className="w-full flex flex-col md:flex-row md:items-baseline leading-[0.92] sm:leading-[0.94] md:leading-[0.92] gap-y-2 sm:gap-y-2.5 md:gap-y-0 mb-2 sm:mb-2.5 md:mb-0">
          <h2
            className="self-start text-left pl-3 sm:pl-6 md:pl-0 intro-reveal-text uppercase text-black font-semibold tracking-[-0.04em] flex items-baseline text-[clamp(36px,min(10.2vw,5.6vh),118px)] md:text-[clamp(40px,7.2vw,118px)] scale-y-[1.08] md:scale-y-[1.06] origin-bottom-left"
            style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
          >
            <span
              onClick={() => triggerWordInteraction('idea')}
              onPointerDown={() => triggerWordInteraction('idea')}
              className="cursor-pointer select-none"
            >
              AN
            </span>
            <span className="inline-flex items-center px-2 sm:px-4 md:px-5 self-center">
              <span
                ref={dotRef}
                className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-[#FF4500] shadow-[0_0_10px_rgba(255,69,0,0.7)] inline-block"
              />
            </span>
          </h2>
          <h2
            className="self-start md:self-auto pl-[40%] sm:pl-[45%] md:pl-[6%] text-left intro-reveal-text uppercase text-black font-semibold tracking-[-0.04em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] md:text-[clamp(40px,7.2vw,118px)] scale-y-[1.08] md:scale-y-[1.06] origin-bottom-left"
            style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
          >
            <span
              ref={ideaRef}
              onClick={() => triggerWordInteraction('idea')}
              onPointerDown={() => triggerWordInteraction('idea')}
              className="inline-block cursor-pointer select-none"
              style={{ display: 'inline-block', willChange: 'transform' }}
            >
              IDEA.
            </span>
          </h2>
        </div>

        {/* ── PAIR 4: FROM ... ORIGIN ── */}
        <div className="w-full flex flex-col md:flex-row md:justify-between items-start md:items-baseline leading-[0.92] sm:leading-[0.94] md:leading-[0.92] gap-y-2 sm:gap-y-2.5 md:gap-y-0 mb-2 sm:mb-2.5 md:mb-0">
          <h2
            className="self-start text-left pl-2 sm:pl-4 md:pl-0 intro-reveal-text uppercase text-black font-semibold tracking-[-0.04em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] md:text-[clamp(40px,7.2vw,118px)] scale-y-[1.08] md:scale-y-[1.06] origin-bottom-left"
            style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
          >
            <span
              ref={fromRef}
              onClick={() => triggerWordInteraction('from')}
              onPointerDown={() => triggerWordInteraction('from')}
              className="inline-block cursor-pointer select-none"
              style={{ display: 'inline-block', willChange: 'transform' }}
            >
              FROM
            </span>
          </h2>
          <h2
            className="self-end text-right pr-3 sm:pr-6 md:pr-0 intro-reveal-text uppercase text-black font-semibold tracking-[-0.04em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] md:text-[clamp(40px,7.2vw,118px)] scale-y-[1.08] md:scale-y-[1.06] origin-bottom-right"
            style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
          >
            <span
              ref={originRef}
              onClick={() => triggerWordInteraction('origin')}
              onPointerDown={() => triggerWordInteraction('origin')}
              className="inline-block cursor-pointer select-none"
              style={{ display: 'inline-block', willChange: 'transform' }}
            >
              ORIGIN
            </span>
          </h2>
        </div>

        {/* ── PAIR 5: TO (Mobile: pl-14, Desktop: md:pl-[22%]) ... EXCELLENCE. (Right) ── */}
        <div className="w-full flex flex-col md:flex-row md:justify-between items-start md:items-baseline leading-[0.92] sm:leading-[0.94] md:leading-[0.92] gap-y-2 sm:gap-y-2.5 md:gap-y-0 mb-2 sm:mb-2.5 md:mb-0">
          <h2
            className="self-start text-left pl-14 sm:pl-28 md:pl-[22%] intro-reveal-text uppercase text-black font-semibold tracking-[-0.04em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] md:text-[clamp(40px,7.2vw,118px)] scale-y-[1.08] md:scale-y-[1.06] origin-bottom-left"
            style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
          >
            <span
              ref={toRef}
              onClick={() => triggerWordInteraction('to')}
              onPointerDown={() => triggerWordInteraction('to')}
              className="inline-block cursor-pointer select-none"
              style={{ display: 'inline-block', willChange: 'transform' }}
            >
              TO
            </span>
          </h2>
          <h2
            className="self-end text-right pr-1 sm:pr-2 md:pr-0 intro-reveal-text uppercase text-black font-semibold tracking-[-0.04em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] md:text-[clamp(40px,7.2vw,118px)] scale-y-[1.08] md:scale-y-[1.06] origin-bottom-right"
            style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
          >
            <span
              ref={excellenceRef}
              onClick={() => triggerWordInteraction('excellence')}
              onPointerDown={() => triggerWordInteraction('excellence')}
              className="inline-block cursor-pointer select-none"
              style={{ display: 'inline-block', willChange: 'transform' }}
            >
              EXCELLENCE.
            </span>
          </h2>
        </div>

        {/* ══════════════════════════════════════════════
            MOBILE-ONLY: INTEGRATED PHILOSOPHY WORDS
            - Asymmetrically staggered to fulfill every horizontal space on screen!
            - Clean vertical line separation
        ══════════════════════════════════════════════ */}
        <div className="block md:hidden w-full flex flex-col">
          {/* SHAPING (mid-left: 18%) ... FORMS (mid-right: 68%) */}
          <div className="w-full flex flex-col items-start leading-[0.92] sm:leading-[0.94] gap-y-2 sm:gap-y-2.5 mb-2 sm:mb-2.5">
            <h2
              className="self-start text-left pl-6 sm:pl-14 intro-reveal-text uppercase text-black font-semibold tracking-[-0.04em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] scale-y-[1.08] origin-bottom-left"
              style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
            >
              <span
                ref={shapingRef}
                onClick={() => triggerWordInteraction('shaping')}
                onPointerDown={() => triggerWordInteraction('shaping')}
                className="inline-block cursor-pointer select-none"
                style={{ display: 'inline-block', willChange: 'transform' }}
              >
                SHAPING
              </span>
            </h2>
            <h2
              className="self-end text-right pr-12 sm:pr-24 intro-reveal-text uppercase text-black font-semibold tracking-[-0.04em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] scale-y-[1.08] origin-bottom-right"
              style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
            >
              <span
                ref={formsRef}
                onClick={() => triggerWordInteraction('forms')}
                onPointerDown={() => triggerWordInteraction('forms')}
                className="inline-block cursor-pointer select-none"
                style={{ display: 'inline-block', willChange: 'transform' }}
              >
                FORMS
              </span>
            </h2>
          </div>

          {/* THAT (left: 0%) ... CONNECT, (right: ~85%) */}
          <div className="w-full flex flex-col leading-[0.92] sm:leading-[0.94] gap-y-2 sm:gap-y-2.5 mb-2 sm:mb-2.5">
            <h2
              className="self-start text-left pl-1 sm:pl-3 intro-reveal-text uppercase text-black font-semibold tracking-[-0.04em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] scale-y-[1.08] origin-bottom-left"
              style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
            >
              <span
                ref={thatRef}
                onClick={() => triggerWordInteraction('that')}
                onPointerDown={() => triggerWordInteraction('that')}
                className="inline-block cursor-pointer select-none"
                style={{ display: 'inline-block', willChange: 'transform' }}
              >
                THAT
              </span>
            </h2>
            <h2
              className="self-end text-right pr-4 sm:pr-8 intro-reveal-text uppercase text-black font-semibold tracking-[-0.04em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] scale-y-[1.08] origin-bottom-right"
              style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
            >
              <span
                ref={connectRef}
                onClick={() => triggerWordInteraction('connect')}
                onPointerDown={() => triggerWordInteraction('connect')}
                className="inline-block cursor-pointer select-none"
                style={{ display: 'inline-block', willChange: 'transform' }}
              >
                CONNECT,
              </span>
            </h2>
          </div>

          {/* INSPIRE (left: ~10%) ... & ENDURE. (right: 98%) */}
          <div className="w-full flex flex-col leading-[0.92] sm:leading-[0.94] gap-y-2 sm:gap-y-2.5">
            <h2
              className="self-start text-left pl-3 sm:pl-6 intro-reveal-text uppercase text-black font-semibold tracking-[-0.04em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] scale-y-[1.08] origin-bottom-left"
              style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
            >
              <span
                ref={inspireRef}
                onClick={() => triggerWordInteraction('inspire')}
                onPointerDown={() => triggerWordInteraction('inspire')}
                className="inline-block cursor-pointer select-none"
                style={{ display: 'inline-block', willChange: 'transform' }}
              >
                INSPIRE
              </span>
            </h2>
            <h2
              className="self-end text-right pr-1 sm:pr-2 intro-reveal-text uppercase text-black font-semibold tracking-[-0.04em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] scale-y-[1.08] origin-bottom-right"
              style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
            >
              <span
                ref={endureRef}
                onClick={() => triggerWordInteraction('endure')}
                onPointerDown={() => triggerWordInteraction('endure')}
                className="inline-block cursor-pointer select-none"
                style={{ display: 'inline-block', willChange: 'transform' }}
              >
                & ENDURE.
              </span>
            </h2>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════
          WHAT WE BELIEVE — BRAND PHILOSOPHY PARAGRAPH
          - DESKTOP ONLY: 100% original full 2 paragraphs exactly as approved
      ══════════════════════════════════════════════ */}
      <div className="hidden md:flex relative z-10 w-full max-w-[1700px] mx-auto mt-8 justify-end">
        <div className="w-8/12 lg:w-6/12 border-l-2 border-black/25 pl-8 space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] font-mono font-bold text-black/60 block">
            // WHAT WE BELIEVE
          </span>
          <p className="text-[17px] font-mono text-black leading-relaxed">
            <strong className="font-bold text-black">“Origo” means Origin</strong> – the starting point from which every idea, form and creation begins. Every great design begins with a simple origin and evolves into something extraordinary.
          </p>
          <p className="text-[17px] font-mono text-black/80 leading-relaxed">
            We believe in finding the origin of that idea and building from there. The objective is not simply to create something visually impressive, but to create experiences that connect, engage, inspire and endure.
          </p>
        </div>
      </div>

    </section>
  );
}
