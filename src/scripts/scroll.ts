import { desktopQuery, prefersReducedMotion, reducedMotionQuery } from './media';

// Tells navigation.ts that the initial scroll restore is done.
const markScrollSettled = (): void => {
  window.dispatchEvent(new Event('vl:scroll-settled'));
};

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

// A bfcache restore (Back from /imprint) never consumes the stored key, so drop
// it before a later reload acts on it.
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

// Engine or not is decided once at load. Crossing the boundary live (a desktop
// resize, a rotating tablet, toggling reduced motion) would leave JS and CSS
// disagreeing, so reload instead. Phones stay on one side in both orientations.
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
