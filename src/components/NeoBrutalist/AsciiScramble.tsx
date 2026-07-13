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
  
  // ASCII / Matrix character set for scrambling
  const chars = '!?@#$*()_+[]{}<>;:=-%&/\\0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

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
          // Return a random ASCII character
          currentResult += chars[Math.floor(Math.random() * chars.length)];
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
            timeoutRef.current = setTimeout(startScramble, delay);
          } else {
            // Reset text when it leaves viewport so it animates again when scrolled back into view
            setDisplayText('');
          }
        });
      },
      { threshold: 0.15 }
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
