# PLAN.md — Roadmap

A rough roadmap toward launch — a guide, not a contract. Reorder, split, or drop items as the
work teaches us. The local design handoff (`design_handoff_portfolio/`, gitignored) remains the
reference for look and motion.

## Where we are

The site is feature-complete and live on `valentinlenzing.com`: all five panels, the
two-phase scroll engine, the case-study modal, legal pages, 404, sitemap and per-page meta.
All four case studies carry final copy and real imagery; the real V/L marks drive the
wordmark, favicon and share card. Two hardening passes have shipped on top: a live-site
audit (Sept 2026) and a review of that work against live (Oct 2026) — see E. Lighthouse on
production (2026-10-19): mobile 95–96 / 100 / 100 / 100, desktop 100 across the board.

A third pass (Nov 2026) hardened layout, pacing, accessibility, performance and the legal
pages — see E.

What's left before tagging 1.0: the **owner's content freeze / proofread** and a **real
screen-reader + real-device** pass (E).

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
- [x] **ToolSynergy** + **Portfolio Website** — final copy and real imagery (see B)

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
- [x] **Engine boundary — revised (Sept/Oct 2026)** — half-screen desktop windows
      (960–1280px) still keep the signature horizontal experience. Portrait touch tablets
      (744–1024px, `pointer: coarse`) now get the stacked layout: on the engine the iPad Pro
      11" hero portrait covered the pitch text and the four cards shrank to ~170px. Landscape
      tablets (1080px+, e.g. iPad Air 1180×820) keep the engine — a first cut at 1180px sent
      them to the stacked layout too, where the short viewport cut the portrait off at the
      fold. The exact string lives in `media.ts` / CLAUDE.md
- [x] **Wordmark morph end state** — the collapsed V/L is now centred on the live nav line
      at every width (`measure()` in `desktop-engine.ts`). Its size follows the lockup up to 1920px,
      then holds against the nav type. The handoff's dip before lift-off stays dropped on
      purpose (see `applyMorph`)
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
- [x] **Device sweep (2026-08-05)** — headless Chrome across 14 viewports (320px → 3440px,
      phones/tablets in both orientations, reduced motion), plus a horizontal-overflow probe
      on all four pages at ten widths. Five defects found and fixed:
      - **Phones in landscape ran the desktop engine** (852×393 etc. pass `min-width: 821px`),
        so hero text collided with the scroll cue and work cards were cut off top and bottom.
        The engine boundary now also requires `min-height: 520px` — see `media.ts`, which is
        the single source; the component queries carry its inverse. Landscape phones get the
        vertical layout with their own two-column hero composition
      - **Mobile page rendered zoomed** — the hero leaked ~51px of document width (portrait
        glow bleeding `-14%` sideways) plus ~9px during the portrait's `scale(1.05)` load-in,
        and mobile browsers answer that by rescaling the whole page. Both clipped; the nav's
        "Contact" is no longer pushed off-screen
      - **Mobile hero measured in `vh` inside a `100svh` panel** — laid out against the
        toolbar-hidden viewport, so it overshot the fold until the address bar collapsed
      - **Process double diamond never closed** — `vector-effect: non-scaling-stroke` on a
        non-uniformly stretched SVG makes Chrome convert `stroke-dasharray` with one averaged
        scale factor, drawing only ~79% of the outline at 2560px (~88% at 1920px). Stroke now
        scales with the box; the dash maths is exact again
      - **`/imprint` overflowed at 320px** — "Verbraucherstreitbeilegung" could not break
      - **Every desktop deep link landed on the hero** — `/#work`, a refresh on any section,
        and "Back to portfolio" from a legal page all reset to the top. Both restore paths run
        one frame after the engine is built, the frame in which ScrollTrigger's pin spacer
        first gives the document its real height; Lenis still held its cached limit of 0 and
        silently clamped every target to it. Forcing `lenis.resize()` before the scroll fixes
        all of them. Mobile was never affected (no Lenis). So the URL sync claimed above is
        only actually shareable/refresh-stable as of this fix
      Also: the vertical layout now goes two-up (four-up ≥1100px) for the work cards, which
      fixes portrait tablets ≤820px and the reduced-motion desktop path
