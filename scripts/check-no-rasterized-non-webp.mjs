// scripts/check-no-rasterized-non-webp.mjs
// Failuje, jeśli w public/catalogs istnieje plik .png/.jpg/.jpeg.
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('public/catalogs');
const FORBIDDEN = /\.(png|jpe?g)$/i;

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile()) yield full;
  }
}

const offenders = [];
for await (const f of walk(ROOT)) {
  if (FORBIDDEN.test(f)) offenders.push(path.relative(process.cwd(), f));
}

if (offenders.length) {
  console.error(`\n✖ Found ${offenders.length} non-WebP raster file(s) under public/catalogs:`);
  for (const f of offenders) console.error('  ' + f);
  console.error('\nConvert them to .webp (preserving alpha for transparent layers) and remove the originals.');
  process.exit(1);
}
console.log('✓ public/catalogs is WebP-only');
