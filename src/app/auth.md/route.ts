import { AUTH_MD, authMdHeaders } from '@/lib/agent-auth';

export const runtime = 'nodejs';

export function GET() {
  return new Response(AUTH_MD, {
    headers: authMdHeaders(),
  });
}

export function HEAD() {
  return new Response(null, {
    headers: authMdHeaders(),
  });
}

export function OPTIONS() {
  return new Response(null, {
    headers: authMdHeaders(),
  });
}
