'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import Image from 'next/image';
import { AnimatePresence, m, useInView, useReducedMotion } from 'framer-motion';
import type { FeatureItem, FeaturesData } from '@/types/catalog';
import { getIcon } from '@/lib/icon-map';
import { SECTION_REVEAL_SLIDE, slowTransition } from '@/lib/motion';
import { QxText } from '@/components/catalog/QxText';

interface FeaturesSectionProps {
  data: FeaturesData;
}

interface FeatureVideoProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  active: FeatureItem | undefined;
  activeIndex: number;
}

function FeatureVideo({ videoRef, active, activeIndex }: FeatureVideoProps) {
  return (
    <div className="relative aspect-square w-full overflow-hidden bg-surface-elevated">
      {active?.image ? (
        <>
          <Image
            key={`${activeIndex}-${active.image.src}`}
            src={active.image.src}
            alt={active.image.alt ?? ''}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span className="sr-only">
            {`Visual: ${active.title}: ${active.desc}`}
          </span>
        </>
      ) : active?.video ? (
        <>
          <video
            ref={videoRef}
            key={`${activeIndex}-${active.video.src}`}
            src={active.video.src}
            poster={active.video.poster}
            className="absolute inset-0 h-full w-full object-cover"
            muted
            playsInline
            preload="metadata"
            tabIndex={-1}
            aria-hidden="true"
          />
          <span className="sr-only">
            {`Visual demonstration of ${active.title}: ${active.desc}`}
          </span>
        </>
      ) : null}
    </div>
  );
}

const FeaturesMRC800 = ({ data }: FeaturesSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const reveal = SECTION_REVEAL_SLIDE;
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const mobileVideoRef = useRef<HTMLVideoElement | null>(null);
  const desktopVideoRef = useRef<HTMLVideoElement | null>(null);

  const items = data.items;
  const active: FeatureItem | undefined = items[activeIndex];

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
  }, [activeIndex, prefersReducedMotion]);

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
            <FeatureVideo videoRef={mobileVideoRef} active={active} activeIndex={activeIndex} />
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
                return (
                  <button
                    key={item.title}
                    type="button"
                    id={tabId}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={panelId}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveIndex(index)}
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
                    <span className="qx-item-title">
                      <QxText text={item.title} />
                    </span>
                  </button>
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
          <FeatureVideo videoRef={desktopVideoRef} active={active} activeIndex={activeIndex} />
        </div>
      </div>
    </section>
  );
};

export default FeaturesMRC800;
