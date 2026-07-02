import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const index = join('dist', 'index.html');
const fallback = join('dist', '404.html');

if (!existsSync(index)) {
  console.error('dist/index.html not found — run vite build first');
  process.exit(1);
}

copyFileSync(index, fallback);
console.log('SPA fallback: dist/index.html → dist/404.html');
