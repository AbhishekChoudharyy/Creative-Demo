'use client';

class SoundManager {
  private ctx: AudioContext | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private isMuted: boolean = false;
  private isUnlocked: boolean = false;

  // Cached AudioBuffers for loaded MP3s
  private buffers: Map<string, AudioBuffer> = new Map();
  private soundsLoading: boolean = false;

  // 3D Drag synth references
  private dragOsc: OscillatorNode | null = null;
  private dragFilter: BiquadFilterNode | null = null;
  private dragGain: GainNode | null = null;
  private dragActive: boolean = false;

  // Text scroll animation rate limiting
  private lastTextAnimTime: number = 0;
  // Hover rate limiting — prevents firing multiple times per frame on nested elements
  private lastHoverTime: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      // Load initial mute state from local storage
      const savedMute = localStorage.getItem('og_engine_sfx_muted');
      this.isMuted = savedMute === 'true';

      // Setup interaction unlock handlers to start context & load assets on first click/tap
      const unlock = () => {
        this.unlockContext();
      };
      
      window.addEventListener('click', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
      window.addEventListener('touchstart', unlock, { once: true });
      window.addEventListener('pointerdown', unlock, { once: true });
    }
  }

  private initContext() {
    if (this.ctx) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      // Dynamics compressor at the end of the chain to keep sound clean and non-clipping
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.08, this.ctx.currentTime);
      
      this.compressor.connect(this.ctx.destination);

      // Trigger preloading the sound assets from public/sounds/
      this.loadSounds();
    } catch (e) {
      console.warn('Web Audio API not supported in this browser:', e);
    }
  }

  private async loadSounds() {
    if (!this.ctx || this.soundsLoading) return;
    this.soundsLoading = true;

    const soundAssets = {
      clickDown: '/sounds/clickDown.mp3',
      clickUp: '/sounds/clickUp.mp3',
      scroll: '/sounds/scroll.mp3'
    };

    for (const [key, path] of Object.entries(soundAssets)) {
      try {
        const response = await fetch(path);
        if (!response.ok) {
          throw new Error(`HTTP status ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        
        // decodeAudioData uses Promise in modern browsers
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        this.buffers.set(key, audioBuffer);
      } catch (err) {
        console.warn(`Failed to preload audio asset "${key}" from "${path}":`, err);
      }
    }
  }

  private unlockContext() {
    this.initContext();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        this.isUnlocked = true;
      });
    } else {
      this.isUnlocked = true;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('og_engine_sfx_muted', String(this.isMuted));
    }
    
    // If unmuted, play a quick confirmation click
    if (!this.isMuted) {
      this.unlockContext();
      setTimeout(() => this.playClick(), 50);
    }
    return this.isMuted;
  }

  public getMutedState(): boolean {
    return this.isMuted;
  }

  /**
   * Play a preloaded AudioBuffer asset with synth fallback
   */
  private playBuffer(name: string, defaultSynthFallback: () => void, volume: number = 1.0) {
    if (this.isMuted) return;
    this.initContext();
    const ctx = this.ctx;
    if (!ctx || !this.compressor) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const buffer = this.buffers.get(name);
    if (!buffer) {
      // Fallback if asset is still loading or failed to load
      defaultSynthFallback();
      return;
    }

    try {
      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);

      source.connect(gainNode);
      gainNode.connect(this.compressor);
      
      source.start(ctx.currentTime);
    } catch (e) {
      console.warn(`Error playing audio buffer "${name}":`, e);
      defaultSynthFallback();
    }
  }

  /**
   * General-purpose click/select (using clickUp.mp3)
   */
  public playClick() {
    // Boost volume slightly on mobile for audibility
    const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768);
    this.playBuffer('clickUp', () => this.playSynthClick(880, 110, 0.2, 0.06), isMobile ? 1.0 : 0.85);
  }

  /**
   * Action down/press trigger (mapped to clickUp per user request)
   */
  public playClickDown() {
    this.playClick();
  }

  /**
   * Action release/up trigger (using clickUp.mp3)
   */
  public playClickUp() {
    this.playBuffer('clickUp', () => this.playSynthClick(880, 110, 0.2, 0.06), 0.85);
  }

  /**
   * Fallback click synthesizer
   */
  private playSynthClick(startFreq: number, endFreq: number, gainVal: number, duration: number) {
    if (this.isMuted || !this.ctx || !this.compressor) return;
    const ctx = this.ctx;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.compressor);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration + 0.01);
    } catch (e) {}
  }

  /**
   * Play a subtle mechanical hover sound (fast tick pop)
   */
  public playHover() {
    if (this.isMuted) return;
    // Disable hover sound effects entirely on mobile screens (since hover doesn't exist and touch triggers it, lagging scroll)
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;
    // Rate-limit hover to max once every 60ms to avoid cascade firing on nested elements
    const now = Date.now();
    if (now - this.lastHoverTime < 60) return;
    this.lastHoverTime = now;

    this.initContext();
    const ctx = this.ctx;
    if (!ctx || !this.compressor) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.018);

      // Boost gain on mobile for audibility on phone speakers
      const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768);
      gain.gain.setValueAtTime(isMobile ? 0.09 : 0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.018);

      osc.connect(gain);
      gain.connect(this.compressor);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.022);
    } catch (e) {}
  }

  /**
   * Play text animation reveal (using scroll.mp3 with rate-limit debouncing)
   */
  public playTextAnim() {
    const now = Date.now();
    // Debounce rapid successive line/section animations to prevent overlay clutter
    if (now - this.lastTextAnimTime < 200) return;
    this.lastTextAnimTime = now;

    this.playBuffer('scroll', () => this.playWhooshUp(0.12), 0.35);
  }

  /**
   * Play a typewriter-like terminal tick when individual text characters animate in
   */
  public playTextTick() {
    if (this.isMuted) return;
    this.initContext();
    const ctx = this.ctx;
    if (!ctx || !this.compressor) return;

    // Louder on desktop, subtler on mobile — bumped for better mobile speaker output
    const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768);
    const tickGain = isMobile ? 0.042 : 0.055;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // High pitched microscopic snap
      osc.frequency.setValueAtTime(2400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.006);

      gain.gain.setValueAtTime(tickGain, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.006);

      osc.connect(gain);
      gain.connect(this.compressor);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.008);
    } catch (e) {}
  }

  /**
   * Play an upward frequency sweep (whoosh)
   */
  public playWhooshUp(volume: number = 0.12) {
    if (this.isMuted) return;
    this.initContext();
    const ctx = this.ctx;
    if (!ctx || !this.compressor) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(360, ctx.currentTime + 0.22);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.22);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.compressor);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.23);
    } catch (e) {}
  }

  /**
   * Play a downward frequency sweep (whoosh)
   */
  public playWhooshDown(volume: number = 0.12) {
    if (this.isMuted) return;
    this.initContext();
    const ctx = this.ctx;
    if (!ctx || !this.compressor) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(360, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.22);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.22);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.compressor);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.23);
    } catch (e) {}
  }

  /**
   * Play a futuristic digital chime (overlapping arpeggio)
   */
  public playChime() {
    if (this.isMuted) return;
    this.initContext();
    const ctx = this.ctx;
    if (!ctx || !this.compressor) return;

    const notes = [659.25, 783.99, 987.77, 1318.51];
    
    notes.forEach((freq, idx) => {
      const timeOffset = idx * 0.06;
      const playTime = ctx.currentTime + timeOffset;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, playTime);
      
      gain.gain.setValueAtTime(0.08, playTime);
      gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.25);

      osc.connect(gain);
      gain.connect(this.compressor!);

      osc.start(playTime);
      osc.stop(playTime + 0.26);
    });
  }

  /**
   * Synthesizes a premium ambient sci-fi entry sound for Zero Studios:
   * 1. A deep sine sub-bass swell (focus/energy rise)
   * 2. A sparkling arpeggiated frequency cascade (harmonized chime)
   * 3. A smooth noise whoosh sweep (transition air)
   */
  public playBootSound() {
    if (this.isMuted) return;
    this.initContext();
    const ctx = this.ctx;
    if (!ctx || !this.compressor) return;

    try {
      const now = ctx.currentTime;

      // 1. Deep sub-bass/low frequency swell (0s to 1.5s)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(40, now);
      subOsc.frequency.exponentialRampToValueAtTime(120, now + 1.2);
      
      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.linearRampToValueAtTime(0.35, now + 0.8);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      subOsc.connect(subGain);
      subGain.connect(this.compressor);
      subOsc.start(now);
      subOsc.stop(now + 1.6);

      // 2. Volumetric noise swell (transition sweep)
      const bufferSize = ctx.sampleRate * 1.5;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(80, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(800, now + 1.2);
      noiseFilter.Q.setValueAtTime(1.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, now);
      noiseGain.gain.linearRampToValueAtTime(0.12, now + 0.8);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.compressor);
      noiseSource.start(now);
      noiseSource.stop(now + 1.5);

      // 3. Elegant rising chime arpeggio
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
      notes.forEach((freq, idx) => {
        const timeOffset = idx * 0.12;
        const playTime = now + timeOffset;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, playTime);
        
        gain.gain.setValueAtTime(0.001, playTime);
        gain.gain.linearRampToValueAtTime(0.08, playTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.5);

        osc.connect(gain);
        gain.connect(this.compressor!);

        osc.start(playTime);
        osc.stop(playTime + 0.55);
      });

    } catch (e) {
      this.playChime();
    }
  }

  /**
   * Start 3D dragging hum
   */
  public startDrag() {
    if (this.isMuted) return;
    this.initContext();
    const ctx = this.ctx;
    if (!ctx || !this.compressor) return;

    if (this.dragActive) return;
    this.dragActive = true;

    try {
      this.dragOsc = ctx.createOscillator();
      this.dragFilter = ctx.createBiquadFilter();
      this.dragGain = ctx.createGain();

      this.dragOsc.type = 'triangle';
      this.dragOsc.frequency.setValueAtTime(75, ctx.currentTime);

      this.dragFilter.type = 'lowpass';
      this.dragFilter.frequency.setValueAtTime(150, ctx.currentTime);
      this.dragFilter.Q.setValueAtTime(3, ctx.currentTime);

      this.dragGain.gain.setValueAtTime(0.001, ctx.currentTime);
      this.dragGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1);

      this.dragOsc.connect(this.dragFilter);
      this.dragFilter.connect(this.dragGain);
      this.dragGain.connect(this.compressor);

      this.dragOsc.start(ctx.currentTime);
    } catch (e) {
      console.warn('Could not start drag synth:', e);
      this.dragActive = false;
    }
  }

  /**
   * Update dragging hum frequency and gain based on speed delta
   */
  public updateDrag(speed: number) {
    if (this.isMuted || !this.dragActive || !this.ctx) return;
    const ctx = this.ctx;
    const osc = this.dragOsc;
    const filter = this.dragFilter;
    const gain = this.dragGain;

    if (!osc || !filter || !gain) return;

    const normalizedSpeed = Math.min(Math.max(speed, 0), 20);

    const targetFreq = 65 + normalizedSpeed * 4.5;
    const targetFilterCutoff = 130 + normalizedSpeed * 22;
    const targetVolume = 0.04 + (normalizedSpeed / 20) * 0.15;

    osc.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.08);
    filter.frequency.setTargetAtTime(targetFilterCutoff, ctx.currentTime, 0.08);
    gain.gain.setTargetAtTime(targetVolume, ctx.currentTime, 0.08);
  }

  /**
   * Stop dragging hum
   */
  public stopDrag() {
    if (!this.dragActive) return;
    this.dragActive = false;

    const ctx = this.ctx;
    const osc = this.dragOsc;
    const gain = this.dragGain;

    if (!ctx || !osc || !gain) return;

    try {
      const fadeOutTime = 0.08;
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + fadeOutTime);

      setTimeout(() => {
        try {
          if (!this.dragActive) {
            osc.stop();
            osc.disconnect();
            gain.disconnect();
            if (this.dragFilter) this.dragFilter.disconnect();
            
            if (this.dragOsc === osc) this.dragOsc = null;
            if (this.dragGain === gain) this.dragGain = null;
          }
        } catch (err) {}
      }, fadeOutTime * 1000 + 10);
    } catch (e) {}
  }

  /**
   * Synthesize a robotic/servo micro-snap sound for eyeball camera movements
   */
  public playEyeMoveTick() {
    if (this.isMuted) return;
    this.initContext();
    const ctx = this.ctx;
    if (!ctx || !this.compressor) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      // Fast pitch sweep up simulating a mechanical servo motor winding up
      osc.frequency.setValueAtTime(550, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.02);

      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

      osc.connect(gain);
      gain.connect(this.compressor);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.022);
    } catch (e) {}
  }

  /**
   * Synthesizes a mechanical focus reveal sound for card/image entries:
   * A low-frequency triangle slide-whoosh layered with a delayed high-frequency shutter snap click.
   */
  public playCardReveal() {
    if (this.isMuted) return;
    this.initContext();
    const ctx = this.ctx;
    if (!ctx || !this.compressor) return;

    try {
      // 1. Low mechanical slide whoosh
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(220, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.18);
      
      gain1.gain.setValueAtTime(0.001, ctx.currentTime);
      gain1.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.04);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      osc1.connect(gain1);
      gain1.connect(this.compressor);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.19);

      // 2. High mechanical shutter snap (delayed by 50ms)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1500, ctx.currentTime + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.075);

      gain2.gain.setValueAtTime(0.001, ctx.currentTime + 0.05);
      gain2.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.055);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.075);

      osc2.connect(gain2);
      gain2.connect(this.compressor);
      osc2.start(ctx.currentTime + 0.05);
      osc2.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  }
}

// Singleton pattern export
export const soundManager = new SoundManager();
