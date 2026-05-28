#!/usr/bin/env node

/**
 * catalog-assets.mjs
 *
 * Interactive TUI for auditing public/catalogs/ assets vs JSON declarations.
 * Replaces the older split scripts (audit-catalogs.mjs, find-orphans.mjs)
 * with a single menu-driven workflow:
 *
 *   - View per-section status (OK / MISSING / ORPHAN / STALE)
 *   - List orphan files
 *   - Quarantine orphans (safe move to .orphans-trash/<timestamp>/)
 *   - Restore from a quarantine batch
 *   - Purge a quarantine batch
 *   - Hard-delete orphans (destructive, explicit confirmation)
 *
 * Detection rules mirror src/lib/catalog-loader.ts:
 *   - hero/hero_*.webp                       → auto-discovered
 *   - materials|finishes/metro {RAL|U|W}\d+  → auto-discovered
 *   - <base>.mp4 in JSON                     → <base>_last.webp counted as
 *                                              sub-variant (poster frame
 *                                              used by FeaturesPrintQX /
 *                                              FeaturesPrintMCR800)
 *   - Cross-section absolute paths declared in one section's JSON keep
 *     files in another section of the same catalog alive (catalog-wide
 *     reference set, keyed by absolute filesystem path).
 *
 * Non-interactive usage:
 *   node scripts/catalog-assets.mjs --check   # read-only audit; exit 1 on MISSING/ORPHAN
 *   node scripts/catalog-assets.mjs --json    # machine-readable audit (implies --check)
 *
 * Auto-falls-back to --check when stdin or stdout is not a TTY.
 */

import fs from 'fs/promises';
import path from 'path';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { pathsFromScript, isResponsiveVariant } from './lib/image-utils.mjs';

const { PUBLIC, ROOT } = pathsFromScript(import.meta.url);
const CATALOGS_DIR = path.join(PUBLIC, 'catalogs');
const QUARANTINE_ROOT = path.join(ROOT, '.orphans-trash');

const args = process.argv.slice(2);
const CHECK_MODE = args.includes('--check') || args.includes('--strict');
const JSON_OUT = args.includes('--json');

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

const NO_COLOR = !output.isTTY || process.env.NO_COLOR;
const c = NO_COLOR
  ? Object.fromEntries(
      ['bold', 'dim', 'green', 'red', 'yellow', 'cyan', 'magenta'].map((k) => [
        k,
        (s) => s,
      ]),
    )
  : {
      bold: (s) => `\x1b[1m${s}\x1b[0m`,
      dim: (s) => `\x1b[2m${s}\x1b[0m`,
      green: (s) => `\x1b[32m${s}\x1b[0m`,
      red: (s) => `\x1b[31m${s}\x1b[0m`,
      yellow: (s) => `\x1b[33m${s}\x1b[0m`,
      cyan: (s) => `\x1b[36m${s}\x1b[0m`,
      magenta: (s) => `\x1b[35m${s}\x1b[0m`,
    };

const log = (...m) => {
  if (!JSON_OUT) console.log(...m);
};

// ---------------------------------------------------------------------------
// JSON declarations + auto-discovery rules
// ---------------------------------------------------------------------------

const ASSET_EXTS = new Set(['.webp', '.mp4', '.svg', '.jpg', '.jpeg', '.png']);
const REFERENCE_FIELDS = new Set([
  'image',
  'heroImage',
  'packshotImage',
  'previewImage',
  'detailImage',
  'src',
  'thumbnail',
]);
const STALE_TEMPLATE_NAMES = new Set(['packshot.jpg', 'detail.webp']);
const VIDEO_SOURCE_RE = /\.(mp4|webm|mov)$/i;

/** Mirrors FeaturesPrintQX/MCR800: `<base>.mp4` → `<base>_last.webp`. */
function derivedPosterFromVideoSrc(src) {
  return VIDEO_SOURCE_RE.test(src) ? src.replace(VIDEO_SOURCE_RE, '_last.webp') : null;
}

function walkJsonForAssets(obj, sink) {
  if (obj === null || obj === undefined) return;
  if (Array.isArray(obj)) {
    for (const item of obj) walkJsonForAssets(item, sink);
    return;
  }
  if (typeof obj !== 'object') return;

  for (const [key, value] of Object.entries(obj)) {
    if (REFERENCE_FIELDS.has(key) && typeof value === 'string' && value) {
      sink.push(value);
    } else if (key === 'video' && value && typeof value === 'object') {
      if (typeof value.src === 'string' && value.src) {
        sink.push(value.src);
        const poster = derivedPosterFromVideoSrc(value.src);
        if (poster) sink.push(poster);
      }
      if (typeof value.poster === 'string' && value.poster) sink.push(value.poster);
    } else {
      walkJsonForAssets(value, sink);
    }
  }
}

