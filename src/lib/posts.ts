import type { CollectionEntry } from 'astro:content';
import { DEFAULT_CATEGORY } from './consts';
import { sortEntries } from './format';

export type Post = CollectionEntry<'posts'> & { body?: string };

export function getSlug(postId: string): string {
  const parts = postId.split('/');
  return parts[parts.length - 1];
}

export function resolveRelatedPosts<T extends { id: string }>(
  slugs: string[],
  allPosts: T[],
): T[] {
  const bySlug = new Map(allPosts.map(p => [getSlug(p.id), p]));
  return slugs.flatMap(s => bySlug.get(s) ?? []);
}

export function organizePostsByCategory(posts: Post[]): {
  grouped: Record<string, Post[]>;
  categories: string[];
} {
  const grouped = posts.reduce((acc, post) => {
    const category = post.data.category ?? DEFAULT_CATEGORY;
    if (!acc[category]) acc[category] = [];
    acc[category].push(post);
    return acc;
  }, {} as Record<string, Post[]>);

  const categories = Object.keys(grouped).sort((a, b) => {
    if (a === DEFAULT_CATEGORY) return -1;
    if (b === DEFAULT_CATEGORY) return 1;
    return a.localeCompare(b);
  });

  for (const category of categories) {
    grouped[category] = sortEntries(grouped[category], p => p.data);
  }

  return { grouped, categories };
}
