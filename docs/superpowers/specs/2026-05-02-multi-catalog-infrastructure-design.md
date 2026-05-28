# Multi-catalog infrastructure — design spec

**Date:** 2026-05-02
**Status:** Draft (awaiting user review)
**Scope:** Infrastructure for 8 product catalogs across 3 layout types, plus a landing page that distributes to them.

---

## 1. Problem

Today the project ships a single product catalog (`QX`) at `/catalog/QX`. The home route (`/`) is a `permanentRedirect('/catalog/QX')`. The current code:

- Carries multi-catalog plumbing (`getCatalogList()`, `index.json`, dynamic `[catalogId]` route, per-catalog `meta.theme`), but only one catalog is registered.
- Hardcodes QX-specific behavior in `HeroSection` via `catalogId === 'QX'` checks (3 places: corner-layout, third-slide-lift, giant title scale).
- Hardcodes `metro_logo.svg` in `[catalogId]/page.tsx` via `isQx0`.
- Has 9 sections in `CatalogData` with all-but-one (`packshots`) required — a catalog missing data crashes the loader.
- Has no landing page.

The next phase: 8 catalogs total. **Type 1 = QX (already designed and implemented).** **Type 2 and Type 3 will be designed later** and may differ from QX in everything (colors, typography, hero layout, section set, internal layouts).

## 2. Goals

- A landing page at `/` that lists all 8 catalogs with name + description and links to each.
- A dispatcher at `/catalog/[catalogId]` that selects the right layout based on `meta.layoutType`.
- A self-contained `layouts/qx/` folder with all QX-specific composition and section components — the existing QX behavior moves here unchanged in render output.
- Self-contained `layouts/type2/` and `layouts/type3/` placeholders that show catalog metadata and a "Layout in preparation" notice.
- Removal of `catalogId === 'QX'` hardcodes from shared components (Hero in particular).
- Removal of `isQx0` logo hardcode from the dispatcher.

## 3. Non-goals

- Designing the visual look of layout types 2 and 3.
- Making catalog sections within QX optional / data-driven beyond what already exists for `packshots`.
- Refactoring section components into shared primitives (`SectionShell`, `useSectionInView`, etc.) — deferred until a second real layout exists for comparison.
- Replacing `<img>` with `next/image` in section components.
- Migrating Lato from Google Fonts CDN to `next/font/google`.
- Adding catalog stub configs (QS, TS, …) — author task, not infrastructure task.

## 4. Architecture

### 4.1 Folder layout

```
src/
├── app/
│   ├── page.tsx                    # landing (replaces permanentRedirect)
│   └── catalog/[catalogId]/
│       └── page.tsx                # dispatcher: reads meta.layoutType, renders layout
├── components/
│   └── catalog/                    # SHARED building blocks (cross-layout)
│       ├── CatalogNav.tsx
│       ├── CatalogMotion.tsx
│       └── renderQxText.tsx
└── layouts/
    ├── qx/                         # type 1: QX (live)
    │   ├── CatalogPageQX.tsx       # composition (moved from [catalogId]/page.tsx body)
    │   ├── HeroQX.tsx              # moved from components/catalog/HeroSection.tsx
    │   ├── OverviewQX.tsx
    │   ├── GalleryQX.tsx
    │   ├── VariantsQX.tsx
    │   ├── DimensionsQX.tsx
    │   ├── MaterialsQX.tsx
    │   ├── FeaturesQX.tsx
    │   ├── AssemblyQX.tsx
    │   └── PackshotsQX.tsx
    ├── type2/
    │   └── CatalogPageType2.tsx    # placeholder
    └── type3/
        └── CatalogPageType3.tsx    # placeholder
```

The 9 files at `src/components/catalog/{Hero,Overview,Gallery,Variants,Dimensions,Materials,Features,Assembly,Packshots}Section.tsx` are **moved** (not copied) into `src/layouts/qx/` and renamed `*QX.tsx`.

### 4.2 Schema additions

`src/types/catalog.ts`:

```ts
export type CatalogLayoutType = 'qx' | 'type2' | 'type3';

export interface CatalogMeta {
  title: string;
  description: string;
  brandName: string;
  collectionName: string;
  layoutType: CatalogLayoutType;   // NEW: required
  theme?: string;
}
```

`public/catalogs/QX/config.json` gets `"layoutType": "qx"` added to `meta`.

### 4.3 Loader changes

`src/lib/catalog-loader.ts`:

- `loadCatalog(id)` already returns `null` on missing/invalid `config.json`. Add a guard: if `config.meta.layoutType` is missing or not in `('qx' | 'type2' | 'type3')`, log a warning and return `null`. The dispatcher already calls `notFound()` on `null` — fail-loud behavior preserved.
- `loadCatalogMeta(id)` and `getCatalogList()` continue to return raw `meta` — landing uses `collectionName`, `title`, `description`, `theme`. No structural change required.

### 4.4 Dispatcher

`src/app/catalog/[catalogId]/page.tsx` shrinks to a dispatcher:

