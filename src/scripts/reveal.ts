/* Arrival choreography (ported from the design handoff's reveal.js).
   Content stays hidden until its panel is "in view", then rides in (CSS does
   the motion; this module only toggles classes). Two drivers:
     - Desktop: the pan position — scroll.ts calls revealOnPan() from the
       engine's onUpdate. Two thresholds per panel:
         .is-in      at >15% panned-in — early enough that content is already
                     settling while the panel slides in (it must never read
                     as "loaded late and slid into empty space"),
         .is-centred at >75% — for set pieces that should only play once the
                     visitor has actually arrived (the process diamonds).
       Both reset when panning back, so revisits re-play the choreography.
     - Mobile (≤820px): an IntersectionObserver, same two thresholds.
   The hero runs a one-time load-in via body.is-loaded (waits for fonts so
   the wordmark "write-in" never paints with a fallback font).
   Reduced motion: everything is shown immediately, nothing animates. */

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobileQuery = window.matchMedia('(max-width: 820px)');

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
  if (prefersReducedMotion || mobileQuery.matches) return;
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
        if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
          entry.target.classList.add('is-in');
        } else if (entry.intersectionRatio < 0.06) {
          entry.target.classList.remove('is-in');
        }

        if (entry.isIntersecting && entry.intersectionRatio > 0.55) {
          entry.target.classList.add('is-centred');
        } else if (entry.intersectionRatio < 0.2) {
          entry.target.classList.remove('is-centred');
        }
      });
    },
    { threshold: [0, 0.06, 0.2, 0.55] },
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
  if (mobileQuery.matches) {
    revealed.length = 0;
    centred.length = 0;
    startIO();
  } else {
    stopIO(); // the pan hook resumes control on the next engine update
  }
}

if (!prefersReducedMotion) {
  syncMode();
  mobileQuery.addEventListener('change', () => {
    panels.forEach((panel, i) => {
      if (i > 0) panel.classList.remove('is-in', 'is-centred');
    });
    revealed.length = 0;
    centred.length = 0;
    syncMode();
  });
}
