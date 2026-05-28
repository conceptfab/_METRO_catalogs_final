import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionHeading } from './SectionHeading';

describe('<SectionHeading />', () => {
  it('renders sectionLabel as section_ID class', () => {
    render(<SectionHeading id="overview" sectionLabel="Overview" title="Title" />);
    const label = screen.getByText('Overview');
    expect(label).toHaveClass('section_ID');
  });

  it('renders title with id matching prop+ -title', () => {
    render(<SectionHeading id="features" sectionLabel="Features" title="Engineered" />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.id).toBe('features-title');
    expect(heading.textContent).toContain('Engineered');
  });

  it('renders titleLine2 with explicit line break when provided', () => {
    render(
      <SectionHeading
        id="overview"
        sectionLabel="Overview"
        title="Designed for the way you"
        titleLine2="work today"
      />,
    );
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.textContent).toContain('Designed for the way you');
    expect(heading.textContent).toContain('work today');
  });
});
