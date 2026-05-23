// src/scripts/modal.ts
// Modal öffnen/schließen + URL-Update via History API
// Fokus-Falle + Keyboard-Handling

interface ShowcaseData {
  title: string;
  subtitle: string;
  year: number;
  role: string;
  tags: string[];
  externalLink?: string;
}

// ------------------------------------------------------------------
// State
// ------------------------------------------------------------------
let currentSlug: string | null = null;
let scrollPositionBeforeOpen = 0;

// ------------------------------------------------------------------
// DOM References
// ------------------------------------------------------------------
const modal = document.getElementById('showcase-modal');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalClose = document.getElementById('modal-close');
const modalBody = document.getElementById('modal-body');
const modalMeta = document.getElementById('modal-meta');
const modalFooter = document.getElementById('modal-footer');

// ------------------------------------------------------------------
// Öffnen
// ------------------------------------------------------------------
export function openModal(slug: string, data: ShowcaseData): void {
  if (!modal || !modalBody || !modalMeta) return;

  currentSlug = slug;
  scrollPositionBeforeOpen = window.scrollY;

  // URL updaten ohne Seitenneuladen
  history.pushState({ modal: slug }, '', `/work/${slug}`);

  // Inhalt befüllen
  if (modalMeta) {
    modalMeta.innerHTML = `
      <span class="modal__eyebrow">${data.tags.join(' · ')}</span>
      <h2 id="modal-title" class="modal__title">${data.title}</h2>
      <p class="modal__subtitle">${data.subtitle}</p>
    `;
  }

  if (modalFooter && data.externalLink) {
    modalFooter.innerHTML = `
      <a href="${data.externalLink}" target="_blank" rel="noopener noreferrer" class="modal__external-link">
        View live project ↗
      </a>
    `;
  }

  // Modal anzeigen
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Fokus ins Modal
  setTimeout(() => {
    modalClose?.focus();
  }, 100);
}

// ------------------------------------------------------------------
// Schließen
// ------------------------------------------------------------------
export function closeModal(): void {
  if (!modal || !currentSlug) return;

  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  currentSlug = null;

  // URL zurücksetzen
  history.pushState({}, '', '/');

  // Scroll-Position wiederherstellen
  window.scrollTo(0, scrollPositionBeforeOpen);
}

// ------------------------------------------------------------------
// Event Listener
// ------------------------------------------------------------------

// Close-Button
modalClose?.addEventListener('click', closeModal);

// Backdrop-Klick
modalBackdrop?.addEventListener('click', closeModal);

// Escape-Taste
document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape' && modal?.getAttribute('aria-hidden') === 'false') {
    closeModal();
  }
});

// Browser-Zurück
window.addEventListener('popstate', (e: PopStateEvent) => {
  if (modal?.getAttribute('aria-hidden') === 'false') {
    closeModal();
  }
});

// Showcase-Karten klickbar machen
document.querySelectorAll<HTMLElement>('.showcase-card').forEach((card) => {
  const slug = card.dataset.slug;
  if (!slug) return;

  const handleOpen = () => {
    // TODO: Daten aus Content Collection holen
    // Vorerst Platzhalter — wird in index.astro mit echten Daten versorgt
    console.log(`[modal] Opening: ${slug}`);
  };

  card.addEventListener('click', handleOpen);
  card.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpen();
    }
  });
});

// ------------------------------------------------------------------
// Auto-Open bei direktem URL-Aufruf (/work/[slug])
// ------------------------------------------------------------------
if ((window as any).__initialModalSlug) {
  const slug = (window as any).__initialModalSlug as string;
  console.log(`[modal] Auto-opening from URL: ${slug}`);
  // TODO: Daten laden und openModal() aufrufen
}
