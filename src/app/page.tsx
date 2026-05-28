import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getCatalogList, getGlobalConfig } from '@/lib/catalog-loader';
import CatalogNav from '@/components/catalog/CatalogNav';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from '@/lib/seo';

type HomeCatalogId =
  | 'QX'
  | 'QS'
  | 'VR'
  | 'TS'
  | 'FM'
  | 'FOTA'
  | 'MRC800'
  | 'MRC1000';

const HOME_CATALOG_IMAGES: Record<
  HomeCatalogId,
  { desktop: string; mobile?: string }
> = {
  QX: {
    desktop: '/catalogs/QX/thumbs/qx-home.webp',
    mobile: '/catalogs/QX/thumbs/qx-home-mobile.webp',
  },
  QS: {
    desktop: '/catalogs/QS/thumbs/qs-home.webp',
    mobile: '/catalogs/QS/thumbs/qs-home-mobile.webp',
  },
  VR: {
    desktop: '/catalogs/VR/thumbs/vr-home.webp',
    mobile: '/catalogs/VR/thumbs/vr-home-mobile.webp',
  },
  TS: {
    desktop: '/catalogs/TS/thumbs/ts-home.webp',
    mobile: '/catalogs/TS/thumbs/ts-home-mobile.webp',
  },
  FM: {
    desktop: '/catalogs/FM/thumbs/fm-home.webp',
    mobile: '/catalogs/FM/thumbs/fm-home-mobile.webp',
  },
  FOTA: {
    desktop: '/catalogs/FOTA/thumbs/fota-home.webp',
    mobile: '/catalogs/FOTA/thumbs/fota-home-mobile.webp',
  },
  MRC800: {
    desktop: '/catalogs/MRC800/thumbs/mrc800-home.webp',
    mobile: '/catalogs/MRC800/thumbs/mrc800-home-mobile.webp',
  },
  MRC1000: {
    desktop: '/catalogs/MRC1000/thumbs/mrc1000-home.webp',
    mobile: '/catalogs/MRC1000/thumbs/mrc1000-home-mobile.webp',
  },
};

const HOME_MOBILE_WIDTHS = [640, 1280, 1920] as const;
const HOME_DESKTOP_WIDTHS: Record<HomeCatalogId, ReadonlyArray<number>> = {
  QX: [640],
  QS: [640],
  VR: [640],
  TS: [640],
  FM: [640],
  FOTA: [640, 1280, 1920],
  MRC800: [640, 1280, 1920],
  MRC1000: [640, 1280, 1920],
};

function withWidthSuffix(src: string, width: number): string {
  const dotIndex = src.lastIndexOf('.');
  if (dotIndex === -1) return src;
  return `${src.slice(0, dotIndex)}-${width}w${src.slice(dotIndex)}`;
}

function buildResponsiveSrcSet(
  src: string,
  widths: ReadonlyArray<number>,
): string {
  return widths.map((w) => `${withWidthSuffix(src, w)} ${w}w`).join(', ');
}

