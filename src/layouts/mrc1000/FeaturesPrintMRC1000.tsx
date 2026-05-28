import { createElement } from 'react';
import type { FeatureItem, FeaturesData } from '@/types/catalog';
import { getIcon } from '@/lib/icon-map';
import { SectionHeading } from '@/components/catalog/SectionHeading';
import { QxText } from '@/components/catalog/QxText';
import { PrintImage } from '@/components/catalog/PrintImage';

interface Props {
  data: FeaturesData;
}

const MAX_PER_PAGE = 3;

/**
 * Distribute items across pages so the last page is never orphaned.
 *   3 → [3]      4 → [2,2]      5 → [3,2]      6 → [3,3]
 *   7 → [3,2,2]  8 → [3,3,2]    9 → [3,3,3]   10 → [3,3,2,2]
 */
function balancedChunk<T>(arr: T[], maxPerPage: number): T[][] {
  if (arr.length === 0) return [];
  const pageCount = Math.ceil(arr.length / maxPerPage);
  const base = Math.floor(arr.length / pageCount);
  const extras = arr.length % pageCount;
  const result: T[][] = [];
  let i = 0;
  for (let p = 0; p < pageCount; p++) {
    const size = base + (p < extras ? 1 : 0);
    result.push(arr.slice(i, i + size));
    i += size;
  }
  return result;
}

/**
 * Resolve the still image for a feature.
 *
 * Order of precedence:
 *   1. Explicit `image.src` — MRC1000 uses this for static photo features.
 *   2. `video.poster` — pre-supplied poster frame.
 *   3. `video.src` → `_last.webp` — last-frame extract sitting next to the MP4.
 */
function resolveStillImage(item: FeatureItem): string | undefined {
  if (item.image?.src) return item.image.src;
  if (item.video?.poster) return item.video.poster;
  if (item.video?.src) {
    return item.video.src.replace(/\.(mp4|webm|mov)$/i, '_last.webp');
  }
  return undefined;
}

function FeatureCard({ item }: { item: FeatureItem }) {
  const still = resolveStillImage(item);

  return (
    <article className="features-print-card">
      <div className="features-print-image-wrap">
        {still ? (
          <PrintImage
            src={still}
            alt={item.title}
            className="features-print-image"
          />
        ) : null}
      </div>

      <div className="features-print-button">
        {createElement(getIcon(item.icon), {
          size: 24,
          strokeWidth: 1.5,
          className: 'features-print-button-icon',
          'aria-hidden': true,
        })}
        <span className="features-print-button-title">
          <QxText text={item.title} />
        </span>
      </div>

      <p className="features-print-desc">
        <QxText text={item.desc} />
      </p>
    </article>
  );
}

/**
 * Print-only Features section. Static rendering — no video playback, no
 * animation, no tabs. The last frame of each video is used as a still image
 * (pre-generated `*_last.webp` next to the MP4).
 *
 * Layout: balanced page chunking via `balancedChunk` so the last page is
 * never orphaned (4 items → 2+2, not 3+1). Card width adapts to per-page
 * count via `features-print-grid--{N}col` modifier in [print.css](../../styles/print.css).
 */
export default function FeaturesPrintMRC1000({ data }: Props) {
  if (!data.items || data.items.length === 0) return null;

  const pages = balancedChunk(data.items, MAX_PER_PAGE);

  return (
    <>
      {pages.map((pageItems, pageIndex) => (
        <div
          key={`features-page-${pageItems[0]?.title}`}
          className="print-page print-page-features"
        >
          <section
            id={pageIndex === 0 ? 'features' : undefined}
            className="print-section"
            aria-labelledby={pageIndex === 0 ? 'features-title' : undefined}
          >
            <div className="print-section-frame">
              <SectionHeading
                id="features"
                sectionLabel={data.sectionLabel}
                title={data.title}
                className="print-section-heading"
              />

              <div className="print-section-content">
                <div
                  className={`features-print-grid features-print-grid--${pageItems.length}col`}
                >
                  {pageItems.map((item) => (
                    <FeatureCard key={item.title} item={item} />
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
