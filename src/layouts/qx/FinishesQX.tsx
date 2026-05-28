'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m, useInView } from 'framer-motion';
import Image from 'next/image';
import type {
  MaterialsConfiguratorData,
  MaterialsConfiguratorOption,
  FinishesData,
} from '@/types/catalog';
import { SECTION_REVEAL_SETTLE, slowTransition } from '@/lib/motion';
import { QxText } from '@/components/catalog/QxText';
import { responsiveImg } from '@/lib/responsive-image';
import { MaterialsOptionGroup } from '@/components/catalog/MaterialsOptionGroup';
import { applyOptionDescriptions } from '@/lib/materials-options';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import { ZoomIn } from 'lucide-react';

interface FinishesSectionProps {
  data: FinishesData;
  configurator?: MaterialsConfiguratorData;
  catalogId?: string;
}

const EMPTY_OPTIONS: MaterialsConfiguratorOption[] = [];
const DESKTOP_PRICE_GROUP_1 = ['U100', 'U110', 'U120', 'U130', 'W220', 'W240'];
const DESKTOP_PRICE_GROUP_2 = ['W200', 'W210', 'W250', 'W310', 'W330'];
const FRAME_COLOR_ORDER = ['RAL9006', 'RAL9005', 'RAL9003', 'RAL7024'];
const FRAME_COLOR_NAMES: Record<string, string> = {
  RAL9006: 'GREY',
  RAL9005: 'BLACK',
  RAL9003: 'WHITE',
  RAL7024: 'GRAPHITE',
};

function orderOptions(
  options: MaterialsConfiguratorOption[],
  orderedCodes: string[],
) {
  const optionsByCode = new Map(options.map((option) => [option.code, option]));
  return orderedCodes.flatMap((code) => {
    const option = optionsByCode.get(code);
    return option ? [option] : [];
  });
}