async function readJsonSafe(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch {
    return null;
  }
}

async function readSectionDeclarations(sectionDir) {
  const declared = [];
  const content = await readJsonSafe(path.join(sectionDir, 'content.json'));
  if (content) walkJsonForAssets(content, declared);

  const slider = await readJsonSafe(path.join(sectionDir, 'slider.json'));
  if (slider?.slides) {
    for (const slide of slider.slides) {
      if (typeof slide?.image === 'string' && slide.image) declared.push(slide.image);
    }
  }
  return [...new Set(declared)];
}

function isAutoDiscoveredHero(fileName) {
  return path.parse(fileName).name.startsWith('hero_');
}

function isAutoDiscoveredMaterial(fileName) {
  const parsed = path.parse(fileName);
  if (parsed.ext.toLowerCase() !== '.webp') return false;
  const base = parsed.name.endsWith('_thumb')
    ? parsed.name.slice(0, -'_thumb'.length)
    : parsed.name;
  const normalized = base.replace(/^metro[_ -]*/i, '').trim();
  return /^(RAL\s*\d+|[UW]\d+)(?:[\s_-]+.+)?$/i.test(normalized);
}

function isAutoDiscoveredInSection(sectionName, fileName) {
  if (sectionName === 'hero') return isAutoDiscoveredHero(fileName);
  if (sectionName === 'materials' || sectionName === 'finishes') {
    return isAutoDiscoveredMaterial(fileName);
  }
  return false;
}

function resolveDeclaredPath(declared, sectionDir) {
  if (/^https?:\/\//i.test(declared)) return null;
  if (declared.startsWith('/')) return path.join(PUBLIC, declared);
  return path.join(sectionDir, declared);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

async function auditSection(catalog, section, sectionDir, declared, referencedAbsPaths) {
  let entries;
  try {
    entries = await fs.readdir(sectionDir, { withFileTypes: true });
  } catch {
    return null;
  }

  const baseFiles = [];
  let variantCount = 0;
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!ASSET_EXTS.has(ext)) continue;
    if (entry.name.endsWith('.webp') && isResponsiveVariant(entry.name)) {
      variantCount++;
      continue;
    }
    baseFiles.push(entry.name);
  }

  if (declared.length === 0 && baseFiles.length === 0 && variantCount === 0) return null;

  const missing = [];
  const stale = [];
  for (const decl of declared) {
    const target = resolveDeclaredPath(decl, sectionDir);
    if (!target) continue;
    if (await fileExists(target)) continue;
    const baseName = path.posix.basename(decl);
    if (STALE_TEMPLATE_NAMES.has(baseName)) {
      stale.push({ declared: decl, expected: path.relative(PUBLIC, target) });
    } else {
      missing.push({ declared: decl, expected: path.relative(PUBLIC, target) });
    }
  }

  const orphans = [];
  for (const fileName of baseFiles) {
    const absPath = path.join(sectionDir, fileName);
    if (referencedAbsPaths.has(absPath)) continue;
    if (isAutoDiscoveredInSection(section, fileName)) continue;
    const stat = await fs.stat(absPath);
    orphans.push({
      file: fileName,
      absPath,
      relative: path.relative(PUBLIC, absPath),
      bytes: stat.size,
    });
  }

  let status;
  if (missing.length > 0) status = 'MISSING';
  else if (orphans.length > 0) status = 'ORPHAN';
  else if (stale.length > 0) status = 'STALE';
  else status = 'OK';

  return {
    catalog,
    section,
    filesOnDisk: baseFiles.length,
    refsDeclared: declared.length,
    variants: variantCount,
    status,
    missing,
    orphans,
    stale,
  };
}

