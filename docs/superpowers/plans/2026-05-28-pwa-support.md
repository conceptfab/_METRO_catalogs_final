# PWA Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `metro-catalogs` installable as a PWA with selective offline support (app shell + JSON + a single user-chosen catalog cached on-demand), without bloating browser storage with the 344 MB of MP4 assets.

**Architecture:** Vanilla service worker (no `next-pwa` / `workbox` runtime — keeps deps minimal and gives full control over which assets ever touch the cache). The SW is a static file in `public/sw.js` that imports a build-time-generated precache list (`/sw-precache.json`). Strategies: network-first for HTML, stale-while-revalidate for JSON, cache-first for hashed Next.js chunks and small webp variants (≤640w), network-only for MP4 and large webp variants. An optional companion task generates `*-lo.mp4` low-bitrate variants and wires a `<source>` fallback into the existing `FeatureVideo` markup.

**Tech Stack:** Next.js 15.5.12 App Router · React 19 · TypeScript · vanilla Service Worker API · Cache API · Vitest · sharp 0.33 (existing) · ffmpeg (existing, for MP4 variant)

**Scope notes:**
- This plan does **not** introduce push notifications, background sync, or Periodic Background Sync — they are out of scope for a catalog browsing app.
- The plan assumes Vercel deployment (existing). SW scope is the entire origin.
- The MP4 low-res variant task (Task 8) is **independent** of the PWA core — if rejected during review, drop Tasks 8–9 without affecting Tasks 1–7.

---

## File Structure

**Created:**
- `public/sw.js` — service worker, lives at origin root so its scope is `/`
- `public/offline.html` — static offline fallback for failed HTML navigations
- `src/components/pwa/ServiceWorkerRegister.tsx` — client component, registers `/sw.js` after `load`
- `src/components/pwa/InstallPrompt.tsx` — client component, captures `beforeinstallprompt` and exposes a button
- `src/lib/pwa/sw-cache-strategies.ts` — pure functions: classify request → strategy, build cache keys, pick smallest webp variant. **Importable by both SW (via `importScripts` of a built bundle) and tests.**
- `src/lib/pwa/__tests__/sw-cache-strategies.test.ts` — Vitest unit tests for the above
- `src/lib/pwa/sw-types.ts` — shared types (`CacheStrategy`, `RequestClass`)
- `scripts/build-sw-assets.mjs` — at build time: (a) bundles `sw-cache-strategies.ts` to `public/sw-strategies.js` so the SW can `importScripts` it, (b) generates `public/sw-precache.json` with app shell URLs + small webp variants list
- `public/sw-precache.json` — generated; committed-but-regenerated artifact (added to `.gitignore`)
- `public/sw-strategies.js` — generated bundle; in `.gitignore`
- `src/app/offline/page.tsx` — App Router page version of the offline fallback (used when SW isn't yet active)
- `scripts/generate-mp4-lowres.mjs` — Task 8 only; emits `*-lo.mp4` next to each catalog MP4

**Modified:**
- `public/site.webmanifest` — expand to a full PWA manifest (`start_url`, `scope`, `id`, `lang`, `orientation`, `categories`, `screenshots`, `shortcuts`)
- `src/app/layout.tsx` — add `viewport` export, render `<ServiceWorkerRegister />`
- `next.config.ts` — add `headers()` entry for `/sw.js` (`Cache-Control: no-cache`, `Service-Worker-Allowed: /`)
- `package.json` — add scripts `sw:build`, `mp4:lowres`; extend `prebuild` to call `sw:build`; add `.gitignore` entries
- `.gitignore` — add `public/sw-precache.json`, `public/sw-strategies.js`
- `src/layouts/qx/FeaturesQX.tsx` + `src/layouts/mrc800/FeaturesMRC800.tsx` + `src/layouts/mrc1000/FeaturesMRC1000.tsx` — Task 9 only; switch the `<video src=...>` to `<video><source>` markup with the `-lo.mp4` fallback for `prefers-reduced-data`

---

## Task 1: Expand the Web App Manifest

**Files:**
- Modify: `public/site.webmanifest` (full rewrite — file is 1 line of minified JSON)

The current manifest is the bare minimum favicon-generator output. For "installable PWA" Chrome/Edge require `name`, `short_name`, `start_url`, `display`, `icons` with at least one ≥192×192 AND ≥512×512, plus a maskable icon variant.

- [ ] **Step 1: Rewrite the manifest with full PWA fields**

Replace the entire contents of `public/site.webmanifest` with:

```json
{
  "name": "METRO Catalogs",
  "short_name": "METRO",
  "id": "/",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "any",
  "lang": "en",
  "dir": "ltr",
  "background_color": "#ffffff",
  "theme_color": "#ffffff",
  "categories": ["business", "shopping", "productivity"],
  "description": "METRO product catalogs. QX, QS, TS, VR, FM desk systems. FOTA conference furniture. MRC reception desks.",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

Note: re-using `android-chrome-512x512.png` for `maskable` is a stopgap — Chrome will accept it but may crop edges. A properly designed maskable icon (subject in centre 80% safe zone) is recommended but out of scope here; track it as a follow-up.

- [ ] **Step 2: Validate the JSON parses**

Run: `node -e "JSON.parse(require('fs').readFileSync('public/site.webmanifest','utf8'))"`
Expected: exit 0, no output.

- [ ] **Step 3: Commit**

```bash
git add public/site.webmanifest
git commit -m "feat(pwa): expand site.webmanifest to full installable manifest"
```

---

## Task 2: Add Viewport Export and PWA Meta Tags to Layout

**Files:**
- Modify: `src/app/layout.tsx:1-54` (current full contents, will add a `viewport` export and one meta link)

Next.js 15 prefers `export const viewport` over a `viewport` field on `metadata`. Apple-specific PWA hints (`apple-mobile-web-app-capable`, status-bar style) still need explicit meta tags because Next.js doesn't generate them from the manifest.

- [ ] **Step 1: Add the `Viewport` import and export**

Edit `src/app/layout.tsx` — change line 1 from:

```ts
import type { Metadata } from 'next';
```

to:

```ts
import type { Metadata, Viewport } from 'next';
```

Then add after the existing `metadata` export (after the closing `};` on line 38):

```ts
export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS, 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(pwa): add viewport export with themeColor and viewportFit"
```

---

## Task 3: Pure Cache-Strategy Module + Unit Tests (TDD)

**Files:**
- Create: `src/lib/pwa/sw-types.ts`
- Create: `src/lib/pwa/sw-cache-strategies.ts`
- Create: `src/lib/pwa/__tests__/sw-cache-strategies.test.ts`

The SW will be ~80 lines of glue around a pure-logic module. The logic — "given a Request, what strategy and what cache name?" — is what gets unit tested. The SW itself is verified manually in Task 6.

- [ ] **Step 1: Write the types file**

Create `src/lib/pwa/sw-types.ts`:

```ts
export type CacheStrategy =
  | 'network-only'
  | 'network-first'
  | 'cache-first'
  | 'stale-while-revalidate';

