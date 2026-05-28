'use client';

import { useId } from 'react';
import type { MaterialsConfiguratorOption } from '@/types/catalog';
import { QxText } from '@/components/catalog/QxText';

interface MaterialsOptionGroupProps {
  title: string;
  options: MaterialsConfiguratorOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
  variant?: 'primary' | 'secondary';
}

function formatOptionCode(code: string) {
  return code.startsWith('RAL') ? `RAL ${code.slice(3)}` : code;
}

function getOptionLabelParts(option: MaterialsConfiguratorOption) {
  const code = formatOptionCode(option.code);
  const name = option.label.replace(code, '').replace(option.code, '').trim();
  return { code, name };
}

export function MaterialsOptionGroup({
  title,
  options,
  selectedId,
  onSelect,
  variant = 'secondary',
}: MaterialsOptionGroupProps) {
  const titleId = useId();
  const titleClassName =
    variant === 'primary'
      ? 'mb-3 qx-emphasis-title'
      : 'mb-2 font-display text-lg font-normal text-foreground';
  return (
    <div>
      <h3 id={titleId} className={titleClassName}>
        <QxText text={title} />
      </h3>

      <div
        role="radiogroup"
        aria-labelledby={titleId}
        className="flex flex-wrap gap-[5px]"
      >
        {options.map((option) => {
          const isSelected = option.id === selectedId;
          const label = getOptionLabelParts(option);

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onSelect(option.id)}
              className={`flex flex-col h-[6.5rem] w-[5rem] sm:h-[9.75rem] sm:w-[7.25rem] shrink-0 border bg-background p-1.5 gap-1.5 sm:gap-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
                isSelected
                  ? 'border-foreground border-2 shadow-[0_0_0_2px_rgba(0,0,0,0.18)]'
                  : 'border-transparent hover:border-foreground/50'
              }`}
            >
              <div
                aria-hidden="true"
                className="aspect-square w-[3.5rem] sm:w-[6rem] mx-auto bg-cover bg-center shrink-0 transition-transform duration-300 hover:scale-105"
                style={{ backgroundImage: `url("${option.thumbnail}")` }}
              />
              <p className="text-[10px] sm:text-[11px] font-medium leading-tight text-foreground">
                <span className="block"><QxText text={label.code} /></span>
                {label.name && (
                  <span className="block"><QxText text={label.name} /></span>
                )}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
