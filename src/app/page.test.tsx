import { createElement, type ImgHTMLAttributes } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import HomePage from './page';

type MockImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fill?: boolean;
  priority?: boolean;
};

vi.mock('next/image', () => ({
  default: ({
    alt,
    fill: _fill,
    priority: _priority,
    src,
    ...props
  }: MockImageProps) => (
    createElement('img', { alt: alt ?? '', src: String(src), ...props })
  ),
}));

const catalog = (id: string) => ({
  id,
  meta: {
    title: `METRO ${id}`,
    brandName: `METRO ${id}`,
    collectionName: id,
    description: `${id} catalog`,
    layoutType: id === 'MRC800' ? 'mrc800' : 'qx',
  },
});

vi.mock('@/lib/catalog-loader', () => ({
  getCatalogList: vi.fn(async () =>
    ['QX', 'QS', 'VR', 'TS', 'FM', 'FOTA', 'MRC800'].map(catalog),
  ),
  getGlobalConfig: vi.fn(async () => ({
    brandName: 'METRO',
    siteTitle: 'METRO',
    siteSubtitle: 'Catalogs',
    footerText: 'CONCEPT / CREATION / PRODUCTION BY',
    catalogListTitle: 'Available catalogs',
  })),
}));

describe('HomePage catalog thumbnails', () => {
  it('uses responsive mobile srcset variants when the catalog provides them', async () => {
    const { container } = render(await HomePage());

    const mobileSources = [
      ...container.querySelectorAll('source[media="(max-width: 639px)"]'),
    ].map((source) => source.getAttribute('srcSet') ?? '');

    expect(
      mobileSources.some(
        (s) =>
          s.includes('/catalogs/QX/thumbs/qx-home-mobile-640w.webp 640w') &&
          s.includes('/catalogs/QX/thumbs/qx-home-mobile-1280w.webp 1280w') &&
          s.includes('/catalogs/QX/thumbs/qx-home-mobile-1920w.webp 1920w'),
      ),
    ).toBe(true);

    expect(
      mobileSources.some(
        (s) =>
          s.includes(
            '/catalogs/MRC800/thumbs/mrc800-home-mobile-640w.webp 640w',
          ) &&
          s.includes(
            '/catalogs/MRC800/thumbs/mrc800-home-mobile-1280w.webp 1280w',
          ),
      ),
    ).toBe(true);
  });

  it('marks the QX tile as the LCP image with fetchpriority=high', async () => {
    const { container } = render(await HomePage());
    const qxImg = container.querySelector(
      'img[src="/catalogs/QX/thumbs/qx-home-640w.webp"]',
    );
    expect(qxImg).not.toBeNull();
    expect(qxImg?.getAttribute('loading')).toBe('eager');
    expect(qxImg?.getAttribute('fetchpriority')).toBe('high');
  });

  it('lazy-loads below-the-fold catalog tiles', async () => {
    const { container } = render(await HomePage());
    const vrImg = container.querySelector(
      'img[src="/catalogs/VR/thumbs/vr-home-640w.webp"]',
    );
    expect(vrImg?.getAttribute('loading')).toBe('lazy');
    expect(vrImg?.getAttribute('fetchpriority')).toBe('auto');
  });

  it('renders Organization JSON-LD on the homepage', async () => {
    const ui = await HomePage();
    const { container } = render(ui);
    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    const payloads = Array.from(scripts).map((s) => JSON.parse(s.innerHTML));
    expect(payloads.some((p) => p['@type'] === 'Organization')).toBe(true);
    const org = payloads.find((p) => p['@type'] === 'Organization');
    expect(org?.name).toBe('METRO');
  });

  it('renders WebSite JSON-LD on the homepage', async () => {
    const ui = await HomePage();
    const { container } = render(ui);
    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    const payloads = Array.from(scripts).map((s) => JSON.parse(s.innerHTML));
    expect(payloads.some((p) => p['@type'] === 'WebSite')).toBe(true);
    const site = payloads.find((p) => p['@type'] === 'WebSite');
    expect(site?.name).toBe('METRO');
  });
});
