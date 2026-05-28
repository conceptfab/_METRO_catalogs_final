'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { MaterialsConfiguratorOption } from '@/types/catalog';

type ChipVariant = 'frame' | 'top' | 'body' | 'hutch';

const CHIP_VARIANT_LABEL: Record<ChipVariant, string> = {
  frame: 'Frame',
  top: 'Top',
  body: 'Body',
  hutch: 'Hutch',
};

function formatOptionCode(code: string): string {
  return code.startsWith('RAL') ? `RAL ${code.slice(3)}` : code;
}

function getOptionDescriptor(option: MaterialsConfiguratorOption) {
  const codeFormatted = formatOptionCode(option.code);
  const labelText = option.label
    .replace(codeFormatted, '')
    .replace(option.code, '')
    .trim();
  return { codeFormatted, labelText };
}

interface ColorChipProps {
  option: MaterialsConfiguratorOption;
  variant: ChipVariant;
}

export function ColorChip({ option, variant }: ColorChipProps) {
  const { codeFormatted, labelText } = getOptionDescriptor(option);
  const variantLabel = CHIP_VARIANT_LABEL[variant];
  const ariaLabel = labelText
    ? `${variantLabel}: ${codeFormatted} ${labelText}`
    : `${variantLabel}: ${codeFormatted}`;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <span className="relative inline-flex shrink-0 align-middle">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="flex size-11 items-center justify-center cursor-help focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        <Image
          src={option.thumbnail}
          alt=""
          aria-hidden="true"
          width={24}
          height={24}
          sizes="24px"
          className="block size-6 border border-foreground/60 object-cover"
        />
      </button>
      {open && (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-tooltip -translate-x-1/2"
        >
          <span className="block w-[7.25rem] border border-foreground bg-background p-1 text-left shadow-token-lg">
            <Image
              src={option.thumbnail}
              alt=""
              aria-hidden="true"
              width={116}
              height={116}
              sizes="116px"
              className="block aspect-square w-full object-cover"
            />
            <span className="mt-2 block px-1 pb-1 text-[11px] font-medium leading-tight text-foreground sm:text-xs">
              <span className="block">{codeFormatted}</span>
              {labelText && <span className="block">{labelText}</span>}
            </span>
          </span>
        </span>
      )}
    </span>
  );
}
