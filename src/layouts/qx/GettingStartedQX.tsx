'use client';

import { useRef } from 'react';
import { m, useInView } from 'framer-motion';
import type { GettingStartedData } from '@/types/catalog';
import { SECTION_REVEAL_LIFT, slowTransition } from '@/lib/motion';
import { QxText } from '@/components/catalog/QxText';
import { getIcon } from '@/lib/icon-map';

interface GettingStartedSectionProps {
  data: GettingStartedData;
}

const GettingStartedQX = ({ data }: GettingStartedSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const reveal = SECTION_REVEAL_LIFT;

  return (
    <section
      id="getting-started"
      className="bg-surface-elevated lg:min-h-[960px]"
      aria-labelledby="getting-started-title"
    >
      <div
        className="relative mx-auto w-full max-w-[1440px] px-5 pt-6 pb-12 sm:px-8 sm:pt-8 lg:px-0 lg:py-0"
        ref={ref}
      >
        <m.div
          initial={reveal.header.initial}
          animate={isInView ? reveal.header.animate : {}}
          transition={slowTransition({ duration: 0.6 })}
          className="relative z-10 flex flex-col lg:max-w-[520px] lg:pt-3"
        >
          <p className="section_ID font-display uppercase">
            <QxText text={data.sectionLabel} />
          </p>
          <h2
            id="getting-started-title"
            className="section_Title mt-8 font-display font-normal lg:mt-7"
          >
            <QxText text={data.title} />
          </h2>
        </m.div>

        <div className="mt-10 grid grid-cols-1 gap-y-10 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3 lg:gap-x-[calc((100%-1029px)/2)]">
          {data.steps.map((s, i) => {
            const Icon = s.icon ? getIcon(s.icon) : null;
            return (
              <m.article
                key={s.step}
                initial={reveal.content.initial}
                animate={isInView ? reveal.content.animate : {}}
                transition={slowTransition({
                  duration: 0.5,
                  delay: i * 0.08,
                })}
                className="group w-full lg:w-[343px]"
              >
                <div
                  className="flex h-[170px] w-full items-center justify-center bg-background transition-colors duration-300 group-hover:bg-foreground/5"
                  aria-hidden="true"
                >
                  {Icon ? (
                    <Icon
                      size={100}
                      strokeWidth={1}
                      className="text-foreground/55 transition-all duration-300 group-hover:scale-105 group-hover:text-foreground/85"
                    />
                  ) : (
                    <span className="font-display text-[100px] font-medium leading-none text-foreground/30">
                      {s.step}
                    </span>
                  )}
                </div>
                <h3 className="mt-3 qx-emphasis-title">
                  <QxText text={s.title} />
                </h3>
                <p className="sec_main_text mt-1 font-body sm:max-w-[360px]">
                  <QxText text={s.desc} />
                </p>
              </m.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GettingStartedQX;
