import { createElement } from 'react';
import type { FeatureItem, FeaturesData } from '@/types/catalog';
import { getIcon } from '@/lib/icon-map';
import { SectionHeading } from '@/components/catalog/SectionHeading';
import { QxText } from '@/components/catalog/QxText';
import { PrintImage } from '@/components/catalog/PrintImage';

interface Props {
  data: FeaturesData;
}

const MAX_PER_PAGE = 2;

/**
 * Distribute items across pages so the last page is never orphaned.
 *   2 → [2]      3 → [2,1]    4 → [2,2]   5 → [2,2,1]
 *   6 → [2,2,2]  7 → [2,2,2,1]            10 → [2,2,2,2,2]
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
 * Resolve the still image (last video frame) for a feature.
 *
 * Convention: alongside each `*.mp4` there is a pre-generated `*_last.webp`
 * extracted via ffmpeg (see scripts / catalog README). If the feature has a
 * `poster`, that takes precedence; otherwise we swap the extension.
 */
function resolveStillImage(item: FeatureItem): string | undefined {
  if (item.video?.poster) return item.video.poster;
  if (item.video?.src) {
    return item.video.src.replace(/\.(mp4|webm|mov)$/i, '_last.webp');
  }
  return undefined;
}

/**
 * Expand features with variants into one card per variant. The interactive
 * QX layout uses variants as a tab-within-a-tab; in print we can't toggle, so
 * each variant becomes its own card carrying the parent's icon + desc and the
 * variant's title + video. Features without variants pass through untouched.
 */
function flattenVariants(items: FeatureItem[]): FeatureItem[] {
  const result: FeatureItem[] = [];
  for (const item of items) {
    const variants = item.variants;
    if (!variants || variants.length === 0) {
      result.push(item);
      continue;
    }
    for (const variant of variants) {
      result.push({
        icon: item.icon,
        title: variant.title,
        desc: item.desc,
        video: variant.video,
      });
    }
  }
  return result;
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
export default function FeaturesPrintQX({ data }: Props) {
  if (!data.items || data.items.length === 0) return null;

  const flatItems = flattenVariants(data.items);
  const pages = balancedChunk(flatItems, MAX_PER_PAGE);

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
