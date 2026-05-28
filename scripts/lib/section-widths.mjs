/**
 * Single source of truth for responsive image widths.
 * Imported by both:
 *  - scripts/generate-thumbnails.mjs (image generation)
 *  - tests (parity verification with src/lib/responsive-image.ts)
 */

/** @type {Record<string, number[]>} */
export const SECTION_WIDTHS = {
  hero: [640, 1280, 1920, 2560],
  gallery: [400, 800, 1200, 1600],
  gallery_thumb: [256, 512, 800, 1024, 1600],
  packshots: [480, 960, 1440],
  overview: [400, 800, 1200, 1600],
  materials_full: [400, 800, 1200, 1600],
  materials_thumb: [96, 192],
  home_tile: [640, 1280, 1920],
  nav_tile: [256, 512, 1024],
  finishes: [400, 800, 1200, 1600],
};

/**
 * Optional target aspect ratio (width / height) per preset.
 * When set, thumbnails are cropped (fit: 'cover', center) to match
 * the actual rendered container — prevents shipping pixels CSS
 * `object-cover` will throw away.
 *
 * Presets without an entry here keep the source aspect ratio.
 *
 * @type {Record<string, number>}
 */
export const SECTION_ASPECTS = {
  overview: 720 / 960,
  gallery_thumb: 1,
};
