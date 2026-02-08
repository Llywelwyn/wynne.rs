import type { CollectionEntry } from 'astro:content';
import { getSlug, resolveRelatedPosts } from './md';

type DndPost = CollectionEntry<'dnd'>;

export { getSlug, resolveRelatedPosts };

export function organizePostsByCategory(posts: DndPost[]): {
  grouped: Record<string, DndPost[]>;
  categories: string[];
} {
  const grouped = posts.reduce((acc, post) => {
    const category = post.data.category ?? 'dnd';
    if (!acc[category]) acc[category] = [];
    acc[category].push(post);
    return acc;
  }, {} as Record<string, DndPost[]>);

  const categories = Object.keys(grouped).sort((a, b) => {
    if (a === 'dnd') return -1;
    if (b === 'dnd') return 1;
    return a.localeCompare(b);
  });

  for (const category of categories) {
    grouped[category] = grouped[category].slice().sort((a, b) => {
      if (a.data.pinned && !b.data.pinned) return -1;
      if (!a.data.pinned && b.data.pinned) return 1;
      return a.data.title.localeCompare(b.data.title);
    });
  }

  return { grouped, categories };
}
