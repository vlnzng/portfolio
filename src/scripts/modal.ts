interface ShowcaseData {
  slug: string;
  order: number;
  title: string;
  subtitle: string;
  summary?: string;
  heroCaption?: string;
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
let prevUrl: string | null = null;

const modal = document.getElementById('showcase-modal');
const modalScroll = document.getElementById('modal-scroll');
const modalClose = document.getElementById('modal-close') as HTMLButtonElement | null;
const modalHero = document.getElementById('modal-hero');
const modalBody = document.getElementById('modal-body');
const modalMeta = document.getElementById('modal-meta');
const modalFooter = document.getElementById('modal-footer');

function openModal(slug: string): void {
  const data = showcases.find((item) => item.slug === slug);
  const template = document.getElementById(`case-template-${slug}`) as HTMLTemplateElement | null;

  if (!modal || !modalBody || !modalMeta || !modalFooter || !data || !template) return;

  currentSlug = slug;
  scrollPositionBeforeOpen = window.scrollY;
  // Remember where to return on close so we land exactly where we opened from.
  prevUrl = location.pathname.startsWith('/work/')
    ? '/'
    : `${location.pathname}${location.search}${location.hash}`;

  history.pushState({ modal: slug }, '', `/work/${slug}`);

  const num = String(data.order).padStart(2, '0');

  if (modalHero) {
    const caption = data.heroCaption ?? `${data.title} — key image`;
    modalHero.innerHTML =
      `<div class="wstripe"></div><span class="wcard-cap">${escapeHtml(caption)}</span>`;
  }

  const metaPairs: [string, string | undefined][] = [
    ['Role', data.role],
    ['Type', data.type],
    ['Duration', data.duration],
    ['Tools', data.tools.join(' · ')],
    ['Year', String(data.year)],
  ];

  modalMeta.innerHTML = `
    <span class="cs-num">${escapeHtml(num)}</span>
    <h2 id="modal-title" class="cs-title">${escapeHtml(data.title)}</h2>
    <p class="cs-sub">${escapeHtml(data.summary ?? data.subtitle)}</p>
    <ul class="cs-meta">${metaPairs
      .filter(([, value]) => Boolean(value))
      .map(([key, value]) => `<li><span class="cs-meta-k">${escapeHtml(key)}</span><span class="cs-meta-v">${escapeHtml(value)}</span></li>`)
      .join('')}</ul>
  `;

  modalBody.replaceChildren(template.content.cloneNode(true));

  const ctas = [
    data.externalLink
      ? `<a class="cs-btn cs-btn--primary" href="${data.externalLink}" target="_blank" rel="noopener noreferrer">Open live tool <span class="cs-btn-arrow">&#8599;</span></a>`
      : '',
    data.githubLink
      ? `<a class="cs-btn cs-btn--ghost" href="${data.githubLink}" target="_blank" rel="noopener noreferrer">View source <span class="cs-btn-arrow">&#8599;</span></a>`
      : '',
  ].filter(Boolean);

  modalFooter.innerHTML = ctas.join('');

  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (modalScroll) modalScroll.scrollTop = 0;
  modalClose?.focus();
}

function closeModal(updateUrl = true): void {
  if (!modal || !currentSlug) return;

  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  currentSlug = null;

  if (updateUrl) history.pushState(null, '', prevUrl ?? '/');
  prevUrl = null;
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
