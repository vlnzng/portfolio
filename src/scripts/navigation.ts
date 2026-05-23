// src/scripts/navigation.ts
// Section-Indicator Punkte aktiv setzen + Keyboard-Navigation

// ------------------------------------------------------------------
// Section-Indicator updaten beim Scrollen
// ------------------------------------------------------------------
const dots = document.querySelectorAll<HTMLAnchorElement>('.nav__dot');
const sections = document.querySelectorAll<HTMLElement>('.section');

const observerOptions: IntersectionObserverInit = {
  root: null,
  rootMargin: '0px',
  threshold: 0.5,   // Sektion muss zu 50% sichtbar sein
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const sectionId = entry.target.id;

    dots.forEach((dot) => {
      const isActive = dot.dataset.section === sectionId;
      dot.classList.toggle('nav__dot--active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  });
}, observerOptions);

sections.forEach((section) => observer.observe(section));

// ------------------------------------------------------------------
// Keyboard-Navigation zwischen Sektionen
// ------------------------------------------------------------------
// Auf Desktop: Pfeiltasten navigieren zwischen Sektionen
// (GSAP ScrollTrigger übernimmt die eigentliche Scroll-Bewegung)

const sectionIds = Array.from(sections).map((s) => s.id);

document.addEventListener('keydown', (e: KeyboardEvent) => {
  // Nicht triggern wenn Fokus in Modal oder Input ist
  const target = e.target as HTMLElement;
  if (target.closest('[role="dialog"]')) return;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

  const currentActive = document.querySelector('.nav__dot--active');
  const currentSection = currentActive?.getAttribute('data-section');
  const currentIndex = sectionIds.indexOf(currentSection ?? '');

  let nextIndex = currentIndex;

  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault();
    nextIndex = Math.min(currentIndex + 1, sectionIds.length - 1);
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault();
    nextIndex = Math.max(currentIndex - 1, 0);
  }

  if (nextIndex !== currentIndex) {
    const nextSection = document.getElementById(sectionIds[nextIndex]);
    nextSection?.scrollIntoView({ behavior: 'smooth' });
  }
});
