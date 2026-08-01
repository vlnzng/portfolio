import { desktopQuery, prefersReducedMotion } from './media';

declare global {
  interface Window {
    __portfolioScrollTo?: (id: string) => void;
    __portfolioSetActive?: (id: string) => void;
  }
}

const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-section-link]'));
const sections = Array.from(document.querySelectorAll<HTMLElement>('.section'));
const modal = document.getElementById('showcase-modal');

// Keep the address bar in step with the section in view, using replaceState so
// it never pollutes the back-history (Back leaves the page, it doesn't walk
// section-by-section). The hash makes the current section refresh-stable and
// shareable. While a case modal is open the URL belongs to it (/work/<slug>),
// so section syncing stands down. Enabled one tick after load so it can't
// clobber an initial deep link (#about) before the scroll engine restores it.
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

requestAnimationFrame(() => requestAnimationFrame(() => {
  allowUrlSync = true;
}));

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
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
  );

  sections.forEach((section) => observer.observe(section));
}

const sectionIds = sections.map((section) => section.id);

document.addEventListener('keydown', (event) => {
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

export {};
