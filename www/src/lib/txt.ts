import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { sortEntries } from './format';

export interface TxtFile {
  name: string;
  date: Date;
  description?: string;
}

export interface TxtConfig {
  descriptions?: Record<string, string>;
  dates?: Record<string, string>;
}

export function getTxtDir(): string {
  return path.join(process.cwd(), 'public');
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
  const descriptions = config.descriptions || {};
  const dates = config.dates || {};

  const files = fs.readdirSync(txtDir)
    .filter(file => file.endsWith('.txt'))
    .map(name => ({
      name,
      date: dates[name] ? new Date(dates[name]) : new Date(0),
      description: descriptions[name],
    }));
  return sortEntries(files);
}

