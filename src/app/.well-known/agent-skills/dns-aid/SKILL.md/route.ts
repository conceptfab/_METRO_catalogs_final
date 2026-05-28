import { DNS_AID_SKILL_MD, dnsAidSkillHeaders } from '@/lib/dnsaid';

export const runtime = 'nodejs';

export function GET() {
  return new Response(DNS_AID_SKILL_MD, {
    headers: dnsAidSkillHeaders(),
  });
}

export function HEAD() {
  return new Response(null, {
    headers: dnsAidSkillHeaders(),
  });
}

export function OPTIONS() {
  return new Response(null, {
    headers: dnsAidSkillHeaders(),
  });
}
