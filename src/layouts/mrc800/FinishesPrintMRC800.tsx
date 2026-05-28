import type { FinishesData } from '@/types/catalog';
import { SectionHeading } from '@/components/catalog/SectionHeading';
import { QxText } from '@/components/catalog/QxText';
import { PrintImage } from '@/components/catalog/PrintImage';

interface MRC800Illustration {
  id: string;
  color: 'white' | 'black';
  label: string;
  image?: string;
  alt: string;
}

interface MRC800FinishesData extends FinishesData {
  illustrations?: MRC800Illustration[];
}

interface Props {
  data: FinishesData;
}

/**
 * Print-only Finishes section for MRC800.
 *
 * Mirrors the on-screen MRC800 Finishes section: heading + description on top,
 * the two detail illustrations from /finishes/ as side-by-side large squares
 * below. No materials configurator preview, no swatch tiles — this catalog
 * only ships two finish variants (White and Black) and has no configurable
 * frame/desktop combinations.
 */
export default function FinishesPrintMRC800({ data }: Props) {
  const extended = data as MRC800FinishesData;
  const illustrations = extended.illustrations ?? [];
  const descriptionLines = data.description?.split('\n') ?? [];

  return (
    <section
      id="finishes"
      className="print-section"
      aria-labelledby="finishes-title"
    >
      <div className="print-section-frame">
        <SectionHeading
          id="finishes"
          sectionLabel={data.sectionLabel}
          title={data.title}
          className="print-section-heading"
        />

        <div className="print-section-content finishes-print-content-mrc800">
          {data.description && (
            <p className="sec_main_text finishes-print-description">
              {descriptionLines.map((line, index) => (
                <span key={line}>
                  <QxText text={line} />
                  {index < descriptionLines.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
          )}

          {illustrations.length > 0 && (
            <div className="finishes-print-grid-mrc800">
              {illustrations.map((slot) => (
                <figure
                  key={slot.id}
                  className="finishes-print-figure-mrc800"
                >
                  {slot.image && (
                    <PrintImage
                      src={slot.image}
                      alt={slot.alt}
                      className="finishes-print-figure-image-mrc800"
                    />
                  )}
                  <figcaption className="finishes-print-figure-caption-mrc800">
                    <QxText text={slot.label} />
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
