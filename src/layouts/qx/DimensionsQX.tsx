'use client';

import { useRef } from 'react';
import { m, useInView } from 'framer-motion';
import Image from 'next/image';
import type { DimensionsData } from '@/types/catalog';
import { SECTION_REVEAL_LIFT, slowTransition } from '@/lib/motion';
import { QxText } from '@/components/catalog/QxText';

interface DimensionsSectionProps {
  data: DimensionsData;
}

const DimensionsQX = ({ data }: DimensionsSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const reveal = SECTION_REVEAL_LIFT;

  return (
    <section
      id="dimensions"
      className="bg-surface-elevated lg:min-h-[960px]"
      aria-labelledby="dimensions-title"
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
            id="dimensions-title"
            className="section_Title mt-8 font-display font-normal lg:mt-7"
          >
            <QxText text={data.title} />
          </h2>
          {/* Description shown on desktop only — mobile gets it below the drawing */}
          {data.description && (
            <p className="sec_main_text mt-6 max-w-[633px] hidden sm:block">
              <QxText text={data.description} />
            </p>
          )}
        </m.div>

        <m.div
          initial={reveal.content.initial}
          animate={isInView ? reveal.content.animate : {}}
          transition={slowTransition({ duration: 0.6, delay: 0.2 })}
          className="mt-10 grid gap-10 lg:mt-10 lg:grid-cols-12 lg:gap-9"
        >
          <div className="flex flex-col items-stretch lg:col-span-6">
            {/* Mobile-only key specs: relies on content authors putting the 3 most-important
                dimensions (typically width/depth/height) at the start of `data.specs`. */}
            <dl className="sm:hidden mt-2 mb-6 grid grid-cols-2 gap-3 text-sm">
              {data.specs.slice(0, 3).map((s) => (
                <div key={s.label}>
                  <dt className="text-foreground/60"><QxText text={s.label} /></dt>
                  <dd className="font-display text-base font-bold"><QxText text={s.value} /></dd>
                </div>
              ))}
            </dl>

            <div className="flex items-start justify-center">
              <Image
                src={data.image || '/axo.svg'}
                alt="Technical dimension drawing"
                width={842}
                height={842}
                className="h-auto w-full"
              />
            </div>

            {/* Description shown on mobile only — desktop gets it in the header block above */}
            {data.description && (
              <p className="sec_main_text mt-6 sm:hidden">
                <QxText text={data.description} />
              </p>
            )}
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <h3 className="mb-6 qx-emphasis-title">
              Technical Specifications
            </h3>
            <dl>
              {data.specs.map((s) => (
                <div
                  key={s.label}
                  className="flex justify-between gap-4 border-b border-border/50 py-4"
                >
                  <dt className="text-base text-muted-foreground">
                    <QxText text={s.label} />
                  </dt>
                  <dd className="text-right text-base font-bold text-foreground">
                    <QxText text={s.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </m.div>
      </div>
    </section>
  );
};

export default DimensionsQX;
