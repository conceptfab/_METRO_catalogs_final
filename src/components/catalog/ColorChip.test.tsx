import { describe, it, expect } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { ColorChip } from './ColorChip';
import { expectNoA11yViolations } from '@/test/a11y-helpers';
import type { MaterialsConfiguratorOption } from '@/types/catalog';

const opt: MaterialsConfiguratorOption = {
  id: 'x',
  code: 'U100',
  label: 'White U100',
  thumbnail: '/swatch.webp',
  image: '/full.webp',
};

describe('ColorChip', () => {
  it('renders a button with min 44x44 touch target', () => {
    const { getByRole } = render(<ColorChip option={opt} variant="frame" />);
    const button = getByRole('button');
    expect(button.className).toMatch(/size-11/);
  });

  it('escape hides the tooltip after focus opens it', () => {
    const { getByRole, queryByRole } = render(
      <ColorChip option={opt} variant="frame" />,
    );
    const button = getByRole('button');
    act(() => {
      fireEvent.focus(button);
    });
    expect(queryByRole('tooltip')).toBeTruthy();
    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });
    expect(queryByRole('tooltip')).toBeFalsy();
  });

  it('has no axe violations', async () => {
    const { container } = render(<ColorChip option={opt} variant="top" />);
    await expectNoA11yViolations(container);
  });
});
