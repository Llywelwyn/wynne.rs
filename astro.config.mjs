import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import db from '@astrojs/db';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkSlug from 'remark-slug';
import remarkSmartypants from 'remark-smartypants';
import remarkAside from './src/plugins/remark-aside.ts';

export default defineConfig({
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  integrations: [db()],
  markdown: {
    remarkPlugins: [
      remarkGfm,
      remarkDirective,
      remarkAside,
      remarkSlug,
      remarkSmartypants
    ]
  }
});
