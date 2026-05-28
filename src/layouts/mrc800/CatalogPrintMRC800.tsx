import type { CatalogData } from '@/types/catalog';
import HeroPrintMRC800 from './HeroPrintMRC800';
import OverviewMRC800 from './OverviewMRC800';
import GalleryPrintMRC800 from './GalleryPrintMRC800';
import FinishesPrintMRC800 from './FinishesPrintMRC800';
import DimensionsMRC800 from './DimensionsMRC800';
import ArrangementsPrintMRC800 from './ArrangementsPrintMRC800';
import MaterialsPrintMRC800 from './MaterialsPrintMRC800';
import FeaturesPrintMRC800 from './FeaturesPrintMRC800';
import GettingStartedMRC800 from './GettingStartedMRC800';
import PackshotsPrintMRC800 from './PackshotsPrintMRC800';
import ProductCodesMRC800 from './ProductCodesMRC800';
import ContactPrintMRC800 from './ContactPrintMRC800';

interface Props {
  catalog: CatalogData;
}

/**
 * Print-only layout. Each section is wrapped in a .print-page container
 * (297×210mm) with page-break-after: always so the browser produces one
 * A4 landscape page per section when printing.
 *
 * No nav, no footer, no scroll animations — pure paged document.
 */
export default function CatalogPrintMRC800({ catalog }: Props) {
  const themeClassName = catalog.meta.theme
    ? `catalog-${catalog.meta.theme}`
    : undefined;
  const idClassName = catalog.id
    ? `catalog-id-${catalog.id.toLowerCase()}`
    : undefined;
  const rootClassName = [themeClassName, idClassName, 'catalog-print']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClassName}>
      <div className="print-page print-page-hero">
        <HeroPrintMRC800 catalog={catalog} />
      </div>
      <div className="print-page print-page-overview">
        <OverviewMRC800 data={catalog.overview} />
      </div>
      <div className="print-page print-page-gallery">
        <GalleryPrintMRC800 catalog={catalog} />
      </div>
      <div className="print-page print-page-finishes">
        <FinishesPrintMRC800 data={catalog.finishes} />
      </div>
      {catalog.packshots && (
        // PackshotsPrintMRC800 chunks items into pages of 4 and emits its own
        // .print-page wrappers — one per chunk.
        <PackshotsPrintMRC800 data={catalog.packshots} />
      )}
      <div className="print-page print-page-dimensions">
        <DimensionsMRC800 data={catalog.dimensions} />
      </div>
      {/* ArrangementsPrintMRC800 chunks the sample arrangements into pages of 4
       * and emits its own .print-page wrappers — one per chunk. Renders nothing
       * when the catalog has no arrangements data. Mirrors the on-screen order:
       * Dimensions → Arrangements → Materials. */}
      <ArrangementsPrintMRC800 data={catalog.arrangements} />
      {/* MaterialsPrintMRC800 chunks the 8 set illustrations into pages of 4
       * and emits its own .print-page wrappers — one per chunk. */}
      <MaterialsPrintMRC800 data={catalog.materials} />
      {/* FeaturesPrintMRC800 emits its own .print-page wrappers — one per chunk
       * of 3 features. */}
      <FeaturesPrintMRC800 data={catalog.features} />
      <div className="print-page print-page-getting-started">
        <GettingStartedMRC800 data={catalog.gettingStarted} />
      </div>
      <div className="print-page print-page-product-codes">
        <ProductCodesMRC800 data={catalog.productCodes} />
      </div>
      {/* Shared contact section — same content across all catalogs. */}
      <ContactPrintMRC800 />
    </div>
  );
}
