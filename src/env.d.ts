// Globals the page scripts hand to each other.
interface Window {
  // set by scroll.ts, replaced by desktop-engine.ts once the engine runs
  __portfolioScrollTo?: (id: string) => void;
  // set by navigation.ts
  __portfolioSetActive?: (id: string) => void;
  // set inline by BaseLayout.astro on a /work/<slug> visit
  __initialModalSlug?: string;
}
