import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const showcases = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/showcases' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    summary: z.string().optional(),
    result: z.string().optional(),
    heroCaption: z.string().optional(),
    cardMeta: z.array(z.string()),
    year: z.number(),
    role: z.string(),
    type: z.string().optional(),
    duration: z.string().optional(),
    tools: z.array(z.string()),
    tags: z.array(z.string()),
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
    cardImage: z.string().optional(),
    cardAlt: z.string().optional(),
    order: z.number(),
    externalLink: z.string().url().optional(),
    githubLink: z.string().url().optional(),
    // Custom modal CTAs (label + url). When present, these replace the default
    // "Open live tool" / "View on GitHub" buttons built from the links above —
    // e.g. ToolSynergy's "View final styleguide" / "View case presentation".
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