```tsx
import { notFound } from 'next/navigation';
import { loadCatalog, getGlobalConfig, getCatalogList } from '@/lib/catalog-loader';
import CatalogPageQX from '@/layouts/qx/CatalogPageQX';
import CatalogPageType2 from '@/layouts/type2/CatalogPageType2';
import CatalogPageType3 from '@/layouts/type3/CatalogPageType3';

const layoutMap = {
  qx: CatalogPageQX,
  type2: CatalogPageType2,
  type3: CatalogPageType3,
} as const;

export async function generateStaticParams() {
  const catalogs = await getCatalogList();
  return catalogs.map((catalog) => ({ catalogId: catalog.id }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const catalog = await loadCatalog(resolvedParams.catalogId);
  if (!catalog) return {};
  return { title: `${resolvedParams.catalogId.toUpperCase()} - ${catalog.meta.title}` };
}

export default async function CatalogPage({ params }) {
  const resolvedParams = await params;
  const [catalog, globalConfig] = await Promise.all([
    loadCatalog(resolvedParams.catalogId),
    getGlobalConfig(),
  ]);
  if (!catalog) notFound();

  const LayoutComponent = layoutMap[catalog.meta.layoutType];
  return <LayoutComponent catalog={catalog} globalConfig={globalConfig} />;
}
```

### 4.5 LayoutQX

