import type { CollectionEntry } from 'astro:content';

type Post = CollectionEntry<'md'>;

export function getSlug(postId: string): string {
  const parts = postId.split('/');
  return parts[parts.length - 1];
}

export function sortPosts(posts: Post[]): Post[] {
  return posts.slice().sort((a, b) => {
    if (a.data.pinned && !b.data.pinned) return -1;
    if (!a.data.pinned && b.data.pinned) return 1;
    return b.data.date.getTime() - a.data.date.getTime();
  });
}

export function organizePostsByCategory(posts: Post[]): {
  grouped: Record<string, Post[]>;
  categories: string[];
} {
  const grouped = posts.reduce((acc, post) => {
    const category = post.data.category ?? 'md';
    if (!acc[category]) acc[category] = [];
    acc[category].push(post);
    return acc;
  }, {} as Record<string, Post[]>);

  const categories = Object.keys(grouped).sort((a, b) => {
    if (a === 'md') return -1;
    if (b === 'md') return 1;
    return a.localeCompare(b);
  });

  for (const category of categories) {
    grouped[category] = sortPosts(grouped[category]);
  }

  return { grouped, categories };
}
