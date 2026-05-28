import type { MaterialsData } from '@/types/catalog';
import { SectionHeading } from '@/components/catalog/SectionHeading';
import { QxText } from '@/components/catalog/QxText';
import { PrintImage } from '@/components/catalog/PrintImage';

interface MRC800Illustration {
  id: string;
  model: string;
  image: string;
  alt: string;
}

interface MRC800MaterialsData extends MaterialsData {
  illustrations?: MRC800Illustration[];
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

/**
 * Print-only Materials / "Example sets" section for MRC800.
 *
 * Renders the same `illustrations` from materials/content.json that the
 * on-screen MaterialsMRC800 uses — but paged for A4 landscape print. Reuses
 * the .packshots-print-* CSS so the cell sizing, gaps and meta layout match
 * the Packshots section byte-for-byte. Emits its own .print-page wrappers,
 * one per chunk of 4 sets.
 */
export default function MaterialsPrintMRC800({ data }: Props) {
  const extended = data as MRC800MaterialsData;
  const illustrations = extended.illustrations ?? [];

  if (illustrations.length === 0) return null;

  const pages = chunk(illustrations, ITEMS_PER_PAGE);

  return (
    <>
      {pages.map((pageItems, pageIndex) => (
        <div
          key={`materials-page-${pageItems[0]?.id}`}
          className="print-page print-page-materials"
        >
          <section
            id={pageIndex === 0 ? 'materials' : undefined}
            className="print-section"
            aria-labelledby={pageIndex === 0 ? 'materials-title' : undefined}
          >
            <div className="print-section-frame">
              <SectionHeading
                id="materials"
                sectionLabel={data.sectionLabel}
                title={data.title}
                className="print-section-heading"
              />
              {data.description && (
                <p className="packshots-print-subtitle sec_main_text">
                  <QxText text={data.description} />
                </p>
              )}

              <div className="print-section-content">
                <div className="packshots-print-grid">
                  {pageItems.map((slot) => (
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
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      ))}
    </>
  );
}
