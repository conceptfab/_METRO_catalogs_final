import { useEffect, type RefObject } from 'react';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal a11y plumbing: traps Tab inside `ref`, locks body scroll, restores
 * focus to the element that was active when `isOpen` became true.
 *
 * Contract:
 * - `ref` must point to the dialog container; the trap searches descendants only.
 * - Trigger is captured from `document.activeElement` at effect mount —
 *   call sites should ensure the opening control still owns focus at that point.
 * - Consumer owns Escape handling, initial focus inside the dialog, and any
 *   `aria-modal` / `aria-labelledby` markup.
 * - Not safe for nested usage (one trap at a time): scroll-lock restoration
 *   is naive and assumes LIFO close order.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  isOpen: boolean,
) {
  useEffect(() => {
    if (!isOpen) return;
    const container = ref.current;
    if (!container) return;

    const trigger = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusables = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (trigger && document.body.contains(trigger)) {
        trigger.focus();
      }
    };
  }, [ref, isOpen]);
}
