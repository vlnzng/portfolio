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
    heroImage: z.string(),
    order: z.number(),
    externalLink: z.string().url().optional(),
    githubLink: z.string().url().optional(),
  }),
});

export const collections = { showcases };
