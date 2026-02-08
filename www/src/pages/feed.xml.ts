import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { getSlug, enrichPostsWithDates } from '../lib/md';
import { getTxtFiles } from '../lib/txt';

export async function GET(context: APIContext) {
  const rawPosts = await getCollection('md');
  const posts = enrichPostsWithDates(rawPosts);
  const bookmarks = await getCollection('bookmarks');
  const txtFiles = getTxtFiles();

  const items = [
    ...posts.map(post => ({
      title: post.data.title,
      pubDate: post.dates.created,
      link: `/md/${getSlug(post.id)}`,
      description: post.data.title,
    })),
    ...txtFiles.map(txt => ({
      title: txt.name,
      pubDate: txt.date,
      link: `/${txt.name}`,
      description: txt.name,
    })),
    ...bookmarks.map(b => ({
      title: b.data.title,
      pubDate: b.data.date,
      link: b.data.url,
      description: b.data.title,
    })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: 'wynne.rs',
    description: '',
    site: context.site ?? 'https://wynne.rs',
    items,
  });
}
