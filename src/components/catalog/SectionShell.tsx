import type { ReactNode } from 'react';

interface SectionShellProps {
  id: string;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  /** Override aria-label when no <h2 id={id}-title> exists in children. */
  label?: string;
}

const DEFAULT_BG = 'bg-surface-elevated';
const DEFAULT_INNER =
  'mx-auto w-full max-w-[1440px] px-5 pt-6 pb-12 sm:px-8 sm:pt-8 lg:px-0';

export function SectionShell({
  id,
  children,
  className,
  innerClassName,
  label,
}: SectionShellProps) {
  const sectionClass = className?.includes('bg-')
    ? className
    : `${DEFAULT_BG}${className ? ` ${className}` : ''}`;
  const innerClass = innerClassName ?? DEFAULT_INNER;
  const labellingProps = label
    ? { 'aria-label': label }
    : { 'aria-labelledby': `${id}-title` };
  return (
    <section id={id} className={sectionClass} {...labellingProps}>
      <div className={innerClass}>{children}</div>
    </section>
  );
}