`src/layouts/qx/CatalogPageQX.tsx` accepts `{ catalog, globalConfig }` and renders the full current QX page (everything inside `<CatalogMotion>` from today's `[catalogId]/page.tsx`). The `metro_logo.svg` is passed unconditionally to `CatalogNav` (no `isQx0` ternary — this file IS the QX layout).

`src/layouts/qx/HeroQX.tsx` is the current `HeroSection` with these removals:

- `const isQx = catalogId?.toUpperCase() === 'QX';` → deleted
- `useQxCornerHeroLayout = isQx && currentIndex < 2` → becomes `cornerHeroLayout = currentIndex < 2`
- `useQxThirdSlideLift = isQx && currentIndex === 2` → becomes `thirdSlideLift = currentIndex === 2`
- The QX-vs-non-QX font branch in the title — keep only the QX branch (giant clamp + Lato, weight 200)
- The `{!isQx && <hero overlay>}` block → deleted (QX never had overlay)
- The `showSlideDescription` `&& !isQx` clause and the description render block → deleted (QX never showed slide descriptions)
- Prop `catalogId` → removed (no longer needed)

`CatalogPageQX.tsx` updates the `<HeroQX>` call site to drop the `catalogId` prop.

### 4.6 LayoutType2 / LayoutType3 placeholders

Two near-identical files. Both render: back link to `/`, collection name, title, description, "Layout in preparation" badge, footer text. No `CatalogNav` (it would link to non-existent section anchors).

```tsx
import type { CatalogData } from '@/types/catalog';
import type { GlobalConfig } from '@/lib/catalog-loader';

interface Props {
  catalog: CatalogData;
  globalConfig: GlobalConfig;
}

export default function CatalogPageType2({ catalog, globalConfig }: Props) {
  return (
    <main className="mx-auto flex min-h-screen max-w-[1440px] flex-col px-6 py-16 sm:px-8">
      <header className="mb-12">
        <a
          href="/"
          className="text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          ← {globalConfig.brandName}
        </a>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-muted-foreground">
          {catalog.meta.collectionName}
        </p>
        <h1 className="mt-6 font-display text-5xl md:text-7xl">
          {catalog.meta.title}
        </h1>
        <p className="mt-6 max-w-xl text-muted-foreground">
          {catalog.meta.description}
        </p>
        <p className="mt-12 inline-block border border-border px-6 py-3 font-display text-xs uppercase tracking-widest text-muted-foreground">
          Layout in preparation
        </p>
      </section>

      <footer className="mt-12 text-xs uppercase tracking-widest text-muted-foreground/60">
        {globalConfig.footerText}
      </footer>
    </main>
  );
}
```

`CatalogPageType3` is identical (same markup, same copy "Layout in preparation"). Kept as a separate file so that when type 2 or type 3 is designed later, the work touches only that one folder.

### 4.7 Landing page

`src/app/page.tsx` becomes:

```tsx
import { getCatalogList, getGlobalConfig } from '@/lib/catalog-loader';

export default async function HomePage() {
  const [catalogs, globalConfig] = await Promise.all([
    getCatalogList(),
    getGlobalConfig(),
  ]);

  return (
    <main className="variant-list-page mx-auto max-w-[1440px] px-6 py-16 sm:px-8">
      <header className="mb-12">
        <h1 className="font-display text-4xl">{globalConfig.siteTitle}</h1>
        <p className="mt-3 text-muted-foreground">{globalConfig.siteSubtitle}</p>
        <h2 className="mt-12 font-display text-xl uppercase tracking-widest">
          {globalConfig.catalogListTitle}
        </h2>
      </header>

      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {catalogs.map((catalog) => (
          <li key={catalog.id}>
            <a
              href={`/catalog/${catalog.id}`}
              className={`variant-tile variant-tile-${catalog.meta.theme ?? 'qx0'} block p-6`}
            >
              <p className="variant-tile-meta">{catalog.meta.collectionName}</p>
              <h3 className="variant-tile-title mt-2">{catalog.meta.title}</h3>
              <p className="variant-tile-cta mt-4 text-sm">{catalog.meta.description}</p>
            </a>
          </li>
        ))}
      </ul>

      <footer className="mt-24 text-xs uppercase tracking-widest text-muted-foreground/60">
        {globalConfig.footerText}
      </footer>
    </main>
  );
}
```

Reuses existing `.variant-list-page`, `.variant-tile`, `.variant-tile-qx0`, `.variant-tile-title`, `.variant-tile-meta`, `.variant-tile-cta` from `src/app/globals.css:166-229` — no new CSS.

Order: as listed in `public/catalogs/index.json` (author controls). All catalogs visible regardless of `layoutType`.

## 5. Data flow

```
public/catalogs/index.json
       │
       ▼
getCatalogList() ──► HomePage (/)               # landing
       │
       └─► loadCatalog(id) ──► [catalogId]/page.tsx (dispatcher)
                                       │
                                       ▼
                          layoutMap[catalog.meta.layoutType]
                                       │
                          ┌────────────┼────────────┐
                          ▼            ▼            ▼
                    CatalogPageQX  CatalogPageType2  CatalogPageType3
```

## 6. Error handling

- Missing `config.json` → `loadCatalog` returns `null` → `notFound()`.
- Missing or invalid `meta.layoutType` → `loadCatalog` returns `null` + console warning → `notFound()`.
- Catalog listed in `index.json` but folder does not exist → `getCatalogList` filters it out (existing behavior in `loadCatalogMeta`).
- Landing with empty `index.json` → renders header + footer + empty `<ul>`. No error, but no tiles.

## 7. Testing

The project has no working test runner (`src/test/example.test.ts` imports `vitest`, which is not in `package.json`). **No automated tests added in this iteration.**

Manual verification commands and routes for the implementation plan:

- `npx tsc --noEmit` — passes with zero errors introduced by the change.
- `npx eslint src` — zero errors introduced (existing `<img>` warnings allowed).
- `npm run dev`, then visit:
  - `/` — shows landing with the QX tile (only catalog in `index.json` today).
  - `/catalog/QX` — renders the full QX page identical to today.
  - Temporarily set `meta.layoutType` to `"type2"` in `QX/config.json` → renders the placeholder. Revert.
  - Temporarily set to `"type3"` → renders the type3 placeholder. Revert.
  - Temporarily set to `"type4"` (invalid) → `notFound()`.
  - Temporarily delete `meta.layoutType` → `notFound()`.

## 8. Migration steps (high level — not the implementation plan)

1. Add `layoutType: CatalogLayoutType` to `CatalogMeta` type.
2. Update `public/catalogs/QX/config.json` with `"layoutType": "qx"`.
3. Add validation in `loadCatalog`.
4. Create `src/layouts/qx/` and move + rename the 9 section files (Hero, Overview, Gallery, Variants, Dimensions, Materials, Features, Assembly, Packshots).
5. Strip `catalogId === 'QX'` hardcodes from `HeroQX.tsx`.
6. Create `src/layouts/qx/CatalogPageQX.tsx` (composition extracted from current `[catalogId]/page.tsx`).
7. Create `src/layouts/type2/CatalogPageType2.tsx` and `src/layouts/type3/CatalogPageType3.tsx` placeholders.
8. Rewrite `src/app/catalog/[catalogId]/page.tsx` as dispatcher.
9. Rewrite `src/app/page.tsx` as landing.
10. Verify (typecheck, lint, manual smoke).

## 9. Risks and mitigations

- **Mass-rename causes import drift.** Mitigation: typecheck after each move; rely on TS to catch broken imports.
- **HeroQX behavior regression after stripping `isQx`.** Mitigation: today the only consumer is QX (`catalogId === 'QX'` always true on `/catalog/QX`). Since the file becomes QX-only, removing the guards preserves the current production behavior — they were always true.
- **Dispatcher type narrowing.** `layoutMap[catalog.meta.layoutType]` requires the union to be exhaustive. TS will catch a missing key.
- **Static generation.** `generateStaticParams` + `generateMetadata` already work; no change in semantics.

## 10. Out-of-scope follow-ups (for later)

- Design and implement layout types 2 and 3 (separate spec each).
- Per-catalog hero config (`hero.layout: 'centered' | 'corner'`, `hero.titleScale`) — only meaningful once a second layout exists.
- Make all section data fields optional and drive rendering from `sections[].enabled` — only meaningful once we want partial QX-style catalogs.
- Per-catalog `meta.logoSrc` — replace the current "always metro_logo.svg" in LayoutQX once a second QX-themed catalog exists with its own logo.
- Add stub config.json files for the remaining 7 catalogs in `public/catalogs/<ID>/` (author task).
