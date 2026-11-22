// Shared behaviour of the two legal pages.

// Assemble obfuscated email addresses (parts kept in data-attributes), so the
// literal address never appears as one string in the served HTML.
document.querySelectorAll<HTMLAnchorElement>('a[data-mail-user]').forEach((link) => {
  const user = link.dataset.mailUser ?? '';
  const domain = link.dataset.mailDomain ?? '';
  const address = `${user}@${domain}`;
  link.href = `mailto:${address}`;
  const text = link.querySelector<HTMLElement>('[data-mail-text]');
  if (text) text.textContent = address;
});

// With a stored return position (Contact.astro), go back to "/" instead of
// "/#contact": arriving on the fragment made the browser scroll to the top
// of the section, overriding the exact spot scroll.ts restores.
const syncBackLink = (): void => {
  let hasReturnY = false;
  try {
    hasReturnY = sessionStorage.getItem('vl:returnY') != null;
  } catch {
    /* storage blocked — keep the #contact fallback */
  }
  document
    .querySelector<HTMLAnchorElement>('.lg-back')
    ?.setAttribute('href', hasReturnY ? '/' : '/#contact');
};
syncBackLink();

// A bfcache return revives this page, but the stored position may be gone by then.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) syncBackLink();
});

// The logo and the footer's Portfolio link mean "start page", so they drop the
// stored position. Plain clicks only: a modified click opens a new tab, and the
// Back link in this one must keep working.
document
  .querySelectorAll<HTMLAnchorElement>('.lg-mark, .lg-foot-links a[href="/"]')
  .forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      try {
        sessionStorage.removeItem('vl:returnY');
      } catch {
        /* nothing was stored either */
      }
    });
  });
