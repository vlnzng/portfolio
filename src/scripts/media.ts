// The engine boundary: desktop pan engine vs stacked scroll. The single source
// for scripts; component <style> blocks repeat the exact string (see CLAUDE.md).
//
// Arms: width for phones; height for landscape phones (~390–440px tall, and 520px
// clears no laptop); pointer for portrait touch tablets (744–1024px), too narrow
// for the four-column pan. Landscape tablets (1080px and up) keep the engine.
//
// JS negates the string instead of asking `min-width: 821px`: page zoom yields
// fractional widths that match neither side.
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
