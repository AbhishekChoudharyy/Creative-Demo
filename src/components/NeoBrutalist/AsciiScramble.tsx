'use client';

import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '@/lib/sound';

interface AsciiScrambleProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  triggerOnScroll?: boolean;
  style?: React.CSSProperties;
}

export default function AsciiScramble({
  text,
  className = '',
  delay = 0,
  duration = 800,
  triggerOnScroll = true,
  style
}: AsciiScrambleProps) {
  const [displayText, setDisplayText] = useState('');
  const elementRef = useRef<HTMLSpanElement>(null);
  
  // Ref handles to clear intervals & timeouts on unmount / Fast Refresh
  const intervalRef = useRef<any>(null);
  const timeoutRef = useRef<any>(null);
  
  // ASCII / Matrix character sets for scrambling (case-matched to prevent text height jumping)
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz!?@#$*()_+[]{}<>;:=-%&/\\0123456789';
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!?@#$*()_+[]{}<>;:=-%&/\\0123456789';

  const startScramble = () => {
    // Clear any existing active intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    let frame = 0;
    const intervalTime = 30; // ms per update frame
    const totalFrames = Math.floor(duration / intervalTime);
    const textLength = text.length;

    intervalRef.current = setInterval(() => {
      frame++;
      
      let currentResult = '';
      let playTick = false;

      for (let i = 0; i < textLength; i++) {
        // Spaces do not scramble to keep structure intact
        if (text[i] === ' ') {
          currentResult += ' ';
          continue;
        }

        // Calculate frame at which this character resolves to its final form
        const charResolveFrame = Math.floor((i / textLength) * totalFrames);
        
        if (frame >= charResolveFrame) {
          currentResult += text[i];
        } else {
          // Detect case of the original character to avoid jarring uppercase-lowercase size flickering
          const isCharLowercase = text[i] === text[i].toLowerCase() && text[i] !== text[i].toUpperCase();
          const targetChars = isCharLowercase ? lowercaseChars : uppercaseChars;
          currentResult += targetChars[Math.floor(Math.random() * targetChars.length)];
          
          // Occasional tick sound for randomized organic density
          if (Math.random() > 0.65) {
            playTick = true;
          }
        }
      }

      setDisplayText(currentResult);

      if (playTick) {
        soundManager.playTextTick();
      }

      if (frame >= totalFrames) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setDisplayText(text);
      }
    }, intervalTime);
  };

  useEffect(() => {
    if (!triggerOnScroll) {
      startScramble();
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }

    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Clear any pending timeout and start scramble
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(startScramble, delay);
          } else {
            // Only reset when completely out of view to avoid flickering near the scroll boundary
            if (entry.intersectionRatio === 0) {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              setDisplayText('');
            }
          }
        });
      },
      { threshold: [0, 0.15] }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      observer.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text, delay, triggerOnScroll]);

  return (
    <span ref={elementRef} className={className} style={style}>
      {displayText || text}
    </span>
  );
}
