import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionShell } from './SectionShell';

describe('<SectionShell />', () => {
  it('renders <section> with given id and aria-labelledby', () => {
    const { container } = render(
      <SectionShell id="overview">
        <p>content</p>
      </SectionShell>,
    );
    const section = container.querySelector('section')!;
    expect(section).toHaveAttribute('id', 'overview');
    expect(section).toHaveAttribute('aria-labelledby', 'overview-title');
  });

  it('applies bg-surface-elevated by default', () => {
    const { container } = render(<SectionShell id="x">x</SectionShell>);
    const section = container.querySelector('section')!;
    expect(section.className).toContain('bg-surface-elevated');
  });

  it('allows overriding background via className prop', () => {
    const { container } = render(
      <SectionShell id="x" className="bg-warm-light">
        x
      </SectionShell>,
    );
    const section = container.querySelector('section')!;
    expect(section.className).toContain('bg-warm-light');
    expect(section.className).not.toContain('bg-surface-elevated');
  });

  it('passes through children', () => {
    render(
      <SectionShell id="overview">
        <p>hello</p>
      </SectionShell>,
    );
    expect(screen.getByText('hello')).toBeInTheDocument();
  });
});