async function auditCatalog(catalogName) {
  const catalogDir = path.join(CATALOGS_DIR, catalogName);
  let sectionDirs;
  try {
    sectionDirs = (await fs.readdir(catalogDir, { withFileTypes: true }))
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
  } catch {
    return null;
  }

  const declarationsBySection = new Map();
  const referencedAbsPaths = new Set();
  for (const sectionName of sectionDirs) {
    const sectionDir = path.join(catalogDir, sectionName);
    const declared = await readSectionDeclarations(sectionDir);
    declarationsBySection.set(sectionName, declared);
    for (const decl of declared) {
      const resolved = resolveDeclaredPath(decl, sectionDir);
      if (resolved) referencedAbsPaths.add(resolved);
    }
  }

  const sections = [];
  for (const sectionName of sectionDirs) {
    const sectionDir = path.join(catalogDir, sectionName);
    const declared = declarationsBySection.get(sectionName) ?? [];
    const audit = await auditSection(
      catalogName,
      sectionName,
      sectionDir,
      declared,
      referencedAbsPaths,
    );
    if (audit) sections.push(audit);
  }
  return { catalog: catalogName, sections };
}

async function auditAll() {
  let catalogNames;
  try {
    catalogNames = (await fs.readdir(CATALOGS_DIR, { withFileTypes: true }))
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
  } catch (err) {
    console.error(`Cannot read ${CATALOGS_DIR}:`, err.message);
    process.exit(2);
  }

  const results = [];
  for (const name of catalogNames) {
    const audit = await auditCatalog(name);
    if (audit) results.push(audit);
  }
  return results;
}

