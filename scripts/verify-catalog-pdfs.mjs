#!/usr/bin/env node

/**
 * verify-catalog-pdfs.mjs
 *
 * Pre-deploy gate. Confirms that every catalog declared in
 * public/catalogs/index.json that uses a printable layoutType ("qx" or
 * "mcr800") has a non-empty, structurally-valid PDF sitting at
 * public/catalogs/<id>/Download/metro-<id>.pdf.
 *
 * Exits non-zero if anything is missing, empty, or doesn't start with the
 * %PDF- magic bytes — so it's safe to chain before `vercel --prod`.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PRINTABLE_LAYOUTS } from './lib/printable-layouts.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const CATALOGS_DIR = path.join(ROOT, 'public', 'catalogs');

const c = {
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
};

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return null;
  }
}

async function discoverExpected() {
  const index = await readJson(path.join(CATALOGS_DIR, 'index.json'));
  const ids = Array.isArray(index?.catalogs) ? index.catalogs : [];
  const expected = [];
  for (const id of ids) {
    const config = await readJson(path.join(CATALOGS_DIR, id, 'config.json'));
    const layoutType = config?.meta?.layoutType;
    if (!config || !PRINTABLE_LAYOUTS.has(layoutType)) continue;
    expected.push({
      id,
      file: path.join(CATALOGS_DIR, id, 'Download', `metro-${id.toLowerCase()}.pdf`),
    });
  }
  return expected;
}

async function isPdf(file) {
  let handle;
  try {
    handle = await fs.open(file, 'r');
    const buf = Buffer.alloc(5);
    await handle.read(buf, 0, 5, 0);
    return buf.toString('utf8') === '%PDF-';
  } catch {
    return false;
  } finally {
    await handle?.close().catch(() => {});
  }
}

async function main() {
  console.log(c.bold(c.cyan('\n🔎 Catalog PDF verification')));

  const expected = await discoverExpected();
  if (expected.length === 0) {
    console.log(c.yellow('  No printable catalogs (qx/mcr800) found in index.json — nothing to verify.'));
    return;
  }

  let totalBytes = 0;
  const failures = [];

  for (const { id, file } of expected) {
    process.stdout.write(c.dim(`  • ${id} → `));
    let stat;
    try {
      stat = await fs.stat(file);
    } catch {
      failures.push({ id, file, reason: 'missing' });
      console.log(c.red(`MISSING ${c.dim(path.relative(ROOT, file))}`));
      continue;
    }
    if (stat.size === 0) {
      failures.push({ id, file, reason: 'empty' });
      console.log(c.red('EMPTY'));
      continue;
    }
    if (!(await isPdf(file))) {
      failures.push({ id, file, reason: 'not-a-pdf' });
      console.log(c.red('not a PDF (missing %PDF- magic)'));
      continue;
    }
    totalBytes += stat.size;
    console.log(`${c.green('ok')} ${c.bold(fmtBytes(stat.size))}`);
  }

  console.log();
  if (failures.length > 0) {
    console.log(c.red(c.bold(`  ✗ Verification failed — ${failures.length} catalog(s) not deploy-ready:`)));
    for (const f of failures) {
      console.log(c.red(`    - ${f.id}: ${f.reason} (${path.relative(ROOT, f.file)})`));
    }
    console.log(c.dim('\n  Run `npm run pdfs:all` to (re)build and try again.'));
    process.exit(1);
  }

  console.log(
    c.green(c.bold(`  ✓ All ${expected.length} catalog PDF(s) verified — total ${fmtBytes(totalBytes)} ready to deploy`)),
  );
}

main().catch((err) => {
  console.error(c.red(`\n✗ ${err instanceof Error ? err.message : String(err)}`));
  process.exit(1);
});
