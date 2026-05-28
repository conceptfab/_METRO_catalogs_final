import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Lightbox } from './Lightbox';

const images = [
  { src: '/a.webp', alt: 'Image A' },
  { src: '/b.webp', alt: 'Image B' },
  { src: '/c.webp', alt: 'Image C' },
];

describe('<Lightbox />', () => {
  it('renders nothing when index is null', () => {
    render(<Lightbox images={images} index={null} onClose={() => {}} onNavigate={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders image at given index', () => {
    render(<Lightbox images={images} index={1} onClose={() => {}} onNavigate={() => {}} />);
    expect(screen.getByAltText('Image B')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<Lightbox images={images} index={0} onClose={onClose} onNavigate={() => {}} />);
    fireEvent.click(screen.getByLabelText(/close/i));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onNavigate(+1) when next button clicked', () => {
    const onNavigate = vi.fn();
    render(<Lightbox images={images} index={0} onClose={() => {}} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByLabelText(/next/i));
    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  it('calls onClose on Escape key', () => {
    const onClose = vi.fn();
    render(<Lightbox images={images} index={0} onClose={onClose} onNavigate={() => {}} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('locks body scroll while open and restores on close', () => {
    const previous = document.body.style.overflow;
    const { rerender } = render(
      <Lightbox
        images={[{ src: '/a.webp', alt: 'a' }]}
        index={0}
        onClose={() => {}}
        onNavigate={() => {}}
      />,
    );
    expect(document.body.style.overflow).toBe('hidden');
    rerender(
      <Lightbox
        images={[{ src: '/a.webp', alt: 'a' }]}
        index={null}
        onClose={() => {}}
        onNavigate={() => {}}
      />,
    );
    expect(document.body.style.overflow).toBe(previous);
  });

  it('renders the image with draggable=false to disable native ghost drag', () => {
    const { container } = render(
      <Lightbox
        images={[{ src: '/a.webp', alt: 'a' }]}
        index={0}
        onClose={() => {}}
        onNavigate={() => {}}
      />,
    );
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img!.draggable).toBe(false);
  });
});
