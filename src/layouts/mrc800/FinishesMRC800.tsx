'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { m, useInView } from 'framer-motion';
import type { FinishesData } from '@/types/catalog';
import { SECTION_REVEAL_SETTLE, slowTransition } from '@/lib/motion';
import { QxText } from '@/components/catalog/QxText';

interface MRC800Illustration {
  id: string;
  color: 'white' | 'black';
  label: string;
  image?: string;
  alt: string;
}

interface MRC800FinishesData extends FinishesData {
  illustrations?: MRC800Illustration[];
}

interface FinishesSectionProps {
  data: FinishesData;
}

const FALLBACK_ILLUSTRATIONS: MRC800Illustration[] = [
  { id: 'white-1', color: 'white', label: 'White / View 1', alt: 'MRC800 white finish — view 1 (placeholder)' },
  { id: 'white-2', color: 'white', label: 'White / View 2', alt: 'MRC800 white finish — view 2 (placeholder)' },
  { id: 'black-1', color: 'black', label: 'Black / View 1', alt: 'MRC800 black finish — view 1 (placeholder)' },
  { id: 'black-2', color: 'black', label: 'Black / View 2', alt: 'MRC800 black finish — view 2 (placeholder)' },
];

const FinishesMRC800 = ({ data }: FinishesSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const reveal = SECTION_REVEAL_SETTLE;

  const extended = data as MRC800FinishesData;
  const illustrations =
    extended.illustrations && extended.illustrations.length > 0
      ? extended.illustrations
      : FALLBACK_ILLUSTRATIONS;
  const descriptionLines = data.description?.split('\n') ?? [];

  return (
    <section
      id="finishes"
      className="bg-surface-elevated"
      aria-labelledby="finishes-title"
    >
      <div
        className="relative mx-auto w-full max-w-[1440px] px-5 pt-6 pb-12 sm:px-8 sm:pt-8 lg:px-0 lg:py-0"
        ref={ref}
      >
        <m.div
          initial={reveal.header.initial}
          animate={isInView ? reveal.header.animate : {}}
          transition={slowTransition({ duration: 0.6 })}
          className="relative z-10 flex flex-col lg:max-w-[720px] lg:pt-3"
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
          transition={slowTransition({ duration: 0.6, delay: 0.25 })}
          className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:mt-14 lg:gap-8"
        >
          {illustrations.map((slot) => {
            const isWhite = slot.color === 'white';
            return (
              <figure
                key={slot.id}
                className="relative aspect-square w-full overflow-hidden border border-border bg-surface-elevated"
              >
                {slot.image ? (
                  <Image
                    src={slot.image}
                    alt={slot.alt}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="font-display text-xs uppercase tracking-[0.2em] text-neutral-500">
                      illustration placeholder
                    </span>
                  </div>
                )}
                <figcaption
                  className={`absolute bottom-0 left-0 right-0 px-4 py-2 font-display text-xs uppercase tracking-wide ${
                    isWhite
                      ? 'bg-white/85 text-neutral-700'
                      : 'bg-black/70 text-neutral-100'
                  }`}
                >
                  {slot.label}
                </figcaption>
              </figure>
            );
          })}
        </m.div>
      </div>
    </section>
  );
};

export default FinishesMRC800;
