import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ReactDOM from 'react-dom';
import {
  loadCatalog,
  getGlobalConfig,
  getCatalogList,
  getCatalogFooterEntries,
} from '@/lib/catalog-loader';
import type { CatalogLayoutType, HeroData } from '@/types/catalog';
import { responsiveProps } from '@/lib/responsive-image';
import {
  catalogCanonicalPath,
  catalogOgImagePath,
  buildCatalogCollectionJsonLd,
  buildBreadcrumbJsonLd,
} from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import CatalogPageQX from '@/layouts/qx/CatalogPageQX';
import CatalogPageMRC800 from '@/layouts/mrc800/CatalogPageMRC800';
import CatalogPageMRC1000 from '@/layouts/mrc1000/CatalogPageMRC1000';
import CatalogPagePlaceholder from '@/components/catalog/CatalogPagePlaceholder';

function getFirstHeroSrc(hero: HeroData): string | undefined {
  const initialIdx = Math.max(0, hero.slider?.initialSlide ?? 0);
  if (hero.heroSlides?.length) {
    return hero.heroSlides[Math.min(initialIdx, hero.heroSlides.length - 1)]?.src;
  }
  if (hero.heroImages?.length) {
    return hero.heroImages[Math.min(initialIdx, hero.heroImages.length - 1)];
  }
  return hero.heroImage;
}

const layoutMap: Record<
  CatalogLayoutType,
  | typeof CatalogPageQX
  | typeof CatalogPageMRC800
  | typeof CatalogPageMRC1000
  | typeof CatalogPagePlaceholder
> = {
  qx: CatalogPageQX,
  mrc800: CatalogPageMRC800,
  mrc1000: CatalogPageMRC1000,
  type2: CatalogPagePlaceholder,
  type3: CatalogPagePlaceholder,
};

export async function generateStaticParams() {
  const catalogs = await getCatalogList();
  return catalogs.map((catalog) => ({
    catalogId: catalog.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ catalogId: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const catalog = await loadCatalog(resolvedParams.catalogId);
  if (!catalog) return {};

  const { title, tagline, description } = catalog.meta;
  const fullTitle = tagline ? `${title} — ${tagline}` : title;
  const canonical = catalogCanonicalPath(resolvedParams.catalogId);
  const ogImage = catalogOgImagePath(resolvedParams.catalogId);

  return {
    title: fullTitle,
    description,
    alternates: { canonical },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      type: 'website',
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ catalogId: string }>;
}) {
  const resolvedParams = await params;
  const [catalog, globalConfig, footerEntries] = await Promise.all([
    loadCatalog(resolvedParams.catalogId),
    getGlobalConfig(),
    getCatalogFooterEntries(),
  ]);

  if (!catalog) {
    notFound();
  }

  const collectionLd = buildCatalogCollectionJsonLd({
    catalogId: resolvedParams.catalogId,
    meta: catalog.meta,
    imagePath: catalogOgImagePath(resolvedParams.catalogId),
  });
  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    {
      name: catalog.meta.title,
      path: catalogCanonicalPath(resolvedParams.catalogId),
    },
  ]);

  const firstHeroSrc = getFirstHeroSrc(catalog.hero);
  if (firstHeroSrc) {
    const responsive = responsiveProps(firstHeroSrc, 'hero');
    ReactDOM.preload(firstHeroSrc, {
      as: 'image',
      fetchPriority: 'high',
      imageSrcSet: responsive?.srcSet,
      imageSizes: responsive?.sizes,
    });
  }

  const LayoutComponent = layoutMap[catalog.meta.layoutType];
  return (
    <>
      <JsonLd data={collectionLd} />
      <JsonLd data={breadcrumbLd} />
      <LayoutComponent
        catalog={catalog}
        globalConfig={globalConfig}
        footerEntries={footerEntries}
      />
    </>
  );
}
