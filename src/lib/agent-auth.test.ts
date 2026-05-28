import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/site-url', () => ({
  getSiteUrl: () => 'https://test.metro.example',
}));

import { AUTH_MD, authMdHeaders, buildAgentAuthMetadata } from './agent-auth';

describe('AUTH_MD content', () => {
  it('starts with the canonical `# auth.md` H1 heading', () => {
    expect(AUTH_MD.split('\n')[0]).toBe('# auth.md');
  });

  it('documents the discover -> register -> use -> revoke flow', () => {
    expect(AUTH_MD).toContain('Step 1 — Discover');
    expect(AUTH_MD).toContain('Step 2 — Register');
    expect(AUTH_MD).toContain('Step 3 — Use the credential');
    expect(AUTH_MD).toContain('Step 4 — Handle revocation');
  });

  it('references the canonical .well-known endpoints', () => {
    expect(AUTH_MD).toContain('/.well-known/oauth-protected-resource');
    expect(AUTH_MD).toContain('/.well-known/oauth-authorization-server');
  });
});

describe('authMdHeaders', () => {
  it('serves Markdown with a SHA-256 Digest header', () => {
    const h = authMdHeaders();
    expect(h['Content-Type']).toBe('text/markdown; charset=utf-8');
    expect(h.Digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(h['Access-Control-Allow-Origin']).toBe('*');
  });
});

describe('buildAgentAuthMetadata', () => {
  it('returns the canonical agent_auth shape', () => {
    const meta = buildAgentAuthMetadata();
    expect(meta).toEqual({
      skill: 'https://test.metro.example/auth.md',
      register_uri: 'https://test.metro.example/oauth/register',
      revocation_uri: 'https://test.metro.example/oauth/revoke',
      identity_types_supported: ['anonymous'],
      anonymous: {
        credential_types_supported: ['api_key'],
      },
    });
  });
});
