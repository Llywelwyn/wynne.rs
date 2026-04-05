import { db, Guestbook } from 'astro:db';

export default async function seed() {
  await db.insert(Guestbook).values([
    {
      id: 1,
      name: 'test',
      message: 'hello from dev',
      url: null,
      createdAt: new Date(),
      approved: true,
    },
  ]);
}
