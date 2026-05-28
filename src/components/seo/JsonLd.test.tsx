import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { JsonLd } from './JsonLd';

describe('JsonLd', () => {
  it('renders a script tag with application/ld+json type', () => {
    const { container } = render(<JsonLd data={{ '@type': 'Organization' }} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
  });

  it('serialises the payload as JSON', () => {
    const { container } = render(
      <JsonLd data={{ '@type': 'Organization', name: 'METRO' }} />,
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script?.innerHTML).toContain('"@type":"Organization"');
    expect(script?.innerHTML).toContain('"name":"METRO"');
  });

  it('escapes a closing script tag inside string values', () => {
    const { container } = render(
      <JsonLd data={{ '@type': 'WebSite', name: 'evil</script><x>' }} />,
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script?.innerHTML).not.toContain('</script');
    // The original string survives a JSON round-trip — the escape is lossless.
    const parsed = JSON.parse(script?.innerHTML ?? '') as { name: string };
    expect(parsed.name).toBe('evil</script><x>');
  });

  it('escapes < inside nested string values too', () => {
    const { container } = render(
      <JsonLd
        data={{
          '@type': 'CollectionPage',
          about: { '@type': 'ProductGroup', name: 'A<B' },
        }}
      />,
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script?.innerHTML).not.toContain('A<B');
    expect(script?.innerHTML).toContain('A\\u003cB');
  });

  it('also escapes >, &, and JS line terminators U+2028 / U+2029', () => {
    const { container } = render(
      <JsonLd
        data={{
          '@type': 'WebSite',
          name: 'a>b & c d e',
        }}
      />,
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    const html = script?.innerHTML ?? '';
    expect(html).not.toContain('>');
    expect(html).not.toContain('&');
    expect(html).not.toContain(' ');
    expect(html).not.toContain(' ');
    expect(html).toContain('\\u003e');
    expect(html).toContain('\\u0026');
    expect(html).toContain('\\u2028');
    expect(html).toContain('\\u2029');
    // Round-trip is lossless.
    const parsed = JSON.parse(html) as { name: string };
    expect(parsed.name).toBe('a>b & c d e');
  });

  it('renders nested objects and arrays correctly', () => {
    const { container } = render(
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home' },
            { '@type': 'ListItem', position: 2, name: 'METRO FM' },
          ],
        }}
      />,
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    const parsed = JSON.parse(script?.innerHTML ?? '');
    expect(parsed.itemListElement).toHaveLength(2);
    expect(parsed.itemListElement[1].name).toBe('METRO FM');
  });
});
