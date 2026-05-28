import {
  agentSkillMarkdownHeaders,
  METRO_CATALOG_DISCOVERY_SKILL_MD,
} from '@/lib/agent-skills';

export const runtime = 'nodejs';

export function GET() {
  return new Response(METRO_CATALOG_DISCOVERY_SKILL_MD, {
    headers: agentSkillMarkdownHeaders(),
  });
}

export function HEAD() {
  return new Response(null, {
    headers: agentSkillMarkdownHeaders(),
  });
}

export function OPTIONS() {
  return new Response(null, {
    headers: agentSkillMarkdownHeaders(),
  });
}
