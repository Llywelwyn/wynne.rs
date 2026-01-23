import type { APIRoute } from 'astro';
import { getSession } from 'auth-astro/server';
import { isAdmin } from '../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const session = await getSession(request);

  if (!session?.user?.id || !isAdmin(session.user.id)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const hookUrl = import.meta.env.VERCEL_DEPLOY_HOOK;
  if (!hookUrl) {
    return new Response(JSON.stringify({ error: 'Deploy hook not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const res = await fetch(hookUrl, { method: 'POST' });
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Failed to trigger deploy' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
