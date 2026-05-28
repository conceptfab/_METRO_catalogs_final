'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { AnimatePresence, m, useInView, useReducedMotion } from 'framer-motion';
import type { FeatureItem, FeatureVariant, FeaturesData } from '@/types/catalog';
import { getIcon } from '@/lib/icon-map';
import { SECTION_REVEAL_SLIDE, slowTransition } from '@/lib/motion';
import { QxText } from '@/components/catalog/QxText';

interface FeaturesSectionProps {
  data: FeaturesData;
}

interface ActiveVideo {
  src: string;
  poster?: string;
}

interface FeatureVideoProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  video: ActiveVideo | undefined;
  videoKey: string;
  ariaLabel: string;
}

function FeatureVideo({ videoRef, video, videoKey, ariaLabel }: FeatureVideoProps) {
  return (
    <div className="relative aspect-square w-full overflow-hidden bg-surface-elevated">
      {video ? (
        <>
          <video
            ref={videoRef}
            key={videoKey}
            src={video.src}
            poster={video.poster}
            className="absolute inset-0 h-full w-full object-cover"
            muted
            playsInline
            preload="metadata"
            tabIndex={-1}
            aria-hidden="true"
          />
          <span className="sr-only">{ariaLabel}</span>
        </>
      ) : null}
    </div>
  );
}

function resolveActiveVideo(
  feature: FeatureItem | undefined,
  variant: FeatureVariant | undefined,
): ActiveVideo | undefined {
  if (feature?.variants && feature.variants.length > 0) {
    return variant?.video;
  }
  return feature?.video;
}

