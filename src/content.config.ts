import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';
import yaml from 'js-yaml';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.string().optional(),
    related: z.array(z.string()).optional(),
  })
});

const bookmarks = defineCollection({
  loader: file('./content/bookmarks.yaml', {
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

export const collections = { posts, bookmarks };
