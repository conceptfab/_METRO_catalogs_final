#!/usr/bin/env node

/**
 * generate-thumbnails.mjs
 *
 * Scans /public/catalogs/ for images and generates
 * responsive thumbnail variants appropriate for each view/layout.
 *
 * Generated files are placed next to the originals with a `-{width}w` suffix:
 *   hero_00.webp  ->  hero_00-640w.webp, hero_00-1280w.webp, hero_00-1920w.webp
 *
 * Usage:
 *   node scripts/generate-thumbnails.mjs          # generate missing thumbnails
 *   node scripts/generate-thumbnails.mjs --force   # regenerate all
 *   node scripts/generate-thumbnails.mjs --clean   # remove all generated thumbnails
 */

import fs from 'fs/promises';
import path from 'path';
import { SECTION_ASPECTS, SECTION_WIDTHS } from './lib/section-widths.mjs';
import { pathsFromScript, loadSharp, isResponsiveVariant } from './lib/image-utils.mjs';

const { ROOT, PUBLIC } = pathsFromScript(import.meta.url);
const MANIFEST_OUTPUT = path.join(
  ROOT,
  'src',
  'generated',
  'responsive-image-manifest.json',
);

const IMAGE_EXTENSIONS = new Set(['.webp']);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Check if sharp is available */
const sharp = await loadSharp();

