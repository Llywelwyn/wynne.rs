import type { APIRoute } from 'astro';
import { getApprovedEntries } from '../lib/db';

export const prerender = true;

export const GET: APIRoute = async () => {
  let count = 0;
  try {
    const entries = await getApprovedEntries();
    count = entries.length;
  } catch {
    // DB not available
  }
  return new Response(JSON.stringify({ count }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
