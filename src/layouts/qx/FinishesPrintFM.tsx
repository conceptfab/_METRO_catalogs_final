import type {
  FinishesData,
  MaterialsConfiguratorData,
  MaterialsConfiguratorOption,
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
  data: FinishesData;
  configurator?: MaterialsConfiguratorData;
  previewMode?: 'layered' | 'frame-only' | 'desktop-only';
}

const EMPTY_OPTIONS: MaterialsConfiguratorOption[] = [];
const DESKTOP_PRICE_GROUP_1 = ['U100', 'U110', 'U120', 'U130', 'W220', 'W240'];
const DESKTOP_PRICE_GROUP_2 = ['W200', 'W210', 'W250', 'W310', 'W330'];
const FRAME_COLOR_ORDER = ['RAL9006'];

function getOptionLabelParts(option: MaterialsConfiguratorOption) {
  const code = formatOptionCode(option.code);
  const name = option.label.replace(code, '').replace(option.code, '').trim();
  return { code, name };
}

function describeOption(option: MaterialsConfiguratorOption) {
  const { code, name } = getOptionLabelParts(option);
  return name ? `${code} ${name}` : code;
}

function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
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
  variant = 'secondary',
}: {
  title: string;
  options: MaterialsConfiguratorOption[];
  variant?: 'primary' | 'secondary';
}) {
  if (options.length === 0) return null;
  const titleClass =
    variant === 'primary'
      ? 'mb-3 qx-emphasis-title'
      : 'mb-2 font-display text-lg font-normal text-foreground';
  return (
    <div>
      <h3 className={titleClass}>
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

export default function FinishesPrintFM({
  data,
  configurator,
  previewMode,
}: Props) {
  const sourceFrame = configurator?.frameOptions ?? EMPTY_OPTIONS;
  const sourceDesktop = configurator?.desktopOptions ?? EMPTY_OPTIONS;

  const dedupedFrame = dedupeByCode(sourceFrame);
  const dedupedDesktop = dedupeByCode(sourceDesktop);

  const frameOptions = orderOptions(dedupedFrame, FRAME_COLOR_ORDER);

  const desktopGroup1 = orderOptions(dedupedDesktop, DESKTOP_PRICE_GROUP_1);
  const desktopGroup2 = orderOptions(dedupedDesktop, DESKTOP_PRICE_GROUP_2);
  const desktopOptions = [...desktopGroup1, ...desktopGroup2];

  const hasConfigurator =
    frameOptions.length > 0 && desktopOptions.length > 0;

  const randomFrame = frameOptions[0];
  const randomDesktop = pickRandom(desktopOptions);

  const previewAlt =
    randomFrame && randomDesktop
      ? `Metro desk with desktop ${randomDesktop.label} and frame ${randomFrame.label}`
      : `${data.title} preview`;

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

        <div className="print-section-content finishes-print-content">
          <div className="finishes-print-left">
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

            {hasConfigurator ? (
              <div className="finishes-print-groups">
                <div>
                  <h3 className="mb-3 qx-emphasis-title">
                    <QxText text="Decor" />
                  </h3>
                  <div className="finishes-print-subgroups">
                    <StaticGroup
                      title="I-st price group"
                      options={desktopGroup1}
                    />
                    <StaticGroup
                      title="II-nd price group"
                      options={desktopGroup2}
                    />
                  </div>
                </div>
                <StaticGroup
                  title="Steel parts colors"
                  options={frameOptions}
                  variant="primary"
                />
              </div>
            ) : (
              <div className="finishes-print-groups">
                <div>
                  <h3 className="mb-4 qx-emphasis-title">Decor</h3>
                  <div className="finishes-print-swatch-row">
                    {data.desktopColors.map((c) => (
                      <div
                        key={c.name}
                        className="finishes-print-swatch"
                        style={{ backgroundColor: c.code }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-4 qx-emphasis-title">Steel parts colors</h3>
                  <div className="finishes-print-swatch-row">
                    {data.frameColors.map((c) => (
                      <div
                        key={c.name}
                        className="finishes-print-swatch"
                        style={{ backgroundColor: c.code }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {hasConfigurator && (randomFrame || randomDesktop) ? (
            <div className="finishes-print-preview">
              <figure
                className="finishes-print-preview-stage"
                role="img"
                aria-label={previewAlt}
              >
                {previewMode !== 'desktop-only' && randomFrame && (
                  <PrintImage
                    src={randomFrame.image}
                    alt=""
                    draggable={false}
                    ariaHidden
                    sizes="(min-width: 1440px) 687px, (min-width: 1024px) 50vw, 100vw"
                    className="finishes-print-preview-layer"
                  />
                )}
                {previewMode !== 'frame-only' && randomDesktop && (
                  <PrintImage
                    src={randomDesktop.image}
                    alt=""
                    draggable={false}
                    ariaHidden
                    sizes="(min-width: 1440px) 687px, (min-width: 1024px) 50vw, 100vw"
                    className="finishes-print-preview-layer"
                  />
                )}
              </figure>
              <figcaption className="finishes-print-preview-legend">
                <ul className="finishes-print-preview-legend-list">
                  {randomDesktop && (
                    <li>
                      <span className="finishes-print-preview-legend-label">
                        Decor:
                      </span>{' '}
                      <span className="finishes-print-preview-legend-value">
                        <QxText text={describeOption(randomDesktop)} />
                      </span>
                    </li>
                  )}
                  {randomFrame && (
                    <li>
                      <span className="finishes-print-preview-legend-label">
                        Steel parts:
                      </span>{' '}
                      <span className="finishes-print-preview-legend-value">
                        <QxText text={describeOption(randomFrame)} />
                      </span>
                    </li>
                  )}
                </ul>
                <p className="finishes-print-preview-legend-note">
                  Full customization is available online on the METRO product
                  page.
                </p>
              </figcaption>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
