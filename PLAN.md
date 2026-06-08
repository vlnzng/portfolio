# PLAN.md — Roadmap

Rough, ordered next steps. Each milestone is roughly one or a few commits. This is a guide,
not a contract — reorder, split, or skip as the work teaches us. Acceptance criteria for the
finished build live in `design_handoff_portfolio/ARCHITECTURE.md` §7.

## Done

- [x] Project scaffold: Astro + TS, five sections, case-study modal, content collection
- [x] Self-hosted fonts (`@fontsource-variable`, Lora + Inter)
- [x] Vercel Speed Insights + Web Analytics wired in
- [x] Canonical domain set (`valentinlenzing.com`)

## 1. Global assets

- [ ] Final V/L wordmark (SVG) — hero lockup + collapsed monogram
- [ ] Favicon set (svg + ico + apple-touch) derived from the icon
- [ ] Profile photo into `public/`, wired into Hero / About
- [ ] `og:image` — 1200×630 share card

## 2. Static look per section

- [ ] Match Hero · About · Work · Process · Contact to the reference screenshots
- [ ] Swap placeholder media only where real assets now exist

## 3. Animations / interactions (baseline)

- [ ] Reveal / entrance choreography per panel (`reveal.js` logic)
- [ ] Hover states: work cards, process columns, contact

## 4. Side-scroll movement (the signature — riskiest, isolate it)

- [ ] Horizontal pan across sections (GSAP ScrollTrigger + Lenis)
- [ ] Wordmark morph "down" → monogram → home button (constants from `portfolio.js`)
- [ ] Shared portrait glide Hero → About
- [ ] Mobile: native vertical scroll, morph driven by scroll position
- [ ] `prefers-reduced-motion`: everything visible, nothing animated

## 5. Showcases (content + media)

- [ ] Showcase 1 — Fair Monetisation: key image + case figures
- [ ] Showcase 2 — RunForRecht: key image + figures
- [ ] Showcase 3 — ToolSynergy: key image + figures
- [ ] Showcase 4 — Portfolio: before/after + figures
- [ ] Confirm modal text matches the reference 1:1; deep-links `/work/<slug>` work

## 6. SEO + Legal

- [ ] Per-page meta / OG / Twitter, sitemap, canonical
- [ ] Port full Impressum + Datenschutz (decide language: DE vs EN)
- [ ] Privacy note kept consistent with what actually loads (Vercel Analytics)

## 7. Quality pass

- [ ] Lighthouse 95+ across the board; check LCP / bundle size
- [ ] Keyboard / focus / screen-reader review
- [ ] Cross-browser + real-device check

## 8. Launch

- [ ] Enable Analytics + Speed Insights in the Vercel dashboard
- [ ] Final domain / redirect check (.com primary; .de + www → it)
- [ ] Proofread real content
