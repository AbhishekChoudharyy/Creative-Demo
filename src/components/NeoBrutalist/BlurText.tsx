'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface BlurTextProps {
  text: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  direction?: 'top' | 'bottom';
  className?: string;
  style?: React.CSSProperties;
  onAnimationComplete?: () => void;
}

/**
 * ReactBits BlurText / SplitText component
 * - Staggered character reveal transitioning from soft optical blur to crisp focus
 * - Natural spring/ease curve for high-end luxury atelier feel
 * - Micro-spring interactive hover ripple per character
 */
export default function BlurText({
  text,
  delay = 0,
  duration = 0.8,
  stagger = 0.05,
  direction = 'bottom',
  className = '',
  style = {},
  onAnimationComplete,
}: BlurTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chars = containerRef.current.querySelectorAll('.blur-char');
    if (!chars.length) return;

    const yOffset = direction === 'top' ? -22 : 22;

    // Initial state: blurred, translated, hidden
    gsap.set(chars, {
      opacity: 0,
      filter: 'blur(16px)',
      y: yOffset,
      scale: 0.95,
    });

    // Animate to crisp focus
    const tl = gsap.timeline({
      delay: delay / 1000,
      onComplete: onAnimationComplete,
    });

    tl.to(chars, {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      scale: 1,
      duration: duration,
      stagger: stagger,
      ease: 'power3.out',
    });

    return () => {
      tl.kill();
    };
  }, [text, delay, duration, stagger, direction, onAnimationComplete]);

  const handleCharMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    gsap.to(e.currentTarget, {
      y: -6,
      scale: 1.08,
      duration: 0.22,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
    });
  };

  return (
    <span
      ref={containerRef}
      className={`select-none ${className.includes('flex') ? className : `inline-flex flex-nowrap items-baseline ${className}`}`}
      style={style}
    >
      {text.split('').map((char, index) => (
        <span
          key={index}
          className="blur-char inline-block will-change-[transform,opacity,filter] cursor-default"
          style={{
            display: 'inline-block',
            whiteSpace: char === ' ' ? 'pre' : 'normal',
            ...(style?.fontFamily ? { fontFamily: style.fontFamily } : {}),
            ...(style?.textTransform ? { textTransform: style.textTransform } : {}),
            ...(style?.color ? { color: style.color } : {}),
          }}
          onMouseEnter={handleCharMouseEnter}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}

