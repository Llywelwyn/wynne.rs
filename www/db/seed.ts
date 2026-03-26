import { db, Guestbook } from 'astro:db';

export default async function seed() {
  await db.insert(Guestbook).values([
    {
      id: 1,
      name: 'lisek',
      message: ':)',
      url: null,
      createdAt: new Date('2026-03-23'),
      approved: true,
    },
    {
      id: 2,
      name: 'stripes',
      message: 'yay signing',
      url: null,
      createdAt: new Date('2026-03-21'),
      approved: true,
    },
{
      id: 4,
      name: 'Evan',
      message: 'Queue has four silent letters o_O',
      url: null,
      createdAt: new Date('2026-01-23'),
      approved: true,
    },
    {
      id: 5,
      name: 'your good pal chev',
      message: 'howdy howdy',
      url: 'https://youtu.be/dQw4w9WgXcQ?si=lmJDP_U9yTySGD-_',
      createdAt: new Date('2025-11-19'),
      approved: true,
    },
    {
      id: 6,
      name: 'Farofa',
      message: 'Thinking on what to write holdon',
      url: null,
      createdAt: new Date('2025-11-03'),
      approved: true,
    },
{
      id: 10,
      name: 'luna',
      message: 'we love lewis from primal gaming',
      url: null,
      createdAt: new Date('2025-08-23'),
      approved: true,
    },
  ]);
}
