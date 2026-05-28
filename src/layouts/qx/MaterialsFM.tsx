'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, m, useInView } from 'framer-motion';
import type { MaterialsConfiguratorOption, MaterialsData } from '@/types/catalog';
import { SECTION_REVEAL_SETTLE, slowTransition } from '@/lib/motion';
import { QxText } from '@/components/catalog/QxText';
import { responsiveImg } from '@/lib/responsive-image';
import { MaterialsOptionGroup } from '@/components/catalog/MaterialsOptionGroup';
import {
  applyOptionDescriptions,
  dedupeByCode,
  orderOptions,
} from '@/lib/materials-options';

interface MaterialsSectionProps {
  data: MaterialsData;
}

const EMPTY_MATERIAL_OPTIONS: MaterialsConfiguratorOption[] = [];
const DESKTOP_PRICE_GROUP_1 = ['U100', 'U110', 'U120', 'U130', 'W220', 'W240'];
const DESKTOP_PRICE_GROUP_2 = ['W200', 'W210', 'W250', 'W310', 'W330'];
const FRAME_COLOR_ORDER = ['RAL9006'];
const FRAME_COLOR_NAMES: Record<string, string> = {
  RAL9006: 'GREY',
};

const MaterialsFM = ({ data }: MaterialsSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const reveal = SECTION_REVEAL_SETTLE;
  const sourceFrameOptions =
    data.configurator?.frameOptions ?? EMPTY_MATERIAL_OPTIONS;
  const sourceDesktopOptions =
    data.configurator?.desktopOptions ?? EMPTY_MATERIAL_OPTIONS;
  const dedupedFrameOptions = dedupeByCode(sourceFrameOptions);
  const dedupedDesktopOptions = dedupeByCode(sourceDesktopOptions);
  const frameOptions = applyOptionDescriptions(
    orderOptions(dedupedFrameOptions, FRAME_COLOR_ORDER),
    FRAME_COLOR_NAMES,
  );
  const desktopPriceGroup1 = orderOptions(
    dedupedDesktopOptions,
    DESKTOP_PRICE_GROUP_1,
  );
  const desktopPriceGroup2 = orderOptions(
    dedupedDesktopOptions,
    DESKTOP_PRICE_GROUP_2,
  );
  const desktopOptions = [...desktopPriceGroup1, ...desktopPriceGroup2];
  const hasConfigurator = frameOptions.length > 0 && desktopOptions.length > 0;
  const [selectedFrameId, setSelectedFrameId] = useState(
    frameOptions[0]?.id ?? '',
  );
  const [selectedDesktopId, setSelectedDesktopId] = useState(
    desktopOptions[0]?.id ?? '',
  );

  const selectedFrame =
    frameOptions.find((option) => option.id === selectedFrameId) ??
    frameOptions[0];
  const selectedDesktop =
    desktopOptions.find((option) => option.id === selectedDesktopId) ??
    desktopOptions[0];
  const configuratorAlt =
    selectedFrame && selectedDesktop
      ? `Metro desk with desktop ${selectedDesktop.label} and frame ${selectedFrame.label}`
      : `${data.title} preview`;

  return (
    <section
      id="materials"
      className="bg-surface-elevated lg:min-h-[960px]"
      aria-labelledby="materials-title"
    >
      <div
        className="relative mx-auto w-full max-w-[1440px] px-5 pt-6 pb-12 sm:px-8 sm:pt-8 lg:min-h-[960px] lg:px-0 lg:py-0"
        ref={ref}
      >
        <m.div
          initial={reveal.header.initial}
          animate={isInView ? reveal.header.animate : {}}
          transition={slowTransition({ duration: 0.6 })}
          className="relative z-10 flex flex-col lg:pt-3"
        >
          <p className="section_ID font-display uppercase">
            <QxText text={data.sectionLabel} />
          </p>
          <h2
            id="materials-title"
            className="section_Title mt-8 font-display font-normal lg:mt-7"
          >
            <QxText text={data.title} />
          </h2>
          {data.description && (
            <p className="sec_main_text mt-6 max-w-[633px]">
              <QxText text={data.description} />
            </p>
          )}
        </m.div>

        <m.div
          initial={reveal.content.initial}
          animate={isInView ? reveal.content.animate : {}}
          transition={slowTransition({ duration: 0.6, delay: 0.2 })}
          className="mt-8 space-y-5 lg:mt-8 lg:ml-auto lg:w-full lg:max-w-[721px]"
        >
          {hasConfigurator ? (
            <>
              <div>
                <h3 className="mb-3 qx-emphasis-title">
                  <QxText text="Decor" />
                </h3>
                <div className="space-y-4">
                  {desktopPriceGroup1.length > 0 && (
                    <MaterialsOptionGroup
                      title="I-st price group"
                      options={desktopPriceGroup1}
                      selectedId={selectedDesktop?.id}
                      onSelect={setSelectedDesktopId}
                    />
                  )}
                  {desktopPriceGroup2.length > 0 && (
                    <MaterialsOptionGroup
                      title="II-nd price group"
                      options={desktopPriceGroup2}
                      selectedId={selectedDesktop?.id}
                      onSelect={setSelectedDesktopId}
                    />
                  )}
                </div>
              </div>
              <MaterialsOptionGroup
                title="Steel parts colors"
                options={frameOptions}
                selectedId={selectedFrame?.id}
                onSelect={setSelectedFrameId}
                variant="primary"
              />
            </>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {data.swatches.map((swatch) => (
                <div key={swatch.name} className="text-center">
                  <div
                    aria-hidden="true"
                    className="aspect-square w-full shadow-md transition-transform hover:scale-110"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    <QxText text={swatch.name} />
                  </p>
                </div>
              ))}
            </div>
          )}
        </m.div>

        <m.div
          initial={reveal.content.initial}
          animate={isInView ? reveal.content.animate : {}}
          transition={slowTransition({ duration: 0.3, delay: 0.35 })}
          className="mt-10 aspect-square w-full lg:absolute lg:bottom-0 lg:left-0 lg:mt-0 lg:aspect-auto lg:h-[715px] lg:w-[687px]"
        >
          {hasConfigurator && selectedFrame && selectedDesktop ? (
            <figure
              className="relative h-full w-full"
              role="img"
              aria-label={configuratorAlt}
            >
              {data.previewMode !== 'desktop-only' && (
                <AnimatePresence mode="wait" initial={false}>
                  <m.img
                    key={`frame-${selectedFrame.image}`}
                    src={selectedFrame.image}
                    {...responsiveImg(selectedFrame.image, 'materials-full')}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-contain"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={slowTransition({
                      duration: 0.22,
                      ease: 'easeOut',
                    })}
                  />
                </AnimatePresence>
              )}

              {data.previewMode !== 'frame-only' && (
                <AnimatePresence mode="wait" initial={false}>
                  <m.img
                    key={`desktop-${selectedDesktop.image}`}
                    src={selectedDesktop.image}
                    {...responsiveImg(selectedDesktop.image, 'materials-full')}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-contain"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={slowTransition({
                      duration: 0.22,
                      ease: 'easeOut',
                    })}
                  />
                </AnimatePresence>
              )}
            </figure>
          ) : null}
        </m.div>
      </div>
    </section>
  );
};

export default MaterialsFM;
