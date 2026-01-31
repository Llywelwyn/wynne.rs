import type { APIRoute } from 'astro';
import { getSession } from 'auth-astro/server';
import { approveEntry, deleteEntry } from '../../../lib/db';
import { jsonResponse, errorResponse, requireAdmin } from '../../../lib/api';

export const prerender = false;

export const PATCH: APIRoute = async ({ params, request }) => {
  const session = await getSession(request);
  const authError = requireAdmin(session);
  if (authError) return authError;

  const id = parseInt(params.id!, 10);
  if (isNaN(id)) {
    return errorResponse('Invalid ID', 400);
  }

  await approveEntry(id);
  return jsonResponse({ success: true });
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const session = await getSession(request);
  const authError = requireAdmin(session);
  if (authError) return authError;

  const id = parseInt(params.id!, 10);
  if (isNaN(id)) {
    return errorResponse('Invalid ID', 400);
  }

  await deleteEntry(id);
  return jsonResponse({ success: true });
};
