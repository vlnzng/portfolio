import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://valentinlenzing.com', // primary domain (Vercel); .de + www variants redirect here
  // HTML whitespace rules, as before Astro 7. Its 'jsx' default drops the line
  // breaks between inline elements and glues words together across the site.
  compressHTML: true,
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
