/* Arrival choreography: CSS does the motion, this module only toggles
   .is-in (early, while the panel slides in) and .is-centred (once the visitor
   has arrived — e.g. the process diamond draw). Desktop is driven by the pan
   (scroll.ts calls revealOnPan), mobile by an IntersectionObserver; both reset
   on the way out so revisits re-play. The hero load-in waits for fonts so the
   wordmark write-in never paints with a fallback font. */
import { desktopQuery, prefersReducedMotion } from './media';

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

// panels: 0 hero · 1 about · 2 work · 3 process · 4 contact
const panels = Array.from(document.querySelectorAll<HTMLElement>('.horizontal-track .section'));

/* ---- hero load-in ------------------------------------------------------ */
function heroIn(): void {
  document.body.classList.add('is-loaded');
}

if (prefersReducedMotion) {
  document.body.classList.add('is-loaded');
  panels.forEach((panel) => panel.classList.add('is-in', 'is-centred'));
} else {
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      requestAnimationFrame(() => requestAnimationFrame(heroIn));
    });
  } else {
    requestAnimationFrame(heroIn);
  }
  setTimeout(heroIn, 1400); // safety net if fonts stall
}

/* ---- desktop: pan-driven reveal (called from scroll.ts) ---------------- */
const revealed: boolean[] = [];
const centred: boolean[] = [];

export function revealOnPan(panX: number, vw: number): void {
  if (prefersReducedMotion || !desktopQuery.matches) return;
  for (let i = 1; i < panels.length; i++) {
    // progress of the pan that brings panel i to centre (0 → 1)
    const p = clamp((panX - (i - 1) * vw) / vw, 0, 1);

    if (!revealed[i] && p > 0.15) {
      revealed[i] = true;
      panels[i].classList.add('is-in');
    } else if (revealed[i] && p < 0.05) {
      revealed[i] = false;
      panels[i].classList.remove('is-in');
    }

    if (!centred[i] && p > 0.75) {
      centred[i] = true;
      panels[i].classList.add('is-centred');
    } else if (centred[i] && p < 0.4) {
      centred[i] = false;
      panels[i].classList.remove('is-centred');
    }
  }
}

/* ---- mobile: IntersectionObserver -------------------------------------- */
let io: IntersectionObserver | null = null;

function startIO(): void {
  if (io || !('IntersectionObserver' in window)) return;
  io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
          entry.target.classList.add('is-in');
        } else if (entry.intersectionRatio < 0.04) {
          entry.target.classList.remove('is-in');
        }

        if (entry.isIntersecting && entry.intersectionRatio > 0.42) {
          entry.target.classList.add('is-centred');
        } else if (entry.intersectionRatio < 0.15) {
          entry.target.classList.remove('is-centred');
        }
      });
    },
    // a little bottom margin so a panel begins revealing just before it scrolls
    // fully into view
    { threshold: [0, 0.04, 0.1, 0.15, 0.42], rootMargin: '0px 0px 8% 0px' },
  );
  panels.forEach((panel, i) => {
    if (i > 0) io?.observe(panel);
  });
}

function stopIO(): void {
  io?.disconnect();
  io = null;
}

function syncMode(): void {
  if (!desktopQuery.matches) {
    revealed.length = 0;
    centred.length = 0;
    startIO();
  } else {
    stopIO(); // the pan hook resumes control on the next engine update
  }
}

if (!prefersReducedMotion) {
  syncMode();
  desktopQuery.addEventListener('change', () => {
    panels.forEach((panel, i) => {
      if (i > 0) panel.classList.remove('is-in', 'is-centred');
    });
    revealed.length = 0;
    centred.length = 0;
    syncMode();
  });
}
