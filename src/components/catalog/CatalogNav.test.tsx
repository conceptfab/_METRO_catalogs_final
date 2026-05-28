import { describe, it, expect } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import CatalogNav from './CatalogNav';

describe('CatalogNav aria-current', () => {
  it('uses aria-current="location" for the active in-page section, not "true"', () => {
    // Render a fake "overview" section element so the scroll listener
    // promotes it to active (cover never gets aria-current — it's the
    // implicit landing state, see isSectionHighlighted in CatalogNav).
    const overview = document.createElement('section');
    overview.id = 'overview';
    Object.defineProperty(overview, 'getBoundingClientRect', {
      value: () => ({
        top: 0,
        bottom: 800,
        left: 0,
        right: 0,
        height: 800,
        width: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    });
    document.body.appendChild(overview);

    try {
      const { container } = render(<CatalogNav />);
      // Trigger the scroll handler so activeSection becomes "overview".
      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });

      // At least one nav link should now carry aria-current.
      const withAriaCurrent = container.querySelectorAll('[aria-current]');
      expect(withAriaCurrent.length).toBeGreaterThan(0);

      // None should be aria-current="true" — invalid for in-page nav.
      const linksWithStringTrue = container.querySelectorAll(
        '[aria-current="true"]',
      );
      expect(linksWithStringTrue.length).toBe(0);

      // All aria-current values must be "location".
      const validValues = new Set([null, 'location']);
      withAriaCurrent.forEach((el) => {
        expect(validValues.has(el.getAttribute('aria-current'))).toBe(true);
      });
    } finally {
      document.body.removeChild(overview);
    }
  });
});

describe('brand button', () => {
  it('has minimum 44x44 touch target', () => {
    render(<CatalogNav sections={[]} brandLabel="METRO QS" variant="qx0" />);
    const btn = screen.getByRole('button', { name: /METRO QS - back to top/i });
    expect(btn.className).toMatch(/min-h-\[44px\]/);
    expect(btn.className).toMatch(/min-w-\[44px\]/);
  });
});

describe('focus-visible ring on nav links', () => {
  it('renders focus-visible outline on every section link', () => {
    const { container } = render(<CatalogNav />);
    const links = container.querySelectorAll('button.catalog-nav-link');
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => {
      expect(link.className).toContain('focus-visible:outline');
      expect(link.className).toContain('focus-visible:outline-foreground');
    });
  });
});
