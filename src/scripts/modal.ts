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
  heroRatio?: string;
  externalLink?: string;
  githubLink?: string;
  ctas?: { label: string; url: string }[];
}

const dataNode = document.getElementById('showcase-data');
const showcases: ShowcaseData[] = dataNode?.textContent ? JSON.parse(dataNode.textContent) : [];

let currentSlug: string | null = null;
let scrollPositionBeforeOpen = 0;
let openerEl: HTMLElement | null = null;
// True when opening pushed a history entry we own, so closing can pop it back
// off with history.back(). False when the modal came up from a direct visit to
// /work/<slug>, where there is no entry of ours behind it — going back there
// would leave the site entirely.
let ownsHistoryEntry = false;

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

// `push` is false when history already sits on this case — a direct visit to
// /work/<slug>, or the Back/Forward button walking onto that entry.
function openModal(slug: string, push = true): void {
  const data = showcases.find((item) => item.slug === slug);
  const template = document.getElementById(`case-template-${slug}`) as HTMLTemplateElement | null;

  if (!modal || !modalBody || !modalMeta || !modalFooter || !data || !template) return;

  currentSlug = slug;
  // Remember what opened the modal so focus can return there on close (keyboard
  // users land back on the card they activated, not at the top of the page).
  openerEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  scrollPositionBeforeOpen = window.scrollY;

  if (push) {
    history.pushState({ modal: slug }, '', `/work/${slug}/`);
    ownsHistoryEntry = true;
  } else {
    // Record the slug on the entry we are already on, so Back/Forward onto it
    // can tell that this case belongs open.
    history.replaceState({ modal: slug }, '', `/work/${slug}/`);
  }

  if (modalHero) {
    // Real key image when the case ships one; otherwise the deliberate
    // placeholder stripe. The image carries alt text, so it is exposed to AT;
    // the decorative stripe stays hidden.
    if (data.heroImage) {
      const alt = data.heroAlt ?? `${data.title} — overview`;
      // Band takes the image's own ratio, so it fills the width instead of
      // being pillarboxed inside the default 2400/620 frame.
      modalHero.style.setProperty('--cs-hero-ar', data.heroRatio ?? '2400 / 620');
      modalHero.innerHTML = `<img class="cs-hero-img" src="${escapeHtml(data.heroImage)}" alt="${escapeHtml(alt)}" />`;
      modalHero.setAttribute('aria-hidden', 'false');
    } else {
      const caption = data.heroCaption ?? `${data.title} — key image`;
      modalHero.style.removeProperty('--cs-hero-ar');
      modalHero.innerHTML = `<div class="wstripe"></div><span class="wcard-cap">${escapeHtml(caption)}</span>`;
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
          ...(data.externalLink ? [{ label: 'Open live tool', url: data.externalLink }] : []),
          ...(data.githubLink ? [{ label: 'View on GitHub', url: data.githubLink }] : []),
        ];

  modalFooter.innerHTML = ctaList
    .map(
      (cta) =>
        `<a class="cs-btn" href="${escapeHtml(cta.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(cta.label)} <span class="cs-btn-arrow" aria-hidden="true">&#8599;</span></a>`
    )
    .join('');

  document.title = `${data.title} — Valentin Lenzing`;
  setBackgroundInert(true);

  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (modalScroll) modalScroll.scrollTop = 0;

  // Focus the case body, not the close button. The close button is
  // position:fixed OUTSIDE the scroll container, so with it focused the
  // keyboard had no scrollable ancestor to act on and arrow/Page keys moved
  // nothing — the case study was unreadable without a mouse. #modal-body sits
  // inside .cs-scroll, so the same keys scroll the case immediately.
  // preventScroll: the body starts below the hero band, and letting the
  // browser bring it into view would skip past that hero.
  (modalBody ?? modalClose)?.focus({ preventScroll: true });
}

// Make everything behind the modal inert while it is open: removes the
// background from the tab order AND hides it from assistive tech, so the
// dialog is a genuine modal context (no focus escaping behind it).
const inertedEls: HTMLElement[] = [];
function setBackgroundInert(on: boolean): void {
  const main = document.getElementById('main-content');
  if (!main) return;
  if (on) {
    // Both levels: <main>'s own children AND its body-level siblings. The skip
    // link is one of those siblings, and left live it was the one control a Tab
    // from <body> could still reach out to from behind the open dialog.
    const candidates = [...Array.from(document.body.children), ...Array.from(main.children)];
    candidates.forEach((child) => {
      if (child === main || child === modal || !(child instanceof HTMLElement)) return;
      if (child.inert) return;
      child.inert = true;
      inertedEls.push(child);
    });
  } else {
    while (inertedEls.length) inertedEls.pop()!.inert = false;
  }
}

// Hides the dialog. History is NOT touched here — the callers own that, so
// that a close triggered by the Back button doesn't push anything back on.
function closeModal(): void {
  if (!modal || !currentSlug) return;

  currentSlug = null;
  document.title = HOME_TITLE;

  // Lift inert and move focus out BEFORE hiding the dialog from assistive tech:
  // applying aria-hidden to an element that still contains the focused node is
  // ignored by Chrome ("Blocked aria-hidden … because its descendant retained
  // focus") and leaves a screen reader inside a subtree being hidden.
  setBackgroundInert(false);
  document.body.style.overflow = '';
  window.scrollTo({ top: scrollPositionBeforeOpen });

  if (openerEl && document.contains(openerEl)) {
    // preventScroll: we just restored the scroll position, and on the pan
    // engine a plain focus() would ask the engine to re-pan to the card.
    openerEl.focus({ preventScroll: true });
  } else if (document.activeElement instanceof HTMLElement) {
    // Deep-link open — nothing behind to return to, but focus must still leave.
    document.activeElement.blur();
  }
  openerEl = null;

  modal.setAttribute('aria-hidden', 'true');
}

// The X and Escape close by rewinding history, so the entry the open pushed
// doesn't linger: Back used to land on /work/<slug> with nothing happening
// (the popstate handler could only ever close), and every case viewed cost two
// dead Back presses. history.back() pops our entry and the popstate handler
// below does the closing.
function dismissModal(): void {
  if (!currentSlug) return;
  if (ownsHistoryEntry) {
    ownsHistoryEntry = false;
    history.back();
  } else {
    // Opened straight from /work/<slug>: there is no entry of ours to pop, so
    // rewrite this one instead of sending the visitor off the site.
    history.replaceState(null, '', '/');
    closeModal();
  }
}

function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

modalClose?.addEventListener('click', () => dismissModal());

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal?.getAttribute('aria-hidden') === 'false') {
    dismissModal();
  }
});