export type RequestClass =
  | 'html'
  | 'next-static'
  | 'webp-small'
  | 'webp-large'
  | 'video'
  | 'json'
  | 'manifest-icon'
  | 'other';

export interface ClassifiedRequest {
  class: RequestClass;
  strategy: CacheStrategy;
  cacheName: string;
}

export const CACHE_NAMES = {
  shell: 'metro-shell-v1',
  json: 'metro-json-v1',
  images: 'metro-images-v1',
  static: 'metro-static-v1',
} as const;

export const WEBP_SMALL_MAX_WIDTH = 640;
```

- [ ] **Step 2: Write the failing test file**

Create `src/lib/pwa/__tests__/sw-cache-strategies.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { classifyRequest } from '../sw-cache-strategies';
import { CACHE_NAMES } from '../sw-types';

function req(url: string, mode: RequestMode = 'cors'): Request {
  return new Request(url, { mode });
}

describe('classifyRequest', () => {
  it('classifies navigation HTML as network-first into shell cache', () => {
    const r = req('https://example.com/catalog/QX', 'navigate');
    const result = classifyRequest(r);
    expect(result.class).toBe('html');
    expect(result.strategy).toBe('network-first');
    expect(result.cacheName).toBe(CACHE_NAMES.shell);
  });

  it('classifies hashed Next.js static chunks as cache-first', () => {
    const r = req('https://example.com/_next/static/chunks/abc123.js');
    const result = classifyRequest(r);
    expect(result.class).toBe('next-static');
    expect(result.strategy).toBe('cache-first');
    expect(result.cacheName).toBe(CACHE_NAMES.static);
  });

  it('classifies small webp variants (≤640w) as cache-first images', () => {
    const r = req('https://example.com/catalogs/QX/gallery/hero-400w.webp');
    const result = classifyRequest(r);
    expect(result.class).toBe('webp-small');
    expect(result.strategy).toBe('cache-first');
    expect(result.cacheName).toBe(CACHE_NAMES.images);
  });

  it('classifies large webp variants (>640w) as network-only (do not cache)', () => {
    const r = req('https://example.com/catalogs/QX/gallery/hero-1600w.webp');
    const result = classifyRequest(r);
    expect(result.class).toBe('webp-large');
    expect(result.strategy).toBe('network-only');
  });

  it('classifies unsuffixed (base) webp as webp-small (fallback served when no variant)', () => {
    const r = req('https://example.com/catalogs/QX/gallery/hero.webp');
    const result = classifyRequest(r);
    expect(result.class).toBe('webp-small');
    expect(result.strategy).toBe('cache-first');
  });

  it('classifies content.json as stale-while-revalidate', () => {
    const r = req('https://example.com/catalogs/QX/hero/content.json');
    const result = classifyRequest(r);
    expect(result.class).toBe('json');
    expect(result.strategy).toBe('stale-while-revalidate');
    expect(result.cacheName).toBe(CACHE_NAMES.json);
  });

  it('classifies MP4 as network-only — never caches the 6+ MB videos', () => {
    const r = req('https://example.com/catalogs/QX/features/QX_extend.mp4');
    const result = classifyRequest(r);
    expect(result.class).toBe('video');
    expect(result.strategy).toBe('network-only');
  });

  it('classifies -lo.mp4 low-res variant as network-only as well', () => {
    const r = req('https://example.com/catalogs/QX/features/QX_extend-lo.mp4');
    const result = classifyRequest(r);
    expect(result.class).toBe('video');
    expect(result.strategy).toBe('network-only');
  });

  it('classifies the webmanifest and icons as cache-first', () => {
    expect(classifyRequest(req('https://example.com/site.webmanifest')).class).toBe('manifest-icon');
    expect(classifyRequest(req('https://example.com/favicon.ico')).class).toBe('manifest-icon');
    expect(classifyRequest(req('https://example.com/android-chrome-512x512.png')).class).toBe('manifest-icon');
  });

  it('classifies cross-origin requests as network-only (do not cache)', () => {
    const r = req('https://va.vercel-scripts.com/v1/script.js');
    const result = classifyRequest(r);
    expect(result.strategy).toBe('network-only');
  });
});

