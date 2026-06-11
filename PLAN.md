# PLAN.md — Roadmap

Ordered steps toward launch. A guide, not a contract — reorder, split, or skip as the work
teaches us. The local design handoff (`design_handoff_portfolio/`, gitignored) is the source of
truth for look and behaviour.

**Where we are:** the 1.0 rebuild is done and most launch infrastructure has landed — all five
panels, the case-study modal, the legal pages, and the signature two-phase scroll engine are built
faithfully to the handoff and verified in-browser. The portrait and contact photos are real assets
now, the favicon (svg + ico), 404 page, sitemap, and per-page OG/Twitter meta are all in place.
What's left: the V/L wordmark SVG, the `og:image` share card, per-showcase images/figures, a real
copy pass, optional animation polish, the legal fill-in, and a launch QA pass.

## Done — the 1.0 rebuild

- [x] Scaffold: Astro + TS, five sections, content collection, case-study modal
- [x] Self-hosted fonts (`@fontsource-variable`, Lora + Inter) — no Google CDN
- [x] Vercel Speed Insights + Web Analytics (wired in code + enabled in the dashboard)
- [x] Canonical domain `valentinlenzing.com`; `.de` + `www` redirect check
- [x] All five panels rebuilt faithful to the handoff (Hero · About · Work · Process · Contact)
- [x] Flat `#1A1816` palette, gold accents, diamond bullets — consistent across panels
- [x] Case-study modal → handoff `cs-*`: full-screen, hero band, numbered head, meta bar,
      sectioned body, CTAs; scrollable, closes to the exact spot, own URL `/work/<slug>` (deep-links)
- [x] Modal content aligned to the handoff case studies (richer text + meta + short summary)
- [x] Legal pages (Impressum + Datenschutz) — DE authoritative + EN, `lg-*` design, fill-in placeholders
- [x] Crawler-safe email on contact + legal (no contiguous address in the served HTML — verified)
- [x] Two-phase engine (GSAP/Lenis): wordmark morph → VL home button, horizontal pan,
      shared-portrait glide Hero→About, scroll cue, progress bar, active nav — verified in-browser
- [x] `prefers-reduced-motion` + ≤820px fallback to vertical stacking
- [x] Code cleanup: no dead/orphaned code, vestigial schema fields removed
- [x] Real portrait photo (`src/assets/images/portrait.png`) wired via `astro:assets` `<Picture>`
      (avif/webp, responsive widths) — replaces the old 404 → glow placeholder
- [x] Real contact photo (`src/assets/images/contact.jpg`) wired in Contact, gold hover frame
- [x] Favicon `svg` + `ico` in `public/`, SVG referenced in `<head>`
- [x] 404 page (`src/pages/404.astro`) — in-brand editorial dark language, served on any unmatched route
- [x] `sitemap.xml` via `@astrojs/sitemap` (`/work/` deep links filtered out as duplicate content)
- [x] Per-page OG + Twitter meta wired in `BaseLayout` (og:type/url/title/description/image + summary card)

## 1. Real assets — the current blockers

- [ ] **V/L wordmark as a clean SVG** — hero lockup + collapsed monogram (still text spans today)
- [ ] **`og:image`** — 1200×630 share card → `public/og-image.jpg` (BaseLayout already points at
      `/og-image.jpg`, so it 404s until the file lands)
- [ ] apple-touch-icon (180×180) → `public/` + `<link rel="apple-touch-icon">` (svg + ico are done)

## 2. Showcases — one focused pass each (own images, figures, sharpened copy)

Each is its own job: pick + edit a key image, add case figures, and tighten the case text.

- [ ] **Fair Monetisation** — key image, fig. screenshots (domains, question logic, result view), copy
- [ ] **RunForRecht** — key image, figs (interview/persona, wireframes, app screens), copy
- [ ] **ToolSynergy** — key image, figs (personas, positioning, style guide, templates), copy
- [ ] **Portfolio Website** — before/after image, figs (architecture, concept doc), copy
- [ ] Wire case figures into the modal (`cs-figs`) once images exist (markup is ready in the handoff)

## 3. Copy & content — a real editorial pass

- [ ] **Improve every text and element across the whole site** — not just showcases: hero
      pitch/statement, About prose + hook, Process activity lists, Contact lines, nav labels,
      modal microcopy, button labels, `alt` text, meta descriptions. One deliberate voice pass.
- [ ] Final proofread of all real copy

## 4. Animation polish — deferred (the base works without these; all honour reduced-motion)

- [ ] Page load-in: hero entrance (role → pitch → statement stagger) on first paint
- [ ] Reveal / entrance choreography per panel — content rides in on arrival, staggered
- [ ] Hero statement swap on scroll ("Learned the rules." → "Practising the exceptions.")
- [ ] Wordmark hover sheen on the collapsed home button
- [ ] Work-card "view case" cursor-follow on hover
- [ ] Process double-diamond draw-in (static outline today)
- [ ] Shared-portrait subtle parallax / breathing while it rests
- [ ] Modal open/close transition polish (image reveal, content stagger)
- [ ] Wordmark morph fine-tuning (timing / dip / end position) once the SVG lands

## 5. SEO & legal

- [ ] **Vercel Analytics in the Datenschutz** — DECIDED: keep Web Analytics + Speed Insights.
      Wording added to §3 (drafted); confirm in the legal review that it's accurate + sufficient.
- [x] Fill legal placeholders — address, Vercel log retention (3 d / 90 d / 14 mo), Vercel privacy
      link, "Stand" date; phone omitted (email suffices per § 5 DDG); IP no longer claimed as
      anonymised; editor's-note boxes + `.fill`/`.lg-note` CSS removed
- [ ] Optional: a lawyer's review of the final legal texts before launch (nice-to-have, not a blocker)
- [x] Per-page meta / OG / Twitter + `sitemap.xml` (sitemap integration + meta tags wired; real
      per-page descriptions still ride on the copy pass in §3)

## 6. Missing pages

- [x] **404 page** (`src/pages/404.astro`) in the site's visual language
- [ ] Optional: extract the inline Work section into `Work.astro` for component consistency

## 7. Quality pass — before launch

- [ ] Lighthouse 95+ across the board; check LCP / bundle size
- [ ] Keyboard / focus / screen-reader review (modal, nav, skip-link, scroll cue)
- [ ] Cross-browser + real-device check — the scroll engine especially

## 8. Launch

- [ ] Final content freeze + proofread
- [ ] Tag + deploy 1.0
