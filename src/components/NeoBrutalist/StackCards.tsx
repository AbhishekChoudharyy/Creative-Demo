'use client';

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { soundManager } from "@/lib/sound";
import ContactForm from "./ContactForm";
import EyesCTA from "./EyesCTA";
import Footer from "./Footer";

gsap.registerPlugin(ScrollTrigger);

export default function StackCards() {
  const stackRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sections = gsap.utils.toArray<HTMLElement>(".stack-section");
    if (sections.length < 3) return;

    const footerHeight = footerRef.current?.offsetHeight || 0;
    const isMobileView = window.innerWidth < 768;
    
    // Optimized parameters for smoother mobile experience
    const pinMultiplier = isMobileView ? 1.0 : 2.0;
    const scrubValue = isMobileView ? 0.3 : 0.6;
    const ctaDuration = isMobileView ? 2.5 : 5.4;
    const footerDuration = isMobileView ? 1.0 : 1.8;
    const ctaDelay = isMobileView ? 0.3 : 1.8;

    // Initially disable pointer events on absolutely positioned CTA and Footer
    gsap.set(sections[1], { pointerEvents: "none" });
    gsap.set(sections[2], { pointerEvents: "none" });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stackRef.current,
        start: "bottom bottom",
        end: `+=${window.innerHeight * pinMultiplier + footerHeight}`,
        scrub: scrubValue,
        pin: true,
        anticipatePin: 1,
        onLeaveBack: () => {
          soundManager.playWhooshDown(0.12);
        },
      },
    });

    // CTA slides up from below the container after a scroll offset
    tl.fromTo(
      sections[1],
      { yPercent: 100, pointerEvents: "none" },
      { 
        yPercent: 0, 
        pointerEvents: "auto", 
        duration: ctaDuration,
        onStart: () => {
          soundManager.playWhooshUp(0.25);
        }
      },
      `+=${ctaDelay}`
    );

    // Footer slides up fully in stack animation
    tl.fromTo(
      sections[2],
      { y: footerHeight, pointerEvents: "none" },
      { 
        y: 0, 
        pointerEvents: "auto", 
        duration: footerDuration,
        onStart: () => {
          soundManager.playWhooshDown(0.15);
        }
      }
    );

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div ref={stackRef} className="relative w-full bg-[#050505]">
      {/* 1. ContactForm dictates the container's natural height and flows normally */}
      <section className="stack-section relative z-10 w-full bg-[#050505]">
        <ContactForm />
      </section>

      {/* 2. EyesCTA is pinned to the bottom of the container, ready to slide up */}
      <section className="stack-section absolute bottom-0 left-0 right-0 z-20 w-full bg-[#050505] h-[100svh] lg:h-screen flex items-center justify-center">
        <div className="w-full">
          <EyesCTA />
        </div>
      </section>

      {/* 3. Footer sits at the bottom, ready to slide up last */}
      <section
        ref={footerRef}
        className="stack-section absolute bottom-0 left-0 right-0 z-30 w-full"
      >
        <Footer />
      </section>
    </div>
  );
}
