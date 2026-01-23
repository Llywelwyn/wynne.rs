import { execSync } from 'node:child_process';

export function getGitDate(filePath: string): Date {
  try {
    const timestamp = execSync(`git log -1 --format=%cI -- "${filePath}"`, { encoding: 'utf8' }).trim();
    return timestamp ? new Date(timestamp) : new Date(0);
  } catch {
    return new Date(0);
  }
}
