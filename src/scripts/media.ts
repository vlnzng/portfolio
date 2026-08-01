// The 821px boundary and the reduced-motion switch decide between the desktop
// pan engine and plain vertical scroll. Single source for all scripts; the
// component <style> media queries hardcode the same 820/821 boundary and must
// move in lockstep. Mobile is simply !desktopQuery.matches.
export const desktopQuery = window.matchMedia('(min-width: 821px)');
export const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
export const prefersReducedMotion = reducedMotionQuery.matches;
