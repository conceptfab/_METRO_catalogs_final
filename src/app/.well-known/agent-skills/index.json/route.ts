import {
  agentSkillsJsonHeaders,
  buildAgentSkillsIndex,
} from '@/lib/agent-skills';

export const runtime = 'nodejs';

export function GET() {
  return new Response(JSON.stringify(buildAgentSkillsIndex(), null, 2), {
    headers: agentSkillsJsonHeaders(),
  });
}

export function HEAD() {
  return new Response(null, {
    headers: agentSkillsJsonHeaders(),
  });
}

export function OPTIONS() {
  return new Response(null, {
    headers: agentSkillsJsonHeaders(),
  });
}
