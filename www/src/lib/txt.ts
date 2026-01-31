import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { getGitDate } from '../utils';

export interface TxtFile {
  name: string;
  date: Date;
  pinned: boolean;
}

export interface TxtConfig {
  pinned?: string[];
}

export function getTxtDir(): string {
  return path.join(process.cwd(), 'public/txt');
}

export function loadTxtConfig(): TxtConfig {
  const configPath = path.join(getTxtDir(), 'config.yaml');
  return fs.existsSync(configPath)
    ? yaml.load(fs.readFileSync(configPath, 'utf8')) as TxtConfig
    : {};
}

export function getTxtFiles(): TxtFile[] {
  const txtDir = getTxtDir();
  if (!fs.existsSync(txtDir)) return [];

  const config = loadTxtConfig();
  const pinnedSet = new Set(config.pinned || []);

  return fs.readdirSync(txtDir)
    .filter(file => file.endsWith('.txt'))
    .map(name => ({
      name,
      date: getGitDate(path.join(txtDir, name)),
      pinned: pinnedSet.has(name),
    }))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.date.getTime() - a.date.getTime();
    });
}

export function getTxtFileNames(): string[] {
  const txtDir = getTxtDir();
  if (!fs.existsSync(txtDir)) return [];

  return fs.readdirSync(txtDir).filter(file => file.endsWith('.txt'));
}