function summarize(catalogs) {
  const sectionsByStatus = { OK: 0, MISSING: 0, ORPHAN: 0, STALE: 0 };
  const fileCounts = { MISSING: 0, ORPHAN: 0, STALE: 0 };
  let totalSections = 0;
  let orphanBytes = 0;
  const allOrphans = [];
  const allMissing = [];

  for (const cat of catalogs) {
    for (const s of cat.sections) {
      sectionsByStatus[s.status]++;
      totalSections++;
      fileCounts.MISSING += s.missing.length;
      fileCounts.ORPHAN += s.orphans.length;
      fileCounts.STALE += s.stale.length;
      for (const o of s.orphans) {
        orphanBytes += o.bytes;
        allOrphans.push({ ...o, catalog: cat.catalog, section: s.section });
      }
      for (const m of s.missing) {
        allMissing.push({ ...m, catalog: cat.catalog, section: s.section });
      }
    }
  }

  return {
    catalogCount: catalogs.length,
    totalSections,
    sectionsByStatus,
    fileCounts,
    orphanBytes,
    allOrphans,
    allMissing,
  };
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function pad(value, width) {
  const s = String(value);
  return s + ' '.repeat(Math.max(0, width - s.length));
}

const STATUS_BADGE = {
  OK: c.green('OK     '),
  MISSING: c.red('MISSING'),
  ORPHAN: c.yellow('ORPHAN '),
  STALE: c.magenta('STALE  '),
};

function renderFullAudit(catalogs) {
  for (const { catalog, sections } of catalogs) {
    log('');
    log(c.bold(c.cyan(`══════ ${catalog} ══════`)));
    if (sections.length === 0) {
      log(c.dim('  (no section folders)'));
      continue;
    }
    log(
      c.dim(
        `  ${pad('section', 18)}${pad('files', 7)}${pad('refs', 6)}${pad('variants', 10)}status`,
      ),
    );
    for (const s of sections) {
      log(
        `  ${pad(s.section, 18)}${pad(s.filesOnDisk, 7)}${pad(s.refsDeclared, 6)}${pad(s.variants, 10)}${STATUS_BADGE[s.status]}`,
      );
      for (const m of s.missing) {
        log(c.red(`      ✗ missing: ${m.declared}  (expected: ${m.expected})`));
      }
      for (const o of s.orphans) {
        log(c.yellow(`      ⚠ orphan:  ${o.file}`));
      }
      for (const st of s.stale) {
        log(c.magenta(`      • stale:   ${st.declared}  (scaffolding leftover)`));
      }
    }
  }
}

function renderSummary(s) {
  log('');
  log(c.bold('═══════ Summary ═══════'));
  log(`  catalogs:                  ${s.catalogCount}`);
  log(`  sections:                  ${s.totalSections}`);
  log(`  ${c.green('OK')}:              ${String(s.sectionsByStatus.OK).padStart(11)} sections`);
  log(
    `  ${c.red('MISSING')}:         ${String(s.sectionsByStatus.MISSING).padStart(6)} sections  ${c.dim(`(${s.fileCounts.MISSING} files)`)}`,
  );
  log(
    `  ${c.yellow('ORPHAN')}:          ${String(s.sectionsByStatus.ORPHAN).padStart(6)} sections  ${c.dim(`(${s.fileCounts.ORPHAN} files, ${fmtBytes(s.orphanBytes)})`)}`,
  );
  log(
    `  ${c.magenta('STALE')} (scaffold): ${String(s.sectionsByStatus.STALE).padStart(3)} sections  ${c.dim(`(${s.fileCounts.STALE} files)`)}`,
  );
}

function renderOrphanList(allOrphans) {
  if (allOrphans.length === 0) {
    log(c.green('\n✓ No orphan files.'));
    return;
  }
  log(c.bold(c.red(`\nOrphan files (${allOrphans.length}):\n`)));
  const byCatalog = {};
  for (const o of allOrphans) (byCatalog[o.catalog] ??= []).push(o);
  let total = 0;
  for (const cat of Object.keys(byCatalog).sort()) {
    log(c.cyan(`  ${cat}/`));
    for (const o of byCatalog[cat]) {
      log(
        `    ${c.yellow(pad(o.section, 16))} ${o.relative}  ${c.dim(`(${fmtBytes(o.bytes)})`)}`,
      );
      total += o.bytes;
    }
  }
  log(c.bold(`\nTotal: ${allOrphans.length} files, ${fmtBytes(total)}`));
}

function renderMissingList(allMissing) {
  if (allMissing.length === 0) return;
  log(c.bold(c.red(`\nMissing files (${allMissing.length}) — declared in JSON, absent on disk:\n`)));
  for (const m of allMissing) {
    log(
      `  ${c.cyan(`${m.catalog}/${m.section}`)}  declared: ${c.yellow(m.declared)}  →  expected: ${m.expected}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Quarantine + delete
// ---------------------------------------------------------------------------

function timestampSlug(date = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}-${p(date.getMinutes())}-${p(date.getSeconds())}`;
}

async function safeRename(src, dest) {
  try {
    await fs.rename(src, dest);
  } catch (err) {
    if (err.code !== 'EXDEV') throw err;
    await fs.copyFile(src, dest);
    await fs.unlink(src);
  }
}

async function findRelatedVariants(orphanPath) {
  const dir = path.dirname(orphanPath);
  const parsed = path.parse(orphanPath);
  const escaped = parsed.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const variantRegex = new RegExp(`^${escaped}-\\d+w\\.webp$`, 'i');
  try {
    const files = await fs.readdir(dir);
    return files.filter((f) => variantRegex.test(f)).map((f) => path.join(dir, f));
  } catch {
    return [];
  }
}

async function quarantineOrphans(allOrphans) {
  if (allOrphans.length === 0) {
    log(c.green('\nNothing to quarantine.'));
    return;
  }
  const trashDir = path.join(QUARANTINE_ROOT, timestampSlug());
  log(
    c.yellow(
      `\nMoving ${allOrphans.length} orphan(s) + responsive variants → ${path.relative(ROOT, trashDir)}/`,
    ),
  );

  let movedFiles = 0;
  let movedBytes = 0;
  let failed = 0;

  for (const o of allOrphans) {
    const variants = await findRelatedVariants(o.absPath);
    for (const target of [o.absPath, ...variants]) {
      const rel = path.relative(PUBLIC, target);
      const dest = path.join(trashDir, rel);
      try {
        const stat = await fs.stat(target);
        await fs.mkdir(path.dirname(dest), { recursive: true });
        await safeRename(target, dest);
        movedFiles++;
        movedBytes += stat.size;
        log(c.dim(`  moved ${rel}`));
      } catch (err) {
        if (err.code === 'ENOENT') continue;
        failed++;
        log(c.red(`  failed: ${rel} (${err.message})`));
      }
    }
  }
  log(c.green(`\n✓ Quarantined ${movedFiles} files (${fmtBytes(movedBytes)})`));
  if (failed > 0) log(c.red(`  ${failed} file(s) failed to move.`));
  log(c.dim(`  Batch: ${path.relative(ROOT, trashDir)}`));
  log(c.dim('  Next: `npm run thumbnails` to refresh the responsive-image manifest.'));
}

async function listQuarantineBatches() {
  let entries;
  try {
    entries = (await fs.readdir(QUARANTINE_ROOT, { withFileTypes: true }))
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
  const batches = [];
  for (const name of entries) {
    const dir = path.join(QUARANTINE_ROOT, name);
    let files = 0;
    let bytes = 0;
    async function walk(d) {
      for (const e of await fs.readdir(d, { withFileTypes: true })) {
        const full = path.join(d, e.name);
        if (e.isDirectory()) await walk(full);
        else if (e.isFile()) {
          files++;
          const stat = await fs.stat(full);
          bytes += stat.size;
        }
      }
    }
    await walk(dir);
    batches.push({ name, dir, files, bytes });
  }
  return batches;
}

async function copyTree(src, dest) {
  let copied = 0;
  const entries = await fs.readdir(src, { withFileTypes: true });
  await fs.mkdir(dest, { recursive: true });
  for (const e of entries) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) copied += await copyTree(s, d);
    else if (e.isFile()) {
      await fs.copyFile(s, d);
      copied++;
    }
  }
  return copied;
}

async function restoreBatch(batch) {
  log(
    c.yellow(
      `\nRestoring ${batch.files} file(s) from ${batch.name} → public/`,
    ),
  );
  const copied = await copyTree(batch.dir, PUBLIC);
  log(
    c.green(
      `✓ Restored ${copied} file(s). Quarantine batch left in place — purge it manually once stable.`,
    ),
  );
}

async function purgeBatch(batch) {
  await fs.rm(batch.dir, { recursive: true, force: true });
  log(c.green(`✓ Purged ${batch.name} (${batch.files} files, ${fmtBytes(batch.bytes)})`));
}

async function deleteOrphans(allOrphans) {
  if (allOrphans.length === 0) {
    log(c.green('\nNothing to delete.'));
    return;
  }
  let removed = 0;
  let removedBytes = 0;
  for (const o of allOrphans) {
    const variants = await findRelatedVariants(o.absPath);
    for (const target of [o.absPath, ...variants]) {
      try {
        const stat = await fs.stat(target);
        await fs.unlink(target);
        removed++;
        removedBytes += stat.size;
        log(c.dim(`  removed ${path.relative(PUBLIC, target)}`));
      } catch {
        // already gone
      }
    }
  }
  log(c.green(`\n✓ Removed ${removed} files (${fmtBytes(removedBytes)})`));
  log(c.dim('  Next: `npm run thumbnails` to refresh the responsive-image manifest.'));
}

// ---------------------------------------------------------------------------
// Interactive menu
// ---------------------------------------------------------------------------

async function ask(rl, prompt) {
  return (await rl.question(prompt)).trim();
}

async function confirm(rl, prompt) {
  const ans = (await ask(rl, `${prompt} (y/N): `)).toLowerCase();
  return ans === 'y' || ans === 'yes';
}

async function pickBatch(rl, batches) {
  if (batches.length === 0) {
    log(c.dim('\nNo quarantine batches found.'));
    return null;
  }
  log(c.bold('\nQuarantine batches:'));
  batches.forEach((b, i) => {
    log(
      `  ${c.bold(String(i + 1))}) ${b.name}  ${c.dim(`(${b.files} files, ${fmtBytes(b.bytes)})`)}`,
    );
  });
  const ans = await ask(rl, `\nPick batch [1-${batches.length}] (empty to cancel): `);
  if (!ans) return null;
  const idx = parseInt(ans, 10) - 1;
  if (Number.isNaN(idx) || idx < 0 || idx >= batches.length) {
    log(c.red('Invalid choice.'));
    return null;
  }
  return batches[idx];
}

function renderHeader(s, batchCount) {
  log(c.bold(c.cyan('\n═══════ METRO catalog assets ═══════\n')));
  log(`  ${s.catalogCount} catalogs · ${s.totalSections} sections`);
  const missingTxt =
    s.fileCounts.MISSING > 0
      ? c.red(`Missing: ${s.fileCounts.MISSING}`)
      : c.green('Missing: 0');
  const orphanTxt =
    s.fileCounts.ORPHAN > 0
      ? c.yellow(`Orphans: ${s.fileCounts.ORPHAN} (${fmtBytes(s.orphanBytes)})`)
      : c.green('Orphans: 0');
  const staleTxt =
    s.fileCounts.STALE > 0
      ? c.magenta(`Stale: ${s.fileCounts.STALE}`)
      : c.dim('Stale: 0');
  log(`  ${missingTxt}    ${orphanTxt}    ${staleTxt}`);
  log(`  Quarantine batches: ${batchCount}`);
}

function renderMenu(s, batchCount) {
  log('');
  log(`  ${c.bold('1)')} View full audit (per-section status)`);
  log(`  ${c.bold('2)')} List orphan files`);
  const canQuarantine = s.fileCounts.ORPHAN > 0;
  const canRestore = batchCount > 0;
  log(
    `  ${c.bold('3)')} ${canQuarantine ? c.yellow('Quarantine orphans') : c.dim('Quarantine orphans')}  ${c.dim('— safe, reversible')}`,
  );
  log(
    `  ${c.bold('4)')} ${canRestore ? 'Restore from quarantine' : c.dim('Restore from quarantine')}`,
  );
  log(
    `  ${c.bold('5)')} ${canRestore ? 'Purge a quarantine batch' : c.dim('Purge a quarantine batch')}`,
  );
  log(
    `  ${c.bold('6)')} ${canQuarantine ? c.red('Delete orphans permanently') : c.dim('Delete orphans permanently')}  ${c.dim('— destructive')}`,
  );
  log(`  ${c.bold('r)')} Refresh audit`);
  log(`  ${c.bold('q)')} Quit`);
  log('');
}

async function interactive() {
  const rl = readline.createInterface({ input, output });
  try {
    let catalogs = await auditAll();
    let s = summarize(catalogs);
    let batches = await listQuarantineBatches();

    while (true) {
      renderHeader(s, batches.length);
      renderMenu(s, batches.length);
      const choice = (await ask(rl, c.bold('Choose: '))).toLowerCase();

      switch (choice) {
        case '1':
          renderFullAudit(catalogs);
          renderMissingList(s.allMissing);
          renderSummary(s);
          break;
        case '2':
          renderOrphanList(s.allOrphans);
          break;
        case '3':
          renderOrphanList(s.allOrphans);
          if (s.allOrphans.length === 0) break;
          if (await confirm(rl, `\nQuarantine ${s.allOrphans.length} file(s)?`)) {
            await quarantineOrphans(s.allOrphans);
            catalogs = await auditAll();
            s = summarize(catalogs);
            batches = await listQuarantineBatches();
          } else {
            log(c.dim('Cancelled.'));
          }
          break;
        case '4': {
          batches = await listQuarantineBatches();
          const batch = await pickBatch(rl, batches);
          if (!batch) break;
          if (
            await confirm(
              rl,
              `Restore ${batch.files} file(s) from ${batch.name} to public/?`,
            )
          ) {
            await restoreBatch(batch);
            catalogs = await auditAll();
            s = summarize(catalogs);
          } else {
            log(c.dim('Cancelled.'));
          }
          break;
        }
        case '5': {
          batches = await listQuarantineBatches();
          const batch = await pickBatch(rl, batches);
          if (!batch) break;
          if (
            await confirm(
              rl,
              c.red(
                `Permanently DELETE quarantine batch ${batch.name} (${batch.files} files)?`,
              ),
            )
          ) {
            await purgeBatch(batch);
            batches = await listQuarantineBatches();
          } else {
            log(c.dim('Cancelled.'));
          }
          break;
        }
        case '6':
          renderOrphanList(s.allOrphans);
          if (s.allOrphans.length === 0) break;
          if (
            await confirm(
              rl,
              c.red(
                `Permanently DELETE ${s.allOrphans.length} orphan file(s) + variants?`,
              ),
            )
          ) {
            await deleteOrphans(s.allOrphans);
            catalogs = await auditAll();
            s = summarize(catalogs);
          } else {
            log(c.dim('Cancelled.'));
          }
          break;
        case 'r':
          catalogs = await auditAll();
          s = summarize(catalogs);
          batches = await listQuarantineBatches();
          log(c.dim('Refreshed.'));
          break;
        case 'q':
        case 'exit':
        case 'quit':
          log(c.dim('\nBye.'));
          return;
        case '':
          break;
        default:
          log(c.red(`Unknown choice: ${choice}`));
      }
    }
  } finally {
    rl.close();
  }
}

// ---------------------------------------------------------------------------
// Non-interactive entry
// ---------------------------------------------------------------------------

async function runCheck() {
  const catalogs = await auditAll();
  const s = summarize(catalogs);
  if (JSON_OUT) {
    console.log(JSON.stringify({ catalogs, summary: s }, null, 2));
  } else {
    renderFullAudit(catalogs);
    renderMissingList(s.allMissing);
    renderSummary(s);
  }
  const broken = s.fileCounts.MISSING > 0 || s.fileCounts.ORPHAN > 0;
  process.exit(broken ? 1 : 0);
}

async function main() {
  const isInteractiveTTY = input.isTTY && output.isTTY;
  if (CHECK_MODE || JSON_OUT || !isInteractiveTTY) {
    await runCheck();
  } else {
    await interactive();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
