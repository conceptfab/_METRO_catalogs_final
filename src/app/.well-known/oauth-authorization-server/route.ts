import {
  buildOAuthDiscoveryMetadata,
  discoveryJsonHeaders,
} from '@/lib/oauth-discovery';

export const runtime = 'nodejs';

export function GET() {
  return new Response(JSON.stringify(buildOAuthDiscoveryMetadata(), null, 2), {
    headers: discoveryJsonHeaders(),
  });
}

export function HEAD() {
  return new Response(null, {
    headers: discoveryJsonHeaders(),
  });
}

export function OPTIONS() {
  return new Response(null, {
    headers: discoveryJsonHeaders(),
  });
}
