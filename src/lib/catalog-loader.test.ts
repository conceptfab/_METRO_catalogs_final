import { describe, it, expect } from 'vitest';
import {
  IMAGE_EXTENSION_PRIORITY,
  WEBP_SOURCE_EXTENSIONS,
  SUPPORTED_MATERIAL_EXTENSIONS,
} from './catalog-loader';

describe('catalog-loader image format support', () => {
  it('only accepts .webp', () => {
    expect(IMAGE_EXTENSION_PRIORITY).toEqual(['.webp']);
    expect([...WEBP_SOURCE_EXTENSIONS]).toEqual([]);
    expect([...SUPPORTED_MATERIAL_EXTENSIONS]).toEqual(['.webp']);
  });
});
