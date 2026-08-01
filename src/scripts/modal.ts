declare global {
  interface Window {
    __initialModalSlug?: string;
  }
}

interface ShowcaseData {
  slug: string;
  title: string;
  subtitle: string;
  summary?: string;
  heroCaption?: string;
  heroImage?: string;
  heroAlt?: string;
  externalLink?: string;
  githubLink?: string;
  ctas?: { label: string; url: string; variant?: 'primary' | 'ghost' }[];
}

const dataNode = document.getElementById('showcase-data');
const showcases: ShowcaseData[] = dataNode?.textContent ? JSON.parse(dataNode.textContent) : [];

let currentSlug: string | null = null;
let scrollPositionBeforeOpen = 0;
let prevUrl: string | null = null;
let openerEl: HTMLElement | null = null;

// Mirrors the homepage <title> in BaseLayout.astro — restored when a modal
// closes so the tab title tracks whether a case study is open.
const HOME_TITLE = 'Valentin Lenzing | Product Designer · UX/UI';

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
  // Remember what opened the modal so focus can return there on close (keyboard
  // users land back on the card they activated, not at the top of the page).
  openerEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  scrollPositionBeforeOpen = window.scrollY;
  // Remember where to return on close so we land exactly where we opened from.
  prevUrl = location.pathname.startsWith('/work/')
    ? '/'
    : `${location.pathname}${location.search}${location.hash}`;

  history.pushState({ modal: slug }, '', `/work/${slug}`);

  if (modalHero) {
    // Real key image when the case ships one; otherwise the deliberate
    // placeholder stripe. The image carries alt text, so it is exposed to AT;
    // the decorative stripe stays hidden.
    if (data.heroImage) {
      const alt = data.heroAlt ?? `${data.title} — overview`;
      modalHero.innerHTML = `<img class="cs-hero-img" src="${escapeHtml(data.heroImage)}" alt="${escapeHtml(alt)}" />`;
      modalHero.setAttribute('aria-hidden', 'false');
    } else {
      const caption = data.heroCaption ?? `${data.title} — key image`;
      modalHero.innerHTML =
        `<div class="wstripe"></div><span class="wcard-cap">${escapeHtml(caption)}</span>`;
      modalHero.setAttribute('aria-hidden', 'true');
    }
  }

  // Head: title, one-line subtitle, then the "at a glance" lead (`summary`,
  // which may hold several paragraphs — split on blank lines).
  const glance = data.summary
    ? `<div class="cs-glance"><p class="cs-glance-label">At a glance</p>${data.summary
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<p class="cs-glance-p">${escapeHtml(p)}</p>`)
        .join('')}</div>`
    : '';

  modalMeta.innerHTML = `
    <h2 id="modal-title" class="cs-title">${escapeHtml(data.title)}</h2>
    <p class="cs-sub">${escapeHtml(data.subtitle)}</p>
    ${glance}
  `;

  modalBody.replaceChildren(template.content.cloneNode(true));

  // Custom CTAs from frontmatter take over when present; otherwise fall back to
  // the default buttons built from externalLink / githubLink.
  const ctaList =
    data.ctas && data.ctas.length
      ? data.ctas
      : [
          ...(data.externalLink
            ? [{ label: 'Open live tool', url: data.externalLink, variant: 'primary' as const }]
            : []),
          ...(data.githubLink
            ? [{ label: 'View on GitHub', url: data.githubLink, variant: 'ghost' as const }]
            : []),
        ];

  modalFooter.innerHTML = ctaList
    .map(
      (cta) =>
        `<a class="cs-btn cs-btn--${cta.variant ?? 'ghost'}" href="${escapeHtml(cta.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(cta.label)} <span class="cs-btn-arrow">&#8599;</span></a>`,
    )
    .join('');

  document.title = `${data.title} — Valentin Lenzing`;
  setBackgroundInert(true);

  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (modalScroll) modalScroll.scrollTop = 0;
  modalClose?.focus();
}

// Make everything behind the modal inert while it is open: removes the
// background from the tab order AND hides it from assistive tech, so the
// dialog is a genuine modal context (no focus escaping behind it).
const inertedEls: HTMLElement[] = [];
function setBackgroundInert(on: boolean): void {
  const main = document.getElementById('main-content');
  if (!main) return;
  if (on) {
    Array.from(main.children).forEach((child) => {
      if (child === modal || !(child instanceof HTMLElement)) return;
      if (child.inert) return;
      child.inert = true;
      inertedEls.push(child);
    });
  } else {
    while (inertedEls.length) inertedEls.pop()!.inert = false;
  }
}

function closeModal(updateUrl = true): void {
  if (!modal || !currentSlug) return;

  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  currentSlug = null;
  document.title = HOME_TITLE;
  setBackgroundInert(false);

  if (updateUrl) history.pushState(null, '', prevUrl ?? '/');
  prevUrl = null;
  window.scrollTo({ top: scrollPositionBeforeOpen });

  // Return focus to the card that opened the modal (inert must be lifted first).
  if (openerEl && document.contains(openerEl)) openerEl.focus();
  openerEl = null;
}

function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

modalClose?.addEventListener('click', () => closeModal());

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal?.getAttribute('aria-hidden') === 'false') {
    closeModal();
  }
});

// Focus trap: keep Tab cycling inside the dialog while it is open.
modal?.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab' || modal.getAttribute('aria-hidden') !== 'false') return;
  const focusables = Array.from(
    modal.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || active === modal)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
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

// Case figures live inside inert <template>s, so the browser never fetches them
// until a modal opens — which made the first open feel slow. Warm the cache on
// idle: collect every hero image plus every <img> inside the case templates and
// kick off the requests ahead of time.
function preloadCaseAssets(): void {
  const urls = new Set<string>();
  showcases.forEach((item) => {
    if (item.heroImage) urls.add(item.heroImage);
  });
  document
    .querySelectorAll<HTMLTemplateElement>('template[id^="case-template-"]')
    .forEach((template) => {
      template.content.querySelectorAll('img').forEach((img) => {
        const src = img.getAttribute('src');
        if (src) urls.add(src);
      });
    });
  urls.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

const requestIdle =
  (window as Window & { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback ??
  ((cb: () => void) => window.setTimeout(cb, 200));
requestIdle(preloadCaseAssets);

const pathMatch = window.location.pathname.match(/^\/work\/([^/]+)\/?$/);
const initialSlug = window.__initialModalSlug ?? pathMatch?.[1];
if (initialSlug) {
  requestAnimationFrame(() => openModal(initialSlug));
}
