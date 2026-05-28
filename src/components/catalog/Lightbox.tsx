'use client';

import { useEffect, useId, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import { responsiveImg } from '@/lib/responsive-image';

interface LightboxImage {
  src: string;
  alt: string;
}

interface LightboxProps {
  images: LightboxImage[];
  index: number | null;
  onClose: () => void;
  onNavigate: (direction: 1 | -1) => void;
}

export function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const counterId = useId();
  const isOpen = index !== null && Boolean(images[index]);

  useFocusTrap(dialogRef, isOpen);

  const onCloseRef = useRef(onClose);
  const onNavigateRef = useRef(onNavigate);
  useEffect(() => {
    onCloseRef.current = onClose;
    onNavigateRef.current = onNavigate;
  }, [onClose, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onNavigateRef.current(-1);
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        onNavigateRef.current(1);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          ref={dialogRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-modal flex items-center justify-center bg-foreground/90 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby={counterId}
          onClick={onClose}
        >
          <button
            type="button"
            ref={closeRef}
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            className="absolute right-4 top-4 flex size-11 items-center justify-center text-white/80 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Close lightbox"
          >
            <X size={28} />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onNavigate(-1);
            }}
            className="absolute left-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center text-white/80 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Previous image"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onNavigate(1);
            }}
            className="absolute right-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center text-white/80 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Next image"
          >
            <ChevronRight size={32} />
          </button>
          <m.img
            key={images[index!].src}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            src={images[index!].src}
            {...responsiveImg(images[index!].src, 'gallery', '100vw')}
            alt={images[index!].alt}
            draggable={false}
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
            onClick={(event) => event.stopPropagation()}
          />
          <p
            id={counterId}
            className="absolute bottom-6 text-sm text-white/70"
            aria-live="off"
          >
            Image {index! + 1} of {images.length}: {images[index!].alt}
          </p>
        </m.div>
      )}
    </AnimatePresence>
  );
}
