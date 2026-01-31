import type { APIRoute } from 'astro';
import { getSession } from 'auth-astro/server';
import { jsonResponse, errorResponse, requireAdmin } from '../../lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const session = await getSession(request);
  const authError = requireAdmin(session);
  if (authError) return authError;

  const hookUrl = import.meta.env.VERCEL_DEPLOY_HOOK;
  if (!hookUrl) {
    return errorResponse('Deploy hook not configured', 500);
  }

  const res = await fetch(hookUrl, { method: 'POST' });
  if (!res.ok) {
    return errorResponse('Failed to trigger deploy', 502);
  }

  return jsonResponse({ success: true });
};
