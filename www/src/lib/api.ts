import { isAdmin } from './auth';

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function errorResponse(message: string, status: number): Response {
  return jsonResponse({ error: message }, status);
}

export function requireAdmin(session: { user?: { id?: string } } | null): Response | null {
  if (!session?.user?.id || !isAdmin(session.user.id)) {
    return errorResponse('Unauthorized', 403);
  }
  return null;
}
