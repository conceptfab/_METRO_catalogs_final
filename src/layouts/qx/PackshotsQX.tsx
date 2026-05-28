'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { m, useInView, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type {
  MaterialsConfiguratorData,
  PackshotsData,
} from '@/types/catalog';
import { SECTION_REVEAL_SLIDE, slowTransition } from '@/lib/motion';
import { QxText } from '@/components/catalog/QxText';
import { ColorChip } from '@/components/catalog/ColorChip';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import { useIsMobile } from '@/hooks/use-mobile';
import { parsePackshotImage, pickConfiguratorOption } from '@/lib/materials-options';

interface PackshotsSectionProps {
  data: PackshotsData;
  materialsConfigurator?: MaterialsConfiguratorData;
}

const SAMPLE_PACKSHOT_SRC =
  '/catalogs/QX/packshots/V51_W240_black__Shot_A_4K_R10.webp';

const PackshotsQX = ({
  data,
  materialsConfigurator,
}: PackshotsSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const reveal = SECTION_REVEAL_SLIDE;
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const counterId = useId();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const activeIndex = isMobile ? null : lightboxIndex;
  useFocusTrap(dialogRef, activeIndex !== null);

  const packshotItems = data.groups.flatMap((group) =>
    group.items.map((item) => ({
      ...item,
      groupLabel: group.label,
      groupDescription: group.desc,
      image: item.image ?? SAMPLE_PACKSHOT_SRC,
    })),
  );

  const itemCount = packshotItems.length;
  const openLightbox = (index: number) => {
    if (isMobile) return;
    setLightboxIndex(index);
  };
  const closeLightbox = () => setLightboxIndex(null);

  const navigate = (dir: number) => {
    setLightboxIndex((current) =>
      current === null ? null : (current + dir + itemCount) % itemCount,
    );
  };

  useEffect(() => {
    if (activeIndex === null) return;

    closeButtonRef.current?.focus();

    const cycle = (dir: number) =>
      setLightboxIndex((current) =>
        current === null ? null : (current + dir + itemCount) % itemCount,
      );

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setLightboxIndex(null);
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        cycle(-1);
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        cycle(1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, itemCount]);

  const activeItem =
    activeIndex !== null ? packshotItems[activeIndex] : null;

  return (
    <>
      <section
        id="packshots"
        aria-labelledby="packshots-title"
        className="bg-surface-elevated"
      >
        <div
          className="relative mx-auto w-full max-w-[1440px] px-5 pt-6 pb-12 sm:px-8 sm:pt-8 lg:px-0 lg:pt-3 lg:pb-[120px]"
          ref={ref}
        >
          <m.div
            initial={reveal.header.initial}
            animate={isInView ? reveal.header.animate : {}}
            transition={slowTransition({ duration: 0.6 })}
            className="relative z-10 flex flex-col lg:max-w-[520px]"
          >
            <p className="section_ID font-display uppercase">
              <QxText text={data.sectionLabel} />
            </p>
            <h2
              id="packshots-title"
              className="section_Title mt-8 font-display font-normal lg:mt-7"
            >
              <QxText text={data.title} />
            </h2>
            {data.subtitle && (
              <p className="sec_main_text mt-6 max-w-[520px] font-body">
                <QxText text={data.subtitle} />
              </p>
            )}
          </m.div>

          <div className="mt-12 -mx-5 grid grid-cols-1 gap-6 sm:mx-0 sm:grid-cols-2 lg:mt-[120px]">
            {packshotItems.map((item, i) => {
              const { topCode, frameCode } = parsePackshotImage(item.image);
              const frameOption = pickConfiguratorOption(
                materialsConfigurator?.frameOptions,
                frameCode,
              );
              const desktopOption = pickConfiguratorOption(
                materialsConfigurator?.desktopOptions,
                topCode,
              );
              return (
                <m.article
                  key={`${item.code}-${item.image}`}
                  initial={reveal.content.initial}
                  animate={isInView ? reveal.content.animate : {}}
                  transition={slowTransition({
                    duration: 0.5,
                    delay: 0.2 + i * 0.1,
                  })}
                  className="min-w-0"
                >
                  {isMobile ? (
                    <div className="qx-packshot-mobile-frame">
                      <Image
                        src={item.image}
                        alt={item.name || `${item.code} packshot`}
                        fill
                        sizes="(min-width: 1440px) 710px, (min-width: 640px) 46vw, 100vw"
                        className="qx-packshot-mobile-image"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openLightbox(i)}
                      className="group relative block w-full overflow-hidden"
                      aria-label={`View ${item.name || item.code} packshot in fullscreen`}
                    >
                      <div className="qx-packshot-desktop-frame">
                        <Image
                          src={item.image}
                          alt={item.name || `${item.code} packshot`}
                          fill
                          sizes="(min-width: 1440px) 710px, (min-width: 640px) 46vw, 100vw"
                          className="qx-packshot-desktop-image"
                        />
                      </div>
                    </button>
                  )}
                  <div className="qx-packshot-meta">
                    <span className="qx-packshot-code">{item.code}</span>
                    {frameCode && (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="font-display text-[10px] uppercase tracking-[0.12em] text-foreground/70">
                          Frame
                        </span>
                        {frameOption ? (
                          <ColorChip option={frameOption} variant="frame" />
                        ) : null}
                      </span>
                    )}
                    {topCode && (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="font-display text-[10px] uppercase tracking-[0.12em] text-foreground/70">
                          Top
                        </span>
                        {desktopOption ? (
                          <ColorChip option={desktopOption} variant="top" />
                        ) : null}
                      </span>
                    )}
                  </div>
                </m.article>
              );
            })}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {activeItem && activeIndex !== null && (
          <m.div
            ref={dialogRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-modal bg-foreground/90 backdrop-blur-md flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={counterId}
            onClick={closeLightbox}
          >
            <button
              type="button"
              ref={closeButtonRef}
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-on-dark-muted hover:text-on-dark min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark"
              aria-label="Close lightbox"
            >
              <X size={28} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(-1);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-on-dark-muted hover:text-on-dark min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark"
              aria-label="Previous packshot"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(1);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-on-dark-muted hover:text-on-dark min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark"
              aria-label="Next packshot"
            >
              <ChevronRight size={32} />
            </button>
            <m.img
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              src={activeItem.image}
              alt={activeItem.name || `${activeItem.code} packshot`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <p
              id={counterId}
              className="absolute bottom-6 text-on-dark-muted text-sm"
              aria-live="polite"
            >
              {activeItem.code}, Packshot {activeIndex + 1} of{' '}
              {packshotItems.length}: {activeItem.name || activeItem.code}
            </p>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PackshotsQX;
