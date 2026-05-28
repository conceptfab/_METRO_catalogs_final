import type { CatalogData } from '@/types/catalog';
import {
  enrichConfigurator,
  MRC1000_DECOR_NAMES,
} from '@/lib/materials-options';
import HeroPrintMRC1000 from './HeroPrintMRC1000';
import OverviewMRC1000 from './OverviewMRC1000';
import GalleryPrintMRC1000 from './GalleryPrintMRC1000';
import FinishesPrintMRC1000 from './FinishesPrintMRC1000';
import DimensionsMRC1000 from './DimensionsMRC1000';
import ArrangementsPrintMRC1000 from './ArrangementsPrintMRC1000';
import MaterialsPrintMRC1000 from './MaterialsPrintMRC1000';
import ExampleSetsPrintMRC1000 from './ExampleSetsPrintMRC1000';
import FeaturesPrintMRC1000 from './FeaturesPrintMRC1000';
import GettingStartedMRC1000 from './GettingStartedMRC1000';
import PackshotsPrintMRC1000 from './PackshotsPrintMRC1000';
import ProductCodesMRC1000 from './ProductCodesMRC1000';
import ContactPrintMRC1000 from './ContactPrintMRC1000';

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
export default function CatalogPrintMRC1000({ catalog }: Props) {
  const themeClassName = catalog.meta.theme
    ? `catalog-${catalog.meta.theme}`
    : undefined;
  const idClassName = catalog.id
    ? `catalog-id-${catalog.id.toLowerCase()}`
    : undefined;
  const rootClassName = [themeClassName, idClassName, 'catalog-print']
    .filter(Boolean)
    .join(' ');

  const enrichedMaterialsConfigurator = enrichConfigurator(
    catalog.materials.configurator,
    { desktop: MRC1000_DECOR_NAMES },
  );
  const enrichedMaterials = {
    ...catalog.materials,
    configurator: enrichedMaterialsConfigurator,
  };
  const enrichedFinishes = {
    ...catalog.finishes,
    configurator: enrichConfigurator(catalog.finishes.configurator, {
      desktop: MRC1000_DECOR_NAMES,
    }),
  };

  return (
    <div className={rootClassName}>
      <div className="print-page print-page-hero">
        <HeroPrintMRC1000 catalog={catalog} />
      </div>
      <div className="print-page print-page-overview">
        <OverviewMRC1000 data={catalog.overview} />
      </div>
      <div className="print-page print-page-gallery">
        <GalleryPrintMRC1000 catalog={catalog} />
      </div>
      <div className="print-page print-page-finishes">
        <FinishesPrintMRC1000 data={enrichedFinishes} />
      </div>
      {catalog.packshots && (
        // PackshotsPrintMRC1000 chunks items into pages of 4 and emits its own
        // .print-page wrappers — one per chunk.
        <PackshotsPrintMRC1000
          data={catalog.packshots}
          materialsConfigurator={enrichedMaterialsConfigurator}
        />
      )}
      <div className="print-page print-page-dimensions">
        <DimensionsMRC1000 data={catalog.dimensions} />
      </div>
      {/* ArrangementsPrintMRC1000 chunks the sample arrangements into pages of 4
       * and emits its own .print-page wrappers — one per chunk. Renders nothing
       * when the catalog has no arrangements data. Mirrors the on-screen order:
       * Dimensions → Arrangements → Materials. */}
      <ArrangementsPrintMRC1000 data={catalog.arrangements} />
      {/* ExampleSetsPrintMRC1000 paginates the photographic set illustrations
       * (Set A–G) from materials/content.json — 4 per A4 page with Body/Hutch
       * swatch chips parsed from each filename. */}
      <ExampleSetsPrintMRC1000 data={enrichedMaterials} />
      {/* MaterialsPrintMRC1000 renders the static configurator preview +
       * finishes list on its own .print-page. */}
      <div className="print-page print-page-materials">
        <MaterialsPrintMRC1000 data={enrichedMaterials} />
      </div>
      {/* FeaturesPrintMRC1000 emits its own .print-page wrappers — one per chunk
       * of 3 features. */}
      <FeaturesPrintMRC1000 data={catalog.features} />
      <div className="print-page print-page-getting-started">
        <GettingStartedMRC1000 data={catalog.gettingStarted} />
      </div>
      <div className="print-page print-page-product-codes">
        <ProductCodesMRC1000 data={catalog.productCodes} />
      </div>
      {/* Shared contact section — same content across all catalogs. */}
      <ContactPrintMRC1000 />
    </div>
  );
}
