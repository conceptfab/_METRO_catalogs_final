import type { ArrangementsData } from '@/types/catalog';
import { SectionHeading } from '@/components/catalog/SectionHeading';
import { QxText } from '@/components/catalog/QxText';
import { PrintImage } from '@/components/catalog/PrintImage';

interface Props {
  data?: ArrangementsData;
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
 * Print-only Arrangements / "Sample arrangements" section for MRC800.
 *
 * Renders the same `placeholders` from arrangements/content.json that the
 * on-screen ArrangementsMRC800 uses — but paged for A4 landscape print. Reuses
 * the .packshots-print-* CSS so the cell sizing, gaps and meta layout match the
 * Packshots and Materials sections. Emits its own .print-page wrappers, one per
 * chunk of 4 arrangements. Renders nothing when the catalog has no arrangements.
 */
export default function ArrangementsPrintMRC800({ data }: Props) {
  const placeholders = data?.placeholders?.filter((slot) => slot.image) ?? [];

  if (!data || placeholders.length === 0) return null;

  const pages = chunk(placeholders, ITEMS_PER_PAGE);

  return (
    <>
      {pages.map((pageItems, pageIndex) => (
        <div
          key={`arrangements-page-${pageItems[0]?.image ?? pageItems[0]?.label}`}
          className="print-page print-page-arrangements"
        >
          <section
            id={pageIndex === 0 ? 'arrangements' : undefined}
            className="print-section"
            aria-labelledby={pageIndex === 0 ? 'arrangements-title' : undefined}
          >
            <div className="print-section-frame">
              <SectionHeading
                id="arrangements"
                sectionLabel={data.sectionLabel}
                title={data.title}
                className="print-section-heading"
              />

              <div className="print-section-content">
                <div className="packshots-print-grid">
                  {pageItems.map((slot) => (
                    <article key={slot.image ?? slot.label} className="packshots-print-cell">
                      <div className="packshots-print-image-wrap">
                        <PrintImage
                          src={slot.image as string}
                          alt={slot.label}
                          className="packshots-print-image"
                        />
                      </div>
                      <div className="packshots-print-meta">
                        <span className="packshots-print-code">
                          <QxText text={slot.label} />
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
