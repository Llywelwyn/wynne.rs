import type { APIRoute } from 'astro';
import { jsonResponse, errorResponse } from '../../lib/api';
import { getAdminSession } from '../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const auth = await getAdminSession(request);
  if (auth.status !== 'admin') return errorResponse('Unauthorized', 403);

  const hookUrl = import.meta.env.VERCEL_DEPLOY_HOOK;
  if (!hookUrl) return errorResponse('Deploy hook not configured', 500);

  const res = await fetch(hookUrl, { method: 'POST' });
  if (!res.ok) return errorResponse('Failed to trigger deploy', 502);

  return jsonResponse({ success: true });
};
