# PLAN.md — Roadmap

A living roadmap — a guide, not a contract. Reorder, split, or drop items as the work teaches
us. Finished work is summarised at the end; the full detail lives in the git history.

## Where we are

Live on `valentinlenzing.com` with all five sections, four case studies with real imagery, the
case-study modal, legal pages, 404, sitemap, and custom V/L brand assets.

Technically hardened across three passes (through Nov 2026): responsive short-laptop and tablet
layouts, WebP-only responsive images, ~11 KB of mobile JS (`desktop-engine.ts` loads on demand),
accessible link cards, per-element mobile reveals, and `npm run check`.

From here on it is a **living product**: continuously sharpened for Product Designer (UX/UI)
hiring managers, and open to structural, visual, or tech changes whenever they make it stronger.

---

## Now — Post-Release QA & Maintenance

- [ ] **Production Lighthouse re-check** — run PageSpeed Insights on `valentinlenzing.com` to
      confirm the Nov 2026 hardening pass in production. Baseline from 2026-10-19: mobile
      95–96 / 100 / 100 / 100, desktop 100 across the board.
- [ ] **Real-device & screen-reader check** — test what headless Chrome cannot: iPad landscape
      touch-panning, Safari's dynamic toolbar against `svh`, and a real NVDA / Narrator /
      VoiceOver pass.
- [ ] **Dependency & security pass** — address the `npm audit` findings (Astro and sharp are
      major upgrades, so they get their own tested pass) and migrate the deprecated `z` import
      in `src/content.config.ts` to `astro/zod`, so `npm run check` drops its deprecation hints.
- [ ] **Optional legal review** of `/imprint/` and `/privacy/`:
  - Vercel Web Analytics' 24h request hash against the wording "anonymous" / "no personal
    reference"
  - the 14-month retention figure
  - Vercel's privacy-contact address, verified directly at the source
  - whether `/imprint/` §2 needs a second fast contact channel under § 5 DDG

## Next — Positioning, Copy & Case Studies

Aligned with the updated application materials.

- [ ] **Mission statement & slogan update** — sync Hero, About, and meta copy with the updated
      application documents (new mission statement and, if applicable, a revised slogan).
- [ ] **Trim copy across the site** — tighten About around the new statement and streamline
      Process (shorter, more distinct, less textbook catalogue), so busy recruiters can scan the
      full story in 30–60 seconds.
- [ ] **Case studies v2 & new work** — make existing cases shorter, sharper, and more focused on
      problems and decisions; revisit per-case visual and color storytelling; expand existing
      projects and prepare new case studies. Replace `case3/positioning.webp` (only 1157px wide)
      at higher resolution if Case 3 stays in its current form.

## Later — Features, GitHub & Architecture

Exploratory.

- [ ] **GitHub `README.md` upgrade** — turn the repo front page into a lightweight showcase for
      recruiters and design engineers clicking through from Contact or Case 4 (preview visual,
      architecture and performance highlights, live link).
- [ ] **Small recruiter-friendly features & micro-interactions** — explore targeted additions
      that add real value or craft, e.g. one-click "Copy email" with subtle feedback, "Next
      case →" at the end of a modal, quiet reading progress inside cases.
- [ ] **Architecture, files & UX rethink** — periodically check project structure, components,
      and tooling. Stay open to larger layout, tech, or navigation changes, including
      simplifying the desktop horizontal scroll if real recruiter or peer feedback shows more
      friction than value.

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
