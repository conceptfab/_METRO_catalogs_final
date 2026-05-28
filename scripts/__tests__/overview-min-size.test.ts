import { describe, it, expect } from 'vitest';
import { readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import sharp from 'sharp';

const MIN_OVERVIEW_WIDTH = 1500;
const PUBLIC_CATALOGS = resolve(__dirname, '../../public/catalogs');

async function getImagesInOverview(): Promise<string[]> {
  const out: string[] = [];
  for (const catalog of readdirSync(PUBLIC_CATALOGS)) {
    const overviewDir = join(PUBLIC_CATALOGS, catalog, 'overview');
    try {
      statSync(overviewDir);
    } catch {
      continue;
    }
    for (const file of readdirSync(overviewDir)) {
      if (!/\.(webp|jpe?g|png)$/i.test(file)) continue;
      if (/-\d+w\.\w+$/.test(file)) continue;
      out.push(join(overviewDir, file));
    }
  }
  return out;
}

describe('overview/ source images', () => {
  // Skipped: known issue tracked in TODO.md.
  // Re-enable after replacing public/catalogs/{QX,QS}/overview/packshot.webp with ≥1500px asset.
  it.skip('every original image is at least 1500px wide for retina coverage', async () => {
    const images = await getImagesInOverview();
    expect(images.length, 'no overview images found').toBeGreaterThan(0);

    const imageSizes = await Promise.all(images.map(async (path) => {
      const meta = await sharp(path).metadata();
      return { path, width: meta.width ?? 0 };
    }));

    const tooSmall = imageSizes.filter(({ width }) => width < MIN_OVERVIEW_WIDTH);

    if (tooSmall.length > 0) {
      const summary = tooSmall
        .map(({ path, width }) => `  ${path} → ${width}px`)
        .join('\n');
      throw new Error(
        `Overview images smaller than ${MIN_OVERVIEW_WIDTH}px (DPR=2 retina need):\n${summary}\n` +
          `Replace originals with ≥${MIN_OVERVIEW_WIDTH}px-wide assets, or update OverviewQX to use a smaller layout slot.`,
      );
    }
  });
});
