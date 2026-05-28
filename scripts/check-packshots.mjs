#!/usr/bin/env node

/**
 * check-packshots.mjs
 *
 * Verifies that every packshot referenced from
 * public/catalogs/<ID>/packshots/content.json (groups[].items[].image)
 * actually exists on disk together with its responsive variants
 * (-480w.webp, -960w.webp, -1440w.webp), per SECTION_WIDTHS.packshots.
 *
 * Usage:
 *   node scripts/check-packshots.mjs            # all catalogs
 *   node scripts/check-packshots.mjs FM QX      # only listed catalog ids
 *
 * Exit codes:
 *   0 — every reference resolved
 *   1 — at least one base or variant is missing
 *   2 — invocation/config error (e.g. unreadable JSON)
 */

import fs from 'fs/promises';
import path from 'path';
import { pathsFromScript } from './lib/image-utils.mjs';
import { SECTION_WIDTHS } from './lib/section-widths.mjs';

const { PUBLIC } = pathsFromScript(import.meta.url);
const CATALOGS_DIR = path.join(PUBLIC, 'catalogs');
const PACKSHOT_WIDTHS = SECTION_WIDTHS.packshots;

const NO_COLOR = !process.stdout.isTTY || process.env.NO_COLOR;
const c = NO_COLOR
  ? { red: (s) => s, green: (s) => s, yellow: (s) => s, dim: (s) => s, bold: (s) => s }
  : {
      red: (s) => `\x1b[31m${s}\x1b[0m`,
      green: (s) => `\x1b[32m${s}\x1b[0m`,
      yellow: (s) => `\x1b[33m${s}\x1b[0m`,
      dim: (s) => `\x1b[2m${s}\x1b[0m`,
      bold: (s) => `\x1b[1m${s}\x1b[0m`,
    };

function variantNamesFor(baseName) {
  const ext = path.extname(baseName);
  const stem = baseName.slice(0, -ext.length);
  return PACKSHOT_WIDTHS.map((w) => `${stem}-${w}w${ext}`);
}

async function fileExists(absPath) {
  try {
    const st = await fs.stat(absPath);
    return st.isFile();
  } catch {
    return false;
  }
}

async function listCatalogIds(filter) {
  const entries = await fs.readdir(CATALOGS_DIR, { withFileTypes: true });
  const ids = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
  if (filter.length === 0) return ids;
  const wanted = new Set(filter.map((s) => s.toUpperCase()));
  return ids.filter((id) => wanted.has(id.toUpperCase()));
}

async function checkCatalog(catalogId) {
  const packshotsDir = path.join(CATALOGS_DIR, catalogId, 'packshots');
  const contentPath = path.join(packshotsDir, 'content.json');

  if (!(await fileExists(contentPath))) {
    return { catalogId, skipped: true, reason: 'no packshots/content.json' };
  }

  let json;
  try {
    json = JSON.parse(await fs.readFile(contentPath, 'utf8'));
  } catch (err) {
    return { catalogId, error: `unreadable content.json: ${err.message}` };
  }

  const items = (json.groups ?? []).flatMap((g) =>
    (g.items ?? []).map((it) => ({ ...it, _group: g.label ?? g.model ?? '' })),
  );

  const missing = [];
  let checkedBases = 0;
  let checkedVariants = 0;

  for (const item of items) {
    if (!item.image) continue;
    checkedBases += 1;
    const baseAbs = path.join(packshotsDir, item.image);
    if (!(await fileExists(baseAbs))) {
      missing.push({ kind: 'base', file: item.image, item: item.code, group: item._group });
    }
    for (const variant of variantNamesFor(item.image)) {
      checkedVariants += 1;
      const variantAbs = path.join(packshotsDir, variant);
      if (!(await fileExists(variantAbs))) {
        missing.push({ kind: 'variant', file: variant, item: item.code, group: item._group });
      }
    }
  }

  return { catalogId, items: items.length, checkedBases, checkedVariants, missing };
}

function printCatalogReport(report) {
  if (report.skipped) {
    console.log(`${c.dim('—')} ${c.bold(report.catalogId)}: ${c.dim(report.reason)}`);
    return;
  }
  if (report.error) {
    console.log(`${c.red('✗')} ${c.bold(report.catalogId)}: ${c.red(report.error)}`);
    return;
  }
  const { catalogId, items, checkedBases, checkedVariants, missing } = report;
  if (missing.length === 0) {
    console.log(
      `${c.green('✓')} ${c.bold(catalogId)}: ${items} items, ${checkedBases} bases + ${checkedVariants} variants OK`,
    );
    return;
  }
  console.log(
    `${c.red('✗')} ${c.bold(catalogId)}: ${c.red(`${missing.length} missing`)} (of ${checkedBases} bases + ${checkedVariants} variants)`,
  );
  for (const m of missing) {
    const tag = m.kind === 'base' ? c.red('[BASE]   ') : c.yellow('[VARIANT]');
    const ctx = m.item ? c.dim(` (${m.item}${m.group ? ` · ${m.group}` : ''})`) : '';
    console.log(`    ${tag} ${m.file}${ctx}`);
  }
}

async function main() {
  const filter = process.argv.slice(2);
  let ids;
  try {
    ids = await listCatalogIds(filter);
  } catch (err) {
    console.error(c.red(`Cannot read ${CATALOGS_DIR}: ${err.message}`));
    process.exit(2);
  }

  if (ids.length === 0) {
    console.error(c.red('No catalogs to check.'));
    process.exit(2);
  }

  console.log(c.bold(`Checking packshots in ${ids.length} catalog(s): ${ids.join(', ')}\n`));

  const reports = [];
  for (const id of ids) {
    const report = await checkCatalog(id);
    reports.push(report);
    printCatalogReport(report);
  }

  const totalMissing = reports.reduce(
    (sum, r) => sum + (r.missing?.length ?? 0),
    0,
  );
  const errored = reports.filter((r) => r.error).length;

  console.log('');
  if (totalMissing === 0 && errored === 0) {
    console.log(c.green(c.bold('All packshots present.')));
    process.exit(0);
  }
  if (errored > 0) {
    console.log(c.red(`${errored} catalog(s) errored, ${totalMissing} files missing.`));
    process.exit(1);
  }
  console.log(c.red(`${totalMissing} file(s) missing across ${reports.filter((r) => r.missing?.length).length} catalog(s).`));
  process.exit(1);
}

main().catch((err) => {
  console.error(c.red(`Unexpected error: ${err.stack ?? err.message}`));
  process.exit(2);
});
