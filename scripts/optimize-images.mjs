#!/usr/bin/env node

/**
 * optimize-images.mjs
 *
 * Deep image-optimization pass that walks every image directory in
 * public/catalogs/<CATALOG>/{hero,gallery,overview,packshots,materials,thumbs}
 * and public/shared/materials, then:
 *
 *   1) Re-encodes each base .webp using cwebp with optimal flags
 *      (-m 6 -q 85 -pass 10 -sharp_yuv -af -mt).
 *   2) Rebuilds the responsive variants (-NNNw.webp) from the
 *      optimized base using sharp (Lanczos3 resize → lossless PNG temp)
 *      then cwebp with the same flag set.
 *
 * Variant widths and aspect ratios come from scripts/lib/section-widths.mjs
 * — identical to what generate-thumbnails.mjs would have produced, but
 * encoded through cwebp instead of sharp's built-in WebP encoder.
 *
 * Idempotent: by default a file is only replaced when the new encode is
 * smaller (convergence ratio 0.98). Pass --force to always overwrite.
 *
 * Requires `cwebp` (Google libwebp). On macOS: `brew install webp`.
 *
 * NOTE: this is the slow / final-pass optimizer. For fast routine builds
 *       keep using `npm run images` (sharp).
 *
 * Usage:
 *   node scripts/optimize-images.mjs
 *   node scripts/optimize-images.mjs --force
 *   node scripts/optimize-images.mjs --quality 82
 *   node scripts/optimize-images.mjs --catalog QX
 *   node scripts/optimize-images.mjs --section packshots
 *   node scripts/optimize-images.mjs --bases-only
 *   node scripts/optimize-images.mjs --variants-only
 */

import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import {
  pathsFromScript,
  loadSharp,
  isResponsiveVariant,
} from './lib/image-utils.mjs';
import { SECTION_WIDTHS, SECTION_ASPECTS } from './lib/section-widths.mjs';

const { PUBLIC } = pathsFromScript(import.meta.url);
const sharp = await loadSharp();

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2);
const force = argv.includes('--force');
const basesOnly = argv.includes('--bases-only');
const variantsOnly = argv.includes('--variants-only');

const qIdx = argv.indexOf('--quality');
const quality = qIdx >= 0 ? Number(argv[qIdx + 1]) : 85;

const cIdx = argv.indexOf('--catalog');
const catalogFilter = cIdx >= 0 ? argv[cIdx + 1] : null;

const sIdx = argv.indexOf('--section');
const sectionFilter = sIdx >= 0 ? argv[sIdx + 1] : null;

const CONVERGENCE_RATIO = 0.98; // skip if new size >= 98% of current

// ---------------------------------------------------------------------------
// cwebp wrapper
// ---------------------------------------------------------------------------

function ensureCwebp() {
  return new Promise((resolve, reject) => {
    const p = spawn('cwebp', ['-version']);
    p.on('error', () =>
      reject(
        new Error(
          'cwebp not found. Install with: brew install webp (macOS) or apt install webp (Linux).',
        ),
      ),
    );
    p.on('close', (code) =>
      code === 0 ? resolve() : reject(new Error(`cwebp -version exited ${code}`)),
    );
  });
}

