import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';
import yaml from 'js-yaml';

const md = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    pinned: z.boolean().optional(),
    category: z.string().optional(),
    related: z.array(z.string()).optional(),
  })
});

const dnd = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/dnd' }),
  schema: z.object({
    title: z.string(),
    pinned: z.boolean().optional(),
    category: z.string().optional(),
    related: z.array(z.string()).optional(),
  })
});

const bookmarks = defineCollection({
  loader: file('./src/content/bookmarks.yaml', {
    parser: (text) => {
      const data = yaml.load(text) as Array<Record<string, unknown>>;
      return data.map((item, i) => ({ id: String(i), ...item }));
    },
  }),
  schema: z.object({
    title: z.string(),
    url: z.string().url(),
    date: z.coerce.date(),
  })
});

export const collections = { md, dnd, bookmarks };
