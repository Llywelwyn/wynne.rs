import type { APIRoute } from 'astro';
import { getSession } from 'auth-astro/server';
import { approveEntry, deleteEntry } from '../../../lib/db';
import { isAdmin } from '../../../lib/auth';

export const prerender = false;

export const PATCH: APIRoute = async ({ params, request }) => {
  const session = await getSession(request);

  if (!session?.user?.id || !isAdmin(session.user.id)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const id = parseInt(params.id!, 10);
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: 'Invalid ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await approveEntry(id);
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const session = await getSession(request);

  if (!session?.user?.id || !isAdmin(session.user.id)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const id = parseInt(params.id!, 10);
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: 'Invalid ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await deleteEntry(id);
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
