import type { APIRoute } from 'astro';
import { approveEntry, deleteEntry } from '../../../lib/db';
import { jsonResponse, errorResponse } from '../../../lib/api';

export const prerender = false;

export const PATCH: APIRoute = async ({ params }) => {
  const id = parseInt(params.id!, 10);
  if (isNaN(id)) return errorResponse('Invalid ID', 400);

  await approveEntry(id);
  return jsonResponse({ success: true });
};

export const DELETE: APIRoute = async ({ params }) => {
  const id = parseInt(params.id!, 10);
  if (isNaN(id)) return errorResponse('Invalid ID', 400);

  await deleteEntry(id);
  return jsonResponse({ success: true });
};
