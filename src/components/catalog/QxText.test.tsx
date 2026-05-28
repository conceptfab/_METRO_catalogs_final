import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { QxText } from './QxText';

describe('<QxText />', () => {
  it('renders plain text without QX tokens unchanged', () => {
    const { container } = render(<QxText text="Hello world" />);
    expect(container.textContent).toBe('Hello world');
  });

  it('wraps QX token in span.qx-word', () => {
    const { container } = render(<QxText text="Welcome to QX line" />);
    const span = container.querySelector('span.qx-word');
    expect(span?.textContent).toBe('QX');
  });

  it('replaces \\n with <br /> elements', () => {
    const { container } = render(<QxText text={'first\nsecond'} />);
    expect(container.querySelectorAll('br').length).toBe(1);
    expect(container.textContent).toBe('firstsecond');
  });

  it('handles multiple QX tokens on one line', () => {
    const { container } = render(<QxText text="QX and QX" />);
    expect(container.querySelectorAll('span.qx-word').length).toBe(2);
  });

  it('preserves uppercase QX regardless of input case', () => {
    const { container } = render(<QxText text="welcome qx world" />);
    const span = container.querySelector('span.qx-word');
    expect(span?.textContent).toBe('QX');
  });
});
