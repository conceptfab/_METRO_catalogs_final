#!/usr/bin/env node

/**
 * optimize-videos.mjs
 *
 * Recompresses every MP4 under public/catalogs/<CATALOG>/features/ with the
 * project's canonical silent-feature-animation settings:
 *   libx264, CRF 23, preset slow, +faststart, no audio.
 *
 * Idempotent: the re-encoded file replaces the original ONLY if it is smaller.
 * Pass --force to also accept marginal gains; HARD SAFETY still refuses any
 * replacement where the new file is >= the original size.
 *
 * Requires `ffmpeg` on PATH.
 *
 * Usage:
 *   node scripts/optimize-videos.mjs
 *   node scripts/optimize-videos.mjs --force
 *   node scripts/optimize-videos.mjs --catalog QX
 *   node scripts/optimize-videos.mjs --crf 23 --preset slow
 */

import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { pathsFromScript } from './lib/image-utils.mjs';

const { PUBLIC } = pathsFromScript(import.meta.url);

const argv = process.argv.slice(2);
const force = argv.includes('--force');

const crfIdx = argv.indexOf('--crf');
const crf = crfIdx >= 0 ? argv[crfIdx + 1] : '23';

const presetIdx = argv.indexOf('--preset');
const preset = presetIdx >= 0 ? argv[presetIdx + 1] : 'slow';

const cIdx = argv.indexOf('--catalog');
const catalogFilter = cIdx >= 0 ? argv[cIdx + 1] : null;

const CONVERGENCE_RATIO = 0.98;

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

function encodeMp4(inputPath, outPath) {
  return new Promise((resolve, reject) => {
    const args = [
      '-hide_banner',
      '-loglevel', 'error',
      '-y',
      '-i', inputPath,
      '-c:v', 'libx264',
      '-crf', String(crf),
      '-preset', String(preset),
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      '-an',
      outPath,
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

async function optimizeVideo(filePath, label) {
  const before = (await fs.stat(filePath)).size;
  const tmp = `${filePath}.tmp.mp4`;

  try {
    await encodeMp4(filePath, tmp);
  } catch (err) {
    await fs.unlink(tmp).catch(() => {});
    throw err;
  }

  const after = (await fs.stat(tmp)).size;

  // HARD SAFETY: never replace with equal-or-larger file.
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

async function processFeaturesDir(dir, label, stats) {
  if (!(await dirExists(dir))) return;
  const files = (await fs.readdir(dir)).filter((f) => f.toLowerCase().endsWith('.mp4'));
  files.sort();

  for (const f of files) {
    const filePath = path.join(dir, f);
    try {
      const r = await optimizeVideo(filePath, label);
      stats.before += r.before;
      stats.after += r.after;
      if (r.skipped) {
        stats.skipped++;
        console.log(
          `  ${label}/${f}: ${fmtBytes(r.before)} → keep (${r.reason})`,
        );
      } else {
        stats.processed++;
        const saved = r.before - r.after;
        console.log(
          `  ${label}/${f}: ${fmtBytes(r.before)} → ${fmtBytes(r.after)} (-${fmtPct(saved, r.before)})`,
        );
      }
    } catch (err) {
      console.warn(`  FAIL ${label}/${f}: ${err.message}`);
    }
  }
}

const COLS = { scope: 18, p: 8, s: 8, b: 12, a: 12, sv: 10 };
const TOTAL_WIDTH = 2 + COLS.scope + COLS.p + COLS.s + COLS.b + COLS.a + COLS.sv;

function row(scope, p, s, b, a, sv) {
  return (
    '  ' +
    padR(scope, COLS.scope) +
    padL(p, COLS.p) +
    padL(s, COLS.s) +
    padL(b, COLS.b) +
    padL(a, COLS.a) +
    padL(sv, COLS.sv)
  );
}

function printSummary(allStats, elapsedSec) {
  const rows = allStats.filter((s) => s.before > 0 || s.processed > 0 || s.skipped > 0);

  console.log('\n' + '═'.repeat(TOTAL_WIDTH));
  console.log(
    `  Video optimization summary  ·  libx264 crf=${crf} preset=${preset} +faststart -an  ·  ${elapsedSec}s`,
  );
  console.log('═'.repeat(TOTAL_WIDTH));

  if (rows.length === 0) {
    console.log('  No work found.');
    console.log('═'.repeat(TOTAL_WIDTH));
    return;
  }

  console.log(row('Scope', 'opt', 'skip', 'before', 'after', 'saved'));
  console.log('  ' + '─'.repeat(TOTAL_WIDTH - 2));

  const g = { p: 0, s: 0, b: 0, a: 0 };
  for (const s of rows) {
    g.p += s.processed;
    g.s += s.skipped;
    g.b += s.before;
    g.a += s.after;
    const saved = s.before - s.after;
    console.log(
      row(
        s.scope,
        s.processed || '—',
        s.skipped || '—',
        s.before ? fmtBytes(s.before) : '—',
        s.after ? fmtBytes(s.after) : '—',
        saved > 0 ? `-${fmtPct(saved, s.before)}` : '—',
      ),
    );
  }

  console.log('  ' + '─'.repeat(TOTAL_WIDTH - 2));
  const gSaved = g.b - g.a;
  console.log(
    row(
      'TOTAL',
      g.p,
      g.s,
      fmtBytes(g.b),
      fmtBytes(g.a),
      gSaved > 0 ? `-${fmtPct(gSaved, g.b)}` : '—',
    ),
  );
  console.log('═'.repeat(TOTAL_WIDTH));
}

async function main() {
  try {
    await ensureFfmpeg();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  console.log(
    `Optimizing videos — libx264 crf=${crf} preset=${preset} +faststart -an${force ? ', force' : ''}` +
      (catalogFilter ? `, catalog=${catalogFilter}` : ''),
  );

  const t0 = Date.now();
  const allStats = [];

  const catalogsDir = path.join(PUBLIC, 'catalogs');
  if (!(await dirExists(catalogsDir))) {
    console.error('No public/catalogs directory found.');
    process.exit(1);
  }

  const catalogs = (await fs.readdir(catalogsDir)).sort();
  for (const catalog of catalogs) {
    if (catalogFilter && catalog !== catalogFilter) continue;
    const featuresDir = path.join(catalogsDir, catalog, 'features');
    if (!(await dirExists(featuresDir))) continue;
    const stats = { scope: `${catalog}/features`, processed: 0, skipped: 0, before: 0, after: 0 };
    console.log(`\n${catalog}/features`);
    await processFeaturesDir(featuresDir, `${catalog}/features`, stats);
    allStats.push(stats);
  }

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  printSummary(allStats, elapsed);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
