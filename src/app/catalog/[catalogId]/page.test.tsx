import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/site-url', () => ({
  getSiteUrl: () => 'https://catalogs.metro.example',
}));

vi.mock('@/lib/catalog-loader', () => ({
  loadCatalog: vi.fn(),
  getGlobalConfig: vi.fn(),
  getCatalogList: vi.fn(),
  getCatalogFooterEntries: vi.fn(),
}));

import { loadCatalog } from '@/lib/catalog-loader';
import { generateMetadata } from './page';

const fakeCatalog = {
  id: 'FM',
  meta: {
    title: 'METRO FM',
    tagline: 'modern office desk system',
    description: 'FM - Modular desk system engineered for the modern workspace.',
    brandName: 'METRO FM',
    collectionName: 'FM',
    layoutType: 'qx' as const,
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('catalog generateMetadata', () => {
  it('returns an empty object when the catalog is missing', async () => {
    vi.mocked(loadCatalog).mockResolvedValue(null as any);
    const meta = await generateMetadata({
      params: Promise.resolve({ catalogId: 'NOPE' }),
    });
    expect(meta).toEqual({});
  });

  it('uses "{title} — {tagline}" as the title', async () => {
    vi.mocked(loadCatalog).mockResolvedValue(fakeCatalog as any);
    const meta = await generateMetadata({
      params: Promise.resolve({ catalogId: 'FM' }),
    });
    expect(meta.title).toBe('METRO FM — modern office desk system');
  });

  it('sets description from catalog.meta.description', async () => {
    vi.mocked(loadCatalog).mockResolvedValue(fakeCatalog as any);
    const meta = await generateMetadata({
      params: Promise.resolve({ catalogId: 'FM' }),
    });
    expect(meta.description).toBe(
      'FM - Modular desk system engineered for the modern workspace.',
    );
  });

  it('sets the canonical URL to /catalog/<id>', async () => {
    vi.mocked(loadCatalog).mockResolvedValue(fakeCatalog as any);
    const meta = await generateMetadata({
      params: Promise.resolve({ catalogId: 'FM' }),
    });
    expect(meta.alternates?.canonical).toBe('/catalog/FM');
  });

  it('sets OpenGraph url, type, and per-catalog image', async () => {
    vi.mocked(loadCatalog).mockResolvedValue(fakeCatalog as any);
    const meta = await generateMetadata({
      params: Promise.resolve({ catalogId: 'FM' }),
    });
    const og = meta.openGraph as any;
    expect(og?.url).toBe('/catalog/FM');
    expect(og?.type).toBe('website');
    const images = og?.images;
    expect(Array.isArray(images) ? images[0] : images).toMatchObject({
      url: '/catalogs/FM/thumbs/fm-home.webp',
    });
    expect(og?.title).toBe('METRO FM — modern office desk system');
  });

  it('falls back to plain title when tagline is missing', async () => {
    vi.mocked(loadCatalog).mockResolvedValue({
      ...fakeCatalog,
      meta: { ...fakeCatalog.meta, tagline: undefined },
    } as any);
    const meta = await generateMetadata({
      params: Promise.resolve({ catalogId: 'FM' }),
    });
    expect(meta.title).toBe('METRO FM');
    const og = meta.openGraph as any;
    const tw = meta.twitter as any;
    expect(og?.title).toBe('METRO FM');
    expect(tw?.title).toBe('METRO FM');
  });

  it('sets a summary_large_image Twitter card with the same image', async () => {
    vi.mocked(loadCatalog).mockResolvedValue(fakeCatalog as any);
    const meta = await generateMetadata({
      params: Promise.resolve({ catalogId: 'FM' }),
    });
    const tw = meta.twitter as any;
    expect(tw?.card).toBe('summary_large_image');
    expect(tw?.images).toEqual([
      '/catalogs/FM/thumbs/fm-home.webp',
    ]);
    expect(tw?.title).toBe('METRO FM — modern office desk system');
  });
});

import { render } from '@testing-library/react';
import {
  getGlobalConfig,
  getCatalogFooterEntries,
} from '@/lib/catalog-loader';
import CatalogPage from './page';

const minimalCatalog = {
  id: 'FM',
  meta: { ...fakeCatalog.meta, layoutType: 'type2' as const },
  hero: { heroImage: 'hero.webp' },
  overview: {},
  gallery: { images: [] },
  finishes: {},
  dimensions: {},
  materials: {},
  features: {},
  gettingStarted: {},
  productCodes: {},
};

describe('CatalogPage JSON-LD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadCatalog).mockResolvedValue(minimalCatalog as any);
    vi.mocked(getGlobalConfig).mockResolvedValue({
      brandName: 'METRO',
      siteTitle: 'METRO – Catalogs',
      siteSubtitle: '',
      footerText: '',
      catalogListTitle: '',
    } as any);
    vi.mocked(getCatalogFooterEntries).mockResolvedValue([] as any);
  });

  it('renders a CollectionPage script and a BreadcrumbList script', async () => {
    const ui = await CatalogPage({
      params: Promise.resolve({ catalogId: 'FM' }),
    });
    const { container } = render(ui);
    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    const payloads = Array.from(scripts).map((s) => JSON.parse(s.innerHTML));
    expect(payloads.some((p) => p['@type'] === 'CollectionPage')).toBe(true);
    expect(payloads.some((p) => p['@type'] === 'BreadcrumbList')).toBe(true);
  });

  it('the breadcrumb lists Home then the catalog title', async () => {
    const ui = await CatalogPage({
      params: Promise.resolve({ catalogId: 'FM' }),
    });
    const { container } = render(ui);
    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    const breadcrumb = Array.from(scripts)
      .map((s) => JSON.parse(s.innerHTML))
      .find((p) => p['@type'] === 'BreadcrumbList');
    expect(breadcrumb.itemListElement).toHaveLength(2);
    expect(breadcrumb.itemListElement[0].name).toBe('Home');
    expect(breadcrumb.itemListElement[1].name).toBe('METRO FM');
  });
});
