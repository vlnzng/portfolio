// The two-phase desktop scroll engine, loaded on demand by scroll.ts so phones and
// reduced motion never download GSAP or Lenis. One pinned ScrollTrigger drives it:
//   phase 1 (t 0→1): the wordmark morphs from the hero lockup into the V/L home
//     button; the track does not pan yet
//   phase 2 (panX 0→panMax): the track pans, the portrait glides hero → about,
//     the cue turns ↓ → →, the progress bar fills
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { clamp, revealOnPan } from './reveal';

gsap.registerPlugin(ScrollTrigger);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// vl:scroll-settled fires once the hash restore has run: navigation.ts holds URL
// syncing until then, or the restore's first "hero" frames would rewrite /#about.
const HASH_RESTORE_DURATION = 0.9;

// Morph travel: part linear, part ease-out. It answers the first scroll tick
// (slope 1.3 at t=0) and keeps moving as the pan takes over (0.7 at t=1).
const morphEase = (t: number) => t + 0.3 * t * (1 - t);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

let lenis: Lenis | undefined;

// Lenis only ever runs here: it virtualises the scroll position, which fights the
// native scrollIntoView() the stacked layout navigates with.
export function startDesktopEngine(returnY: number | null, markScrollSettled: () => void): void {
  lenis = initLenis();
  initEngine(returnY, markScrollSettled);
}

