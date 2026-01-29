import { getCollection } from 'astro:content';
import fs from 'node:fs';
import path from 'node:path';
import type { APIContext } from 'astro';

const SUBDOMAINS = [
  'https://penfield.wynne.rs/',
];

export async function GET(context: APIContext) {
  const site = context.site?.origin ?? 'https://wynne.rs';
  const posts = await getCollection('posts', ({ data }) => data.draft !== true);

  const txtDir = path.join(process.cwd(), 'public/txt');
  const txtFiles = fs.existsSync(txtDir)
    ? fs.readdirSync(txtDir).filter(file => file.endsWith('.txt'))
    : [];

  const urls = [
    '/',
    '/md',
    ...posts.map(post => `/md/${post.id}`),
    '/txt',
    ...txtFiles.map(txt => `/txt/${txt}`),
    '/bookmarks',
    '/guestbook',
  ].map(p => `${site}${p}`);

  return new Response([...urls, ...SUBDOMAINS].join('\n'), {
    headers: { 'Content-Type': 'text/plain' },
  });
}
