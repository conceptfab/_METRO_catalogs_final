import { createHash } from 'node:crypto';

const AGENT_SKILLS_SCHEMA =
  'https://schemas.agentskills.io/discovery/0.2.0/schema.json';

const METRO_CATALOG_DISCOVERY_SKILL = {
  name: 'metro-catalog-discovery',
  type: 'skill-md',
  description:
    'Discover and read METRO catalog resources using the site homepage, Markdown negotiation, API catalog, MCP endpoint, and public catalog JSON resources.',
  url: '/.well-known/agent-skills/metro-catalog-discovery/SKILL.md',
} as const;

export const METRO_CATALOG_DISCOVERY_SKILL_MD = `---
name: metro-catalog-discovery
description: Discover and read METRO catalog resources using the site homepage, Markdown negotiation, API catalog, MCP endpoint, and public catalog JSON resources.
---

# METRO Catalog Discovery

Use this skill when an agent needs to discover, inspect, or summarize the METRO product catalog site.

## Discovery

Start with the homepage. Browsers receive HTML by default. Agents can request Markdown by sending:

\`\`\`http
Accept: text/markdown
\`\`\`

The Markdown response includes the catalog list, agent resources, and an estimated \`x-markdown-tokens\` header.

## Machine-Readable Resources

- API catalog: \`/.well-known/api-catalog\`
- Catalog listing API: \`/api/catalogs\`
- MCP server card: \`/.well-known/mcp/server-card.json\`
- MCP endpoint: \`/mcp\`
- Sitemap: \`/sitemap.xml\`

## Catalog Pages

Catalog detail pages are available at \`/catalog/{catalogId}\`, for example:

- \`/catalog/QX\`
- \`/catalog/QS\`

Send \`Accept: text/markdown\` to a catalog page to receive a compact Markdown summary of sections, gallery items, finishes, dimensions, materials, features, order steps, and product codes.

## MCP Usage

Use \`POST /mcp\` with JSON-RPC for lightweight discovery:

- \`initialize\` returns server info and capabilities.
- \`resources/list\` returns public catalog resources.
- \`resources/read\` can read the catalog listing resource.

Do not assume private write access. The published endpoints are read-only discovery surfaces.
`;

function sha256Digest(content: string): string {
  return `sha256:${createHash('sha256').update(content, 'utf8').digest('hex')}`;
}

export function buildAgentSkillsIndex() {
  return {
    $schema: AGENT_SKILLS_SCHEMA,
    skills: [
      {
        ...METRO_CATALOG_DISCOVERY_SKILL,
        digest: sha256Digest(METRO_CATALOG_DISCOVERY_SKILL_MD),
      },
    ],
  };
}

export function agentSkillsJsonHeaders() {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export function agentSkillMarkdownHeaders() {
  return {
    'Content-Type': 'text/markdown; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Digest: sha256Digest(METRO_CATALOG_DISCOVERY_SKILL_MD),
  };
}
