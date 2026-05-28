import { createElement } from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CatalogPrintQX from './CatalogPrintQX';
import type { CatalogData } from '@/types/catalog';

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt?: string; src: string }) => (
    createElement('img', {
      alt: alt ?? '',
      src: typeof src === 'string' ? src : 'test-image',
    })
  ),
}));

const minimalCatalog: CatalogData = {
  id: 'QX0',
  meta: {
    title: 'Test',
    description: '',
    collectionName: 'Test Collection',
    layoutType: 'qx',
    theme: undefined,
    brandName: 'METRO',
  },
  sections: [],
  hero: {
    brandLabel: 'METRO',
    collectionName: 'Test Collection',
    tagline: 'Test tagline',
    ctaLabel: 'Explore',
    heroImage: '/x.webp',
    heroImageAlt: '',
  },
  overview: {
    sectionLabel: 'Overview',
    title: 'Overview',
    paragraphs: [],
    packshotImage: '/x.webp',
    packshotImageAlt: '',
    packshotCaption: '',
  },
  gallery: {
    sectionLabel: 'Gallery',
    title: 'Gallery',
    images: [],
  },
  finishes: {
    sectionLabel: 'Finishes',
    title: 'Finishes',
    desktopColors: [],
    frameColors: [],
    sizes: [],
    comparisonTable: [],
    configurator: undefined,
  },
  dimensions: {
    sectionLabel: 'Dimensions',
    title: 'Dimensions',
    specs: [],
    certifications: [],
  },
  materials: {
    sectionLabel: 'Materials',
    title: 'Materials',
    materials: [],
    swatches: [],
    configurator: undefined,
  },
  features: {
    sectionLabel: 'Features',
    title: 'Features',
    items: [
      { icon: 'puzzle', title: 'F1', desc: 'd1' },
    ],
  },
  gettingStarted: {
    sectionLabel: 'Getting Started',
    title: 'Getting Started',
    steps: [],
    ctaLabels: { quote: 'Get a Quote', pdf: 'Download PDF', contact: 'Contact' },
    footerText: '',
    versionInfo: '',
  },
  productCodes: {
    sectionLabel: 'Codes',
    title: 'Product Codes',
    description: '',
    groups: [],
  },
  packshots: undefined,
};

const PACKSHOTS_FIXTURE: import('@/types/catalog').PackshotsData = {
  sectionLabel: 'Packshots',
  title: 'Product Packshots',
  groups: [
    {
      model: 'QX-TEST',
      label: 'QX Test Group',
      items: [
        {
          code: 'QX-001',
          name: 'QX Test Item',
          colorName: 'Black',
        },
      ],
    },
  ],
};

describe('CatalogPrintQX', () => {
  it('wraps every section in a .print-page container', () => {
    const { container } = render(<CatalogPrintQX catalog={minimalCatalog} />);
    const pages = container.querySelectorAll('.print-page');
    // Hero, Overview, Gallery, Finishes, Dimensions, Features, GettingStarted,
    // ProductCodes, Contact = 9. Materials (Customization) is intentionally
    // omitted from print; Packshots is undefined here → not rendered.
    expect(pages.length).toBe(9);
  });

  it('renders no navigation or footer (print layout only)', () => {
    const { queryByRole } = render(<CatalogPrintQX catalog={minimalCatalog} />);
    expect(queryByRole('navigation')).toBeNull();
    expect(queryByRole('contentinfo')).toBeNull();
  });

  it('applies catalog-print class to root element', () => {
    const { container } = render(<CatalogPrintQX catalog={minimalCatalog} />);
    expect(container.firstChild).toHaveClass('catalog-print');
  });

  it('renders 10 pages when packshots data is provided with 1 item', () => {
    // 9 base pages + ceil(1 / 4) = 1 packshots page = 10 total.
    const withPackshots = {
      ...minimalCatalog,
      packshots: {
        ...PACKSHOTS_FIXTURE,
      },
    } as CatalogData;
    const { container } = render(<CatalogPrintQX catalog={withPackshots} />);
    expect(container.querySelectorAll('.print-page').length).toBe(10);
  });
});
