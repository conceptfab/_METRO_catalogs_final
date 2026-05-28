'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, m, useInView } from 'framer-motion';
import type {
  FinishesData,
  MaterialsConfiguratorOption,
} from '@/types/catalog';
import { SECTION_REVEAL_SETTLE, slowTransition } from '@/lib/motion';
import { QxText } from '@/components/catalog/QxText';
import { responsiveImg } from '@/lib/responsive-image';
import { MaterialsOptionGroup } from '@/components/catalog/MaterialsOptionGroup';
import {
  applyOptionDescriptions,
  dedupeByCode,
  orderOptions,
} from '@/lib/materials-options';

interface FinishesSectionProps {
  data: FinishesData;
}

const EMPTY_OPTIONS: MaterialsConfiguratorOption[] = [];
const DECOR_NAMES: Record<string, string> = {
  U100: 'WHITE',
  U110: 'ASH GREY',
  U120: 'PLATINUM GREY',
  U130: 'GRAPHITE GREY',
  U140: 'BLACK',
  U150: 'BEIGE',
  U160: 'CACAO',
  U170: 'OLIVE',
  U180: 'BURGUNDY',
  U190: 'BLUE',
  W200: 'LIGHT BEECH',
  W210: 'ELM',
  W220: 'LIGHT OAK',
  W240: 'NATURAL OAK',
  W250: 'WALNUT',
  W300: 'ROBSON OAK',
  W310: 'DARK OAK',
  W330: 'DARK WALNUT',
  W340: 'HALIFAX OAK',
  W350: 'ANTHRACITE SEMI-MAT',
};

const FinishesMRC1000 = ({ data }: FinishesSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const reveal = SECTION_REVEAL_SETTLE;

  const sourceDesktops =
    data.configurator?.desktopOptions ?? EMPTY_OPTIONS;
  const dedupedDesktops = applyOptionDescriptions(
    dedupeByCode(sourceDesktops),
    DECOR_NAMES,
  );

  const groupedDesktops = (() => {
    if (!data.priceGroups || data.priceGroups.length === 0) return null;
    const claimed = new Set<string>();
    const groups: { title: string; options: typeof dedupedDesktops }[] = [];
    for (const group of data.priceGroups) {
      const options = orderOptions(dedupedDesktops, group.codes);
      if (options.length === 0) continue;
      for (const option of options) claimed.add(option.code);
      groups.push({ title: group.title, options });
    }
    const leftovers = dedupedDesktops.filter(
      (option) => !claimed.has(option.code),
    );
    return { groups, leftovers };
  })();

  const [selectedId, setSelectedId] = useState(dedupedDesktops[0]?.id ?? '');

  const selected =
    dedupedDesktops.find((option) => option.id === selectedId) ??
    dedupedDesktops[0];
  const previewAlt = selected
    ? `${data.title} preview — ${selected.label}`
    : `${data.title} preview`;

  if (dedupedDesktops.length === 0) return null;

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
              <QxText text={data.description} />
            </p>
          )}
        </m.div>

        <m.div
          initial={reveal.content.initial}
          animate={isInView ? reveal.content.animate : {}}
          transition={slowTransition({ duration: 0.6, delay: 0.2 })}
          className="mt-8 space-y-5 lg:mt-8 lg:ml-auto lg:w-full lg:max-w-[721px]"
        >
          <div>
            <h3 className="mb-3 qx-emphasis-title">
              <QxText text="Available finishes" />
            </h3>
            <div className="space-y-4">
              {groupedDesktops?.groups.map((group) => (
                <MaterialsOptionGroup
                  key={group.title}
                  title={group.title}
                  options={group.options}
                  selectedId={selected?.id}
                  onSelect={setSelectedId}
                />
              ))}
              {groupedDesktops && groupedDesktops.leftovers.length > 0 && (
                <MaterialsOptionGroup
                  title="Other"
                  options={groupedDesktops.leftovers}
                  selectedId={selected?.id}
                  onSelect={setSelectedId}
                />
              )}
              {!groupedDesktops && (
                <MaterialsOptionGroup
                  title="Available finishes"
                  options={dedupedDesktops}
                  selectedId={selected?.id}
                  onSelect={setSelectedId}
                  variant="primary"
                />
              )}
            </div>
          </div>
        </m.div>

        <m.div
          initial={reveal.content.initial}
          animate={isInView ? reveal.content.animate : {}}
          transition={slowTransition({ duration: 0.3, delay: 0.35 })}
          className="mt-10 aspect-square w-full lg:absolute lg:bottom-0 lg:left-0 lg:mt-0 lg:aspect-auto lg:h-[715px] lg:w-[687px]"
        >
          {selected && (
            <figure
              className="relative h-full w-full"
              role="img"
              aria-label={previewAlt}
            >
              <AnimatePresence mode="wait" initial={false}>
                <m.img
                  key={`desktop-${selected.image}`}
                  src={selected.image}
                  {...responsiveImg(selected.image, 'materials-full')}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-contain"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={slowTransition({
                    duration: 0.22,
                    ease: 'easeOut',
                  })}
                />
              </AnimatePresence>
            </figure>
          )}
        </m.div>
      </div>
    </section>
  );
};

export default FinishesMRC1000;
