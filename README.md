# Valentin Lenzing — Portfolio

Personal portfolio website. Built with Astro, GSAP, and Lenis.

## Stack

- **Astro 6** — Static Site Generator
- **TypeScript** — Type-safe scripts
- **Vanilla CSS** — Custom design system, no frameworks
- **GSAP + ScrollTrigger** — Scroll-driven animations, horizontal scroll
- **Lenis** — Smooth scroll engine

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:4321`.

## Build

```bash
npm run build
npm run preview   # Preview the production build locally
```

## Structure

```
src/
├── components/     # Astro components (Hero, About, ShowcaseCard, ...)
├── content/        # MDX files for each showcase
├── layouts/        # BaseLayout with HTML wrapper
├── pages/          # index.astro + work/[slug].astro
├── scripts/        # scroll.ts, modal.ts, navigation.ts, reveal.ts, media.ts
└── styles/         # reset.css, tokens.css, global.css
```

## Adding a new showcase

1. Add a new `.mdx` file to `src/content/showcases/`
2. Put the card image in `src/assets/showcases/case<N>/` (optimised by `astro:assets`), the hero and in-body figures in `public/assets/showcases/case<N>/`
3. Set `order` in frontmatter to control position

## Deployment

Deployed automatically via Vercel on every push to `main`.
