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

export function formatListItem(
  date: Date,
  url: string,
  title: string,
  options?: { pinned?: boolean; suffix?: string; prefix?: string }
): string {
  const pinnedBadge = options?.pinned ? ' [pinned]' : '';
  const suffix = options?.suffix ? ` ${options.suffix}` : '';
  const prefix = options?.prefix ?? '';
  return `<span class="list-meta">${prefix}<span class="muted">${formatDate(date)}</span></span><span class="entry-content"><a href="${url}">${title}</a>${pinnedBadge}${suffix}</span>`;
}

interface Sortable {
  date: Date;
  pinned?: boolean;
}

export function sortByPinnedThenDate<T extends Sortable>(items: T[]): T[] {
  return items.slice().sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.date.getTime() - a.date.getTime();
  });
}
