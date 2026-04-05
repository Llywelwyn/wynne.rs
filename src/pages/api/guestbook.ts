import type { APIRoute } from 'astro';
import { createEntry } from '../../lib/db';
import { jsonResponse, errorResponse } from '../../lib/api';
import { isRateLimited } from '../../lib/rate-limit';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (isRateLimited(ip, 3, 60_000)) {
      return errorResponse('Too many requests, try again later', 429);
    }

    const data = await request.json();
    const { name, message, url } = data;

    if (!name || !message) {
      return errorResponse('Name and message are required', 400);
    }

    await createEntry(name.slice(0, 100), message.slice(0, 500), url?.slice(0, 200) || null);

    return jsonResponse({ success: true }, 201);
  } catch {
    return errorResponse('Failed to create entry', 500);
  }
};
