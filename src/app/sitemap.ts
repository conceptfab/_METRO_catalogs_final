import type { MetadataRoute } from 'next';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getCatalogList } from '@/lib/catalog-loader';
import { getSiteUrl } from '@/lib/site-url';

async function catalogLastModified(catalogId: string): Promise<Date> {
  const configPath = path.join(
    process.cwd(),
    'public',
    'catalogs',
    catalogId,
    'config.json',
  );
  try {
    const stat = await fs.stat(configPath);
    return stat.mtime;
  } catch {
    return new Date();
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const catalogs = await getCatalogList();
  const now = new Date();

  const catalogEntries = await Promise.all(
    catalogs.map(async (catalog) => ({
      url: `${base}/catalog/${catalog.id}`,
      lastModified: await catalogLastModified(catalog.id),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  );

  return [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...catalogEntries,
  ];
}
