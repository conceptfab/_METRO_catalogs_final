'use client';

import { useEffect, useReducer, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { SectionConfig } from '@/types/catalog';
import { QxText } from './QxText';

const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: 'cover', label: 'Cover' },
  { id: 'overview', label: 'Overview' },
  { id: 'gallery', label: 'Looks' },
  { id: 'finishes', label: 'Finishes' },
  { id: 'packshots', label: 'Models' },
  { id: 'dimensions', label: 'Specs' },
  { id: 'materials', label: 'Build' },
  { id: 'features', label: 'Tech' },
  { id: 'getting-started', label: 'Getting Started' },
];

interface CatalogNavMRC800Props {
  sections?: SectionConfig[];
  brandLabel?: string;
  brandLogoSrc?: string;
  backToCatalogListHref?: string;
  logoOnly?: boolean;
}

interface BrandControlProps {
  brandLabel: string;
  brandLogoSrc?: string;
  backToCatalogListHref?: string;
  className: string;
  logoClassName: string;
  onBrandClick: () => void;
}

interface CatalogNavState {
  activeSection: string;
  scrolled: boolean;
}

type CatalogNavAction = {
  activeSection?: string;
  scrolled?: boolean;
};

function catalogNavReducer(
  state: CatalogNavState,
  action: CatalogNavAction,
): CatalogNavState {
  const nextActiveSection = action.activeSection ?? state.activeSection;
  const nextScrolled = action.scrolled ?? state.scrolled;

  if (
    state.activeSection === nextActiveSection &&
    state.scrolled === nextScrolled
  ) {
    return state;
  }

  return {
    activeSection: nextActiveSection,
    scrolled: nextScrolled,
  };
}

function BrandControl({
  brandLabel,
  brandLogoSrc,
  backToCatalogListHref,
  className,
  logoClassName,
  onBrandClick,
}: BrandControlProps) {
  const brand = brandLogoSrc ? (
    <Image
      src={brandLogoSrc}
      alt={`${brandLabel} logo`}
      width={160}
      height={48}
      className={logoClassName}
    />
  ) : (
    brandLabel
  );

  if (backToCatalogListHref) {
    return (
      <a
        href={backToCatalogListHref}
        className={className}
        aria-label="Back to catalog list"
      >
        {brand}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onBrandClick}
      className={className}
      aria-label={`${brandLabel} - back to top`}
    >
      {brand}
    </button>
  );
}

