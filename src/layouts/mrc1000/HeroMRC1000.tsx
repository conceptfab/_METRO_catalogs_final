'use client';

import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type {
  HeroAnchor,
  HeroData,
  HeroDescriptionPosition,
  HeroDescriptionStyleConfig,
  HeroSlide,
  HeroSlideContentLayout,
} from '@/types/catalog';
import { scaleMotionValue, slowTransition } from '@/lib/motion';
import { QxText } from '@/components/catalog/QxText';
import { responsiveImg } from '@/lib/responsive-image';

interface HeroMRC1000Props {
  data: HeroData;
}

const DEFAULT_SLIDER = {
  autoAdvance: true,
  interval: 5000,
  pauseOnHover: true,
  transitionMs: 500,
  showArrows: true,
  showDots: true,
  initialSlide: 0,
};

const DEFAULT_CONTENT_LAYOUT: Required<HeroSlideContentLayout> = {
  anchor: 'center',
  textAlign: 'center',
  maxWidth: '1440px',
  paddingY: '0',
  paddingTop: '',
  paddingBottom: '',
  offsetX: '0',
  contentLift: '0',
  ctaPosition: 'inline',
  ctaFloatingBottom: 'clamp(12rem, 22vh, 16rem)',
};

const DEFAULT_DESCRIPTION_STYLE: Required<HeroDescriptionStyleConfig> = {
  enabled: true,
  position: 'bottom-center',
  offsetPx: 40,
  textColor: 'var(--on-dark-muted)',
  backgroundColor: 'rgba(0, 0, 0, 0.35)',
  backdropBlurPx: 6,
  paddingX: 16,
  paddingY: 8,
  borderRadiusPx: 9999,
  fontSizePx: 13,
  fontWeight: 500,
  letterSpacingEm: 0.04,
  maxWidth: '90vw',
  textAlign: 'center',
  uppercase: false,
};

function anchorToFlexClasses(anchor: HeroAnchor): string {
  // wrapper is `flex flex-col` — we map vertical via justify-* and horizontal via items-*
  const verticalMap: Record<string, string> = {
    top: 'justify-start',
    center: 'justify-center',
    bottom: 'justify-end',
  };
  const horizontalMap: Record<string, string> = {
    left: 'items-start',
    center: 'items-center',
    right: 'items-end',
  };
  const [v, h] = anchor === 'center' ? ['center', 'center'] : anchor.split('-');
  return `${verticalMap[v]} ${horizontalMap[h]}`;
}

function descriptionPositionClasses(position: HeroDescriptionPosition): string {
  switch (position) {
    case 'bottom-left':
      return 'left-6';
    case 'bottom-right':
      return 'right-6';
    case 'top-left':
      return 'left-6';
    case 'top-right':
      return 'right-6';
    case 'top-center':
      return 'left-1/2 -translate-x-1/2';
    case 'bottom-center':
    default:
      return 'left-1/2 -translate-x-1/2';
  }
}

