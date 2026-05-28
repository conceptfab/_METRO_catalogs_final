import Image from 'next/image';
import type { CatalogData } from '@/types/catalog';

interface Props {
  catalog: CatalogData;
}

/**
 * Print-only Hero. Three elements: dedicated cover image (from
 * hero.printCover JSON), Metro logo, tagline text. No effects, no slider,
 * no CTA. Styling lives in print.css as .hero-print-* classes.
 */
export default function HeroPrintQX({ catalog }: Props) {
  const cover = catalog.hero.printCover;
  const coverImage = cover?.image ?? catalog.hero.heroImage;
  const coverAlt = cover?.alt ?? catalog.hero.heroImageAlt;
  const logoSrc = `/catalogs/${catalog.id}/metro_logo.svg`;
  const tagline = catalog.hero.tagline?.replace(/\/n/g, ' ');
  const taglineLine2 = catalog.hero.taglineLine2;

  return (
    <section
      id="cover"
      className="hero-print-cover"
      aria-label={`${catalog.hero.collectionName || catalog.hero.brandLabel || 'Catalog'} cover`}
    >
      <div className="hero-print-image">
        <Image
          src={coverImage}
          alt={coverAlt}
          fill
          priority
          sizes="1920px"
        />
      </div>

      <Image
        src={logoSrc}
        alt={`${catalog.meta.brandName ?? 'METRO'} logo`}
        width={320}
        height={88}
        className="hero-print-logo"
        unoptimized
      />

      <div className="hero-print-text">
        {tagline && <p>{tagline}</p>}
        {taglineLine2 && <p>{taglineLine2}</p>}
      </div>
    </section>
  );
}
