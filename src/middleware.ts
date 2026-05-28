import { NextRequest, NextResponse } from 'next/server';

const MARKDOWN_ROUTE = '/agent-markdown';
const PUBLIC_FILE_PATTERN = /\.[a-z0-9]+$/i;

export function acceptsMarkdown(request: NextRequest): boolean {
  const accept = request.headers.get('accept');
  if (!accept) return false;

  return accept.split(',').some((part) => {
    const [mediaType, ...params] = part.trim().split(';');
    if (mediaType.trim().toLowerCase() !== 'text/markdown') return false;

    const q = params
      .map((param) => param.trim().toLowerCase())
      .find((param) => param.startsWith('q='));

    return q ? Number.parseFloat(q.slice(2)) > 0 : true;
  });
}

export function isHtmlRoute(pathname: string): boolean {
  if (pathname === MARKDOWN_ROUTE || pathname.startsWith(`${MARKDOWN_ROUTE}/`))
    return false;
  if (pathname.startsWith('/_next/')) return false;
  if (pathname.startsWith('/api/')) return false;
  if (pathname.startsWith('/.well-known/')) return false;
  if (PUBLIC_FILE_PATTERN.test(pathname)) return false;

  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isHtmlRoute(pathname) || !acceptsMarkdown(request)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = MARKDOWN_ROUTE;
  url.searchParams.set('path', pathname);

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: '/:path*',
};