function useHeroMRC1000ViewModel(data: HeroData) {
  const slider = { ...DEFAULT_SLIDER, ...data.slider };
  const fallbackSlides: HeroSlide[] = (data.heroImages ?? []).map(
    (src, index, all) => ({
      src,
      alt:
        index === 0
          ? data.heroImageAlt
          : `${data.heroImageAlt} - slide ${index + 1} of ${all.length}`,
    }),
  );
  const configuredSlides: HeroSlide[] = data.heroSlides ?? fallbackSlides;
  const hasSlider = configuredSlides.length > 0;
  const displaySlides: HeroSlide[] = hasSlider
    ? configuredSlides
    : [{ src: data.heroImage, alt: data.heroImageAlt }];
  const initialIdx = Math.min(
    Math.max(0, slider.initialSlide ?? 0),
    displaySlides.length - 1,
  );
  const [currentIndex, setCurrentIndex] = useState(initialIdx);
  // Skip the opacity/scale fade on the very first slide so the LCP image
  // is painted at full opacity immediately. Subsequent slide changes still animate.
  const [hasNavigated, setHasNavigated] = useState(false);
  const isHoveredRef = useRef(false);
  const currentSlide = displaySlides[currentIndex] ?? displaySlides[0];

  const layout: Required<HeroSlideContentLayout> = {
    ...DEFAULT_CONTENT_LAYOUT,
    ...currentSlide?.contentLayout,
  };

  const currentHeroContent = {
    brandLabel: currentSlide?.heroContent?.brandLabel ?? data.brandLabel,
    collectionName:
      currentSlide?.heroContent?.collectionName ?? data.collectionName,
    tagline: currentSlide?.heroContent?.tagline ?? data.tagline,
    taglineLine2:
      currentSlide?.heroContent?.taglineLine2 ?? data.taglineLine2,
    ctaLabel: currentSlide?.heroContent?.ctaLabel ?? data.ctaLabel,
  };
  const slideTransition = slowTransition({
    duration: Math.max(1.6, slider.transitionMs / 1000),
    ease: 'easeInOut' as const,
  });
  const heroCtaTransition = slowTransition({ duration: 0.3, delay: 0.8 });
  const prefersReducedMotion = useReducedMotion();

  const currentDescriptionStyle = {
    ...DEFAULT_DESCRIPTION_STYLE,
    ...data.descriptionStyle,
    ...currentSlide?.descriptionStyle,
  };
  const showSlideDescription = Boolean(
    currentDescriptionStyle.enabled && currentSlide?.description,
  );
  const isTopDescription = currentDescriptionStyle.position.startsWith('top');
  const descriptionPosClass = descriptionPositionClasses(
    currentDescriptionStyle.position,
  );
  const descriptionInlineStyle: CSSProperties = {
    color: currentDescriptionStyle.textColor,
    backgroundColor: currentDescriptionStyle.backgroundColor,
    backdropFilter: `blur(${currentDescriptionStyle.backdropBlurPx}px)`,
    WebkitBackdropFilter: `blur(${currentDescriptionStyle.backdropBlurPx}px)`,
    padding: `${currentDescriptionStyle.paddingY}px ${currentDescriptionStyle.paddingX}px`,
    borderRadius: `${currentDescriptionStyle.borderRadiusPx}px`,
    fontSize: `${currentDescriptionStyle.fontSizePx}px`,
    fontWeight: currentDescriptionStyle.fontWeight,
    letterSpacing: `${currentDescriptionStyle.letterSpacingEm}em`,
    maxWidth: currentDescriptionStyle.maxWidth,
    textAlign: currentDescriptionStyle.textAlign,
    textTransform: currentDescriptionStyle.uppercase ? 'uppercase' : 'none',
    ...(isTopDescription
      ? { top: `${currentDescriptionStyle.offsetPx}px` }
      : { bottom: `${currentDescriptionStyle.offsetPx}px` }),
  };

  const wrapperFlexClasses = anchorToFlexClasses(layout.anchor);
  const transforms: string[] = [];
  if (layout.offsetX && layout.offsetX !== '0') {
    transforms.push(`translateX(${layout.offsetX})`);
  }
  if (layout.contentLift && layout.contentLift !== '0') {
    transforms.push(`translateY(${layout.contentLift})`);
  }
  const textStyle = currentSlide?.textStyle ?? {};
  const mobileTextStyle = currentSlide?.mobileTextStyle ?? {};
  const mobileLayout = currentSlide?.mobileContentLayout ?? {};
  const wrapperStyle: CSSProperties & Record<string, string | number | undefined> = {
    paddingTop: layout.paddingTop || layout.paddingY,
    paddingBottom: layout.paddingBottom || layout.paddingY,
    transform: transforms.length > 0 ? transforms.join(' ') : undefined,
    '--hero-text-color': textStyle.color,
    '--hero-text-weight': textStyle.fontWeight,
    '--hero-text-size': textStyle.fontSize,
    '--hero-text-color-mobile': mobileTextStyle.color,
    '--hero-text-weight-mobile': mobileTextStyle.fontWeight,
    '--hero-text-size-mobile': mobileTextStyle.fontSize,
    '--hero-mobile-text-align': mobileLayout.textAlign,
    '--hero-mobile-offset-x': mobileLayout.offsetX,
  };
  const innerStyle: CSSProperties = {
    maxWidth: layout.maxWidth,
    textAlign: layout.textAlign,
  };

  const goTo = (index: number) => {
    setHasNavigated(true);
    setCurrentIndex(
      ((index % displaySlides.length) + displaySlides.length) %
        displaySlides.length,
    );
  };

  const goPrev = () => goTo(currentIndex - 1);
  const goNext = () => goTo(currentIndex + 1);

  const goPrevRef = useRef(goPrev);
  const goNextRef = useRef(goNext);
  useEffect(() => {
    goPrevRef.current = goPrev;
    goNextRef.current = goNext;
  }, [goPrev, goNext]);

  useEffect(() => {
    if (
      !hasSlider ||
      displaySlides.length <= 1 ||
      prefersReducedMotion ||
      !slider.autoAdvance
    ) {
      return;
    }

    const timer = setInterval(() => {
      if (slider.pauseOnHover && isHoveredRef.current) return;
      goNextRef.current();
    }, scaleMotionValue(slider.interval));
    return () => clearInterval(timer);
  }, [
    hasSlider,
    displaySlides.length,
    prefersReducedMotion,
    slider.autoAdvance,
    slider.interval,
    slider.pauseOnHover,
  ]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!hasSlider) return;
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrevRef.current();
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNextRef.current();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hasSlider]);

  const ctaButton = (extraClassName?: string) => (
    <button
      type="button"
      onClick={() =>
        document
          .getElementById('overview')
          ?.scrollIntoView({ behavior: 'smooth' })
      }
      className={`group inline-flex min-h-[44px] items-center gap-3 rounded-full bg-primary px-8 py-4 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 ${extraClassName ?? ''}`}
    >
      <span>{currentHeroContent.ctaLabel}</span>
      <ArrowDown
        size={18}
        strokeWidth={1.2}
        className="transition-transform duration-300 group-hover:translate-y-0.5"
      />
    </button>
  );

  return {
    ctaButton,
    currentHeroContent,
    currentIndex,
    currentSlide,
    descriptionInlineStyle,
    descriptionPosClass,
    displaySlides,
    goNext,
    goPrev,
    goTo,
    hasNavigated,
    hasSlider,
    heroCtaTransition,
    innerStyle,
    isHoveredRef,
    layout,
    showSlideDescription,
    slideTransition,
    slider,
    wrapperFlexClasses,
    wrapperStyle,
  };
}

