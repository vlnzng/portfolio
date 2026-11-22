import { desktopQuery, prefersReducedMotion, reducedMotionQuery } from './media';

declare global {
  interface Window {
    __portfolioScrollTo?: (id: string) => void;
    __portfolioSetActive?: (id: string) => void;
  }
}

// Tells navigation.ts that the initial scroll restore is done.
const markScrollSettled = (): void => window.dispatchEvent(new Event('vl:scroll-settled'));

// One-shot scroll position stored when leaving for a legal page (Contact.astro).
// try/catch: blocked storage must not take the whole scroll engine down.
const takeReturnY = (): number | null => {
  try {
    const raw = sessionStorage.getItem('vl:returnY');
    if (raw == null) return null;
    sessionStorage.removeItem('vl:returnY');
    const y = Number.parseInt(raw, 10);
    return Number.isNaN(y) ? null : y;
  } catch {
    return null;
  }
};

// A bfcache restore (Back from /imprint) revives the page without re-running
// this module, so the stored key was never consumed — drop it instead of
// letting a later reload act on it.
window.addEventListener('pageshow', (event) => {
  if (!event.persisted) return;
  try {
    sessionStorage.removeItem('vl:returnY');
  } catch {
    /* nothing was stored either */
  }
});

// The engine is its own chunk: phones and reduced motion use native scroll and
// never fetch it. A nav click during the short wait is recorded as a deep link,
// which the engine picks up as soon as it starts.
if (!prefersReducedMotion && desktopQuery.matches) {
  const returnY = takeReturnY();
  window.__portfolioScrollTo = (id: string) => {
    history.replaceState(history.state, '', `#${id}`);
  };
  import('./desktop-engine').then(({ startDesktopEngine }) => {
    startDesktopEngine(returnY, markScrollSettled);
  });
} else {
  initStandardNavigation();
}

// The engine-vs-standard choice (and the CSS layout) hinge on the engine
// boundary (see media.ts) / reduced-motion, decided once at load. Crossing it on
// a live resize would leave JS and CSS disagreeing — the horizontal engine stays
// pinned while the layout is vertical, so nav links jump to the wrong section.
// Re-initialise cleanly by reloading when the boundary is actually crossed (a
// no-op on real phones, which fail the width test in both orientations; only
// fires on desktop resize).
let reinitialising = false;
const reinitOnBoundaryChange = (): void => {
  if (reinitialising) return;
  reinitialising = true;
  location.reload();
};
desktopQuery.addEventListener('change', reinitOnBoundaryChange);
reducedMotionQuery.addEventListener('change', reinitOnBoundaryChange);

function initStandardNavigation(): void {
  // The stacked hero places the portrait below the text via --hero-text-h. CSS
  // holds the measured default; this follows text scaling and unusual wraps.
  const heroText = document.querySelector<HTMLElement>('[data-hero-text]');
  if (heroText) {
    new ResizeObserver(() => {
      document.documentElement.style.setProperty(
        '--hero-text-h',
        `${Math.ceil(heroText.offsetHeight + 28)}px`,
      );
    }).observe(heroText);
  }

  window.__portfolioScrollTo = (id: string) => {
    const section = document.getElementById(id);
    if (!section) return;
    // URL is kept in sync by navigation.ts as the section scrolls into view.
    section.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  // Returning from a legal page → restore the exact scroll position. Instant:
  // html's scroll-behavior: smooth would otherwise animate down from the top.
  const returnY = takeReturnY();
  requestAnimationFrame(() => {
    if (returnY != null) window.scrollTo({ top: returnY, behavior: 'instant' });
    markScrollSettled();
  });
}
