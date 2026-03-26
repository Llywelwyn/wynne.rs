import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { getSlug, enrichPostsWithDates } from '../lib/md';
import { getTxtFiles } from '../lib/txt';
import { excerpt } from '../lib/format';

export async function GET(context: APIContext) {
  const rawPosts = await getCollection('md');
  const posts = enrichPostsWithDates(rawPosts);
  const txtFiles = getTxtFiles();

  const items = [
    ...posts.map(post => ({
      title: post.data.title,
      pubDate: post.dates.created,
      link: `/${getSlug(post.id)}`,
      description: excerpt((post as any).body) || post.data.title,
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