- [x] **Mobile hero stack rebuilt (2026-08-06)** — the hero's three pieces live in three
      components (the portrait isn't even a DOM descendant of the panel), so each sat on its
      own viewport fraction (8vh / 25svh / 54svh) while the copy inside them is sized in px.
      On short phones the fractions collapsed around content that didn't: the gap under the
      wordmark fell from 49px to 9px, and the portrait covered the statement by 31px at
      375×667 and 93px at 320×568. Raising the text above the portrait was not an option —
      `.horizontal-track`'s `will-change: transform` makes its own stacking context, so the
      portrait outside it always wins. The stack is now one chain of custom properties in
      `global.css` (`--hero-wm-top` → `--hero-text-top` → `--hero-portrait-top`), with
      `--wm-h` promoted to a token. Constant 52px under the lockup on every phone, no
      overlap anywhere from 320px up; the portrait absorbs the difference by running past
      the fold, which is what it should do anyway
- [x] **Contact quote capped to the photo column (2026-08-06)** — `.cquote` had
      `max-width: none` (a desktop rule) while only `.cphoto` was capped on mobile, so from
      ~700px up the quote ran 300–541px wider than the image above it
- [x] **Large-screen scale (2026-08-05)** — every type size hit its clamp ceiling by ~1680px
      while panels and card images kept growing, so 4K at 100% zoom read small against its own
      imagery. New `--up` token in `tokens.css`: exactly 17px at 1920 (the design's native
      width, so nothing at or below moves — verified pixel-identical), growing to +25% by
      ~2550px. ~40 sizes opt in, plus the hero text column, contact photo column, modal
      reading column and the wordmark so proportions hold. Legal pages / 404 stay out on
      purpose. Two follow-ups from owner review:
      - **About's measure never grew** — `.ab-body`'s `60ch` resolves against its own
        font-size, and it has none, so the cap stayed pinned to the 16px page default while
        the paragraphs scaled. At 2560 that squeezed the copy to ~55 characters and left 46%
        of the column empty; now a constant ~73 characters at every width
      - **Phase 1 felt laborious on a tall screen** — a wheel notch is a fixed number of
        pixels, so `innerHeight * 1.15` charged 1656px of scrolling on a 1440px display
        against 1242px on a 1080px one, with no sideways motion yet to show for it. The
        height the budget derives from is now capped at 1080
- [x] **Lighthouse 95+** — production, 2026-10-19: mobile 95–96 (three runs) / 100 / 100 /
      100, desktop 100 / 100 / 100 / 100. Remaining hints are deliberate: image "savings"
      assume lower quality than the chosen 80. The engine has loaded on demand since Nov 2026,
      so phones no longer fetch GSAP/Lenis
- [x] **"Back to portfolio" lands exactly (2026-10-19)** — on phones it arrived at the top of
      Contact instead of the legal links: `/#contact` made the browser scroll to the fragment,
      and html's `scroll-behavior: smooth` animated the restore down from the top. With a
      stored position the link now goes to `/`, the restore is instant, and the URL syncs
      back to `/#contact`
- [x] **Hardening pass (Nov 2026)** — short-laptop and half-screen layouts; snappier pan;
      case cards as real links, per-element mobile reveal; WebP-only pictures (build images
      5.9 → 2.9 MB), engine on demand (phone JS ~147 → 11 KB), case images preloaded on
      approach; Case 1 diagrams rebuilt in the v2.0 blue with outlined text
      (`npm run gen:diagrams`); privacy wording and Vercel address corrected; legal home links
      return to the Hero; `gen:assets` no longer needs the local handoff; `npm run check` added
- [ ] Dependency update — `npm audit` reports 13 findings in the build toolchain; the Astro
      and sharp fixes are major upgrades, so they get their own tested pass
- [ ] Keyboard / focus / screen-reader review (modal, nav, skip-link, scroll cue, VL home)
      — headless Chrome now covers: Tab drags the pan along, the modal opens on its body and
      traps focus, X / Escape / Back return focus *and* scroll position to the card (also
      from `/#work`, via the Navigation API), arrow keys scroll the case, skip link skips the
      chrome on every page, `lang="de"` on the German legal half. Still open: a real screen
      reader pass (NVDA or Windows Narrator, VoiceOver)
- [ ] Cross-browser + **real-device** check — still open for what headless Chrome cannot show:
      touch-driving the pinned engine on a real iPad in landscape, Safari's dynamic toolbar
      against the `svh` hero, and the wordmark morph. Closing a case uses the Navigation API,
      which Safari (26.2+, iOS too) and Firefox (147+) support, so it runs the tested path
      there as well
- [x] Legal: analytics wording in Datenschutz confirmed (§3 covers Vercel Web Analytics +
      Speed Insights, DE + EN); optional lawyer review still open (not a blocker)

### F. Ship
- [ ] Content freeze + final proofread
- [ ] Tag + deploy 1.0