// Focus trap: keep Tab cycling inside the dialog while it is open.
modal?.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab' || modal.getAttribute('aria-hidden') !== 'false') return;
  const focusables = Array.from(
    modal.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
  if (!focusables.length) {
    event.preventDefault();
    return;
  }
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;

  // Focus starts on #modal-body, which is tabindex="-1" and so not part of the
  // cycle — step into it explicitly rather than letting the browser walk out of
  // the dialog when a case happens to carry no CTA buttons.
  if (!(active instanceof HTMLElement) || !focusables.includes(active)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  } else if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
});

// History is the single source of truth for whether a case is open, so Back and
// Forward both work: Back off a case closes it, Forward onto it opens it again.
window.addEventListener('popstate', () => {
  const state = history.state as { modal?: string } | null;
  const fromPath = location.pathname.match(/^\/work\/([^/]+)\/?$/)?.[1];
  const wanted = state?.modal ?? fromPath ?? null;

  if (wanted && wanted !== currentSlug) {
    openModal(wanted, false);
  } else if (!wanted && currentSlug) {
    ownsHistoryEntry = false;
    closeModal();
  }
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
// until a modal opens — which made the first open feel slow. Warm the cache:
// collect every hero image plus every <img> inside the case templates and kick
// off the requests ahead of time.
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

// Not before the page itself has finished loading. On idle alone this put the
// best part of a megabyte of case imagery on the wire while the hero portrait
// — the LCP element — was still arriving, and on a throttled phone connection
// that is exactly the bandwidth it needs first. Skipped outright when the
// visitor has asked for less data or is on a 2G-class connection, where
// speculative downloads for a case they may never open are simply a cost.
const connection = (
  navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
).connection;
const worthWarming = !connection?.saveData && !/(^|-)2g$/.test(connection?.effectiveType ?? '');

if (worthWarming) {
  const warm = (): void => requestIdle(preloadCaseAssets);
  if (document.readyState === 'complete') warm();
  else window.addEventListener('load', warm, { once: true });
}

const pathMatch = window.location.pathname.match(/^\/work\/([^/]+)\/?$/);
const initialSlug = window.__initialModalSlug ?? pathMatch?.[1];
if (initialSlug) {
  // push = false: the visitor is already ON /work/<slug>, so pushing would
  // duplicate the entry and make the first Back press do nothing.
  requestAnimationFrame(() => openModal(initialSlug, false));
}
