import { defineDb, defineTable, column } from 'astro:db';

const Guestbook = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    message: column.text(),
    url: column.text({ optional: true }),
    createdAt: column.date({ default: new Date() }),
    approved: column.boolean({ default: false }),
  },
});

export default defineDb({
  tables: { Guestbook },
});
