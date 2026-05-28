# SEO + Structured Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every homepage and `/catalog/[catalogId]` page production-grade indexable: rich metadata (title/description/canonical/OG/Twitter) and JSON-LD structured data (`Organization`, `WebSite`, `CollectionPage`, `BreadcrumbList`) so the site is eligible for rich results in Google.

**Architecture:** A single `src/lib/seo.ts` module produces canonical URLs and typed JSON-LD payloads. A tiny server component `<JsonLd>` injects `application/ld+json` scripts safely. The homepage emits `Organization` + `WebSite`; each catalog page emits `CollectionPage` + `BreadcrumbList` and gains a fuller `generateMetadata` (description, canonical, OG with image, Twitter card). The sitemap upgrades `lastModified` to use real file mtime from `config.json`. No new runtime dependencies.

**Tech Stack:** Next.js 15.5 App Router, React 19, TypeScript 5.9, Vitest + @testing-library/react, existing `getSiteUrl()` helper, existing `loadCatalog`/`getCatalogList`/`getGlobalConfig` from `src/lib/catalog-loader.ts`.

**Working directory:** Per user convention, work directly on `main`. Stage only the files each task touches (`git add <paths>`, never `-A`).

**Source-of-truth rules (carry through every task):**
- Use ONLY fields present in `meta` (`title`, `tagline`, `description`, `brandName`, `collectionName`) or `hero.heroImage`. Never invent SKUs, prices, GTINs, founding dates, etc.
- Per-catalog OG image: `/catalogs/{ID}/thumbs/{id}-home.webp` (lowercased id) — already exists, confirmed for FM.
- Keep `<html lang="en">` — catalog copy is English.

---

## Documentation maintenance (mandatory)

The handover binder at `docs/odbior-2026-05-29/` is part of the delivery to the contracting party and **must stay in sync** with the codebase. Any change introduced by this plan that touches the runtime SEO surface (metadata, sitemap, robots, JSON-LD) requires an update in the binder. Task 9 below is non-optional.

### "Above the required standard" marking convention

The procurement spec (`docs/odbior-2026-05-29/ZAŁĄCZNIK_2_PARAMETRYZACJA.md`) defines the baseline scope. Anything we ship beyond that baseline — proprietary design system, custom PDF pipeline, JSON-LD structured data, per-catalog OG/Twitter cards — must be **clearly and consistently** marked as "ponad wymagany standard". The handover currently has no such marker; this plan introduces one and applies it.

Single project-wide convention to be used from now on (HTML binder):

```html
<span class="badge plus">PONAD WYMAGANY STANDARD</span>
```

For section-level highlights (when a whole subsection describes above-standard work):

```html
<div class="callout plus">
  <strong>Realizacja ponad wymagany standard.</strong>
  <p>… one-sentence justification …</p>
</div>
```

For markdown documents:

```markdown
> **PONAD WYMAGANY STANDARD** — one-sentence justification.
```

The class `.badge.plus` / `.callout.plus` is added in Task 9, Step 1 (CSS) and then applied to existing above-standard sections (design system, PDF pipeline) plus the new SEO/JSON-LD additions, so the convention lands consistently across the binder — not just on the new work.

---

## File Structure

**New files:**
- `src/lib/seo.ts` — URL + JSON-LD builders (pure functions)
- `src/lib/seo.test.ts` — unit tests for builders
- `src/components/seo/JsonLd.tsx` — server component, injects `<script type="application/ld+json">`
- `src/components/seo/JsonLd.test.tsx` — DOM test for the component

**Modified files (code):**
- `src/app/page.tsx` — add `Organization` + `WebSite` JSON-LD, expand `description`/OG/Twitter
- `src/app/page.test.tsx` — add assertions for new JSON-LD scripts
- `src/app/catalog/[catalogId]/page.tsx` — expand `generateMetadata`, render `<JsonLd>` (CollectionPage + BreadcrumbList)
- `src/app/catalog/[catalogId]/page.test.tsx` — NEW (sibling), tests for `generateMetadata` + JSON-LD presence
- `src/app/layout.tsx` — add Twitter card defaults at root level
- `src/app/sitemap.ts` — read `config.json` mtime for `lastModified`
- `src/app/sitemap.test.ts` — update tests for mtime behaviour

**Modified files (handover binder — Task 8):**
- `docs/odbior-2026-05-29/dokumentacja.html` — update section 11 ("API i SEO") to current state; add `<style>` rules for `.badge.plus` / `.callout.plus`; tag JSON-LD/OG/Twitter additions as `PONAD WYMAGANY STANDARD`
- `docs/odbior-2026-05-29/odbior-koncowy.html` — add the same CSS rules; retrofit existing above-standard sections (9 — design system, 10 — PDF pipeline) with the new badge; add a new subsection 10.6 describing JSON-LD as above standard; **delete section 14.2 ("Dokumenty pomocnicze")** with its orphan references (intro paragraph of section 14 and the closing "Pakiet do przekazania" callout are trimmed accordingly)
- `docs/odbior-2026-05-29/README.md` — add one line to the changelog noting the SEO update and the new marking convention; **delete section 3 ("Dokumenty pomocnicze") + renumber sections 4-7 → 3-6** and fix the cross-reference in "Kolejność czytania"

---

### Task 1: SEO helper module — pure builders

