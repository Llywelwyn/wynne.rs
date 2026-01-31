import path from 'node:path';
import type { CollectionEntry } from 'astro:content';
import { getGitDates, type GitDates } from './git';

type Post = CollectionEntry<'md'>;

export interface PostWithDates extends Post {
  dates: GitDates;
}

export function getSlug(postId: string): string {
  const parts = postId.split('/');
  return parts[parts.length - 1];
}

function getPostFilePath(post: Post): string {
  return path.join(process.cwd(), 'src/content/md', `${post.id}.md`);
}

export function enrichPostWithDates(post: Post): PostWithDates {
  const filePath = getPostFilePath(post);
  return {
    ...post,
    dates: getGitDates(filePath),
  };
}

export function enrichPostsWithDates(posts: Post[]): PostWithDates[] {
  return posts.map(enrichPostWithDates);
}

function sortPosts(posts: PostWithDates[]): PostWithDates[] {
  return posts.slice().sort((a, b) => {
    if (a.data.pinned && !b.data.pinned) return -1;
    if (!a.data.pinned && b.data.pinned) return 1;
    return b.dates.created.getTime() - a.dates.created.getTime();
  });
}

export function organizePostsByCategory(posts: PostWithDates[]): {
  grouped: Record<string, PostWithDates[]>;
  categories: string[];
} {
  const grouped = posts.reduce((acc, post) => {
    const category = post.data.category ?? 'md';
    if (!acc[category]) acc[category] = [];
    acc[category].push(post);
    return acc;
  }, {} as Record<string, PostWithDates[]>);

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
