'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { m, useInView } from 'framer-motion';
import type { ArrangementsData } from '@/types/catalog';
import { SECTION_REVEAL_LIFT, slowTransition } from '@/lib/motion';
import { QxText } from '@/components/catalog/QxText';

interface ArrangementsSectionProps {
  data?: ArrangementsData;
}

const FALLBACK_PLACEHOLDERS = [
  { label: 'Arrangement 1', image: '' },
  { label: 'Arrangement 2', image: '' },
  { label: 'Arrangement 3', image: '' },
  { label: 'Arrangement 4', image: '' },
];

const ArrangementsMRC1000 = ({ data }: ArrangementsSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const reveal = SECTION_REVEAL_LIFT;

  const sectionLabel = data?.sectionLabel ?? 'Arrangements';
  const title = data?.title ?? 'Sample arrangements';
  const placeholders =
    data?.placeholders && data.placeholders.length > 0
      ? data.placeholders
      : FALLBACK_PLACEHOLDERS;

  return (
    <section
      id="arrangements"
      className="bg-surface-elevated lg:min-h-[2200px]"
      aria-labelledby="arrangements-title"
    >
      <div
        className="relative mx-auto w-full max-w-[1440px] px-5 pt-6 pb-12 sm:px-8 sm:pt-8 lg:min-h-[2200px] lg:px-0 lg:py-0"
        ref={ref}
      >
        <m.div
          initial={reveal.header.initial}
          animate={isInView ? reveal.header.animate : {}}
          transition={slowTransition({ duration: 0.6 })}
          className="relative z-10 flex flex-col lg:max-w-[720px] lg:pt-3"
        >
          <p className="section_ID font-display uppercase">
            <QxText text={sectionLabel} />
          </p>
          <h2
            id="arrangements-title"
            className="section_Title mt-8 font-display font-normal lg:mt-7"
          >
            <QxText text={title} />
          </h2>
        </m.div>

        <m.div
          initial={reveal.content.initial}
          animate={isInView ? reveal.content.animate : {}}
          transition={slowTransition({ duration: 0.6, delay: 0.2 })}
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:mt-12 lg:gap-10"
        >
          {placeholders.map((placeholder) => (
            <div key={placeholder.image ?? placeholder.label} className="flex flex-col items-center gap-3">
              <div className="relative aspect-[1.6/1] w-full overflow-hidden">
                {placeholder.image ? (
                  <Image
                    src={placeholder.image}
                    alt={placeholder.label}
                    fill
                    sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw"
                    className="object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                    <span className="font-display text-xs uppercase tracking-[0.2em] text-neutral-500">
                      arrangement placeholder
                    </span>
                  </div>
                )}
              </div>
              <div className="qx-packshot-meta">
                <span className="qx-packshot-code">{placeholder.label}</span>
              </div>
            </div>
          ))}
        </m.div>
      </div>
    </section>
  );
};

export default ArrangementsMRC1000;
