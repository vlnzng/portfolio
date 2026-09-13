import { desktopQuery, prefersReducedMotion } from './media';

declare global {
  interface Window {
    __portfolioScrollTo?: (id: string) => void;
    __portfolioSetActive?: (id: string) => void;
    __portfolioScrollSettled?: boolean;
  }
}

const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-section-link]'));
const sections = Array.from(document.querySelectorAll<HTMLElement>('.section'));
const modal = document.getElementById('showcase-modal');

// Keep the address bar in step with the section in view, using replaceState so
// it never pollutes the back-history (Back leaves the page, it doesn't walk
// section-by-section). The hash makes the current section refresh-stable and
// shareable. While a case modal is open the URL belongs to it (/work/<slug>),
// so section syncing stands down.
//
// Held until the scroll engine reports its initial restore done: arriving on
// /#about starts a 0.9s animated pan whose first frames still read as "hero",
// and syncing those would replaceState the visitor's own deep link down to "/"
// mid-flight. Two frames (what this used to wait) is nowhere near that long.
let allowUrlSync = false;
let lastSyncedPath = location.pathname + location.hash;
function syncUrl(id: string): void {
  if (!allowUrlSync) return;
  if (modal?.getAttribute('aria-hidden') === 'false') return;
  const path = id && id !== 'hero' ? `/#${id}` : '/';
  if (path === lastSyncedPath) return;
  lastSyncedPath = path;
  history.replaceState(history.state, '', path);
}

window.__portfolioSetActive = (id: string) => {
  links.forEach((link) => {
    const isActive = link.dataset.sectionLink === id;
    link.classList.toggle('is-active', isActive && id !== 'hero');
    if (isActive && id !== 'hero') {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
  syncUrl(id);
};

function enableUrlSync(): void {
  if (allowUrlSync) return;
  // Re-read: the restore may have legitimately changed the hash on the way.
  lastSyncedPath = location.pathname + location.hash;
  allowUrlSync = true;
}

if (window.__portfolioScrollSettled) {
  enableUrlSync();
} else {
  window.addEventListener('vl:scroll-settled', enableUrlSync, { once: true });
  // Safety net — if the engine never reports in, the URL should still track.
  window.setTimeout(enableUrlSync, 2500);
}

links.forEach((link) => {
  link.addEventListener('click', (event) => {
    const id = link.dataset.sectionLink;
    if (!id) return;

    event.preventDefault();
    window.__portfolioScrollTo?.(id);
  });
});

// Compact VL home mark (mobile): fade it in once the hero has scrolled out of
// view. It's display:none on desktop, so toggling the class there is a no-op.
const navHome = document.querySelector<HTMLElement>('[data-nav-home]');
if (navHome) {
  const updateNavHome = (): void => {
    navHome.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.55);
  };
  window.addEventListener('scroll', updateNavHome, { passive: true });
  updateNavHome();
}

// On desktop the pan engine owns the active state. On mobile / reduced motion
// it's a center-band scrollspy: a thin band across the viewport middle reports
// whichever section crosses it. This works no matter how tall a section is — a
// plain ratio threshold (e.g. 0.55) never fires for sections taller than the
// viewport, which is exactly why #work (four stacked cards) was never detected.
const desktopEngine = desktopQuery.matches && !prefersReducedMotion;

if (!desktopEngine) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) window.__portfolioSetActive?.(entry.target.id);
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

// Arrow keys step panel-by-panel — but ONLY on the pan engine, where one panel
// is exactly one screen and there is nothing else for an arrow to scroll. In
// the vertical layouts (phone widths, short windows, reduced motion) sections
// run taller than the viewport — #work alone stacks four cards — so hijacking
// ArrowUp/Down there replaced line-by-line scrolling with a jump that skips
// content outright.
if (desktopEngine) {
  const sectionIds = sections.map((section) => section.id);

  document.addEventListener('keydown', (event) => {
    // A dialog owns its own arrow keys. Checking the modal's state as well as
    // the event target covers focus sitting on <body> (a click on non-focusable
    // case-study text), where the target check alone would let the key through
    // to pan the page behind the open modal.
    if (modal?.getAttribute('aria-hidden') === 'false') return;
    const target = event.target as HTMLElement;
    if (target.closest('[role="dialog"]')) return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

    const activeLink = links.find((link) => link.classList.contains('is-active'));
    const currentId = activeLink?.dataset.sectionLink ?? 'hero';
    const currentIndex = Math.max(0, sectionIds.indexOf(currentId));

    let nextIndex = currentIndex;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = Math.min(currentIndex + 1, sectionIds.length - 1);
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = Math.max(currentIndex - 1, 0);
    }

    if (nextIndex !== currentIndex) {
      event.preventDefault();
      window.__portfolioScrollTo?.(sectionIds[nextIndex]);
    }
  });
}

export {};
