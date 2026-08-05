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

What's left is mostly **real assets** (wordmark SVG, case 3–4 images), a **final
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
- [x] 404 page, `sitemap.xml` (`/work/` deep links filtered)
- [x] Per-page OG + Twitter meta in `BaseLayout`; `/work/<slug>` deep links carry per-case `<title>`
- [x] **Brand icons + share card from the real V/L marks** — `scripts/generate-assets.mjs`
      (`npm run gen:assets`) reads the committed Figma vectors (`src/assets/brand/{logo,wordmark}.svg`)
      into `favicon.svg` + `favicon.ico` + `apple-touch-icon.png`, and renders a hero-style `og:image`
      (real wordmark vector + portrait, resvg-js). Replaces the leftover **Astro-default favicon** that
      was still shipping. apple-touch-icon link wired in `BaseLayout`.
- [x] Role label unified to **"Product Designer · UX/UI"** across hero / `<title>` / meta / og:image
- [x] Modal CTA builder takes custom-label CTAs (frontmatter `ctas`), falling back to the
      default "Open live tool" / "View on GitHub" buttons

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

### Code-quality pass (July 2026)
- [x] **Token consolidation** — 8 drifted hex values unified into `--color-text-soft/-dim`,
      `--color-faint`, `--color-accent-bright`, `--color-white`; shared `--stripe-surface`
      placeholder gradient; unused scale tokens pruned
- [x] **Dead code removed** — `cardMeta` (schema + frontmatter), unused half of the
      `showcase-data` JSON payload, no-op slug derivation (Astro ids are already clean),
      duplicate CSS blocks, four orphaned placeholder SVGs in `public/`
- [x] **Simplifications** — shared `media.ts` for the 820/821 query trio; `takeReturnY`
      helper; nav active state from real panel ids; module-local `allowUrlSync`;
      stale A/B-test comments resolved (current values kept as final)
- [x] **Head upgrades** — og:image dimensions/alt + og:site_name, favicon.ico fallback link,
      JSON-LD Person
- [x] **Work-card system rework** — subgrid row alignment (number/title/hook/result/foot
      share tracks across all four cards, so uneven copy lengths read as one system);
      result lines rebuilt (strongest proof per case, `·` separator); exactly-twice pill
      system; toolkits aligned with the Process page
- [x] **404 load-in** — code → title → lede → CTA rise, same beat as the main page

---

## Open — toward launch

### A. Real assets (blockers)
- [x] **V/L wordmark + logo as clean SVGs** — the real Figma vectors (`src/assets/brand/`) now
      drive everything: `Wordmark.astro` inlines the wordmark (gold V, calligraphic tails) and it
      morphs → collapsed V/L in the navbar; `Navigation.astro`'s mobile `.nav-home` inlines the
      logo. Replaces the old text-span lockup. *Live-browser fine-tune of morph timing / end
      position / `--wm-h` size still pending — see D.*
- [x] **favicon / apple-touch-icon / `og:image`** — generated from the real marks; see Done.
      (Swap for hand-designed art later if wanted.)

### B. Case studies 3 & 4 — finish the imagery & CTAs
- [x] **ToolSynergy** images — hero, positioning matrix, content system and visual identity are
      all in; the archetypes figure was dropped on purpose (the two `case-q` callouts carry it).
      No placeholders left anywhere on the site
- [x] **Portfolio Website** images — hero (2024 vs 2026), the annotated 2024 site and the
      concept wireframes are in; the "design system" and "scroll engine" figures were dropped
      on purpose, so section 04 now runs on copy alone
- [x] **ToolSynergy CTA** — decided: stays at the one styleguide PDF, no case-presentation CTA
- [x] Card tools/tags settled — `Adobe CC` (matches Process), toolkits now cover 10 of 15
      Process tools (Maze→C1, Jira→C2, Miro→C3, Git→C4, Figma off C3/C4); pill system:
      six competences, each on exactly two cards, every project pair shares exactly one

### C. Copy & content polish
- [x] Proofread / one-voice pass (2026-07-20) — result lines rebuilt around each case's
      strongest proof (unified `·` separator), duplicate award sentence in RunForRecht
      reworded, stale "accent world" claim in the Portfolio case corrected to the real
      one-accent system; BE spelling consistent throughout
- [x] `alt` sweep across the whole site (2026-08-05) — every case figure, card, hero and the
      contact photo checked against the actual image; the childhood-phone portrait, the case 1
      result screen, its card and the guided-questions shot were rewritten from thin labels
      into real descriptions
- [ ] Owner skim at content freeze

### D. Open decisions
- [x] **820px breakpoint — decided: keep 821** — half-screen desktop windows (960–1280px)
      are the common in-between case and should keep the signature horizontal experience;
      portrait tablets are rare for this audience and get a dense but functional engine
      (content fits — clamp()-based type, sections have vertical headroom). Revisit only
      if real-device QA (E) shows actual breakage
- [ ] Wordmark morph fine-tuning (timing / end position) once the SVG lands
- ~~Extract the inline Work section into `Work.astro`~~ — dropped as over-engineering; the
  section is a thin wrapper around `ShowcaseCard` and has no reuse case

### E. Launch QA
- [x] Case-image pass (2026-08-05) — one recipe for all of them: figures at 2000px for the
      `min(1080px, 92vw)` slot, heroes at 2400px, cards at 1200px, WebP with 4:4:4 chroma so
      coloured label text stops smearing. Case 2's three near-lossless exports (2.8–3.8 bpp,
      1.3 MB together) came down to 212 KB; total case payload 2.2 MB → 1.4 MB while most
      figures gained resolution. Measured decode error against the sources: MAE ≤ 1.7,
      p99.9 ≤ 13, so nothing is compression-damaged.
      *Source-limited: `case3/positioning.webp` is only 1157px wide — soft on retina until
      a larger export lands.*
- [ ] Lighthouse 95+ across the board; check LCP / bundle size
- [ ] Keyboard / focus / screen-reader review (modal, nav, skip-link, scroll cue, VL home)
- [ ] Cross-browser + **real-device** check — the scroll engine and mobile hero especially
- [x] Legal: analytics wording in Datenschutz confirmed (§3 covers Vercel Web Analytics +
      Speed Insights, DE + EN); optional lawyer review still open (not a blocker)

### F. Ship
- [ ] Content freeze + final proofread
- [ ] Tag + deploy 1.0
