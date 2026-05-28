declare global {
  interface Window {
    __portfolioScrollTo?: (id: string) => void;
    __portfolioSetActive?: (id: string) => void;
  }
}

const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-section-link]'));
const sections = Array.from(document.querySelectorAll<HTMLElement>('.section'));

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
};

links.forEach((link) => {
  link.addEventListener('click', (event) => {
    const id = link.dataset.sectionLink;
    if (!id) return;

    event.preventDefault();
    window.__portfolioScrollTo?.(id);
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) window.__portfolioSetActive?.(entry.target.id);
    });
  },
  { threshold: 0.55 },
);

sections.forEach((section) => observer.observe(section));

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
