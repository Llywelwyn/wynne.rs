import { getCollection } from 'astro:content';
import fs from 'node:fs';
import path from 'node:path';
import type { APIContext } from 'astro';

export const prerender = false;

export async function GET(context: APIContext) {
  const site = context.site?.origin ?? 'https://wynne.rs';
  const posts = await getCollection('posts', ({ data }) => data.draft !== true);
  const bookmarks = await getCollection('bookmarks');

  const txtDir = path.join(process.cwd(), 'public/txt');
  const txtFiles = fs.existsSync(txtDir)
    ? fs.readdirSync(txtDir).filter(file => file.endsWith('.txt'))
    : [];

  const urls = [
    ...posts.map(post => `/md/${post.id}`),
    ...txtFiles.map(txt => `/txt/${txt}`),
    ...bookmarks.map(b => b.data.url),
  ];

  const random = urls[Math.floor(Math.random() * urls.length)];
  const redirectUrl = random.startsWith('http') ? random : `${site}${random}`;

  return Response.redirect(redirectUrl, 302);
}