function useCatalogNavController({
  sections = DEFAULT_SECTIONS,
  brandLabel = 'METRO',
  brandLogoSrc,
  backToCatalogListHref,
  logoOnly = false,
}: CatalogNavMRC800Props) {
  const [{ activeSection, scrolled }, dispatchNavState] = useReducer(
    catalogNavReducer,
    { activeSection: 'cover', scrolled: false },
  );
  const [isOpen, setIsOpen] = useState(false);
  const scrollAnimationRef = useRef<number | null>(null);
  const scrollingToSectionRef = useRef<string | null>(null);
  const navExpanded = !scrolled;

  const visibleSections = sections.filter(
    (section) => section.enabled !== false,
  );

  useEffect(() => {
    const handleScroll = () => {
      const scrollingToSection = scrollingToSectionRef.current;
      if (scrollingToSection) {
        dispatchNavState({
          activeSection: scrollingToSection,
          scrolled: window.scrollY > 50,
        });
        return;
      }

      let nextActiveSection: string | undefined;
      for (let i = visibleSections.length - 1; i >= 0; i--) {
        const section = visibleSections[i];
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= 120) {
          nextActiveSection = section.id;
          break;
        }
      }

      dispatchNavState({
        activeSection: nextActiveSection,
        scrolled: window.scrollY > 50,
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleSections]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    const animationRef = scrollAnimationRef;
    return () => {
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const SECTION_PARK_GAP = 40;
  const getScrollOffset = () => {
    const navHeight = window.matchMedia('(min-width: 640px)').matches ? 56 : 44;
    return navHeight + SECTION_PARK_GAP;
  };

  const scrollTo = (id: string) => {
    const section = document.getElementById(id);
    if (!section) return;

    if (scrollAnimationRef.current !== null) {
      window.cancelAnimationFrame(scrollAnimationRef.current);
    }

    scrollingToSectionRef.current = id;
    dispatchNavState({ activeSection: id });

    const computeTargetTop = () => {
      if (id === 'cover') return 0;
      const el = document.getElementById(id);
      if (!el) return window.scrollY;
      return el.getBoundingClientRect().top + window.scrollY - getScrollOffset();
    };

    const initialTarget = computeTargetTop();
    const startTop = window.scrollY;
    const initialDistance = initialTarget - startTop;
    const duration = Math.min(Math.max(Math.abs(initialDistance) * 0.55, 420), 900);
    const startTime = window.performance.now();

    setIsOpen(false);

    const animateScroll = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const liveTarget = computeTargetTop();
      const liveDistance = liveTarget - startTop;
      window.scrollTo(0, startTop + liveDistance * eased);

      if (progress < 1) {
        scrollAnimationRef.current = window.requestAnimationFrame(animateScroll);
        return;
      }

      window.scrollTo(0, computeTargetTop());

      scrollAnimationRef.current = null;
      scrollingToSectionRef.current = null;
    };

    scrollAnimationRef.current = window.requestAnimationFrame(animateScroll);
  };

  return {
    activeSection,
    backToCatalogListHref,
    brandLabel,
    brandLogoSrc,
    isOpen,
    logoOnly,
    navExpanded,
    scrolled,
    scrollTo,
    setIsOpen,
    visibleSections,
  };
}

function renderCatalogNav({
  activeSection,
  backToCatalogListHref,
  brandLabel,
  brandLogoSrc,
  isOpen,
  logoOnly,
  navExpanded,
  scrolled,
  scrollTo,
  setIsOpen,
  visibleSections,
}: ReturnType<typeof useCatalogNavController>) {
  const isSectionHighlighted = (sectionId: string) =>
    sectionId !== 'cover' && activeSection === sectionId;

  return (
    <>
      <nav
        aria-label="Catalog sections"
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${
          scrolled || isOpen
            ? 'bg-surface-elevated shadow-[0_8px_24px_rgba(0,0,0,0.08)]'
            : 'shadow-none'
        }`}
      >
        <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-0">
          <div
            className={`flex items-center justify-between transition-all duration-300 h-11 sm:h-14 ${
              navExpanded ? 'lg:h-[166px]' : 'lg:h-14'
            }`}
          >
            <BrandControl
              brandLabel={brandLabel}
              brandLogoSrc={brandLogoSrc}
              backToCatalogListHref={backToCatalogListHref}
              className="inline-flex items-center min-h-[44px] min-w-[44px] font-display text-xl font-black tracking-tighter text-foreground !rounded-none"
              logoClassName="h-[22px] w-auto object-contain !rounded-none lg:h-7"
              onBrandClick={() => scrollTo('cover')}
            />

            {!logoOnly && (
              <div className="ml-auto hidden h-full w-full max-w-[1150px] lg:block">
                <ul className="flex h-full items-stretch justify-between">
                  {visibleSections.map((section, index) => (
                    <li key={section.id} className="h-full">
                      <button
                        type="button"
                        onClick={() => scrollTo(section.id)}
                        className={`catalog-nav-link flex h-full items-center px-3 text-sm font-medium transition-colors !rounded-none ${
                          index === visibleSections.length - 1 ? 'pr-0' : ''
                        } ${
                          isSectionHighlighted(section.id)
                            ? '!font-bold !text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        aria-current={
                          isSectionHighlighted(section.id) ? 'location' : undefined
                        }
                      >
                        <QxText text={section.label} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!logoOnly && (
              <button
                type="button"
                onClick={() => setIsOpen((value) => !value)}
                className="ml-4 p-2 text-primary transition-colors hover:text-primary/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground !rounded-none lg:hidden"
                aria-expanded={isOpen}
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
              >
                {isOpen ? <X size={36} strokeWidth={1.5} /> : <Menu size={36} strokeWidth={1.5} />}
              </button>
            )}
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {!logoOnly && isOpen && (
          <m.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed left-0 right-0 top-[44px] z-[59] border-b border-border bg-surface-elevated shadow-xl !rounded-none sm:top-[56px] lg:hidden"
          >
            <ul className="flex flex-col !rounded-none">
              {visibleSections.map((section) => (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => scrollTo(section.id)}
                    className={`catalog-nav-link w-full border-b border-muted px-5 py-3 text-left text-base font-medium transition-colors last:border-0 !rounded-none ${
                      isSectionHighlighted(section.id)
                        ? '!font-bold !text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    aria-current={
                      isSectionHighlighted(section.id) ? 'location' : undefined
                    }
                  >
                    <QxText text={section.label} />
                  </button>
                </li>
              ))}
            </ul>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}

const CatalogNavMRC800 = (props: CatalogNavMRC800Props) =>
  renderCatalogNav(useCatalogNavController(props));

export default CatalogNavMRC800;
