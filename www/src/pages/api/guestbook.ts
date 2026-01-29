import type { APIRoute } from 'astro';
import { createEntry } from '../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { name, message, url } = data;

    if (!name || !message) {
      return new Response(JSON.stringify({ error: 'Name and message are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await createEntry(name.slice(0, 100), message.slice(0, 500), url?.slice(0, 200) || null);

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create entry' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