function CatalogTileImage({
  catalogId,
  priority = false,
  sizes,
}: {
  catalogId: HomeCatalogId;
  priority?: boolean;
  sizes: string;
}) {
  const image = HOME_CATALOG_IMAGES[catalogId];
  const desktopWidths = HOME_DESKTOP_WIDTHS[catalogId];
  const fallbackSrc = withWidthSuffix(image.desktop, desktopWidths[0]);

  return (
    <picture>
      {image.mobile && (
        <source
          media="(max-width: 639px)"
          srcSet={buildResponsiveSrcSet(image.mobile, HOME_MOBILE_WIDTHS)}
          sizes="100vw"
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        src={fallbackSrc}
        srcSet={buildResponsiveSrcSet(image.desktop, desktopWidths)}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </picture>
  );
}

export const metadata: Metadata = {
  description:
    'Browse METRO office furniture catalogs: QX, QS, VR, TS, and FM desk systems, conference tables, and reception desks.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'METRO – Catalogs',
    description:
      'Browse METRO office furniture catalogs: QX, QS, VR, TS, and FM desk systems, conference tables, and reception desks.',
    url: '/',
    type: 'website',
    images: [{ url: '/banner.webp' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'METRO – Catalogs',
    description:
      'Browse METRO office furniture catalogs: QX, QS, VR, TS, and FM desk systems, conference tables, and reception desks.',
    images: ['/banner.webp'],
  },
};

export default async function HomePage() {
  const [catalogs, globalConfig] = await Promise.all([
    getCatalogList(),
    getGlobalConfig(),
  ]);

  const organizationLd = buildOrganizationJsonLd({
    brandName: globalConfig.brandName,
  });
  const websiteLd = buildWebSiteJsonLd({ siteTitle: globalConfig.siteTitle });

  const qxCatalog = catalogs.find((c) => c.id === 'QX');
  const qsCatalog = catalogs.find((c) => c.id === 'QS');
  const vrCatalog = catalogs.find((c) => c.id === 'VR');
  const tsCatalog = catalogs.find((c) => c.id === 'TS');
  const fmCatalog = catalogs.find((c) => c.id === 'FM');
  const fotaCatalog = catalogs.find((c) => c.id === 'FOTA');
  const mrc800Catalog = catalogs.find((c) => c.id === 'MRC800');
  const mrc1000Catalog = catalogs.find((c) => c.id === 'MRC1000');

  return (
    <div className="catalog-qx0">
      <JsonLd data={organizationLd} />
      <JsonLd data={websiteLd} />
      <CatalogNav
        variant="qx0"
        logoOnly
        brandLabel={globalConfig.brandName}
        brandLogoSrc="/catalogs/QX/metro_logo.svg"
        backToCatalogListHref="/"
      />

      <main
        id="main-content"
        className="bg-surface-elevated pt-[44px] sm:pt-[56px] lg:pt-14"
      >
        {/* Section 1 — Operational office furniture */}
        <section className="mx-auto w-full max-w-[1440px] pt-12 lg:pt-[120px]">
          <h2 className="section_ID px-5 font-display uppercase sm:px-8 lg:px-0">
            Operational office furniture
          </h2>
          <ul className="mt-8 grid grid-cols-1 lg:mt-12 lg:grid-cols-5">
            <li className="aspect-[2/1] lg:aspect-[1/2]">
              {qxCatalog ? (
                <Link
                  href={`/catalog/${qxCatalog.id}`}
                  className="group relative block h-full w-full overflow-hidden bg-background outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foreground"
                  aria-label={`Open ${qxCatalog.meta.title} catalog`}
                >
                  <CatalogTileImage
                    catalogId="QX"
                    priority
                    sizes="(min-width: 1024px) 85vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/55" />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-[88px] font-black tracking-tighter text-background opacity-0 group-hover:opacity-100">
                    QX
                  </span>
                </Link>
              ) : (
                <div className="h-full w-full bg-background" />
              )}
            </li>
            <li className="aspect-[2/1] lg:aspect-[1/2]">
              {qsCatalog ? (
                <Link
                  href={`/catalog/${qsCatalog.id}`}
                  className="group relative block h-full w-full overflow-hidden bg-background outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foreground"
                  aria-label={`Open ${qsCatalog.meta.title} catalog`}
                >
                  <CatalogTileImage
                    catalogId="QS"
                    priority
                    sizes="(min-width: 1024px) 85vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/55" />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-[88px] font-black tracking-tighter text-background opacity-0 group-hover:opacity-100">
                    QS
                  </span>
                </Link>
              ) : (
                <div className="h-full w-full bg-background" />
              )}
            </li>
            <li className="aspect-[2/1] lg:aspect-[1/2]">
              {vrCatalog ? (
                <Link
                  href={`/catalog/${vrCatalog.id}`}
                  className="group relative block h-full w-full overflow-hidden bg-background outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foreground"
                  aria-label={`Open ${vrCatalog.meta.title} catalog`}
                >
                  <CatalogTileImage
                    catalogId="VR"
                    sizes="(min-width: 1024px) 85vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/55" />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-[88px] font-black tracking-tighter text-background opacity-0 group-hover:opacity-100">
                    VR
                  </span>
                </Link>
              ) : (
                <div className="h-full w-full bg-background" />
              )}
            </li>
            <li className="aspect-[2/1] lg:aspect-[1/2]">
              {tsCatalog ? (
                <Link
                  href={`/catalog/${tsCatalog.id}`}
                  className="group relative block h-full w-full overflow-hidden bg-background outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foreground"
                  aria-label={`Open ${tsCatalog.meta.title} catalog`}
                >
                  <CatalogTileImage
                    catalogId="TS"
                    sizes="(min-width: 1024px) 85vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/55" />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-[88px] font-black tracking-tighter text-background opacity-0 group-hover:opacity-100">
                    TS
                  </span>
                </Link>
              ) : (
                <div className="h-full w-full bg-background" />
              )}
            </li>
            <li className="aspect-[2/1] lg:aspect-[1/2]">
              {fmCatalog ? (
                <Link
                  href={`/catalog/${fmCatalog.id}`}
                  className="group relative block h-full w-full overflow-hidden bg-background outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foreground"
                  aria-label={`Open ${fmCatalog.meta.title} catalog`}
                >
                  <CatalogTileImage
                    catalogId="FM"
                    sizes="(min-width: 1024px) 85vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/55" />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-[88px] font-black tracking-tighter text-background opacity-0 group-hover:opacity-100">
                    FM
                  </span>
                </Link>
              ) : (
                <div className="h-full w-full bg-background" />
              )}
            </li>
          </ul>
        </section>

        {/* Section 2 — Conference tables */}
        <section className="mx-auto mt-16 w-full max-w-[1440px] lg:mt-[120px]">
          <h2 className="section_ID px-5 font-display uppercase sm:px-8 lg:px-0">
            Conference tables
          </h2>
          <div className="mt-8 aspect-[2/1] w-full lg:mt-12 lg:aspect-[5/1]">
            {fotaCatalog ? (
              <Link
                href={`/catalog/${fotaCatalog.id}`}
                className="group relative block h-full w-full overflow-hidden bg-background outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foreground"
                aria-label={`Open ${fotaCatalog.meta.title} catalog`}
              >
                <CatalogTileImage
                  catalogId="FOTA"
                  sizes="(min-width: 1440px) 1440px, 100vw"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/55" />
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-[88px] font-black tracking-tighter text-background opacity-0 group-hover:opacity-100">
                  FOTA
                </span>
              </Link>
            ) : (
              <div
                className="h-full w-full border border-border bg-background/40"
                aria-hidden="true"
              />
            )}
          </div>
        </section>

        {/* Section 3 — Reception desks */}
        <section className="mx-auto mt-16 w-full max-w-[1440px] lg:mt-[120px]">
          <h2 className="section_ID px-5 font-display uppercase sm:px-8 lg:px-0">
            Reception desks
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-0 lg:mt-12">
            <li className="aspect-[2/1] lg:aspect-[5/1]">
              {mrc800Catalog ? (
                <Link
                  href={`/catalog/${mrc800Catalog.id}`}
                  className="group relative block h-full w-full overflow-hidden bg-background outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foreground"
                  aria-label={`Open ${mrc800Catalog.meta.title} catalog`}
                >
                  <CatalogTileImage
                    catalogId="MRC800"
                    sizes="(min-width: 1440px) 1440px, 100vw"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/55" />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-[88px] font-black tracking-tighter text-background opacity-0 group-hover:opacity-100">
                    MRC800
                  </span>
                </Link>
              ) : (
                <div
                  className="h-full w-full border border-border bg-background/40"
                  aria-hidden="true"
                />
              )}
            </li>
            <li className="aspect-[2/1] lg:aspect-[5/1]">
              {mrc1000Catalog ? (
                <Link
                  href={`/catalog/${mrc1000Catalog.id}`}
                  className="group relative block h-full w-full overflow-hidden bg-background outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foreground"
                  aria-label={`Open ${mrc1000Catalog.meta.title} catalog`}
                >
                  <CatalogTileImage
                    catalogId="MRC1000"
                    sizes="(min-width: 1440px) 1440px, 100vw"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/55" />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-[88px] font-black tracking-tighter text-background opacity-0 group-hover:opacity-100">
                    MRC1000
                  </span>
                </Link>
              ) : (
                <div
                  className="h-full w-full border border-border bg-background/40"
                  aria-hidden="true"
                />
              )}
            </li>
          </ul>
        </section>

        <div className="bg-surface-elevated py-6">
          <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-0">
            <Image
              src="/banner.webp"
              alt="Fundusze Europejskie dla Nowoczesnej Gospodarki — Rzeczpospolita Polska — Dofinansowane przez Unię Europejską — PARP Grupa PFR"
              width={2545}
              height={218}
              sizes="(min-width: 1440px) 864px, (min-width: 1024px) 60vw, 90vw"
              className="mx-auto block h-auto w-[90%] lg:w-[60%]"
            />
          </div>
        </div>
      </main>

      <footer className="bg-catalog-footer">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-4 sm:px-8 sm:py-10 lg:px-0">
          <p className="text-center font-display text-[10px] uppercase tracking-wider text-foreground/65 sm:text-xs sm:tracking-widest">
            {globalConfig.footerText}{' '}
            <a
              href="https://conceptfab.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              CONCEPTFAB.COM
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
