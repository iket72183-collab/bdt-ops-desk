import { cpSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
mkdirSync(join(root, 'dist', 'public'), { recursive: true });
mkdirSync(join(root, 'dist', 'fixtures'), { recursive: true });
cpSync(join(root, 'src', 'public'), join(root, 'dist', 'public'), { recursive: true });
cpSync(join(root, 'src', 'fixtures'), join(root, 'dist', 'fixtures'), { recursive: true });
console.log('Copied static assets to dist/');
