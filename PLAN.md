# PLAN.md — Roadmap

A rough roadmap toward launch — a guide, not a contract. Reorder, split, or drop items as the
work teaches us. The local design handoff (`design_handoff_portfolio/`, gitignored) remains the
reference for look and motion.

## Where we are

The 1.0 rebuild is complete and most launch infrastructure has landed: all five panels, the
two-phase scroll engine, the case-study modal, the legal pages, the 404, the sitemap, and
per-page meta are built faithfully to the handoff. Beyond that, two big passes are now done:

- **Content** — all four case studies carry their *final* copy and a single, consistent
  card + modal structure. Cases 1–2 (Fair Monetisation, RunForRecht) ship real, optimised
  imagery; cases 3–4 (ToolSynergy, Portfolio Website) have the copy and clean figure
  placeholders, waiting on real images.
- **UX / accessibility / responsive hardening** — a thorough review pass: the engine's
  navigation is now exact and refresh-stable, the modal is a proper accessible dialog, the
  tab title tracks state, and mobile has been reworked end-to-end.

What's left is mostly **real assets** (wordmark SVG, og:image, case 3–4 images), a **final
copy/proofread pass**, and a **launch QA** sweep.

---

## Done

### The 1.0 rebuild & infrastructure
- [x] Astro + TS scaffold, five sections, MDX content collection, case-study modal
- [x] Self-hosted fonts (`@fontsource-variable`, Lora + Inter) — no Google CDN
- [x] Vercel Speed Insights + Web Analytics (code + dashboard)
- [x] Canonical `valentinlenzing.com`; `.de` + `www` redirects
- [x] Flat `#1A1816` palette, single gold accent, square shapes, diamond bullets
- [x] Legal pages (Impressum + Datenschutz) — DE authoritative + EN; real address, Vercel
      retention, "Stand" date; crawler-safe email
- [x] Favicon (svg + ico), 404 page, `sitemap.xml` (`/work/` deep links filtered)
- [x] Per-page OG + Twitter meta in `BaseLayout`; `/work/<slug>` deep links carry per-case `<title>`

### Motion & interaction polish
- [x] Two-phase engine (GSAP/Lenis): wordmark morph → VL home, horizontal pan, shared-portrait
      glide Hero→About, scroll cue, progress bar
- [x] Page load-in choreography + per-panel reveal (`.reveal` + `reveal.ts`), gated behind
      `html.js`; honours `prefers-reduced-motion` and no-JS
- [x] Hero statement swap fused into the scroll cue; wordmark sheen + breath; work-card
      "view case" cursor; process double-diamond draw-in; portrait parallax + breathing halo
- [x] Modal open choreography (hero settle → head/body rise → close fades in)

### Content & case studies
- [x] All four cases on **final copy**, one consistent card + modal structure (head order,
      tools on card, At-a-glance, numbered sections, `case-q` callouts, pull quotes)
- [x] **Fair Monetisation** — real card/hero/figures
- [x] **RunForRecht** — real card, hero, participant + manager screens, process diagram
      (exported/normalised onto `#1A1816`, lossless where needed)
- [x] **ToolSynergy** + **Portfolio Website** — final copy + figure placeholders in place

### UX, accessibility & responsive hardening (recent pass)
- [x] **Engine navigation made exact** — Lenis runs desktop-only (no touch conflict); reload on
      crossing the 821px / reduced-motion boundary; pan math uses the real panel width; nav jumps
      map engine-pos ↔ real scroll so they land precisely; active section by nearest offset
- [x] **URL/section sync** — current section reflected via `replaceState` (scroll + nav clicks),
      refresh-stable and shareable, no back-history spam, stands down while a modal is open
- [x] **Modal a11y** — background set `inert` + focus trap; focus returns to the opening card;
      keyboard-focus ring on close (no stuck-gold); tab title swaps on open/close
- [x] **Page a11y** — real `<h1>`, section headings, `color-scheme: dark`, `theme-color`,
      `env(safe-area-inset-*)` insets, `.case-q` styling, "tools from" wrap fix
- [x] **Mobile rework** — hero recomposed (text top / portrait below); compact VL home mark that
      fades in past the hero; center-band scrollspy so tall sections (e.g. Work) are detected;
      soft scrim so content fades under the nav; tightened section spacing; About is a centred
      flex stack (footer never overlaps); earlier reveal timing

---

## Open — toward launch

### A. Real assets (blockers)
- [ ] **V/L wordmark as a clean SVG** — hero lockup + collapsed monogram (still text spans today)
- [ ] **`og:image`** — 1200×630 dark share card (wordmark + name/role) → `public/og-image.jpg`
      (BaseLayout already points at it, so it 404s until it lands)
- [ ] **apple-touch-icon** (180×180) → `public/` + `<link rel="apple-touch-icon">`

### B. Case studies 3 & 4 — finish the imagery & CTAs
- [ ] **ToolSynergy** images: market-positioning matrix, archetypes, content system, visual
      identity → drop in `_inbox/`, replace the four placeholders (normalise bg to `#1A1816`)
- [ ] **Portfolio Website** images: 2024-vs-now, design system, scroll engine → replace placeholders
- [ ] **ToolSynergy CTAs** — "View final styleguide" / "View case presentation": need URLs/PDFs,
      and the modal CTA builder needs custom labels (today only "Open live tool" / "View on GitHub")
- [ ] Confirm small frontmatter details: ToolSynergy tools (`Adobe CC · Figma`), Portfolio tags
      (`UX · Code · Writing`)

### C. Copy & content polish
- [ ] Final **proofread / one voice pass** across the whole site — hero, About, Process lists,
      Contact, nav/labels, modal microcopy, `alt` text, meta descriptions
- [ ] Sanity-check every `alt` text and meta description once images/copy are final

### D. Open decisions
- [ ] **820px breakpoint** — portrait tablets (834–1024px) currently get the horizontal engine;
      decide whether to lift the threshold so they fall back to vertical
- [ ] Optional: extract the inline Work section into `Work.astro` for component consistency
- [ ] Wordmark morph fine-tuning (timing / end position) once the SVG lands

### E. Launch QA
- [ ] Lighthouse 95+ across the board; check LCP / bundle size (note: several case images are
      lossless and chunky — revisit sizes)
- [ ] Keyboard / focus / screen-reader review (modal, nav, skip-link, scroll cue, VL home)
- [ ] Cross-browser + **real-device** check — the scroll engine and mobile hero especially
- [ ] Legal: confirm the analytics wording in Datenschutz; optional lawyer review (not a blocker)

### F. Ship
- [ ] Content freeze + final proofread
- [ ] Tag + deploy 1.0
