# PLAN.md — Roadmap

A living roadmap — a guide, not a contract. Reorder, split, or drop items as the work teaches
us. Finished work is summarised at the end; the full detail lives in the git history.

## Where we are

Live on `valentinlenzing.com` with all five sections, four case studies with real imagery, the
case-study modal, legal pages, 404, sitemap, and custom V/L brand assets.

Technically hardened across three passes and a cleanup (through Nov 2026): responsive
short-laptop and tablet layouts, WebP-only responsive images, ~12 KB of mobile JS
(`desktop-engine.ts` loads on demand), accessible link cards, per-element mobile reveals, and
an automated `npm run verify`. Production Lighthouse: mobile 98 / 100 / 100 / 100, desktop 100
across the board.

From here on it is a **living product**: continuously sharpened for Product Designer (UX/UI)
hiring managers, and open to structural, visual, or tech changes whenever they make it stronger.

---

## Now — Post-Release QA & Maintenance

**System-verified** by `npm run verify` before every release: a strict `astro check` (0 errors,
warnings and hints), the build, and checks on `dist/` — internal links and assets resolve
(case images and PDFs included), the engine boundary string matches `media.ts` everywhere
(the shipped CSS included), no AVIF, at most 25 KB of eager JS on `/`, outlined text in the case
SVGs, no block content inside a `<button>`.

- [x] **Production Lighthouse re-check** — confirmed on 2026-11-23 and 2026-11-24: mobile
      98 / 100 / 100 / 100, desktop 100 / 100 / 100 / 100. This is the baseline now.
- [x] **Major dependency upgrades** — Astro 7, `@astrojs/mdx` 8 and sharp 0.35 (2026-11-24);
      `npm audit` reports 0 vulnerabilities. Three fixes keep the output as before:
      `compressHTML: true` (the new `'jsx'` default glued words together), real CSS targets
      (the new minifier rewrote media queries as ranges) and a prefixed-first
      `backdrop-filter` (the minifier dropped the standard one). A headless check of every
      computed style against the Astro 6 build found no visible change.

**Still manual or external:**

- [ ] **Real-device & screen-reader check** — test what headless Chrome cannot: iPad landscape
      touch-panning, Safari's dynamic toolbar against `svh`, and a real NVDA / Narrator /
      VoiceOver pass.
- [ ] **Optional legal review** of `/imprint/` and `/privacy/`:
  - Vercel Web Analytics' 24h request hash against the wording "anonymous" / "no personal
    reference"
  - the 14-month retention figure
  - Vercel's privacy-contact address, verified directly at the source
  - whether `/imprint/` §2 needs a second fast contact channel under § 5 DDG

## Next — Positioning, Copy, README & Case Studies

Aligned with the updated application materials, in this order.

1. [ ] **Mission statement, slogan & About/Process tightening** — sync Hero, About, Process, and
       meta copy with the updated application materials: shorter and more distinct, so busy
       recruiters can scan the full story in 30–60 seconds.
2. [ ] **GitHub `README.md` upgrade** — turn the repo front page into a lightweight showcase for
       recruiters and design engineers clicking through from Contact or Case 4 (preview visual,
       architecture and performance highlights, live link).
3. [ ] **Case studies v2 & copy trim** — make existing cases shorter, sharper, and more focused
       on problems and decisions; revisit per-case visual and color storytelling; expand
       existing work and prepare new case studies. Replace `case3/positioning.webp` (only
       1157px wide) at higher resolution if Case 3 keeps it.

## Later — Features & Architecture

Exploratory.

1. [ ] **Small recruiter-friendly features & micro-interactions** — e.g. one-click "Copy email"
       with subtle feedback, "Next case →" at the end of a modal, quiet reading progress inside
       cases.
2. [ ] **Ongoing UX & architecture evolution** — the first code and architecture cleanup is done
       (Nov 2026). Stay open to larger layout, tech, or navigation changes, including
       simplifying the desktop horizontal scroll if real recruiter feedback points there.

---

## Shipped milestones

- **1.0 rebuild (mid 2026):** Astro 6 + TS, five panels, two-phase scroll engine, MDX case
  studies, self-hosted Lora/Inter fonts, legal pages, real V/L SVG marks and share card.
- **Live audits & polish (Sept–Oct 2026):** exact engine navigation, URL/section sync, modal
  `inert` and focus trap, mobile rework, `--up` 4K scale, Lighthouse 95+ mobile / 100 desktop.
- **Case 1 v2.0 & hardening pass (Nov 2026):** Fair Monetisation v2.0 copy and screenshots, blue
  outlined SVG diagrams; short-laptop and tablet layout hardening; centred V/L end state; link
  cards and per-element mobile reveal; WebP-only pictures (5.9 → 2.9 MB) and on-demand desktop
  engine (phone JS ~147 → 11 KB); legal and tooling cleanup (`npm run check`).
- **Cleanup & automated checks (Nov 2026):** dead code, unused tokens and duplicate rules
  removed; site facts in `src/data/site.ts` and one `LegalLayout`; comments cut by a third
  and corrected; `npm run verify`; non-breaking `npm audit` fixes; production Lighthouse 98
  mobile / 100 desktop. Then the major upgrade to Astro 7, `@astrojs/mdx` 8 and sharp 0.35,
  with a clean `npm audit` and no visible change.