function encodeWithCwebp(inputPath, outPath) {
  return new Promise((resolve, reject) => {
    const args = [
      '-m', '6',
      '-q', String(quality),
      '-pass', '10',
      '-sharp_yuv',
      '-af',
      '-mt',
      '-metadata', 'none',
      '-quiet',
      '-o', outPath,
      inputPath,
    ];
    const p = spawn('cwebp', args);
    let stderr = '';
    p.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    p.on('error', reject);
    p.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`cwebp exited ${code}: ${stderr.trim()}`));
    });
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtBytes(n) {
  if (n >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(2)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${n} B`;
}

function fmtPct(saved, before) {
  if (!before) return '   —';
  return `${((saved / before) * 100).toFixed(1)}%`;
}

const padR = (s, n) => String(s).padEnd(n);
const padL = (s, n) => String(s).padStart(n);

async function dirExists(p) {
  try {
    const s = await fs.stat(p);
    return s.isDirectory();
  } catch {
    return false;
  }
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Base + variant encoders
// ---------------------------------------------------------------------------

async function optimizeBase(filePath) {
  const before = (await fs.stat(filePath)).size;
  const tmp = `${filePath}.tmp.webp`;
  await encodeWithCwebp(filePath, tmp);
  const after = (await fs.stat(tmp)).size;

  // HARD SAFETY: never replace with an equal-or-larger file, even with --force.
  // (cwebp at our quality may legitimately produce a larger file than an
  // already-aggressively-compressed source — that's not an optimization.)
  if (after >= before) {
    await fs.unlink(tmp);
    return { skipped: true, reason: 'no-gain', before, after: before };
  }

  // Convergence: skip very small gains unless --force.
  if (!force && after / before >= CONVERGENCE_RATIO) {
    await fs.unlink(tmp);
    return { skipped: true, reason: 'converged', before, after: before };
  }

  await fs.rename(tmp, filePath);
  return { skipped: false, before, after };
}

/**
 * Resize via sharp (lossless PNG tempfile) then encode via cwebp.
 * @param {string} basePath  Source base file
 * @param {number} width     Target width
 * @param {number} baseWidth Source width (px)
 * @param {number|undefined} aspect Optional w/h ratio for crop-to-aspect
 */
async function generateVariant(basePath, width, baseWidth, aspect) {
  const parsed = path.parse(basePath);
  const outName = `${parsed.name}-${width}w${parsed.ext}`;
  const outPath = path.join(parsed.dir, outName);

  if (baseWidth <= width) {
    return { state: 'too-small', before: 0, after: 0 };
  }

  const before = (await fileExists(outPath))
    ? (await fs.stat(outPath)).size
    : 0;

  const tmpPng = `${outPath}.tmp.png`;
  const targetHeight = aspect ? Math.round(width / aspect) : null;

  await sharp(basePath)
    .resize(width, targetHeight, {
      withoutEnlargement: true,
      fit: aspect ? 'cover' : 'inside',
      position: aspect ? 'center' : undefined,
    })
    .png({ compressionLevel: 0 })
    .toFile(tmpPng);

  const tmp = `${outPath}.tmp.webp`;
  try {
    await encodeWithCwebp(tmpPng, tmp);
  } finally {
    await fs.unlink(tmpPng).catch(() => {});
  }
  const after = (await fs.stat(tmp)).size;

  // HARD SAFETY: when an existing variant is present, never replace with
  // a larger file. (For freshly created variants there's nothing to compare
  // against, so we always keep the new one.)
  if (before > 0 && after >= before) {
    await fs.unlink(tmp);
    return { state: 'skipped', reason: 'no-gain', before, after: before };
  }

  if (before > 0 && !force && after / before >= CONVERGENCE_RATIO) {
    await fs.unlink(tmp);
    return { state: 'skipped', reason: 'converged', before, after: before };
  }

  await fs.rename(tmp, outPath);
  return {
    state: before > 0 ? 'rebuilt' : 'created',
    before,
    after,
  };
}

// ---------------------------------------------------------------------------
// Per-file work (optimize base + rebuild its variants), records into stats.
// ---------------------------------------------------------------------------

async function processBaseFile(filePath, widths, aspect, stats, label) {
  const fileName = path.basename(filePath);

  // 1) Re-encode the base.
  if (!variantsOnly) {
    try {
      const r = await optimizeBase(filePath);
      stats.basesBefore += r.before;
      stats.basesAfter += r.after;
      if (r.skipped) {
        stats.basesSkipped++;
      } else {
        stats.basesProcessed++;
        const saved = r.before - r.after;
        console.log(
          `  ${label}/${fileName}: ${fmtBytes(r.before)} → ${fmtBytes(r.after)} (-${fmtPct(saved, r.before)})`,
        );
      }
    } catch (err) {
      console.warn(`  FAIL ${label}/${fileName}: ${err.message}`);
      return;
    }
  }

  // 2) Rebuild variants from the (possibly newly optimized) base.
  if (!basesOnly && widths && widths.length > 0) {
    let baseWidth;
    try {
      baseWidth = (await sharp(filePath).metadata()).width ?? 0;
    } catch (err) {
      console.warn(`  FAIL metadata ${label}/${fileName}: ${err.message}`);
      return;
    }

    for (const w of widths) {
      try {
        const r = await generateVariant(filePath, w, baseWidth, aspect);
        if (r.state === 'too-small') continue;
        stats.variantsBefore += r.before;
        stats.variantsAfter += r.after;
        if (r.state === 'skipped') stats.variantsSkipped++;
        else stats.variantsBuilt++;
      } catch (err) {
        console.warn(`  FAIL ${label}/${fileName} @${w}w: ${err.message}`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Section walkers
// ---------------------------------------------------------------------------

async function processSimpleSection(dir, widths, aspect, stats, label) {
  if (!(await dirExists(dir))) return;
  const files = await fs.readdir(dir);
  const bases = files
    .filter((f) => f.endsWith('.webp') && !isResponsiveVariant(f))
    .sort();
  for (const f of bases) {
    await processBaseFile(path.join(dir, f), widths, aspect, stats, label);
  }
}

/**
 * Gallery split: images[0] in content.json → main (gallery widths),
 * images[1..] → thumbs (gallery_thumb widths + aspect). Orphans skipped.
 * Mirrors generate-thumbnails.mjs:processGalleryDirectory.
 */
async function processGallerySection(dir, stats, label) {
  if (!(await dirExists(dir))) return;

  let mainName = null;
  const thumbNames = new Set();

  const contentPath = path.join(dir, 'content.json');
  if (await fileExists(contentPath)) {
    try {
      const content = JSON.parse(await fs.readFile(contentPath, 'utf8'));
      const images = Array.isArray(content?.images) ? content.images : [];
      const nameOf = (entry) => entry?.image ?? entry?.src ?? null;
      if (images[0]) mainName = nameOf(images[0]);
      for (let i = 1; i < images.length; i++) {
        const n = nameOf(images[i]);
        if (n) thumbNames.add(n);
      }
    } catch (err) {
      console.warn(`  Failed to read ${contentPath}: ${err.message}`);
    }
  }

  const files = (await fs.readdir(dir)).sort();
  for (const f of files) {
    if (!f.endsWith('.webp') || isResponsiveVariant(f)) continue;

    let widths;
    let aspect;
    if (f === mainName) {
      widths = SECTION_WIDTHS.gallery;
      aspect = SECTION_ASPECTS.gallery;
    } else if (thumbNames.has(f)) {
      widths = SECTION_WIDTHS.gallery_thumb;
      aspect = SECTION_ASPECTS.gallery_thumb;
    } else {
      // Orphan (not referenced in content.json) — still optimize the base
      // but don't rebuild variants we can't classify.
      widths = [];
      aspect = undefined;
    }

    await processBaseFile(path.join(dir, f), widths, aspect, stats, label);
  }
}

/**
 * Materials split: *_thumb.webp → materials_thumb, others → materials_full.
 */
async function processMaterialsSection(dir, stats, label) {
  if (!(await dirExists(dir))) return;
  const files = (await fs.readdir(dir)).sort();
  for (const f of files) {
    if (!f.endsWith('.webp') || isResponsiveVariant(f)) continue;
    const isThumb = f.includes('_thumb');
    const widths = isThumb
      ? SECTION_WIDTHS.materials_thumb
      : SECTION_WIDTHS.materials_full;
    await processBaseFile(path.join(dir, f), widths, undefined, stats, label);
  }
}

/**
 * Thumbs split: -home / -home-mobile → home_tile widths, -nav → nav_tile widths.
 * Other names are skipped (they won't produce variants anyway).
 */
async function processThumbsSection(dir, stats, label) {
  if (!(await dirExists(dir))) return;
  const files = (await fs.readdir(dir)).sort();
  for (const f of files) {
    if (!f.endsWith('.webp') || isResponsiveVariant(f)) continue;
    const baseName = path.parse(f).name;
    let widths = null;
    if (baseName.endsWith('-home-mobile') || baseName.endsWith('-home')) {
      widths = SECTION_WIDTHS.home_tile;
    } else if (baseName.endsWith('-nav')) {
      widths = SECTION_WIDTHS.nav_tile;
    } else {
      continue;
    }
    await processBaseFile(path.join(dir, f), widths, undefined, stats, label);
  }
}

// ---------------------------------------------------------------------------
// Catalog runner
// ---------------------------------------------------------------------------

function newStats(scope) {
  return {
    scope,
    basesProcessed: 0,
    basesSkipped: 0,
    basesBefore: 0,
    basesAfter: 0,
    variantsBuilt: 0,
    variantsSkipped: 0,
    variantsBefore: 0,
    variantsAfter: 0,
  };
}

const SECTION_HANDLERS = {
  hero: (dir, stats, label) =>
    processSimpleSection(dir, SECTION_WIDTHS.hero, undefined, stats, label),
  gallery: (dir, stats, label) => processGallerySection(dir, stats, label),
  overview: (dir, stats, label) =>
    processSimpleSection(
      dir,
      SECTION_WIDTHS.overview,
      SECTION_ASPECTS.overview,
      stats,
      label,
    ),
  packshots: (dir, stats, label) =>
    processSimpleSection(
      dir,
      SECTION_WIDTHS.packshots,
      undefined,
      stats,
      label,
    ),
  materials: (dir, stats, label) => processMaterialsSection(dir, stats, label),
  thumbs: (dir, stats, label) => processThumbsSection(dir, stats, label),
};

const SECTION_ORDER = [
  'hero',
  'gallery',
  'overview',
  'packshots',
  'materials',
  'thumbs',
];

async function processCatalog(catalog) {
  const catalogDir = path.join(PUBLIC, 'catalogs', catalog);
  if (!(await dirExists(catalogDir))) return null;
  const stats = newStats(catalog);

  let any = false;
  for (const section of SECTION_ORDER) {
    if (sectionFilter && section !== sectionFilter) continue;
    const sectionDir = path.join(catalogDir, section);
    if (!(await dirExists(sectionDir))) continue;
    any = true;
    console.log(`\n${catalog}/${section}`);
    await SECTION_HANDLERS[section](sectionDir, stats, section);
  }
  return any ? stats : null;
}

async function processSharedMaterials() {
  if (sectionFilter && sectionFilter !== 'materials') return null;
  const dir = path.join(PUBLIC, 'shared', 'materials');
  if (!(await dirExists(dir))) return null;
  const stats = newStats('shared/materials');
  console.log(`\nshared/materials`);
  await processMaterialsSection(dir, stats, 'shared/materials');
  return stats;
}

// ---------------------------------------------------------------------------
// Summary table
// ---------------------------------------------------------------------------

const COLS = {
  scope: 18,
  bP: 7,
  bS: 7,
  bBefore: 11,
  bAfter: 11,
  bSaved: 9,
  vB: 9,
  vS: 7,
  vBefore: 11,
  vAfter: 11,
  vSaved: 9,
};

const TOTAL_WIDTH =
  2 +
  COLS.scope +
  COLS.bP +
  COLS.bS +
  COLS.bBefore +
  COLS.bAfter +
  COLS.bSaved +
  COLS.vB +
  COLS.vS +
  COLS.vBefore +
  COLS.vAfter +
  COLS.vSaved;

function row(scope, bP, bS, bB, bA, bSv, vB, vS, vBz, vAz, vSv) {
  return (
    '  ' +
    padR(scope, COLS.scope) +
    padL(bP, COLS.bP) +
    padL(bS, COLS.bS) +
    padL(bB, COLS.bBefore) +
    padL(bA, COLS.bAfter) +
    padL(bSv, COLS.bSaved) +
    padL(vB, COLS.vB) +
    padL(vS, COLS.vS) +
    padL(vBz, COLS.vBefore) +
    padL(vAz, COLS.vAfter) +
    padL(vSv, COLS.vSaved)
  );
}

function printSummary(allStats, elapsedSec) {
  const rows = allStats.filter(Boolean);

  console.log('\n' + '═'.repeat(TOTAL_WIDTH));
  console.log(
    `  Image optimization summary  ·  cwebp -m 6 -q ${quality} -pass 10 -sharp_yuv  ·  ${elapsedSec}s`,
  );
  console.log('═'.repeat(TOTAL_WIDTH));

  if (rows.length === 0) {
    console.log('  No work found.');
    console.log('═'.repeat(TOTAL_WIDTH));
    return;
  }

  console.log(
    '  ' +
      padR('', COLS.scope) +
      padL(
        '──────── bases ────────',
        COLS.bP + COLS.bS + COLS.bBefore + COLS.bAfter + COLS.bSaved,
      ) +
      padL(
        '────── variants ──────',
        COLS.vB + COLS.vS + COLS.vBefore + COLS.vAfter + COLS.vSaved,
      ),
  );

  console.log(
    row(
      'Scope',
      'opt',
      'skip',
      'before',
      'after',
      'saved',
      'built',
      'skip',
      'before',
      'after',
      'saved',
    ),
  );
  console.log('  ' + '─'.repeat(TOTAL_WIDTH - 2));

  const g = {
    bP: 0,
    bS: 0,
    bB: 0,
    bA: 0,
    vB: 0,
    vS: 0,
    vBz: 0,
    vAz: 0,
  };

  for (const s of rows) {
    g.bP += s.basesProcessed;
    g.bS += s.basesSkipped;
    g.bB += s.basesBefore;
    g.bA += s.basesAfter;
    g.vB += s.variantsBuilt;
    g.vS += s.variantsSkipped;
    g.vBz += s.variantsBefore;
    g.vAz += s.variantsAfter;

    const bSaved = s.basesBefore - s.basesAfter;
    const vSaved = s.variantsBefore - s.variantsAfter;

    console.log(
      row(
        s.scope,
        s.basesProcessed || '—',
        s.basesSkipped || '—',
        s.basesBefore ? fmtBytes(s.basesBefore) : '—',
        s.basesAfter ? fmtBytes(s.basesAfter) : '—',
        bSaved > 0 ? `-${fmtPct(bSaved, s.basesBefore)}` : '—',
        s.variantsBuilt || '—',
        s.variantsSkipped || '—',
        s.variantsBefore ? fmtBytes(s.variantsBefore) : '—',
        s.variantsAfter ? fmtBytes(s.variantsAfter) : '—',
        vSaved > 0 ? `-${fmtPct(vSaved, s.variantsBefore)}` : '—',
      ),
    );
  }

  console.log('  ' + '─'.repeat(TOTAL_WIDTH - 2));
  const gBSaved = g.bB - g.bA;
  const gVSaved = g.vBz - g.vAz;
  console.log(
    row(
      'TOTAL',
      g.bP,
      g.bS,
      fmtBytes(g.bB),
      fmtBytes(g.bA),
      gBSaved > 0 ? `-${fmtPct(gBSaved, g.bB)}` : '—',
      g.vB,
      g.vS,
      fmtBytes(g.vBz),
      fmtBytes(g.vAz),
      gVSaved > 0 ? `-${fmtPct(gVSaved, g.vBz)}` : '—',
    ),
  );
  console.log('═'.repeat(TOTAL_WIDTH));

  const totalBefore = g.bB + g.vBz;
  const totalAfter = g.bA + g.vAz;
  const totalSaved = totalBefore - totalAfter;
  console.log(
    `  Grand total: ${fmtBytes(totalBefore)} → ${fmtBytes(totalAfter)}   saved ${fmtBytes(totalSaved)} (-${fmtPct(totalSaved, totalBefore)})`,
  );
  console.log('═'.repeat(TOTAL_WIDTH));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (sectionFilter && !SECTION_HANDLERS[sectionFilter]) {
    console.error(
      `Unknown --section "${sectionFilter}". Valid: ${SECTION_ORDER.join(', ')}`,
    );
    process.exit(2);
  }

  try {
    await ensureCwebp();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  const mode = variantsOnly
    ? 'variants only'
    : basesOnly
      ? 'bases only'
      : 'bases + variants';

  const filters = [];
  if (catalogFilter) filters.push(`catalog=${catalogFilter}`);
  if (sectionFilter) filters.push(`section=${sectionFilter}`);
  console.log(
    `Optimizing images — mode: ${mode}, quality=${quality}${force ? ', force' : ''}` +
      (filters.length ? `, ${filters.join(', ')}` : ''),
  );

  const t0 = Date.now();
  const allStats = [];

  // --catalog shared → only the shared/materials tree.
  const sharedOnly = catalogFilter === 'shared';

  const catalogsDir = path.join(PUBLIC, 'catalogs');
  if (!sharedOnly && (await dirExists(catalogsDir))) {
    const catalogs = (await fs.readdir(catalogsDir)).sort();
    for (const catalog of catalogs) {
      if (catalogFilter && catalog !== catalogFilter) continue;
      const catalogPath = path.join(catalogsDir, catalog);
      const stat = await fs.stat(catalogPath);
      if (!stat.isDirectory()) continue;
      try {
        const s = await processCatalog(catalog);
        if (s) allStats.push(s);
      } catch (err) {
        console.warn(`Failed to process ${catalog}: ${err.message}`);
      }
    }
  }

  if (!catalogFilter || sharedOnly) {
    try {
      const s = await processSharedMaterials();
      if (s) allStats.push(s);
    } catch (err) {
      console.warn(`Failed to process shared/materials: ${err.message}`);
    }
  }

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  printSummary(allStats, elapsed);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
