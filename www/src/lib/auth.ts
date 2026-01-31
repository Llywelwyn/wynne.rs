import { getSession } from 'auth-astro/server';

type Session = { user?: { id?: string; name?: string | null } };

export function isAdmin(userId: string | undefined): boolean {
  return userId === import.meta.env.ADMIN_GITHUB_ID;
}

export async function requireAdminSession(request: Request): Promise<
  | { session: Session; error: null }
  | { session: null; error: Response | null }
> {
  let session: Session | null;
  try {
    session = await getSession(request);
  } catch {
    return { session: null, error: new Response('Auth not configured', { status: 500 }) };
  }

  if (!session) {
    return { session: null, error: null };
  }

  if (!isAdmin(session.user?.id)) {
    return { session: null, error: new Response('Forbidden', { status: 403 }) };
  }

  return { session, error: null };
}
