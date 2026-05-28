import { getSiteUrl } from '@/lib/site-url';

export function absoluteUrl(pathname: string): string {
  const base = getSiteUrl();
  const normalised = pathname.replace(/^\/+/, '/');
  if (normalised === '/') return `${base}/`;
  return `${base}${normalised}`;
}

export function catalogCanonicalPath(catalogId: string): string {
  return `/catalog/${catalogId}`;
}

export function catalogOgImagePath(catalogId: string): string {
  return `/catalogs/${catalogId}/thumbs/${catalogId.toLowerCase()}-home.webp`;
}

interface OrganizationLdInput {
  brandName: string;
}

export function buildOrganizationJsonLd(input: OrganizationLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization' as const,
    name: input.brandName,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/android-chrome-512x512.png'),
  };
}

interface WebSiteLdInput {
  siteTitle: string;
}

export function buildWebSiteJsonLd(input: WebSiteLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite' as const,
    name: input.siteTitle,
    url: absoluteUrl('/'),
  };
}

interface CatalogMetaLite {
  title: string;
  tagline?: string;
  description: string;
  brandName: string;
  collectionName: string;
}

interface CatalogCollectionLdInput {
  catalogId: string;
  meta: CatalogMetaLite;
  imagePath: string;
}

export function buildCatalogCollectionJsonLd(input: CatalogCollectionLdInput) {
  const { catalogId, meta, imagePath } = input;
  const name = meta.tagline ? `${meta.title} — ${meta.tagline}` : meta.title;
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage' as const,
    name,
    description: meta.description,
    url: absoluteUrl(catalogCanonicalPath(catalogId)),
    image: absoluteUrl(imagePath),
    inLanguage: 'en',
    isPartOf: {
      '@type': 'WebSite' as const,
      url: absoluteUrl('/'),
    },
    about: {
      '@type': 'ProductGroup' as const,
      name: meta.collectionName,
      brand: {
        '@type': 'Brand' as const,
        name: meta.brandName,
      },
    },
  };
}

interface BreadcrumbInput {
  name: string;
  path: string;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbInput[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList' as const,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem' as const,
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
