import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { getSlug } from '../lib/md';
import { getTxtFileNames } from '../lib/txt';

const SUBDOMAINS = [
  'https://penfield.wynne.rs/',
];

export async function GET(context: APIContext) {
  const site = context.site?.origin ?? 'https://wynne.rs';
  const posts = await getCollection('md', ({ data }) => data.draft !== true);
  const txtFiles = getTxtFileNames();

  const urls = [
    '/',
    '/md',
    ...posts.map(post => `/md/${getSlug(post.id)}`),
    '/txt',
    ...txtFiles.map(txt => `/txt/${txt}`),
    '/bookmarks',
    '/guestbook',
  ].map(p => `${site}${p}`);

  return new Response([...urls, ...SUBDOMAINS].join('\n'), {
    headers: { 'Content-Type': 'text/plain' },
  });
}
