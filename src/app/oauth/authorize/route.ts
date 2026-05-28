import { oauthEndpointHeaders } from '@/lib/oauth-discovery';

export const runtime = 'nodejs';

const AUTH_NOT_ENABLED = {
  error: 'temporarily_unavailable',
  error_description:
    'OAuth authorization is discoverable, but interactive authorization is not enabled for this public catalog API.',
};

export function GET() {
  return new Response(JSON.stringify(AUTH_NOT_ENABLED, null, 2), {
    status: 503,
    headers: oauthEndpointHeaders(),
  });
}

export function OPTIONS() {
  return new Response(null, {
    headers: oauthEndpointHeaders(),
  });
}
