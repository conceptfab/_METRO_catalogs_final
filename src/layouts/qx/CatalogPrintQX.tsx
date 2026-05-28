import type { CatalogData } from '@/types/catalog';
import {
  enrichConfigurator,
  QX_FRAME_COLOR_NAMES,
} from '@/lib/materials-options';
import HeroPrintQX from './HeroPrintQX';
import OverviewQX from './OverviewQX';
import GalleryPrintQX from './GalleryPrintQX';
import FinishesPrintQX from './FinishesPrintQX';
import FinishesPrintFM from './FinishesPrintFM';
import DimensionsQX from './DimensionsQX';
import FeaturesPrintQX from './FeaturesPrintQX';
import GettingStartedQX from './GettingStartedQX';
import PackshotsPrintQX from './PackshotsPrintQX';
import PackshotsPrintFM from './PackshotsPrintFM';
import ProductCodesQX from './ProductCodesQX';
import ContactPrintQX from './ContactPrintQX';

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
export default function CatalogPrintQX({ catalog }: Props) {
  const themeClassName = catalog.meta.theme
    ? `catalog-${catalog.meta.theme}`
    : undefined;
  const idClassName = catalog.id
    ? `catalog-id-${catalog.id.toLowerCase()}`
    : undefined;
  const rootClassName = [themeClassName, idClassName, 'catalog-print']
    .filter(Boolean)
    .join(' ');

  const materialsConfigurator = enrichConfigurator(
    catalog.materials.configurator,
    { frame: QX_FRAME_COLOR_NAMES },
  );

  return (
    <div className={rootClassName}>
      <div className="print-page print-page-hero">
        <HeroPrintQX catalog={catalog} />
      </div>
      <div className="print-page print-page-overview">
        <OverviewQX data={catalog.overview} />
      </div>
      <div className="print-page print-page-gallery">
        <GalleryPrintQX catalog={catalog} />
      </div>
      <div className="print-page print-page-finishes">
        {/* Use materials.configurator (the metro_*.webp layered renders from
         * /catalogs/{id}/materials/) — NOT finishes.configurator, which only
         * contains flat shared swatches and would render as solid colour. */}
        {catalog.id === 'FM' ? (
          <FinishesPrintFM
            data={catalog.finishes}
            configurator={materialsConfigurator}
            previewMode={catalog.materials.previewMode}
          />
        ) : (
          <FinishesPrintQX
            data={catalog.finishes}
            configurator={materialsConfigurator}
            previewMode={catalog.materials.previewMode}
          />
        )}
      </div>
      {catalog.packshots && (
        // PackshotsPrint* chunks items into pages of 4 and emits its own
        // .print-page wrappers — one per chunk.
        catalog.id === 'FM' ? (
          <PackshotsPrintFM
            data={catalog.packshots}
            materialsConfigurator={materialsConfigurator}
          />
        ) : (
          <PackshotsPrintQX
            data={catalog.packshots}
            materialsConfigurator={materialsConfigurator}
          />
        )
      )}
      <div className="print-page print-page-dimensions">
        <DimensionsQX data={catalog.dimensions} />
      </div>
      {/* FeaturesPrintQX emits its own .print-page wrappers — one per chunk
       * of 3 features. */}
      <FeaturesPrintQX data={catalog.features} />
      <div className="print-page print-page-getting-started">
        <GettingStartedQX data={catalog.gettingStarted} />
      </div>
      <div className="print-page print-page-product-codes">
        <ProductCodesQX data={catalog.productCodes} />
      </div>
      {/* Shared contact section — same content across all catalogs. */}
      <ContactPrintQX />
    </div>
  );
}
