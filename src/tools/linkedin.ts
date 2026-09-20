import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface LinkedInDigestItem {
  headline: string;
  soWhat: string;
  tag: string;
}

function fixturePath(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  // Prefer dist/fixtures when running compiled; fall back to src/fixtures for tsx.
  return join(here, '..', 'fixtures', 'linkedin-news.json');
}

export async function getLinkedInNewsDigest(): Promise<{
  generatedAt: string;
  source: 'fixture';
  items: LinkedInDigestItem[];
}> {
  const raw = await readFile(fixturePath(), 'utf8');
  const items = JSON.parse(raw) as LinkedInDigestItem[];
  return {
    generatedAt: new Date().toISOString(),
    source: 'fixture',
    items,
  };
}
