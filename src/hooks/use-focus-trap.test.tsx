import { describe, it, expect } from 'vitest';
import { useRef } from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFocusTrap } from './use-focus-trap';

function Modal({ isOpen }: { isOpen: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useFocusTrap(ref, isOpen);
  if (!isOpen) return null;
  return (
    <dialog ref={ref} open aria-label="test">
      <button>First</button>
      <button>Middle</button>
      <button>Last</button>
    </dialog>
  );
}

describe('useFocusTrap', () => {
  it('cycles Tab from last back to first', async () => {
    const user = userEvent.setup();
    const { getAllByRole } = render(<Modal isOpen={true} />);
    const [first, , last] = getAllByRole('button');
    last.focus();
    await user.tab();
    expect(document.activeElement).toBe(first);
  });

  it('cycles Shift+Tab from first back to last', async () => {
    const user = userEvent.setup();
    const { getAllByRole } = render(<Modal isOpen={true} />);
    const [first, , last] = getAllByRole('button');
    first.focus();
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(last);
  });

  it('locks body scroll while open', () => {
    const { rerender } = render(<Modal isOpen={true} />);
    expect(document.body.style.overflow).toBe('hidden');
    rerender(<Modal isOpen={false} />);
    expect(document.body.style.overflow).toBe('');
  });

  it('restores focus to trigger on close', () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'Open';
    document.body.appendChild(trigger);
    trigger.focus();
    const { rerender } = render(<Modal isOpen={true} />);
    rerender(<Modal isOpen={false} />);
    expect(document.activeElement).toBe(trigger);
    document.body.removeChild(trigger);
  });
});
