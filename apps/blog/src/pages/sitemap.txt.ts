import { getCollection } from 'astro:content';
import fs from 'node:fs';
import path from 'node:path';
import type { APIContext } from 'astro';

const SUBDOMAINS = [
  'https://penfield.wynne.rs/',
];

export async function GET(context: APIContext) {
  const site = context.site?.origin ?? 'https://wynne.rs';
  const posts = await getCollection('posts');

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
  ].map(p => `${site}${p}`);

  return new Response([...urls, ...SUBDOMAINS].join('\n'), {
    headers: { 'Content-Type': 'text/plain' },
  });
}
