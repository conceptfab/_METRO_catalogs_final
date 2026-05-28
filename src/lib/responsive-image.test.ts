import { describe, it, expect } from 'vitest';
import { responsiveProps } from './responsive-image';

describe('responsiveProps', () => {
  it('returns undefined for empty src', () => {
    expect(responsiveProps('', 'hero')).toBeUndefined();
    expect(responsiveProps(undefined, 'hero')).toBeUndefined();
  });

  it('returns undefined for external URLs', () => {
    expect(responsiveProps('https://example.com/img.webp', 'hero')).toBeUndefined();
  });

  it('returns undefined for SVG sources', () => {
    expect(responsiveProps('/catalogs/QX/metro_logo.svg', 'hero')).toBeUndefined();
  });

  it('returns undefined for already-generated thumbnail (recursion guard)', () => {
    expect(
      responsiveProps('/catalogs/QX/hero/img-640w.webp', 'hero'),
    ).toBeUndefined();
  });

  it('uses manifest widths when src is in manifest', () => {
    const result = responsiveProps(
      '/catalogs/QX/hero/02_26_Metro_QX_HERO_1_R3-clean_noise_thumb.webp',
      'hero',
    );
    expect(result).toBeDefined();
    expect(result!.srcSet).toContain('-640w.webp 640w');
    expect(result!.srcSet).toContain('-1280w.webp 1280w');
    expect(result!.srcSet).toContain('-1920w.webp 1920w');
    expect(result!.srcSet).toContain('-2560w.webp 2560w');
    expect(result!.srcSet).toContain(
      '/catalogs/QX/hero/02_26_Metro_QX_HERO_1_R3-clean_noise_thumb.webp 4000w',
    );
    expect(result!.sizes).toBe('100vw');
  });

  it('uses sizesOverride when provided', () => {
    const result = responsiveProps(
      '/catalogs/QX/hero/02_26_Metro_QX_HERO_1_R3-clean_noise_thumb.webp',
      'hero',
      '50vw',
    );
    expect(result!.sizes).toBe('50vw');
  });

  it('falls back to PRESET_WIDTHS for unmanaged paths not in manifest', () => {
    const result = responsiveProps('/some/other/path/image.webp', 'hero');
    expect(result).toBeDefined();
    expect(result!.srcSet).toContain('-640w.webp 640w');
    expect(result!.srcSet).toContain('-2560w.webp 2560w');
  });

  it('returns undefined for managed asset missing from manifest (no widths fallback)', () => {
    const result = responsiveProps('/catalogs/NOPE/hero/missing.webp', 'hero');
    expect(result).toBeUndefined();
  });

  it('uses gallery-thumb preset sizes by default', () => {
    const result = responsiveProps('/some/path/thumb.webp', 'gallery-thumb');
    expect(result!.sizes).toBe(
      '(min-width: 1440px) 255px, (min-width: 1024px) 18vw, 200vw',
    );
  });
});
