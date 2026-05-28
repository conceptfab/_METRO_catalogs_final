import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { colorTokens } from './design-tokens';

const globalsCss = readFileSync(
  resolve(__dirname, '../app/globals.css'),
  'utf8',
);

const ROOT_BLOCK_REGEX = /:root\s*{([\s\S]*?)}/;
const DARK_BLOCK_REGEX = /\.dark\s*{([\s\S]*?)}/;
const VAR_DECL_REGEX = /(--[a-z0-9-]+):\s*([^;]+);/gi;

function buildVarMap(block: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const match of block.matchAll(VAR_DECL_REGEX)) {
    map.set(match[1], match[2].trim());
  }
  return map;
}

const rootVars = buildVarMap(globalsCss.match(ROOT_BLOCK_REGEX)?.[1] ?? '');
const darkVars = buildVarMap(globalsCss.match(DARK_BLOCK_REGEX)?.[1] ?? '');
const HEX_REGEX = /^#[0-9a-f]{3,8}$/i;

describe('design-tokens.ts registry', () => {
  it('every cssVar in colorTokens is declared in globals.css :root', () => {
    for (const token of colorTokens) {
      expect(
        rootVars.has(token.cssVar),
        `Missing ${token.cssVar} in :root block`,
      ).toBe(true);
    }
  });

  it('every cssVar with a `dark` value is declared in globals.css .dark', () => {
    for (const token of colorTokens) {
      if (!token.dark) continue;
      expect(
        darkVars.has(token.cssVar),
        `Missing ${token.cssVar} in .dark block`,
      ).toBe(true);
    }
  });

  it('light hex value matches globals.css declaration', () => {
    for (const token of colorTokens) {
      const value = rootVars.get(token.cssVar);
      if (!value || !HEX_REGEX.test(value)) continue;
      expect(value.toLowerCase()).toBe(token.light.toLowerCase());
    }
  });
});
