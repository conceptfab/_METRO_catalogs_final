'use client';

import { useRef, useState } from 'react';
import { m, useInView } from 'framer-motion';
import Image from 'next/image';
import type { GalleryData } from '@/types/catalog';
import { SECTION_REVEAL_LIFT, slowTransition } from '@/lib/motion';
import { QxText } from '@/components/catalog/QxText';
import { Lightbox } from '@/components/catalog/Lightbox';

interface GallerySectionProps {
  data: GalleryData;
}

const GalleryQX = ({ data }: GallerySectionProps) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const reveal = SECTION_REVEAL_LIFT;
  const galleryImages = data.images.slice(0, 4);
  const mainImage = galleryImages[0];
  const thumbnailImages = galleryImages.slice(1, 4);
  const thumbnailPositionClasses = [
    'lg:top-[163px]',
    'lg:top-[434px]',
    'lg:top-[705px]',
  ];

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const navigate = (dir: 1 | -1) => {
    if (lightboxIndex === null) return;
    setLightboxIndex(
      (lightboxIndex + dir + galleryImages.length) % galleryImages.length,
    );
  };

  return (
    <section
      id="gallery"
      className="bg-surface-elevated lg:h-[960px]"
      aria-labelledby="gallery-title"
    >
      <div
        className="relative mx-auto w-full max-w-[1440px] px-5 pt-6 pb-12 sm:px-8 sm:pt-8 lg:h-[960px] lg:px-0 lg:py-0"
        ref={ref}
      >
        <m.div
          initial={reveal.header.initial}
          animate={isInView ? reveal.header.animate : {}}
          transition={slowTransition({ duration: 0.6 })}
          className="relative z-10 flex flex-col lg:absolute lg:left-0 lg:top-3"
        >
          <p className="section_ID font-display uppercase">
            <QxText text={data.sectionLabel} />
          </p>
          <h2
            id="gallery-title"
            className="section_Title mt-8 font-display font-normal lg:mt-7"
          >
            <QxText text={data.title} />
          </h2>
        </m.div>

        {mainImage && (
          <div className="-mx-5 mt-8 flex snap-x snap-mandatory items-center gap-3 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:mt-0 lg:block lg:gap-0 lg:overflow-visible lg:px-0">
            <m.button
              initial={reveal.content.initial}
              animate={isInView ? reveal.content.animate : {}}
              transition={slowTransition({ duration: 0.3 })}
              onClick={() => openLightbox(0)}
              className="group relative h-[55vh] max-h-[460px] shrink-0 snap-start overflow-hidden lg:absolute lg:left-0 lg:top-[163px] lg:h-[797px] lg:max-h-none lg:w-[1169px]"
              aria-label={`View ${mainImage.category} image in fullscreen`}
            >
              <Image
                src={mainImage.src}
                alt={mainImage.alt}
                width={1169}
                height={797}
                sizes="(min-width: 1440px) 1081px, (min-width: 1024px) 75vw, 200vw"
                className="block h-full w-auto lg:w-full lg:object-cover lg:transition-transform lg:duration-700 lg:group-hover:scale-110"
              />
            </m.button>

            {thumbnailImages.map((img, i) => (
              <m.button
                key={img.src}
                initial={reveal.content.initial}
                animate={isInView ? reveal.content.animate : {}}
                transition={slowTransition({
                  duration: 0.3,
                  delay: (i + 1) * 0.1,
                })}
                onClick={() => openLightbox(i + 1)}
                className={`group relative h-[55vh] max-h-[460px] shrink-0 snap-start overflow-hidden lg:absolute lg:right-0 lg:h-[255px] lg:max-h-none lg:w-[255px] ${thumbnailPositionClasses[i]}`}
                aria-label={`View ${img.category} image in fullscreen`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={255}
                  height={255}
                  sizes="(min-width: 1440px) 255px, (min-width: 1024px) 18vw, 200vw"
                  className="block h-full w-auto lg:w-full lg:object-cover lg:transition-transform lg:duration-700 lg:group-hover:scale-110"
                />
              </m.button>
            ))}
          </div>
        )}
      </div>

      <Lightbox
        images={galleryImages.map((img) => ({ src: img.src, alt: img.alt }))}
        index={lightboxIndex}
        onClose={closeLightbox}
        onNavigate={navigate}
      />
    </section>
  );
};

export default GalleryQX;
