import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { acceptsMarkdown, isHtmlRoute } from './middleware';

function makeRequest(accept: string | null): NextRequest {
  const headers = new Headers();
  if (accept !== null) headers.set('accept', accept);
  return new NextRequest('http://localhost/test', { headers });
}

describe('isHtmlRoute', () => {
  it('returns true for catalog page', () => {
    expect(isHtmlRoute('/catalog/QX')).toBe(true);
  });

  it('returns true for root', () => {
    expect(isHtmlRoute('/')).toBe(true);
  });

  it('returns false for /agent-markdown', () => {
    expect(isHtmlRoute('/agent-markdown')).toBe(false);
  });

  it('returns false for /agent-markdown subpaths', () => {
    expect(isHtmlRoute('/agent-markdown/foo')).toBe(false);
  });

  it('returns false for /_next/* assets', () => {
    expect(isHtmlRoute('/_next/static/chunks/x.js')).toBe(false);
  });

  it('returns false for /api/* routes', () => {
    expect(isHtmlRoute('/api/catalogs')).toBe(false);
  });

  it('returns false for /.well-known/* discovery', () => {
    expect(isHtmlRoute('/.well-known/oauth-authorization-server')).toBe(false);
  });

  it('returns false for files with extensions', () => {
    expect(isHtmlRoute('/favicon.ico')).toBe(false);
    expect(isHtmlRoute('/robots.txt')).toBe(false);
    expect(isHtmlRoute('/sitemap.xml')).toBe(false);
  });
});

describe('acceptsMarkdown', () => {
  it('returns false when Accept header is missing', () => {
    expect(acceptsMarkdown(makeRequest(null))).toBe(false);
  });

  it('returns false for plain text/html', () => {
    expect(acceptsMarkdown(makeRequest('text/html'))).toBe(false);
  });

  it('returns true for plain text/markdown', () => {
    expect(acceptsMarkdown(makeRequest('text/markdown'))).toBe(true);
  });

  it('returns true for text/markdown with q>0', () => {
    expect(acceptsMarkdown(makeRequest('text/markdown;q=0.8'))).toBe(true);
  });

  it('returns false for text/markdown with q=0', () => {
    expect(acceptsMarkdown(makeRequest('text/markdown;q=0'))).toBe(false);
  });

  it('returns true when text/markdown is one of multiple types', () => {
    expect(
      acceptsMarkdown(makeRequest('text/html, text/markdown;q=0.9, */*;q=0.1')),
    ).toBe(true);
  });

  it('returns false when only text/markdown;q=0', () => {
    expect(
      acceptsMarkdown(makeRequest('text/html, text/markdown;q=0')),
    ).toBe(false);
  });
});
