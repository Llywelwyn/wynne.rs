import { execSync } from 'node:child_process';

export function getGitCreationDate(filePath: string): Date {
  try {
    // Get the oldest commit for this file (first commit that added it)
    const timestamp = execSync(
      `git log --follow --diff-filter=A --format=%cI -- "${filePath}"`,
      { encoding: 'utf8' }
    ).trim();
    return timestamp ? new Date(timestamp) : new Date(0);
  } catch {
    return new Date(0);
  }
}

export function getGitLastModifiedDate(filePath: string): Date {
  try {
    const timestamp = execSync(
      `git log -1 --format=%cI -- "${filePath}"`,
      { encoding: 'utf8' }
    ).trim();
    return timestamp ? new Date(timestamp) : new Date(0);
  } catch {
    return new Date(0);
  }
}

export interface GitDates {
  created: Date;
  updated: Date | null; // null if never updated (created === lastModified)
}

export function getGitDates(filePath: string): GitDates {
  const created = getGitCreationDate(filePath);
  const lastModified = getGitLastModifiedDate(filePath);

  // If dates are the same (same commit), there's no update
  const hasUpdate = created.getTime() !== lastModified.getTime();

  return {
    created,
    updated: hasUpdate ? lastModified : null,
  };
}
