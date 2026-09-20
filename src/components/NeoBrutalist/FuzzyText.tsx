'use client';

import React, { useEffect, useRef } from 'react';

interface FuzzyTextProps {
  children: React.ReactNode;
  fontSize?: number | string;
  fontWeight?: number | string;
  fontFamily?: string;
  color?: string;
  enableHover?: boolean;
  baseIntensity?: number;
  hoverIntensity?: number;
  className?: string;
}

export default function FuzzyText({
  children,
  fontSize = 'clamp(2rem, 10vw, 10rem)',
  fontWeight = 900,
  fontFamily = "'ERF Neot', 'OT Brut', sans-serif",
  color = '#ffffff',
  enableHover = true,
  baseIntensity = 0.18,
  hoverIntensity = 0.55,
  className = '',
}: FuzzyTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let isCancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cleanupFns: Array<() => void> = [];

    const init = async () => {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      if (isCancelled) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const text = React.Children.toArray(children).join('');
      const fontSizeStr = typeof fontSize === 'number' ? `${fontSize}px` : fontSize;

      // Resolve clamp()/vw font sizes to a concrete px value
      let numericFontSize: number;
      if (typeof fontSize === 'number') {
        numericFontSize = fontSize;
      } else {
        const temp = document.createElement('span');
        temp.style.fontSize = fontSizeStr;
        document.body.appendChild(temp);
        numericFontSize = parseFloat(window.getComputedStyle(temp).fontSize);
        document.body.removeChild(temp);
      }

      const offscreen = document.createElement('canvas');
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;

      offCtx.font = `${fontWeight} ${numericFontSize}px ${fontFamily}`;
      const metrics = offCtx.measureText(text);
      const actualLeft = metrics.actualBoundingBoxLeft ?? 0;
      const actualRight = metrics.actualBoundingBoxRight ?? metrics.width;
      const actualAscent = metrics.actualBoundingBoxAscent ?? numericFontSize;
      const actualDescent = metrics.actualBoundingBoxDescent ?? numericFontSize * 0.2;

      const textWidth = Math.ceil(actualLeft + actualRight);
      const textHeight = Math.ceil(actualAscent + actualDescent);

      const extraWidthBuffer = 10;
      const offscreenWidth = textWidth + extraWidthBuffer;

      offscreen.width = offscreenWidth;
      offscreen.height = textHeight;

      // Resizing a canvas resets its state — re-apply the font
      offCtx.font = `${fontWeight} ${numericFontSize}px ${fontFamily}`;
      offCtx.textBaseline = 'alphabetic';
      offCtx.fillStyle = color;
      const xOffset = extraWidthBuffer / 2;
      offCtx.fillText(text, xOffset - actualLeft, actualAscent);

      const horizontalMargin = 60;
      const verticalMargin = 14;
      canvas.width = offscreenWidth + horizontalMargin * 2;
      canvas.height = textHeight + verticalMargin * 2;
      ctx.translate(horizontalMargin, verticalMargin);

      let currentIntensity = baseIntensity;
      let targetIntensity = baseIntensity;
      const fuzzRange = 30;

      const run = () => {
        if (isCancelled) return;
        ctx.clearRect(-horizontalMargin, -verticalMargin, canvas.width, canvas.height);
        currentIntensity += (targetIntensity - currentIntensity) * 0.12;
        for (let j = 0; j < textHeight; j++) {
          const dx = Math.floor(currentIntensity * (Math.random() - 0.5) * fuzzRange);
          ctx.drawImage(offscreen, 0, j, offscreenWidth, 1, dx, j, offscreenWidth, 1);
        }
        animationFrameId = window.requestAnimationFrame(run);
      };
      run();

      if (enableHover) {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          // Hover zone hugs the rendered text (inside the margins)
          const isInside =
            x >= horizontalMargin - 40 &&
            x <= rect.width - horizontalMargin + 40 &&
            y >= verticalMargin - 40 &&
            y <= rect.height - verticalMargin + 40;
          targetIntensity = isInside ? hoverIntensity : baseIntensity;
        };
        const handleMouseLeave = () => {
          targetIntensity = baseIntensity;
        };
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);
        cleanupFns.push(() => {
          canvas.removeEventListener('mousemove', handleMouseMove);
          canvas.removeEventListener('mouseleave', handleMouseLeave);
        });
      }
    };

    init();

    return () => {
      isCancelled = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      cleanupFns.forEach((fn) => fn());
    };
  }, [children, fontSize, fontWeight, fontFamily, color, enableHover, baseIntensity, hoverIntensity]);

  return <canvas ref={canvasRef} className={className} style={{ maxWidth: '100%', height: 'auto' }} />;
}
