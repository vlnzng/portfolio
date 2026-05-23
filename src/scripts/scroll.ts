// src/scripts/scroll.ts
// Lenis Smooth Scroll + GSAP ScrollTrigger Setup
// Vertikal → Horizontal Übergang

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ------------------------------------------------------------------
// Reduced Motion Check — alles deaktivieren wenn gewünscht
// ------------------------------------------------------------------
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (prefersReducedMotion) {
  // Kein Lenis, kein GSAP — normales Browser-Scrolling bleibt aktiv
  console.info('[scroll] Reduced motion: animations disabled');
} else {
  initLenis();
  ScrollTrigger.matchMedia({
    '(min-width: 769px)': initHorizontalScroll,
    // Mobile: Lenis läuft, aber kein horizontales Pinning
  });
}

// ------------------------------------------------------------------
// Lenis Setup
// ------------------------------------------------------------------
function initLenis(): Lenis {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
  });

  // GSAP Ticker mit Lenis synchronisieren
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time: number) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  return lenis;
}

// ------------------------------------------------------------------
// Horizontaler Scroll — nur Desktop
// ------------------------------------------------------------------
function initHorizontalScroll(): void {
  const track = document.querySelector<HTMLElement>('.horizontal-track');

  if (!track) {
    console.warn('[scroll] .horizontal-track not found');
    return;
  }

  gsap.to(track, {
    // Verschiebt den Track nach links um seine gesamte Breite minus Viewport
    x: () => -(track.scrollWidth - window.innerWidth),
    ease: 'none',
    scrollTrigger: {
      trigger: '.scroll-container',
      pin: true,
      scrub: 1,
      start: 'top top',
      end: () => `+=${track.scrollWidth - window.innerWidth}`,
      // Wichtig: neu berechnen wenn Fenster resized wird
      invalidateOnRefresh: true,
    },
  });
}
