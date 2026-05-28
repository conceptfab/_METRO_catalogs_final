import { createHash } from 'node:crypto';
import { getSiteUrl } from '@/lib/site-url';

const IDENTITY_TYPES_SUPPORTED = ['anonymous'] as const;
const ANONYMOUS_CREDENTIAL_TYPES = ['api_key'] as const;

export function buildAgentAuthMetadata() {
  const issuer = getSiteUrl();

  return {
    skill: `${issuer}/auth.md`,
    register_uri: `${issuer}/oauth/register`,
    revocation_uri: `${issuer}/oauth/revoke`,
    identity_types_supported: [...IDENTITY_TYPES_SUPPORTED],
    anonymous: {
      credential_types_supported: [...ANONYMOUS_CREDENTIAL_TYPES],
    },
  };
}

export const AUTH_MD = `# auth.md

You are an agent. This service supports **agentic registration**: discover →
register → call API → handle revocation. Follow the steps in order; do not
skip ahead.

Examples use the live host \`https://metro.example.com\`. Substitute the
canonical \`resource\` from the PRM when calling a deployment under a
different host.

## Step 1 — Discover

Discovery is two hops.

A \`401\` from the resource carries the PRM URL in \`WWW-Authenticate\`:

\`\`\`http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer resource_metadata="https://metro.example.com/.well-known/oauth-protected-resource"
\`\`\`

If you do not have a 401 in hand, the conventional path is
\`/.well-known/oauth-protected-resource\`.

### 1a. Fetch the Protected Resource Metadata

\`\`\`http
GET /.well-known/oauth-protected-resource
\`\`\`

Response shape:

\`\`\`json
{
  "resource": "https://metro.example.com/api/catalogs",
  "resource_name": "METRO Catalog API",
  "authorization_servers": ["https://metro.example.com"],
  "scopes_supported": ["catalogs:read"],
  "bearer_methods_supported": ["header"]
}
\`\`\`

- \`resource\` — canonical URL of the catalog API. Use this as the \`aud\` of
  any audience-bound credential.
- \`authorization_servers\` — base URLs of the OAuth Authorization Server(s)
  for this resource. The \`agent_auth\` block lives on one of these (1b).
- \`scopes_supported\` — scopes the resource understands.
- \`bearer_methods_supported\` — \`"header"\` = \`Authorization: Bearer …\`.

### 1b. Fetch the Authorization Server metadata

\`\`\`http
GET /.well-known/oauth-authorization-server
\`\`\`

Response includes:

\`\`\`json
{
  "issuer": "https://metro.example.com",
  "agent_auth": {
    "skill": "https://metro.example.com/auth.md",
    "register_uri": "https://metro.example.com/oauth/register",
    "revocation_uri": "https://metro.example.com/oauth/revoke",
    "identity_types_supported": ["anonymous"],
    "anonymous": {
      "credential_types_supported": ["api_key"]
    }
  }
}
\`\`\`

- \`skill\` — URL of this document.
- \`register_uri\` — where you POST to register (Step 2).
- \`revocation_uri\` — where the provider posts a \`logout+jwt\` to revoke
  your credential. You do not call this; it tells you what to expect.
- \`identity_types_supported\` — which registration methods this service
  accepts. METRO Catalogs accepts \`anonymous\` only (the data is public).
- \`anonymous.credential_types_supported\` — credential shapes available
  when registering anonymously.

## Step 2 — Register

The catalog API is public read-only. Registration is optional and only
used for rate-limit attribution.

\`\`\`http
POST /oauth/register
Content-Type: application/json

{
  "type": "anonymous",
  "requested_credential_type": "api_key"
}
\`\`\`

On a fully provisioned deployment, the response shape is:

\`\`\`json
{
  "registration_id": "reg_...",
  "registration_type": "anonymous",
  "credential_type": "api_key",
  "credential": "sk_metro_...",
  "credential_expires": null,
  "scopes": ["catalogs:read"]
}
\`\`\`

This reference deployment ships the endpoint in advertised-but-not-issuing
mode: it responds with HTTP \`501 not_implemented\` and a pointer back to
this document. The public endpoints under \`/api/catalogs\` remain callable
without a credential.

## Step 3 — Use the credential

Send the credential on every request to the resource:

\`\`\`http
GET /api/catalogs
Authorization: Bearer <credential>
\`\`\`

Anonymous unauthenticated calls also work for the public read-only
surface.

## Step 4 — Handle revocation

If the operator revokes a registration, the resource will start returning
\`401 invalid_token\`. On revocation, discard the credential and restart at
Step 1.

To request revocation yourself, POST the credential to
\`/oauth/revoke\` per RFC 7009.

## Related discovery documents

- \`/.well-known/oauth-protected-resource\` — PRM (Step 1a).
- \`/.well-known/oauth-authorization-server\` — AS metadata (Step 1b).
- \`/.well-known/openid-configuration\` — OIDC overlay.
- \`/.well-known/agent-skills/index.json\` — agent skill catalog for this
  site, including DNS-AID and this auth.md.
- \`/oauth/jwks.json\` — JWKS used to verify any issued tokens.

## Contact

Operational contact: \`operations@metro.example\`. Security reports should
be sent to the same address with the subject prefix \`[security]\`.
`;

export function authMdHeaders() {
  return {
    'Content-Type': 'text/markdown; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Digest: `sha256:${createHash('sha256').update(AUTH_MD, 'utf8').digest('hex')}`,
  };
}
