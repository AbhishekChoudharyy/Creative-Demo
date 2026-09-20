'use client';

import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Send } from 'lucide-react';
import { soundManager } from '@/lib/sound';
import AsciiScramble from './AsciiScramble';

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
        { y: 110, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.4,
          ease: 'power3.out',
          stagger: 0.3,
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
    <section
      ref={sectionRef}
      id="contact"
      className="relative z-30 px-8 md:px-16 lg:px-24 py-24 lg:py-32 pb-40 lg:pb-52 text-[#0A1F44] overflow-hidden rounded-t-[36px] sm:rounded-t-[56px] border-t border-white/60 will-change-transform"
      style={{
        // Form + Footer treated as ONE continuous canvas:
        // long white → soft sky → brand blue, ending at the page bottom
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 34%, #EDF5FD 55%, #BFE0FD 72%, #7CB8F9 84%, #1E90FF 100%)',
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 w-full">
        {/* LEFT SIDE */}
        <div className="flex flex-col justify-center">
          {/* Section Label */}
          <div className="flex gap-2 items-center mb-12 cf-stack">
            <p className="text-[#0A1F44] font-heading font-bold text-lg sm:text-2xl uppercase tracking-wider">
              CONTACT US
            </p>
          </div>

          <h3
            className="text-[#0A1F44] font-heading font-black text-3xl sm:text-4xl lg:text-5xl leading-tight uppercase tracking-tight cf-stack"
            style={{ fontFamily: "'ERF Neot', sans-serif" }}
          >
            <AsciiScramble text="Let's " /><span className="text-transparent" style={{ WebkitTextStroke: "1px #0A1F44" }}><AsciiScramble text="Create" /></span>
            <br />
            <AsciiScramble text="From The" />
            <br />
            <span className="text-[#0A1F44] font-bold"><AsciiScramble text="Origin." /></span>
          </h3>

          <p className="text-sm sm:text-base font-mono mt-6 mb-8 max-w-md text-[#0A1F44]/80 leading-relaxed cf-stack">
            Partner with Origo Atelier to transform ideas into immersive brand experiences, activations, and exhibitions. From origin to excellence.
          </p>

          <a
            href="#work"
            onMouseEnter={() => soundManager.playHover()}
            onClick={(e) => {
              e.preventDefault();
              soundManager.playClick();
              const workSection = document.getElementById("work");
              workSection?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group inline-flex items-center gap-3 w-fit cf-stack"
          >
            <span className="px-8 py-3 bg-transparent text-[#0A1F44] font-heading font-bold text-sm uppercase tracking-wider border-2 border-[#0A1F44] hover:bg-[#0A1F44] hover:text-white transition-colors duration-300">
              Explore Our Work
            </span>
            <span className="w-10 h-10 bg-transparent text-[#0A1F44] border-2 border-[#0A1F44] flex items-center justify-center group-hover:rotate-45 group-hover:bg-[#0A1F44] group-hover:text-white transition-all duration-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </span>
          </a>
        </div>

        {/* RIGHT FORM - Seamless blend without background overlay */}
        <div className="flex flex-col justify-center">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center text-center py-16 space-y-6 border border-[#0A1F44] bg-transparent rounded-xl">
              <div className="w-16 h-16 rounded-full bg-[#0A1F44]/10 border border-[#0A1F44]/20 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A1F44" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-heading font-bold text-[#0A1F44] uppercase">Message Sent!</h3>
              <p className="text-[#0A1F44]/85 text-sm font-mono max-w-sm">
                Thank you for reaching out. We&apos;ll get back to you within 24 hours.
              </p>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setStatus('idle');
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="text-xs font-mono text-[#0A1F44] hover:text-white underline transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 cf-stack">
                <FormInput label="Name" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                <FormInput label="Brand / Company" name="brandName" value={formData.brandName} onChange={(e) => setFormData({ ...formData, brandName: e.target.value })} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 cf-stack">
                <FormInput label="Email" name="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                <FormInput label="Phone" name="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>

              <div className="cf-stack">
                <FormInput label="Your Message" name="message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                onMouseEnter={() => soundManager.playHover()}
                className="w-full min-h-[48px] bg-transparent text-[#0A1F44] font-heading uppercase font-bold py-3.5 px-6 border-2 border-[#0A1F44] hover:bg-[#0A1F44] hover:text-white transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 active:translate-x-[2px] active:translate-y-[2px] cf-stack"
              >
                <span>{status === 'sending' ? 'Sending...' : 'Send Message'}</span>
                <Send className="h-4 w-4" />
              </button>

              {status === 'error' && (
                <p className="text-red-600 text-xs font-mono font-semibold">Something went wrong. Please try again.</p>
              )}
            </form>
          )}
        </div>
      </div>


    </section>
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
          border-b border-[#0A1F44]/20
          py-3
          text-sm
          outline-none
          text-[#0A1F44]
          placeholder:text-[#0A1F44]/50
          focus:border-[#0A1F44]
          transition-colors duration-300
          font-mono
        "
      />
    </div>
  );
}
