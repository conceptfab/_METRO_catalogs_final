import { getSiteUrl } from '@/lib/site-url';

const SUPPORTED_GRANT_TYPES = ['authorization_code', 'refresh_token'];
const SUPPORTED_RESPONSE_TYPES = ['code'];
const SUPPORTED_SCOPES = ['openid', 'profile', 'email', 'catalogs:read'];
const PROTECTED_RESOURCE_SCOPES = ['catalogs:read'];

export function buildOAuthDiscoveryMetadata() {
  const issuer = getSiteUrl();

  return {
    issuer,
    authorization_endpoint: `${issuer}/oauth/authorize`,
    token_endpoint: `${issuer}/oauth/token`,
    jwks_uri: `${issuer}/oauth/jwks.json`,
    response_types_supported: SUPPORTED_RESPONSE_TYPES,
    grant_types_supported: SUPPORTED_GRANT_TYPES,
    scopes_supported: SUPPORTED_SCOPES,
    token_endpoint_auth_methods_supported: [
      'client_secret_basic',
      'client_secret_post',
      'none',
    ],
    code_challenge_methods_supported: ['S256'],
    service_documentation: `${issuer}/.well-known/agent-skills/metro-catalog-discovery/SKILL.md`,
  };
}

export function buildOpenIdConfiguration() {
  return {
    ...buildOAuthDiscoveryMetadata(),
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['RS256'],
    claims_supported: ['sub', 'name', 'email'],
  };
}

export function buildProtectedResourceMetadata() {
  const issuer = getSiteUrl();
  const resource = `${issuer}/api/catalogs`;

  return {
    resource,
    authorization_servers: [issuer],
    scopes_supported: PROTECTED_RESOURCE_SCOPES,
    bearer_methods_supported: ['header'],
    resource_name: 'METRO Catalog API',
    resource_documentation: `${issuer}/.well-known/agent-skills/metro-catalog-discovery/SKILL.md`,
    jwks_uri: `${issuer}/oauth/jwks.json`,
  };
}

export function buildJwks() {
  return {
    keys: [],
  };
}

export function discoveryJsonHeaders() {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export function oauthEndpointHeaders() {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
