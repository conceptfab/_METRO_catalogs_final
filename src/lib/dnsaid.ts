import { createHash } from 'node:crypto';
import { getSiteUrl } from '@/lib/site-url';

function siteHost(): string {
  return new URL(getSiteUrl()).host;
}

function isVercelAppHost(host: string): boolean {
  return host === 'vercel.app' || host.endsWith('.vercel.app');
}

export function buildDnsAidDescriptor() {
  const base = getSiteUrl();
  const host = siteHost();
  const publishable = !isVercelAppHost(host);

  return {
    spec: 'draft-mozleywilliams-dnsop-dnsaid',
    spec_url:
      'https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/',
    rrtype: 'HTTPS',
    dnssec_required: true,
    apex: `_agents.${host}`,
    publishable,
    publishable_notice: publishable
      ? null
      : `Records cannot be published under "${host}". The .vercel.app zone is owned by Vercel and does not accept tenant-published SVCB/HTTPS/TXT records. Attach a custom domain to this project, then publish the records below substituting the custom apex.`,
    notes: {
      target:
        'TargetName is the apex host (no underscores). SVCB TargetName "." aliases to the owner name which contains "_index._agents" labels; public CAs do not issue certificates for underscored hostnames, so TLS validation would fail.',
      svc_params:
        'Per the DNS-AID draft and the isitagentready.com scanner reference, the ServiceMode HTTPS RR carries the standard SVCB SvcParams: alpn (RFC 9460 §7.1) and port (§7.2), with mandatory (§8) listing them. The well-known agent path is conveyed by the owner-name label (_index, _mcp, ...), not by a SvcParam.',
      txt_alternative:
        'Providers that cannot publish SVCB/HTTPS RRs may publish a TXT record at the same owner name with the absolute URL of the resource, e.g. "endpoint=https://host/.well-known/...". The scanner accepts either form.',
    },
    records: [
      {
        name: `_index._agents.${host}`,
        priority: 1,
        target: host,
        params: {
          alpn: ['h2', 'http/1.1'],
          port: 443,
          mandatory: ['alpn', 'port'],
        },
        absolute_endpoint: `${base}/.well-known/agent-skills/index.json`,
        txt_alternative: `endpoint=${base}/.well-known/agent-skills/index.json`,
        description:
          'Well-known DNS-AID entrypoint. Resolves to the agent-skills index for this service.',
      },
      {
        name: `_mcp._agents.${host}`,
        priority: 1,
        target: host,
        params: {
          alpn: ['h2', 'http/1.1'],
          port: 443,
          mandatory: ['alpn', 'port'],
        },
        absolute_endpoint: `${base}/.well-known/mcp/server-card.json`,
        txt_alternative: `endpoint=${base}/.well-known/mcp/server-card.json`,
        description:
          'MCP server card descriptor. Points to the streamable HTTP MCP endpoint.',
      },
      {
        name: `_oauth._agents.${host}`,
        priority: 1,
        target: host,
        params: {
          alpn: ['h2', 'http/1.1'],
          port: 443,
          mandatory: ['alpn', 'port'],
        },
        absolute_endpoint: `${base}/.well-known/oauth-authorization-server`,
        txt_alternative: `endpoint=${base}/.well-known/oauth-authorization-server`,
        description:
          'OAuth 2.0 authorization server discovery document. Used by agents to bootstrap auth flows. (Not validated by the current isitagentready.com scanner, which only checks _index, _a2a, and _mcp.)',
      },
    ],
  };
}

export function dnsAidJsonHeaders() {
  const digest = createHash('sha256')
    .update(JSON.stringify(buildDnsAidDescriptor()), 'utf8')
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

export const DNS_AID_SKILL_MD = `---
name: dns-aid
description: DNS-based AI agent discovery descriptor for this site, including the SVCB/HTTPS records to publish under _agents.<domain>.
---

# DNS for AI Discovery (DNS-AID) — METRO Catalogs

This skill describes how to discover the METRO Catalog API through DNS,
following \`draft-mozleywilliams-dnsop-dnsaid\`. The runtime-derived
descriptor is published at \`/.well-known/dnsaid.json\` and lists the
SVCB/HTTPS records to publish in the authoritative zone of the
production custom domain.

## Important: \`.vercel.app\` cannot host these records

The \`vercel.app\` zone is operated by Vercel. Tenants cannot publish
SVCB / HTTPS / TXT records on \`*.vercel.app\` names, so the DNS-AID
scan will always fail on a bare \`.vercel.app\` URL. Attach a custom
domain to the project and publish the records on that zone.

## Well-known entrypoint

The DNS-AID well-known entrypoint is the \`_index._agents.<domain>\`
SVCB/HTTPS record. The scanner at <https://isitagentready.com> queries:

\`\`\`
SVCB  _index._agents.<domain>
HTTPS _index._agents.<domain>
SVCB  _a2a._agents.<domain>
HTTPS _a2a._agents.<domain>
SVCB  _mcp._agents.<domain>
HTTPS _mcp._agents.<domain>
TXT   _index._agents.<domain>
\`\`\`

At least one ServiceMode SVCB/HTTPS answer (or a TXT alternative on
\`_index._agents.<domain>\`) is required for the check to pass.

## Records to publish

Each record is a ServiceMode (priority \`1\`) HTTPS RR whose TargetName
is the apex host (not \`.\`) and which carries the standard SVCB
SvcParams: \`alpn\`, \`port\`, and \`mandatory\`. The well-known path is
encoded in the owner-name label (\`_index\`, \`_mcp\`, ...), not in a
SvcParam.

\`\`\`
_index._agents.<domain>. 3600 IN HTTPS 1 <domain>. alpn="h2,http/1.1" port=443 mandatory=alpn,port
_mcp._agents.<domain>.   3600 IN HTTPS 1 <domain>. alpn="h2,http/1.1" port=443 mandatory=alpn,port
_oauth._agents.<domain>. 3600 IN HTTPS 1 <domain>. alpn="h2,http/1.1" port=443 mandatory=alpn,port
\`\`\`

Resolved paths under the TargetName:

- \`_index\` → \`/.well-known/agent-skills/index.json\`
- \`_mcp\`   → \`/.well-known/mcp/server-card.json\`
- \`_oauth\` → \`/.well-known/oauth-authorization-server\`

Sign the \`_agents.<domain>\` zone with DNSSEC so that validating
resolvers receive authenticated data.

## References

- DNS-AID draft: <https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/>
- SVCB/HTTPS RR: <https://www.rfc-editor.org/rfc/rfc9460>
- Runbook for this repo: \`docs/dns-aid.md\`
`;

export function dnsAidSkillHeaders() {
  const digest = createHash('sha256')
    .update(DNS_AID_SKILL_MD, 'utf8')
    .digest('hex');

  return {
    'Content-Type': 'text/markdown; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Digest: `sha256:${digest}`,
  };
}
