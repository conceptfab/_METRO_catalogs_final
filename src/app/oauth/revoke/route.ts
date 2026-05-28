import { oauthEndpointHeaders } from '@/lib/oauth-discovery';

export const runtime = 'nodejs';

const NOT_IMPLEMENTED = {
  error: 'not_implemented',
  error_description:
    'Token revocation per RFC 7009 is advertised in /auth.md but is not yet wired up for this public catalog API.',
  see_also: '/auth.md',
};

export function POST() {
  return new Response(JSON.stringify(NOT_IMPLEMENTED, null, 2), {
    status: 501,
    headers: oauthEndpointHeaders(),
  });
}

export function OPTIONS() {
  return new Response(null, {
    headers: oauthEndpointHeaders(),
  });
}
