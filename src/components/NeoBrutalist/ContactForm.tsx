'use client';

import React, { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { soundManager } from '@/lib/sound';
import AsciiScramble from './AsciiScramble';

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
      className="relative px-8 md:px-16 lg:px-24 py-24 lg:py-32 bg-[#fe5416] text-black overflow-hidden border-t border-black/10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 w-full">
        {/* LEFT SIDE */}
        <div className="flex flex-col justify-center">
          {/* Section Label */}
          <div className="flex gap-2 items-center mb-12">
            <p className="text-black font-heading font-bold text-lg sm:text-2xl uppercase tracking-wider">
              CONTACT US
            </p>
          </div>

          <h3 className="text-black font-heading font-black text-3xl sm:text-4xl lg:text-5xl leading-tight uppercase tracking-tight">
            <AsciiScramble text="Let's " /><span className="text-transparent" style={{ WebkitTextStroke: "1px #000" }}><AsciiScramble text="Render" /></span>
            <br />
            <AsciiScramble text="The Next" />
            <br />
            <span className="text-white"><AsciiScramble text="Dimension." /></span>
          </h3>

          <p className="text-sm sm:text-base font-mono mt-6 mb-8 max-w-md text-black/80 leading-relaxed">
            Partner with Creative Agency to design high-fidelity interactive 3D, spatial mapping, and volumetric installations. Let's make something legendary.
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
            className="group inline-flex items-center gap-3 w-fit"
          >
            <span className="px-8 py-3 bg-transparent text-black font-heading font-bold text-sm uppercase tracking-wider border-2 border-black hover:bg-black hover:text-white transition-colors duration-300">
              Explore Our Work
            </span>
            <span className="w-10 h-10 bg-transparent text-black border-2 border-black flex items-center justify-center group-hover:rotate-45 group-hover:bg-black group-hover:text-white transition-all duration-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </span>
          </a>
        </div>

        {/* RIGHT FORM - Seamless blend without background overlay */}
        <div className="flex flex-col justify-center">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center text-center py-16 space-y-6 border border-black bg-transparent rounded-xl">
              <div className="w-16 h-16 rounded-full bg-black/10 border border-black/20 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-heading font-bold text-black uppercase">Message Sent!</h3>
              <p className="text-black/85 text-sm font-mono max-w-sm">
                Thank you for reaching out. We&apos;ll get back to you within 24 hours.
              </p>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setStatus('idle');
                }}
                onMouseEnter={() => soundManager.playHover()}
                className="text-xs font-mono text-black hover:text-white underline transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormInput label="Name" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                <FormInput label="Brand / Company" name="brandName" value={formData.brandName} onChange={(e) => setFormData({ ...formData, brandName: e.target.value })} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormInput label="Email" name="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                <FormInput label="Phone" name="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>

              <FormInput label="Your Message" name="message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />

              <button
                type="submit"
                disabled={status === 'sending'}
                onMouseEnter={() => soundManager.playHover()}
                className="w-full bg-transparent text-black font-heading uppercase font-bold py-4 px-6 border-2 border-black hover:bg-black hover:text-white transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 active:translate-x-[2px] active:translate-y-[2px]"
              >
                <span>{status === 'sending' ? 'Sending...' : 'Send Message'}</span>
                <Send className="h-4 w-4" />
              </button>

              {status === 'error' && (
                <p className="text-red-400 text-xs font-mono">Something went wrong. Please try again.</p>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Scroll indicator for StackCards reveal */}
      <div className="flex flex-col items-center justify-center mt-16 font-mono text-[10px] text-black/55 tracking-[0.15em] gap-1 select-none pointer-events-none uppercase">
        <span>Keep scrolling to reveal footer</span>
        <span className="text-xs animate-bounce mt-1">↓</span>
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
        placeholder={label}
        autoComplete="off"
        onFocus={() => soundManager.playClick()}
        onMouseEnter={() => soundManager.playHover()}
        className="
          peer
          w-full
          bg-transparent
          border-b border-black/20
          py-3
          text-sm
          outline-none
          text-black
          placeholder:text-black/50
          focus:border-black
          transition-colors duration-300
          font-mono
        "
      />
    </div>
  );
}
