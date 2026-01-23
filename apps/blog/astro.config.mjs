import { defineConfig } from 'astro/config';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkSlug from 'remark-slug';
import remarkSmartypants from 'remark-smartypants';
import remarkAside from './src/plugins/remark-aside.ts';

export default defineConfig({
  output: 'static',
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
