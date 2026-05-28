#!/usr/bin/env node

/**
 * optimize-catalog-pdfs.mjs
 *
 * Shrinks every PDF in public/catalogs/<id>/Download/ in place using
 * Ghostscript. Run after generate-catalog-pdfs.mjs when you want a
 * smaller payload to deploy.
 *
 * Quality presets (Ghostscript -dPDFSETTINGS):
 *   /printer  ~300 dpi, larger file, high fidelity  (default)
 *   /prepress ~300 dpi, color-managed, largest      (closest to source)
 *   /ebook    ~150 dpi, much smaller, mild quality loss
 *   /screen    ~72 dpi, smallest, visibly degraded
 *
 * Usage:
 *   node scripts/optimize-catalog-pdfs.mjs
 *   node scripts/optimize-catalog-pdfs.mjs --quality=ebook
 *   node scripts/optimize-catalog-pdfs.mjs --quality=prepress
 *   node scripts/optimize-catalog-pdfs.mjs --only=QX,QS
 *
 * Ghostscript is required. On macOS: `brew install ghostscript`.
 * If gs is unavailable the script exits with code 0 and prints install hints,
 * so it can be wired into a deploy chain without becoming a hard dependency.
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const CATALOGS_DIR = path.join(ROOT, 'public', 'catalogs');

const VALID_QUALITIES = new Set(['screen', 'ebook', 'printer', 'prepress', 'default']);
const QUALITY = (() => {
  const flag = process.argv.find((a) => a.startsWith('--quality='));
  const v = flag ? flag.slice('--quality='.length) : 'printer';
  if (!VALID_QUALITIES.has(v)) {
    console.error(`Invalid --quality=${v}. Allowed: ${[...VALID_QUALITIES].join(', ')}`);
    process.exit(2);
  }
  return v;
})();

const ONLY = (() => {
  const flag = process.argv.find((a) => a.startsWith('--only='));
  if (!flag) return null;
  return new Set(flag.slice('--only='.length).split(',').map((s) => s.trim()).filter(Boolean));
})();

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

async function hasGhostscript() {
  return new Promise((resolve) => {
    const child = spawn('gs', ['--version'], { stdio: 'ignore' });
    child.on('error', () => resolve(false));
    child.on('exit', (code) => resolve(code === 0));
  });
}

function printInstallHint() {
  console.log(c.yellow('\n  Ghostscript (`gs`) was not found on PATH.'));
  console.log(c.dim('  Install hints:'));
  if (os.platform() === 'darwin') {
    console.log(c.dim('    brew install ghostscript'));
  } else if (os.platform() === 'linux') {
    console.log(c.dim('    apt-get install ghostscript        # Debian/Ubuntu'));
    console.log(c.dim('    dnf install ghostscript            # Fedora'));
  } else if (os.platform() === 'win32') {
    console.log(c.dim('    choco install ghostscript          # via Chocolatey'));
    console.log(c.dim('    or download installer from https://ghostscript.com/releases/'));
  }
  console.log(c.dim('  Skipping optimization (not a fatal error).'));
}

async function cleanStaleTempFiles() {
  const entries = await fs.readdir(CATALOGS_DIR, { withFileTypes: true });
  const removed = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (ONLY && !ONLY.has(entry.name)) continue;
    const downloadDir = path.join(CATALOGS_DIR, entry.name, 'Download');
    let files;
    try {
      files = await fs.readdir(downloadDir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const f of files) {
      if (!f.isFile()) continue;
      if (!f.name.toLowerCase().includes('.opt.tmp.')) continue;
      const full = path.join(downloadDir, f.name);
      try {
        await fs.unlink(full);
        removed.push(path.relative(ROOT, full));
      } catch {
        // best-effort cleanup
      }
    }
  }
  return removed;
}

async function discoverPdfs() {
  const entries = await fs.readdir(CATALOGS_DIR, { withFileTypes: true });
  const pdfs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (ONLY && !ONLY.has(entry.name)) continue;
    const downloadDir = path.join(CATALOGS_DIR, entry.name, 'Download');
    let files;
    try {
      files = await fs.readdir(downloadDir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const f of files) {
      if (!f.isFile()) continue;
      const name = f.name.toLowerCase();
      if (!name.endsWith('.pdf')) continue;
      // Belt-and-suspenders: cleanStaleTempFiles() already removes these on
      // startup, but skip here too in case it ever fails.
      if (name.includes('.opt.tmp.')) continue;
      pdfs.push({ catalogId: entry.name, file: path.join(downloadDir, f.name) });
    }
  }
  return pdfs;
}

async function optimizeOne(inputFile) {
  const tmp = `${inputFile}.opt.tmp.pdf`;
  // Reference: https://ghostscript.com/docs/9.55.0/VectorDevices.htm#PDFWRITE
  const args = [
    '-sDEVICE=pdfwrite',
    '-dCompatibilityLevel=1.4',
    `-dPDFSETTINGS=/${QUALITY}`,
    '-dNOPAUSE',
    '-dQUIET',
    '-dBATCH',
    '-dDetectDuplicateImages=true',
    '-dCompressFonts=true',
    `-sOutputFile=${tmp}`,
    inputFile,
  ];
  await new Promise((resolve, reject) => {
    const child = spawn('gs', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (b) => (stderr += b.toString()));
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`gs exited with code ${code}${stderr ? `: ${stderr.trim()}` : ''}`));
    });
  });

  const beforeStat = await fs.stat(inputFile);
  const afterStat = await fs.stat(tmp);
  // Only swap if the optimized file is actually smaller — gs can occasionally
  // produce a slightly larger output for already-tight PDFs.
  if (afterStat.size < beforeStat.size) {
    await fs.rename(tmp, inputFile);
    return { before: beforeStat.size, after: afterStat.size, swapped: true };
  }
  await fs.unlink(tmp).catch(() => {});
  return { before: beforeStat.size, after: beforeStat.size, swapped: false };
}

async function main() {
  console.log(c.bold(c.cyan('\n🗜  Catalog PDF optimizer')));
  console.log(c.dim(`   quality: /${QUALITY}`));

  if (!(await hasGhostscript())) {
    printInstallHint();
    return;
  }

  const cleaned = await cleanStaleTempFiles();
  if (cleaned.length > 0) {
    console.log(c.dim(`   cleaned ${cleaned.length} stale temp file(s):`));
    for (const p of cleaned) console.log(c.dim(`     - ${p}`));
  }

  const pdfs = await discoverPdfs();
  if (pdfs.length === 0) {
    console.log(c.yellow('\nNo PDFs found in public/catalogs/*/Download/. Run `npm run pdfs` first.'));
    return;
  }

  let totalBefore = 0;
  let totalAfter = 0;
  for (const { catalogId, file } of pdfs) {
    process.stdout.write(c.dim(`  • ${catalogId} → `));
    try {
      const { before, after, swapped } = await optimizeOne(file);
      totalBefore += before;
      totalAfter += after;
      if (swapped) {
        const ratio = ((1 - after / before) * 100).toFixed(1);
        console.log(`${c.green('ok')} ${fmtBytes(before)} → ${c.bold(fmtBytes(after))} ${c.green(`(-${ratio}%)`)}`);
      } else {
        console.log(c.dim(`already tight (${fmtBytes(before)})`));
      }
    } catch (err) {
      console.log(c.red(`failed — ${err instanceof Error ? err.message : String(err)}`));
    }
  }

  if (totalBefore > 0) {
    const ratio = ((1 - totalAfter / totalBefore) * 100).toFixed(1);
    console.log(c.bold(`\n  Total: ${fmtBytes(totalBefore)} → ${fmtBytes(totalAfter)} (${ratio}% saved)`));
  }
}

main().catch((err) => {
  console.error(c.red(`\n✗ ${err instanceof Error ? err.message : String(err)}`));
  process.exit(1);
});
