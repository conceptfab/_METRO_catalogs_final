'use client';

import { m, useInView } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';
import type { OverviewData } from '@/types/catalog';
import { SECTION_REVEAL_SLIDE, slowTransition } from '@/lib/motion';
import { QxText } from '@/components/catalog/QxText';
import { SectionShell } from '@/components/catalog/SectionShell';
import { SectionHeading } from '@/components/catalog/SectionHeading';

interface OverviewSectionProps {
  data: OverviewData;
}

const OverviewQX = ({ data }: OverviewSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const reveal = SECTION_REVEAL_SLIDE;

  return (
    <SectionShell
      id="overview"
      className="bg-surface-elevated lg:min-h-[960px]"
      innerClassName="relative mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-10 px-5 pt-6 pb-12 sm:px-8 sm:pt-8 lg:min-h-[960px] lg:grid-cols-12 lg:gap-0 lg:px-0 lg:py-0"
    >
      <div className="relative z-10 flex flex-col lg:col-span-6 lg:max-w-[540px] lg:pt-3" ref={ref}>
        <m.div
          initial={reveal.header.initial}
          animate={isInView ? reveal.header.animate : {}}
          transition={slowTransition({ duration: 0.6 })}
        >
          <SectionHeading
            id="overview"
            sectionLabel={data.sectionLabel}
            title={data.title}
            titleLine2={data.titleLine2}
            className="mb-12 lg:mb-[120px]"
          />
          <div className="sec_main_text mt-12 max-w-[520px] space-y-4 font-body lg:mt-[120px]">
            {data.paragraphs.map((p) => (
              <p key={p}><QxText text={p} /></p>
            ))}
          </div>
        </m.div>
      </div>

      <div className="aspect-[3/4] w-full lg:absolute lg:inset-y-0 lg:left-1/2 lg:right-0 lg:aspect-auto lg:w-auto">
        <m.div
          initial={reveal.content.initial}
          animate={isInView ? reveal.content.animate : {}}
          transition={slowTransition({ duration: 0.6, delay: 0.2 })}
          className="h-full w-full"
        >
          <figure className="h-full w-full overflow-hidden bg-transparent">
            <div className="relative h-full w-full overflow-hidden">
              <Image
                src={data.packshotImage}
                alt={data.packshotImageAlt}
                fill
                sizes="(min-width: 1440px) 720px, (min-width: 1024px) 50vw, 100vw"
                className="object-cover object-center"
              />
            </div>
            <figcaption className="sr-only"><QxText text={data.packshotCaption} /></figcaption>
          </figure>
        </m.div>
      </div>
    </SectionShell>
  );
};

export default OverviewQX;
