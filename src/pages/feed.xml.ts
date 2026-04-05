import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { getSlug, type Post } from '../lib/posts';
import { getTxtFiles } from '../lib/txt';
import { excerpt } from '../lib/format';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts');
  const txtFiles = getTxtFiles();

  const items = [
    ...posts.map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      link: `/${getSlug(post.id)}`,
      description: excerpt((post as Post).body) || post.data.title,
    })),
    ...txtFiles.map(txt => ({
      title: txt.name,
      pubDate: txt.date,
      link: `/${txt.name}`,
      description: txt.description || txt.name,
    })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: 'wynne.rs',
    description: 'personal website of lewis m.w.',
    site: context.site ?? 'https://wynne.rs',
    items,
  });
}
