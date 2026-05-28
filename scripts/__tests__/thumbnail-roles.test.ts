import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const generatorSource = readFileSync(
  resolve(__dirname, '../generate-thumbnails.mjs'),
  'utf8',
);

describe('thumbnail role generation', () => {
  it('treats -home-mobile thumbnails as homepage tile assets', () => {
    expect(generatorSource).toContain("baseName.endsWith('-home-mobile')");
    expect(generatorSource).toMatch(
      /baseName\.endsWith\('-home-mobile'\)[\s\S]+SECTION_WIDTHS\.home_tile/,
    );
  });
});
