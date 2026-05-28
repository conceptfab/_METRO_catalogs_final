import { buildDnsAidDescriptor, dnsAidJsonHeaders } from '@/lib/dnsaid';

export const runtime = 'nodejs';

export function GET() {
  return new Response(JSON.stringify(buildDnsAidDescriptor(), null, 2), {
    headers: dnsAidJsonHeaders(),
  });
}

export function HEAD() {
  return new Response(null, {
    headers: dnsAidJsonHeaders(),
  });
}

export function OPTIONS() {
  return new Response(null, {
    headers: dnsAidJsonHeaders(),
  });
}
