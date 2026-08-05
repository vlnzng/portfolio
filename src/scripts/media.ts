// The engine boundary and the reduced-motion switch decide between the desktop
// pan engine and plain vertical scroll. Single source for all scripts; the
// component <style> media queries hardcode the same boundary (as its inverse,
// `(max-width: 820px), (max-height: 519px)`) and must move in lockstep.
// Mobile is simply !desktopQuery.matches.
//
// The height half matters as much as the width: a phone in landscape is
// 850–950px wide but only ~390–440px tall, so width alone handed it the
// horizontal engine — hero text collided with the scroll cue and the work
// cards were cut off top and bottom. 520px sits well above every phone in
// landscape and well below every laptop (a 1280x720 screen still leaves
// ~590px of viewport), so nothing that wants the engine loses it.
export const desktopQuery = window.matchMedia('(min-width: 821px) and (min-height: 520px)');
export const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
export const prefersReducedMotion = reducedMotionQuery.matches;
