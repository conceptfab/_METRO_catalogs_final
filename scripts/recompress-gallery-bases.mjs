#!/usr/bin/env node

/**
 * recompress-gallery-bases.mjs
 *
 * Recompresses base .webp files in public/catalogs/<CATALOG>/gallery/
 * to quality=82 / effort=6 in-place using sharp.
 * Skips generated thumbnail variants (*-NNNw.webp).
 *
 * Idempotent: without --force, compresses to a buffer and skips writing
 * if the new size is within 2% of current (convergence check).
 *
 * Usage:
 *   node scripts/recompress-gallery-bases.mjs
 *   node scripts/recompress-gallery-bases.mjs --force
 *   node scripts/recompress-gallery-bases.mjs --quality 80
 */

import fs from 'fs/promises';
import path from 'path';
import { pathsFromScript, loadSharp, isResponsiveVariant } from './lib/image-utils.mjs';

const { ROOT, PUBLIC } = pathsFromScript(import.meta.url);
const sharp = await loadSharp();

const args = process.argv.slice(2);
const force = args.includes('--force');
const qualityFlagIdx = args.indexOf('--quality');
const quality =
  qualityFlagIdx >= 0 ? Number(args[qualityFlagIdx + 1]) : 82;

// Ratio tolerance: skip if new compressed size is within 2% of current.
// First compression: ratio << 0.98 (large files go from ~1MB to ~300KB).
// Subsequent runs: ratio ~0.997 → skip (already at this quality level).
const CONVERGENCE_RATIO = 0.98;

function isGeneratedThumbnail(name) {
  return isResponsiveVariant(name);
}

async function recompress(filePath) {
  const stat = await fs.stat(filePath);

  if (!force) {
    const buf = await sharp(filePath)
      .webp({ quality, alphaQuality: 100, effort: 6 })
      .toBuffer();
    if (buf.length / stat.size >= CONVERGENCE_RATIO) {
      return { skipped: true, before: stat.size, after: stat.size };
    }
    const tmpPath = `${filePath}.tmp`;
    await fs.writeFile(tmpPath, buf);
    await fs.rename(tmpPath, filePath);
    return { skipped: false, before: stat.size, after: buf.length };
  }

  // --force: skip convergence check, always write
  const tmpPath = `${filePath}.tmp`;
  await sharp(filePath)
    .webp({ quality, alphaQuality: 100, effort: 6 })
    .toFile(tmpPath);
  const newStat = await fs.stat(tmpPath);
  await fs.rename(tmpPath, filePath);
  return { skipped: false, before: stat.size, after: newStat.size };
}

async function processGallery(galleryDir) {
  let totalBefore = 0;
  let totalAfter = 0;
  let processed = 0;
  let skipped = 0;

  const files = await fs.readdir(galleryDir);
  for (const file of files) {
    if (!file.endsWith('.webp')) continue;
    if (isGeneratedThumbnail(file)) continue;

    const filePath = path.join(galleryDir, file);
    const result = await recompress(filePath);
    totalBefore += result.before;
    totalAfter += result.after;

    if (result.skipped) {
      skipped++;
      continue;
    }
    processed++;
    const pct = (((result.before - result.after) / result.before) * 100).toFixed(1);
    console.log(
      `  ${file}: ${(result.before / 1024).toFixed(0)}K → ${(result.after / 1024).toFixed(0)}K (-${pct}%)`,
    );
  }

  return { totalBefore, totalAfter, processed, skipped };
}

async function main() {
  console.log(`Recompressing gallery bases (q=${quality}, effort=6)${force ? ' [force]' : ''}...`);

  const catalogsDir = path.join(PUBLIC, 'catalogs');
  const catalogs = await fs.readdir(catalogsDir);

  let grandBefore = 0;
  let grandAfter = 0;

  for (const catalog of catalogs) {
    const galleryDir = path.join(catalogsDir, catalog, 'gallery');
    try {
      await fs.access(galleryDir);
    } catch {
      continue;
    }
    console.log(`\n${catalog}/gallery:`);
    const r = await processGallery(galleryDir);
    grandBefore += r.totalBefore;
    grandAfter += r.totalAfter;
    if (r.skipped) console.log(`  (skipped ${r.skipped} already-optimal files)`);
  }

  const saved = grandBefore - grandAfter;
  console.log(
    `\nDone. Total: ${(grandBefore / 1024).toFixed(0)}K → ${(grandAfter / 1024).toFixed(0)}K (saved ${(saved / 1024).toFixed(0)}K)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
