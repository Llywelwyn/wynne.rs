import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function countWords(text) {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

// Count blog posts and their words
const postsDir = path.join(root, 'content');
const posts = fs.existsSync(postsDir)
  ? fs.readdirSync(postsDir).filter(f => f.endsWith('.md'))
  : [];
let postWords = 0;
for (const post of posts) {
  const content = fs.readFileSync(path.join(postsDir, post), 'utf-8');
  const body = content.replace(/^---[\s\S]*?---/, '');
  postWords += countWords(body);
}

// Count txt files and their words (excluding stats.txt which we're generating)
const publicDir = path.join(root, 'public');
const txtFiles = fs.existsSync(publicDir)
  ? fs.readdirSync(publicDir).filter(f => f.endsWith('.txt') && f !== 'stats.txt')
  : [];
let txtWords = 0;
for (const txt of txtFiles) {
  const content = fs.readFileSync(path.join(publicDir, txt), 'utf-8');
  txtWords += countWords(content);
}

// Count bookmarks
const bookmarksFile = path.join(root, 'content/bookmarks.yaml');
const bookmarks = fs.existsSync(bookmarksFile)
  ? yaml.load(fs.readFileSync(bookmarksFile, 'utf-8')) || []
  : [];

// Guestbook count - read from built JSON file
const guestbookJsonFile = path.join(root, 'dist/client/guestbook-count.json');
let guestbookCount = 0;
if (fs.existsSync(guestbookJsonFile)) {
  const data = JSON.parse(fs.readFileSync(guestbookJsonFile, 'utf-8'));
  guestbookCount = data.count;
}

// Calculate totals
const totalPages = 1 + posts.length + txtFiles.length;

// Read template from public/stats.txt and replace placeholders
const template = fs.readFileSync(path.join(root, 'public/stats.txt'), 'utf-8');

let stats = template
  .replace('[PAGES]', totalPages.toString())
  .replace('[POSTS]', posts.length.toString())
  .replace('[TXT]', txtFiles.length.toString())
  .replace('[BOOKMARKS]', bookmarks.length.toString())
  .replace('[GUESTBOOK]', guestbookCount.toString());

const statsWords = countWords(stats.replace('[WORDS]', '0'));
const totalWords = postWords + txtWords + statsWords;

stats = stats.replace('[WORDS]', totalWords.toString());

// Write to build output
const outputDir = path.join(root, 'dist/client');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
fs.writeFileSync(path.join(outputDir, 'stats.txt'), stats);

console.log('Generated stats.txt');
console.log(`  Words: ${totalWords}`);
console.log(`  Pages: ${totalPages}`);
console.log(`  Posts: ${posts.length}`);
console.log(`  Txt files: ${txtFiles.length}`);
console.log(`  Bookmarks: ${bookmarks.length}`);
console.log(`  Guestbook: ${guestbookCount}`);