describe('classifyRequest URL parsing', () => {
  it('handles query strings on webp', () => {
    const r = req('https://example.com/catalogs/QX/gallery/hero-400w.webp?v=2');
    expect(classifyRequest(r).class).toBe('webp-small');
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npx vitest run src/lib/pwa/__tests__/sw-cache-strategies.test.ts`
Expected: FAIL — `Cannot find module '../sw-cache-strategies'` or similar.

- [ ] **Step 4: Implement the cache-strategy module**

Create `src/lib/pwa/sw-cache-strategies.ts`:

```ts
import {
  CACHE_NAMES,
  WEBP_SMALL_MAX_WIDTH,
  type CacheStrategy,
  type ClassifiedRequest,
  type RequestClass,
} from './sw-types';

const WEBP_VARIANT_RE = /-(\d+)w\.webp(?:$|\?)/i;

export function classifyRequest(request: Request): ClassifiedRequest {
  const url = new URL(request.url);
  const sameOrigin =
    typeof self !== 'undefined' && 'location' in self
      ? url.origin === self.location.origin
      : true; // in tests we treat any host as same-origin

  if (!sameOrigin) {
    return { class: 'other', strategy: 'network-only', cacheName: CACHE_NAMES.shell };
  }

  if (request.mode === 'navigate') {
    return { class: 'html', strategy: 'network-first', cacheName: CACHE_NAMES.shell };
  }

  const path = url.pathname;

  if (path.startsWith('/_next/static/')) {
    return { class: 'next-static', strategy: 'cache-first', cacheName: CACHE_NAMES.static };
  }

  if (path.endsWith('.mp4')) {
    return { class: 'video', strategy: 'network-only', cacheName: CACHE_NAMES.images };
  }

  if (path.endsWith('.webp')) {
    const m = path.match(WEBP_VARIANT_RE);
    if (m) {
      const width = Number.parseInt(m[1]!, 10);
      const cls: RequestClass = width <= WEBP_SMALL_MAX_WIDTH ? 'webp-small' : 'webp-large';
      const strategy: CacheStrategy = cls === 'webp-small' ? 'cache-first' : 'network-only';
      return { class: cls, strategy, cacheName: CACHE_NAMES.images };
    }
    return { class: 'webp-small', strategy: 'cache-first', cacheName: CACHE_NAMES.images };
  }

  if (path.endsWith('.json')) {
    return { class: 'json', strategy: 'stale-while-revalidate', cacheName: CACHE_NAMES.json };
  }

  if (
    path === '/site.webmanifest' ||
    path === '/favicon.ico' ||
    path.startsWith('/favicon-') ||
    path.startsWith('/android-chrome-') ||
    path.startsWith('/apple-touch-icon')
  ) {
    return { class: 'manifest-icon', strategy: 'cache-first', cacheName: CACHE_NAMES.static };
  }

  return { class: 'other', strategy: 'network-only', cacheName: CACHE_NAMES.shell };
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/lib/pwa/__tests__/sw-cache-strategies.test.ts`
Expected: PASS — all 10 tests green.

- [ ] **Step 6: Commit**

```bash
git add src/lib/pwa/
git commit -m "feat(pwa): pure cache-strategy classifier with unit tests"
```

---

## Task 4: Build Script for SW Precache List + Strategy Bundle

**Files:**
- Create: `scripts/build-sw-assets.mjs`
- Modify: `package.json` (add `sw:build` script, extend `prebuild`)
- Modify: `.gitignore` (add generated SW artifacts)

The SW needs (a) a list of URLs to precache on install, and (b) the compiled strategy classifier (since SWs can't import ESM from `src/`). This build step runs before `next build`, alongside the existing `images` prebuild.

- [ ] **Step 1: Add gitignore entries**

Append to `.gitignore`:

```
# Generated SW artifacts (rebuilt by scripts/build-sw-assets.mjs)
public/sw-precache.json
public/sw-strategies.js
```

- [ ] **Step 2: Write the build script**

Create `scripts/build-sw-assets.mjs`:

```js
#!/usr/bin/env node
/**
 * Builds two files that the service worker depends on:
 *
 *   public/sw-precache.json     — list of URLs to precache on SW install.
 *                                  Includes app shell URLs, manifest, icons,
 *                                  and ≤640w webp variants from the
 *                                  responsive-image-manifest.
 *
 *   public/sw-strategies.js     — UMD-ish bundle of
 *                                  src/lib/pwa/sw-cache-strategies.ts so
 *                                  the SW can importScripts() it.
 *                                  Uses esbuild via `npx --no-install` to
 *                                  avoid adding a new dependency — esbuild
 *                                  already ships transitively with Next.js.
 *
 * Run via `npm run sw:build` (added to prebuild).
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const MANIFEST_PATH = resolve(ROOT, 'src/generated/responsive-image-manifest.json');
const OUT_PRECACHE = resolve(ROOT, 'public/sw-precache.json');
const OUT_BUNDLE = resolve(ROOT, 'public/sw-strategies.js');
const STRATEGIES_SRC = resolve(ROOT, 'src/lib/pwa/sw-cache-strategies.ts');

const SHELL_URLS = [
  '/',
  '/offline',
  '/offline.html',
  '/site.webmanifest',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
];

const WEBP_SMALL_MAX_WIDTH = 640;

function buildPrecacheList() {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  const smallVariants = [];
  for (const [base, widths] of Object.entries(manifest)) {
    // base is like "/catalogs/QX/gallery/foo.webp"
    // Add the small-variant URLs (≤640w) for nav tiles & gallery thumbs.
    // We deliberately skip catalog gallery hero variants — those are
    // precached on-demand when the user opens that catalog (Task 7).
    if (!base.includes('/nav/') && !base.includes('/thumbs/')) continue;
    for (const w of widths) {
      if (w <= WEBP_SMALL_MAX_WIDTH) {
        const parsed = base.replace(/\.webp$/, `-${w}w.webp`);
        smallVariants.push(parsed);
      }
    }
  }
  const urls = [...SHELL_URLS, ...smallVariants];
  return [...new Set(urls)].sort();
}

function buildStrategyBundle() {
  // esbuild ships transitively via Next.js; resolve its binary.
  const esbuildBin = resolve(ROOT, 'node_modules/.bin/esbuild');
  execFileSync(
    esbuildBin,
    [
      STRATEGIES_SRC,
      '--bundle',
      '--format=iife',
      '--global-name=__metroPwa',
      '--platform=browser',
      '--target=es2020',
      `--outfile=${OUT_BUNDLE}`,
    ],
    { stdio: 'inherit' },
  );
}

function main() {
  mkdirSync(dirname(OUT_PRECACHE), { recursive: true });
  const list = buildPrecacheList();
  writeFileSync(OUT_PRECACHE, JSON.stringify({ version: Date.now().toString(36), urls: list }, null, 2) + '\n');
  buildStrategyBundle();
  console.log(`[sw:build] precache: ${list.length} URLs → ${OUT_PRECACHE}`);
  console.log(`[sw:build] strategies bundle → ${OUT_BUNDLE}`);
}

main();
```

- [ ] **Step 3: Wire it into npm scripts**

Edit `package.json` — in the `"scripts"` object:

- Add a new entry: `"sw:build": "node scripts/build-sw-assets.mjs"`
- Change the existing `"prebuild"` from `"npm run images"` to `"npm run images && npm run sw:build"`

- [ ] **Step 4: Run the build script and verify outputs**

Run: `npm run sw:build`
Expected output (last two lines):
```
[sw:build] precache: N URLs → /Users/.../public/sw-precache.json
[sw:build] strategies bundle → /Users/.../public/sw-strategies.js
```
Where `N` ≥ 10 (at minimum the shell URLs).

- [ ] **Step 5: Spot-check the generated files**

Run: `head -20 public/sw-precache.json && echo '---' && head -5 public/sw-strategies.js`
Expected: precache JSON contains `"/"`, `"/site.webmanifest"`, etc; strategies bundle starts with `var __metroPwa = (() => {` or similar IIFE preamble exposing `classifyRequest`.

- [ ] **Step 6: Commit**

```bash
git add scripts/build-sw-assets.mjs package.json .gitignore
git commit -m "feat(pwa): build script for SW precache list + strategy bundle"
```

---

## Task 5: Write the Service Worker

**Files:**
- Create: `public/sw.js`
- Create: `public/offline.html`
- Create: `src/app/offline/page.tsx`

The SW lives at `/sw.js` so its default scope is the whole origin. It does `importScripts('/sw-strategies.js')` to access the classifier, then implements each strategy as a small fetch handler. On install it precaches everything in `/sw-precache.json` (allowing partial failures — a single 404 in nav images shouldn't break install).

- [ ] **Step 1: Create the static offline fallback HTML**

Create `public/offline.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Offline · METRO Catalogs</title>
    <style>
      :root { color-scheme: light; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
        background: #ffffff;
        color: #111;
        padding: 2rem;
      }
      main { max-width: 32rem; text-align: center; }
      h1 { font-size: 1.5rem; margin: 0 0 0.75rem; font-weight: 700; }
      p { margin: 0 0 1.5rem; line-height: 1.5; color: #555; }
      button {
        appearance: none;
        background: #111;
        color: #fff;
        border: 0;
        padding: 0.75rem 1.25rem;
        font-size: 1rem;
        border-radius: 0.375rem;
        cursor: pointer;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>You're offline</h1>
      <p>This page isn't cached yet. Reconnect and try again — already-visited catalogs remain available offline.</p>
      <button onclick="location.reload()">Retry</button>
    </main>
  </body>
</html>
```

- [ ] **Step 2: Create the App Router offline page**

Create `src/app/offline/page.tsx`:

```tsx
export const dynamic = 'force-static';

export default function OfflinePage() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '32rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', margin: '0 0 0.75rem', fontWeight: 700 }}>
          You&apos;re offline
        </h1>
        <p style={{ margin: 0, lineHeight: 1.5, color: '#555' }}>
          This page isn&apos;t cached yet. Reconnect and try again — already-visited catalogs remain available offline.
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Write the service worker**

Create `public/sw.js`:

```js
/* eslint-disable no-restricted-globals */
/**
 * METRO Catalogs service worker.
 *
 * Strategies (see /sw-strategies.js → classifyRequest):
 *   - network-first        → HTML navigation requests
 *   - cache-first          → hashed Next.js chunks, ≤640w webp, manifest/icons
 *   - stale-while-revalidate → JSON content
 *   - network-only         → MP4, large webp, cross-origin
 *
 * Cache versioning: bump the values in CACHE_NAMES (sw-types.ts) to invalidate.
 */

importScripts('/sw-strategies.js');

const { classifyRequest } = self.__metroPwa;
const PRECACHE_URL = '/sw-precache.json';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const res = await fetch(PRECACHE_URL, { cache: 'no-cache' });
      if (!res.ok) {
        console.warn('[sw] precache manifest fetch failed', res.status);
        return;
      }
      const { urls } = await res.json();
      const cache = await caches.open('metro-shell-v1');
      // Allow partial failure — a single broken URL shouldn't abort install.
      await Promise.all(
        urls.map((u) =>
          cache.add(u).catch((err) => console.warn('[sw] precache skip', u, err.message)),
        ),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Drop any cache name not in the current allow-list.
      const allow = new Set(['metro-shell-v1', 'metro-json-v1', 'metro-images-v1', 'metro-static-v1']);
      const names = await caches.keys();
      await Promise.all(names.filter((n) => !allow.has(n)).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const classified = classifyRequest(request);

  switch (classified.strategy) {
    case 'network-only':
      return; // let the browser handle it normally
    case 'network-first':
      event.respondWith(networkFirst(request, classified.cacheName));
      return;
    case 'cache-first':
      event.respondWith(cacheFirst(request, classified.cacheName));
      return;
    case 'stale-while-revalidate':
      event.respondWith(staleWhileRevalidate(request, classified.cacheName));
      return;
  }
});

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const offline = await cache.match(OFFLINE_URL);
    return offline ?? new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => undefined);
  return cached ?? (await network) ?? new Response('Offline', { status: 503 });
}
```

- [ ] **Step 4: Commit**

```bash
git add public/sw.js public/offline.html src/app/offline/page.tsx
git commit -m "feat(pwa): vanilla service worker with offline fallback page"
```

---

## Task 6: Register the Service Worker From the Client

**Files:**
- Create: `src/components/pwa/ServiceWorkerRegister.tsx`
- Modify: `src/app/layout.tsx` (add the component)
- Modify: `next.config.ts` (add headers for `/sw.js`)

The SW must be registered after `load` so it doesn't compete with critical-path traffic. It also needs `Cache-Control: no-cache` on the SW file itself (otherwise browsers cache the SW and you can't ship updates).

- [ ] **Step 1: Write the register component**

Create `src/components/pwa/ServiceWorkerRegister.tsx`:

```tsx
'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;

    const onLoad = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((err) => console.warn('[pwa] SW register failed', err));
    };

    if (document.readyState === 'complete') {
      onLoad();
    } else {
      window.addEventListener('load', onLoad, { once: true });
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);

  return null;
}
```

- [ ] **Step 2: Mount it in the root layout**

Edit `src/app/layout.tsx`:

Add import after the `Providers` import:

```ts
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';
```

Inside the `<body>` JSX, add `<ServiceWorkerRegister />` between `<Providers>{children}</Providers>` and `<SpeedInsights />`:

```tsx
<body>
  <Providers>{children}</Providers>
  <ServiceWorkerRegister />
  <SpeedInsights />
  <Analytics />
</body>
```

- [ ] **Step 3: Add headers in `next.config.ts`**

Edit `next.config.ts` — extend the existing `headers()` return array. Replace:

```ts
    async headers() {
      return [
        {
          source: '/',
          headers: [
            {
              key: 'Link',
              value: HOMEPAGE_AGENT_LINKS,
            },
          ],
        },
      ];
    },
```

with:

```ts
    async headers() {
      return [
        {
          source: '/',
          headers: [
            {
              key: 'Link',
              value: HOMEPAGE_AGENT_LINKS,
            },
          ],
        },
        {
          source: '/sw.js',
          headers: [
            { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
            { key: 'Service-Worker-Allowed', value: '/' },
            { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          ],
        },
        {
          source: '/sw-strategies.js',
          headers: [
            { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          ],
        },
        {
          source: '/sw-precache.json',
          headers: [
            { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          ],
        },
      ];
    },
```

- [ ] **Step 4: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: PASS, 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/pwa/ src/app/layout.tsx next.config.ts
git commit -m "feat(pwa): register service worker with no-cache headers"
```

---

## Task 7: Manual End-to-End Verification

**Files:** (no code changes — verification only)

The SW only runs in production builds (Task 6 step 1 gates on `NODE_ENV === 'production'`). Verification therefore uses `npm run build && npm run start`.

- [ ] **Step 1: Build and start the production server**

Run: `npm run build && npm run start`
Expected: server listening on http://localhost:3000

- [ ] **Step 2: Verify the SW registers**

In Chrome/Edge:
1. Open http://localhost:3000
2. DevTools → Application → Service Workers
3. Expected: `sw.js` listed as "activated and running", scope `http://localhost:3000/`

If it doesn't register, check Console for `[pwa] SW register failed` and inspect `Network → sw.js` response headers.

- [ ] **Step 3: Verify precache populated**

DevTools → Application → Cache Storage → `metro-shell-v1`
Expected: contains `/`, `/offline.html`, `/site.webmanifest`, icons, at least one nav webp variant.

- [ ] **Step 4: Verify installability**

Lighthouse (DevTools → Lighthouse → "Progressive Web App" category) → Generate report.
Expected: PWA installability checks pass (`Installable manifest`, `Registers a service worker`, `Splash screen`, `Themed address bar`).

If any fail, the report cites the missing field — fix in `public/site.webmanifest` and rebuild.

- [ ] **Step 5: Verify MP4s bypass cache**

1. Open a catalog with videos (e.g. http://localhost:3000/catalog/QX)
2. DevTools → Network, filter `mp4`
3. Reload
4. Expected: MP4s show as `(network)` not `(ServiceWorker)`. Cache Storage → `metro-images-v1` contains zero `.mp4` entries.

- [ ] **Step 6: Verify offline behavior**

1. DevTools → Network → throttling → "Offline"
2. Reload an already-visited catalog page → loads from cache.
3. Navigate to an unvisited catalog → shows `/offline.html` fallback.

- [ ] **Step 7: Verify nothing broke in Lighthouse Performance**

Re-run Lighthouse on http://localhost:3000 with categories Performance + PWA.
Expected: Performance score within ±3 points of pre-PWA baseline (record both numbers in commit message if it regresses by more).

- [ ] **Step 8: Commit verification notes (no code, but document for posterity)**

If everything passes, no commit needed for this task — but record in the PR description:
```
Verified locally:
- SW registers and activates ✓
- Precache populates (N URLs) ✓
- Lighthouse PWA: installable ✓
- MP4s bypass SW cache ✓
- Offline fallback works ✓
- Performance score: <before> → <after>
```

If anything failed, file the regression as a follow-up commit before declaring Task 7 done.

---

## Task 8 (OPTIONAL): Generate Low-Bitrate MP4 Variants

**Files:**
- Create: `scripts/generate-mp4-lowres.mjs`
- Modify: `package.json` (add `mp4:lowres` script)

**Skip this task if reviewer rejects the additional ~70 MB build artifacts.** Tasks 1–7 give a working PWA without it; this task only reduces bandwidth for users on `prefers-reduced-data` or slow connections.

The existing MP4s are 1000×1000, libx264 CRF 23, 6-7 MB each. We generate a sibling `*-lo.mp4` at 500×500, CRF 30, same `-an -movflags +faststart` flags — landing around 1-1.5 MB each.

- [ ] **Step 1: Write the generation script**

Create `scripts/generate-mp4-lowres.mjs`:

```js
#!/usr/bin/env node
/**
 * Generates *-lo.mp4 low-bitrate siblings of every MP4 in public/catalogs/.
 * Target: 500x500, libx264 CRF 30, faststart, no audio.
 * Skips files where the -lo sibling already exists and is newer than the source.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { extname, join, parse } from 'node:path';

const ROOT = 'public/catalogs';

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.isFile() && extname(p) === '.mp4' && !entry.name.endsWith('-lo.mp4')) out.push(p);
  }
  return out;
}

function loSibling(srcPath) {
  const { dir, name } = parse(srcPath);
  return join(dir, `${name}-lo.mp4`);
}

function needsRebuild(src, dst) {
  try {
    const s = statSync(src);
    const d = statSync(dst);
    return s.mtimeMs > d.mtimeMs;
  } catch {
    return true; // dst missing
  }
}

function transcode(src, dst) {
  console.log(`[mp4:lowres] ${src} → ${dst}`);
  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-i', src,
      '-vf', 'scale=500:500:force_original_aspect_ratio=decrease,pad=500:500:(ow-iw)/2:(oh-ih)/2:color=white',
      '-c:v', 'libx264',
      '-preset', 'slow',
      '-crf', '30',
      '-an',
      '-movflags', '+faststart',
      dst,
    ],
    { stdio: 'inherit' },
  );
}

const force = process.argv.includes('--force');
const sources = walk(ROOT);
let built = 0;
for (const src of sources) {
  const dst = loSibling(src);
  if (!force && !needsRebuild(src, dst)) continue;
  transcode(src, dst);
  built++;
}
console.log(`[mp4:lowres] done — ${built} variant(s) (re)built, ${sources.length - built} up-to-date`);
```

- [ ] **Step 2: Wire it into npm scripts**

Edit `package.json` `"scripts"`:

Add: `"mp4:lowres": "node scripts/generate-mp4-lowres.mjs"`
Add: `"mp4:lowres:force": "node scripts/generate-mp4-lowres.mjs --force"`

(Do **not** add this to `prebuild` — it's expensive and the outputs are committed to git just like the master MP4s.)

- [ ] **Step 3: Verify ffmpeg is installed**

Run: `ffmpeg -version | head -1`
Expected: `ffmpeg version 6.x.x` or newer.
If missing: `brew install ffmpeg` (macOS).

- [ ] **Step 4: Dry-run on a single catalog to validate the pipeline**

Run on one file to sanity-check before processing all 51:
```bash
ffmpeg -y -i public/catalogs/MRC800/features/$(ls public/catalogs/MRC800/features/*.mp4 | head -1 | xargs basename) \
  -vf 'scale=500:500:force_original_aspect_ratio=decrease,pad=500:500:(ow-iw)/2:(oh-ih)/2:color=white' \
  -c:v libx264 -preset slow -crf 30 -an -movflags +faststart \
  /tmp/test-lo.mp4 && du -h /tmp/test-lo.mp4 && rm /tmp/test-lo.mp4
```
Expected: completes without error, output file is ~1-1.5 MB.

- [ ] **Step 5: Generate all variants**

Run: `npm run mp4:lowres`
Expected output (last line): `[mp4:lowres] done — 51 variant(s) (re)built, 0 up-to-date`
Expected disk impact: `du -sh public/catalogs/` grows by ~70 MB.

- [ ] **Step 6: Commit the script + the variants**

```bash
git add scripts/generate-mp4-lowres.mjs package.json public/catalogs/**/*-lo.mp4
git commit -m "feat(pwa): generate low-bitrate MP4 variants for reduced-data users"
```

---

## Task 9 (OPTIONAL — depends on Task 8): Use `-lo.mp4` for `prefers-reduced-data`

**Files:**
- Modify: `src/layouts/qx/FeaturesQX.tsx:26-50` (the `FeatureVideo` component)
- Modify: `src/layouts/mrc800/FeaturesMRC800.tsx` (same pattern as QX — locate the `<video src=...>` site)
- Modify: `src/layouts/mrc1000/FeaturesMRC1000.tsx` (same)

Each layout currently renders `<video src={video.src}>`. We swap that to a `<video><source>` form with the `-lo` variant first when `media="(prefers-reduced-data: reduce)"`. The browser picks the first matching `<source>`.

Important: `<video>` doesn't natively support `<source media="...">` selection across all browsers as cleanly as `<picture>` does for images. The reliable pattern is to compute the chosen src in a `useEffect` that reads `matchMedia('(prefers-reduced-data: reduce)')` and falls back to the original src.

- [ ] **Step 1: Write a small helper**

Create `src/lib/pwa/prefers-reduced-data.ts`:

```ts
'use client';

import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-data: reduce)';

export function usePrefersReducedData(): boolean {
  const [v, setV] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(QUERY);
    setV(mql.matches);
    const handler = (e: MediaQueryListEvent) => setV(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return v;
}

export function toLowRes(src: string): string {
  // "/catalogs/QX/features/QX_extend.mp4" → "/catalogs/QX/features/QX_extend-lo.mp4"
  return src.replace(/\.mp4(\?.*)?$/, '-lo.mp4$1');
}
```

- [ ] **Step 2: Update `FeatureVideo` in `FeaturesQX.tsx`**

Open `src/layouts/qx/FeaturesQX.tsx` and locate the `FeatureVideo` function (around line 26-50). Inside that component, add at the top of the function body:

```tsx
import { toLowRes, usePrefersReducedData } from '@/lib/pwa/prefers-reduced-data';
```

(Place this with the other imports at the top of the file, not inside the function.)

Inside `FeatureVideo`, before the `return`:

```tsx
const reducedData = usePrefersReducedData();
const effectiveSrc = video && reducedData ? toLowRes(video.src) : video?.src;
```

Replace the `<video ... src={video.src} ...>` JSX attribute with `src={effectiveSrc}`.

- [ ] **Step 3: Apply the same change to the two MRC layouts**

Repeat Step 2 in:
- `src/layouts/mrc800/FeaturesMRC800.tsx`
- `src/layouts/mrc1000/FeaturesMRC1000.tsx`

Each file has the same `<video src={...}>` pattern; mirror the QX change exactly.

- [ ] **Step 4: Add a unit test for `toLowRes`**

Create `src/lib/pwa/__tests__/prefers-reduced-data.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { toLowRes } from '../prefers-reduced-data';

describe('toLowRes', () => {
  it('inserts -lo before the .mp4 extension', () => {
    expect(toLowRes('/catalogs/QX/features/QX_extend.mp4')).toBe(
      '/catalogs/QX/features/QX_extend-lo.mp4',
    );
  });

  it('preserves a trailing query string', () => {
    expect(toLowRes('/catalogs/QX/foo.mp4?v=2')).toBe('/catalogs/QX/foo-lo.mp4?v=2');
  });

  it('leaves non-mp4 URLs unchanged', () => {
    expect(toLowRes('/catalogs/QX/hero.webp')).toBe('/catalogs/QX/hero.webp');
  });
});
```

- [ ] **Step 5: Run typecheck, lint, and tests**

Run: `npm run typecheck && npm run lint && npx vitest run src/lib/pwa/`
Expected: all PASS.

- [ ] **Step 6: Manual verification of the reduced-data path**

1. `npm run build && npm run start`
2. Open Chrome DevTools → Rendering panel → "Emulate CSS media feature prefers-reduced-data" → "reduce"
3. Visit `/catalog/QX`
4. DevTools → Network → filter `mp4`
5. Expected: requests target `*-lo.mp4`, not the master files.
6. Toggle the emulation off and reload → expected: master `*.mp4` URLs return.

- [ ] **Step 7: Commit**

```bash
git add src/lib/pwa/prefers-reduced-data.ts \
        src/lib/pwa/__tests__/prefers-reduced-data.test.ts \
        src/layouts/qx/FeaturesQX.tsx \
        src/layouts/mrc800/FeaturesMRC800.tsx \
        src/layouts/mrc1000/FeaturesMRC1000.tsx
git commit -m "feat(pwa): serve -lo.mp4 to clients with prefers-reduced-data"
```

---

## Task 10: Final Wrap-Up

**Files:** (no code)

- [ ] **Step 1: Update `MEMORY.md` or add a project memory**

If the user maintains memory: add a short project note that `public/sw.js`, `public/sw-strategies.js`, and `public/sw-precache.json` are generated artifacts that must not be hand-edited, and that the SW only registers in production builds.

- [ ] **Step 2: Run the full quality gate**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: all PASS, build emits SW assets in `.next-build/` (or wherever `distDir` resolves).

- [ ] **Step 3: Deploy preview and re-verify on Vercel**

Run: `npm run deploy:preview`
Then on the preview URL:
- Lighthouse PWA → installable
- Open in incognito → install prompt should appear in Chrome's URL bar
- Toggle offline in DevTools → already-visited pages still load

- [ ] **Step 4: Open PR**

Use `gh pr create` with a body that includes the verification notes from Task 7 Step 8.

---

## Notes for the Engineer Executing This Plan

- **`prefers-reduced-data` browser support** is partial (Chrome behind a flag in some channels). The fallback is the master MP4 — that's fine, it's how things work today. Don't try to "improve" by also keying on `navigator.connection.effectiveType` unless explicitly asked; that API is being deprecated.
- **Don't add `next-pwa` or `workbox-*` packages.** The whole point of this plan is a small, owned, debuggable SW. If a future need demands Workbox, that's a separate decision.
- **Cache versioning:** the `CACHE_NAMES` constants in `sw-types.ts` end in `-v1`. To force-invalidate a cache after shipping a behavior change, bump to `-v2`. The `activate` handler in `sw.js` will purge unknown names automatically.
- **Don't precache catalog gallery webp variants** — they're 71 MB total and most users only visit 1-2 catalogs. The hero/thumbnail variants for nav-level tiles are precached (so the home page works offline); per-catalog deep assets are populated on first visit via the `cache-first` strategy.
- **The MP4 `network-only` classification is load-bearing.** Don't "improve" it to cache-first. iOS Safari quota is ~50-1000 MB depending on free space; caching even 5 MP4s would risk eviction of the whole cache including the shell.
