# PLAN.md — Roadmap

Ordered steps toward launch. A guide, not a contract — reorder, split, or skip as the work
teaches us. The local design handoff (`design_handoff_portfolio/`, gitignored) is the source of
truth for look and behaviour.

**Where we are:** the 1.0 rebuild is done — all five panels, the case-study modal, the legal
pages, and the signature two-phase scroll engine are built faithfully to the handoff and verified
in-browser. What's left is real assets, per-showcase content, copy polish, optional animation
polish, and a launch QA pass.

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

## 1. Real assets — the current blockers

- [ ] **V/L wordmark as a clean SVG** — hero lockup + collapsed monogram (in progress)
- [ ] **Portrait photo** → `public/images/valentin-lenzing-portrait.webp` (today 404 → glow placeholder)
- [ ] Favicon set (VL `svg` + `ico` + apple-touch) — replace the generic mark in `public/`
- [ ] `og:image` — 1200×630 share card → `public/og-image.jpg`
- [ ] Second contact photo (desk / detail shot)

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
- [ ] Fill remaining legal placeholders (address, phone, log retention, date) + legal review
- [ ] Per-page meta / OG / Twitter + `sitemap.xml`

## 6. Missing pages

- [ ] **404 page** (`src/pages/404.astro`) in the site's visual language
- [ ] Optional: extract the inline Work section into `Work.astro` for component consistency

## 7. Quality pass — before launch

- [ ] Lighthouse 95+ across the board; check LCP / bundle size
- [ ] Keyboard / focus / screen-reader review (modal, nav, skip-link, scroll cue)
- [ ] Cross-browser + real-device check — the scroll engine especially

## 8. Launch

- [ ] Final content freeze + proofread
- [ ] Tag + deploy 1.0
