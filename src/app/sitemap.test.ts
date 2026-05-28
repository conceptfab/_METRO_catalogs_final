import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/site-url', () => ({
  getSiteUrl: () => 'https://test.metro.example',
}));

vi.mock('@/lib/catalog-loader', () => ({
  getCatalogList: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
  default: { stat: vi.fn() },
  stat: vi.fn(),
}));

import fs from 'node:fs/promises';
import { getCatalogList } from '@/lib/catalog-loader';
import sitemap from './sitemap';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('sitemap', () => {
  it('always includes the homepage', async () => {
    vi.mocked(getCatalogList).mockResolvedValue([]);
    const entries = await sitemap();
    expect(entries[0]).toMatchObject({
      url: 'https://test.metro.example/',
      changeFrequency: 'weekly',
      priority: 1,
    });
  });

  it('includes one entry per catalog', async () => {
    vi.mocked(getCatalogList).mockResolvedValue([
      { id: 'QX' } as any,
      { id: 'QS' } as any,
    ]);
    vi.mocked(fs.stat).mockResolvedValue({ mtime: new Date('2026-01-15') } as any);
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain('https://test.metro.example/catalog/QX');
    expect(urls).toContain('https://test.metro.example/catalog/QS');
    expect(entries.length).toBe(3);
  });

  it('catalog entries have priority 0.8 and weekly cadence', async () => {
    vi.mocked(getCatalogList).mockResolvedValue([{ id: 'QX' } as any]);
    vi.mocked(fs.stat).mockResolvedValue({ mtime: new Date('2026-01-15') } as any);
    const entries = await sitemap();
    const catalogEntry = entries.find(
      (e) => e.url === 'https://test.metro.example/catalog/QX',
    );
    expect(catalogEntry).toMatchObject({
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  it('catalog lastModified is the config.json mtime when available', async () => {
    vi.mocked(getCatalogList).mockResolvedValue([{ id: 'QX' } as any]);
    const mtime = new Date('2026-04-01T12:00:00Z');
    vi.mocked(fs.stat).mockResolvedValue({ mtime } as any);
    const entries = await sitemap();
    const qx = entries.find((e) => e.url.endsWith('/catalog/QX'));
    expect(qx?.lastModified).toEqual(mtime);
  });

  it('falls back to "now" when stat throws', async () => {
    vi.mocked(getCatalogList).mockResolvedValue([{ id: 'QX' } as any]);
    vi.mocked(fs.stat).mockRejectedValue(new Error('ENOENT'));
    const before = Date.now();
    const entries = await sitemap();
    const qx = entries.find((e) => e.url.endsWith('/catalog/QX'));
    const ts = (qx?.lastModified as Date).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
  });

  it('does not include any /print routes', async () => {
    vi.mocked(getCatalogList).mockResolvedValue([
      { id: 'QX' } as any,
      { id: 'QS' } as any,
    ]);
    vi.mocked(fs.stat).mockResolvedValue({ mtime: new Date('2026-01-15') } as any);
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls.every((url) => !url.endsWith('/print'))).toBe(true);
    expect(urls.every((url) => !url.includes('/print'))).toBe(true);
  });
});
