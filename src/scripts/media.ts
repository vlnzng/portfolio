// The engine boundary and the reduced-motion switch decide between the desktop
// pan engine and plain vertical scroll. Single source for all scripts; the
// component <style> media queries hardcode the same boundary string
// (`(max-width: 820px), (max-height: 519px)`) and must move in lockstep.
// Mobile is simply !desktopQuery.matches.
//
// The height half matters as much as the width: a phone in landscape is
// 850–950px wide but only ~390–440px tall, so width alone handed it the
// horizontal engine — hero text collided with the scroll cue and the work
// cards were cut off top and bottom. 520px sits well above every phone in
// landscape and well below every laptop (a 1280x720 screen still leaves
// ~590px of viewport), so nothing that wants the engine loses it.
//
// JS asks the question as the CSS's exact negation rather than as its integer
// complement (`min-width: 821px`). Those two are not the same condition: a
// fractional viewport — page zoom readily produces e.g. 820.67 CSS px — is
// neither ≤ 820 nor ≥ 821, so the page rendered the DESKTOP layout while the
// scripts ran the MOBILE path, leaving a horizontal track that nothing pans.
// Negating the very string the components' media queries use closes that band
// for good: exactly one of the two sides matches at every real number.
const mobileQuery = window.matchMedia('(max-width: 820px), (max-height: 519px)');

export const desktopQuery = {
  get matches(): boolean {
    return !mobileQuery.matches;
  },
  addEventListener(_type: 'change', listener: () => void): void {
    mobileQuery.addEventListener('change', listener);
  },
};

export const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
export const prefersReducedMotion = reducedMotionQuery.matches;
