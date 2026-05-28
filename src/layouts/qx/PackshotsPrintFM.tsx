import type {
  MaterialsConfiguratorData,
  MaterialsConfiguratorOption,
  PackshotsData,
} from '@/types/catalog';
import { SectionHeading } from '@/components/catalog/SectionHeading';
import { QxText } from '@/components/catalog/QxText';
import { PrintImage } from '@/components/catalog/PrintImage';
import {
  parsePackshotImage,
  pickConfiguratorOption,
  formatOptionCode,
} from '@/lib/materials-options';

interface Props {
  data: PackshotsData;
  materialsConfigurator?: MaterialsConfiguratorData;
}

const ITEMS_PER_PAGE = 4;

const SAMPLE_PACKSHOT_SRC =
  '/catalogs/QX/packshots/V51_W240_black__Shot_A_4K_R10.webp';

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
  label: 'Decor';
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

export default function PackshotsPrintFM({
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
            aria-labelledby={
              pageIndex === 0 ? 'packshots-title' : undefined
            }
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
                    const { topCode } = parsePackshotImage(item.image);
                    const desktopOption = pickConfiguratorOption(
                      materialsConfigurator?.desktopOptions,
                      topCode,
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
                          {topCode && desktopOption && (
                            <StaticChip option={desktopOption} label="Decor" />
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
