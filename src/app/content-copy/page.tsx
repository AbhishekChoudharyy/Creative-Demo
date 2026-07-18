'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Copy, Printer, Edit3, Search, ArrowLeft, FileText, RotateCcw, Save, RefreshCw, Database } from 'lucide-react';

const initialDocumentData = [
  {
    id: 'loader',
    title: 'Loading Screen / Loader Overlay',
    items: [
      { label: 'Heading', text: 'CREATIVE' },
      { label: 'Sub Heading', text: 'CREATIVE AGENCY' },
      { label: 'Loading Indicator Text', text: 'LOADING • [Progress]%' },
      { label: 'Primary Button', text: 'ENTER' }
    ]
  },
  {
    id: 'nav-hud',
    title: 'Navigation & HUD',
    items: [
      { label: 'Logo Text', text: 'CREATIVE' },
      { label: 'Sub Heading / Tagline', text: 'CREATIVE AGENCY' },
      {
        label: 'Navigation Category 1',
        text: 'Experience Design\nSub Links: Interactive Spaces | Spatial Design | Sensory Engineering'
      },
      {
        label: 'Navigation Category 2',
        text: 'Anamorphic 3D\nSub Links: Digital Billboards | Visual Illusions | CGI Production'
      },
      {
        label: 'Navigation Category 3',
        text: 'Experiential Marketing\nSub Links: Brand Activations | Immersive Events | Projection Spectacles'
      },
      { label: 'Sound Control Button', text: '[ SOUND OFF / ON ]' },
      { label: 'Section Counter', text: '[ 001 ]' },
      { label: 'Contact Button', text: 'CONTACT' },
      { label: 'HUD Scroll Prompt', text: 'SCROLL FOR MORE' },
      { label: 'HUD Indicator', text: '[ AR ]' }
    ]
  },
  {
    id: 'hero',
    title: 'Hero Section',
    items: [
      { label: 'Heading', text: 'INNOVATE WITH PURPOSE' },
      { label: 'Hero Graphic / Image', text: 'Current Image: (Interactive 3D Ball of Glass / Volumetric graphic background)' }
    ]
  },
  {
    id: 'marquee',
    title: 'Marquee Banner Section',
    items: [
      { label: 'Marquee Text', text: 'CREATIVE.AGENCY ✦ THE FUTURE OF DESIGN ✦ EXPERIENCE STUDIO ✦' },
      { label: 'Marquee Logo Image', text: 'Current Image: (2D Logo image mark - /2d logo.jpeg)' }
    ]
  },
  {
    id: 'about',
    title: 'About Section',
    items: [
      { label: 'Heading', text: "We don't just build Digital Experiences. We engineer Cults." },
      {
        label: 'Paragraph',
        text: 'At Creative Agency, we bridge the gap between imagination and technology. We craft high-impact volumetric 3D billboards, spatial designs, and interactive experiences that build enduring brands.'
      }
    ]
  },
  {
    id: 'services',
    title: 'Services Section (Our Expertise)',
    items: [
      { label: 'Heading', text: 'Our Expertise' },
      { label: 'Sub Heading', text: 'Comprehensive design solutions for forward-thinking brands.' },
      {
        label: 'Service 1 (01)',
        text: 'Category: Strategy & Events\nTitle: Experiential Marketing\nDescription: We design high-impact brand activations, immersive corporate exhibitions, and large-scale MICE experiences. Integrating spatial storytelling and structural technology, we build unforgettable environments that connect brands directly to their audiences.\nImage: Current Image: (Experiential marketing & exhibition showcase photo)'
      },
      {
        label: 'Service 2 (02)',
        text: 'Category: Out of Home\nTitle: Anamorphic 3D Displays\nDescription: Engineering state-of-the-art 3D digital billboards and volumetric optical illusions that capture massive public attention. We produce hyper-realistic, forced-perspective CGI content optimized for urban digital screens.\nImage: Current Image: (3D digital billboard forced-perspective preview graphic)'
      },
      {
        label: 'Service 3 (03)',
        text: 'Category: Interaction\nTitle: Experience Design\nDescription: Developing interactive digital-physical worlds and responsive installations. Blending gesture tracking, spatial audio, and sensory triggers, we construct environments that morph dynamically in response to human presence.\nImage: Current Image: (Interactive installation & sensory design artwork)'
      },
      {
        label: 'Service 4 (04)',
        text: 'Category: CGI & Motion\nTitle: Multimedia Production\nDescription: High-fidelity projection mapping spectacles and bespoke visual content production. From conceptual rendering to real-time animation, we shape the sensory layers that transform any physical architecture into a living canvas.\nImage: Current Image: (Projection mapping and CGI motion graphics preview)'
      }
    ]
  },
  {
    id: 'manifesto',
    title: 'Manifesto Section',
    items: [
      { label: 'Section Tag', text: '( THE MANIFESTO )' },
      { label: 'Statement 1', text: 'Space is the canvas.' },
      { label: 'Statement 2', text: 'Beyond the rectangle.' },
      { label: 'Statement 3', text: 'Storytelling in three dimensions.' },
      { label: 'Statement 4', text: 'Sensory cognition.' },
      { label: 'Statement 5', text: 'Zero limits, zero boundaries.' }
    ]
  },
  {
    id: 'works',
    title: 'Portfolio / Selected Works Section',
    items: [
      { label: 'Heading', text: 'SELECTED WORKS' },
      {
        label: 'Project 1',
        text: 'Title: Arcadia\nCategory: Experiential Exhibition\nYear: 2025\nImage: Current Image: (Arcadia project exhibition space photo)'
      },
      {
        label: 'Project 2',
        text: 'Title: Hyperluminal\nCategory: Anamorphic 3D Billboard\nYear: 2025\nImage: Current Image: (Hyperluminal 3D billboard project graphic)'
      },
      {
        label: 'Project 3',
        text: 'Title: Synapse\nCategory: Projection Mapping Spectacle\nYear: 2026\nImage: Current Image: (Synapse projection mapping spectacle photo)'
      },
      {
        label: 'Project 4',
        text: 'Title: Aether\nCategory: Physical-Digital Installation\nYear: 2026\nImage: Current Image: (Aether physical-digital installation sculpture image)'
      },
      {
        label: 'Project 5',
        text: 'Title: Lumina\nCategory: Interactive Sensory Environment\nYear: 2025\nImage: Current Image: (Lumina sensory lighting environment photo)'
      },
      {
        label: 'Project 6',
        text: 'Title: Nexus\nCategory: Experiential Retail Activation\nYear: 2026\nImage: Current Image: (Nexus retail activation venue illuminated photo)'
      }
    ]
  },
  {
    id: 'process',
    title: 'Process Section',
    items: [
      { label: 'Heading', text: 'THE PROCESS' },
      { label: 'Sub Heading', text: 'Our methodology is a blend of rigorous strategy and unbridled creativity.' },
      {
        label: 'Step (01)',
        text: "Title: Discovery\nDescription: We don't start with solutions. We start with questions. We deconstruct your brand to its atomic level, understanding the chaos before we implement the order."
      },
      {
        label: 'Step (02)',
        text: 'Title: Strategy\nDescription: Chaos needs a container. We build the strategic framework that will hold the vision. Positioning, voice, and visual direction are defined here.'
      },
      {
        label: 'Step (03)',
        text: 'Title: Execution\nDescription: Where the rubber meets the road. We deploy high-fidelity design, motion, and code. No templates. No shortcuts. Just pure craftsmanship.'
      },
      {
        label: 'Step (04)',
        text: 'Title: Launch\nDescription: The reveal. We manage the deployment, ensure performance across the globe, and hand over the keys to your new digital empire.'
      }
    ]
  },
  {
    id: 'team',
    title: 'Team Section',
    items: [
      { label: 'Section Badge', text: 'The Minds' },
      { label: 'Heading', text: 'Collective Consciousness' },
      {
        label: 'Member 1',
        text: 'Name: Abhay Mallick\nRole: Founder / Developer\nImage: Current Image: (Abhay Mallick portrait image)'
      },
      {
        label: 'Member 2',
        text: 'Name: Sarah J.\nRole: Design Lead\nImage: Current Image: (Sarah J. portrait image)'
      },
      {
        label: 'Member 3',
        text: 'Name: Davide R.\nRole: Tech Director\nImage: Current Image: (Davide R. portrait image)'
      }
    ]
  },
  {
    id: 'labs',
    title: 'Labs / Feature Reveal Section',
    items: [
      { label: 'Section Label', text: 'CREATIVE AGENCY // LABS' },
      { label: 'Status Badge', text: 'VARIATION_01' },
      { label: 'HUD Prompt', text: 'CLICK ANYWHERE TO REVEAL' },
      {
        label: 'Slide 1',
        text: 'Title: EXPERIENCE\nDescription: Sensory activations designed to connect human emotion to spatial architecture. We build interactive physical-digital installations that blend architecture, sound, and visual design.'
      },
      {
        label: 'Slide 2',
        text: 'Title: ILLUSION\nDescription: Volumetric 3D anamorphic billboards that redefine urban spaces and public advertising. We engineer forced-perspective visual content that creates three-dimensional depth on standard flat screens.'
      },
      {
        label: 'Slide 3',
        text: 'Title: MAPPING\nDescription: High-fidelity projection mapping and interactive digital art designed to transform any physical environment. We map complex architectural surfaces to turn structures into storytelling mediums.'
      },
      {
        label: 'Background Layer Images',
        text: 'Current Image: (6 layered slideshow reveal images - /layers/1.jpg to /layers/6.jpg)'
      }
    ]
  },
  {
    id: 'cta',
    title: 'Call To Action (Eyes CTA)',
    items: [
      { label: 'Heading', text: 'READY TO BUILD THE FUTURE?' },
      { label: 'Primary Button', text: 'Explore Creative Agency' }
    ]
  },
  {
    id: 'contact',
    title: 'Contact Section',
    items: [
      { label: 'Section Label', text: 'CONTACT US' },
      { label: 'Heading', text: "Let's Render The Next Dimension." },
      {
        label: 'Paragraph',
        text: "Partner with Creative Agency to design high-fidelity interactive 3D, spatial mapping, and volumetric installations. Let's make something legendary."
      },
      { label: 'Primary Button', text: 'Explore Our Work' },
      {
        label: 'Contact Form Fields',
        text: 'Field 1: Name\nField 2: Brand / Company\nField 3: Email\nField 4: Phone\nField 5: Your Message\nSubmit Button: Send Message'
      },
      {
        label: 'Form Success State Message',
        text: "Heading: Message Sent!\nParagraph: Thank you for reaching out. We'll get back to you within 24 hours.\nButton Link: Send another message"
      }
    ]
  },
  {
    id: 'footer',
    title: 'Footer Section',
    items: [
      { label: 'Logo Text', text: 'CREATIVE' },
      {
        label: 'Description',
        text: 'Creative Agency. Next-generation experiential marketing, anamorphic 3D, and interactive experience design.'
      },
      { label: 'Social Links', text: '- GitHub (https://github.com)\n- Twitter (https://twitter.com)' },
      { label: 'Quick Links', text: '- Home\n- Services\n- Selected Works' },
      {
        label: 'Core Divisions',
        text: '- Experiential Marketing\n- Anamorphic 3D Billboards\n- Interactive Installations\n- Projection Mapping'
      },
      {
        label: 'Newsletter Section',
        text: 'Heading: Stay Updated\nDescription: Get the latest creative showcase updates.\nInput Placeholder: Email address\nSubmit Button: Submit Arrow Button'
      },
      { label: 'Copyright Text', text: '© 2026 Creative Agency. All Rights Reserved.' },
      { label: 'Back to Top Action Link', text: 'Back To Top ↑' },
      { label: 'Legal Links', text: '- Privacy Policy\n- Terms & Conditions' }
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
  const [envWarning, setEnvWarning] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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
        if (showNotification) triggerToast('✓ Synced latest content from Cloud Database!');
      } else {
        if (json.warning) {
          setEnvWarning(json.warning);
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
        triggerToast('🍃 Saved to MongoDB Atlas Cloud! Available on all devices.');
      } else {
        triggerToast(`⚠️ ${json.error || 'Please add MONGODB_URI to Netlify Environment Variables'}`);
      }
    } catch (e: any) {
      console.error('Failed to save to MongoDB Atlas:', e);
      triggerToast('⚠️ Error saving to database');
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
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans px-4 py-8 md:px-8 lg:px-12 selection:bg-[#fe5416] selection:text-black">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#fe5416] text-black font-bold px-6 py-3 rounded-xl shadow-2xl animate-bounce max-w-sm">
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
                  <span className="text-[10px] font-mono uppercase bg-[#fe5416] text-black font-bold px-3 py-1 rounded-full">
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
                <Printer className="w-4 h-4 text-[#fe5416]" />
                Print / Save PDF
              </button>

              <button
                onClick={() => {
                  setIsEditable(!isEditable);
                  triggerToast(isEditable ? 'Live Editing Disabled' : 'Live Editing Enabled! Edit text & click Save Changes to sync to MongoDB Atlas.');
                }}
                className={`px-4 py-2.5 border rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  isEditable
                    ? 'bg-[#fe5416] text-black border-[#fe5416] font-bold'
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
              className="w-full bg-[#121215] border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#fe5416] transition-colors"
            />
          </div>
        </div>

        {/* Document Content */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-[#fe5416] pb-3">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-[#fe5416]" />
              <h2 className="text-xl font-black uppercase tracking-wider text-white"># HOME PAGE</h2>
            </div>
            <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-md">
              Cloud Source: {dataSource === 'mongodb' ? '🍃 MongoDB Atlas Live Database' : 'Server Storage'}
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-16 text-zinc-400 font-mono text-sm flex items-center justify-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-[#fe5416]" />
              Connecting to MongoDB Atlas Cloud Database...
            </div>
          ) : (
            filteredSections.map((section) => (
              <div
                key={section.id}
                className="bg-[#18181b]/70 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 hover:border-white/20 transition-all shadow-lg"
              >
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <h3 className="text-lg md:text-xl font-bold text-[#fe5416]">{section.title}</h3>
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
                            ? 'bg-[#121215] border-[#fe5416]/50 text-white outline-none focus:ring-1 focus:ring-[#fe5416] cursor-text'
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
