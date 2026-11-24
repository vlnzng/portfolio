import { desktopQuery, prefersReducedMotion } from './media';

const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-section-link]'));
const sections = Array.from(document.querySelectorAll<HTMLElement>('.section'));
const modal = document.getElementById('showcase-modal');

// Keep the hash in step with the section in view (replaceState, so Back leaves
// the page instead of walking sections). Stands down while a case owns the URL,
// and waits for vl:scroll-settled so it can't strip a deep link's hash while the
// engine is still restoring it.
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
  lastSyncedPath = location.pathname + location.hash;
  allowUrlSync = true;
  // catch up with a section that became active while syncing was held — the
  // return from a legal page lands on "/" and restores straight into Contact
  const active = links.find((link) => link.classList.contains('is-active'))?.dataset.sectionLink;
  if (active) syncUrl(active);
}

window.addEventListener('vl:scroll-settled', enableUrlSync, { once: true });
// safety net — if the engine never reports in, the URL should still track
window.setTimeout(enableUrlSync, 2500);

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

// The engine owns the active state. Stacked, a thin band across the viewport
// middle reports the section crossing it, which works however tall a section is
// (a ratio threshold never fires for one taller than the viewport).
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

// Arrow keys step a panel at a time on the engine only; stacked sections are
// taller than the viewport, so arrows keep scrolling normally there.
if (desktopEngine) {
  const sectionIds = sections.map((section) => section.id);

  document.addEventListener('keydown', (event) => {
    // the state check covers focus on <body> (click on non-focusable modal
    // text), where the target check alone would pan the page behind the dialog
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