**Files:**
- Create: `src/lib/seo.ts`
- Test: `src/lib/seo.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/seo.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/site-url', () => ({
  getSiteUrl: () => 'https://catalogs.metro.example',
}));

import {
  absoluteUrl,
  catalogCanonicalPath,
  catalogOgImagePath,
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
  buildCatalogCollectionJsonLd,
  buildBreadcrumbJsonLd,
} from './seo';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('absoluteUrl', () => {
  it('prefixes a path with the site URL', () => {
    expect(absoluteUrl('/catalog/FM')).toBe(
      'https://catalogs.metro.example/catalog/FM',
    );
  });

  it('collapses a leading double slash', () => {
    expect(absoluteUrl('//catalog/FM')).toBe(
      'https://catalogs.metro.example/catalog/FM',
    );
  });

  it('returns the site URL itself for "/"', () => {
    expect(absoluteUrl('/')).toBe('https://catalogs.metro.example/');
  });
});

describe('catalogCanonicalPath', () => {
  it('returns /catalog/<id>', () => {
    expect(catalogCanonicalPath('FM')).toBe('/catalog/FM');
  });
});

describe('catalogOgImagePath', () => {
  it('returns the lowercased home thumb path', () => {
    expect(catalogOgImagePath('FM')).toBe(
      '/catalogs/FM/thumbs/fm-home.webp',
    );
  });

  it('preserves the original id casing in the directory', () => {
    expect(catalogOgImagePath('MRC1000')).toBe(
      '/catalogs/MRC1000/thumbs/mrc1000-home.webp',
    );
  });
});

describe('buildOrganizationJsonLd', () => {
  it('returns a schema.org Organization with name and absolute url', () => {
    const ld = buildOrganizationJsonLd({ brandName: 'METRO' });
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('Organization');
    expect(ld.name).toBe('METRO');
    expect(ld.url).toBe('https://catalogs.metro.example/');
  });
});

describe('buildWebSiteJsonLd', () => {
  it('returns a schema.org WebSite with name and url', () => {
    const ld = buildWebSiteJsonLd({ siteTitle: 'METRO – Catalogs' });
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('WebSite');
    expect(ld.name).toBe('METRO – Catalogs');
    expect(ld.url).toBe('https://catalogs.metro.example/');
  });
});

describe('buildCatalogCollectionJsonLd', () => {
  it('returns a CollectionPage with name, description, url, image, isPartOf', () => {
    const ld = buildCatalogCollectionJsonLd({
      catalogId: 'FM',
      meta: {
        title: 'METRO FM',
        tagline: 'modern office desk system',
        description: 'FM - Modular desk system engineered for the modern workspace.',
        brandName: 'METRO FM',
        collectionName: 'FM',
      },
      imagePath: '/catalogs/FM/thumbs/fm-home.webp',
    });
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('CollectionPage');
    expect(ld.name).toBe('METRO FM — modern office desk system');
    expect(ld.description).toBe(
      'FM - Modular desk system engineered for the modern workspace.',
    );
    expect(ld.url).toBe('https://catalogs.metro.example/catalog/FM');
    expect(ld.image).toBe(
      'https://catalogs.metro.example/catalogs/FM/thumbs/fm-home.webp',
    );
    expect(ld.isPartOf).toMatchObject({
      '@type': 'WebSite',
      url: 'https://catalogs.metro.example/',
    });
    expect(ld.about).toMatchObject({
      '@type': 'ProductGroup',
      name: 'FM',
      brand: { '@type': 'Brand', name: 'METRO FM' },
    });
  });

  it('omits the dash separator when tagline is missing', () => {
    const ld = buildCatalogCollectionJsonLd({
      catalogId: 'TS',
      meta: {
        title: 'METRO TS',
        description: 'TS description.',
        brandName: 'METRO TS',
        collectionName: 'TS',
      },
      imagePath: '/catalogs/TS/thumbs/ts-home.webp',
    });
    expect(ld.name).toBe('METRO TS');
  });
});

describe('buildBreadcrumbJsonLd', () => {
  it('emits an ordered BreadcrumbList with absolute item URLs', () => {
    const ld = buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'METRO FM', path: '/catalog/FM' },
    ]);
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('BreadcrumbList');
    expect(ld.itemListElement).toHaveLength(2);
    expect(ld.itemListElement[0]).toMatchObject({
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://catalogs.metro.example/',
    });
    expect(ld.itemListElement[1]).toMatchObject({
      '@type': 'ListItem',
      position: 2,
      name: 'METRO FM',
      item: 'https://catalogs.metro.example/catalog/FM',
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/seo.test.ts`
Expected: FAIL with "Cannot find module './seo'".

- [ ] **Step 3: Implement the module**

Create `src/lib/seo.ts`:

```ts
import { getSiteUrl } from '@/lib/site-url';

export function absoluteUrl(pathname: string): string {
  const base = getSiteUrl();
  const normalised = pathname.replace(/^\/+/, '/');
  if (normalised === '/') return `${base}/`;
  return `${base}${normalised}`;
}

export function catalogCanonicalPath(catalogId: string): string {
  return `/catalog/${catalogId}`;
}

export function catalogOgImagePath(catalogId: string): string {
  return `/catalogs/${catalogId}/thumbs/${catalogId.toLowerCase()}-home.webp`;
}

interface OrganizationLdInput {
  brandName: string;
}

export function buildOrganizationJsonLd(input: OrganizationLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization' as const,
    name: input.brandName,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/android-chrome-512x512.png'),
  };
}

interface WebSiteLdInput {
  siteTitle: string;
}

export function buildWebSiteJsonLd(input: WebSiteLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite' as const,
    name: input.siteTitle,
    url: absoluteUrl('/'),
  };
}

interface CatalogMetaLite {
  title: string;
  tagline?: string;
  description: string;
  brandName: string;
  collectionName: string;
}

interface CatalogCollectionLdInput {
  catalogId: string;
  meta: CatalogMetaLite;
  imagePath: string;
}

export function buildCatalogCollectionJsonLd(input: CatalogCollectionLdInput) {
  const { catalogId, meta, imagePath } = input;
  const name = meta.tagline ? `${meta.title} — ${meta.tagline}` : meta.title;
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage' as const,
    name,
    description: meta.description,
    url: absoluteUrl(catalogCanonicalPath(catalogId)),
    image: absoluteUrl(imagePath),
    inLanguage: 'en',
    isPartOf: {
      '@type': 'WebSite' as const,
      url: absoluteUrl('/'),
    },
    about: {
      '@type': 'ProductGroup' as const,
      name: meta.collectionName,
      brand: {
        '@type': 'Brand' as const,
        name: meta.brandName,
      },
    },
  };
}

interface BreadcrumbInput {
  name: string;
  path: string;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbInput[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList' as const,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem' as const,
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/seo.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/seo.ts src/lib/seo.test.ts
git commit -m "feat(seo): add seo helper module with json-ld builders"
```

---

### Task 2: `<JsonLd>` server component

**Files:**
- Create: `src/components/seo/JsonLd.tsx`
- Test: `src/components/seo/JsonLd.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/seo/JsonLd.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { JsonLd } from './JsonLd';

describe('JsonLd', () => {
  it('renders a script tag with application/ld+json type', () => {
    const { container } = render(<JsonLd data={{ '@type': 'Organization' }} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
  });

  it('serialises the payload as JSON', () => {
    const { container } = render(
      <JsonLd data={{ '@type': 'Organization', name: 'METRO' }} />,
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script?.innerHTML).toContain('"@type":"Organization"');
    expect(script?.innerHTML).toContain('"name":"METRO"');
  });

  it('escapes a closing script tag inside string values', () => {
    const { container } = render(
      <JsonLd data={{ '@type': 'WebSite', name: 'evil</script><x>' }} />,
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    // The literal sequence "</script" must NOT appear; the "<" gets escaped.
    expect(script?.innerHTML).not.toContain('</script');
    expect(script?.innerHTML).toContain('\\u003c/script');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/seo/JsonLd.test.tsx`
Expected: FAIL with "Cannot find module './JsonLd'".

- [ ] **Step 3: Implement the component**

Create `src/components/seo/JsonLd.tsx`:

```tsx
interface JsonLdProps {
  data: object;
}

export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/seo/JsonLd.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/seo/JsonLd.tsx src/components/seo/JsonLd.test.tsx
git commit -m "feat(seo): add JsonLd server component for ld+json injection"
```

---

### Task 3: Root layout — add Twitter card defaults

**Files:**
- Modify: `src/app/layout.tsx` (the `metadata` export, lines ~17-40)

- [ ] **Step 1: Edit the metadata export**

In `src/app/layout.tsx`, replace the existing `export const metadata: Metadata = { ... }` block with:

```tsx
export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: 'METRO – Catalogs',
  description:
    'METRO product catalogs. QX, QS, TS, VR, FM desk systems. FOTA conference furniture. MRC reception desks.',
  authors: [{ name: 'METRO' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'METRO – Catalogs',
    description: 'Product catalogs – browse by collection',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'METRO – Catalogs',
    description: 'Product catalogs – browse by collection',
  },
};
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: exit code 0, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(seo): add twitter card defaults to root metadata"
```

