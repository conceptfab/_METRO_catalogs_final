import type {
  MaterialsConfiguratorOption,
  MaterialsData,
} from '@/types/catalog';
import { SectionHeading } from '@/components/catalog/SectionHeading';
import { QxText } from '@/components/catalog/QxText';
import { PrintImage } from '@/components/catalog/PrintImage';
import {
  dedupeByCode,
  orderOptions,
  formatOptionCode,
} from '@/lib/materials-options';

interface Props {
  data: MaterialsData;
}

const EMPTY_OPTIONS: MaterialsConfiguratorOption[] = [];
const HUTCH_SHADOW_SRC = '/catalogs/MRC1000/customization/metro_top_shadow.webp';

function pickRandom<T>(arr: readonly T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

function getOptionLabelParts(option: MaterialsConfiguratorOption) {
  const code = formatOptionCode(option.code);
  const name = option.label.replace(code, '').replace(option.code, '').trim();
  return { code, name };
}

function StaticTile({ option }: { option: MaterialsConfiguratorOption }) {
  const label = getOptionLabelParts(option);
  return (
    <div className="finishes-print-tile">
      <div
        aria-hidden="true"
        className="finishes-print-tile-image"
        style={{ backgroundImage: `url("${option.thumbnail}")` }}
      />
      <p className="finishes-print-tile-label">
        <span className="block">
          <QxText text={label.code} />
        </span>
        {label.name && (
          <span className="block">
            <QxText text={label.name} />
          </span>
        )}
      </p>
    </div>
  );
}

function StaticGroup({
  title,
  options,
}: {
  title: string;
  options: MaterialsConfiguratorOption[];
}) {
  if (options.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 font-display text-lg font-normal text-foreground">
        <QxText text={title} />
      </h3>
      <div className="finishes-print-tile-row">
        {options.map((option) => (
          <StaticTile key={option.id} option={option} />
        ))}
      </div>
    </div>
  );
}

/**
 * Print-only Customization section for MRC1000.
 *
 * Static SSR port of MaterialsMRC1000: stacked body + shadow (multiply) +
 * hutch preview, price-tier swatch tiles on the left. Default pick = first
 * décor for both body and hutch, hutch overlay shown.
 */
export default function MaterialsPrintMRC1000({ data }: Props) {
  const sourceDesktops = data.configurator?.desktopOptions ?? EMPTY_OPTIONS;
  const dedupedDesktops = dedupeByCode(sourceDesktops);

  if (dedupedDesktops.length === 0) return null;

  const groupedDesktops = (() => {
    if (!data.priceGroups || data.priceGroups.length === 0) return null;
    const claimed = new Set<string>();
    const groups: { title: string; options: MaterialsConfiguratorOption[] }[] =
      [];
    for (const group of data.priceGroups) {
      const options = orderOptions(dedupedDesktops, group.codes);
      if (options.length === 0) continue;
      for (const option of options) claimed.add(option.code);
      groups.push({ title: group.title, options });
    }
    const leftovers = dedupedDesktops.filter(
      (option) => !claimed.has(option.code),
    );
    return { groups, leftovers };
  })();

  const bodyOption = pickRandom(dedupedDesktops) ?? dedupedDesktops[0];
  const hutchOption = pickRandom(dedupedDesktops) ?? dedupedDesktops[0];
  const baseSrc = `/catalogs/MRC1000/customization/metro_${bodyOption.code}.webp`;
  const hutchSrc = `/catalogs/MRC1000/customization/metro_top_${hutchOption.code}.webp`;
  const previewAlt = `${data.title} preview — body ${bodyOption.label}, hutch ${hutchOption.label}`;

  return (
    <section
      id="materials"
      className="print-section"
      aria-labelledby="materials-title"
    >
      <div className="print-section-frame">
        <SectionHeading
          id="materials"
          sectionLabel={data.sectionLabel}
          title={data.title}
          className="print-section-heading"
        />

        {data.description && (
          <p className="sec_main_text finishes-print-description">
            <QxText text={data.description} />
          </p>
        )}

        <div className="print-section-content finishes-print-content">
          <div className="finishes-print-preview">
            <figure
              className="finishes-print-preview-stage"
              role="img"
              aria-label={previewAlt}
            >
              <PrintImage
                src={baseSrc}
                alt=""
                draggable={false}
                ariaHidden
                sizes="(min-width: 1440px) 687px, (min-width: 1024px) 50vw, 100vw"
                className="finishes-print-preview-layer"
              />
              <PrintImage
                src={HUTCH_SHADOW_SRC}
                alt=""
                draggable={false}
                ariaHidden
                sizes="(min-width: 1440px) 687px, (min-width: 1024px) 50vw, 100vw"
                className="finishes-print-preview-layer finishes-print-preview-layer-multiply"
              />
              <PrintImage
                src={hutchSrc}
                alt=""
                draggable={false}
                ariaHidden
                sizes="(min-width: 1440px) 687px, (min-width: 1024px) 50vw, 100vw"
                className="finishes-print-preview-layer"
              />
            </figure>
            <figcaption className="finishes-print-preview-legend">
              <ul className="finishes-print-preview-legend-list">
                <li>
                  <span className="finishes-print-preview-legend-label">
                    Body finish:
                  </span>{' '}
                  <span className="finishes-print-preview-legend-value">
                    <QxText text={bodyOption.label} />
                  </span>
                </li>
                <li>
                  <span className="finishes-print-preview-legend-label">
                    Hutch finish:
                  </span>{' '}
                  <span className="finishes-print-preview-legend-value">
                    <QxText text={hutchOption.label} />
                  </span>
                </li>
              </ul>
              <p className="finishes-print-preview-legend-note">
                Full customization is available online on the METRO product
                page.
              </p>
            </figcaption>
          </div>

          <div className="finishes-print-left">
            <div className="finishes-print-groups">
              <div>
                <h3 className="mb-3 qx-emphasis-title">
                  <QxText text="Available finishes" />
                </h3>
                <div className="finishes-print-subgroups">
                  {groupedDesktops?.groups.map((group) => (
                    <StaticGroup
                      key={group.title}
                      title={group.title}
                      options={group.options}
                    />
                  ))}
                  {groupedDesktops &&
                    groupedDesktops.leftovers.length > 0 && (
                      <StaticGroup
                        title="Other"
                        options={groupedDesktops.leftovers}
                      />
                    )}
                  {!groupedDesktops && (
                    <StaticGroup
                      title="Available finishes"
                      options={dedupedDesktops}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
