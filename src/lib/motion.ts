import type { Transition } from 'framer-motion';

const CATALOG_MOTION_MULTIPLIER = 2;

type RevealPose = {
  initial: Record<string, number>;
  animate: Record<string, number>;
};

export type SectionRevealScheme = {
  name: 'slide' | 'lift' | 'settle';
  header: RevealPose;
  content: RevealPose;
};

export const SECTION_REVEAL_SLIDE: SectionRevealScheme = {
  name: 'slide',
  header: {
    initial: { opacity: 0, x: -40 },
    animate: { opacity: 1, x: 0 },
  },
  content: {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
  },
};

export const SECTION_REVEAL_LIFT: SectionRevealScheme = {
  name: 'lift',
  header: {
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
  },
  content: {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
  },
};

export const SECTION_REVEAL_SETTLE: SectionRevealScheme = {
  name: 'settle',
  header: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
  },
  content: {
    initial: { opacity: 0, scale: 0.97 },
    animate: { opacity: 1, scale: 1 },
  },
};

const TIMING_KEYS = new Set([
  'duration',
  'delay',
  'repeatDelay',
  'delayChildren',
  'staggerChildren',
]);

type MotionTimingConfig = Transition | Record<string, unknown> | undefined;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function scaleMotionValue(value: number): number {
  if (prefersReducedMotion()) return 0;
  return value * CATALOG_MOTION_MULTIPLIER;
}

export function slowTransition<T extends MotionTimingConfig>(transition: T): T {
  if (!transition || typeof transition !== 'object' || Array.isArray(transition)) {
    return transition;
  }

  const scaled = Object.entries(transition).reduce<Record<string, unknown>>(
    (result, [key, value]) => {
      if (typeof value === 'number' && TIMING_KEYS.has(key)) {
        result[key] = scaleMotionValue(value);
        return result;
      }

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = slowTransition(value as Record<string, unknown>);
        return result;
      }

      result[key] = value;
      return result;
    },
    {},
  );

  return scaled as T;
}
