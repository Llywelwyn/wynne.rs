import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { getSlug } from '../lib/md';
import { getTxtFileNames } from '../lib/txt';

export const prerender = false;

export async function GET(context: APIContext) {
  const site = context.site?.origin ?? 'https://wynne.rs';
  const posts = await getCollection('md');
  const bookmarks = await getCollection('bookmarks');
  const txtFiles = getTxtFileNames();

  const urls = [
    ...posts.map(post => `/md/${getSlug(post.id)}`),
    ...txtFiles.map(txt => `/${txt}`),
    ...bookmarks.map(b => b.data.url),
  ];

  const random = urls[Math.floor(Math.random() * urls.length)];
  const redirectUrl = random.startsWith('http') ? random : `${site}${random}`;

  return Response.redirect(redirectUrl, 302);
}
