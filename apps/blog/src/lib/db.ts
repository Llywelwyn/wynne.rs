import { db, Guestbook, eq, desc } from 'astro:db';

export type GuestbookEntry = typeof Guestbook.$inferSelect;

export async function getApprovedEntries(): Promise<GuestbookEntry[]> {
  return db.select().from(Guestbook).where(eq(Guestbook.approved, true)).orderBy(desc(Guestbook.createdAt));
}

export async function getPendingEntries(): Promise<GuestbookEntry[]> {
  return db.select().from(Guestbook).where(eq(Guestbook.approved, false)).orderBy(desc(Guestbook.createdAt));
}

export async function createEntry(name: string, message: string, url: string | null): Promise<void> {
  await db.insert(Guestbook).values({
    name,
    message,
    url,
    createdAt: new Date(),
    approved: false,
  });
}

export async function approveEntry(id: number): Promise<void> {
  await db.update(Guestbook).set({ approved: true }).where(eq(Guestbook.id, id));
}

export async function deleteEntry(id: number): Promise<void> {
  await db.delete(Guestbook).where(eq(Guestbook.id, id));
}
