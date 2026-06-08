# CLAUDE.md

Working context for Claude Code on this repo. Keep it lean; update it as the project moves.

## What this is

Personal portfolio for **Valentin Lenzing**, Product Designer (UX/UI). It grew out of an
old university project and is being rebuilt into a high-quality portfolio — its main job is
to help land a design role. One page, five sections (Hero · About · Work · Process · Contact),
a case-study modal, and two legal pages. Signature interaction: a two-phase scroll on desktop
(the wordmark morphs "down", then a horizontal pan across the sections); plain vertical scroll
on mobile.

## How to work with me

- **Concept, design, and these docs are guiding directions — not gospel.** They were shaped
  iteratively with AI agents and roughly realized in a design tool. Much of it is a solid
  starting point, not settled truth.
- **Question things. Think them through with me.** If something is more sensible another way,
  propose it instead of following the written version blindly.
- **Don't over-engineer.** Example: a Git branch per feature was an AI add-on, not a
  requirement — often overkill. Apply the same skepticism elsewhere.
- **Iterate** in small, reviewable steps.

## Starting a session

Skim `PLAN.md` for the current state, then look at `src/` to see what actually exists.
Don't assume tasks from the last commit — ask me what to work on.

## Language

Default to **English** everywhere — the point is consistency in code, comments, docs, and
commit messages. One deliberate exception: the legal pages (`imprint`, `privacy`) are written
in **German first** (legally required for a DE provider), with a sharper **English version
below**. On the site they're labelled "Legal Notice" and "Privacy Policy".

## Stack

- **Astro** (static / SSG) + **TypeScript**
- **Lenis** (smooth scroll) + **GSAP / ScrollTrigger** (scroll choreography)
- **Self-hosted fonts** via `@fontsource-variable` (Lora + Inter) — no Google CDN
- **MDX** (`@astrojs/mdx`) for showcase content (content collection)
- Plain CSS with custom properties — no UI or CSS framework

## Setup

```bash
npm install      # Node ≥ 22.12
npm run dev      # dev server
npm run build    # static build → dist/
```

## Where things live

- `src/` — the real implementation. Check it before assuming anything.
- `src/styles/tokens.css` — live design tokens; the authority for colors, fonts, spacing.
- `src/content/showcases/*.mdx` — the four case studies (content, not hardcoded markup).
- `design_handoff_portfolio/` — **local** reference only (gitignored): design intent,
  screenshots of target states, and the exact animation math in `reference/portfolio.js`.
  Reference, not code to copy.
- `PLAN.md` — rough roadmap / next steps.

## Conventions

- **One accent color** (`--color-accent`, #D9B36C). No new colors outside `tokens.css`.
- **Square shapes** — no border-radius on cards/media/modal; only chips and the status dot
  are round.
- **Motion**: get the static layout right first, then add motion. Pull animation constants
  from `reference/portfolio.js` instead of guessing.
- **Accessibility**: honor `prefers-reduced-motion`; keep focus states; modal closes on Escape.
- Initialize Lenis/GSAP **in the browser only** (Astro renders server-side).
- Keep deliberate placeholders (work images, case figures, second contact photo, og:image)
  as clean components until real assets land.
- **Legal pages** (`imprint`, `privacy`): German first, English version below; placeholder
  content for now, to be completed and legally reviewed before launch. Labelled "Legal Notice"
  / "Privacy Policy" on the site.

## Deploy

Vercel — every push to `main` auto-deploys to production. Primary domain `valentinlenzing.com`
(`www.*` and the `.de` variants redirect to it). Static output, no adapter. Treat `main` as
production.

## Git

- Commit in logical chunks (see `PLAN.md` for a rough sequence).
- Use branches when they earn their keep (bigger or risky changes, or to get a Vercel preview)
  — not required for every small change.
- Imperative commit subjects: "Add hero panel", "Wire wordmark morph".
