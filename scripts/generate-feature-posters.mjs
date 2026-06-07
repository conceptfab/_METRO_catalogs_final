#!/usr/bin/env node

/**
 * generate-feature-posters.mjs
 *
 * Extracts the LAST frame of every feature MP4 under
 * public/catalogs/<CATALOG>/features/ and writes it next to the video as
 * `<base>_last.webp`. These posters are the still images the print layout
 * (FeaturesPrintQX et al.) shows in place of the silent animation.
 *
 * Convention mirrored by the layouts: `<base>.mp4` → `<base>_last.webp`.
 *
 * The last frame is grabbed with ffmpeg's `-sseof`/`-update 1` trick (decode
 * the tail of the clip, overwriting the single output for each frame, so the
 * file left on disk is the final frame), then encoded to WebP with sharp using
 * the same settings as generate-thumbnails.mjs (quality 85, effort 6).
 *
 * Idempotent: a poster is (re)generated only when it is missing or older than
 * its source MP4, unless --force is passed.
 *
 * Requires `ffmpeg` on PATH and `sharp` installed.
 *
 * Usage:
 *   node scripts/generate-feature-posters.mjs
 *   node scripts/generate-feature-posters.mjs --force
 *   node scripts/generate-feature-posters.mjs --catalog QX
 */

import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import { pathsFromScript, loadSharp } from './lib/image-utils.mjs';

const { PUBLIC } = pathsFromScript(import.meta.url);
const sharp = await loadSharp();

const argv = process.argv.slice(2);
const force = argv.includes('--force');
const cIdx = argv.indexOf('--catalog');
const catalogFilter = cIdx >= 0 ? argv[cIdx + 1] : null;

const POSTER_SUFFIX = '_last.webp';
// Seconds before EOF to start decoding; comfortably covers the final frame.
const TAIL_SECONDS = 3;

function ensureFfmpeg() {
  return new Promise((resolve, reject) => {
    const p = spawn('ffmpeg', ['-version']);
    p.on('error', () =>
      reject(new Error('ffmpeg not found. Install with: brew install ffmpeg')),
    );
    p.on('close', (code) =>
      code === 0 ? resolve() : reject(new Error(`ffmpeg -version exited ${code}`)),
    );
  });
}

function extractLastFrame(inputPath, outPngPath) {
  return new Promise((resolve, reject) => {
    const args = [
      '-hide_banner',
      '-loglevel', 'error',
      '-y',
      '-sseof', `-${TAIL_SECONDS}`,
      '-i', inputPath,
      '-update', '1',
      '-frames:v', '1000',
      outPngPath,
    ];
    const p = spawn('ffmpeg', args);
    let stderr = '';
    p.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    p.on('error', reject);
    p.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited ${code}: ${stderr.trim()}`));
    });
  });
}

async function dirExists(p) {
  try {
    return (await fs.stat(p)).isDirectory();
  } catch {
    return false;
  }
}

async function mtimeMs(p) {
  try {
    return (await fs.stat(p)).mtimeMs;
  } catch {
    return -1;
  }
}

async function isStale(videoPath, posterPath) {
  const posterMtime = await mtimeMs(posterPath);
  if (posterMtime < 0) return true;
  const videoMtime = await mtimeMs(videoPath);
  return videoMtime > posterMtime;
}

async function generatePoster(videoPath, posterPath, tmpDir) {
  const tmpPng = path.join(tmpDir, `${path.basename(videoPath)}.last.png`);
  try {
    await extractLastFrame(videoPath, tmpPng);
    await sharp(tmpPng)
      .webp({ quality: 85, alphaQuality: 100, effort: 6 })
      .toFile(posterPath);
  } finally {
    await fs.unlink(tmpPng).catch(() => {});
  }
}

async function main() {
  try {
    await ensureFfmpeg();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  const catalogsDir = path.join(PUBLIC, 'catalogs');
  if (!(await dirExists(catalogsDir))) {
    console.error('No public/catalogs directory found.');
    process.exit(1);
  }

  console.log(
    `Generating feature posters (last frame → *${POSTER_SUFFIX})` +
      `${force ? ', force' : ''}${catalogFilter ? `, catalog=${catalogFilter}` : ''}`,
  );

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'feature-posters-'));
  let generated = 0;
  let skipped = 0;

  try {
    const catalogs = (await fs.readdir(catalogsDir)).sort();
    for (const catalog of catalogs) {
      if (catalogFilter && catalog !== catalogFilter) continue;
      const featuresDir = path.join(catalogsDir, catalog, 'features');
      if (!(await dirExists(featuresDir))) continue;

      const files = (await fs.readdir(featuresDir))
        .filter((f) => f.toLowerCase().endsWith('.mp4'))
        .sort();
      if (files.length === 0) continue;

      console.log(`\n${catalog}/features`);
      for (const f of files) {
        const videoPath = path.join(featuresDir, f);
        const posterName = `${path.parse(f).name}${POSTER_SUFFIX}`;
        const posterPath = path.join(featuresDir, posterName);

        if (!force && !(await isStale(videoPath, posterPath))) {
          skipped++;
          console.log(`  ${f}: up-to-date`);
          continue;
        }

        try {
          await generatePoster(videoPath, posterPath, tmpDir);
          generated++;
          console.log(`  ${f} → ${posterName}`);
        } catch (err) {
          console.warn(`  FAIL ${f}: ${err.message}`);
        }
      }
    }
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }

  console.log(`\nDone. ${generated} poster(s) generated, ${skipped} up-to-date.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
