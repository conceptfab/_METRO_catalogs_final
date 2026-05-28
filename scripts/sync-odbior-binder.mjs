// Single source of truth for acceptance binders.
//
// The canonical binder lives in `docs/odbior-*`. The website serves it from
// `public/odbior-*` (Next.js static files), so the public copy is a GENERATED
// MIRROR — never edit it by hand and it is gitignored. This script regenerates
// each `public/odbior-*` from its `docs/odbior-*` source, removing the
// destination first so deletions in the source propagate (no orphan files).
//
// Wired into `prebuild` (runs on every `next build`, incl. Vercel) and
// `deploy:prod`. Run manually anytime with `npm run docs:sync`.

import { readdirSync, rmSync, cpSync } from 'node:fs';
import { join } from 'node:path';

const DOCS_DIR = 'docs';
const PUBLIC_DIR = 'public';

const binders = readdirSync(DOCS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name.startsWith('odbior-'))
  .map((entry) => entry.name);

if (binders.length === 0) {
  console.log('[sync-odbior-binder] No docs/odbior-* binders found — nothing to sync.');
  process.exit(0);
}

for (const name of binders) {
  const src = join(DOCS_DIR, name);
  const dest = join(PUBLIC_DIR, name);
  rmSync(dest, { recursive: true, force: true });
  cpSync(src, dest, { recursive: true });
  console.log(`[sync-odbior-binder] ${src} -> ${dest}`);
}
