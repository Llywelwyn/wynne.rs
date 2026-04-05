import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { getSlug } from '../lib/posts';
import { getTxtFiles } from '../lib/txt';
import { SUBDOMAINS } from '../lib/consts';

export async function GET(context: APIContext) {
  const site = context.site?.origin ?? 'https://wynne.rs';
  const posts = await getCollection('posts');
  const txtFiles = getTxtFiles().map(f => f.name);

  const urls = [
    '/',
    ...posts.map(post => `/${getSlug(post.id)}`),
    ...txtFiles.map(txt => `/${txt}`),
  ].map(p => `${site}${p}`);

  return new Response([...urls, ...SUBDOMAINS].join('\n'), {
    headers: { 'Content-Type': 'text/plain' },
  });
}
