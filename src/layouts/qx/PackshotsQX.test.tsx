import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { PackshotsData } from '@/types/catalog';
import PackshotsQX from './PackshotsQX';

const data: PackshotsData = {
  sectionLabel: 'Models',
  title: 'QX Collection',
  subtitle: 'Selected models',
  groups: [
    {
      model: 'QX11',
      label: 'QX11',
      items: [
        {
          code: 'QX11',
          name: '',
          image: '/catalogs/QX/packshots/QX11_W240_black__Shot_A__4K_R10.webp',
          colorName: '',
        },
      ],
    },
  ],
};

const setViewportWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  });
};

describe('PackshotsQX', () => {
  afterEach(() => {
    setViewportWidth(1024);
  });

  it('opens the desktop lightbox outside of the packshots section', () => {
    setViewportWidth(1200);
    render(<PackshotsQX data={data} />);

    const section = screen.getByRole('region', { name: /qx collection/i });
    fireEvent.click(
      screen.getByRole('button', {
        name: /view qx11 packshot in fullscreen/i,
      }),
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(section).not.toContainElement(dialog);
  });

  it('keeps mobile packshots inline without opening a lightbox', async () => {
    setViewportWidth(390);
    render(<PackshotsQX data={data} />);

    await waitFor(() => {
      expect(
        screen.queryByRole('button', {
          name: /view qx11 packshot in fullscreen/i,
        }),
      ).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByAltText('QX11 packshot'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