---

### Task 4: Homepage — JSON-LD + richer metadata

**Files:**
- Modify: `src/app/page.tsx` (the `metadata` export ~line 117-130, and the `HomePage` JSX root ~line 132)
- Modify: `src/app/page.test.tsx`

- [ ] **Step 1: Write the failing test additions**

Open `src/app/page.test.tsx`. Find any existing `describe('HomePage', ...)` block. Add the following test cases inside it (preserve other tests):

```tsx
import { JsonLd } from '@/components/seo/JsonLd';

it('renders Organization JSON-LD on the homepage', async () => {
  const ui = await HomePage();
  const { container } = render(ui);
  const scripts = container.querySelectorAll(
    'script[type="application/ld+json"]',
  );
  const payloads = Array.from(scripts).map((s) => JSON.parse(s.innerHTML));
  expect(payloads.some((p) => p['@type'] === 'Organization')).toBe(true);
});

it('renders WebSite JSON-LD on the homepage', async () => {
  const ui = await HomePage();
  const { container } = render(ui);
  const scripts = container.querySelectorAll(
    'script[type="application/ld+json"]',
  );
  const payloads = Array.from(scripts).map((s) => JSON.parse(s.innerHTML));
  expect(payloads.some((p) => p['@type'] === 'WebSite')).toBe(true);
});
```

If `page.test.tsx` does not already import `HomePage`/`render`, add at top:

```tsx
import { render } from '@testing-library/react';
import HomePage from './page';
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/app/page.test.tsx`
Expected: FAIL — no `application/ld+json` scripts found.

- [ ] **Step 3: Update homepage metadata + inject JSON-LD**

In `src/app/page.tsx`:

1. Add these imports near the top (after the existing imports):

```tsx
import { JsonLd } from '@/components/seo/JsonLd';
import {
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from '@/lib/seo';
```

2. Replace the existing `export const metadata` block with:

```tsx
export const metadata: Metadata = {
  title: 'METRO – Catalogs',
  description:
    'Browse METRO office furniture catalogs: QX, QS, VR, TS, and FM desk systems, conference tables, and reception desks.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'METRO – Catalogs',
    description:
      'Browse METRO office furniture catalogs: QX, QS, VR, TS, and FM desk systems, conference tables, and reception desks.',
    url: '/',
    type: 'website',
    images: [{ url: '/banner.webp' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'METRO – Catalogs',
    description:
      'Browse METRO office furniture catalogs: QX, QS, VR, TS, and FM desk systems, conference tables, and reception desks.',
    images: ['/banner.webp'],
  },
};
```

3. Inside the `HomePage` function, immediately after the existing `const [catalogs, globalConfig] = await Promise.all([...])` destructure, add:

```tsx
const organizationLd = buildOrganizationJsonLd({
  brandName: globalConfig.brandName,
});
const websiteLd = buildWebSiteJsonLd({ siteTitle: globalConfig.siteTitle });
```

4. In the returned JSX, immediately inside the wrapping `<div className="catalog-qx0">` (BEFORE `<CatalogNav ... />`), insert:

```tsx
<JsonLd data={organizationLd} />
<JsonLd data={websiteLd} />
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/app/page.test.tsx`
Expected: PASS (existing + 2 new tests).

- [ ] **Step 5: Run typecheck**

Run: `npm run typecheck`
Expected: exit code 0.

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx src/app/page.test.tsx
git commit -m "feat(seo): emit Organization + WebSite json-ld and richer OG/Twitter on home"
```

---

### Task 5: Catalog page — expand `generateMetadata`

**Files:**
- Modify: `src/app/catalog/[catalogId]/page.tsx` (`generateMetadata`, currently lines ~47-60)
- Create: `src/app/catalog/[catalogId]/page.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/app/catalog/[catalogId]/page.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/site-url', () => ({
  getSiteUrl: () => 'https://catalogs.metro.example',
}));

vi.mock('@/lib/catalog-loader', () => ({
  loadCatalog: vi.fn(),
  getGlobalConfig: vi.fn(),
  getCatalogList: vi.fn(),
  getCatalogFooterEntries: vi.fn(),
}));

import { loadCatalog } from '@/lib/catalog-loader';
import { generateMetadata } from './page';

