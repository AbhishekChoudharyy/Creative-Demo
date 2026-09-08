'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Copy, Printer, Edit3, Search, ArrowLeft, FileText, RotateCcw, Save, RefreshCw, Database } from 'lucide-react';

const initialDocumentData = [
  {
    id: 'loader',
    title: 'Loading Screen / Loader Overlay',
    items: [
      { label: 'Heading', text: 'ORIGO' },
      { label: 'Sub Heading', text: 'ORIGO ATELIER' },
      { label: 'Loading Indicator Text', text: 'LOADING • [Progress]%' },
      { label: 'Primary Button', text: 'ENTER' }
    ]
  },
  {
    id: 'nav-hud',
    title: 'Navigation & HUD',
    items: [
      { label: 'Logo Text', text: 'ORIGO' },
      { label: 'Sub Heading / Tagline', text: 'ORIGO ATELIER' },
      {
        label: 'Navigation Category 1',
        text: 'Experiential Solutions\nSub Links: Immersive Spaces | Interactive Environments'
      },
      {
        label: 'Navigation Category 2',
        text: 'Brand Activation\nSub Links: Exhibitions | Product Launches'
      },
      {
        label: 'Navigation Category 3',
        text: 'MICE & Retail\nSub Links: Conferences | Retail Marketing'
      },
      { label: 'Sound Control Button', text: '[ SOUND OFF / ON ]' },
      { label: 'Section Counter', text: '[ 001 ]' },
      { label: 'Contact Button', text: 'CONTACT' },
      { label: 'HUD Tagline', text: 'FROM ORIGIN TO EXCELLENCE' },
      { label: 'HUD CTA', text: 'EXPLORE OUR WORK ↓' },
      { label: 'HUD Indicator', text: '[ 3D ]' }
    ]
  },
  {
    id: 'hero',
    title: 'Hero Section',
    items: [
      { label: 'Hero Display Text', text: 'FROM ORIGIN TO EXPERIENCE.' },
      { label: 'Supporting Text', text: 'We transform ideas into immersive brand experiences.' },
      { label: 'Primary CTA', text: 'EXPLORE OUR WORK' },
      { label: 'Hero Graphic / 3D Model', text: 'Interactive Refractive Glass Ring (Origin of Form)' }
    ]
  },
  {
    id: 'marquee',
    title: 'Marquee Banner Section',
    items: [
      { label: 'Marquee Text', text: 'ORIGO ATELIER ✦ ○ △ □ ✦ FROM ORIGIN TO EXCELLENCE ✦ EXPERIENTIAL SOLUTIONS ✦ EVERY EXPERIENCE BEGINS WITH AN IDEA ✦' },
      { label: 'Marquee Logo Image', text: 'Current Image: (2D Logo image mark - /2d logo.jpeg)' }
    ]
  },
  {
    id: 'about',
    title: 'Brand Belief / What We Believe',
    items: [
      { label: 'Heading', text: "Every experience begins with an idea. From origin to excellence." },
      {
        label: 'Supporting Copy',
        text: '“Origo” means Origin — the starting point from which every idea, form and creation begins. Every great design begins with a simple origin and evolves into something extraordinary.\nWe believe in finding the origin of that idea and building from there. The objective is not simply to create something visually impressive, but to create experiences that connect, engage, inspire and endure.'
      }
    ]
  },
  {
    id: 'services',
    title: 'What We Do / Services Section',
    items: [
      { label: 'Heading', text: 'What We Do' },
      { label: 'Sub Heading', text: 'Experiential solutions that inspire, engage and endure.' },
      {
        label: '01 — Experiential Solutions',
        text: "Bringing brands to life through immersive experiences that people don't just see, but feel and remember."
      },
      {
        label: '02 — Brand Activation',
        text: 'Creating bold and memorable brand experiences that spark attention, engagement and connection.'
      },
      {
        label: '03 — MICE',
        text: 'Creating experiences for conferences, fashion shows, exhibitions and events that inspire, engage and connect.'
      },
      {
        label: '04 — Campaign & Content Designing',
        text: 'Turning powerful ideas into purposeful stories through design, content and campaigns that connect, engage and inspire action.'
      },
      {
        label: '05 — Retail Marketing',
        text: 'Creating retail experiences that attract attention, engage shoppers and turn interactions into action.'
      }
    ]
  },
  {
    id: 'manifesto',
    title: 'Manifesto Section',
    items: [
      { label: 'Section Tag', text: '( THE MANIFESTO )' },
      { label: 'Statement 1', text: 'Every experience begins with an idea.' },
      { label: 'Statement 2', text: 'From origin to excellence.' },
      { label: 'Statement 3', text: 'We find the origin and build from there.' },
      { label: 'Statement 4', text: 'Connect. Engage. Inspire. Endure.' },
      { label: 'Statement 5', text: 'Transforming ideas into extraordinary experiences.' }
    ]
  },
  {
    id: 'carousel',
    title: 'Brand Concept / 3D Geometry Section',
    items: [
      { label: 'Section Heading', text: 'ORIGO // ORIGIN OF DESIGN' },
      { label: '01 — Circle', text: 'Eternal. Whole. Continuous. Represents motion, wholeness, unity and the continuous flow of ideas.' },
      { label: '02 — Square', text: 'Stability. Structure. Foundation. Represents order, reliability, structure and the foundation that holds everything together.' },
      { label: '03 — Triangle', text: 'Direction. Balance. Transformation. Represents purpose, progress, balance, strength and the drive to evolve.' }
    ]
  },
  {
    id: 'approach',
    title: 'Our Approach (5 Steps)',
    items: [
      { label: 'Heading', text: 'OUR APPROACH' },
      { label: 'Sub Heading', text: 'Every experience begins with an idea. We believe in finding the origin of that idea and building from there.' },
      {
        label: '01 — CONTEXT',
        text: 'Understand before we create. We immerse ourselves in the brief, the people, the purpose and the possibilities.'
      },
      {
        label: '02 — CONCEPT',
        text: 'Turn thought into direction. We create meaningful concepts that bring clarity and direction.'
      },
      {
        label: '03 — CREATE',
        text: 'Transform concepts into experiences. We turn concepts into immersive and impactful experiences.'
      },
      {
        label: '04 — DETAIL',
        text: 'Refine every element. We refine every element with precision, purpose and attention to detail.'
      },
      {
        label: '05 — DELIVER EXPERIENCE',
        text: 'Bring the idea to life. From events and exhibitions to immersive environments, we create experiences that inspire, endure and create memories.'
      }
    ]
  },
  {
    id: 'works',
    title: 'Portfolio / Selected Works Section',
    items: [
      { label: 'Heading', text: 'SELECTED WORKS' },
      { label: 'Categories', text: 'EVENTS & ACTIVATIONS | EXHIBITIONS & BRAND EXPERIENCES | AUTOMOTIVE EXPERIENCES | SHOWROOM DESIGN | SOCIAL MEDIA & CONTENT | PRINT & OOH' },
      { label: 'Featured Work 1', text: 'Jeep Meridian — Launch 2024 (Automotive Experiences)' },
      { label: 'Featured Work 2', text: 'Neuron Energy — Bharat Mobility Expo 2025 (Exhibitions & Brand Experiences)' },
      { label: 'Featured Work 3', text: 'VH1 Supersonic — Nexa Lounge (Events & Activations)' },
      { label: 'Featured Work 4', text: 'Teknofeet — Showroom Design (Showroom Design)' },
      { label: 'Featured Work 5', text: 'Citroën Basalt — Mall Activation (Automotive Experiences)' },
      { label: 'Featured Work 6', text: 'Glen Appliances — 25 Years Celebration (Events & Activations)' }
    ]
  },
  {
    id: 'labs',
    title: 'Labs / Feature Reveal Section',
    items: [
      { label: 'Section Label', text: 'ORIGO ATELIER // IMMERSIVE LABS' },
      { label: 'Status Badge', text: 'VARIATION_01' },
      { label: 'HUD Prompt', text: 'CLICK ANYWHERE TO REVEAL' },
      {
        label: 'Slide 1',
        text: 'Title: EXPERIENCE\nDescription: We transform ideas into immersive brand experiences. From concept to execution, we craft environments that connect, engage, inspire and endure.'
      },
      {
        label: 'Slide 2',
        text: 'Title: EXCELLENCE\nDescription: “Origo” means Origin — the starting point from which every idea begins. From simple origins, we engineer extraordinary brand activations.'
      },
      {
        label: 'Slide 3',
        text: 'Title: PRECISION\nDescription: Every element refined with precision, purpose and attention to detail. Creating experiences that spark attention, engagement and lasting memories.'
      }
    ]
  },
  {
    id: 'contact',
    title: 'Contact Section',
    items: [
      { label: 'Section Label', text: 'CONTACT US' },
      { label: 'Heading', text: "Let's Create From The Origin." },
      {
        label: 'Paragraph',
        text: "Partner with Origo Atelier to transform ideas into immersive brand experiences, activations, and exhibitions. From origin to excellence."
      },
      { label: 'Primary Button', text: 'Explore Our Work' }
    ]
  },
  {
    id: 'footer',
    title: 'Footer Section',
    items: [
      { label: 'Logo Text', text: 'ORIGO ATELIER' },
      {
        label: 'Description',
        text: 'Origo Atelier. From Origin to Excellence. We transform ideas into immersive brand experiences that inspire, engage and endure.'
      },
      { label: 'Quick Links', text: '- Home\n- What We Do\n- Our Approach\n- Selected Works\n- Contact' },
      {
        label: 'Core Divisions',
        text: '- Experiential Solutions\n- Brand Activation\n- MICE & Conferences\n- Campaign & Content Designing\n- Retail Marketing'
      },
      { label: 'Copyright Text', text: '© 2026 Origo Atelier. All Rights Reserved.' },
      { label: 'Back to Top Action Link', text: 'Back To Top ↑' }
    ]
  }
];

