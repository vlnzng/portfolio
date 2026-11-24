import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const showcases = defineCollection({
  // Flat only — nested paths would put a "/" in the id, which the /work/<slug>
  // route and modal deep links don't support.
  loader: glob({ pattern: '*.mdx', base: './src/content/showcases' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      subtitle: z.string(),
      summary: z.string().optional(),
      // Gold outcome line on the card — part of the card design, so required.
      result: z.string(),
      tools: z.array(z.string()),
      // Card pills. System: six competences, each on exactly two cards — every
      // pair of projects shares exactly one. Keep the invariant when editing.
      tags: z.array(z.string()),
      heroImage: z.string().optional(),
      heroAlt: z.string().optional(),
      // heroImage's aspect ratio as CSS ("2400 / 620"), adopted by the hero band.
      // Omit it for art drawn at the band's native 2400 / 620 (case 1).
      heroRatio: z.string().optional(),
      // Through astro:assets (responsive WebP srcset). heroImage and the in-body
      // figures stay public/ paths because modal.ts injects them client-side.
      cardImage: image().optional(),
      cardAlt: z.string().optional(),
      order: z.number(),
      externalLink: z.url().optional(),
      githubLink: z.url().optional(),
      // Custom modal CTAs, replacing the defaults built from externalLink /
      // githubLink. `url` is a plain string, not z.url(), so site-relative PDF
      // paths (/assets/showcases/…) work too.
      ctas: z
        .array(
          z.object({
            label: z.string(),
            url: z.string(),
          })
        )
        .optional(),
    }),
});

export const collections = { showcases };
