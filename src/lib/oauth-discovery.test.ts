import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/site-url', () => ({
  getSiteUrl: () => 'https://test.metro.example',
}));

import {
  buildOAuthDiscoveryMetadata,
  buildOpenIdConfiguration,
  buildProtectedResourceMetadata,
  buildJwks,
  discoveryJsonHeaders,
  oauthEndpointHeaders,
} from './oauth-discovery';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('buildOAuthDiscoveryMetadata', () => {
  it('returns expected core fields', () => {
    const meta = buildOAuthDiscoveryMetadata();
    expect(meta.issuer).toBe('https://test.metro.example');
    expect(meta.authorization_endpoint).toBe('https://test.metro.example/oauth/authorize');
    expect(meta.token_endpoint).toBe('https://test.metro.example/oauth/token');
    expect(meta.jwks_uri).toBe('https://test.metro.example/oauth/jwks.json');
    expect(meta.response_types_supported).toEqual(['code']);
    expect(meta.grant_types_supported).toEqual(['authorization_code', 'refresh_token']);
    expect(meta.scopes_supported).toEqual(['openid', 'profile', 'email', 'catalogs:read']);
    expect(meta.code_challenge_methods_supported).toEqual(['S256']);
    expect(meta.token_endpoint_auth_methods_supported).toContain('none');
  });

  it('points service_documentation to .well-known agent skill', () => {
    const meta = buildOAuthDiscoveryMetadata();
    expect(meta.service_documentation).toBe(
      'https://test.metro.example/.well-known/agent-skills/metro-catalog-discovery/SKILL.md',
    );
  });
});

describe('buildOpenIdConfiguration', () => {
  it('extends OAuth metadata with OIDC fields', () => {
    const oidc = buildOpenIdConfiguration();
    expect(oidc.issuer).toBe('https://test.metro.example');
    expect(oidc.subject_types_supported).toEqual(['public']);
    expect(oidc.id_token_signing_alg_values_supported).toEqual(['RS256']);
    expect(oidc.claims_supported).toEqual(['sub', 'name', 'email']);
  });
});

describe('buildProtectedResourceMetadata', () => {
  it('returns metadata for /api/catalogs resource', () => {
    const meta = buildProtectedResourceMetadata();
    expect(meta.resource).toBe('https://test.metro.example/api/catalogs');
    expect(meta.authorization_servers).toEqual(['https://test.metro.example']);
    expect(meta.scopes_supported).toEqual(['catalogs:read']);
    expect(meta.bearer_methods_supported).toEqual(['header']);
    expect(meta.resource_name).toBe('METRO Catalog API');
  });
});

describe('buildJwks', () => {
  it('returns empty key set for now', () => {
    expect(buildJwks()).toEqual({ keys: [] });
  });
});

describe('header helpers', () => {
  it('discovery headers are public-cacheable JSON', () => {
    const h = discoveryJsonHeaders();
    expect(h['Content-Type']).toBe('application/json; charset=utf-8');
    expect(h['Cache-Control']).toContain('public');
    expect(h['Cache-Control']).toContain('max-age=3600');
    expect(h['Access-Control-Allow-Origin']).toBe('*');
  });

  it('oauth endpoint headers are no-store', () => {
    const h = oauthEndpointHeaders();
    expect(h['Cache-Control']).toBe('no-store');
    expect(h['Access-Control-Allow-Methods']).toContain('POST');
  });
});