const FinishesQX = ({ data, configurator, catalogId }: FinishesSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const reveal = SECTION_REVEAL_SETTLE;
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const previewDialogRef = useRef<HTMLDivElement | null>(null);
  useFocusTrap(previewDialogRef, isPreviewOpen);

  const sourceFrameOptions = configurator?.frameOptions ?? EMPTY_OPTIONS;
  const sourceDesktopOptions = configurator?.desktopOptions ?? EMPTY_OPTIONS;
  const frameOptions = applyOptionDescriptions(
    orderOptions(sourceFrameOptions, FRAME_COLOR_ORDER),
    FRAME_COLOR_NAMES,
  );
  const desktopPriceGroup1 = orderOptions(
    sourceDesktopOptions,
    DESKTOP_PRICE_GROUP_1,
  );
  const desktopPriceGroup2 = orderOptions(
    sourceDesktopOptions,
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
  const [selectedPreviewId, setSelectedPreviewId] = useState(
    desktopOptions[0]?.id ?? frameOptions[0]?.id ?? '',
  );

  const selectedFrame =
    frameOptions.find((option) => option.id === selectedFrameId) ??
    frameOptions[0];
  const selectedDesktop =
    desktopOptions.find((option) => option.id === selectedDesktopId) ??
    desktopOptions[0];
  const selectedPreviewOption =
    [...desktopOptions, ...frameOptions].find(
      (option) => option.id === selectedPreviewId,
    ) ?? selectedDesktop ?? selectedFrame;
  const previewImage = selectedPreviewOption?.image ?? '';
  const previewAlt = selectedPreviewOption?.label ?? data.title;
  const descriptionLines = data.description?.split('\n') ?? [];
  const previewScaleClass = catalogId === 'FOTA' ? 'scale-[1.15] transform' : '';

  useEffect(() => {
    if (!isPreviewOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPreviewOpen(false);
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isPreviewOpen]);

  return (
    <section
      id="finishes"
      className="bg-surface-elevated lg:min-h-[960px]"
      aria-labelledby="finishes-title"
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
            id="finishes-title"
            className="section_Title mt-8 font-display font-normal lg:mt-7"
          >
            <QxText text={data.title} />
          </h2>
          {data.description && (
            <p className="sec_main_text mt-6 max-w-[633px]">
              {descriptionLines.map((line, index) => (
                <span key={line}>
                  <QxText text={line} />
                  {index < descriptionLines.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
          )}
        </m.div>

        <m.div
          initial={reveal.content.initial}
          animate={isInView ? reveal.content.animate : {}}
          transition={slowTransition({ duration: 0.6, delay: 0.2 })}
          className="mt-8 space-y-5 lg:mt-8 lg:max-w-[753px]"
        >
          {hasConfigurator ? (
            <>
              <div>
                <h3 className="mb-3 qx-emphasis-title">
                  <QxText text="Desktop Finish" />
                </h3>
                <div className="space-y-4">
                  <MaterialsOptionGroup
                    title="I-st price group"
                    options={desktopPriceGroup1}
                    selectedId={selectedPreviewId}
                    onSelect={(id) => {
                      setSelectedDesktopId(id);
                      setSelectedPreviewId(id);
                    }}
                  />
                  <MaterialsOptionGroup
                    title="II-nd price group"
                    options={desktopPriceGroup2}
                    selectedId={selectedPreviewId}
                    onSelect={(id) => {
                      setSelectedDesktopId(id);
                      setSelectedPreviewId(id);
                    }}
                  />
                </div>
              </div>
              <MaterialsOptionGroup
                title="Steel parts colors"
                options={frameOptions}
                selectedId={selectedPreviewId}
                variant="primary"
                onSelect={(id) => {
                  setSelectedFrameId(id);
                  setSelectedPreviewId(id);
                }}
              />
            </>
          ) : (
            <>
              <div>
                <h3 className="mb-4 qx-emphasis-title">
                  Desktop Finish
                </h3>
                <div className="flex flex-wrap gap-3">
                  {data.desktopColors.map((c) => (
                    <div
                      key={c.name}
                      className="size-12 rounded-full border border-border"
                      style={{ backgroundColor: c.code }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-4 qx-emphasis-title">
                  Frame Colour
                </h3>
                <div className="flex flex-wrap gap-3">
                  {data.frameColors.map((c) => (
                    <div
                      key={c.name}
                      className="size-12 rounded-full border border-border"
                      style={{ backgroundColor: c.code }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </m.div>

        <m.div
          initial={reveal.content.initial}
          animate={isInView ? reveal.content.animate : {}}
          transition={slowTransition({ duration: 0.3, delay: 0.35 })}
          className="mt-10 aspect-square w-full lg:absolute lg:bottom-0 lg:right-0 lg:mt-0 lg:aspect-auto lg:h-[715px] lg:w-[687px]"
        >
          <button
            type="button"
            className="group relative block h-full w-full cursor-zoom-in overflow-hidden text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            onClick={() => setIsPreviewOpen(true)}
            aria-label={`Open preview: ${previewAlt}`}
          >
            <span
              aria-hidden="true"
              className="absolute right-3 top-3 z-10 flex size-10 items-center justify-center bg-surface-elevated/90 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              <ZoomIn size={18} strokeWidth={1.5} />
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <m.img
                key={previewImage}
                src={previewImage}
                {...responsiveImg(previewImage, 'materials-full')}
                alt={previewAlt}
                draggable={false}
                className={`h-full w-full object-cover ${previewScaleClass}`}
                loading="lazy"
                decoding="async"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={slowTransition({
                  duration: 0.22,
                  ease: 'easeOut',
                })}
              />
            </AnimatePresence>
          </button>
        </m.div>

        <AnimatePresence>
          {isPreviewOpen && (
            <m.div
              ref={previewDialogRef}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-5"
              role="dialog"
              aria-modal="true"
              aria-labelledby="finishes-preview-title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPreviewOpen(false)}
            >
              <m.div
                className="relative aspect-square w-[min(88vw,88vh)] bg-surface-elevated"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={slowTransition({ duration: 0.18 })}
                onClick={(event) => event.stopPropagation()}
              >
                <h2 id="finishes-preview-title" className="sr-only">
                  {previewAlt}
                </h2>
                <button
                  type="button"
                  className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center bg-surface-elevated text-2xl leading-none text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                  onClick={() => setIsPreviewOpen(false)}
                  aria-label="Close preview"
                >
                  ×
                </button>

                <Image
                  src={previewImage}
                  alt={previewAlt}
                  fill
                  sizes="(min-width: 1024px) 88vh, 88vw"
                  className={`object-cover ${previewScaleClass}`}
                />
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default FinishesQX;
