import { getCollection } from 'astro:content';
import yaml from 'js-yaml';
import bookmarksRaw from '../content/bookmarks.yaml?raw';
import fs from 'node:fs';
import path from 'node:path';
import type { APIContext } from 'astro';

export const prerender = false;

interface Bookmark {
  date: string;
  title: string;
  url: string;
}

export async function GET(context: APIContext) {
  const site = context.site?.origin ?? 'https://wynne.rs';
  const posts = await getCollection('posts');
  const bookmarks = yaml.load(bookmarksRaw) as Bookmark[];

  const txtDir = path.join(process.cwd(), 'public/txt');
  const txtFiles = fs.existsSync(txtDir)
    ? fs.readdirSync(txtDir).filter(file => file.endsWith('.txt'))
    : [];

  const urls = [
    ...posts.map(post => `/md/${post.id}`),
    ...txtFiles.map(txt => `/txt/${txt}`),
    ...bookmarks.map(b => b.url),
  ];

  const random = urls[Math.floor(Math.random() * urls.length)];
  const redirectUrl = random.startsWith('http') ? random : `${site}${random}`;

  return Response.redirect(redirectUrl, 302);
}
