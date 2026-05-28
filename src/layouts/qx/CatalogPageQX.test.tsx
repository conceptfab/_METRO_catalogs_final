import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CatalogPageQX from './CatalogPageQX';
import type { CatalogData } from '@/types/catalog';
import type { GlobalConfig } from '@/lib/catalog-loader';

// Stub all heavy child layouts so the test focuses solely on CatalogNav brandLabel.
vi.mock('./HeroQX', () => ({ default: () => <div data-testid="hero" /> }));
vi.mock('./OverviewQX', () => ({ default: () => <div data-testid="overview" /> }));
vi.mock('./GalleryQX', () => ({ default: () => <div data-testid="gallery" /> }));
vi.mock('./FinishesQX', () => ({ default: () => <div data-testid="finishes" /> }));
vi.mock('./DimensionsQX', () => ({ default: () => <div data-testid="dimensions" /> }));
vi.mock('./MaterialsQX', () => ({ default: () => <div data-testid="materials" /> }));
vi.mock('./FeaturesQX', () => ({ default: () => <div data-testid="features" /> }));
vi.mock('./GettingStartedQX', () => ({ default: () => <div data-testid="getting-started" /> }));
vi.mock('./PackshotsQX', () => ({ default: () => <div data-testid="packshots" /> }));
vi.mock('./ProductCodesQX', () => ({ default: () => <div data-testid="product-codes" /> }));

function makeCatalog(overrides: Partial<CatalogData> = {}): CatalogData {
  return {
    id: 'QS',
    meta: { theme: 'qx0', brandName: 'METRO QS', layoutType: 'qx' } as any,
    sections: [{ id: 'overview', label: 'Overview' }],
    hero: { brandLabel: 'METRO QS', slides: [] } as any,
    overview: {} as any,
    gallery: {} as any,
    finishes: {} as any,
    dimensions: {} as any,
    materials: {} as any,
    features: {} as any,
    gettingStarted: {} as any,
    productCodes: { groups: [] } as any,
    ...overrides,
  };
}

describe('CatalogPageQX brandLabel priority', () => {
  it('uses catalog.meta.brandName, not globalConfig.brandName', () => {
    const globalConfig: GlobalConfig = { brandName: 'METRO QX' } as any;
    render(<CatalogPageQX catalog={makeCatalog()} globalConfig={globalConfig} />);
    expect(
      screen.getByRole('button', { name: /METRO QS - back to top/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /METRO QX - back to top/i }),
    ).not.toBeInTheDocument();
  });
});