const FeaturesQX = ({ data }: FeaturesSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const reveal = SECTION_REVEAL_SLIDE;
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [variantsExpandedIndex, setVariantsExpandedIndex] = useState(-1);
  const mobileVideoRef = useRef<HTMLVideoElement | null>(null);
  const desktopVideoRef = useRef<HTMLVideoElement | null>(null);

  const items = data.items;
  const active: FeatureItem | undefined = items[activeIndex];
  const activeVariants = active?.variants;
  const activeVariant = activeVariants?.[activeVariantIndex];
  const activeVideo = resolveActiveVideo(active, activeVariant);
  const videoKey = `${activeIndex}-${activeVariants ? activeVariantIndex : 'main'}-${activeVideo?.src ?? 'empty'}`;
  const ariaLabel = active
    ? activeVariant
      ? `Visual demonstration of ${active.title} — ${activeVariant.title}`
      : `Visual demonstration of ${active.title}: ${active.desc}`
    : '';

  useEffect(() => {
    if (prefersReducedMotion) return;
    const refs = [mobileVideoRef, desktopVideoRef];
    const observers: IntersectionObserver[] = [];
    for (const ref of refs) {
      const el = ref.current;
      if (!el) continue;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            el.play().catch(() => {});
          } else {
            el.pause();
          }
        },
        { threshold: 0.25 },
      );
      io.observe(el);
      observers.push(io);
    }
    return () => {
      for (const io of observers) io.disconnect();
    };
  }, [activeIndex, activeVariantIndex, prefersReducedMotion]);

  const handleSelectFeature = (index: number, hasVariants: boolean) => {
    if (index === activeIndex) {
      if (hasVariants) {
        setVariantsExpandedIndex((prev) => (prev === index ? -1 : index));
      }
      return;
    }
    setActiveIndex(index);
    setActiveVariantIndex(0);
    setVariantsExpandedIndex(-1);
  };

  return (
    <section
      id="features"
      className="bg-surface-elevated lg:min-h-[960px]"
      aria-labelledby="features-title"
    >
      <div
        className="relative mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-10 px-5 pt-6 pb-12 sm:px-8 sm:pt-8 lg:min-h-[960px] lg:grid-cols-12 lg:gap-0 lg:px-0 lg:py-0"
        ref={ref}
      >
        <div className="relative z-10 flex flex-col lg:col-span-6 lg:max-w-[520px] lg:pt-3">
          <m.div
            initial={reveal.header.initial}
            animate={isInView ? reveal.header.animate : {}}
            transition={slowTransition({ duration: 0.6 })}
          >
            <p className="section_ID mb-12 font-display uppercase lg:mb-[120px]">
              <QxText text={data.sectionLabel} />
            </p>
            <h2
              id="features-title"
              className="section_Title font-display font-normal"
            >
              <QxText text={data.title} />
            </h2>
          </m.div>

          <m.div
            initial={reveal.content.initial}
            animate={isInView ? reveal.content.animate : {}}
            transition={slowTransition({ duration: 0.5, delay: 0.15 })}
            className="mt-8 lg:hidden"
          >
            <FeatureVideo
              videoRef={mobileVideoRef}
              video={activeVideo}
              videoKey={`mobile-${videoKey}`}
              ariaLabel={ariaLabel}
            />
          </m.div>

          <m.div
            initial={reveal.content.initial}
            animate={isInView ? reveal.content.animate : {}}
            transition={slowTransition({ duration: 0.5, delay: 0.2 })}
            className="mt-12 lg:mt-[80px]"
            role="tablist"
            aria-label="Functionality pillars"
          >
            <div className="flex flex-col gap-3">
              {items.map((item, index) => {
                const Icon = getIcon(item.icon);
                const isActive = index === activeIndex;
                const panelId = `functionality-panel-${index}`;
                const tabId = `functionality-tab-${index}`;
                const variants = item.variants;
                const hasVariants = !!variants && variants.length > 0;
                const variantsExpanded =
                  hasVariants && variantsExpandedIndex === index;
                const variantGroupId = `functionality-variants-${index}`;

                return (
                  <div key={item.title} className="flex flex-col gap-2">
                    <button
                      type="button"
                      id={tabId}
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={
                        hasVariants ? variantGroupId : panelId
                      }
                      aria-expanded={hasVariants ? variantsExpanded : undefined}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => handleSelectFeature(index, hasVariants)}
                      className={`group flex w-full items-center gap-5 border px-5 py-4 text-left transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
                        isActive
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border bg-background text-foreground hover:border-foreground/40 hover:bg-foreground/5'
                      }`}
                    >
                      <Icon
                        size={32}
                        strokeWidth={1.25}
                        className="shrink-0"
                        aria-hidden="true"
                      />
                      <span className="qx-item-title flex-1">
                        <QxText text={item.title} />
                      </span>
                      {hasVariants ? (
                        <span
                          aria-hidden="true"
                          className={`shrink-0 text-2xl leading-none transition-transform duration-200 ${
                            variantsExpanded ? 'rotate-45' : ''
                          }`}
                        >
                          +
                        </span>
                      ) : null}
                    </button>

                    {hasVariants ? (
                      <AnimatePresence initial={false}>
                        {variantsExpanded ? (
                          <m.div
                            key="variants"
                            id={variantGroupId}
                            role="group"
                            aria-label={`${item.title} options`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={slowTransition({ duration: 0.3 })}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col gap-2 pt-1 pl-6">
                              {variants.map((variant, vIndex) => {
                                const isVariantActive =
                                  vIndex === activeVariantIndex;
                                return (
                                  <button
                                    key={variant.title}
                                    type="button"
                                    onClick={() =>
                                      setActiveVariantIndex(vIndex)
                                    }
                                    aria-pressed={isVariantActive}
                                    className={`flex w-full items-center border px-4 py-3 text-left text-sm transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
                                      isVariantActive
                                        ? 'border-foreground bg-foreground text-background'
                                        : 'border-border bg-background text-foreground hover:border-foreground/40 hover:bg-foreground/5'
                                    }`}
                                  >
                                    <span className="qx-item-title">
                                      <QxText text={variant.title} />
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </m.div>
                        ) : null}
                      </AnimatePresence>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </m.div>

          <div
            className="mt-8 max-w-[520px] lg:mt-10"
            id={`functionality-panel-${activeIndex}`}
            role="tabpanel"
            aria-labelledby={`functionality-tab-${activeIndex}`}
          >
            <AnimatePresence mode="wait">
              <m.p
                key={activeIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={slowTransition({ duration: 0.35 })}
                className="sec_main_text font-body"
              >
                {active && <QxText text={active.desc} />}
              </m.p>
            </AnimatePresence>
          </div>
        </div>

        <div className="hidden lg:absolute lg:inset-y-0 lg:left-1/2 lg:right-0 lg:flex lg:items-center lg:justify-center">
          <FeatureVideo
            videoRef={desktopVideoRef}
            video={activeVideo}
            videoKey={`desktop-${videoKey}`}
            ariaLabel={ariaLabel}
          />
        </div>
      </div>
    </section>
  );
};

export default FeaturesQX;