function isImageFile(fileName) {
  return IMAGE_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

function isGeneratedThumbnail(fileName) {
  return isResponsiveVariant(fileName);
}

function thumbnailName(originalName, width) {
  const parsed = path.parse(originalName);
  return `${parsed.name}-${width}w${parsed.ext}`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toPublicUrl(filePath) {
  return `/${path.relative(PUBLIC, filePath).replace(/\\/g, '/')}`;
}

async function dirExists(dirPath) {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getImageWidth(filePath) {
  const metadata = await sharp(filePath).metadata();
  return metadata.width ?? 0;
}

// ---------------------------------------------------------------------------
// Generation logic
// ---------------------------------------------------------------------------

/**
 * Generate thumbnails for a single image at the given widths.
 * Skips widths >= the original image width.
 * @returns {number} Number of thumbnails generated
 */
async function generateForImage(imagePath, widths, force = false, aspect) {
  let generated = 0;
  const dir = path.dirname(imagePath);
  const fileName = path.basename(imagePath);
  const ext = path.extname(fileName).toLowerCase();

  let originalWidth;
  try {
    originalWidth = await getImageWidth(imagePath);
  } catch (err) {
    console.warn(`  Skipping ${imagePath}: ${err.message}`);
    return 0;
  }

  const maxRequested = Math.max(...widths);
  if (originalWidth < maxRequested) {
    console.warn(
      `    ⚠ ${path.basename(imagePath)}: source ${originalWidth}px < largest preset ${maxRequested}px — Retina users will see fallback to original`,
    );
  }

  for (const w of widths) {
    if (w >= originalWidth) continue;

    const outName = thumbnailName(fileName, w);
    const outPath = path.join(dir, outName);

    if (!force && (await fileExists(outPath))) continue;

    try {
      const targetHeight = aspect ? Math.round(w / aspect) : null;
      let pipeline = sharp(imagePath).resize(w, targetHeight, {
        withoutEnlargement: true,
        fit: aspect ? 'cover' : 'inside',
        position: aspect ? 'center' : undefined,
      });

      pipeline = pipeline.webp({ quality: 85, alphaQuality: 100, effort: 6 });

      await pipeline.toFile(outPath);
      generated++;
    } catch (err) {
      console.warn(`  Failed to generate ${outName}: ${err.message}`);
    }
  }

  return generated;
}

/**
 * Process a directory, generating thumbnails for all images found.
 */
async function processDirectory(dirPath, widths, force = false, aspect) {
  if (!(await dirExists(dirPath))) return 0;

  const files = await fs.readdir(dirPath);
  let total = 0;

  for (const file of files) {
    if (!isImageFile(file)) continue;
    if (isGeneratedThumbnail(file)) continue;

    const filePath = path.join(dirPath, file);
    total += await generateForImage(filePath, widths, force, aspect);
  }

  return total;
}

/**
 * Process gallery directory with split logic:
 * - images[0] in content.json → main image, gets gallery widths
 * - images[1..] → thumbnails, get gallery_thumb widths
 * - any image not referenced in content.json → skipped (orphan)
 *
 * Also prunes generated thumbnails that no longer match the role's
 * width set (e.g. legacy 1600w sitting next to a thumb image).
 */
async function processGalleryDirectory(dirPath, force = false) {
  if (!(await dirExists(dirPath))) return 0;

  const contentPath = path.join(dirPath, 'content.json');
  let mainImageName = null;
  const thumbImageNames = new Set();

  if (await fileExists(contentPath)) {
    try {
      const content = JSON.parse(await fs.readFile(contentPath, 'utf8'));
      const images = Array.isArray(content?.images) ? content.images : [];
      const nameOf = (entry) => entry?.image ?? entry?.src ?? null;
      if (images[0]) mainImageName = nameOf(images[0]);
      for (let i = 1; i < images.length; i++) {
        const n = nameOf(images[i]);
        if (n) thumbImageNames.add(n);
      }
    } catch (err) {
      console.warn(`  Failed to read ${contentPath}: ${err.message}`);
    }
  }

  const files = await fs.readdir(dirPath);
  let total = 0;

  for (const file of files) {
    if (!isImageFile(file)) continue;
    if (isGeneratedThumbnail(file)) continue;

    const filePath = path.join(dirPath, file);
    let widths;
    let aspect;
    if (file === mainImageName) {
      widths = SECTION_WIDTHS.gallery;
      aspect = SECTION_ASPECTS.gallery;
    } else if (thumbImageNames.has(file)) {
      widths = SECTION_WIDTHS.gallery_thumb;
      aspect = SECTION_ASPECTS.gallery_thumb;
    } else {
      console.warn(`    skip ${file} (not referenced in content.json)`);
      continue;
    }

    // Prune generated thumbs whose width is no longer in this image's role set.
    const parsed = path.parse(file);
    const expected = new Set(widths.map((w) => `${parsed.name}-${w}w${parsed.ext}`));
    const stalePattern = new RegExp(
      `^${escapeRegExp(parsed.name)}-\\d+w${escapeRegExp(parsed.ext)}$`,
      'i',
    );
    for (const sibling of files) {
      if (!stalePattern.test(sibling)) continue;
      if (expected.has(sibling)) continue;
      await fs.unlink(path.join(dirPath, sibling));
      console.log(`    pruned ${sibling}`);
    }

    total += await generateForImage(filePath, widths, force, aspect);
  }

  return total;
}

/**
 * Process the per-catalog thumbs/ directory.
 * Files are split by suffix:
 *  - *-home.webp → homepage tiles, get wider variants (640/1280/1920)
 *  - *-home-mobile.webp → mobile homepage tiles, same wider variants
 *  - *-nav.webp  → footer / nav tiles, get small variants (256/512/1024)
 */
async function processThumbsDirectory(dirPath, force = false) {
  if (!(await dirExists(dirPath))) return 0;

  const files = await fs.readdir(dirPath);
  let total = 0;

  for (const file of files) {
    if (!isImageFile(file)) continue;
    if (isGeneratedThumbnail(file)) continue;

    const filePath = path.join(dirPath, file);
    const baseName = path.parse(file).name;

    let widths;
    if (baseName.endsWith('-home-mobile')) {
      widths = SECTION_WIDTHS.home_tile;
    } else if (baseName.endsWith('-home')) {
      widths = SECTION_WIDTHS.home_tile;
    } else if (baseName.endsWith('-nav')) {
      widths = SECTION_WIDTHS.nav_tile;
    } else {
      continue;
    }

    total += await generateForImage(filePath, widths, force);
  }

  return total;
}

/**
 * Process materials directory with split logic:
 * - *_thumb.webp files get tiny sizes (swatches)
 * - other images get medium sizes (configurator preview)
 */
async function processMaterialsDirectory(dirPath, force = false) {
  if (!(await dirExists(dirPath))) return 0;

  const files = await fs.readdir(dirPath);
  let total = 0;

  for (const file of files) {
    if (!isImageFile(file)) continue;
    if (isGeneratedThumbnail(file)) continue;

    const filePath = path.join(dirPath, file);
    const isThumb = file.includes('_thumb');
    const widths = isThumb
      ? SECTION_WIDTHS.materials_thumb
      : SECTION_WIDTHS.materials_full;

    total += await generateForImage(filePath, widths, force);
  }

  return total;
}

// ---------------------------------------------------------------------------
// Clean generated thumbnails
// ---------------------------------------------------------------------------

async function cleanDirectory(dirPath) {
  if (!(await dirExists(dirPath))) return 0;

  const files = await fs.readdir(dirPath);
  let removed = 0;

  for (const file of files) {
    if (isGeneratedThumbnail(file)) {
      await fs.unlink(path.join(dirPath, file));
      removed++;
    }
  }

  return removed;
}

async function cleanAll() {
  console.log('Cleaning generated thumbnails...');
  let total = 0;

  const catalogsDir = path.join(PUBLIC, 'catalogs');
  if (await dirExists(catalogsDir)) {
    const catalogs = await fs.readdir(catalogsDir);
    for (const catalog of catalogs) {
      const catalogPath = path.join(catalogsDir, catalog);
      const stat = await fs.stat(catalogPath);
      if (!stat.isDirectory()) continue;

      const sections = await fs.readdir(catalogPath);
      for (const section of sections) {
        const sectionPath = path.join(catalogPath, section);
        const sectionStat = await fs.stat(sectionPath);
        if (!sectionStat.isDirectory()) continue;
        total += await cleanDirectory(sectionPath);
      }
    }
  }

  const sharedMaterialsDir = path.join(PUBLIC, 'shared', 'materials');
  if (await dirExists(sharedMaterialsDir)) {
    total += await cleanDirectory(sharedMaterialsDir);
  }

  console.log(`Removed ${total} generated thumbnails.`);
  return total;
}

// ---------------------------------------------------------------------------
// Manifest of actually generated responsive variants
// ---------------------------------------------------------------------------

async function collectResponsiveManifestEntries(dirPath, manifest) {
  if (!(await dirExists(dirPath))) return;

  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const siblingFiles = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      await collectResponsiveManifestEntries(fullPath, manifest);
      continue;
    }

    if (!isImageFile(entry.name)) continue;
    if (isGeneratedThumbnail(entry.name)) continue;

    const parsed = path.parse(entry.name);
    const thumbnailPattern = new RegExp(
      `^${escapeRegExp(parsed.name)}-(\\d+)w${escapeRegExp(parsed.ext)}$`,
      'i',
    );
    const widths = siblingFiles
      .map((fileName) => {
        const match = fileName.match(thumbnailPattern);
        return match ? Number(match[1]) : null;
      })
      .filter((width) => Number.isFinite(width))
      .sort((left, right) => left - right);

    manifest[toPublicUrl(fullPath)] = widths;
  }
}

async function writeResponsiveManifest() {
  const manifest = {};

  await collectResponsiveManifestEntries(path.join(PUBLIC, 'catalogs'), manifest);
  await collectResponsiveManifestEntries(path.join(PUBLIC, 'shared'), manifest);

  await fs.mkdir(path.dirname(MANIFEST_OUTPUT), { recursive: true });
  await fs.writeFile(MANIFEST_OUTPUT, `${JSON.stringify(manifest, null, 2)}\n`);

  return Object.keys(manifest).length;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');

  if (args.includes('--clean')) {
    await cleanAll();
    return;
  }

  if (force) {
    console.log('Force mode: regenerating all thumbnails...');
  }

  console.log('Generating responsive thumbnails...');
  const startTime = Date.now();
  let totalGenerated = 0;

  // Process each catalog
  const catalogsDir = path.join(PUBLIC, 'catalogs');
  if (!(await dirExists(catalogsDir))) {
    console.log('No catalogs directory found. Nothing to do.');
    return;
  }

  const catalogs = await fs.readdir(catalogsDir);

  for (const catalog of catalogs) {
    const catalogPath = path.join(catalogsDir, catalog);
    const stat = await fs.stat(catalogPath);
    if (!stat.isDirectory()) continue;

    console.log(`\n  ${catalog}/`);

    // Hero
    const heroDir = path.join(catalogPath, 'hero');
    const heroCount = await processDirectory(heroDir, SECTION_WIDTHS.hero, force);
    if (heroCount) console.log(`    hero: ${heroCount} thumbnails`);

    // Gallery (main image + sibling thumbnails — split by role from content.json)
    const galleryDir = path.join(catalogPath, 'gallery');
    const galleryCount = await processGalleryDirectory(galleryDir, force);
    if (galleryCount) console.log(`    gallery: ${galleryCount} thumbnails`);

    // Overview
    const overviewDir = path.join(catalogPath, 'overview');
    const overviewCount = await processDirectory(
      overviewDir,
      SECTION_WIDTHS.overview,
      force,
      SECTION_ASPECTS.overview,
    );
    if (overviewCount) console.log(`    overview: ${overviewCount} thumbnails`);

    // Packshots
    const packshotsDir = path.join(catalogPath, 'packshots');
    const packshotsCount = await processDirectory(
      packshotsDir,
      SECTION_WIDTHS.packshots,
      force,
    );
    if (packshotsCount) console.log(`    packshots: ${packshotsCount} thumbnails`);

    // Materials (split logic)
    const materialsDir = path.join(catalogPath, 'materials');
    const materialsCount = await processMaterialsDirectory(materialsDir, force);
    if (materialsCount) console.log(`    materials: ${materialsCount} thumbnails`);

    // Finishes (full-size illustrations rendered with object-contain)
    const finishesDir = path.join(catalogPath, 'finishes');
    const finishesCount = await processDirectory(
      finishesDir,
      SECTION_WIDTHS.finishes,
      force,
    );
    if (finishesCount) console.log(`    finishes: ${finishesCount} thumbnails`);

    // Homepage / nav tiles (split by -home / -nav suffix)
    const thumbsDir = path.join(catalogPath, 'thumbs');
    const thumbsCount = await processThumbsDirectory(thumbsDir, force);
    if (thumbsCount) console.log(`    thumbs: ${thumbsCount} thumbnails`);

    totalGenerated +=
      heroCount +
      galleryCount +
      overviewCount +
      packshotsCount +
      materialsCount +
      finishesCount +
      thumbsCount;
  }

  // Shared materials (cross-catalog swatches)
  const sharedMaterialsDir = path.join(PUBLIC, 'shared', 'materials');
  if (await dirExists(sharedMaterialsDir)) {
    const sharedMaterialsCount = await processMaterialsDirectory(
      sharedMaterialsDir,
      force,
    );
    if (sharedMaterialsCount) {
      console.log(`\n  shared/`);
      console.log(`    materials: ${sharedMaterialsCount} thumbnails`);
    }
    totalGenerated += sharedMaterialsCount;
  }

  const manifestEntries = await writeResponsiveManifest();
  console.log(`\nUpdated responsive image manifest for ${manifestEntries} assets.`);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nDone. Generated ${totalGenerated} thumbnails in ${elapsed}s.`);
}

main().catch((err) => {
  console.error('Thumbnail generation failed:', err);
  process.exit(1);
});