function initLenis(): Lenis {
  const instance = new Lenis({
    duration: 0.9,
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

function initEngine(returnY: number | null, markScrollSettled: () => void): void {
  const track = document.querySelector<HTMLElement>('.horizontal-track');
  const container = document.querySelector<HTMLElement>('.scroll-container');
  if (!track || !container) return;

  // Read before the first render: on a slow connection navigation.ts may already
  // be syncing, and that render reports "hero", which would strip the deep link.
  const initialHash = returnY == null ? window.location.hash.replace('#', '') : '';

  // overflow-x: hidden still makes .scroll-container scrollable: an anchor jump or
  // focus in an off-screen panel sets its scrollLeft, which stacks on the engine's
  // x: -panX and slides the track out of view. Only the engine moves it sideways.
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
  // Panels in track order. Their measured offsetLeft drives both jumping to a
  // panel and reporting the one in view, so the nav and the screen can't disagree.
  const panelEls = Array.from(track.querySelectorAll<HTMLElement>('.section'));
  const panelOffset = (i: number): number => Math.min(panelEls[i]?.offsetLeft ?? 0, panMax);

  const navList = document.querySelector<HTMLElement>('.navbar__list');
  const navLabel = navList?.querySelector<HTMLElement>('span');
  const wordmarkSvg = wordmark?.querySelector<SVGSVGElement>('svg');

  let morphDist = 0;
  let panMax = 0;
  let panScrollDist = 0; // scroll travel that drives panX from 0 to panMax
  let total = 0;
  // where the collapsed V/L ends up: centred on the live nav line
  let markY = 30;
  let markScale = 0.22;
  // One panel's rendered width (CSS 100vw), which can differ from innerWidth
  // (scrollbar, emulation). All vw-based engine maths use it, so jumps land exactly.
  let panelW = 0;
  const measure = (): void => {
    panelW =
      panelEls.length > 1 ? panelEls[1].offsetLeft - panelEls[0].offsetLeft : window.innerWidth;
    // A wheel notch is a fixed number of pixels on any screen, so both scroll
    // budgets are bounded in absolute terms.
    morphDist = clamp(window.innerHeight * 0.65, 380, 720);
    panMax = Math.max(0, track.scrollWidth - panelW);
    // per panel: the floor keeps a small laptop from crossing a panel in a few
    // notches, the ceiling keeps a large screen from needing ~30
    panScrollDist = panMax > 0 ? (panelEls.length - 1) * clamp(panelW, 1400, 1800) : 0;
    total = morphDist + panScrollDist;

    if (navList && navLabel && wordmarkSvg) {
      const navRect = navList.getBoundingClientRect();
      // the labels carry padding below the text for their active underline
      const labelPad = parseFloat(getComputedStyle(navLabel).paddingBottom) || 0;
      const navCenterY = navRect.top + (navRect.height - labelPad) / 2;
      // computed height: unlike a rect it ignores the morph's current scale
      const wordmarkH = parseFloat(getComputedStyle(wordmarkSvg).height);
      // follows the lockup up to 1920px, then holds its size against the nav type
      if (wordmarkH > 0) {
        const markH = clamp(wordmarkH * 0.22, 38, navRect.height * 1.85);
        markScale = markH / wordmarkH;
        markY = navCenterY - markH / 2;
      }
    }
  };

  const panFromPos = (pos: number): number =>
    panScrollDist > 0 ? (clamp(pos - morphDist, 0, panScrollDist) / panScrollDist) * panMax : 0;
  const posFromPan = (panX: number): number =>
    morphDist + (panMax > 0 ? (panX / panMax) * panScrollDist : 0);
  const panelPos = (i: number): number => (i === 0 ? 0 : posFromPan(panelOffset(i)));
  measure();

  // ---- wordmark morph (t in [0,1]) ----
  function applyMorph(t: number): void {
    if (!wordmark) return;

    // the tails retract into the V, gone by 55% of the morph. They're SVG groups
    // with fill-box origins, so the % translate is relative to each tail's own box.
    const ts = easeOut(clamp(t / 0.55, 0, 1));
    tails.forEach((tail) => {
      tail.style.opacity = String(1 - ts);
      tail.style.transform = `translate(${lerp(0, -6, ts)}%, ${lerp(0, -18, ts)}%) scale(${lerp(1, 0.9, ts)})`;
    });

    // one monotonic glide to the nav corner, on the same curve as the portrait.
    // heroX/heroY mirror the wordmark's CSS rest transform (5.5vw / 20vh).
    const heroX = panelW * 0.055;
    const heroY = window.innerHeight * 0.2;
    const navX = 54;

    const te = morphEase(t);
    const x = lerp(heroX, navX, te);
    const y = lerp(heroY, markY, te);
    const s = lerp(1, markScale, te);
    wordmark.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    wordmark.classList.toggle('is-collapsed', t > 0.45);

    // the hero text rests low, then scrolls up and away with the portrait. The
    // rest offset shrinks below 1080px height so the text clears the cue.
    const HERO_REST_Y = Math.min(64, (window.innerHeight * 64) / 1080);
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
    // rests low; the morph lifts it, and it stays up through the pan
    const restY = vh * 0.15;
    portrait.style.transform = `translateY(${lerp(restY, 0, morphEase(t))}px)`;
  }

  // ---- portrait parallax: a few px against the cursor while it rests on the hero ----
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

  // ---- statement cue: "Learned the rules. ↓" breaks to "Practising the
  //      exceptions. →" where down turns into the pan, then fades out ----
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
    // the panel whose real offset is nearest, so it tracks what is on screen
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

  const render = (pos: number): void => {
    const t = clamp(pos / morphDist, 0, 1);
    const panX = panFromPos(pos);
    gsap.set(track, { x: -panX });
    applyMorph(t);
    positionPortrait(t, panX);
    updateParallaxRest(t);
    updateCue(t, panX);
    updateProgress(panX, t);
    updateNav(panX);
    revealOnPan(panX, panelW);
  };

  const st = ScrollTrigger.create({
    trigger: container,
    pin: true,
    start: 'top top',
    end: () => {
      measure();
      return `+=${total}`;
    },
    invalidateOnRefresh: true,
    // re-render too: the collapsed mark's target moves with the viewport
    onRefresh: (self) => {
      measure();
      render(self.progress * total);
    },
    onUpdate: (self) => render(self.progress * total),
  });

  // initial paint (before the first scroll)
  applyMorph(0);
  positionPortrait(0, 0);

  const scrollY = (): number => (lenis ? lenis.scroll : window.scrollY);
  const goTo = (y: number, duration = 0.9): void => {
    if (lenis) lenis.scrollTo(y, { duration });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  };

  // The pinned range (st.end − st.start) isn't always `total`, while onUpdate maps
  // progress × total to pos — so jumps convert pos ↔ scroll through the live range.
  const engineRange = (): number => st.end - st.start;
  const posToScroll = (pos: number): number =>
    st.start + (total > 0 ? (pos / total) * engineRange() : pos);
  const scrollToPos = (scroll: number): number =>
    total > 0 && engineRange() > 0 ? ((scroll - st.start) / engineRange()) * total : 0;

  window.__portfolioScrollTo = (id: string) => {
    const idx = panelEls.findIndex((s) => s.id === id);
    if (idx < 0) return;
    // URL is kept in sync by navigation.ts as the pan settles on a section.
    goTo(posToScroll(panelPos(idx)));
  };

  // Tab into another panel must pan there, since pinTrack reverts the browser's own
  // reveal. Keyboard focus only: a click focuses too, and re-aligning the panel
  // under the pointer jolted the page behind an opening case.
  track.addEventListener('focusin', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.matches(':focus-visible')) return;
    const panel = target.closest<HTMLElement>('.section');
    if (!panel) return;
    const idx = panelEls.indexOf(panel);
    if (idx < 0) return;

    const pos = panelPos(idx);
    // already showing that panel — don't re-scroll on every Tab step inside it
    if (Math.abs(scrollToPos(scrollY()) - pos) < 8) return;
    goTo(posToScroll(pos), 0.45);
  });

  // cue: first click finishes the morph, then each advances a panel
  cue?.addEventListener('click', () => {
    const curPos = scrollToPos(scrollY());
    if (curPos < morphDist - 10) goTo(posToScroll(morphDist), 0.8);
    else goTo(posToScroll(posFromPan(Math.min(panFromPos(curPos) + panelW * 0.9, panMax))), 0.8);
  });

  // A frame after setup the pin spacer gives the document its real height, but
  // Lenis keeps its cached scroll limit (0) until its ResizeObserver fires and
  // would clamp any target to it — so refresh and resize before restoring. The
  // trailing pinTrack() undoes the native anchor jump from before the engine ran.
  const restoreScroll = (scrollNow: () => void): void => {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      lenis?.resize();
      scrollNow();
      requestAnimationFrame(pinTrack);
    });
  };

  // returning from a legal page → restore exact position (priority over hash)
  if (returnY != null) {
    restoreScroll(() => {
      if (lenis) lenis.scrollTo(returnY, { immediate: true });
      else window.scrollTo(0, returnY);
      requestAnimationFrame(markScrollSettled);
    });
  } else if (initialHash) {
    restoreScroll(() => {
      window.__portfolioScrollTo?.(initialHash);
      window.setTimeout(markScrollSettled, HASH_RESTORE_DURATION * 1000 + 120);
    });
  } else {
    requestAnimationFrame(markScrollSettled);
  }
}
