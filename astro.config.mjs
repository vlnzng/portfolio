import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://valentinlenzing.com', // primary domain (Vercel); .de + www variants redirect here
  // HTML whitespace rules, as before Astro 7. Its 'jsx' default drops the line
  // breaks between inline elements and glues words together across the site.
  compressHTML: true,
  vite: {
    build: {
      // Astro builds for 'esnext', so without targets the CSS minifier assumes
      // the newest browsers: it rewrites media queries as ranges (width<=820px),
      // which Safari before 16.4 ignores, and drops prefixes older Safari needs.
      // Real targets ship the engine boundary as written in media.ts.
      cssTarget: ['chrome111', 'edge111', 'firefox114', 'safari16', 'ios16'],
    },
  },
  integrations: [
    mdx(),
    sitemap({
      // The /work/<slug> routes serve the homepage HTML (modal opens via JS),
      // so they're duplicate content for crawlers — keep them out. Only the
      // genuinely distinct pages belong in the sitemap.
      filter: (page) => !/\/work\//.test(page),
    }),
  ],
});
