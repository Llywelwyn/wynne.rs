import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { getSlug, enrichPostsWithDates } from '../lib/md';
import { getTxtFiles } from '../lib/txt';

function excerpt(markdown: string | undefined, maxLen = 160): string {
  if (!markdown) return '';
  return markdown
    .replace(/^#+\s+.*$/gm, '')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_~`]/g, '')
    .replace(/:[a-z]+\[([^\]]*)\]/g, '$1')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

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
