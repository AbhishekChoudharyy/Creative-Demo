# ORIGO ATELIER — OFFICIAL BRAND GUIDELINES & DESIGN SYSTEM
> **Version:** 2.0 | **Tagline:** *"From Origin to Excellence"* | **Domain:** Experiential Design & Creative Technology

---

## 1. BRAND ESSENCE & PHILOSOPHY

- **Brand Name:** Origo Atelier (stylized as `Origo ATELIER`)
- **Brand Slogan / Tagline:** *"From Origin to Excellence"*
- **Core Philosophy:** *"Every experience begins with an idea. We find the origin and engineer excellence."*
- **Aesthetic Direction:** Neo-Brutalist Minimalist meets High-End Editorial Luxury (Tactile, Architectural, Kinetic, Sonic).
- **Key Brand Pillars:**
  1. **Spatial & Experiential Innovation:** Transforming physical and digital spaces into visceral memories.
  2. **Raw Precision:** Bold typography, crisp contrast borders, and technical data HUDs.
  3. **Atmospheric Liquidity:** Seamless transitions between electric daylight blue and pure luminous white.

---

## 2. COLOR SYSTEM (COLOR PALETTE & TOKENS)

The palette balances high-voltage energy with architectural restraint.

### 2.1 Primary Brand Colors

| Swatch Name | Hex | RGB | HSL / OKLCH | Primary Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Electric Dodger Blue** | `#1E90FF` | `rgb(30, 144, 255)` | `hsl(210, 100%, 56%)` | Core Brand Identity, Hero background, Active highlights, Primary accent |
| **Midnight Navy Ink** | `#0A1F44` | `rgb(10, 31, 68)` | `hsl(218, 74%, 15%)` | Primary Typography, Heavy borders, Strong CTA outlines, Deep contrast |
| **Pure Canvas White** | `#FFFFFF` | `rgb(255, 255, 255)` | `hsl(0, 0%, 100%)` | Clean canvas, Content cards, Editorial poster backgrounds, Reversal text |
| **Stage Void Black** | `#050505` | `rgb(5, 5, 5)` | `hsl(0, 0%, 2%)` | Dark mode base, 3D viewport canvas, Deep shadows |

---

### 2.2 Atmospheric Sky & Gradient Tints (Blends & Fades)

Used to create seamless dissolves between sections without harsh seams:

| Tone | Hex Code | RGB | Usage |
| :--- | :--- | :--- | :--- |
| **Ice Vapor** | `#F4F8FD` | `rgb(244, 248, 253)` | Subtle blue-tinted white for soft canvas |
| **Sky Tint 100** | `#EAF2FC` | `rgb(234, 242, 252)` | Gradient start descending from white |
| **Sky Tint 200** | `#CFE5FD` | `rgb(207, 229, 253)` | Mid-tone sky diffusion |
| **Sky Tint 300** | `#64B3FE` | `rgb(100, 179, 254)` | Transition into electric blue |
| **Deep Sky Glow** | `#2D97FF` | `rgb(45, 151, 255)` | Rich atmospheric lighting rim |

#### Signature Gradient: "The Sky Flow" (Footer & Gap Sections)
```css
background: linear-gradient(
  180deg, 
  #FFFFFF 0%, 
  #FFFFFF 24%, 
  #F0F6FD 40%, 
  #C4E1FD 56%, 
  #70B4F9 70%, 
  #1E90FF 82%, 
  #1E90FF 100%
);
```

#### Atmospheric Hero Fade (Electric Blue to White)
```css
background: linear-gradient(
  to bottom,
  rgba(244, 248, 253, 0) 0%,
  rgba(244, 248, 253, 0.40) 52%,
  rgba(244, 248, 253, 0.85) 82%,
  #F4F8FD 100%
);
```

---

### 2.3 Neutral & Dark Accents

| Token | Hex | Usage |
| :--- | :--- | :--- |
| **Stone Dark** | `#1C1917` | Category badges, dark navigation cards |
| **Zinc Dark** | `#27272A` | Sub-tier cards, subtle UI containers |
| **Neutral Border** | `rgba(255, 255, 255, 0.25)` | 1px horizontal rule dividers on blue |
| **Ink Border** | `rgba(10, 31, 68, 0.20)` | 1px subtle dividers on light cards |

---

## 3. TYPOGRAPHY SYSTEM

Origo Atelier uses a deliberate 3-tier font hierarchy: **Editorial High-Contrast Serif** + **Geometric Neobrutalist Sans** + **Technical Data Grotesque/Mono**.

### 3.1 Primary Font Families

| Tier | Primary Typeface | Fallback Fonts | Weight Range | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Editorial Display Serif** | **OT Brut** | `Bodoni Moda`, `Playfair Display`, `Didot` | Bold (700), Black (900) | Monumental words, Intro poster pairs, Numbers (`001`, `002`), Section titles (`WHAT WE DO`) |
| **Neobrutalist Sans** | **ERF Neot** | `Syne`, `Clash Display`, `sans-serif` | Black (900), Bold (700) | Brand Wordmark ("Origo"), Form headers, Action buttons, Sub-headlines |
| **Technical Data & Body** | **FF Identification Std** | `Manrope`, `Geist Mono`, `monospace` | Regular (400), Medium (500) | Paragraph body text, Nav links, HUD counters (`[ 000 ]`), Metadata, Disclaimers |

---

### 3.2 Font Styling & Pairing Rules

1. **Brand Wordmark Rule:**
   - `"Origo"` is set in **ERF Neot** (Title Case, Bold, `tracking-[0.02em]`).
   - `"ATELIER"` is set in **Sans / FF Identification Std** (All Caps, Light/Regular, `tracking-[0.26em]`).
