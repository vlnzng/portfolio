import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    __portfolioScrollTo?: (id: string) => void;
    __portfolioSetActive?: (id: string) => void;
  }
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktopQuery = window.matchMedia('(min-width: 821px)');

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

let lenis: Lenis | undefined;

if (!prefersReducedMotion) {
  lenis = initLenis();
}

if (!prefersReducedMotion && desktopQuery.matches) {
  initEngine();
} else {
  initStandardNavigation();
}

function initLenis(): Lenis {
  const instance = new Lenis({
    duration: 1.1,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
  });

  instance.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time: number) => instance.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return instance;
}

/* Two-phase desktop engine (ported from the design handoff, driven by a single
   pinned ScrollTrigger):
     Phase 1 (t 0→1, ~1.15 viewport heights) — the wordmark morphs from the hero
       lockup into the VL home button; the track does NOT pan yet.
     Phase 2 (panX 0→panMax) — the track pans horizontally; the shared portrait
       glides hero-right → about-left, the cue spins ↓→→, progress fills. */
function initEngine(): void {
  const track = document.querySelector<HTMLElement>('.horizontal-track');
  const container = document.querySelector<HTMLElement>('.scroll-container');
  if (!track || !container) return;

  const wordmark = document.querySelector<HTMLElement>('[data-wordmark]');
  const tails = Array.from(document.querySelectorAll<HTMLElement>('[data-wm-tail]'));
  const heroText = document.querySelector<HTMLElement>('[data-hero-text]');
  const portrait = document.querySelector<HTMLElement>('[data-portrait]');
  const cue = document.querySelector<HTMLElement>('[data-scrollcue]');
  const cueArrow = document.querySelector<HTMLElement>('[data-scrollcue-arrow]');
  const cueLabel = document.querySelector<HTMLElement>('[data-scrollcue-label]');
  const progress = document.querySelector<HTMLElement>('[data-progress]');
  const progressFill = document.querySelector<HTMLElement>('[data-progress-fill]');
  const SECTIONS = ['about', 'work', 'process', 'contact'];

  let morphDist = 0;
  let panMax = 0;
  let total = 0;
  const measure = (): void => {
    morphDist = window.innerHeight * 1.15;
    panMax = Math.max(0, track.scrollWidth - window.innerWidth);
    total = morphDist + panMax;
  };
  measure();

  // ---- wordmark morph (t in [0,1]) ----
  function applyMorph(t: number): void {
    if (!wordmark) return;

    // tails fade + slide away (gone by ~55% of the morph) → leaves the VL
    const ts = easeOut(clamp(t / 0.55, 0, 1));
    tails.forEach((tail) => {
      tail.style.opacity = String(1 - ts);
      tail.style.transform = `translateX(${lerp(0, -0.16, ts)}em) scaleX(${lerp(1, 0.84, ts)})`;
    });

    // travel: dip DOWN first (down-feel), then fly to the navbar corner, shrinking
    const heroX = Math.max(64, window.innerWidth * 0.055);
    const heroY = window.innerHeight * 0.18;
    const navX = 54;
    const navY = 34;
    const endScale = 0.2;

    const te = easeInOut(t);
    const x = lerp(heroX, navX, te);
    const dip = heroY + 56;
    const y = t < 0.4
      ? lerp(heroY, dip, easeOut(t / 0.4))
      : lerp(dip, navY, easeInOut((t - 0.4) / 0.6));
    const s = lerp(1, endScale, te);
    wordmark.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    wordmark.classList.toggle('is-collapsed', t > 0.45);

    // hero content drifts down a touch (reinforces the "scrolling down" read)
    if (heroText) heroText.style.transform = `translateY(${lerp(0, 56, t)}px)`;
  }

  // ---- shared portrait: glide hero-right → about-left, then off to the left ----
  function positionPortrait(t: number, panX: number): void {
    if (!portrait) return;
    const vw = window.innerWidth;
    const p = clamp(panX / vw, 0, 1); // 0 = hero (right), 1 = about (left)
    const extra = Math.max(0, panX - vw); // beyond About → scroll off-screen left
    portrait.style.left = `${lerp(0.5, -0.02, p) * vw - extra}px`;
    portrait.style.width = `${lerp(0.52, 0.46, p) * vw}px`;
    portrait.style.transform = `translateY(${lerp(0, 24, t)}px)`;
  }

  // ---- scroll cue ----
  function updateCue(t: number, panX: number): void {
    if (!cue) return;
    const spin = clamp((t - 0.55) / 0.4, 0, 1); // ↓ until morph almost done, then →
    if (cueArrow) cueArrow.style.transform = `rotate(${lerp(0, -90, spin)}deg)`;
    if (spin > 0.5) {
      cue.classList.add('is-moved');
      if (cueLabel) cueLabel.textContent = 'Explore';
    } else {
      cue.classList.remove('is-moved');
      if (cueLabel) cueLabel.textContent = 'Scroll';
    }
    const fade = panX > 0 ? clamp(1 - panX / (window.innerWidth * 0.35), 0, 1) : 1;
    cue.style.opacity = String(fade);
    cue.style.pointerEvents = fade < 0.2 ? 'none' : 'auto';
  }

  // ---- horizontal progress (hidden during the morph, fills across the pan) ----
  function updateProgress(panX: number, t: number): void {
    if (!progress) return;
    const frac = panMax > 0 ? clamp(panX / panMax, 0, 1) : 0;
    if (progressFill) progressFill.style.transform = `scaleX(${frac})`;
    progress.style.opacity = String(clamp((t - 0.78) / 0.22, 0, 1));
  }

  // ---- nav active state ----
  function updateNav(panX: number): void {
    const vw = window.innerWidth || 1;
    const idx = Math.round(panX / vw);
    const active = idx >= 1 ? SECTIONS[Math.min(idx - 1, SECTIONS.length - 1)] : 'hero';
    window.__portfolioSetActive?.(active);
  }

  const st = ScrollTrigger.create({
    trigger: container,
    pin: true,
    start: 'top top',
    end: () => {
      measure();
      return `+=${total}`;
    },
    invalidateOnRefresh: true,
    onRefresh: measure,
    onUpdate: (self) => {
      const pos = self.progress * total;
      const t = clamp(pos / morphDist, 0, 1);
      const panX = clamp(pos - morphDist, 0, panMax);
      gsap.set(track, { x: -panX });
      applyMorph(t);
      positionPortrait(t, panX);
      updateCue(t, panX);
      updateProgress(panX, t);
      updateNav(panX);
    },
  });

  // initial paint (before the first scroll)
  applyMorph(0);
  positionPortrait(0, 0);

  const scrollY = (): number => (lenis ? lenis.scroll : window.scrollY);
  const goTo = (y: number, duration = 0.9): void => {
    if (lenis) lenis.scrollTo(y, { duration });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  };

  window.__portfolioScrollTo = (id: string) => {
    const section = document.getElementById(id);
    if (!section) return;
    const pos = id === 'hero' ? 0 : morphDist + Math.min(section.offsetLeft, panMax);
    history.pushState(null, '', id === 'hero' ? '/' : `/#${id}`);
    goTo(st.start + pos);
  };

  // cue: first click finishes the morph, then each advances a panel
  cue?.addEventListener('click', () => {
    const pos = scrollY() - st.start;
    if (pos < morphDist - 10) goTo(st.start + morphDist, 0.8);
    else goTo(scrollY() + window.innerWidth * 0.9, 0.8);
  });

  // returning from a legal page → restore exact position (priority over hash)
  const returnY = sessionStorage.getItem('vl:returnY');
  if (returnY != null) {
    sessionStorage.removeItem('vl:returnY');
    const y = Number.parseInt(returnY, 10);
    if (!Number.isNaN(y)) {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        if (lenis) lenis.scrollTo(y, { immediate: true });
        else window.scrollTo(0, y);
      });
    }
  } else {
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
      requestAnimationFrame(() => window.__portfolioScrollTo?.(initialHash));
    }
  }
}

function initStandardNavigation(): void {
  window.__portfolioScrollTo = (id: string) => {
    const section = document.getElementById(id);
    if (!section) return;
    history.pushState(null, '', id === 'hero' ? '/' : `/#${id}`);
    section.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };
}
