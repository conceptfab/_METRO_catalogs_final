#!/usr/bin/env node

/**
 * generate-catalog-pdfs.mjs
 *
 * Pre-builds a static PDF for every catalog and saves it to
 * `public/catalogs/<id>/Download/metro-<id>.pdf`. Run this before deploy
 * so the floating "Download PDF" button can serve the static file
 * instead of regenerating on each click.
 *
 * Pipeline:
 *   1. Read public/catalogs/index.json + each config.json to discover IDs.
 *   2. Reuse a dev server on BASE_URL if reachable, otherwise spawn
 *      `next dev` on PORT and wait until it answers.
 *   3. For each catalog, navigate Puppeteer to /catalog/<id>/print?puppeteer=1
 *      and run the same prep used by the on-demand API route
 *      (replace <video> with poster, scroll-trigger lazy content, eager-load
 *      images) before calling page.pdf().
 *   4. Write the PDF to public/catalogs/<id>/Download/.
 *
 * Usage:
 *   node scripts/generate-catalog-pdfs.mjs
 *   node scripts/generate-catalog-pdfs.mjs --only=QX,QS
 *   BASE_URL=http://localhost:3001 node scripts/generate-catalog-pdfs.mjs
 *   PORT=3010 node scripts/generate-catalog-pdfs.mjs
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PRINTABLE_LAYOUTS } from './lib/printable-layouts.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const CATALOGS_DIR = path.join(ROOT, 'public', 'catalogs');

const PORT = Number(process.env.PORT ?? 3000);
const BASE_URL = (process.env.BASE_URL ?? `http://localhost:${PORT}`).replace(/\/$/, '');
const ONLY = (() => {
  const flag = process.argv.find((a) => a.startsWith('--only='));
  if (!flag) return null;
  return new Set(flag.slice('--only='.length).split(',').map((s) => s.trim()).filter(Boolean));
})();

const LOCAL_CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
];

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

function fmtSec(ms) {
  return `${(ms / 1000).toFixed(1)}s`;
}

async function readJson(file) {
  try {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function discoverCatalogs() {
  const index = await readJson(path.join(CATALOGS_DIR, 'index.json'));
  const ids = Array.isArray(index?.catalogs) ? index.catalogs : [];
  const result = [];
  for (const id of ids) {
    if (ONLY && !ONLY.has(id)) continue;
    const config = await readJson(path.join(CATALOGS_DIR, id, 'config.json'));
    if (!config) {
      console.warn(c.yellow(`  ⚠ ${id}: missing config.json, skipping`));
      continue;
    }
    if (!PRINTABLE_LAYOUTS.has(config?.meta?.layoutType)) {
      console.warn(c.yellow(`  ⚠ ${id}: layoutType "${config?.meta?.layoutType}" is not yet supported by print/, skipping`));
      continue;
    }
    result.push({ id, meta: config.meta });
  }
  return result;
}

async function isServerReachable(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(url, { signal: controller.signal }).catch(() => null);
    clearTimeout(timer);
    return !!res && res.ok;
  } catch {
    return false;
  }
}

async function waitForServer(url, { timeoutMs = 90_000, intervalMs = 750 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isServerReachable(url)) return true;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}

async function startDevServer() {
  console.log(c.cyan(`  ▶ Starting Next.js dev server on port ${PORT}…`));
  const child = spawn('npx', ['next', 'dev', '--port', String(PORT)], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', (buf) => {
    const line = buf.toString().trim();
    if (line) console.log(c.dim(`    [next] ${line}`));
  });
  child.stderr.on('data', (buf) => {
    const line = buf.toString().trim();
    if (line) console.log(c.dim(`    [next] ${line}`));
  });
  const ok = await waitForServer(BASE_URL, { timeoutMs: 120_000 });
  if (!ok) {
    child.kill('SIGTERM');
    throw new Error(`Dev server did not become reachable at ${BASE_URL} within 120s`);
  }
  console.log(c.green(`  ✓ Dev server ready at ${BASE_URL}`));
  return child;
}

async function resolveChromePath() {
  const fromEnv = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (fromEnv) return fromEnv;
  for (const candidate of LOCAL_CHROME_PATHS) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // try next
    }
  }
  return null;
}

const CATALOG_DEADLINE_MS = Number(process.env.PDF_CATALOG_TIMEOUT_MS ?? 120_000);

function withDeadline(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} deadline exceeded (${ms}ms)`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function generatePdfForCatalogInner(browser, catalog) {
  const url = `${BASE_URL}/catalog/${catalog.id}/print?puppeteer=1`;
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1358, deviceScaleFactor: 1 });

  const pageErrors = [];
  const failedRequests = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));
  page.on('requestfailed', (req) => {
    const failure = req.failure();
    failedRequests.push(`${req.url()} (${failure ? failure.errorText : 'unknown'})`);
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 });

    // Replace <video> with poster image — videos render black in headless Chrome.
    await page.evaluate(() => {
      document.querySelectorAll('video').forEach((video) => {
        const poster = video.poster;
        if (!poster) {
          video.style.display = 'none';
          return;
        }
        const img = document.createElement('img');
        img.src = poster;
        img.className = video.className;
        img.alt = '';
        img.setAttribute('loading', 'eager');
        video.replaceWith(img);
      });
    });

    // Scroll end-to-end to trigger IntersectionObserver-driven lazy content.
    await page.evaluate(async () => {
      const totalHeight = document.body.scrollHeight;
      const step = 500;
      for (let y = 0; y <= totalHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      window.scrollTo(0, 0);
    });

    // Force eager load and wait for every <img> to settle. Each pending image
    // gets a 5s cap so a single non-resolving asset can't hang the whole job.
    await page.evaluate(async () => {
      const PER_IMAGE_TIMEOUT_MS = 5000;
      const imgs = Array.from(document.images);
      imgs.forEach((img) => {
        img.loading = 'eager';
        if (!img.complete && img.src) {
          const src = img.src;
          img.src = '';
          img.src = src;
        }
      });
      await Promise.all(
        imgs.map((img) => {
          if (img.complete && img.naturalWidth > 0) return Promise.resolve();
          return new Promise((resolve) => {
            const done = () => resolve();
            img.addEventListener('load', done, { once: true });
            img.addEventListener('error', done, { once: true });
            setTimeout(done, PER_IMAGE_TIMEOUT_MS);
          });
        }),
      );
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    const pdfBytes = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      preferCSSPageSize: false,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      // 1920×1358 DOM pages scaled to A4 landscape (~1123×794 @ 96dpi).
      scale: 0.585,
    });

    const outDir = path.join(CATALOGS_DIR, catalog.id, 'Download');
    await fs.mkdir(outDir, { recursive: true });
    const outFile = path.join(outDir, `metro-${catalog.id.toLowerCase()}.pdf`);
    await fs.writeFile(outFile, pdfBytes);
    return { outFile, size: pdfBytes.length, pageErrors, failedRequests };
  } finally {
    await page.close().catch(() => {});
  }
}

async function generatePdfForCatalog(browser, catalog) {
  return withDeadline(
    generatePdfForCatalogInner(browser, catalog),
    CATALOG_DEADLINE_MS,
    `catalog ${catalog.id}`,
  );
}

async function main() {
  const t0 = Date.now();
  console.log(c.bold(c.cyan('\n📄 Catalog PDF builder')));
  console.log(c.dim(`   target: ${BASE_URL}`));

  const catalogs = await discoverCatalogs();
  if (catalogs.length === 0) {
    console.log(c.yellow('\nNo catalogs to build. Exiting.'));
    return;
  }
  console.log(c.dim(`   catalogs: ${catalogs.map((c2) => c2.id).join(', ')}`));

  // Make sure a server is running (reuse if reachable, otherwise spawn one).
  const alreadyRunning = await isServerReachable(BASE_URL);
  let serverProc = null;
  if (alreadyRunning) {
    console.log(c.green(`  ✓ Reusing existing server at ${BASE_URL}`));
  } else {
    serverProc = await startDevServer();
  }

  // Resolve a local Chrome we can drive with puppeteer-core.
  const executablePath = await resolveChromePath();
  if (!executablePath) {
    if (serverProc) serverProc.kill('SIGTERM');
    throw new Error(
      'No local Chrome found. Set PUPPETEER_EXECUTABLE_PATH or install Chrome.',
    );
  }

  const puppeteer = (await import('puppeteer-core')).default;
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    defaultViewport: { width: 1920, height: 1358, deviceScaleFactor: 1 },
    protocolTimeout: 600_000,
  });

  const results = [];
  let failures = 0;
  try {
    for (const catalog of catalogs) {
      const tStart = Date.now();
      process.stdout.write(c.dim(`  • ${catalog.id} → `));
      try {
        const { outFile, size, pageErrors, failedRequests } = await generatePdfForCatalog(browser, catalog);
        const rel = path.relative(ROOT, outFile);
        console.log(`${c.green('ok')} ${c.dim(rel)} ${c.bold(fmtBytes(size))} ${c.dim(fmtSec(Date.now() - tStart))}`);
        if (pageErrors?.length) {
          console.log(c.yellow(`      ⚠ page errors (${pageErrors.length}):`));
          for (const m of pageErrors.slice(0, 5)) console.log(c.dim(`        - ${m}`));
        }
        if (failedRequests?.length) {
          console.log(c.yellow(`      ⚠ failed requests (${failedRequests.length}):`));
          for (const m of failedRequests.slice(0, 5)) console.log(c.dim(`        - ${m}`));
        }
        results.push({ id: catalog.id, size, file: outFile });
      } catch (err) {
        failures += 1;
        console.log(c.red(`failed (${fmtSec(Date.now() - tStart)}) — ${err instanceof Error ? err.message : String(err)}`));
      }
    }
  } finally {
    await browser.close().catch(() => {});
    if (serverProc) {
      console.log(c.dim('  ▶ Stopping spawned dev server…'));
      serverProc.kill('SIGTERM');
    }
  }

  const total = results.reduce((sum, r) => sum + r.size, 0);
  console.log();
  console.log(c.bold(`  Built ${results.length} PDF(s) — ${fmtBytes(total)} in ${fmtSec(Date.now() - t0)}`));
  if (failures > 0) {
    console.log(c.red(`  ${failures} failure(s) above`));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(c.red(`\n✗ ${err instanceof Error ? err.message : String(err)}`));
  process.exit(1);
});
