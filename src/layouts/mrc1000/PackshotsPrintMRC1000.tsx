import type {
  MaterialsConfiguratorData,
  MaterialsConfiguratorOption,
  PackshotsData,
} from '@/types/catalog';
import { SectionHeading } from '@/components/catalog/SectionHeading';
import { QxText } from '@/components/catalog/QxText';
import { PrintImage } from '@/components/catalog/PrintImage';
import {
  parseMRC1000Image,
  pickConfiguratorOption,
  formatOptionCode,
} from '@/lib/materials-options';

interface Props {
  data: PackshotsData;
  materialsConfigurator?: MaterialsConfiguratorData;
}

const ITEMS_PER_PAGE = 4;

const SAMPLE_PACKSHOT_SRC =
  '/catalogs/MRC1000/packshots/V51_W240_black__Shot_A_4K_R10.webp';

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

interface FlatItem {
  code: string;
  name: string;
  image: string;
  groupLabel: string;
}

function StaticChip({
  option,
  label,
}: {
  option: MaterialsConfiguratorOption;
  label: 'Body' | 'Hutch';
}) {
  const codeFormatted = formatOptionCode(option.code);
  return (
    <span className="packshots-print-chip">
      <span className="packshots-print-chip-role">{label}</span>
      <span
        className="packshots-print-chip-swatch"
        aria-hidden="true"
        style={{ backgroundImage: `url("${option.thumbnail}")` }}
      />
      <span className="packshots-print-chip-code">{codeFormatted}</span>
    </span>
  );
}

/**
 * Print-only Packshots/Models section.
 *
 * Counts catalog items and emits ceil(N / 4) print pages with a 2×2 grid
 * on each. Self-contained: no clicks, no lightbox, no motion. Renders its
 * own outer .print-page wrappers (CatalogPrintMRC1000 skips its own wrapper for
 * this component).
 *
 * Meta block mirrors the on-screen PackshotsMRC1000: parses the packshot
 * filename for [UW]\d+ codes and shows Body / Hutch swatch chips when present.
 */
export default function PackshotsPrintMRC1000({
  data,
  materialsConfigurator,
}: Props) {
  const allItems: FlatItem[] = data.groups.flatMap((group) =>
    group.items.map((item) => ({
      code: item.code,
      name: item.name,
      image: item.image ?? SAMPLE_PACKSHOT_SRC,
      groupLabel: group.label,
    })),
  );

  if (allItems.length === 0) return null;

  const pages = chunk(allItems, ITEMS_PER_PAGE);

  return (
    <>
      {pages.map((pageItems, pageIndex) => (
        <div
          key={`packshots-page-${pageItems[0]?.code}-${pageItems[0]?.image}`}
          className="print-page print-page-packshots"
        >
          <section
            id={pageIndex === 0 ? 'packshots' : undefined}
            className="print-section"
            aria-labelledby={pageIndex === 0 ? 'packshots-title' : undefined}
          >
            <div className="print-section-frame">
              <SectionHeading
                id="packshots"
                sectionLabel={data.sectionLabel}
                title={data.title}
                className="print-section-heading"
              />
              {data.subtitle && (
                <p className="packshots-print-subtitle sec_main_text">
                  <QxText text={data.subtitle} />
                </p>
              )}

              <div className="print-section-content">
                <div className="packshots-print-grid">
                  {pageItems.map((item) => {
                    const { bodyCode, hutchCode } = parseMRC1000Image(
                      item.image,
                    );
                    const bodyOption = pickConfiguratorOption(
                      materialsConfigurator?.desktopOptions,
                      bodyCode,
                    );
                    const hutchOption = pickConfiguratorOption(
                      materialsConfigurator?.desktopOptions,
                      hutchCode,
                    );
                    return (
                      <article
                        key={`${item.code}-${item.image}`}
                        className="packshots-print-cell"
                      >
                        <div className="packshots-print-image-wrap">
                          <PrintImage
                            src={item.image}
                            alt={item.name || `${item.code} packshot`}
                            className="packshots-print-image"
                          />
                        </div>
                        <div className="packshots-print-meta">
                          <span className="packshots-print-code">
                            <QxText text={item.code} />
                          </span>
                          {bodyCode && bodyOption && (
                            <StaticChip option={bodyOption} label="Body" />
                          )}
                          {hutchCode && hutchOption && (
                            <StaticChip option={hutchOption} label="Hutch" />
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>
      ))}
    </>
  );
}
