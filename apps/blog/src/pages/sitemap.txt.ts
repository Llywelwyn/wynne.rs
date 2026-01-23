import { getCollection } from 'astro:content';
import yaml from 'js-yaml';
import bookmarksRaw from '../data/bookmarks.yaml?raw';
import fs from 'node:fs';
import path from 'node:path';
import type { APIContext } from 'astro';

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
    '/',
    '/blog',
    ...posts.map(post => `/blog/${post.id}`),
    '/txt',
    ...txtFiles.map(txt => `/txt/${txt}`),
    '/bookmarks',
    '/guestbook',
  ].map(path => `${site}${path}`);

  return new Response(urls.join('\n'), {
    headers: { 'Content-Type': 'text/plain' },
  });
}
