'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, m, useInView } from 'framer-motion';
import type {
  MaterialsConfiguratorOption,
  MaterialsData,
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
import ExampleSetsMRC1000, {
  type MRC1000Illustration,
} from './ExampleSetsMRC1000';

interface MRC1000MaterialsData extends MaterialsData {
  illustrations?: MRC1000Illustration[];
}

interface MaterialsSectionProps {
  data: MaterialsData;
}

const EMPTY_OPTIONS: MaterialsConfiguratorOption[] = [];
const HUTCH_SHADOW_SRC = '/catalogs/MRC1000/customization/metro_top_shadow.webp';
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

const MaterialsMRC1000 = ({ data }: MaterialsSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const reveal = SECTION_REVEAL_SETTLE;

  const rawDesktops = data.configurator?.desktopOptions ?? EMPTY_OPTIONS;
  const sourceDesktops = applyOptionDescriptions(rawDesktops, DECOR_NAMES);
  const dedupedDesktops = dedupeByCode(sourceDesktops);

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

  const firstId = dedupedDesktops[0]?.id ?? '';
  const [bodyId, setBodyId] = useState(firstId);
  const [hutchId, setHutchId] = useState(firstId);
  const [editTarget, setEditTarget] = useState<'body' | 'hutch'>('body');
  const [hutchVisible, setHutchVisible] = useState(true);

  const bodyOption =
    dedupedDesktops.find((option) => option.id === bodyId) ??
    dedupedDesktops[0];
  const hutchOption =
    dedupedDesktops.find((option) => option.id === hutchId) ??
    dedupedDesktops[0];
  const activeId = editTarget === 'body' ? bodyOption?.id : hutchOption?.id;
  const setActiveId = editTarget === 'body' ? setBodyId : setHutchId;
  const previewAlt = bodyOption
    ? `${data.title} preview — body ${bodyOption.label}${
        hutchVisible && hutchOption ? `, hutch ${hutchOption.label}` : ''
      }`
    : `${data.title} preview`;
  const baseSrc = bodyOption
    ? `/catalogs/MRC1000/customization/metro_${bodyOption.code}.webp`
    : '';
  const hutchSrc = hutchOption
    ? `/catalogs/MRC1000/customization/metro_top_${hutchOption.code}.webp`
    : '';

  const extended = data as MRC1000MaterialsData;
  const illustrations = extended.illustrations ?? [];

  if (dedupedDesktops.length === 0) return null;

  return (
    <>
    <ExampleSetsMRC1000
      illustrations={illustrations}
      sourceDesktops={sourceDesktops}
    />
    <section
      id="materials"
      className="bg-surface-elevated overflow-hidden lg:min-h-[960px]"
      aria-labelledby="materials-title"
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
            id="materials-title"
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
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <h3 className="qx-emphasis-title">
                <QxText text="Available finishes" />
              </h3>
              <div className="ml-auto flex items-stretch gap-2">
                <button
                  type="button"
                  aria-pressed={editTarget === 'body'}
                  aria-label="Edit body decor"
                  onClick={() => setEditTarget('body')}
                  className={`px-4 py-2 text-xs font-medium uppercase tracking-wide border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
                    editTarget === 'body'
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-foreground/30 bg-background text-foreground hover:border-foreground/60'
                  }`}
                >
                  Body
                </button>
                <div className="inline-flex items-stretch divide-x divide-foreground/30 border border-foreground/30 bg-background">
                  <button
                    type="button"
                    aria-pressed={editTarget === 'hutch'}
                    aria-label="Edit hutch decor"
                    onClick={() => setEditTarget('hutch')}
                    className={`px-4 py-2 text-xs font-medium uppercase tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground ${
                      editTarget === 'hutch'
                        ? 'bg-foreground text-background'
                        : 'text-foreground hover:bg-foreground/5'
                    }`}
                  >
                    Hutch
                  </button>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={hutchVisible}
                    aria-label="Toggle hutch overlay"
                    onClick={() => setHutchVisible((v) => !v)}
                    className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium uppercase tracking-wide text-foreground transition-colors hover:bg-foreground/5 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground"
                  >
                    <span
                      aria-hidden="true"
                      className={`relative inline-block h-5 w-10 rounded-full border border-foreground/40 transition-colors ${
                        hutchVisible ? 'bg-foreground' : 'bg-background'
                      }`}
                    >
                      <span
                        className={`absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full transition-all ${
                          hutchVisible
                            ? 'left-[1.375rem] bg-background'
                            : 'left-0.5 bg-foreground/60'
                        }`}
                      />
                    </span>
                    <span className="min-w-[1.75rem] text-left">
                      {hutchVisible ? 'On' : 'Off'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {groupedDesktops?.groups.map((group) => (
                <MaterialsOptionGroup
                  key={group.title}
                  title={group.title}
                  options={group.options}
                  selectedId={activeId}
                  onSelect={setActiveId}
                />
              ))}
              {groupedDesktops && groupedDesktops.leftovers.length > 0 && (
                <MaterialsOptionGroup
                  title="Other"
                  options={groupedDesktops.leftovers}
                  selectedId={activeId}
                  onSelect={setActiveId}
                />
              )}
              {!groupedDesktops && (
                <MaterialsOptionGroup
                  title="Available finishes"
                  options={dedupedDesktops}
                  selectedId={activeId}
                  onSelect={setActiveId}
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
          {bodyOption && (
            <figure
              className="relative h-full w-full"
              role="img"
              aria-label={previewAlt}
            >
              <AnimatePresence mode="wait" initial={false}>
                <m.img
                  key={`base-${baseSrc}`}
                  src={baseSrc}
                  {...responsiveImg(baseSrc, 'materials-full')}
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
              <AnimatePresence initial={false}>
                {hutchVisible && (
                  <m.img
                    key="hutch-shadow"
                    src={HUTCH_SHADOW_SRC}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-contain mix-blend-multiply"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={slowTransition({
                      duration: 0.22,
                      ease: 'easeOut',
                    })}
                  />
                )}
              </AnimatePresence>
              <AnimatePresence initial={false}>
                {hutchVisible && (
                  <m.img
                    key={`hutch-${hutchSrc}`}
                    src={hutchSrc}
                    {...responsiveImg(hutchSrc, 'materials-full')}
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
                )}
              </AnimatePresence>
            </figure>
          )}
        </m.div>
      </div>
    </section>
    </>
  );
};

export default MaterialsMRC1000;
