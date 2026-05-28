import { createHash } from 'node:crypto';
import { getSiteUrl } from '@/lib/site-url';

const AGENT_NAME = 'METRO Catalog Discovery Agent';
const AGENT_VERSION = '0.1.0';
const A2A_PROTOCOL_VERSION = '1.0';

function buildAgentCard() {
  const base = getSiteUrl();

  return {
    name: AGENT_NAME,
    description:
      'Read-only discovery agent for METRO product catalogs. Lists catalog identifiers, returns Markdown summaries of catalog pages, and surfaces the MCP, OAuth, and agent-skills descriptors published under /.well-known/.',
    url: base,
    version: AGENT_VERSION,
    protocolVersion: A2A_PROTOCOL_VERSION,
    provider: {
      name: 'METRO',
      url: base,
    },
    documentationUrl: `${base}/.well-known/agent-skills/metro-catalog-discovery/SKILL.md`,
    capabilities: {
      streaming: false,
      pushNotifications: false,
      extendedAgentCard: false,
    },
    defaultInputModes: ['text/plain', 'application/json'],
    defaultOutputModes: ['text/markdown', 'application/json'],
    skills: [
      {
        id: 'list-catalogs',
        name: 'list-catalogs',
        description:
          'List all available METRO catalog identifiers with basic metadata.',
        tags: ['catalog', 'discovery'],
        examples: ['List all METRO catalogs', 'Which catalogs are available?'],
        inputModes: ['text/plain'],
        outputModes: ['application/json'],
      },
      {
        id: 'read-catalog',
        name: 'read-catalog',
        description:
          'Fetch a Markdown summary of a single METRO catalog page (sections, gallery, finishes, dimensions, materials, features, order steps, product codes).',
        tags: ['catalog', 'content'],
        examples: ['Show catalog MRC1000', 'Summarize catalog QS'],
        inputModes: ['text/plain'],
        outputModes: ['text/markdown'],
      },
    ],
    securitySchemes: {
      anonymous: {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description:
          'Anonymous API key issued via /oauth/register. See /auth.md for the discover → register → call flow.',
      },
    },
    security: [{ anonymous: [] }],
    interfaces: [
      {
        type: 'http',
        url: `${base}/api/catalogs`,
        description: 'REST JSON listing of catalog identifiers.',
      },
      {
        type: 'mcp',
        url: `${base}/mcp`,
        description:
          'Streamable HTTP MCP endpoint. See /.well-known/mcp/server-card.json.',
      },
    ],
    additionalInterfaces: [
      {
        transport: 'JSONRPC',
        url: `${base}/mcp`,
      },
    ],
  };
}

function agentCardHeaders() {
  const digest = createHash('sha256')
    .update(JSON.stringify(buildAgentCard()), 'utf8')
    .digest('hex');

  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Digest: `sha256:${digest}`,
  };
}

export const runtime = 'nodejs';

export function GET() {
  return new Response(JSON.stringify(buildAgentCard(), null, 2), {
    headers: agentCardHeaders(),
  });
}

export function HEAD() {
  return new Response(null, {
    headers: agentCardHeaders(),
  });
}

export function OPTIONS() {
  return new Response(null, {
    headers: agentCardHeaders(),
  });
}
