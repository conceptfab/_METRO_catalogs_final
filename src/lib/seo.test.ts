import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/site-url', () => ({
  getSiteUrl: () => 'https://catalogs.metro.example',
}));

import {
  absoluteUrl,
  catalogCanonicalPath,
  catalogOgImagePath,
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
  buildCatalogCollectionJsonLd,
  buildBreadcrumbJsonLd,
} from './seo';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('absoluteUrl', () => {
  it('prefixes a path with the site URL', () => {
    expect(absoluteUrl('/catalog/FM')).toBe(
      'https://catalogs.metro.example/catalog/FM',
    );
  });

  it('collapses a leading double slash', () => {
    expect(absoluteUrl('//catalog/FM')).toBe(
      'https://catalogs.metro.example/catalog/FM',
    );
  });

  it('returns the site URL itself for "/"', () => {
    expect(absoluteUrl('/')).toBe('https://catalogs.metro.example/');
  });
});

describe('catalogCanonicalPath', () => {
  it('returns /catalog/<id>', () => {
    expect(catalogCanonicalPath('FM')).toBe('/catalog/FM');
  });
});

describe('catalogOgImagePath', () => {
  it('returns the lowercased home thumb path', () => {
    expect(catalogOgImagePath('FM')).toBe(
      '/catalogs/FM/thumbs/fm-home.webp',
    );
  });

  it('preserves the original id casing in the directory', () => {
    expect(catalogOgImagePath('MRC1000')).toBe(
      '/catalogs/MRC1000/thumbs/mrc1000-home.webp',
    );
  });
});

describe('buildOrganizationJsonLd', () => {
  it('returns a schema.org Organization with name and absolute url', () => {
    const ld = buildOrganizationJsonLd({ brandName: 'METRO' });
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('Organization');
    expect(ld.name).toBe('METRO');
    expect(ld.url).toBe('https://catalogs.metro.example/');
  });
});

describe('buildWebSiteJsonLd', () => {
  it('returns a schema.org WebSite with name and url', () => {
    const ld = buildWebSiteJsonLd({ siteTitle: 'METRO – Catalogs' });
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('WebSite');
    expect(ld.name).toBe('METRO – Catalogs');
    expect(ld.url).toBe('https://catalogs.metro.example/');
  });
});

describe('buildCatalogCollectionJsonLd', () => {
  it('returns a CollectionPage with name, description, url, image, isPartOf', () => {
    const ld = buildCatalogCollectionJsonLd({
      catalogId: 'FM',
      meta: {
        title: 'METRO FM',
        tagline: 'modern office desk system',
        description: 'FM - Modular desk system engineered for the modern workspace.',
        brandName: 'METRO FM',
        collectionName: 'FM',
      },
      imagePath: '/catalogs/FM/thumbs/fm-home.webp',
    });
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('CollectionPage');
    expect(ld.name).toBe('METRO FM — modern office desk system');
    expect(ld.description).toBe(
      'FM - Modular desk system engineered for the modern workspace.',
    );
    expect(ld.url).toBe('https://catalogs.metro.example/catalog/FM');
    expect(ld.image).toBe(
      'https://catalogs.metro.example/catalogs/FM/thumbs/fm-home.webp',
    );
    expect(ld.isPartOf).toMatchObject({
      '@type': 'WebSite',
      url: 'https://catalogs.metro.example/',
    });
    expect(ld.about).toMatchObject({
      '@type': 'ProductGroup',
      name: 'FM',
      brand: { '@type': 'Brand', name: 'METRO FM' },
    });
  });

  it('omits the dash separator when tagline is missing', () => {
    const ld = buildCatalogCollectionJsonLd({
      catalogId: 'TS',
      meta: {
        title: 'METRO TS',
        description: 'TS description.',
        brandName: 'METRO TS',
        collectionName: 'TS',
      },
      imagePath: '/catalogs/TS/thumbs/ts-home.webp',
    });
    expect(ld.name).toBe('METRO TS');
  });
});

describe('buildBreadcrumbJsonLd', () => {
  it('emits an ordered BreadcrumbList with absolute item URLs', () => {
    const ld = buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'METRO FM', path: '/catalog/FM' },
    ]);
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('BreadcrumbList');
    expect(ld.itemListElement).toHaveLength(2);
    expect(ld.itemListElement[0]).toMatchObject({
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://catalogs.metro.example/',
    });
    expect(ld.itemListElement[1]).toMatchObject({
      '@type': 'ListItem',
      position: 2,
      name: 'METRO FM',
      item: 'https://catalogs.metro.example/catalog/FM',
    });
  });
});
