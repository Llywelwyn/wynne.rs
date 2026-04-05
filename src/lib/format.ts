export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function excerpt(markdown: string | undefined, maxLen = 160): string {
  if (!markdown) return '';
  return markdown
    .replace(/^#+\s+.*$/gm, '')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_~`]/g, '')
    .replace(/:[a-z]+\[([^\]]*)\]/g, '$1')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

export function formatDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = String(date.getFullYear()).slice(-2);
  return `${d}/${m}/${y}`;
}

export function wordCount(markdown: string | undefined): string {
  if (!markdown) return '';
  const words = markdown
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/^#+\s+.*$/gm, '')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_~`]/g, '')
    .replace(/:[a-z]+\[([^\]]*)\]/g, '$1')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  if (words < 100) return `${words} words`;
  const mins = Math.ceil(words / 200);
  return `${mins} min`;
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function formatListItem(
  date: Date,
  url: string,
  title: string,
  options?: { suffix?: string }
): string {
  const suffixHtml = options?.suffix ? `<span class="entry-suffix muted">${options.suffix}</span>` : '';
  return `<span class="list-meta"><span class="muted">${formatDate(date)}</span></span><span class="entry-content"><a href="${url}" title="${title}">${title}</a>${suffixHtml}</span>`;
}

interface Sortable {
  date: Date;
}

export function sortEntries<T>(items: T[], key?: (item: T) => Sortable): T[] {
  const get = key ?? (item => item as unknown as Sortable);
  return items.slice().sort((a, b) => get(b).date.getTime() - get(a).date.getTime());
}
