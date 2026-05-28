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
const desktopQuery = window.matchMedia('(min-width: 769px)');

let lenis: Lenis | undefined;

if (!prefersReducedMotion) {
  lenis = initLenis();
}

if (!prefersReducedMotion && desktopQuery.matches) {
  initHorizontalScroll();
  initHeroMotion();
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

  gsap.ticker.add((time: number) => {
    instance.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  return instance;
}

function initHorizontalScroll(): void {
  const track = document.querySelector<HTMLElement>('.horizontal-track');
  const container = document.querySelector<HTMLElement>('.scroll-container');
  const progress = document.querySelector<HTMLElement>('.scroll-progress');
  const progressBar = document.querySelector<HTMLElement>('.scroll-progress__bar');
  const sections = Array.from(document.querySelectorAll<HTMLElement>('.section'));

  if (!track || !container) return;

  const horizontal = gsap.to(track, {
    x: () => -(track.scrollWidth - window.innerWidth),
    ease: 'none',
    scrollTrigger: {
      trigger: container,
      pin: true,
      scrub: 0.8,
      start: 'top top',
      end: () => `+=${track.scrollWidth - window.innerWidth}`,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const x = Math.abs(Number(gsap.getProperty(track, 'x')));
        const center = x + window.innerWidth / 2;
        const active = sections.find((section) => (
          center >= section.offsetLeft && center < section.offsetLeft + section.offsetWidth
        ));

        if (active) window.__portfolioSetActive?.(active.id);
        progress?.classList.toggle('is-visible', x > window.innerWidth * 0.35);
        if (progressBar) progressBar.style.transform = `scaleX(${self.progress})`;
      },
    },
  });

  window.__portfolioScrollTo = (id: string) => {
    const section = document.getElementById(id);
    const trigger = horizontal.scrollTrigger;
    if (!section || !trigger) return;

    const maxX = track.scrollWidth - window.innerWidth;
    const scrollRange = trigger.end - trigger.start;
    const targetX = Math.min(section.offsetLeft, maxX);
    const targetY = trigger.start + (targetX / maxX) * scrollRange;

    history.pushState(null, '', id === 'hero' ? '/' : `/#${id}`);
    if (lenis) {
      lenis.scrollTo(targetY, { duration: 0.8 });
    } else {
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  };

  const initialHash = window.location.hash.replace('#', '');
  if (initialHash) {
    requestAnimationFrame(() => window.__portfolioScrollTo?.(initialHash));
  }
}

function initHeroMotion(): void {
  gsap.fromTo(
    '[data-hero-copy]',
    { opacity: 0, y: 28 },
    { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.15 },
  );

  gsap.to('[data-hero-arrow]', {
    rotate: -90,
    scrollTrigger: {
      trigger: '.scroll-container',
      start: 'top top',
      end: '+=420',
      scrub: true,
    },
  });

  gsap.to('[data-hero-wordmark]', {
    y: -24,
    scale: 0.72,
    scrollTrigger: {
      trigger: '.scroll-container',
      start: 'top top',
      end: '+=520',
      scrub: true,
    },
  });
}

function initStandardNavigation(): void {
  window.__portfolioScrollTo = (id: string) => {
    const section = document.getElementById(id);
    if (!section) return;
    history.pushState(null, '', id === 'hero' ? '/' : `/#${id}`);
    section.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };
}
