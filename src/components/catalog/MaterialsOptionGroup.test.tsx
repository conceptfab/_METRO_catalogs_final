import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MaterialsOptionGroup } from './MaterialsOptionGroup';
import { expectNoA11yViolations } from '@/test/a11y-helpers';
import type { MaterialsConfiguratorOption } from '@/types/catalog';

const opts: MaterialsConfiguratorOption[] = [
  {
    id: 'opt1',
    code: 'U100',
    label: 'White U100',
    thumbnail: '/swatch.webp',
    image: '/full.webp',
  },
  {
    id: 'opt2',
    code: 'U110',
    label: 'Grey U110',
    thumbnail: '/swatch.webp',
    image: '/full.webp',
  },
];

describe('MaterialsOptionGroup', () => {
  it('exposes radiogroup with aria-labelledby pointing to title', () => {
    const { getByRole, getByText } = render(
      <MaterialsOptionGroup
        title="Desktop Finish"
        options={opts}
        selectedId="opt1"
        onSelect={() => {}}
      />,
    );
    const group = getByRole('radiogroup');
    const heading = getByText('Desktop Finish');
    expect(group.getAttribute('aria-labelledby')).toBe(heading.id);
    expect(heading.id).toBeTruthy();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <MaterialsOptionGroup
        title="Steel parts colors"
        options={opts}
        selectedId="opt1"
        onSelect={() => {}}
      />,
    );
    await expectNoA11yViolations(container);
  });

  it('material tile uses compact size on mobile via responsive Tailwind classes', () => {
    render(
      <MaterialsOptionGroup
        title="Finish"
        options={opts}
        selectedId="opt1"
        onSelect={() => {}}
      />,
    );
    const tile = screen.getAllByRole('radio')[0];
    // mobile-first compact, sm: original size
    expect(tile.className).toMatch(/h-\[6\.5rem\]/);
    expect(tile.className).toMatch(/w-\[5rem\]/);
    expect(tile.className).toMatch(/sm:h-\[9\.75rem\]/);
    expect(tile.className).toMatch(/sm:w-\[7\.25rem\]/);
  });

  it('exposes radiogroup semantics with radio children', () => {
    const { getAllByRole, getByRole } = render(
      <MaterialsOptionGroup
        title="Finish"
        options={opts}
        selectedId="opt1"
        onSelect={() => {}}
      />,
    );
    expect(getByRole('radiogroup')).toBeTruthy();
    const radios = getAllByRole('radio');
    expect(radios).toHaveLength(2);
    expect(radios[0].getAttribute('aria-checked')).toBe('true');
    expect(radios[1].getAttribute('aria-checked')).toBe('false');
  });

});