2. **Kinetic Poster Words (Intro Section):**
   - Stretched vertically by ~6% to 8% (`scale-y-[1.06]`).
   - Letter tracking: tight (`tracking-[-0.03em]`).
   - Set in **OT Brut** (Uppercase).
3. **HUD & Technical Data:**
   - Always bracketed or padded with zeroes: `[ 001 ]`, `[ SOUND ON ]`, `[ LOADING • 84% ]`.
   - Font: **FF Identification Std Five C Regular** / Monospace.
   - All uppercase, tracking wide (`tracking-[0.2em]` to `tracking-[0.3em]`).

---

### 3.3 Type Scale Guidelines

| Role | Font Size (Desktop) | Font Size (Mobile) | Line Height | Tracking |
| :--- | :--- | :--- | :--- | :--- |
| **Display Monumental** | `11vw` to `15vw` | `13vw` to `18vw` | `0.85` | `-0.04em` |
| **Section Title (H2)** | `clamp(40px, 7vw, 110px)` | `clamp(32px, 10vw, 56px)` | `0.92 - 0.96` | `-0.03em` |
| **Subheading (H3)** | `28px - 36px` | `22px - 26px` | `1.15` | `-0.02em` |
| **Card / Accordion Title** | `24px - 30px` | `18px - 22px` | `1.2` | `-0.01em` |
| **Body Paragraph** | `14px - 16px` | `13px - 15px` | `1.6` | `0.01em` |
| **HUD / Meta / Monospace** | `10px - 12px` | `9px - 11px` | `1.4` | `0.15em - 0.3em` |

---

## 4. UI DESIGN & COMPONENT SYSTEM

### 4.1 Borders & Dividers
- **Standard Border Width:** `1px` for structural dividers, `2px` for interactive buttons and inputs.
- **Divider on Electric Blue:** `border-b border-white/25` or `border-b border-[#0A1F44]`.
- **Divider on White:** `border-b border-[#0A1F44]/20`.

### 4.2 Radii & Corner Geometry
- **Default Structure:** Sharp brutalist edges (`rounded-none` / `0px`) for major grid blocks and section borders.
- **Pills & Micro-Actions:** Full pill capsules (`rounded-full`) for social icons, scroll back-to-top, and sound toggle badges.
- **Section Enclosures:** Large architectural top curve (`rounded-t-[36px]` sm:`rounded-t-[56px]`) for the Contact & Footer transition.

### 4.3 Buttons & Interactive Controls

#### A. The Neobrutalist Action Button (Inverting Frame)
- **Base State:**
  - Background: `transparent`
  - Border: `2px solid #0A1F44`
  - Text: `#0A1F44`, uppercase, font-bold, `font-heading` (`ERF Neot`)
  - Padding: `px-7 py-3`
- **Hover State:**
  - Background: `#0A1F44`
  - Text: `#FFFFFF`
  - Accompanying arrow icon box rotates `45deg` with matching color invert.
- **Active Click State:**
  - Micro-shift: `translate-x-[2px] translate-y-[2px]` (tactile feedback).

#### B. The Minimal HUD Pill
- Circular `w-8 h-8 rounded-full bg-white text-[#0A1F44] shadow-md border border-black/10`.
- Hover: `scale-110` with subtle border glow.

#### C. Floating Sticky Navigation HUD
- Fixed at top with dynamic scroll interpolation.
- Background: Frosted translucent or gradient strap (`shadow-[0_1px_8px_rgba(0,0,0,0.04)]`).
- Contents: `Origo ATELIER` brand mark, `[ SOUND ON/OFF ]`, Scroll counter `[ 000 ]`, and `CONTACT` button.

---

## 5. ATMOSPHERICS, TEXTURES & SOUND

1. **Tactile Canvas Grain (Noise):**
   - Ultra-fine noise texture overlay generated dynamically on client canvas at 10% opacity (`noise-overlay`). Eliminates artificial digital gradients and gives analog print quality.
2. **Audio Identity (Sonic Branding):**
   - **Boot Sound:** Deep sub-bass hum on entering site.
   - **Ambient Soundtrack:** Subtle ethereal generative background audio.
   - **Tactile Click:** Crisp high-frequency glass/click sound on selection.
   - **Hover Chime:** Micro tactile tick on interactive elements.
3. **Cursor System:**
   - Custom dynamic cursor (`CustomCursor`) with smooth velocity-reactive drag trail and spring physics.
   - Cursor auto-hides over 3D interactive hero models to prioritize direct object manipulation.

---

## 6. BRAND APPLICATION RULES (DO's & DON'Ts)

### DO:
- Keep high contrast between `#0A1F44` (Navy Ink) and `#1E90FF` / `#FFFFFF`.
- Use all-caps for technical metadata, HUD tags, and editorial headlines.
- Maintain wide letter-spacing (`tracking-widest`) for monospace tags and narrow letter-spacing (`tracking-tight`) for display titles.
- Pair sharp architectural geometric layouts with smooth fluid 3D objects.
- Preserve the brand mark ratio: Bold `"Origo"` accompanied by lightweight, spaced `"ATELIER"`.

### DON'T:
- Do not use generic corporate blues (`#0000FF`, `#0070F3`, `#3B82F6`). Always use the calibrated Electric Dodger Blue (`#1E90FF`).
- Do not use heavy drop shadows or rainbow gradients. Use clean 1px hairline borders or soft ambient gradient fades.
- Do not set paragraphs or body copy in OT Brut or heavy display serifs. Body text must remain clean in FF Identification / Manrope.
- Do not use soft pastel colors that dilute the punchy Neo-Brutalist energy.
