'use client';

import type { ReactNode } from 'react';
import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion';
import { slowTransition } from '@/lib/motion';

interface CatalogMotionProps {
  children: ReactNode;
}

const CatalogMotion = ({ children }: CatalogMotionProps) => (
  <LazyMotion features={domAnimation} strict>
    <MotionConfig transition={slowTransition({ duration: 0.3 })}>
      {children}
    </MotionConfig>
  </LazyMotion>
);

export default CatalogMotion;
