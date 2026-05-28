import { oauthEndpointHeaders } from '@/lib/oauth-discovery';

export const runtime = 'nodejs';

const TOKEN_NOT_ENABLED = {
  error: 'unsupported_grant_type',
  error_description:
    'Token issuance is not enabled for this public catalog API.',
};

export function POST() {
  return new Response(JSON.stringify(TOKEN_NOT_ENABLED, null, 2), {
    status: 400,
    headers: oauthEndpointHeaders(),
  });
}

export function OPTIONS() {
  return new Response(null, {
    headers: oauthEndpointHeaders(),
  });
}
