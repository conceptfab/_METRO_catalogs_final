import { getSiteUrl } from '@/lib/site-url';

export function GET() {
  const base = getSiteUrl();
  const body = [
    'Content-Signal: search=yes, ai-train=no, ai-input=yes',
    '',
    'User-agent: *',
    'Allow: /',
    'Disallow: /catalog/*/print',
    '',
    `Sitemap: ${base}/sitemap.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
