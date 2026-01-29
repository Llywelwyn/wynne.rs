import { db, Guestbook } from 'astro:db';

export default async function seed() {
  await db.insert(Guestbook).values([
    {
      id: 1,
      name: 'alice',
      message: 'love the site!',
      url: 'https://example.com',
      createdAt: new Date('2026-01-20'),
      approved: true,
    },
    {
      id: 2,
      name: 'bob',
      message: 'great blog posts',
      url: null,
      createdAt: new Date('2026-01-18'),
      approved: true,
    },
  ]);
}