const fakeCatalog = {
  id: 'FM',
  meta: {
    title: 'METRO FM',
    tagline: 'modern office desk system',
    description: 'FM - Modular desk system engineered for the modern workspace.',
    brandName: 'METRO FM',
    collectionName: 'FM',
    layoutType: 'qx' as const,
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('catalog generateMetadata', () => {
  it('returns an empty object when the catalog is missing', async () => {
    vi.mocked(loadCatalog).mockResolvedValue(null as any);
    const meta = await generateMetadata({
      params: Promise.resolve({ catalogId: 'NOPE' }),
    });
    expect(meta).toEqual({});
  });

  it('uses "{title} — {tagline}" as the title', async () => {
    vi.mocked(loadCatalog).mockResolvedValue(fakeCatalog as any);
    const meta = await generateMetadata({
      params: Promise.resolve({ catalogId: 'FM' }),
    });
    expect(meta.title).toBe('METRO FM — modern office desk system');
  });

  it('sets description from catalog.meta.description', async () => {
    vi.mocked(loadCatalog).mockResolvedValue(fakeCatalog as any);
    const meta = await generateMetadata({
      params: Promise.resolve({ catalogId: 'FM' }),
    });
    expect(meta.description).toBe(
      'FM - Modular desk system engineered for the modern workspace.',
    );
  });

  it('sets the canonical URL to /catalog/<id>', async () => {
    vi.mocked(loadCatalog).mockResolvedValue(fakeCatalog as any);
    const meta = await generateMetadata({
      params: Promise.resolve({ catalogId: 'FM' }),
    });
    expect(meta.alternates?.canonical).toBe('/catalog/FM');
  });

  it('sets OpenGraph url, type, and per-catalog image', async () => {
    vi.mocked(loadCatalog).mockResolvedValue(fakeCatalog as any);
    const meta = await generateMetadata({
      params: Promise.resolve({ catalogId: 'FM' }),
    });
    expect(meta.openGraph?.url).toBe('/catalog/FM');
    expect(meta.openGraph?.type).toBe('website');
    const images = meta.openGraph?.images;
    expect(Array.isArray(images) ? images[0] : images).toMatchObject({
      url: '/catalogs/FM/thumbs/fm-home.webp',
    });
  });

  it('sets a summary_large_image Twitter card with the same image', async () => {
    vi.mocked(loadCatalog).mockResolvedValue(fakeCatalog as any);
    const meta = await generateMetadata({
      params: Promise.resolve({ catalogId: 'FM' }),
    });
    expect(meta.twitter?.card).toBe('summary_large_image');
    expect(meta.twitter?.images).toEqual([
      '/catalogs/FM/thumbs/fm-home.webp',
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/catalog/\[catalogId\]/page.test.tsx`
Expected: FAIL — title equals plain `"METRO FM — modern office desk system"` already (existing impl uses tagline) but the description/canonical/openGraph/twitter assertions fail because the current impl returns only `{ title }`.

- [ ] **Step 3: Expand `generateMetadata`**

In `src/app/catalog/[catalogId]/page.tsx`, replace the existing `generateMetadata` function with:

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ catalogId: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const catalog = await loadCatalog(resolvedParams.catalogId);
  if (!catalog) return {};

  const { title, tagline, description } = catalog.meta;
  const fullTitle = tagline ? `${title} — ${tagline}` : title;
  const canonical = catalogCanonicalPath(resolvedParams.catalogId);
  const ogImage = catalogOgImagePath(resolvedParams.catalogId);

  return {
    title: fullTitle,
    description,
    alternates: { canonical },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      type: 'website',
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}
```

Add these imports near the top of the file (alongside existing imports from `@/lib/...`):

```tsx
import { catalogCanonicalPath, catalogOgImagePath } from '@/lib/seo';
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/app/catalog/\[catalogId\]/page.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 5: Run typecheck**

Run: `npm run typecheck`
Expected: exit code 0.

- [ ] **Step 6: Commit**

```bash
git add src/app/catalog/\[catalogId\]/page.tsx src/app/catalog/\[catalogId\]/page.test.tsx
git commit -m "feat(seo): expand catalog generateMetadata with description, canonical, OG, twitter"
```

---

### Task 6: Catalog page — render `CollectionPage` + `BreadcrumbList` JSON-LD

**Files:**
- Modify: `src/app/catalog/[catalogId]/page.tsx` (the default-export `CatalogPage` JSX return, currently ends with `<LayoutComponent ... />`)
- Modify: `src/app/catalog/[catalogId]/page.test.tsx` (add render-side assertions)

- [ ] **Step 1: Add failing tests**

Append to `src/app/catalog/[catalogId]/page.test.tsx` (after the existing `describe('catalog generateMetadata', ...)`):

```tsx
import { render } from '@testing-library/react';
import {
  getGlobalConfig,
  getCatalogFooterEntries,
} from '@/lib/catalog-loader';
import CatalogPage from './page';

const minimalCatalog = {
  id: 'FM',
  meta: fakeCatalog.meta,
  hero: { heroImage: 'hero.webp' },
  overview: {},
  gallery: { images: [] },
  finishes: {},
  dimensions: {},
  materials: {},
  features: {},
  gettingStarted: {},
  productCodes: {},
};

describe('CatalogPage JSON-LD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadCatalog).mockResolvedValue(minimalCatalog as any);
    vi.mocked(getGlobalConfig).mockResolvedValue({
      brandName: 'METRO',
      siteTitle: 'METRO – Catalogs',
      siteSubtitle: '',
      footerText: '',
      catalogListTitle: '',
    } as any);
    vi.mocked(getCatalogFooterEntries).mockResolvedValue([] as any);
  });

  it('renders a CollectionPage script and a BreadcrumbList script', async () => {
    const ui = await CatalogPage({
      params: Promise.resolve({ catalogId: 'FM' }),
    });
    const { container } = render(ui);
    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    const payloads = Array.from(scripts).map((s) => JSON.parse(s.innerHTML));
    expect(payloads.some((p) => p['@type'] === 'CollectionPage')).toBe(true);
    expect(payloads.some((p) => p['@type'] === 'BreadcrumbList')).toBe(true);
  });

  it('the breadcrumb lists Home then the catalog title', async () => {
    const ui = await CatalogPage({
      params: Promise.resolve({ catalogId: 'FM' }),
    });
    const { container } = render(ui);
    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    const breadcrumb = Array.from(scripts)
      .map((s) => JSON.parse(s.innerHTML))
      .find((p) => p['@type'] === 'BreadcrumbList');
    expect(breadcrumb.itemListElement).toHaveLength(2);
    expect(breadcrumb.itemListElement[0].name).toBe('Home');
    expect(breadcrumb.itemListElement[1].name).toBe('METRO FM');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/app/catalog/\[catalogId\]/page.test.tsx`
Expected: FAIL — no `ld+json` scripts emitted from `CatalogPage`.

- [ ] **Step 3: Inject the JSON-LD in `CatalogPage`**

In `src/app/catalog/[catalogId]/page.tsx`:

1. Extend imports:

```tsx
import { JsonLd } from '@/components/seo/JsonLd';
import {
  catalogCanonicalPath,
  catalogOgImagePath,
  buildCatalogCollectionJsonLd,
  buildBreadcrumbJsonLd,
} from '@/lib/seo';
```

(If `catalogCanonicalPath`/`catalogOgImagePath` were already imported in Task 5, merge into the same import line.)

2. Inside the default-exported `CatalogPage`, AFTER the `if (!catalog) notFound();` line and BEFORE the `const firstHeroSrc = ...` line, add:

```tsx
const collectionLd = buildCatalogCollectionJsonLd({
  catalogId: resolvedParams.catalogId,
  meta: catalog.meta,
  imagePath: catalogOgImagePath(resolvedParams.catalogId),
});
const breadcrumbLd = buildBreadcrumbJsonLd([
  { name: 'Home', path: '/' },
  {
    name: catalog.meta.title,
    path: catalogCanonicalPath(resolvedParams.catalogId),
  },
]);
```

3. Wrap the existing return in a fragment so the JSON-LD scripts sit alongside `<LayoutComponent>`:

```tsx
return (
  <>
    <JsonLd data={collectionLd} />
    <JsonLd data={breadcrumbLd} />
    <LayoutComponent
      catalog={catalog}
      globalConfig={globalConfig}
      footerEntries={footerEntries}
    />
  </>
);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/app/catalog/\[catalogId\]/page.test.tsx`
Expected: PASS (all 8 tests in the file).

- [ ] **Step 5: Run typecheck**

Run: `npm run typecheck`
Expected: exit code 0.

- [ ] **Step 6: Commit**

```bash
git add src/app/catalog/\[catalogId\]/page.tsx src/app/catalog/\[catalogId\]/page.test.tsx
git commit -m "feat(seo): emit CollectionPage + BreadcrumbList json-ld on catalog pages"
```

---

### Task 7: Sitemap — `lastModified` from real file mtime

**Files:**
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/sitemap.test.ts`

- [ ] **Step 1: Update the test**

Replace the contents of `src/app/sitemap.test.ts` with:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/site-url', () => ({
  getSiteUrl: () => 'https://test.metro.example',
}));

vi.mock('@/lib/catalog-loader', () => ({
  getCatalogList: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
  default: { stat: vi.fn() },
  stat: vi.fn(),
}));

import fs from 'node:fs/promises';
import { getCatalogList } from '@/lib/catalog-loader';
import sitemap from './sitemap';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('sitemap', () => {
  it('always includes the homepage', async () => {
    vi.mocked(getCatalogList).mockResolvedValue([]);
    const entries = await sitemap();
    expect(entries[0]).toMatchObject({
      url: 'https://test.metro.example/',
      changeFrequency: 'weekly',
      priority: 1,
    });
  });

  it('includes one entry per catalog', async () => {
    vi.mocked(getCatalogList).mockResolvedValue([
      { id: 'QX' } as any,
      { id: 'QS' } as any,
    ]);
    vi.mocked(fs.stat).mockResolvedValue({ mtime: new Date('2026-01-15') } as any);
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain('https://test.metro.example/catalog/QX');
    expect(urls).toContain('https://test.metro.example/catalog/QS');
    expect(entries.length).toBe(3);
  });

  it('catalog entries have priority 0.8 and weekly cadence', async () => {
    vi.mocked(getCatalogList).mockResolvedValue([{ id: 'QX' } as any]);
    vi.mocked(fs.stat).mockResolvedValue({ mtime: new Date('2026-01-15') } as any);
    const entries = await sitemap();
    const catalogEntry = entries.find(
      (e) => e.url === 'https://test.metro.example/catalog/QX',
    );
    expect(catalogEntry).toMatchObject({
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  it('catalog lastModified is the config.json mtime when available', async () => {
    vi.mocked(getCatalogList).mockResolvedValue([{ id: 'QX' } as any]);
    const mtime = new Date('2026-04-01T12:00:00Z');
    vi.mocked(fs.stat).mockResolvedValue({ mtime } as any);
    const entries = await sitemap();
    const qx = entries.find((e) => e.url.endsWith('/catalog/QX'));
    expect(qx?.lastModified).toEqual(mtime);
  });

  it('falls back to "now" when stat throws', async () => {
    vi.mocked(getCatalogList).mockResolvedValue([{ id: 'QX' } as any]);
    vi.mocked(fs.stat).mockRejectedValue(new Error('ENOENT'));
    const before = Date.now();
    const entries = await sitemap();
    const qx = entries.find((e) => e.url.endsWith('/catalog/QX'));
    const ts = (qx?.lastModified as Date).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
  });

  it('does not include any /print routes', async () => {
    vi.mocked(getCatalogList).mockResolvedValue([
      { id: 'QX' } as any,
      { id: 'QS' } as any,
    ]);
    vi.mocked(fs.stat).mockResolvedValue({ mtime: new Date('2026-01-15') } as any);
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls.every((url) => !url.endsWith('/print'))).toBe(true);
    expect(urls.every((url) => !url.includes('/print'))).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/app/sitemap.test.ts`
Expected: FAIL — new "config.json mtime" assertion fails because current impl uses `new Date()` for everything.

- [ ] **Step 3: Update the sitemap implementation**

Replace the contents of `src/app/sitemap.ts` with:

```ts
import type { MetadataRoute } from 'next';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getCatalogList } from '@/lib/catalog-loader';
import { getSiteUrl } from '@/lib/site-url';

async function catalogLastModified(catalogId: string): Promise<Date> {
  const configPath = path.join(
    process.cwd(),
    'public',
    'catalogs',
    catalogId,
    'config.json',
  );
  try {
    const stat = await fs.stat(configPath);
    return stat.mtime;
  } catch {
    return new Date();
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const catalogs = await getCatalogList();
  const now = new Date();

  const catalogEntries = await Promise.all(
    catalogs.map(async (catalog) => ({
      url: `${base}/catalog/${catalog.id}`,
      lastModified: await catalogLastModified(catalog.id),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  );

  return [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...catalogEntries,
  ];
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/app/sitemap.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Run typecheck**

Run: `npm run typecheck`
Expected: exit code 0.

- [ ] **Step 6: Commit**

```bash
git add src/app/sitemap.ts src/app/sitemap.test.ts
git commit -m "feat(seo): set sitemap lastModified from config.json mtime"
```

---

### Task 8: Update handover documentation (binder `odbior-2026-05-29`)

**Files:**
- Modify: `docs/odbior-2026-05-29/dokumentacja.html`
- Modify: `docs/odbior-2026-05-29/odbior-koncowy.html`
- Modify: `docs/odbior-2026-05-29/README.md`

**Pre-check (do this first, no edit):**

Run: `grep -nE "\.badge|\.callout" docs/odbior-2026-05-29/dokumentacja.html | head -20`
Run: `grep -nE "\.badge|\.callout" docs/odbior-2026-05-29/odbior-koncowy.html | head -20`

This locates the existing inline `<style>` block in each HTML file where `.badge.ok`, `.badge.pending`, `.callout.info`, `.callout.success` are defined. Note the line numbers — you will append the new `.plus` rules immediately after the last existing `.badge.*` / `.callout.*` selector.

- [ ] **Step 1: Add `.badge.plus` and `.callout.plus` CSS to `dokumentacja.html`**

In `docs/odbior-2026-05-29/dokumentacja.html`, locate the existing `<style>` block (search for `.badge.ok` or `.callout.success`). Immediately after the last existing `.badge.*` / `.callout.*` rule, append:

```css
.badge.plus {
  background: #f3eaff;
  color: #5a1ea8;
  border: 1px solid #c9a6f7;
}
.callout.plus {
  border-left: 4px solid #7b3ad6;
  background: #faf5ff;
  padding: 16px 20px;
  margin: 16px 0;
}
.callout.plus strong { color: #4a1085; }
```

- [ ] **Step 2: Add the same CSS to `odbior-koncowy.html`**

Repeat Step 1 in `docs/odbior-2026-05-29/odbior-koncowy.html` — same selectors, identical rule bodies. (Keeping the two files self-contained is intentional; the binder is designed to be opened from a file URL without external CSS.)

- [ ] **Step 3: Refresh `dokumentacja.html` section 11 ("API i SEO")**

In `docs/odbior-2026-05-29/dokumentacja.html`, replace the existing `<section id="api">` block (currently ~lines 633-660, ending before the next `<section>`) with the updated content below. The replacement reflects the post-implementation state (sitemap mtime, full metadata, JSON-LD).

```html
    <section id="api">
      <h2>11. API i SEO <a href="#api" class="anchor">#</a></h2>

      <h3>11.1 API katalogów</h3>
      <ul>
        <li><code>src/app/api/catalogs/route.ts</code> — JSON z listą katalogów, oznaczony nagłówkiem <code>Link</code> z <code>/api-catalog</code> (RFC 9727) w <code>next.config.ts</code>.</li>
      </ul>

      <h3>11.2 Sitemap, robots, metadane (standard)</h3>
      <ul>
        <li><code>src/app/sitemap.ts</code> — <code>/</code> + <code>/catalog/&lt;id&gt;</code> dla każdego ID; <code>lastModified</code> odczytywany ze <code>stat()</code> pliku <code>public/catalogs/&lt;ID&gt;/config.json</code>, z fallbackiem na <code>new Date()</code> przy braku pliku.</li>
        <li><code>src/app/robots.txt/route.ts</code> — dynamiczny endpoint z nagłówkiem <code>Content-Signal</code>, dyrektywami <code>Allow/Disallow</code> i linkiem do sitemapy.</li>
        <li><code>src/app/layout.tsx</code> — globalne <code>title</code>, <code>description</code>, <code>openGraph</code>, <code>twitter</code> (<code>summary_large_image</code>), <code>metadataBase</code>, ikony i manifest.</li>
        <li><code>src/app/page.tsx</code> — <code>generateMetadata</code> z canonical <code>/</code>, OG image <code>/banner.webp</code> i pełnym Twitter card.</li>
        <li><code>src/app/catalog/[catalogId]/page.tsx</code> — <code>generateMetadata</code> ustawia <code>title = meta.title — meta.tagline</code>, <code>description = meta.description</code>, <code>alternates.canonical</code>, <code>openGraph.images</code> i <code>twitter.images</code> z per-katalogowego pliku <code>/catalogs/&lt;ID&gt;/thumbs/&lt;id&gt;-home.webp</code>.</li>
      </ul>

      <h3>11.3 Dane strukturalne (JSON-LD) <span class="badge plus">PONAD WYMAGANY STANDARD</span></h3>
      <div class="callout plus">
        <strong>Realizacja ponad wymagany standard.</strong>
        <p>Załącznik nr 2 nie wymaga dostarczenia danych strukturalnych w formacie schema.org. Dostarczono je dodatkowo, aby strony katalogów były kwalifikowalne do wzbogaconych wyników wyszukiwania (Google rich results) — bez zmiany treści ani konfiguracji wymaganej kontraktem.</p>
      </div>
      <ul>
        <li><code>src/lib/seo.ts</code> — typowane buildery JSON-LD: <code>buildOrganizationJsonLd</code>, <code>buildWebSiteJsonLd</code>, <code>buildCatalogCollectionJsonLd</code>, <code>buildBreadcrumbJsonLd</code>; helpery <code>absoluteUrl</code>, <code>catalogCanonicalPath</code>, <code>catalogOgImagePath</code>.</li>
        <li><code>src/components/seo/JsonLd.tsx</code> — server component renderujący <code>&lt;script type="application/ld+json"&gt;</code> z escapem sekwencji <code>&lt;/script&gt;</code> (ochrona XSS).</li>
        <li><strong>Strona główna:</strong> emituje JSON-LD typu <code>Organization</code> i <code>WebSite</code>.</li>
        <li><strong>Strony katalogów:</strong> emitują JSON-LD typu <code>CollectionPage</code> (z <code>about: ProductGroup</code> + <code>brand: Brand</code>) oraz <code>BreadcrumbList</code> (Home → tytuł katalogu).</li>
        <li>Wszystkie URL-e w strukturach są absolutne, generowane przez <code>getSiteUrl()</code> i <code>metadataBase</code>.</li>
        <li>Źródłem treści są wyłącznie pola <code>meta</code> z <code>config.json</code> każdego katalogu — żadnych zmyślonych SKU, cen ani GTIN.</li>
      </ul>

      <h3>11.4 Testy</h3>
      <ul>
        <li>Sitemap: <code>src/app/sitemap.test.ts</code> (mtime, brak <code>/print</code>, fallback przy <code>ENOENT</code>).</li>
        <li>Buildery JSON-LD: <code>src/lib/seo.test.ts</code>.</li>
        <li>Komponent JSON-LD: <code>src/components/seo/JsonLd.test.tsx</code> (w tym test escapowania <code>&lt;/script&gt;</code>).</li>
        <li>Metadane i obecność JSON-LD na stronach: <code>src/app/page.test.tsx</code>, <code>src/app/catalog/[catalogId]/page.test.tsx</code>.</li>
      </ul>
    </section>
```

- [ ] **Step 4: Add the same convention to `odbior-koncowy.html` — retrofit existing above-standard sections**

In `docs/odbior-2026-05-29/odbior-koncowy.html`, update two existing headings to carry the new badge (so the convention is applied consistently across the binder, not only to the new SEO work).

a) Replace:

```html
      <h2>9. Autorski design system <a href="#design-system" class="anchor">#</a></h2>
```

with:

```html
      <h2>9. Autorski design system <span class="badge plus">PONAD WYMAGANY STANDARD</span> <a href="#design-system" class="anchor">#</a></h2>
```

b) Replace:

```html
      <h2>10. Autorski system konwersji strony na PDF <a href="#pdf-pipeline" class="anchor">#</a></h2>
```

with:

```html
      <h2>10. Autorski system konwersji strony na PDF <span class="badge plus">PONAD WYMAGANY STANDARD</span> <a href="#pdf-pipeline" class="anchor">#</a></h2>
```

- [ ] **Step 5: Add a new above-standard subsection for SEO/JSON-LD in `odbior-koncowy.html`**

The deliverable file uses ascending integer headings. The simplest, lowest-risk placement is to append a new subsection at the end of section 10 (PDF pipeline already documents above-standard work). Locate the closing `</section>` of section 10 — find the `<h2>10. Autorski system konwersji strony na PDF` heading, then the matching `</section>` immediately before `<h2>11. Harmonogram prac`. Immediately **before** that `</section>`, insert:

```html
      <h3>10.6 Dane strukturalne i metadane SEO <span class="badge plus">PONAD WYMAGANY STANDARD</span></h3>
      <div class="callout plus">
        <strong>Zakres dostarczony ponad wymagany standard.</strong>
        <p>Załącznik nr 2 nie definiuje wymagań w zakresie danych strukturalnych (schema.org / JSON-LD) ani rozszerzonych metadanych Open Graph / Twitter Card. Powyższe elementy zostały dostarczone dodatkowo, w celu zwiększenia widoczności katalogów w wyszukiwarkach i kwalifikowalności do wzbogaconych wyników wyszukiwania.</p>
      </div>
      <ul>
        <li><strong>Dane strukturalne JSON-LD</strong> zgodne ze specyfikacją schema.org:
          <ul>
            <li>Strona główna: <code>Organization</code> + <code>WebSite</code>.</li>
            <li>Każda strona katalogu: <code>CollectionPage</code> (z osadzonym <code>about: ProductGroup</code> i <code>brand: Brand</code>) oraz <code>BreadcrumbList</code>.</li>
          </ul>
        </li>
        <li><strong>Rozszerzone metadane społecznościowe:</strong> pełny zestaw tagów <code>og:*</code> i <code>twitter:*</code> per katalog (tytuł, opis, URL kanoniczny, obraz <code>/catalogs/&lt;ID&gt;/thumbs/&lt;id&gt;-home.webp</code>, karta <code>summary_large_image</code>).</li>
        <li><strong>Sitemap z dokładnym <code>lastModified</code>:</strong> <code>src/app/sitemap.ts</code> odczytuje <code>mtime</code> pliku <code>config.json</code> każdego katalogu — wyszukiwarki rejestrują tylko realnie zaktualizowane sekcje.</li>
        <li><strong>Bezpieczeństwo wstrzyknięć:</strong> komponent <code>JsonLd</code> escapuje sekwencje <code>&lt;/script&gt;</code> w wartościach łańcuchowych (ochrona przed XSS).</li>
        <li><strong>Brak zmyślonych danych produktowych:</strong> źródłem treści JSON-LD są wyłącznie istniejące pola <code>meta</code> z <code>config.json</code> (brak cen, SKU, GTIN — zgodnie z polityką nieprzypisywania niepotwierdzonych faktów produktowych).</li>
        <li><strong>Testy regresji:</strong> <code>src/lib/seo.test.ts</code>, <code>src/components/seo/JsonLd.test.tsx</code>, <code>src/app/page.test.tsx</code>, <code>src/app/catalog/[catalogId]/page.test.tsx</code>, <code>src/app/sitemap.test.ts</code>.</li>
      </ul>
```

(No renumbering of subsequent sections is required — the new content is `10.6`, slotted into the existing section 10.)

- [ ] **Step 6: Update README index/changelog**

In `docs/odbior-2026-05-29/README.md`, locate the table from section 2 ("Zawartość pakietu"). Immediately after the table, append:

```markdown
### Historia zmian pakietu

- **2026-05-28** — Aktualizacja sekcji 11 (`dokumentacja.html`) i dodanie podsekcji 10.6 (`odbior-koncowy.html`) z opisem rozszerzonych metadanych SEO oraz danych strukturalnych JSON-LD (`Organization`, `WebSite`, `CollectionPage`, `BreadcrumbList`). Wprowadzono spójną konwencję graficzną oznaczania pracy wykonanej ponad wymagany standard (badge `PONAD WYMAGANY STANDARD`, klasy `.badge.plus` / `.callout.plus`). Zastosowano ją również retroaktywnie do sekcji 9 (design system) i 10 (PDF pipeline).
```

- [ ] **Step 7: Remove section 14.2 ("Dokumenty pomocnicze") from the binder**

The contracting party has determined that the auxiliary-documents listing is not part of the deliverable. Remove it from both the HTML and the README, and trim every sentence that becomes an orphan reference.

a) `docs/odbior-2026-05-29/odbior-koncowy.html` — delete the `<h3>14.2 Dokumenty pomocnicze (w repozytorium, poza binderem)</h3>` heading together with the `<ul>...</ul>` block immediately following it (items A through E, currently 8 lines, ~lines 1478-1485):

```html
      <h3>14.2 Dokumenty pomocnicze (w repozytorium, poza binderem)</h3>
      <ul>
        <li><strong>A.</strong> <a href="../../.ui-design/audits/metro_catalogs_zasady_20260507_115012.md">../../.ui-design/audits/metro_catalogs_zasady_20260507_115012.md</a> — audyt dostępności (27 ustaleń)</li>
        <li><strong>B.</strong> <a href="../superpowers/plans/2026-05-07-accessibility-wcag-aa-remediation.md">../superpowers/plans/2026-05-07-accessibility-wcag-aa-remediation.md</a> — plan implementacji napraw</li>
        <li><strong>C.</strong> <a href="../superpowers/plans/2026-05-07-accessibility-progress.md">../superpowers/plans/2026-05-07-accessibility-progress.md</a> — rejestr postępu napraw (28 wdrożonych)</li>
        <li><strong>D.</strong> <a href="../../AGENTS.md">../../AGENTS.md</a> — zasady utrzymania spójności design-systemu i a11y</li>
        <li><strong>E.</strong> <a href="../../public/catalogs/index.json">../../public/catalogs/index.json</a> — manifest 8 dostarczonych systemów</li>
      </ul>
```

b) In the same file, replace the paragraph that introduces section 14 (currently:

```html
      <p>Folder <code>docs/odbior-2026-05-29/</code> stanowi <strong>samowystarczalny pakiet odbiorowy</strong> — wszystkie kluczowe dokumenty zgromadzone są w jednym miejscu. Pozostałe artefakty pomocnicze (audyty, plany napraw, kod źródłowy) pozostają w swoich pierwotnych lokalizacjach w repozytorium i są linkowane relatywnie.</p>
```

) with:

```html
      <p>Folder <code>docs/odbior-2026-05-29/</code> stanowi <strong>samowystarczalny pakiet odbiorowy</strong> — wszystkie kluczowe dokumenty zgromadzone są w jednym miejscu.</p>
```

c) In the same file, replace the closing callout (currently:

```html
      <div class="callout info">
        <strong class="label">Pakiet do przekazania</strong>
        Binder jest samowystarczalny — można spakować poleceniem:<br/>
        <code>tar czf metro-catalogs-odbior-2026-05-29.tar.gz docs/odbior-2026-05-29</code><br/>
        i przekazać Zamawiającemu jako pojedynczy artefakt. Linki do dokumentów pomocniczych (audyt, plany, AGENTS, manifest) wymagają dostępu do całego repozytorium — w&nbsp;razie potrzeby alternatywnie: <code>git archive --format=tar.gz HEAD -o metro-catalogs-pelne-repo-2026-05-29.tar.gz</code>.
      </div>
```

) with:

```html
      <div class="callout info">
        <strong class="label">Pakiet do przekazania</strong>
        Binder jest samowystarczalny — można spakować poleceniem:<br/>
        <code>tar czf metro-catalogs-odbior-2026-05-29.tar.gz docs/odbior-2026-05-29</code><br/>
        i przekazać Zamawiającemu jako pojedynczy artefakt.
      </div>
```

d) `docs/odbior-2026-05-29/README.md` — delete the entire section currently spanning lines 40-53 (heading + intro paragraph + table + trailing `---`):

```markdown
## 3. Dokumenty pomocnicze (w repozytorium, poza binderem)

Pełna ścieżka audytowa i materiały techniczne pozostają w swoich pierwotnych lokalizacjach w repozytorium — pakiet odbiorowy linkuje do nich relatywnie.

| # | Plik | Opis |
| --- | --- | --- |
| **A.** | [../../.ui-design/audits/metro_catalogs_zasady_20260507_115012.md](../../.ui-design/audits/metro_catalogs_zasady_20260507_115012.md) | Audyt dostępności frontendu (27 ustaleń: 5 K, 8 P, 9 U, 5 D) |
| **B.** | [../superpowers/plans/2026-05-07-accessibility-wcag-aa-remediation.md](../superpowers/plans/2026-05-07-accessibility-wcag-aa-remediation.md) | Plan implementacji napraw WCAG 2.1 AA (zadania T0.1–T5.1) |
| **C.** | [../superpowers/plans/2026-05-07-accessibility-progress.md](../superpowers/plans/2026-05-07-accessibility-progress.md) | Rejestr postępu napraw (28 wdrożonych) |
| **D.** | [../../AGENTS.md](../../AGENTS.md) | Zasady utrzymania spójności design-systemu, dokumentacji i procesów QA |
| **E.** | [../../public/catalogs/index.json](../../public/catalogs/index.json) | Manifest 8 dostarczonych systemów wczytywany przez aplikację |

---
```

(Delete the trailing `---` separator that belonged to this section as well; the next section's leading `---` separator remains.)

e) `docs/odbior-2026-05-29/README.md` — renumber the four subsequent headings to close the gap left by the deletion:

| before | after |
| --- | --- |
| `## 4. Mapa zależności dokumentów` | `## 3. Mapa zależności dokumentów` |
| `## 5. Kluczowe wskaźniki realizacji (stan 2026-05-29)` | `## 4. Kluczowe wskaźniki realizacji (stan 2026-05-29)` |
| `## 6. Kolejność czytania (rekomendacja)` | `## 5. Kolejność czytania (rekomendacja)` |
| `## 7. Uwagi techniczne` | `## 6. Uwagi techniczne` |

f) `docs/odbior-2026-05-29/README.md` — fix the cross-reference inside section "Kolejność czytania" (currently around line 122). Replace:

```markdown
1. Cały folder `docs/odbior-2026-05-29/` + linkowane dokumenty pomocnicze (A–E w sekcji 3).
```

with:

```markdown
1. Cały folder `docs/odbior-2026-05-29/`.
```

g) Verify no remaining references to the deleted section. Run:

```
grep -nE "14\.2|Dokumenty pomocnicze|sekcji 3" docs/odbior-2026-05-29/README.md docs/odbior-2026-05-29/odbior-koncowy.html
```

Expected: no matches.

- [ ] **Step 8: Validate HTML files still parse**

Run: `python3 -c "from html.parser import HTMLParser
import sys
class P(HTMLParser):
    def error(self, m): raise Exception(m)
p = P()
for path in ['docs/odbior-2026-05-29/dokumentacja.html', 'docs/odbior-2026-05-29/odbior-koncowy.html']:
    with open(path) as f: p.feed(f.read())
print('ok')"`
Expected: `ok`.

- [ ] **Step 9: Visual spot-check**

Open `docs/odbior-2026-05-29/odbior-koncowy.html` and `docs/odbior-2026-05-29/dokumentacja.html` in a browser. Verify:
- Section 9 (`<h2>9. Autorski design system`) shows the purple `PONAD WYMAGANY STANDARD` badge next to its title.
- Section 10 likewise.
- Section 10.6 exists and renders the `.callout.plus` block (lavender background, left purple border).
- `dokumentacja.html` section 11.3 shows the same callout.
- Section 14 in `odbior-koncowy.html` ends after 14.1 — there is no 14.2 heading or list. The closing "Pakiet do przekazania" callout no longer mentions "dokumenty pomocnicze".
- `README.md` sections are numbered 1, 2, 3, 4, 5, 6 — no gap, no duplicates. There is no section titled "Dokumenty pomocnicze".

- [ ] **Step 10: Commit**

```bash
git add docs/odbior-2026-05-29/dokumentacja.html docs/odbior-2026-05-29/odbior-koncowy.html docs/odbior-2026-05-29/README.md
git commit -m "docs(odbior): document SEO/JSON-LD additions, add ponad-standard marking, drop section 14.2"
```

---

### Task 9: Smoke verification (build + runtime checks)

**Files:** none (verification only — produces no commit unless something needs to be fixed).

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: exit code 0, no errors.

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: exit code 0.

- [ ] **Step 4: Build the project**

Run: `npm run build:no-images`
Expected: exits 0; build summary lists static routes including `/` and `/catalog/[catalogId]` and the sitemap.

- [ ] **Step 5: Start the dev server**

Run (background): `npm run dev`
Wait for "Ready" log line; default port `3000`.

- [ ] **Step 6: Verify homepage SEO surface**

Run: `curl -s http://localhost:3000/ | grep -c 'application/ld+json'`
Expected: at least `2` (Organization + WebSite).

Run: `curl -s http://localhost:3000/ | grep -E 'og:title|og:description|og:image|twitter:card' | head -5`
Expected: at least one match per tag.

Run: `curl -s http://localhost:3000/ | grep 'rel="canonical"'`
Expected: a canonical link to `/`.

- [ ] **Step 7: Verify catalog page SEO surface (FM)**

Run: `curl -s http://localhost:3000/catalog/FM | grep -c 'application/ld+json'`
Expected: at least `2` (CollectionPage + BreadcrumbList).

Run: `curl -s http://localhost:3000/catalog/FM | grep -oE 'og:image[^>]+content="[^"]+"' | head -1`
Expected: contains `/catalogs/FM/thumbs/fm-home.webp`.

Run: `curl -s http://localhost:3000/catalog/FM | grep 'rel="canonical"'`
Expected: a canonical link ending in `/catalog/FM`.

- [ ] **Step 8: Verify sitemap and robots are still well-formed**

Run: `curl -s http://localhost:3000/sitemap.xml | head -20`
Expected: XML lists `/` and `/catalog/{id}` entries for every catalog in `public/catalogs/index.json`.

Run: `curl -s http://localhost:3000/robots.txt`
Expected: Output begins with `Content-Signal:` and includes a `Sitemap:` line.

- [ ] **Step 9: Validate one JSON-LD payload locally**

Run: `curl -s http://localhost:3000/catalog/FM | grep -oE 'application/ld\+json[^<]*<[^>]*>[^<]+' | head -1`
Inspect the printed JSON; it should be parseable. Pipe through `python3 -c "import sys,json,re;raw=sys.stdin.read();m=re.search(r'>({.*})',raw);json.loads(m.group(1));print('ok')"` if a quick sanity parse is desired. Expected: `ok`.

(Optional manual: paste a payload into <https://validator.schema.org/> — no errors should be reported.)

- [ ] **Step 10: Stop the dev server**

Use `npm run kill:next:mac` (macOS) or `npm run kill:next` (Windows).

- [ ] **Step 11: Final state check**

Run: `git status`
Expected: clean working tree (all earlier tasks already committed).

---

## Self-Review Notes

- Spec coverage: catalogs covered = homepage (Org+WebSite, OG, Twitter, canonical) + catalog pages (description, canonical, OG, Twitter, CollectionPage, BreadcrumbList) + sitemap mtime + Twitter defaults at root + handover binder update + "ponad standard" marking convention. Robots.txt is already correct, no task needed.
- Documentation coverage: every runtime change introduced by Tasks 1-7 is reflected in Task 8 (handover binder update). The marking convention is introduced once (CSS rules in Task 8 Steps 1-2) and applied both to the new SEO/JSON-LD content and retroactively to existing above-standard sections (design system, PDF pipeline), so the binder is internally consistent.
- No invented product facts: JSON-LD draws only from `meta.title`, `meta.tagline`, `meta.description`, `meta.brandName`, `meta.collectionName`, plus the existing home thumb file. No SKUs, prices, GTINs, founding dates, employee counts, ratings, or offers. Documentation explicitly states this constraint (Task 8, Step 5).
- Type/name consistency: `catalogCanonicalPath`, `catalogOgImagePath`, `buildOrganizationJsonLd`, `buildWebSiteJsonLd`, `buildCatalogCollectionJsonLd`, `buildBreadcrumbJsonLd` are used identically wherever they appear. The CSS classes `.badge.plus` / `.callout.plus` are defined once per HTML file with identical bodies.
- Out of scope (call out to user if requested later): proper 1200×630 OG images per catalog (current plan reuses the home thumb), per-section anchors in sitemap, hreflang (site is English-only today), `ItemList` schema on the homepage listing, and Polish-language localisation. Retrofitting the badge to additional past above-standard items (e.g. accessibility work beyond WCAG AA baseline) is a separate documentation pass — not bundled here.
- Per contracting-party direction: section 14.2 of `odbior-koncowy.html` and its mirror (section 3 in `README.md`), titled "Dokumenty pomocnicze (w repozytorium, poza binderem)", are **deleted from the binder** in Task 8, Step 7. Helper artefacts (audits, legacy plans, AGENTS.md, manifest) remain in their original repository locations but are no longer indexed by the binder. Any future plan that wants to surface such artefacts must request a separate decision — do not re-introduce 14.2.
