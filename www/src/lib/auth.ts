import { getSession } from 'auth-astro/server';

export type Session = { user?: { id?: string; name?: string | null } };

export type AuthResult =
  | { status: 'admin'; session: Session }
  | { status: 'unauthenticated' }
  | { status: 'forbidden' }
  | { status: 'error' };

export async function getAdminSession(request: Request): Promise<AuthResult> {
  let session: Session | null;
  try {
    session = await getSession(request);
  } catch {
    return { status: 'error' };
  }

  if (!session) return { status: 'unauthenticated' };

  if (session.user?.id !== import.meta.env.ADMIN_GITHUB_ID) {
    return { status: 'forbidden' };
  }

  return { status: 'admin', session };
}