function renderHeroMRC1000({
  ctaButton,
  currentHeroContent,
  currentIndex,
  currentSlide,
  descriptionInlineStyle,
  descriptionPosClass,
  displaySlides,
  goNext,
  goPrev,
  goTo,
  hasNavigated,
  hasSlider,
  heroCtaTransition,
  innerStyle,
  isHoveredRef,
  layout,
  showSlideDescription,
  slideTransition,
  slider,
  wrapperFlexClasses,
  wrapperStyle,
}: ReturnType<typeof useHeroMRC1000ViewModel>) {
  return (
    <section
      id="cover"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-elevated"
      aria-label={`${currentHeroContent.collectionName} Collection cover`}
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
    >
      <div
        className="absolute inset-0"
        role={hasSlider ? 'region' : undefined}
        aria-roledescription={hasSlider ? 'Image carousel' : undefined}
      >
        <AnimatePresence mode="sync" initial={false}>
          <m.img
            key={`${currentSlide.src}-${currentIndex}`}
            src={currentSlide.src}
            {...responsiveImg(currentSlide.src, 'hero')}
            alt={currentSlide.alt}
            draggable={false}
            className={`hero-image absolute inset-0 h-full w-full object-cover ${
              hasNavigated ? 'will-change-[opacity,transform]' : ''
            } ${
              currentIndex % 2 === 0
                ? 'hero-mobile-pan'
                : 'hero-mobile-pan-reverse'
            }`}
            style={
              currentSlide?.mobileImageOffsetX
                ? ({
                    '--hero-mobile-image-offset-x':
                      currentSlide.mobileImageOffsetX,
                  } as CSSProperties)
                : undefined
            }
            initial={hasNavigated ? { opacity: 0, scale: 1.012 } : false}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.006 }}
            transition={slideTransition}
            loading={currentIndex === 0 ? 'eager' : 'lazy'}
            fetchPriority={currentIndex === 0 ? 'high' : 'auto'}
            decoding="async"
          />
        </AnimatePresence>
      </div>

      {hasSlider && displaySlides.length > 1 && (
        <>
          <span className="sr-only">
            Swipe left or right, or use slide indicators below, to navigate slides.
          </span>
          {slider.showArrows && (
            <>
              <m.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={slowTransition({ duration: 0.3, delay: 1.2 })}
                onClick={goPrev}
                className="absolute left-4 top-1/2 z-20 hidden min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center text-on-dark-muted transition-colors hover:text-on-dark md:flex"
                aria-label="Previous slide"
              >
                <ChevronLeft size={64} strokeWidth={1.2} />
              </m.button>
              <m.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={slowTransition({ duration: 0.3, delay: 1.2 })}
                onClick={goNext}
                className="absolute right-4 top-1/2 z-20 hidden min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center text-on-dark-muted transition-colors hover:text-on-dark md:flex"
                aria-label="Next slide"
              >
                <ChevronRight size={64} strokeWidth={1.2} />
              </m.button>
            </>
          )}
          {slider.showDots && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={slowTransition({ duration: 0.3, delay: 1.2 })}
              className="absolute bottom-20 left-1/2 z-20 flex -translate-x-1/2 gap-2 md:bottom-24"
              role="tablist"
              aria-label="Slide indicators"
            >
              {displaySlides.map((slide, index) => (
                <button
                  key={`slide-dot-${slide.src}`}
                  type="button"
                  role="tab"
                  aria-selected={index === currentIndex}
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => goTo(index)}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center p-2"
                >
                  <span
                    className={`block h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'w-6 bg-primary'
                        : 'w-2 bg-on-dark-muted/60'
                    }`}
                  />
                </button>
              ))}
            </m.div>
          )}
        </>
      )}

      {showSlideDescription && (
        <m.p
          key={`slide-description-${currentIndex}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute z-20 ${descriptionPosClass}`}
          style={descriptionInlineStyle}
        >
          {currentSlide.description}
        </m.p>
      )}

      <div
        className={`hero-content-wrapper hero-slide-${currentIndex} relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-6 sm:px-8 lg:px-0 ${wrapperFlexClasses}`}
        style={wrapperStyle}
      >
        <m.div
          key={`hero-block-${currentIndex}`}
          initial={hasNavigated ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={slowTransition({ duration: 0.3, delay: 0.4 })}
          className="hero-text"
          style={innerStyle}
        >
          {currentHeroContent.brandLabel?.trim() && (
            <span className="block">
              <span className="hero-line">{currentHeroContent.brandLabel}</span>
            </span>
          )}
          {currentHeroContent.collectionName?.trim() && (
            <span className="block">
              <span className="hero-line">
                <QxText text={currentHeroContent.collectionName} />
              </span>
            </span>
          )}
          {currentHeroContent.tagline?.trim() && (
            <span className="block">
              <span className="hero-line">
                <QxText text={currentHeroContent.tagline} />
              </span>
            </span>
          )}
          {currentHeroContent.taglineLine2?.trim() && (
            <span className="block">
              <span className="hero-line">
                <QxText text={currentHeroContent.taglineLine2} />
              </span>
            </span>
          )}
        </m.div>

        {layout.ctaPosition === 'inline' && (
          <m.div
            key={`hero-cta-${currentIndex}`}
            initial={hasNavigated ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={heroCtaTransition}
            className="mt-8"
          >
            {ctaButton()}
          </m.div>
        )}
      </div>

      {layout.ctaPosition === 'floating' && (
        <m.div
          key={`hero-floating-cta-${currentIndex}`}
          initial={hasNavigated ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={heroCtaTransition}
          className="absolute inset-x-0 z-20 flex justify-center"
          style={{ bottom: layout.ctaFloatingBottom }}
        >
          {ctaButton()}
        </m.div>
      )}

    </section>
  );
}

const HeroMRC1000 = ({ data }: HeroMRC1000Props) => renderHeroMRC1000(useHeroMRC1000ViewModel(data));

export default HeroMRC1000;
