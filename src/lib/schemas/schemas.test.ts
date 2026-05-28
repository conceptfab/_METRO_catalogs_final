import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseHeroContent } from './hero';
import { parsePackshotsContent } from './packshots';

const heroFixture = JSON.parse(
  readFileSync(
    resolve(__dirname, '../../../public/catalogs/QX/hero/content.json'),
    'utf8',
  ),
);

const packshotsFixture = JSON.parse(
  readFileSync(
    resolve(__dirname, '../../../public/catalogs/QX/packshots/content.json'),
    'utf8',
  ),
);

describe('heroContentSchema', () => {
  it('parses real QX hero/content.json', () => {
    const result = parseHeroContent(heroFixture);
    expect(result.tagline).toContain('QX Modular');
    expect(result.ctaLabel).toBe('Explore Collection');
  });

  it('fills defaults when fields missing', () => {
    const result = parseHeroContent({});
    expect(result.brandLabel).toBe('');
    expect(result.collectionName).toBe('');
    expect(result.tagline).toBe('');
  });

  it('rejects non-string field', () => {
    expect(() => parseHeroContent({ tagline: 42 })).toThrow();
  });
});

describe('packshotsContentSchema', () => {
  it('parses real QX packshots/content.json', () => {
    const result = parsePackshotsContent(packshotsFixture);
    expect(result.title).toBe('QX Collection');
    expect(result.groups.length).toBeGreaterThan(0);
    expect(result.groups[0].items[0].image).toMatch(/\.webp$/);
  });

  it('fills defaults for missing optional strings', () => {
    const result = parsePackshotsContent({
      groups: [{ model: 'TEST', items: [{ code: 'C', image: 'x.webp' }] }],
    });
    expect(result.sectionLabel).toBe('');
    expect(result.groups[0].label).toBe('');
    expect(result.groups[0].items[0].name).toBe('');
  });

  it('rejects malformed group (missing model)', () => {
    expect(() =>
      parsePackshotsContent({ groups: [{ items: [] }] }),
    ).toThrow();
  });
});