export default function ContentCopyPage() {
  const [data, setData] = useState(initialDocumentData);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditable, setIsEditable] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dataSource, setDataSource] = useState<'mongodb' | 'file' | 'default'>('default');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Zero-cache live MongoDB Atlas fetch
  const loadServerData = useCallback(async (showNotification = false) => {
    setIsLoading(true);
    try {
      const timestamp = Date.now();
      const res = await fetch(`/api/content-copy?t=${timestamp}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0' }
      });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setDataSource(json.source || 'mongodb');
        if (showNotification) triggerToast('✓ Refreshed from MongoDB Atlas Cloud!');
      } else {
        if (json.warning) {
          triggerToast(json.warning);
        }
        setData(initialDocumentData);
      }
    } catch (e) {
      console.error('Failed to load MongoDB Atlas data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServerData();
  }, [loadServerData]);

  const saveToServer = async (currentData = data) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/content-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        body: JSON.stringify({ data: currentData }),
        cache: 'no-store'
      });
      const json = await res.json();

      if (json.success) {
        setDataSource('mongodb');
        triggerToast('🍃 Saved to MongoDB Atlas Cloud! Synced for all devices.');
      } else {
        triggerToast(json.error || 'Error saving to MongoDB Atlas');
      }
    } catch (e: any) {
      console.error('Failed to save to MongoDB Atlas:', e);
      triggerToast(e?.message || 'Error saving to cloud database');
    } finally {
      setIsSaving(false);
    }
  };

  const updateItemText = (sectionId: string, itemIdx: number, newText: string) => {
    setData((prevData) => {
      const updated = prevData.map((section) => {
        if (section.id === sectionId) {
          const newItems = [...section.items];
          newItems[itemIdx] = { ...newItems[itemIdx], text: newText };
          return { ...section, items: newItems };
        }
        return section;
      });
      saveToServer(updated);
      return updated;
    });
  };

  const handleResetData = async () => {
    if (confirm('Are you sure you want to reset all content to the original website copy in MongoDB Atlas?')) {
      try {
        await fetch('/api/content-copy', { method: 'DELETE', cache: 'no-store' });
      } catch (e) {
        console.error('Failed to reset MongoDB Atlas data:', e);
      }
      setData(initialDocumentData);
      setDataSource('default');
      triggerToast('Reset to original website copy in MongoDB Cloud!');
    }
  };

  const copyToClipboard = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    triggerToast(msg);
  };

  const handleCopySection = (sectionTitle: string, items: { label: string; text: string }[]) => {
    const formattedText = `${sectionTitle}\n\n` + items.map(item => `${item.label}:\n${item.text}`).join('\n\n');
    copyToClipboard(formattedText, `${sectionTitle} copied to clipboard!`);
  };

  const handleCopyFullDoc = () => {
    const fullText = data
      .map(sec => `${sec.title}\n` + sec.items.map(item => `${item.label}: ${item.text}`).join('\n'))
      .join('\n\n==================================================\n\n');
    copyToClipboard(fullText, 'Full document copied to clipboard!');
  };

  const filteredSections = data.filter(section => {
    const titleMatch = section.title.toLowerCase().includes(searchQuery.toLowerCase());
    const itemMatch = section.items.some(
      item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return titleMatch || itemMatch;
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans px-4 py-8 md:px-8 lg:px-12 selection:bg-[#00A6B2] selection:text-black">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#00A6B2] text-black font-bold px-6 py-3 rounded-xl shadow-2xl max-w-md animate-bounce">
          {toastMessage}
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Bar */}
        <div className="bg-[#18181b]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="text-white/60 hover:text-white transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-lg"
                  title="Back to Home"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                  CLIENT CONTENT COPY
                  <span className="text-[10px] font-mono uppercase bg-[#00A6B2] text-black font-bold px-3 py-1 rounded-full">
                    OFFICIAL
                  </span>
                </h1>
              </div>
              <div className="flex items-center gap-4 mt-2 ml-11">
                <p className="text-sm text-zinc-400">
                  Complete existing website content & image inventory document.
                </p>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                  <Database className="w-3.5 h-3.5" />
                  MongoDB Atlas Cloud Connected
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <button
                onClick={() => saveToServer()}
                disabled={isSaving}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Saving to Cloud...' : 'Save Changes'}
              </button>

              <button
                onClick={() => loadServerData(true)}
                title="Fetch latest MongoDB Atlas updates"
                className="px-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Sync MongoDB
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#00A6B2]" />
                Print / Save PDF
              </button>

              <button
                onClick={() => {
                  setIsEditable(!isEditable);
                  triggerToast(isEditable ? 'Live Editing Disabled' : 'Live Editing Enabled! Edit text & click Save Changes to sync to MongoDB Atlas.');
                }}
                className={`px-4 py-2.5 border rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  isEditable
                    ? 'bg-[#00A6B2] text-black border-[#00A6B2] font-bold'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                {isEditable ? 'Disable Editing' : 'Enable Live Editing'}
              </button>

              <button
                onClick={handleCopyFullDoc}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer border border-white/10"
              >
                <Copy className="w-4 h-4" />
                Copy All Text
              </button>

              <button
                onClick={handleResetData}
                title="Reset back to original copy in MongoDB Atlas"
                className="px-3 py-2.5 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-zinc-400 hover:text-red-400 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any text, heading, section or keyword..."
              className="w-full bg-[#121215] border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#00A6B2] transition-colors"
            />
          </div>
        </div>

        {/* Document Content */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-[#00A6B2] pb-3">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-[#00A6B2]" />
              <h2 className="text-xl font-black uppercase tracking-wider text-white"># HOME PAGE</h2>
            </div>
            <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-md">
              Cloud Source: {dataSource === 'mongodb' ? '🍃 MongoDB Atlas Live Database' : 'Server Memory'}
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-16 text-zinc-400 font-mono text-sm flex items-center justify-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-[#00A6B2]" />
              Connecting to MongoDB Atlas Cloud Database...
            </div>
          ) : (
            filteredSections.map((section) => (
              <div
                key={section.id}
                className="bg-[#18181b]/70 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 hover:border-white/20 transition-all shadow-lg"
              >
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <h3 className="text-lg md:text-xl font-bold text-[#00A6B2]">{section.title}</h3>
                  <button
                    onClick={() => handleCopySection(section.title, section.items)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Section
                  </button>
                </div>

                <div className="space-y-4">
                  {section.items.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                        {item.label}
                      </label>
                      <div
                        contentEditable={isEditable}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => {
                          const text = e.currentTarget.innerText;
                          updateItemText(section.id, idx, text);
                        }}
                        className={`p-4 rounded-xl text-sm leading-relaxed whitespace-pre-line border transition-all ${
                          isEditable
                            ? 'bg-[#121215] border-[#00A6B2]/50 text-white outline-none focus:ring-1 focus:ring-[#00A6B2] cursor-text'
                            : 'bg-[#121215]/80 border-zinc-800 text-zinc-200'
                        }`}
                      >
                        {item.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          {!isLoading && filteredSections.length === 0 && (
            <div className="text-center py-16 text-zinc-500 font-mono text-sm">
              No content matching &quot;{searchQuery}&quot; found.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
