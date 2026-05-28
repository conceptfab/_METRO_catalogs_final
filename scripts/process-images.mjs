#!/usr/bin/env node

/**
 * process-images.mjs
 *
 * One ring to rule them all: runs every image-related script in the right
 * order and prints a single summary report at the end.
 *
 * Pipeline:
 *   1. assets:check       — fail if any non-WebP raster slipped into public/catalogs/
 *   2. recompress:gallery — q=82 recompress on gallery base files (idempotent)
 *   3. thumbnails         — generate -Nw responsive variants + rebuild manifest
 *
 * The final report shows: file counts per type, total disk usage,
 * manifest entries, and per-step delta vs. the snapshot taken before.
 *
 * Usage:
 *   node scripts/process-images.mjs
 *   node scripts/process-images.mjs --force   # forwards to thumbnails + recompress
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { pathsFromScript } from './lib/image-utils.mjs';

const { ROOT } = pathsFromScript(import.meta.url);
const CATALOGS = path.join(ROOT, 'public', 'catalogs');
const MANIFEST = path.join(ROOT, 'src', 'generated', 'responsive-image-manifest.json');

const force = process.argv.includes('--force');

const c = {
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
};

function rule(label) {
  const line = '━'.repeat(56);
  console.log(`\n${c.cyan(line)}`);
  if (label) console.log(c.bold(c.cyan(`  ${label}`)));
  if (label) console.log(c.cyan(line));
}

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function fmtDelta(before, after) {
  const d = after - before;
  if (d === 0) return c.dim('±0');
  if (d < 0) return c.green(`−${fmtBytes(-d)}`);
  return c.yellow(`+${fmtBytes(d)}`);
}

async function* walk(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile()) yield full;
  }
}

function isVariant(name) {
  return /-\d+w\.\w+$/.test(name);
}

async function inventory() {
  const stats = {
    bases: 0,
    variants: 0,
    videos: 0,
    other: 0,
    totalBytes: 0,
    perCatalog: {},
  };

  let catalogDirs = [];
  try {
    const entries = await fs.readdir(CATALOGS, { withFileTypes: true });
    catalogDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return stats;
  }

  for (const catalog of catalogDirs) {
    stats.perCatalog[catalog] = { bases: 0, variants: 0, videos: 0, bytes: 0 };
    for await (const file of walk(path.join(CATALOGS, catalog))) {
      const size = (await fs.stat(file)).size;
      const name = path.basename(file);

      stats.totalBytes += size;
      stats.perCatalog[catalog].bytes += size;

      if (name.endsWith('.webp')) {
        if (isVariant(name)) {
          stats.variants++;
          stats.perCatalog[catalog].variants++;
        } else {
          stats.bases++;
          stats.perCatalog[catalog].bases++;
        }
      } else if (name.endsWith('.mp4')) {
        stats.videos++;
        stats.perCatalog[catalog].videos++;
      } else {
        stats.other++;
      }
    }
  }

  return stats;
}

async function manifestEntryCount() {
  try {
    const raw = await fs.readFile(MANIFEST, 'utf8');
    const json = JSON.parse(raw);
    return Object.keys(json).length;
  } catch {
    return 0;
  }
}

function runStep(label, command, args) {
  rule(label);
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const child = spawn(command, args, { stdio: 'inherit', cwd: ROOT });
    child.on('exit', (code) => {
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      if (code === 0) {
        console.log(c.dim(`  (done in ${elapsed}s)`));
        resolve();
      } else {
        reject(new Error(`${label} exited with code ${code}`));
      }
    });
    child.on('error', reject);
  });
}

async function sweepStaleTempFiles() {
  // Leftovers from interrupted optimize-images runs (Ctrl+C, OOM, crash).
  // They look like raw PNGs to assets:check and break the next CI build.
  let removed = 0;
  for await (const file of walk(CATALOGS)) {
    const base = path.basename(file);
    if (base.endsWith('.tmp.png') || base.endsWith('.tmp.webp')) {
      await fs.unlink(file).catch(() => {});
      removed += 1;
    }
  }
  if (removed > 0) {
    console.log(c.yellow(`  swept ${removed} stale .tmp.* file(s) before pipeline start`));
  }
}

async function main() {
  console.log(c.bold('\n📷  METRO Catalogs — image pipeline'));
  if (force) console.log(c.yellow('  (--force: regenerate everything)'));

  await sweepStaleTempFiles();

  const before = await inventory();
  const manifestBefore = await manifestEntryCount();

  await runStep(
    '1/3  assets:check  (no raw JPG/PNG in public/catalogs/)',
    'node',
    ['scripts/check-no-rasterized-non-webp.mjs'],
  );

  await runStep(
    '2/3  recompress:gallery  (sharp q=82, idempotent)',
    'node',
    ['scripts/recompress-gallery-bases.mjs', ...(force ? ['--force'] : [])],
  );

  await runStep(
    '3/3  thumbnails  (responsive -Nw variants + manifest)',
    'node',
    ['scripts/generate-thumbnails.mjs', ...(force ? ['--force'] : [])],
  );

  const after = await inventory();
  const manifestAfter = await manifestEntryCount();

  rule('Final report');

  const rows = [
    ['Base WebP files',  before.bases,    after.bases],
    ['Variant -Nw.webp', before.variants, after.variants],
    ['MP4 videos',       before.videos,   after.videos],
  ];

  for (const [label, b, a] of rows) {
    const delta = a - b;
    const sign = delta === 0 ? c.dim('±0') : delta > 0 ? c.green(`+${delta}`) : c.red(`${delta}`);
    console.log(`  ${label.padEnd(22)} ${String(a).padStart(5)}   ${sign}`);
  }

  console.log(`  ${'Manifest entries'.padEnd(22)} ${String(manifestAfter).padStart(5)}   ${
    manifestAfter === manifestBefore
      ? c.dim('±0')
      : manifestAfter > manifestBefore
        ? c.green(`+${manifestAfter - manifestBefore}`)
        : c.red(`${manifestAfter - manifestBefore}`)
  }`);

  console.log(
    `  ${'Total disk usage'.padEnd(22)} ${fmtBytes(after.totalBytes).padStart(10)}   ${fmtDelta(
      before.totalBytes,
      after.totalBytes,
    )}`,
  );

  console.log('\n  ' + c.bold('Per catalog:'));
  for (const [catalog, s] of Object.entries(after.perCatalog).sort()) {
    console.log(
      `    ${catalog.padEnd(8)} ${String(s.bases).padStart(3)} bases · ${String(s.variants).padStart(4)} variants · ${String(s.videos).padStart(2)} videos · ${fmtBytes(s.bytes).padStart(9)}`,
    );
  }

  console.log(`\n${c.green('✓')} pipeline complete\n`);
}

main().catch((err) => {
  console.error(c.red(`\n✖ ${err.message}\n`));
  process.exit(1);
});
