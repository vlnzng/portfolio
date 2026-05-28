interface ShowcaseData {
  slug: string;
  title: string;
  subtitle: string;
  year: number;
  role: string;
  type?: string;
  duration?: string;
  tools: string[];
  tags: string[];
  externalLink?: string;
  githubLink?: string;
}

const dataNode = document.getElementById('showcase-data');
const showcases: ShowcaseData[] = dataNode?.textContent ? JSON.parse(dataNode.textContent) : [];

let currentSlug: string | null = null;
let scrollPositionBeforeOpen = 0;

const modal = document.getElementById('showcase-modal');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalClose = document.getElementById('modal-close') as HTMLButtonElement | null;
const modalBody = document.getElementById('modal-body');
const modalMeta = document.getElementById('modal-meta');
const modalFooter = document.getElementById('modal-footer');

function openModal(slug: string): void {
  const data = showcases.find((item) => item.slug === slug);
  const template = document.getElementById(`case-template-${slug}`) as HTMLTemplateElement | null;

  if (!modal || !modalBody || !modalMeta || !modalFooter || !data || !template) return;

  currentSlug = slug;
  scrollPositionBeforeOpen = window.scrollY;

  history.pushState({ modal: slug }, '', `/work/${slug}`);

  const metaItems = [
    data.role,
    data.type,
    data.duration,
    data.tools.join(', '),
    String(data.year),
  ].filter(Boolean);

  modalMeta.innerHTML = `
    <p class="modal__eyebrow">${data.tags.map((tag) => escapeHtml(tag)).join(' &middot; ')}</p>
    <h2 id="modal-title" class="modal__title">${escapeHtml(data.title)}</h2>
    <p class="modal__subtitle">${escapeHtml(data.subtitle)}</p>
    <div class="modal__meta-bar">${metaItems.map((item) => `<span>${escapeHtml(item)}</span>`).join('')}</div>
  `;

  modalBody.replaceChildren(template.content.cloneNode(true));

  const links = [
    data.externalLink ? `<a href="${data.externalLink}" target="_blank" rel="noopener noreferrer">Open live tool</a>` : '',
    data.githubLink ? `<a href="${data.githubLink}" target="_blank" rel="noopener noreferrer">View source on GitHub</a>` : '',
  ].filter(Boolean);

  modalFooter.innerHTML = links.join('');
  modalFooter.hidden = links.length === 0;

  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  modalBody.scrollTop = 0;
  modalClose?.focus();
}

function closeModal(updateUrl = true): void {
  if (!modal || !currentSlug) return;

  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  currentSlug = null;

  if (updateUrl) history.pushState(null, '', '/#work');
  window.scrollTo({ top: scrollPositionBeforeOpen });
}

function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

modalClose?.addEventListener('click', closeModal);
modalBackdrop?.addEventListener('click', closeModal);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal?.getAttribute('aria-hidden') === 'false') {
    closeModal();
  }
});

window.addEventListener('popstate', () => {
  if (modal?.getAttribute('aria-hidden') === 'false') closeModal(false);
});

document.querySelectorAll<HTMLElement>('.showcase-card').forEach((card) => {
  const slug = card.dataset.slug;
  if (!slug) return;

  card.addEventListener('click', () => openModal(slug));
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openModal(slug);
    }
  });
});

const pathMatch = window.location.pathname.match(/^\/work\/([^/]+)\/?$/);
const initialSlug = (window as any).__initialModalSlug ?? pathMatch?.[1];
if (initialSlug) {
  requestAnimationFrame(() => openModal(initialSlug));
}
