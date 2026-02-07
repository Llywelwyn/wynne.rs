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
  const gitDates = getGitDates(filePath);
  return {
    ...post,
    dates: {
      created: post.data.date ?? gitDates.created,
      updated: gitDates.updated,
    },
  };
}

export function enrichPostsWithDates(posts: Post[]): PostWithDates[] {
  return posts.map(enrichPostWithDates);
}

function sortPosts(posts: PostWithDates[], { alphabetically = false } = {}): PostWithDates[] {
  return posts.slice().sort((a, b) => {
    if (a.data.pinned && !b.data.pinned) return -1;
    if (!a.data.pinned && b.data.pinned) return 1;
    if (alphabetically) return a.data.title.localeCompare(b.data.title);
    return b.dates.created.getTime() - a.dates.created.getTime();
  });
}

export function resolveRelatedPosts(
  slugs: string[],
  allPosts: PostWithDates[],
): PostWithDates[] {
  const bySlug = new Map(allPosts.map(p => [getSlug(p.id), p]));
  return slugs.flatMap(s => bySlug.get(s) ?? []);
}

export function organizePostsByCategory(posts: PostWithDates[], { sortAlphabetically = false } = {}): {
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
    grouped[category] = sortPosts(grouped[category], { alphabetically: sortAlphabetically });
  }

  return { grouped, categories };
}
