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
  const posterRef = useRef<HTMLDivElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawRafRef = useRef<number | null>(null);
  const lastDrawPointRef = useRef<{ x: number; y: number } | null>(null);

  // Individual refs for animated words
  const everyRef = useRef<HTMLSpanElement>(null);
  const experienceRef = useRef<HTMLSpanElement>(null);
  const beginsRef = useRef<HTMLSpanElement>(null);
  const withRef = useRef<HTMLSpanElement>(null);
  const ideaRef = useRef<HTMLSpanElement>(null);
  const anRef = useRef<HTMLSpanElement>(null);
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

  // Animated words config: all active on hover (per-line pairs; same-line words never overlap)
  const animatedWords: AnimatedWordConfig[] = [
    { id: 'every', ref: everyRef, openDirection: 'right', maxOpenDistance: 320, maxOuterDistance: 320 },
    { id: 'experience', ref: experienceRef, openDirection: 'left', maxOpenDistance: 320, maxOuterDistance: 320 },
    { id: 'begins', ref: beginsRef, openDirection: 'right', maxOpenDistance: 320, maxOuterDistance: 320 },
    { id: 'with', ref: withRef, openDirection: 'left', maxOpenDistance: 320, maxOuterDistance: 320 },
    { id: 'idea', ref: ideaRef, openDirection: 'right', maxOpenDistance: 320, maxOuterDistance: 320 },
    { id: 'from', ref: fromRef, openDirection: 'right', maxOpenDistance: 320, maxOuterDistance: 320 },
    { id: 'origin', ref: originRef, openDirection: 'left', maxOpenDistance: 320, maxOuterDistance: 320 },
    { id: 'to', ref: toRef, openDirection: 'right', maxOpenDistance: 320, maxOuterDistance: 320 },
    { id: 'excellence', ref: excellenceRef, openDirection: 'left', maxOpenDistance: 320, maxOuterDistance: 320 },
    { id: 'shaping', ref: shapingRef, openDirection: 'right', maxOpenDistance: 320, maxOuterDistance: 320 },
    { id: 'forms', ref: formsRef, openDirection: 'left', maxOpenDistance: 320, maxOuterDistance: 320 },
    { id: 'that', ref: thatRef, openDirection: 'right', maxOpenDistance: 320, maxOuterDistance: 320 },
    { id: 'connect', ref: connectRef, openDirection: 'right', maxOpenDistance: 320, maxOuterDistance: 320 },
    { id: 'inspire', ref: inspireRef, openDirection: 'left', maxOpenDistance: 320, maxOuterDistance: 320 },
    { id: 'endure', ref: endureRef, openDirection: 'left', maxOpenDistance: 320, maxOuterDistance: 320 },
  ];

  // Words sharing the same line — a moving word stops before colliding with its line-mates
  const linePairsRef = useRef<Array<[AnimatedWordConfig, AnimatedWordConfig]>>([]);

  // Desktop-only: words start pulled towards the center so the poster looks
  // compact ("bhara hua"); on first pointer move they release to natural spread.
  const compactStartOffsets = useRef<Record<string, number>>({
    every: -70,
    experience: 70,
    begins: -60,
    with: 60,
    idea: -45,
    from: -70,
    origin: 70,
    to: -55,
    excellence: 55,
    shaping: -50,
    forms: 50,
    that: -50,
    connect: 50,
    inspire: -45,
    endure: 45,
  });
  const hasReleasedCompactRef = useRef(false);



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
   * Safe Travel Calculation:
   * - Viewport clamp: NO word can exceed the screen boundary.
   * - Collision clamp: a word never overlaps its same-line partner; it stops
   *   at the empty space between them (with a small gap).
   */
  const getTargetX = (item: AnimatedWordConfig, el: HTMLElement) => {
    if (typeof window === 'undefined') return 0;
    const isMobile = window.innerWidth < 768;
    const screenWidth = window.innerWidth;
    const safetyMargin = isMobile ? 20 : 36;
    const collisionGap = isMobile ? 18 : 56;

    // Get current GSAP translation to derive the unshifted base position
    const currentX = (gsap.getProperty(el, 'x') as number) || 0;
    const rect = el.getBoundingClientRect();
    const baseLeft = rect.left - currentX;
    const baseRight = rect.right - currentX;

    // Viewport clamp: baseLeft + targetX >= safetyMargin && baseRight + targetX <= screenWidth - safetyMargin
    let minAllowedX = safetyMargin - baseLeft;
    let maxAllowedX = (screenWidth - safetyMargin) - baseRight;

    // Collision clamp against same-line words (use their base positions too)
    const colliders: Array<{ left: number; right: number; top: number; bottom: number }> = [];
    for (const [a, b] of linePairsRef.current) {
      let other: AnimatedWordConfig | null = null;
      if (a.id === item.id) other = b;
      else if (b.id === item.id) other = a;
      if (!other) continue;
      const otherEl = other.ref.current;
      if (!otherEl) continue;
      const otherX = (gsap.getProperty(otherEl, 'x') as number) || 0;
      const oRect = otherEl.getBoundingClientRect();
      colliders.push({
        left: oRect.left - otherX,
        right: oRect.right - otherX,
        top: oRect.top,
        bottom: oRect.bottom,
      });
    }

    // IDEA. also avoids the fixed "AN" span on the line above
    if (item.id === 'idea' && anRef.current) {
      const anRect = anRef.current.getBoundingClientRect();
      colliders.push({
        left: anRect.left,
        right: anRect.right,
        top: anRect.top,
        bottom: anRect.bottom,
      });
    }

    for (const col of colliders) {
      // Vertical overlap check: words on clearly different lines never collide
      const verticalOverlap = rect.top < col.bottom - 12 && rect.bottom > col.top + 12;
      if (!verticalOverlap) continue;

      if (col.left >= baseRight) {
        // Obstacle sits to the right — moving right must stop before touching it
        maxAllowedX = Math.min(maxAllowedX, col.left - collisionGap - baseRight);
      } else if (col.right <= baseLeft) {
        // Obstacle sits to the left — moving left must stop before touching it
        minAllowedX = Math.max(minAllowedX, col.right + collisionGap - baseLeft);
      }
    }

    if (minAllowedX >= maxAllowedX) {
      return 0; // No free space on this line
    }

    const dir = wordDirStateRef.current[item.id] || item.openDirection;

    // Words glide through available empty space, clamped above.
    const hasLineMate = linePairsRef.current.some(([a, b]) => a.id === item.id || b.id === item.id);
    const maxShift = isMobile ? 60 : (hasLineMate ? 150 : 240);

    const rawX = dir === 'right' ? maxShift : -maxShift;

    // Hard mathematical clamp guarantees viewport safety + no overlap
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
          duration: 1.6,
          delay: 0.12,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      } else {
        if (!elAny._isSlowTweening || elAny._isTez) {
          elAny._isTez = false;
          elAny._isSlowTweening = true;
          gsap.to(el, {
            x: targetX,
            duration: 3.6,
            delay: 0.2,
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
          duration: 1.6,
          delay: 0.12,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      } else {
        if (!elAny._isSlowTweening || elAny._isTez) {
          elAny._isTez = false;
          elAny._isSlowTweening = true;
          gsap.to(el, {
            x: targetX,
            duration: 3.6,
            delay: 0.2,
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

  // Pencil drawing line that follows the mouse (navy blue)
  const drawPencilSegment = (x: number, y: number) => {
    const canvas = drawCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const last = lastDrawPointRef.current;
    ctx.strokeStyle = 'rgba(10, 31, 68, 0.85)';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (!last) {
      ctx.beginPath();
      ctx.arc(x, y, 0.9, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(10, 31, 68, 0.85)';
      ctx.fill();
    } else {
      const dist = Math.hypot(x - last.x, y - last.y);
      if (dist < 2.5) return;
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      // Rough hand-drawn pencil feel
      ctx.lineTo(x + (Math.random() - 0.5) * 1.6, y + (Math.random() - 0.5) * 1.6);
      ctx.lineWidth = 1.4 + Math.random() * 0.9;
      ctx.stroke();
    }
    lastDrawPointRef.current = { x, y };
    // Keep the fade loop running WHILE drawing so it always looks like a
    // short trail behind the cursor instead of a permanent drawing
    fadePencilDrawing();
  };

  const fadePencilDrawing = () => {
    if (drawRafRef.current) return;
    const canvas = drawCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const step = () => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let hasInk = false;
      for (let i = 3; i < data.length; i += 16) {
        if (data[i] > 8) { hasInk = true; break; }
      }
      if (hasInk) {
        drawRafRef.current = requestAnimationFrame(step);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawRafRef.current = null;
      }
    };
    drawRafRef.current = requestAnimationFrame(step);
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

    // Pencil drawing trail
    const canvas = drawCanvasRef.current;
    if (canvas && e.pointerType !== 'touch') {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      drawPencilSegment((clientX - rect.left) * dpr, (clientY - rect.top) * dpr);
    }
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
    lastDrawPointRef.current = null;
    fadePencilDrawing();

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
    // Build same-line pairs so words never overlap while drifting
    linePairsRef.current = [
      [animatedWords[0], animatedWords[1]],   // EVERY / EXPERIENCE
      [animatedWords[2], animatedWords[3]],   // BEGINS / WITH
      [animatedWords[5], animatedWords[6]],   // FROM / ORIGIN
      [animatedWords[7], animatedWords[8]],   // TO / EXCELLENCE.
      [animatedWords[9], animatedWords[10]],  // SHAPING / FORMS
      [animatedWords[11], animatedWords[12]], // THAT / CONNECT,
      [animatedWords[13], animatedWords[14]], // INSPIRE / & ENDURE.
    ];

    const canvas = drawCanvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const resize = () => {
      const rect = section.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(section);

    // Compact starting state — DESKTOP ONLY (mobile keeps the original layout)
    const isFine = window.matchMedia('(pointer: fine)').matches;
    const releaseCompact = () => {
      if (hasReleasedCompactRef.current) return;
      hasReleasedCompactRef.current = true;
      animatedWords.forEach((item) => {
        const el = item.ref.current;
        if (!el) return;
        gsap.to(el, { x: 0, duration: 1.6, ease: 'power3.out', overwrite: 'auto' });
      });
    };
    if (isFine) {
      animatedWords.forEach((item) => {
        const el = item.ref.current;
        if (!el) return;
        gsap.set(el, { x: compactStartOffsets.current[item.id] || 0 });
      });
      section.addEventListener('pointermove', releaseCompact, { once: true });
    }

    // Mobile: trigger word drift on every touch movement AND on scroll,
    // using the live touch point (or section center while scrolling)
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    const handleTouchMove = (e: TouchEvent) => {
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = null;
      }
      const t = e.touches[0];
      if (!t) return;
      const { clientX, clientY } = t;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        updateWordAnimations(clientX, clientY);
      });
    };
    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const cx = rect.left + rect.width / 2;
      const cy = Math.min(Math.max(window.innerHeight * 0.45, rect.top), rect.bottom);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        updateWordAnimations(cx, cy);
      });
    };
    if (isCoarse) {
      section.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      ro.disconnect();
      if (isCoarse) {
        section.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('scroll', handleScroll);
      }
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (drawRafRef.current) cancelAnimationFrame(drawRafRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="intro"
      className="relative w-full min-h-screen text-[#0A1F44] overflow-hidden flex flex-col justify-between px-3 sm:px-8 lg:px-16 pb-6 select-none"
      style={{
        background: '#FFFFFF',
        fontFamily: "'OT Brut', 'Bodoni Moda', serif",
      }}
    >
      {/* ── Pristine Subtle Micro-Grid Overlay (Zero papery grit) ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(rgba(30, 144, 255, 0.10) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Pencil drawing canvas — navy line follows the mouse, fades like pencil ink */}
      <canvas
        ref={drawCanvasRef}
        className="absolute inset-0 z-[5] w-full h-full pointer-events-none"
        aria-hidden="true"
      />

      {/* ══════════════════════════════════════════════
          MAIN EDITORIAL TYPOGRAPHY POSTER
      ══════════════════════════════════════════════ */}
      <div
        ref={posterRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className="relative z-10 w-full max-w-[1700px] mx-auto pt-8 sm:pt-12 md:pt-16 flex flex-col md:gap-y-6 cursor-default"
      >
        
        {/* ── PAIR 1: EVERY (left: 0%) ... EXPERIENCE (right: 100%) ── */}
        <div className="w-full flex flex-col md:flex-row md:justify-between items-start md:items-baseline leading-[0.92] sm:leading-[0.94] md:leading-[0.92] gap-y-2 sm:gap-y-2.5 md:gap-y-0 mb-2 sm:mb-2.5 md:mb-0">
          <h2
            className="self-start text-left pl-1 sm:pl-3 md:pl-0 intro-reveal-text uppercase text-[#0A1F44] font-bold tracking-[-0.03em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] md:text-[clamp(40px,7.2vw,118px)] scale-y-[1.08] md:scale-y-[1.06] origin-bottom-left"
            style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
          >
            <span
              ref={everyRef}
              onClick={() => triggerWordInteraction('every')}
              onPointerDown={() => triggerWordInteraction('every')}
              className="inline-block cursor-pointer select-none"
              style={{ display: 'inline-block', willChange: 'transform', fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
            >
              EVERY
            </span>
          </h2>
          <h2
            className="self-end text-right pr-1 sm:pr-3 md:pr-0 intro-reveal-text uppercase text-[#0A1F44] font-bold tracking-[-0.03em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] md:text-[clamp(40px,7.2vw,118px)] scale-y-[1.08] md:scale-y-[1.06] origin-bottom-right"
            style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
          >
            <span
              ref={experienceRef}
              onClick={() => triggerWordInteraction('experience')}
              onPointerDown={() => triggerWordInteraction('experience')}
              className="inline-block cursor-pointer select-none"
              style={{ display: 'inline-block', willChange: 'transform', fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
            >
              EXPERIENCE
            </span>
          </h2>
        </div>

        {/* ── PAIR 2: BEGINS (Spine: 33.8%) ... WITH (right: 100%) ── */}
        <div className="w-full flex flex-col md:flex-row md:justify-between items-start md:items-baseline leading-[0.92] sm:leading-[0.94] md:leading-[0.92] gap-y-2 sm:gap-y-2.5 md:gap-y-0 mb-2 sm:mb-2.5 md:mb-0">
          <h2
            className="self-start text-left pl-8 sm:pl-16 md:pl-[33.8%] intro-reveal-text uppercase text-[#0A1F44] font-bold tracking-[-0.03em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] md:text-[clamp(40px,7.2vw,118px)] scale-y-[1.08] md:scale-y-[1.06] origin-bottom-left"
            style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
          >
            <span
              ref={beginsRef}
              onClick={() => triggerWordInteraction('begins')}
              onPointerDown={() => triggerWordInteraction('begins')}
              className="inline-block cursor-pointer select-none"
              style={{ display: 'inline-block', willChange: 'transform', fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
            >
              BEGINS
            </span>
          </h2>
          <h2
            className="self-end text-right pr-1 sm:pr-3 md:pr-0 intro-reveal-text uppercase text-[#0A1F44] font-bold tracking-[-0.03em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] md:text-[clamp(40px,7.2vw,118px)] scale-y-[1.08] md:scale-y-[1.06] origin-bottom-right"
            style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
          >
            <span
              ref={withRef}
              onClick={() => triggerWordInteraction('with')}
              onPointerDown={() => triggerWordInteraction('with')}
              className="inline-block cursor-pointer select-none"
              style={{ display: 'inline-block', willChange: 'transform', fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
            >
              WITH
            </span>
          </h2>
        </div>

        {/* ── ROW 3: AN (left: 0%) ... IDEA. (Spine: 33.8%) ── */}
        <div className="w-full flex flex-col md:flex-row items-start md:items-baseline leading-[0.92] sm:leading-[0.94] md:leading-[0.92] gap-y-2 sm:gap-y-2.5 md:gap-y-0 mb-2 sm:mb-2.5 md:mb-0 relative">
          <h2
            className="self-start text-left pl-1 sm:pl-3 md:pl-0 intro-reveal-text uppercase text-[#0A1F44] font-bold tracking-[-0.03em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] md:text-[clamp(40px,7.2vw,118px)] scale-y-[1.08] md:scale-y-[1.06] origin-bottom-left"
            style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
          >
            <span
              ref={anRef}
              onClick={() => triggerWordInteraction('idea')}
              onPointerDown={() => triggerWordInteraction('idea')}
              className="inline-block cursor-pointer select-none"
              style={{ display: 'inline-block', willChange: 'transform', fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
            >
              AN
            </span>
          </h2>

          <div className="md:absolute md:left-[33.8%] flex items-baseline gap-6 lg:gap-14">
            <h2
              className="self-start text-left intro-reveal-text uppercase text-[#0A1F44] font-bold tracking-[-0.03em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] md:text-[clamp(40px,7.2vw,118px)] scale-y-[1.08] md:scale-y-[1.06] origin-bottom-left"
              style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
            >
              <span
                ref={ideaRef}
                onClick={() => triggerWordInteraction('idea')}
                onPointerDown={() => triggerWordInteraction('idea')}
                className="inline-block cursor-pointer select-none"
                style={{ display: 'inline-block', willChange: 'transform', fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
              >
                IDEA.
              </span>
            </h2>
          </div>
        </div>

        {/* ── PAIR 4: FROM (indented: 13.6%) ... ORIGIN (inset right: 13.3%) ── */}
        <div className="w-full flex flex-col md:flex-row md:justify-between items-start md:items-baseline leading-[0.92] sm:leading-[0.94] md:leading-[0.92] gap-y-2 sm:gap-y-2.5 md:gap-y-0 mb-2 sm:mb-2.5 md:mb-0">
          <h2
            className="self-start text-left pl-3 sm:pl-6 md:pl-[13.6%] intro-reveal-text uppercase text-[#0A1F44] font-bold tracking-[-0.03em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] md:text-[clamp(40px,7.2vw,118px)] scale-y-[1.08] md:scale-y-[1.06] origin-bottom-left"
            style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
          >
            <span
              ref={fromRef}
              onClick={() => triggerWordInteraction('from')}
              onPointerDown={() => triggerWordInteraction('from')}
              className="inline-block cursor-pointer select-none"
              style={{ display: 'inline-block', willChange: 'transform', fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
            >
              FROM
            </span>
          </h2>
          <h2
            className="self-end text-right pr-3 sm:pr-6 md:pr-[13.3%] intro-reveal-text uppercase text-[#0A1F44] font-bold tracking-[-0.03em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] md:text-[clamp(40px,7.2vw,118px)] scale-y-[1.08] md:scale-y-[1.06] origin-bottom-right"
            style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
          >
            <span
              ref={originRef}
              onClick={() => triggerWordInteraction('origin')}
              onPointerDown={() => triggerWordInteraction('origin')}
              className="inline-block cursor-pointer select-none"
              style={{ display: 'inline-block', willChange: 'transform', fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
            >
              ORIGIN
            </span>
          </h2>
        </div>

        {/* ── PAIR 5: TO (Spine: 33.8%) ... EXCELLENCE. (ends at ~86.4%) ── */}
        <div className="w-full flex flex-col md:flex-row items-start md:items-baseline leading-[0.92] sm:leading-[0.94] md:leading-[0.92] gap-y-2 sm:gap-y-2.5 md:gap-y-0 mb-2 sm:mb-2.5 md:mb-0">
          <h2
            className="self-start text-left pl-8 sm:pl-16 md:pl-[33.8%] intro-reveal-text uppercase text-[#0A1F44] font-bold tracking-[-0.03em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] md:text-[clamp(40px,7.2vw,118px)] scale-y-[1.08] md:scale-y-[1.06] origin-bottom-left"
            style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
          >
            <span
              ref={toRef}
              onClick={() => triggerWordInteraction('to')}
              onPointerDown={() => triggerWordInteraction('to')}
              className="inline-block cursor-pointer select-none"
              style={{ display: 'inline-block', willChange: 'transform', fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
            >
              TO
            </span>
          </h2>
          <h2
            className="self-start text-left pl-4 sm:pl-8 md:pl-[6.5%] intro-reveal-text uppercase text-[#0A1F44] font-bold tracking-[-0.03em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] md:text-[clamp(40px,7.2vw,118px)] scale-y-[1.08] md:scale-y-[1.06] origin-bottom-left"
            style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
          >
            <span
              ref={excellenceRef}
              onClick={() => triggerWordInteraction('excellence')}
              onPointerDown={() => triggerWordInteraction('excellence')}
              className="inline-block cursor-pointer select-none"
              style={{ display: 'inline-block', willChange: 'transform', fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
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
              className="self-start text-left pl-6 sm:pl-14 intro-reveal-text uppercase text-[#0A1F44] font-semibold tracking-[-0.04em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] scale-y-[1.08] origin-bottom-left"
              style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
            >
              <span
                ref={shapingRef}
                onClick={() => triggerWordInteraction('shaping')}
                onPointerDown={() => triggerWordInteraction('shaping')}
                className="inline-block cursor-pointer select-none"
                style={{ display: 'inline-block', willChange: 'transform', fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
              >
                SHAPING
              </span>
            </h2>
            <h2
              className="self-end text-right pr-12 sm:pr-24 intro-reveal-text uppercase text-[#0A1F44] font-semibold tracking-[-0.04em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] scale-y-[1.08] origin-bottom-right"
              style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
            >
              <span
                ref={formsRef}
                onClick={() => triggerWordInteraction('forms')}
                onPointerDown={() => triggerWordInteraction('forms')}
                className="inline-block cursor-pointer select-none"
                style={{ display: 'inline-block', willChange: 'transform', fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
              >
                FORMS
              </span>
            </h2>
          </div>

          {/* THAT (left: 0%) ... CONNECT, (right: ~85%) */}
          <div className="w-full flex flex-col leading-[0.92] sm:leading-[0.94] gap-y-2 sm:gap-y-2.5 mb-2 sm:mb-2.5">
            <h2
              className="self-start text-left pl-1 sm:pl-3 intro-reveal-text uppercase text-[#0A1F44] font-semibold tracking-[-0.04em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] scale-y-[1.08] origin-bottom-left"
              style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
            >
              <span
                ref={thatRef}
                onClick={() => triggerWordInteraction('that')}
                onPointerDown={() => triggerWordInteraction('that')}
                className="inline-block cursor-pointer select-none"
                style={{ display: 'inline-block', willChange: 'transform', fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
              >
                THAT
              </span>
            </h2>
            <h2
              className="self-end text-right pr-4 sm:pr-8 intro-reveal-text uppercase text-[#0A1F44] font-semibold tracking-[-0.04em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] scale-y-[1.08] origin-bottom-right"
              style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
            >
              <span
                ref={connectRef}
                onClick={() => triggerWordInteraction('connect')}
                onPointerDown={() => triggerWordInteraction('connect')}
                className="inline-block cursor-pointer select-none"
                style={{ display: 'inline-block', willChange: 'transform', fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
              >
                CONNECT,
              </span>
            </h2>
          </div>

          {/* INSPIRE (left: ~10%) ... & ENDURE. (right: 98%) */}
          <div className="w-full flex flex-col leading-[0.92] sm:leading-[0.94] gap-y-2 sm:gap-y-2.5">
            <h2
              className="self-start text-left pl-3 sm:pl-6 intro-reveal-text uppercase text-[#0A1F44] font-semibold tracking-[-0.04em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] scale-y-[1.08] origin-bottom-left"
              style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
            >
              <span
                ref={inspireRef}
                onClick={() => triggerWordInteraction('inspire')}
                onPointerDown={() => triggerWordInteraction('inspire')}
                className="inline-block cursor-pointer select-none"
                style={{ display: 'inline-block', willChange: 'transform', fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
              >
                INSPIRE
              </span>
            </h2>
            <h2
              className="self-end text-right pr-1 sm:pr-2 intro-reveal-text uppercase text-[#0A1F44] font-semibold tracking-[-0.04em] text-[clamp(36px,min(10.2vw,5.6vh),118px)] scale-y-[1.08] origin-bottom-right"
              style={{ fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
            >
              <span
                ref={endureRef}
                onClick={() => triggerWordInteraction('endure')}
                onPointerDown={() => triggerWordInteraction('endure')}
                className="inline-block cursor-pointer select-none"
                style={{ display: 'inline-block', willChange: 'transform', fontFamily: "'OT Brut', 'Bodoni Moda', serif" }}
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
      <div className="hidden md:flex relative z-10 w-full max-w-[1700px] mx-auto mt-8 mb-16 md:mb-24 justify-end">
        <div className="w-8/12 lg:w-6/12 border-l-2 border-[#0A1F44]/25 pl-8 space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] font-mono font-bold text-[#0A1F44]/60 block">
            {"// WHAT WE BELIEVE"}
          </span>
          <p className="text-[17px] font-mono text-[#0A1F44] leading-relaxed">
            <strong className="font-bold text-[#0A1F44]">“Origo” means Origin</strong> – the starting point from which every idea, form and creation begins. Every great design begins with a simple origin and evolves into something extraordinary.
          </p>
          <p className="text-[17px] font-mono text-[#0A1F44]/80 leading-relaxed">
            We believe in finding the origin of that idea and building from there. The objective is not simply to create something visually impressive, but to create experiences that connect, engage, inspire and endure.
          </p>
        </div>
      </div>

    </section>
  );
}
