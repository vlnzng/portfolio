import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const showcases = defineCollection({
  // Flat only — nested paths would put a "/" in the id, which the /work/<slug>
  // route and modal deep links don't support.
  loader: glob({ pattern: '*.mdx', base: './src/content/showcases' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    summary: z.string().optional(),
    // Gold outcome line on the card — part of the card design, so required.
    result: z.string(),
    heroCaption: z.string().optional(),
    tools: z.array(z.string()),
    // Card pills. System: six competences, each on exactly two cards — every
    // pair of projects shares exactly one. Keep the invariant when editing.
    tags: z.array(z.string()),
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
    cardImage: z.string().optional(),
    cardAlt: z.string().optional(),
    order: z.number(),
    externalLink: z.string().url().optional(),
    githubLink: z.string().url().optional(),
    // Custom modal CTAs — when present they replace the default buttons
    // built from externalLink / githubLink.
    ctas: z
      .array(
        z.object({
          label: z.string(),
          url: z.string().url(),
          variant: z.enum(['primary', 'ghost']).optional(),
        }),
      )
      .optional(),
  }),
});

export const collections = { showcases };
