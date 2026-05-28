import Image from 'next/image';

interface PrintImageProps {
  src: string;
  alt: string;
  className: string;
  sizes?: string;
  draggable?: boolean;
  ariaHidden?: boolean;
}

export function PrintImage({
  src,
  alt,
  className,
  sizes = '100vw',
  draggable,
  ariaHidden,
}: PrintImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      loading="eager"
      unoptimized
      draggable={draggable}
      aria-hidden={ariaHidden}
      className={className}
    />
  );
}
