'use client';

import Link from "next/link";
import { soundManager } from "@/lib/sound";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#1E65E5] via-[#1853BE] to-[#113875] text-[#F7F7F5] relative select-none">
      <div className="px-6 sm:px-10 lg:px-16 pt-12 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
          {/* BRAND */}
          <div>
            <a href="/" className="flex items-center">
              <span className="font-heading font-black text-xl tracking-widest uppercase text-white">FLOWORX</span>
            </a>

            <p className="text-xs mt-3 font-mono text-[#C0C6CF] leading-relaxed">
              Floworx Collective. Next-generation experiential marketing, anamorphic 3D, and interactive experience design.
            </p>

            <hr className="my-4 border-white/15 max-w-xs" />

            <div className="mt-4">
              <p className="font-mono font-medium text-[10px] text-[#C0C6CF]/60 uppercase tracking-widest">
                Follow Us
              </p>

              <div className="mt-3 flex flex-wrap gap-3">
                <SocialIcon href="https://github.com" label="GitHub">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </SocialIcon>
                <SocialIcon href="https://twitter.com" label="Twitter">
                  <svg width="14" height="12" viewBox="0 0 18 16" fill="white">
                    <path d="M13.861 0H16.5598L10.6638 6.52328L17.6 15.4H12.169L7.91523 10.0163L3.04796 15.4H0.347546L6.65395 8.42262L0 0H5.56889L9.41392 4.92089L13.861 0ZM12.9138 13.8363H14.4093L4.75632 1.48156H3.15157L12.9138 13.8363Z" />
                  </svg>
                </SocialIcon>
              </div>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 className="font-mono font-medium text-[10px] text-[#C0C6CF]/60 mb-3 uppercase tracking-widest">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm font-mono">
              <li>
                <Link href="/" className="text-[#C0C6CF] hover:text-[#00A6B2] transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <a href="#work" className="text-[#C0C6CF] hover:text-[#00A6B2] transition-colors duration-200">
                  Services
                </a>
              </li>
              <li>
                <a href="#work" className="text-[#C0C6CF] hover:text-[#00A6B2] transition-colors duration-200">
                  Selected Works
                </a>
              </li>
            </ul>
          </div>
 
          {/* TECHNOLOGY */}
          <div>
            <h4 className="font-mono font-medium text-[10px] text-[#C0C6CF]/60 mb-3 uppercase tracking-widest">
              Core Divisions
            </h4>
            <ul className="space-y-2.5 text-sm font-mono text-[#C0C6CF]">
              <li className="hover:text-[#00A6B2] transition-colors">Experiential Marketing</li>
              <li className="hover:text-[#00A6B2] transition-colors">Anamorphic 3D Billboards</li>
              <li className="hover:text-[#00A6B2] transition-colors">Interactive Installations</li>
              <li className="hover:text-[#00A6B2] transition-colors">Projection Mapping</li>
            </ul>
          </div>
 
          {/* NEWSLETTER */}
          <div>
            <h4 className="font-mono font-medium text-[10px] text-[#C0C6CF]/60 mb-3 uppercase tracking-widest">
              Stay Updated
            </h4>
            <p className="text-sm font-mono text-[#C0C6CF] mb-4">
              Get the latest creative showcase updates.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Subscribed!');
              }}
              className="relative w-full max-w-sm"
            >
              <input
                type="email"
                required
                placeholder="Email address"
                className="w-full bg-transparent border border-white/15 font-mono px-4 py-2.5 pr-12 text-sm text-white placeholder:text-[#C0C6CF]/40 focus:outline-none focus:border-[#00A6B2] transition-colors duration-300"
              />
              <button
                type="submit"
                className="absolute right-1 inset-y-1 flex items-center justify-center aspect-square bg-[#00A6B2] hover:bg-white text-black transition-colors duration-250 cursor-pointer"
                aria-label="Submit email"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        <hr className="my-8 border-white/15 max-w-6xl mx-auto" />

        {/* BOTTOM BAR */}
        <div className="pb-4 flex font-mono flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between text-xs text-[#C0C6CF]/60 max-w-6xl mx-auto">
          <p>© {new Date().getFullYear()} Floworx Collective. All Rights Reserved.</p>
          <p
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="cursor-pointer hover:text-[#00A6B2] transition-colors duration-200 uppercase tracking-widest"
          >
            Back To Top ↑
          </p>
          <p className="space-x-2">
            <span className="hover:text-[#00A6B2] transition-colors cursor-pointer">Privacy Policy</span>
            <span>|</span>
            <span className="hover:text-[#00A6B2] transition-colors cursor-pointer">Terms & Conditions</span>
          </p>
        </div>
      </div>

      {/* Giant background text overlay */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none opacity-[0.03] -z-10">
        <h1 className="text-[22vw] leading-[0.7] font-black text-center font-heading select-none text-white">FLOWORX COLLECTIVE</h1>
      </div>
    </footer>
  );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="border border-black/15 rounded-full p-1 hover:border-black transition-colors duration-200"
    >
      <div className="w-8 h-8 bg-black/5 hover:bg-black/10 flex items-center justify-center rounded-full transition-colors duration-200">
        {children}
      </div>
    </a>
  );
}
