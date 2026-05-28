'use client';

import { useRef } from 'react';
import { m, useInView } from 'framer-motion';
import Image from 'next/image';
import type { MaterialsConfiguratorOption } from '@/types/catalog';
import { SECTION_REVEAL_SETTLE, slowTransition } from '@/lib/motion';
import { QxText } from '@/components/catalog/QxText';
import { responsiveImg } from '@/lib/responsive-image';
import { ColorChip } from '@/components/catalog/ColorChip';
import {
  parseMRC1000Image,
  pickConfiguratorOption,
} from '@/lib/materials-options';

export interface MRC1000Illustration {
  id: string;
  model: string;
  image: string;
  alt: string;
}

interface ExampleSetsMRC1000Props {
  illustrations: MRC1000Illustration[];
  sourceDesktops: MaterialsConfiguratorOption[];
}

const ExampleSetsMRC1000 = ({
  illustrations,
  sourceDesktops,
}: ExampleSetsMRC1000Props) => {
  const examplesRef = useRef(null);
  const isExamplesInView = useInView(examplesRef, {
    once: true,
    margin: '-100px',
  });
  const reveal = SECTION_REVEAL_SETTLE;

  if (illustrations.length === 0) return null;

  return (
    <section
      aria-label="Example sets"
      className="bg-surface-elevated lg:min-h-[3000px]"
    >
      <div
        className="relative mx-auto w-full max-w-[1440px] px-5 pt-6 pb-12 sm:px-8 sm:pt-8 lg:px-0 lg:pt-3 lg:pb-[120px]"
        ref={examplesRef}
      >
        <m.div
          initial={reveal.header.initial}
          animate={isExamplesInView ? reveal.header.animate : {}}
          transition={slowTransition({ duration: 0.6 })}
          className="relative z-10 flex flex-col lg:max-w-[520px]"
        >
          <h2 className="section_Title font-display font-normal">
            <QxText text="Example sets" />
          </h2>
        </m.div>

        <div className="mt-12 -mx-5 grid grid-cols-1 gap-6 sm:mx-0 sm:grid-cols-2 lg:mt-[120px]">
          {illustrations.map((slot, i) => {
            const { bodyCode, hutchCode } = parseMRC1000Image(slot.image);
            const slotBodyOption = pickConfiguratorOption(
              sourceDesktops,
              bodyCode,
            );
            const slotHutchOption = pickConfiguratorOption(
              sourceDesktops,
              hutchCode,
            );
            return (
              <m.article
                key={slot.id}
                initial={reveal.content.initial}
                animate={isExamplesInView ? reveal.content.animate : {}}
                transition={slowTransition({
                  duration: 0.5,
                  delay: 0.2 + i * 0.1,
                })}
                className="min-w-0"
              >
                <div className="qx-packshot-desktop-frame">
                  <Image
                    src={slot.image}
                    {...responsiveImg(slot.image, 'packshot')}
                    alt={slot.alt}
                    fill
                    sizes="(min-width: 1440px) 710px, (min-width: 640px) 46vw, 100vw"
                    className="qx-packshot-desktop-image"
                  />
                </div>
                <div className="qx-packshot-meta">
                  <span className="qx-packshot-code">{slot.model}</span>
                  {bodyCode && slotBodyOption && (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="font-display text-[10px] uppercase tracking-[0.12em] text-foreground/70">
                        Body
                      </span>
                      <ColorChip option={slotBodyOption} variant="body" />
                    </span>
                  )}
                  {hutchCode && slotHutchOption && (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="font-display text-[10px] uppercase tracking-[0.12em] text-foreground/70">
                        Hutch
                      </span>
                      <ColorChip option={slotHutchOption} variant="hutch" />
                    </span>
                  )}
                </div>
              </m.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ExampleSetsMRC1000;
