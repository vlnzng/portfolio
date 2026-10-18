// The engine boundary: desktop pan engine vs plain vertical scroll. Single
// source for all scripts; component <style> media queries hardcode the same
// string and must move in lockstep (see CLAUDE.md). Mobile is simply
// !desktopQuery.matches.
//
// Three arms: width for phones; height because a landscape phone is 850–950px
// wide but only ~390–440px tall (520px clears every phone and no laptop);
// pointer because a portrait touch tablet (744–1024px) is too narrow for the
// four-column pan — it reads better stacked. Tablets in landscape start at
// 1080px (iPad mini 1133, iPad Air 1180) and keep the engine: stacked, their
// short viewport cut the hero portrait off at the fold.
//
// JS negates the CSS string instead of asking its integer complement
// (`min-width: 821px`): page zoom produces fractional widths that match
// neither side, leaving the desktop layout running the mobile scripts.
const mobileQuery = window.matchMedia(
  '(max-width: 820px), (max-height: 519px), (pointer: coarse) and (max-width: 1024px)'
);

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
