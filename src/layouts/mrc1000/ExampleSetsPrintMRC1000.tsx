import type {
  MaterialsConfiguratorOption,
  MaterialsData,
} from '@/types/catalog';
import { SectionHeading } from '@/components/catalog/SectionHeading';
import { QxText } from '@/components/catalog/QxText';
import { PrintImage } from '@/components/catalog/PrintImage';
import {
  parseMRC1000Image,
  pickConfiguratorOption,
  formatOptionCode,
} from '@/lib/materials-options';

interface MRC1000Illustration {
  id: string;
  model: string;
  image: string;
  alt: string;
}

interface MRC1000MaterialsData extends MaterialsData {
  illustrations?: MRC1000Illustration[];
}

interface Props {
  data: MaterialsData;
}

const ITEMS_PER_PAGE = 4;

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
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
 * Print-only "Example sets" section for MRC1000.
 *
 * Renders the photographic set illustrations (Set A–G) from
 * materials/content.json — the same data the on-screen MaterialsMRC1000 shows
 * above its configurator. Paged for A4 landscape print at 4 tiles per page in
 * a 2×2 grid. Each cell shows the set photo plus Body / Hutch swatch chips
 * parsed from the image filename. Emits its own .print-page wrappers.
 */
export default function ExampleSetsPrintMRC1000({ data }: Props) {
  const extended = data as MRC1000MaterialsData;
  const illustrations = extended.illustrations ?? [];
  const desktopOptions = data.configurator?.desktopOptions;

  if (illustrations.length === 0) return null;

  const pages = chunk(illustrations, ITEMS_PER_PAGE);

  return (
    <>
      {pages.map((pageItems, pageIndex) => (
        <div
          key={`example-sets-page-${pageItems[0]?.id}`}
          className="print-page print-page-arrangements"
        >
          <section
            id={pageIndex === 0 ? 'example-sets' : undefined}
            className="print-section"
            aria-labelledby={
              pageIndex === 0 ? 'example-sets-title' : undefined
            }
          >
            <div className="print-section-frame">
              <SectionHeading
                id="example-sets"
                sectionLabel="Customization"
                title="Example sets"
                className="print-section-heading"
              />

              <div className="print-section-content">
                <div className="packshots-print-grid">
                  {pageItems.map((slot) => {
                    const { bodyCode, hutchCode } = parseMRC1000Image(
                      slot.image,
                    );
                    const bodyOption = pickConfiguratorOption(
                      desktopOptions,
                      bodyCode,
                    );
                    const hutchOption = pickConfiguratorOption(
                      desktopOptions,
                      hutchCode,
                    );
                    return (
                      <article
                        key={slot.id}
                        className="packshots-print-cell"
                      >
                        <div className="packshots-print-image-wrap">
                          <PrintImage
                            src={slot.image}
                            alt={slot.alt}
                            className="packshots-print-image"
                          />
                        </div>
                        <div className="packshots-print-meta">
                          <span className="packshots-print-code">
                            <QxText text={slot.model} />
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
