import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { clamp, revealOnPan } from './reveal';
import { desktopQuery, prefersReducedMotion, reducedMotionQuery } from './media';

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    __portfolioScrollTo?: (id: string) => void;
    __portfolioSetActive?: (id: string) => void;
  }
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// One-shot scroll position stored when leaving for a legal page (Contact.astro)
const takeReturnY = (): number | null => {
  const raw = sessionStorage.getItem('vl:returnY');
  if (raw == null) return null;
  sessionStorage.removeItem('vl:returnY');
  const y = Number.parseInt(raw, 10);
  return Number.isNaN(y) ? null : y;
};
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

let lenis: Lenis | undefined;

// Lenis only runs with the desktop engine (it drives the pinned ScrollTrigger).
// On mobile it must NOT run: Lenis virtualises the scroll position, and native
// section.scrollIntoView() then fights it — which made nav links land on the
// wrong section (tap "Work", end up on "Process"). Mobile uses native scroll.
if (!prefersReducedMotion && desktopQuery.matches) {
  lenis = initLenis();
  initEngine();
} else {
  initStandardNavigation();
}

// The engine-vs-standard choice (and the CSS layout) hinge on the 821px / reduced
// -motion boundary, decided once at load. Crossing it on a live resize would leave
// JS and CSS disagreeing — the horizontal engine stays pinned while the layout is
// vertical, so nav links jump to the wrong section. Re-initialise cleanly by
// reloading when the boundary is actually crossed (a no-op on real phones, whose
// width never crosses it; only fires on desktop resize / orientation change).
let reinitialising = false;
const reinitOnBoundaryChange = (): void => {
  if (reinitialising) return;
  reinitialising = true;
  location.reload();
};
desktopQuery.addEventListener('change', reinitOnBoundaryChange);
reducedMotionQuery.addEventListener('change', reinitOnBoundaryChange);

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

  // `.scroll-container` clips the wide track with `overflow-x: hidden`, which
  // still makes it a scroll container: a native anchor jump (arriving at
  // /#contact from a legal page) or focus moving into an off-screen panel sets
  // its scrollLeft behind our back. That offset stacks on top of the engine's
  // own `x: -panX`, so the track slides out of view and only the fixed hero
  // furniture (wordmark, portrait, cue) is left on screen. Keep it at zero —
  // the engine is the only thing allowed to move the track sideways.
  const pinTrack = (): void => {
    if (container.scrollLeft !== 0) container.scrollLeft = 0;
  };
  container.addEventListener('scroll', pinTrack);
  pinTrack();

  const wordmark = document.querySelector<HTMLElement>('[data-wordmark]');
  const tails = Array.from(document.querySelectorAll<HTMLElement>('[data-wm-tail]'));
  const heroText = document.querySelector<HTMLElement>('[data-hero-text]');
  const portrait = document.querySelector<HTMLElement>('[data-portrait]');
  const cue = document.querySelector<HTMLElement>('[data-scrollcue]');
  const cueArrow = document.querySelector<HTMLElement>('[data-scrollcue-arrow]');
  const progress = document.querySelector<HTMLElement>('[data-progress]');
  const progressFill = document.querySelector<HTMLElement>('[data-progress-fill]');
  // The actual panel elements in track order (hero, about, work, process,
  // contact). Their measured offsetLeft is the single source of truth for both
  // jumping to a panel and reporting which one is in view — so the nav label
  // and the visible panel can never disagree.
  const panelEls = Array.from(track.querySelectorAll<HTMLElement>('.section'));
  const panelOffset = (i: number): number => Math.min(panelEls[i]?.offsetLeft ?? 0, panMax);

  let morphDist = 0;
  let panMax = 0;
  let total = 0;
  // The real rendered width of one panel (CSS `100vw`). This can differ from
  // window.innerWidth when a vertical scrollbar / device-emulation inflates `vw`;
  // using it everywhere the engine emulates a vw-based value keeps the pan math
  // in lockstep with the CSS-rendered geometry (otherwise jumps overshot a whole
  // section — tap "Work", land on "Process"). measure() only reads layout.
  let panelW = 0;
  const measure = (): void => {
    panelW =
      panelEls.length > 1
        ? panelEls[1].offsetLeft - panelEls[0].offsetLeft
        : window.innerWidth;
    morphDist = window.innerHeight * 1.15;
    panMax = Math.max(0, track.scrollWidth - panelW);
    total = morphDist + panMax;
  };
  measure();

  // ---- wordmark morph (t in [0,1]) ----
  function applyMorph(t: number): void {
    if (!wordmark) return;

    // tails fade + retract up into the V (gone by ~55% of the morph) → leaves the
    // VL. They're SVG <g> groups (transform-box: fill-box, left origin), so the
    // translate is a % of each group's own box: mostly up, a little in, shrinking.
    const ts = easeOut(clamp(t / 0.55, 0, 1));
    tails.forEach((tail) => {
      tail.style.opacity = String(1 - ts);
      tail.style.transform = `translate(${lerp(0, -6, ts)}%, ${lerp(0, -18, ts)}%) scale(${lerp(1, 0.9, ts)})`;
    });

    // travel: a single, monotonic glide up to the navbar corner while
    // shrinking — driven by the same easeInOut as the portrait so the
    // wordmark, the hero text and the figure all settle on the same curve
    // (no dip: the "down" read comes from the text + portrait, not a wobble).
    // heroX/heroY mirror the wordmark's CSS resting transform (5.5vw / 20vh).
    const heroX = Math.max(64, panelW * 0.055);
    const heroY = window.innerHeight * 0.2;
    const navX = 54;
    const navY = 30;
    const endScale = 0.22;

    const te = easeInOut(t);
    const x = lerp(heroX, navX, te);
    const y = lerp(heroY, navY, te);
    const s = lerp(1, endScale, te);
    wordmark.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    wordmark.classList.toggle('is-collapsed', t > 0.45);

    // hero content rests slightly low, then scrolls up and away like a normal
    // page (the portrait lifting at the same time completes that read)
    const HERO_REST_Y = 64;
    if (heroText) heroText.style.transform = `translateY(${lerp(HERO_REST_Y, -90, t)}px)`;
  }

  // ---- shared portrait: glide hero-right → about-left, then off to the left ----
  function positionPortrait(t: number, panX: number): void {
    if (!portrait) return;
    const vw = panelW;
    const vh = window.innerHeight;
    const p = clamp(panX / vw, 0, 1); // 0 = hero (right), 1 = about (left)
    const extra = Math.max(0, panX - vw); // beyond About → scroll off-screen left
    portrait.style.left = `${lerp(0.5, -0.02, p) * vw - extra}px`;
    portrait.style.width = `${lerp(0.52, 0.46, p) * vw}px`;
    // sits low at rest; scrolling down reveals more of the figure, and it
    // stays up once the pan takes over (one direction, no wobble)
    const restY = vh * 0.15;
    portrait.style.transform = `translateY(${lerp(restY, 0, easeInOut(t))}px)`;
  }

  // ---- portrait parallax: a few px of depth against the cursor, only while
  //      the figure rests on the hero (it recentres as the morph takes over) ----
  const portraitPicture = portrait?.querySelector<HTMLElement>('picture');
  let parallaxResting = true;
  const parallaxX = portraitPicture
    ? gsap.quickTo(portraitPicture, 'x', { duration: 1.2, ease: 'power2.out' })
    : undefined;
  const parallaxY = portraitPicture
    ? gsap.quickTo(portraitPicture, 'y', { duration: 1.2, ease: 'power2.out' })
    : undefined;

  window.addEventListener('mousemove', (event) => {
    if (!parallaxResting || !parallaxX || !parallaxY) return;
    const nx = (event.clientX / window.innerWidth) * 2 - 1; // -1 … 1
    const ny = (event.clientY / window.innerHeight) * 2 - 1;
    parallaxX(nx * -9);
    parallaxY(ny * -6);
  });

  function updateParallaxRest(t: number): void {
    const resting = t < 0.25;
    if (resting === parallaxResting) return;
    parallaxResting = resting;
    if (!resting) {
      parallaxX?.(0);
      parallaxY?.(0);
    }
  }

  // ---- statement cue: the hero statement and the scroll hint are one
  //      element. "Learned the rules. ↓" rides the down-scroll; at the hinge
  //      where down turns into the side-pan it breaks to "Practising the
  //      exceptions. →"; fades out once panning is underway. ----
  function updateCue(t: number, panX: number): void {
    if (!cue) return;
    const spin = clamp((t - 0.5) / 0.25, 0, 1); // ↓ → → finishes with the phrase break
    if (cueArrow) cueArrow.style.transform = `rotate(${lerp(0, -90, spin)}deg)`;
    cue.classList.toggle('is-broken', t > 0.6);
    const fade = panX > 0 ? clamp(1 - panX / (panelW * 0.35), 0, 1) : 1;
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
    // Pick the panel whose real offset is nearest the current pan — this tracks
    // what's actually on screen, independent of any vw/scrollbar rounding.
    let nearest = 0;
    let best = Infinity;
    for (let i = 0; i < panelEls.length; i++) {
      const d = Math.abs(panelEls[i].offsetLeft - panX);
      if (d < best) {
        best = d;
        nearest = i;
      }
    }
    window.__portfolioSetActive?.(panelEls[nearest].id);
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
      updateParallaxRest(t);
      updateCue(t, panX);
      updateProgress(panX, t);
      updateNav(panX);
      revealOnPan(panX, panelW);
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

  // ScrollTrigger's actual pinned scroll range (st.end − st.start) is not always
  // equal to `total` (the engine's morph+pan length used by onUpdate to map
  // progress→pos). onUpdate does `pos = self.progress * total`, so to land a jump
  // exactly we must convert engine-pos ↔ real scroll through the LIVE range, not
  // assume scroll == pos. Otherwise jumps land short or long by whole sections.
  const engineRange = (): number => st.end - st.start;
  const posToScroll = (pos: number): number =>
    st.start + (total > 0 ? (pos / total) * engineRange() : pos);
  const scrollToPos = (scroll: number): number =>
    total > 0 && engineRange() > 0 ? ((scroll - st.start) / engineRange()) * total : 0;

  window.__portfolioScrollTo = (id: string) => {
    const idx = panelEls.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const pos = idx === 0 ? 0 : morphDist + panelOffset(idx);
    // URL is kept in sync by navigation.ts as the pan settles on a section.
    goTo(posToScroll(pos));
  };

  // cue: first click finishes the morph, then each advances a panel
  cue?.addEventListener('click', () => {
    const curPos = scrollToPos(scrollY());
    if (curPos < morphDist - 10) goTo(posToScroll(morphDist), 0.8);
    else goTo(posToScroll(curPos + panelW * 0.9), 0.8);
  });

  // returning from a legal page → restore exact position (priority over hash)
  const returnY = takeReturnY();
  if (returnY != null) {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      if (lenis) lenis.scrollTo(returnY, { immediate: true });
      else window.scrollTo(0, returnY);
      // the browser's own jump to /#contact happened before the engine existed
      requestAnimationFrame(pinTrack);
    });
  } else {
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
      requestAnimationFrame(() => {
        window.__portfolioScrollTo?.(initialHash);
        requestAnimationFrame(pinTrack);
      });
    }
  }
}

function initStandardNavigation(): void {
  window.__portfolioScrollTo = (id: string) => {
    const section = document.getElementById(id);
    if (!section) return;
    // URL is kept in sync by navigation.ts as the section scrolls into view.
    section.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  // Returning from a legal page → restore the exact scroll position.
  const returnY = takeReturnY();
  if (returnY != null) requestAnimationFrame(() => window.scrollTo(0, returnY));
}
