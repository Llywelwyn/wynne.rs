import { createClient } from '@libsql/client';

export const db = createClient({
  url: import.meta.env.TURSO_DATABASE_URL,
  authToken: import.meta.env.TURSO_AUTH_TOKEN,
});

export interface GuestbookEntry {
  id: number;
  name: string;
  message: string;
  url: string | null;
  created_at: string;
  approved: number;
}

export async function getApprovedEntries(): Promise<GuestbookEntry[]> {
  const result = await db.execute(
    'SELECT * FROM guestbook WHERE approved = 1 ORDER BY created_at DESC'
  );
  return result.rows as unknown as GuestbookEntry[];
}

export async function getPendingEntries(): Promise<GuestbookEntry[]> {
  const result = await db.execute(
    'SELECT * FROM guestbook WHERE approved = 0 ORDER BY created_at DESC'
  );
  return result.rows as unknown as GuestbookEntry[];
}

export async function createEntry(name: string, message: string, url: string | null): Promise<void> {
  await db.execute({
    sql: 'INSERT INTO guestbook (name, message, url) VALUES (?, ?, ?)',
    args: [name, message, url],
  });
}

export async function approveEntry(id: number): Promise<void> {
  await db.execute({
    sql: 'UPDATE guestbook SET approved = 1 WHERE id = ?',
    args: [id],
  });
}

export async function deleteEntry(id: number): Promise<void> {
  await db.execute({
    sql: 'DELETE FROM guestbook WHERE id = ?',
    args: [id],
  });
}
