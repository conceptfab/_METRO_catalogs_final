import { describe, it, expect } from 'vitest';
import { SECTION_WIDTHS } from '../lib/section-widths.mjs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const responsiveImageSource = readFileSync(
  resolve(__dirname, '../../src/lib/responsive-image.ts'),
  'utf8',
);

function extractPresetWidths(): Record<string, number[]> {
  const blockMatch = responsiveImageSource.match(
    /PRESET_WIDTHS:\s*Record<ImagePreset,\s*number\[\]>\s*=\s*\{([\s\S]*?)\}/,
  );
  if (!blockMatch) {
    throw new Error('Could not locate PRESET_WIDTHS in responsive-image.ts');
  }
  const body = blockMatch[1];
  const out: Record<string, number[]> = {};
  const entryRe = /'?([\w-]+)'?\s*:\s*\[([\d,\s]+)\]/g;
  let match: RegExpExecArray | null;
  while ((match = entryRe.exec(body)) !== null) {
    const widths: number[] = [];
    for (const value of match[2].split(',')) {
      const width = parseInt(value.trim(), 10);
      if (Number.isFinite(width)) {
        widths.push(width);
      }
    }
    out[match[1]] = widths;
  }
  return out;
}

const SECTION_TO_PRESET: Record<string, string> = {
  hero: 'hero',
  gallery: 'gallery',
  gallery_thumb: 'gallery-thumb',
  packshots: 'packshot',
  overview: 'overview',
  materials_full: 'materials-full',
  materials_thumb: 'materials-thumb',
  home_tile: 'home-tile',
  nav_tile: 'nav-tile',
  finishes: 'finishes',
};

describe('responsive-image preset parity', () => {
  const presetWidths = extractPresetWidths();

  it('every section in SECTION_WIDTHS has matching widths in PRESET_WIDTHS', () => {
    for (const [section, sectionWidths] of Object.entries(SECTION_WIDTHS)) {
      const presetName = SECTION_TO_PRESET[section];
      expect(presetName, `no preset mapping for section "${section}"`).toBeDefined();
      const preset = presetWidths[presetName];
      expect(preset, `PRESET_WIDTHS missing "${presetName}"`).toBeDefined();
      expect(preset.toSorted((a, b) => a - b)).toEqual(
        sectionWidths.toSorted((a, b) => a - b),
      );
    }
  });
});
