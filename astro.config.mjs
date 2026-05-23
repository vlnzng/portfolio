import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://valentin-lenzing.de', // Domain eintragen sobald registriert
  integrations: [mdx()],
});
