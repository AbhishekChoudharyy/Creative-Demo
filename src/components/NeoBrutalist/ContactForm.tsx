'use client';

import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Send, ArrowUpRight } from 'lucide-react';
import { soundManager } from '@/lib/sound';
import AsciiScramble from './AsciiScramble';
import Footer from './Footer';

gsap.registerPlugin(ScrollTrigger);

export default function ContactForm() {
  const sectionRef = useRef<HTMLElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    brandName: '',
    email: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  useEffect(() => {
    const ctx = gsap.context(() => {
      const servicesEl = document.getElementById('services');
      if (!servicesEl) return;

      ScrollTrigger.create({
        id: 'services-to-contact-stack',
        trigger: servicesEl,
        start: 'bottom bottom',
        end: '+=160%',
        pin: true,
        pinSpacing: false,
        anticipatePin: 1,
        scrub: 0.8,
        onUpdate: (self) => {
          gsap.set(servicesEl, {
            scale: 1 - self.progress * 0.06,
            opacity: 1 - self.progress * 0.3,
            transformOrigin: 'center bottom',
          });
        },
      });

      // Staggered / delayed stacked entrance for all form blocks
      gsap.fromTo(
        '.cf-stack',
        { y: 100, opacity: 0, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.3,
          ease: 'power3.out',
          stagger: 0.2,
          scrollTrigger: {
            id: 'contact-staggered-reveal',
            trigger: sectionRef.current,
            start: 'top 82%',
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setStatus('sending');
    soundManager.playClick();
    // Simulate submission
    setTimeout(() => {
      setStatus('success');
      soundManager.playChime();
      setFormData({ name: '', brandName: '', email: '', phone: '', message: '' });
    }, 1500);
  };

  return (
    <footer
      ref={sectionRef}
      id="contact"
      className="relative z-30 w-full text-[#0A1F44] overflow-hidden rounded-t-[36px] sm:rounded-t-[56px] border-t border-white/60 shadow-[0_-25px_60px_rgba(0,0,0,0.14)] will-change-transform"
      style={{
        // One continuous organic canvas: Pure White → Soft Ice Sky → Electric Blue
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 24%, #F0F6FD 40%, #C4E1FD 56%, #70B4F9 70%, #1E90FF 82%, #1E90FF 100%)',
      }}
    >
      {/* ── UPPER ZONE: INTERACTIVE CONTACT FORM ── */}
      <div className="px-6 sm:px-10 md:px-14 lg:px-20 pt-20 sm:pt-28 lg:pt-32 pb-14 sm:pb-18 max-w-[1440px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 w-full">
          {/* LEFT SIDE */}
          <div className="flex flex-col justify-center">
            {/* Section Label */}
            <div className="flex gap-2 items-center mb-8 sm:mb-10 cf-stack">
              <span className="text-[#0A1F44]/60 font-mono text-xs sm:text-sm tracking-[0.2em] font-semibold uppercase">
                [ 05 // CONTACT US ]
              </span>
            </div>

            <h3
              className="text-[#0A1F44] font-heading font-black text-3xl sm:text-4xl lg:text-5xl leading-[1.08] uppercase tracking-tight cf-stack"
              style={{ fontFamily: "'ERF Neot', sans-serif" }}
            >
              <AsciiScramble text="Let's " />
              <span className="text-transparent" style={{ WebkitTextStroke: "1.5px #0A1F44" }}>
                <AsciiScramble text="Create" />
              </span>
              <br />
              <AsciiScramble text="From The" />
              <br />
              <span className="text-[#0A1F44] font-bold">
                <AsciiScramble text="Origin." />
              </span>
            </h3>

            <p className="text-sm sm:text-base font-mono mt-6 mb-8 max-w-md text-[#0A1F44]/80 leading-relaxed cf-stack">
              Partner with Origo Atelier to transform ideas into immersive brand experiences, activations, and exhibitions. From origin to excellence.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 cf-stack">
              <a
                href="#work"
                onMouseEnter={() => soundManager.playHover()}
                onClick={(e) => {
                  e.preventDefault();
                  soundManager.playClick();
                  const workSection = document.getElementById("work");
                  workSection?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group inline-flex items-center gap-3 w-fit"
              >
                <span className="px-7 py-3 bg-transparent text-[#0A1F44] font-heading font-bold text-xs sm:text-sm uppercase tracking-wider border-2 border-[#0A1F44] group-hover:bg-[#0A1F44] group-hover:text-white transition-colors duration-300">
                  Explore Our Work
                </span>
                <span className="w-10 h-10 bg-transparent text-[#0A1F44] border-2 border-[#0A1F44] flex items-center justify-center group-hover:rotate-45 group-hover:bg-[#0A1F44] group-hover:text-white transition-all duration-300">
                  <ArrowUpRight className="w-5 h-5" />
                </span>
              </a>

              <a
                href="mailto:hello@origoatelier.com"
                onMouseEnter={() => soundManager.playHover()}
                className="text-xs sm:text-sm font-mono tracking-wider text-[#0A1F44]/75 hover:text-[#0A1F44] underline underline-offset-4 transition-colors py-2"
              >
                hello@origoatelier.com
              </a>
            </div>
          </div>

          {/* RIGHT SIDE: MINIMALIST FORM */}
          <div className="flex flex-col justify-center">
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center text-center py-16 px-6 space-y-6 border-2 border-[#0A1F44] bg-white/40 backdrop-blur-md rounded-2xl shadow-xl">
                <div className="w-16 h-16 rounded-full bg-[#0A1F44]/10 border border-[#0A1F44]/20 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0A1F44" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-heading font-black text-[#0A1F44] uppercase tracking-tight">Message Received</h3>
                <p className="text-[#0A1F44]/80 text-sm font-mono max-w-sm leading-relaxed">
                  Thank you for reaching out. An Origo director will connect with you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setStatus('idle');
                  }}
                  onMouseEnter={() => soundManager.playHover()}
                  className="text-xs font-mono font-bold uppercase tracking-wider text-[#0A1F44] hover:opacity-75 underline transition-opacity pt-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-7">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 cf-stack">
                  <FormInput label="Name" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  <FormInput label="Brand / Company" name="brandName" value={formData.brandName} onChange={(e) => setFormData({ ...formData, brandName: e.target.value })} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 cf-stack">
                  <FormInput label="Email" name="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                  <FormInput label="Phone" name="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>

                <div className="cf-stack">
                  <FormInput label="Your Message / Brief" name="message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  onMouseEnter={() => soundManager.playHover()}
                  className="w-full min-h-[50px] bg-transparent text-[#0A1F44] font-heading uppercase font-black text-sm tracking-wider py-3.5 px-6 border-2 border-[#0A1F44] hover:bg-[#0A1F44] hover:text-white transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 active:translate-x-[2px] active:translate-y-[2px] shadow-sm cf-stack"
                >
                  <span>{status === 'sending' ? 'Transmitting...' : 'Send Message'}</span>
                  <Send className="h-4 w-4" />
                </button>

                {status === 'error' && (
                  <p className="text-red-600 text-xs font-mono font-semibold">Something went wrong. Please try again.</p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>



      {/* ── LOWER ZONE: FOOTER & 3D INTERACTION ── */}
      <Footer />
    </footer>
  );
}

function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <div className="relative w-full">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        aria-required={required}
        aria-label={label}
        placeholder={label}
        autoComplete="off"
        onFocus={() => soundManager.playClick()}
        onMouseEnter={() => soundManager.playHover()}
        className="
          peer
          w-full
          min-h-[44px]
          bg-transparent
          border-b border-[#0A1F44]/25
          py-3
          text-sm
          outline-none
          text-[#0A1F44]
          placeholder:text-[#0A1F44]/55
          focus:border-[#0A1F44]
          transition-colors duration-300
          font-mono
        "
      />
    </div>
  );
}
