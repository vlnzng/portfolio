import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://valentinlenzing.com', // primary domain (Vercel); .de + www variants redirect here
  integrations: [mdx()],
});
