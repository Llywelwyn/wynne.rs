import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import yaml from 'js-yaml';
import bookmarksRaw from '../data/bookmarks.yaml?raw';
import fs from 'node:fs';
import path from 'node:path';
import type { APIContext } from 'astro';

interface Bookmark {
  date: string;
  title: string;
  url: string;
}

interface TxtFile {
  name: string;
  mtime: Date;
}

export async function GET(context: APIContext) {
  const posts = await getCollection('posts');
  const bookmarks = yaml.load(bookmarksRaw) as Bookmark[];

  const txtDir = path.join(process.cwd(), 'public/txt');
  const txtFiles: TxtFile[] = fs.existsSync(txtDir)
    ? fs.readdirSync(txtDir)
        .filter(file => file.endsWith('.txt'))
        .map(name => ({
          name,
          mtime: fs.statSync(path.join(txtDir, name)).mtime,
        }))
    : [];

  const items = [
    ...posts.map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      link: `/md/${post.id}`,
      description: post.data.title,
    })),
    ...txtFiles.map(txt => ({
      title: txt.name,
      pubDate: txt.mtime,
      link: `/txt/${txt.name}`,
      description: txt.name,
    })),
    ...bookmarks.map(b => ({
      title: b.title,
      pubDate: new Date(b.date),
      link: b.url,
      description: b.title,
    })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: 'wynne.rs',
    description: '',
    site: context.site ?? 'https://wynne.rs',
    items,
  });
}
