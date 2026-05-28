#!/usr/bin/env node

/**
 * generate-mrc1000-combinations.mjs
 *
 * Composes all body × hutch color combinations from the MRC1000 customization
 * layers and writes them as flattened .webp frames, one per pair.
 *
 * Layer stack matches the runtime configurator in
 * src/layouts/mrc1000/MaterialsMRC1000.tsx:
 *   1. metro_{body}.webp          (opaque base)
 *   2. metro_top_shadow.webp      (alpha shadow, multiply blend)
 *   3. metro_top_{hutch}.webp     (alpha hutch top, normal blend)
 *
 * Output: public/catalogs/MRC1000/customization/combinations/
 *         metro_{body}_{hutch}.webp
 *
 * Usage:
 *   node scripts/generate-mrc1000-combinations.mjs
 *   node scripts/generate-mrc1000-combinations.mjs --force
 *   node scripts/generate-mrc1000-combinations.mjs --quality 92
 *   node scripts/generate-mrc1000-combinations.mjs --body U100      # filter body
 *   node scripts/generate-mrc1000-combinations.mjs --hutch W210     # filter hutch
 */

import fs from 'fs/promises';
import path from 'path';
import { pathsFromScript, loadSharp } from './lib/image-utils.mjs';

const { PUBLIC } = pathsFromScript(import.meta.url);
const sharp = await loadSharp();

const SRC_DIR = path.join(PUBLIC, 'catalogs', 'MRC1000', 'customization');
const OUT_DIR = path.join(SRC_DIR, 'combinations');
const SHADOW_FILE = 'metro_top_shadow.webp';

const args = process.argv.slice(2);
const force = args.includes('--force');
const qualityFlagIdx = args.indexOf('--quality');
const quality = qualityFlagIdx >= 0 ? Number(args[qualityFlagIdx + 1]) : 90;
const bodyFilterIdx = args.indexOf('--body');
const bodyFilter = bodyFilterIdx >= 0 ? args[bodyFilterIdx + 1] : null;
const hutchFilterIdx = args.indexOf('--hutch');
const hutchFilter = hutchFilterIdx >= 0 ? args[hutchFilterIdx + 1] : null;

function extractCode(name, prefix) {
  const re = new RegExp(`^${prefix}([UW]\\d+)\\.webp$`);
  const match = name.match(re);
  return match ? match[1] : null;
}

async function collectCodes() {
  const entries = await fs.readdir(SRC_DIR);
  const bodies = new Set();
  const hutches = new Set();
  for (const name of entries) {
    const body = extractCode(name, 'metro_');
    if (body) bodies.add(body);
    const hutch = extractCode(name, 'metro_top_');
    if (hutch) hutches.add(hutch);
  }
  return {
    bodies: [...bodies].sort(),
    hutches: [...hutches].sort(),
  };
}

async function ensureShadowExists() {
  try {
    await fs.access(path.join(SRC_DIR, SHADOW_FILE));
  } catch {
    console.error(`Error: missing shadow layer ${SHADOW_FILE} in ${SRC_DIR}`);
    process.exit(1);
  }
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Pre-flatten shadow onto white so its alpha is baked into RGB.
 * sharp's `blend: 'multiply'` ignores the source alpha and multiplies RGB
 * directly — without this step, the shadow's stored RGB (~228 light gray)
 * tints the entire body. Flattening makes transparent regions pure white
 * (multiply identity), so only the actual shadow area darkens the body.
 */
async function prepareShadowBuffer() {
  return sharp(path.join(SRC_DIR, SHADOW_FILE))
    .flatten({ background: '#ffffff' })
    .toBuffer();
}

async function compose(bodyCode, hutchCode, shadowBuffer) {
  const bodyPath = path.join(SRC_DIR, `metro_${bodyCode}.webp`);
  const hutchPath = path.join(SRC_DIR, `metro_top_${hutchCode}.webp`);
  const outPath = path.join(OUT_DIR, `metro_${bodyCode}_${hutchCode}.webp`);

  if (!force && (await exists(outPath))) {
    return { outPath, skipped: true };
  }

  await sharp(bodyPath)
    .composite([
      { input: shadowBuffer, blend: 'multiply' },
      { input: hutchPath, blend: 'over' },
    ])
    .webp({ quality, effort: 6 })
    .toFile(outPath);

  return { outPath, skipped: false };
}

async function main() {
  await ensureShadowExists();
  await fs.mkdir(OUT_DIR, { recursive: true });

  let { bodies, hutches } = await collectCodes();
  if (bodyFilter) bodies = bodies.filter((c) => c === bodyFilter);
  if (hutchFilter) hutches = hutches.filter((c) => c === hutchFilter);

  if (bodies.length === 0 || hutches.length === 0) {
    console.error('Error: no matching body/hutch codes after filters.');
    process.exit(1);
  }

  const total = bodies.length * hutches.length;
  console.log(
    `MRC1000 combinations: ${bodies.length} body × ${hutches.length} hutch = ${total} frames`,
  );
  console.log(`Output: ${path.relative(process.cwd(), OUT_DIR)}`);
  console.log(`Quality: ${quality}${force ? '  (force overwrite)' : ''}`);
  console.log('');

  const shadowBuffer = await prepareShadowBuffer();

  let done = 0;
  let written = 0;
  let skipped = 0;
  for (const body of bodies) {
    for (const hutch of hutches) {
      const { skipped: wasSkipped } = await compose(body, hutch, shadowBuffer);
      done += 1;
      if (wasSkipped) skipped += 1;
      else written += 1;
      const tag = wasSkipped ? 'skip' : ' ok ';
      process.stdout.write(
        `[${String(done).padStart(3)}/${total}] ${tag}  metro_${body}_${hutch}.webp\n`,
      );
    }
  }

  console.log('');
  console.log(`Done. Written: ${written}, skipped: ${skipped}, total: ${done}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
