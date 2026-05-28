# Responsive Images Pipeline Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Naprawić bugi i luki pokrycia w pipeline obrazów responsywnych zidentyfikowane w [docs/responsive-images-audit-2026-05-06.md](../../responsive-images-audit-2026-05-06.md): zerowe pokrycie 30 plików `finishes/_thumb.webp`, ~16 MB duplikatów aktywów, brakujące warianty (2560w hero, 1600w gallery/materials-full, 256w gallery thumb), niespójne defaults `sizes` oraz martwy preset `finishes`.

**Architecture:** Pojedyncze źródło prawdy o widthach: `SECTION_WIDTHS` w `scripts/generate-thumbnails.mjs` ↔ `PRESET_WIDTHS` w `src/lib/responsive-image.ts`. Pisemy test-watchdog parity (Task 1) który wyłapie rozjazd między tymi plikami w przyszłości. Konsolidujemy `catalogs/{id}/finishes/*.webp` → używamy globalnego `shared/materials` przez `includeShared: true`. Rozszerzamy presety o nowe warianty i regenerujemy manifest. Zmiany są kompatybilne wstecz — żaden istniejący URL nie zmienia path'u.

**Tech Stack:** Node.js (sharp dla generatora) · TypeScript · Vitest (testy parity + manifest) · Next.js prebuild hook (`prebuild` skrypt regeneruje thumby przed buildem)

**Założenia wstępne:**
- **Vitest jest już skonfigurowany** (`vitest.config.ts`, `npm test`). Jeśli nie — wykonać Task 1 z [docs/superpowers/plans/2026-05-06-design-system-foundations.md](2026-05-06-design-system-foundations.md) jako prerequisite.
- `sharp` jest zainstalowany w `devDependencies` (jest — wersja `^0.33.5`).
- Przed uruchomieniem: `npm install` żeby mieć aktualne zależności.

**Niewchodzi w zakres tego planu (osobny plan):**
- Lighthouse CI (P3.12 z audytu) — to osobna inicjatywa observability/CI.
- Re-shooting / regeneracja oryginałów (np. `overview/packshot.webp` 1000×1500 jest za mały na DPR=2) — wymaga design assetu od fotografa.

---

## File Structure

**Create:**
- `scripts/__tests__/preset-parity.test.ts` — test parity między `SECTION_WIDTHS` a `PRESET_WIDTHS` + sanity-check minimalnych wymiarów
- `scripts/lib/section-widths.mjs` — wyciągnięty z `generate-thumbnails.mjs` config (jako single-source-of-truth dla testu i generatora)
- `src/lib/responsive-image.test.ts` — testy `responsiveProps` (srcset/sizes generation, manifest fallback)

**Modify:**
- `scripts/generate-thumbnails.mjs` — import config z `lib/section-widths.mjs`, zamiana `processDirectory(finishesDir, ...)` na `processMaterialsDirectory(finishesDir, ...)` (split-logic)
- `src/lib/responsive-image.ts` — rozszerzone `PRESET_WIDTHS` (hero +2560, gallery +1600, materials-full +1200/1600), nowy preset `gallery-thumb [256, 512]`, usunięty preset `finishes`, zaktualizowane `PRESET_SIZES.gallery` i `PRESET_SIZES.packshot`
- `src/lib/catalog-loader.ts:643` — dodać `{ includeShared: true }` do `discoverMaterialsConfigurator(finishesBase)`
- `src/layouts/qx/GalleryQX.tsx:128–138` — zmiana `'gallery'` → `'gallery-thumb'` w call sitech thumbnaili
- `src/generated/responsive-image-manifest.json` — regenerowany przez prebuild po wszystkich zmianach

**Delete:**
- `public/catalogs/QX/finishes/*.webp` (60 plików: 15 RAL/U/W × 4 warianty: orig, _thumb, -400w, -800w)
- `public/catalogs/QS/finishes/*.webp` (j.w.)
- Zostaje tylko `public/catalogs/{QX,QS}/finishes/content.json`

---

## Task 1: Wyciągnij `SECTION_WIDTHS` do osobnego modułu i napisz test parity

**Files:**
- Create: `scripts/lib/section-widths.mjs`, `scripts/__tests__/preset-parity.test.ts`
- Modify: `scripts/generate-thumbnails.mjs:32-47`

Cel: jedno źródło prawdy o szerokościach generowanych wariantów + test który wyłapie rozjazd `SECTION_WIDTHS` ↔ `PRESET_WIDTHS` w przyszłości (audyt P3.11).

- [ ] **Step 1: Utwórz `scripts/lib/section-widths.mjs`**

```js
/**
 * Single source of truth for responsive image widths.
 * Imported by both:
 *  - scripts/generate-thumbnails.mjs (image generation)
 *  - tests (parity verification with src/lib/responsive-image.ts)
 */

/** @type {Record<string, number[]>} */
export const SECTION_WIDTHS = {
  hero: [640, 1280, 1920],
  gallery: [400, 800, 1200],
  packshots: [480, 960, 1440],
  overview: [400, 800],
  finishes: [400, 800],
  materials_full: [400, 800],
  materials_thumb: [96, 192],
};
```

- [ ] **Step 2: Zaktualizuj `scripts/generate-thumbnails.mjs` żeby importował z modułu**

Znajdź blok `SECTION_WIDTHS` w linach 32–47 i zamień na:

```js
// ---------------------------------------------------------------------------
// Size presets per section (imported from shared module)
// ---------------------------------------------------------------------------

import { SECTION_WIDTHS } from './lib/section-widths.mjs';
```

> Import musi być w sekcji importów na górze pliku (po `import { fileURLToPath } from 'url';`). Usuń stary blok `const SECTION_WIDTHS = {...}` z miejsca gdzie był.

- [ ] **Step 3: Verify generator nadal działa**

Run: `node scripts/generate-thumbnails.mjs --clean && node scripts/generate-thumbnails.mjs`
Expected: kompletna regeneracja, stdout kończy się `Done. Generated <N> thumbnails in <X>s.`. Manifest istnieje w `src/generated/responsive-image-manifest.json` z 166 wpisami.

- [ ] **Step 4: Napisz failing test parity**

Utwórz `scripts/__tests__/preset-parity.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { SECTION_WIDTHS } from '../lib/section-widths.mjs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const responsiveImageSource = readFileSync(
  resolve(__dirname, '../../src/lib/responsive-image.ts'),
  'utf8',
);

function extractPresetWidths(): Record<string, number[]> {
  const blockMatch = responsiveImageSource.match(
    /PRESET_WIDTHS:\s*Record<ImagePreset,\s*number\[\]>\s*=\s*\{([\s\S]*?)\}/,
  );
  if (!blockMatch) {
    throw new Error('Could not locate PRESET_WIDTHS in responsive-image.ts');
  }
  const body = blockMatch[1];
  const out: Record<string, number[]> = {};
  const entryRe = /'?([\w-]+)'?\s*:\s*\[([\d,\s]+)\]/g;
  let match: RegExpExecArray | null;
  while ((match = entryRe.exec(body)) !== null) {
    out[match[1]] = match[2]
      .split(',')
      .map((v) => parseInt(v.trim(), 10))
      .filter((n) => Number.isFinite(n));
  }
  return out;
}

const SECTION_TO_PRESET: Record<string, string> = {
  hero: 'hero',
  gallery: 'gallery',
  packshots: 'packshot',
  overview: 'overview',
  materials_full: 'materials-full',
  materials_thumb: 'materials-thumb',
};

describe('responsive-image preset parity', () => {
  const presetWidths = extractPresetWidths();

  it('every section in SECTION_WIDTHS has matching widths in PRESET_WIDTHS', () => {
    for (const [section, sectionWidths] of Object.entries(SECTION_WIDTHS)) {
      if (section === 'finishes') continue;
      const presetName = SECTION_TO_PRESET[section];
      expect(presetName, `no preset mapping for section "${section}"`).toBeDefined();
      const preset = presetWidths[presetName];
      expect(preset, `PRESET_WIDTHS missing "${presetName}"`).toBeDefined();
      expect([...preset].sort((a, b) => a - b)).toEqual(
        [...sectionWidths].sort((a, b) => a - b),
      );
    }
  });
});
```

- [ ] **Step 5: Run test, zweryfikuj że przechodzi (parity dziś istnieje)**

Run: `npm test -- scripts/__tests__/preset-parity`
Expected: `1 passed`. Jeżeli failuje — pokazuje konkretną sekcję która się rozjeżdża.

> ⚠ Test wykluczy `finishes` (klucz w `SECTION_WIDTHS` zostaje na razie w generatorze, ale w `PRESET_WIDTHS` zostanie usunięty w Tasku 11). Po Tasku 11 włączymy go z powrotem przez usunięcie `finishes` z `SECTION_WIDTHS` (Task 11, Step 5).

- [ ] **Step 6: Commit**

```bash
git add scripts/lib/section-widths.mjs scripts/generate-thumbnails.mjs scripts/__tests__/preset-parity.test.ts
git commit -m "refactor(images): extract SECTION_WIDTHS + add parity test with PRESET_WIDTHS"
```

---

## Task 2: Skonsoliduj duplikaty `catalogs/{id}/finishes/*.webp` → `shared/materials/`

**Files:**
- Modify: `src/lib/catalog-loader.ts:643`
- Delete: `public/catalogs/QX/finishes/*.webp`, `public/catalogs/QS/finishes/*.webp`

> **Pre-req — weryfikacja MD5 (wykonana 2026-05-06):** wszystkie 60 plików w `QX/finishes/` i 60 w `QS/finishes/` mają **bit-perfect identyczną zawartość** z odpowiednikami w `shared/materials/`. **Folder `catalogs/{id}/materials/` zawiera INNE pliki** (`metro X.webp`/`.png` — metro-prefixed configurator renders, NIE swatche) i pozostaje **nietknięty** w tym tasku.

To naprawia jednocześnie Bug #1 (zerowe pokrycie `_thumb` plików — bo plików już nie będzie) i Bug #2 (~5.4 MB duplikatów w git między `catalogs/{id}/finishes/` a `shared/materials/`).

- [ ] **Step 1: Dodaj `includeShared: true` w wywołaniu dla finishes**

W `src/lib/catalog-loader.ts` znajdź linię 643:

```ts
    discoverMaterialsConfigurator(finishesBase),
```

Zamień na:

```ts
    discoverMaterialsConfigurator(finishesBase, { includeShared: true }),
```

> Zmiana symetryczna do linii 642, gdzie `materialsBase` już ma `{ includeShared: true }`. Po tej zmianie konfigurator finishes będzie skanował `catalogs/{id}/finishes/` ORAZ `shared/materials/`. Jeżeli pliki w `catalogs/{id}/finishes/` zostaną usunięte (Step 4) — finishes dostaje swatche tylko z shared.

- [ ] **Step 2: Verify build na stanie z duplikatami**

Run: `npm run build`
Expected: build pass. FinishesQX powinien teraz mieć **30 swatchy** (15 z lokalnego finishes + 15 ze shared) bo nadal trzymamy duplikaty.

- [ ] **Step 3: Smoke test FinishesQX**

Run: `npm run dev`, otwórz `http://localhost:3000/catalog/QX#finishes`. Sprawdź że konfigurator pokazuje swatche (frame + desktop). Jeszcze przed usunięciem duplikatów upewnij się że `pickOption`/`scanMaterialsFolder` deduplikuje (pliki o tym samym kodzie z dwóch folderów). Per audyt to robi PackshotsQX, ale FinishesQX może pokazać podwójne wpisy do czasu Step 4.

> Jeżeli widzisz duplikaty w UI (np. dwa razy "RAL 9005") — to znaczy że dedup działa tylko w PackshotsQX, nie w MaterialsOptionGroup. Wtedy Step 4 załatwi to mechanicznie (usunięcie duplikatów źródła).

- [ ] **Step 4: Usuń pliki swatchy z `catalogs/QX/finishes/` i `catalogs/QS/finishes/` (zachowaj `content.json`)**

```bash
find public/catalogs/QX/finishes -type f -name '*.webp' -delete
find public/catalogs/QS/finishes -type f -name '*.webp' -delete
ls public/catalogs/QX/finishes
ls public/catalogs/QS/finishes
```

Expected output `ls`: tylko `content.json` w obu folderach.

- [ ] **Step 5: Regeneruj manifest**

Run: `node scripts/generate-thumbnails.mjs`
Expected: `Updated responsive image manifest for <N> assets.` gdzie `<N>` jest mniejsze niż 166 (po usunięciu 60 wpisów per katalog × 2 katalogi = 120 wpisów manifestu znika).

- [ ] **Step 6: Verify manifest nie ma `finishes` wpisów**

```bash
node -e "const m=require('./src/generated/responsive-image-manifest.json'); console.log(Object.keys(m).filter(k=>k.includes('/finishes/')).length)"
```

Expected: `0`.

- [ ] **Step 7: Verify smoke FinishesQX po deleci**

Run: `npm run dev`, otwórz `http://localhost:3000/catalog/QX#finishes`. Sprawdź:
- Konfigurator pokazuje 15 swatchy frame + desktop (z shared/materials/).
- Brak duplikatów.
- Tooltipy / labels poprawne (RAL 9005 itd.).
- Preview image (jeśli był z finishes/ folder) — sprawdź `data.previewImage` w `FinishesQX:256` i `:304`. Per [catalog-loader.ts:608](src/lib/catalog-loader.ts#L608) `resolveImage(finishesBase, finishes.previewImage)` — jeżeli `content.json` referuje obraz spoza usuniętych swatchy, OK; jeżeli odwołuje się do np. `RAL 9005.webp` (który właśnie usunęliśmy) — preview będzie pusty.

- [ ] **Step 8: Sprawdź czy `previewImage` w `content.json` referencjuje usunięty plik**

```bash
cat public/catalogs/QX/finishes/content.json | grep -E '"(preview|detail)Image"'
cat public/catalogs/QS/finishes/content.json | grep -E '"(preview|detail)Image"'
```

> Jeżeli stringi referują plik typu `"RAL 9005.webp"` lub `"U120 PLATINIUM GREY.webp"` — trzeba zmienić ścieżkę na shared (`/shared/materials/RAL 9005.webp`) albo zostawić tylko niesusunięte assety. Standardowy wzorzec to `previewImage` wskazujący na osobny render konfiguratora, nie swatch — więc najprawdopodobniej OK.

Jeżeli okazja referowania do usuniętego pliku — w `content.json` zmień ścieżkę na: `"/shared/materials/<nazwa>.webp"`.

- [ ] **Step 9: Commit**

```bash
git add src/lib/catalog-loader.ts public/catalogs/QX/finishes public/catalogs/QS/finishes src/generated/responsive-image-manifest.json
git commit -m "fix(catalog): consolidate finishes swatches to shared/materials, remove ~16MB duplicates"
```

---

## Task 3: Dodaj 2560w wariant do presetu `hero`

**Files:**
- Modify: `scripts/lib/section-widths.mjs`, `src/lib/responsive-image.ts:24`

P1 z audytu: hero jest LCP elementem; dziś browser na retina/4K pobiera 215 KB oryginał zamiast ~85 KB wariantu.

- [ ] **Step 1: Zaktualizuj `SECTION_WIDTHS.hero` w `scripts/lib/section-widths.mjs`**

Zamień:
```js
  hero: [640, 1280, 1920],
```
na:
```js
  hero: [640, 1280, 1920, 2560],
```

- [ ] **Step 2: Zaktualizuj `PRESET_WIDTHS.hero` w `src/lib/responsive-image.ts:24`**

Zamień:
```ts
  hero: [640, 1280, 1920],
```
na:
```ts
  hero: [640, 1280, 1920, 2560],
```

- [ ] **Step 3: Run parity test**

Run: `npm test -- scripts/__tests__/preset-parity`
Expected: `1 passed`. Test sprawdza że `[640,1280,1920,2560]` w obu plikach.

- [ ] **Step 4: Wygeneruj brakujące thumby**

Run: `node scripts/generate-thumbnails.mjs`
Expected: stdout zawiera `hero: <N> thumbnails` z N>0 (generuje brakujące 2560w dla wszystkich oryginałów hero które są ≥2560px). Sprawdź:

```bash
ls public/catalogs/QX/hero/*-2560w.webp
ls public/catalogs/QS/hero/*-2560w.webp
```

Expected: po jednym pliku `*-2560w.webp` per oryginał hero (oryginały to 4000×2000, więc 2560 < 4000 → wariant powstanie).

- [ ] **Step 5: Verify manifest**

```bash
node -e "const m=require('./src/generated/responsive-image-manifest.json'); const hero=Object.entries(m).filter(([k])=>k.includes('/hero/')); for (const [k,v] of hero) console.log(k, v)"
```

Expected: każdy hero asset ma `[640, 1280, 1920, 2560]` w manifeście.

- [ ] **Step 6: Smoke test (DevTools network)**

Run: `npm run dev`. Otwórz `http://localhost:3000` na 1080p (DPR=1) — browser powinien wybrać `1280w` lub `1920w`. W DevTools → Network → filtruj `hero` → kliknij na request → Headers → "Request URL" — powinien być `*-1280w.webp` lub `*-1920w.webp`. Następnie zsymuluj retina: w DevTools Sensors → Device pixel ratio = 2 → odśwież → powinno być `*-2560w.webp`.

- [ ] **Step 7: Commit**

```bash
git add scripts/lib/section-widths.mjs src/lib/responsive-image.ts public/catalogs src/generated/responsive-image-manifest.json
git commit -m "feat(images): add 2560w hero variant for retina/4K LCP"
```

---

## Task 4: Rozszerz preset `materials-full` o 1200/1600w

**Files:**
- Modify: `scripts/lib/section-widths.mjs`, `src/lib/responsive-image.ts:29`

P1: `materials-full` używany w MaterialsQX configurator (slot 687px → 1374px DPR2) i FinishesQX lightbox (slot 1267px → 2534px DPR2). Dziś sięga oryginału.

- [ ] **Step 1: Zaktualizuj `SECTION_WIDTHS.materials_full`**

Zamień:
```js
  materials_full: [400, 800],
```
na:
```js
  materials_full: [400, 800, 1200, 1600],
```

- [ ] **Step 2: Zaktualizuj `PRESET_WIDTHS['materials-full']`**

Zamień:
```ts
  'materials-full': [400, 800],
```
na:
```ts
  'materials-full': [400, 800, 1200, 1600],
```

- [ ] **Step 3: Parity test**

Run: `npm test -- scripts/__tests__/preset-parity`
Expected: `1 passed`.

- [ ] **Step 4: Regeneruj thumby**

Run: `node scripts/generate-thumbnails.mjs`
Expected: nowe `*-1200w.webp` i `*-1600w.webp` w `shared/materials/` (jeżeli oryginały są ≥1200/1600). Sprawdź:

```bash
ls public/shared/materials/*-1200w.webp 2>&1 | head -3
ls public/shared/materials/*-1600w.webp 2>&1 | head -3
```

> Niektóre oryginały mogą być <1200 lub <1600 (sprawdziliśmy `RAL 9005.webp` = 1600×1600 — wariant 1600w skipowany bo `w >= originalWidth`). To OK — generator gracefully skipuje, manifest zawiera tylko realne warianty.

- [ ] **Step 5: Smoke test MaterialsQX i FinishesQX configuratorów**

Run: `npm run dev`. Otwórz:
- `http://localhost:3000/catalog/QX#materials` → kliknij rożne swatche → preview powinien się aktualizować.
- `http://localhost:3000/catalog/QX#finishes` → kliknij swatch → otwórz lightbox (kliknij na preview) → sprawdź network: pobiera `*-1600w.webp` (lub oryginał, jeśli oryginał jest <1600).

- [ ] **Step 6: Commit**

```bash
git add scripts/lib/section-widths.mjs src/lib/responsive-image.ts public/shared/materials src/generated/responsive-image-manifest.json
git commit -m "feat(images): add 1200w + 1600w to materials-full preset for configurator/lightbox retina"
```

---

## Task 5: Dodaj 1600w do presetu `gallery`

**Files:**
- Modify: `scripts/lib/section-widths.mjs`, `src/lib/responsive-image.ts:25`

P1: GalleryQX main image slot 1081px → 2162px DPR2. Dziś browser pobiera oryginał (np. 1.5 MB `office-lifestyle.webp`).

- [ ] **Step 1: Zaktualizuj `SECTION_WIDTHS.gallery`**

Zamień:
```js
  gallery: [400, 800, 1200],
```
na:
```js
  gallery: [400, 800, 1200, 1600],
```

- [ ] **Step 2: Zaktualizuj `PRESET_WIDTHS.gallery`**

Zamień:
```ts
  gallery: [400, 800, 1200],
```
na:
```ts
  gallery: [400, 800, 1200, 1600],
```

- [ ] **Step 3: Parity test + regen + smoke**

```bash
npm test -- scripts/__tests__/preset-parity
node scripts/generate-thumbnails.mjs
ls public/catalogs/QX/gallery/*-1600w.webp | head -3
```

Expected: parity pass, `*-1600w.webp` powstają dla galerii (oryginały typu 3000×3000 i 4000×3000).

- [ ] **Step 4: Smoke test**

`npm run dev` → `http://localhost:3000/catalog/QX#gallery` → otwórz lightbox dla głównego obrazu → DevTools network: na DPR=2 powinno pobrać `*-1600w.webp` zamiast oryginału.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/section-widths.mjs src/lib/responsive-image.ts public/catalogs src/generated/responsive-image-manifest.json
git commit -m "feat(images): add 1600w to gallery preset for retina main image + lightbox"
```

---

## Task 6: Wprowadź dedykowany preset `gallery-thumb [256, 512]`

**Files:**
- Modify: `scripts/lib/section-widths.mjs`, `src/lib/responsive-image.ts`, `src/layouts/qx/GalleryQX.tsx:128–138`, `scripts/__tests__/preset-parity.test.ts:23-30`

P2: galerii thumbnaile 255px slot dziś biorą 400w (+57% nadmiar). Osobny preset zamiast pchać 256w do głównego `gallery` (które już ma 400/800/1200/1600).

- [ ] **Step 1: Dodaj `gallery_thumb` do `SECTION_WIDTHS`**

W `scripts/lib/section-widths.mjs` dodaj klucz po `gallery`:

```js
  gallery: [400, 800, 1200, 1600],
  gallery_thumb: [256, 512],
```

- [ ] **Step 2: Wpięcie generatora do galerii (split logic)**

W `scripts/generate-thumbnails.mjs` znajdź funkcję która obsługuje `galleryDir` (linie 359–361):

```js
    // Gallery
    const galleryDir = path.join(catalogPath, 'gallery');
    const galleryCount = await processDirectory(galleryDir, SECTION_WIDTHS.gallery, force);
    if (galleryCount) console.log(`    gallery: ${galleryCount} thumbnails`);
```

Generator dziś nie ma podziału thumb/main w gallery folderze — wszystkie obrazy dostają ten sam preset. **To jest OK:** dodajemy oddzielny preset *konsumpcyjny* (`gallery-thumb`) który będzie używany w `responsiveImg(..., 'gallery-thumb')` — generator nadal robi 4 warianty (`400/800/1200/1600`), my po prostu dodatkowo wymusimy generację mniejszego wariantu (`256, 512`) dla wszystkich gallery assetów.

Zmień powyższy fragment na:

```js
    // Gallery (main + thumbnail variants)
    const galleryDir = path.join(catalogPath, 'gallery');
    const galleryWidths = [
      ...SECTION_WIDTHS.gallery,
      ...SECTION_WIDTHS.gallery_thumb,
    ];
    const galleryCount = await processDirectory(galleryDir, galleryWidths, force);
    if (galleryCount) console.log(`    gallery: ${galleryCount} thumbnails`);
```

> Każdy plik gallery dostanie 6 wariantów: `[256, 400, 512, 800, 1200, 1600]`. Dla 9 plików × 2 katalogi to ~36 dodatkowych thumby ≈ 200 KB całości. Akceptowalne.

- [ ] **Step 3: Dodaj preset `gallery-thumb` do `PRESET_WIDTHS` i `PRESET_SIZES`**

W `src/lib/responsive-image.ts`:

Linia 14–22 — rozszerz typ `ImagePreset`:
```ts
export type ImagePreset =
  | 'hero'
  | 'gallery'
  | 'gallery-thumb'
  | 'packshot'
  | 'overview'
  | 'materials-full'
  | 'materials-thumb';
```

Linia 23–31 — `PRESET_WIDTHS`:
```ts
const PRESET_WIDTHS: Record<ImagePreset, number[]> = {
  hero: [640, 1280, 1920, 2560],
  gallery: [400, 800, 1200, 1600],
  'gallery-thumb': [256, 512],
  packshot: [480, 960, 1440],
  overview: [400, 800],
  'materials-full': [400, 800, 1200, 1600],
  'materials-thumb': [96, 192],
};
```

> Zauważ: usuwamy `finishes` z `PRESET_WIDTHS` (był martwy — Task 11 to formalizuje, ale tutaj robimy jednym ruchem żeby parity-test przeszedł). Jeżeli pojawi się TypeScript error w innym miejscu — tam użyto `'finishes'` jako preset, do zmiany w Tasku 11.

Linia 37–45 — `PRESET_SIZES`:
```ts
const PRESET_SIZES: Record<ImagePreset, string> = {
  hero: '100vw',
  gallery: '(min-width: 1024px) 33vw, 50vw',
  'gallery-thumb': '(min-width: 1440px) 255px, (min-width: 1024px) 18vw, 33vw',
  packshot: '(min-width: 1280px) 560px, (min-width: 640px) 46vw, 94vw',
  overview: '(min-width: 1024px) 50vw, 100vw',
  'materials-full': '(min-width: 1024px) 50vw, 100vw',
  'materials-thumb': '96px',
};
```

- [ ] **Step 4: Zaktualizuj GalleryQX żeby używał `gallery-thumb` dla 3 thumbnaili**

W `src/layouts/qx/GalleryQX.tsx:131–137`:

Zamień:
```tsx
                  <img
                    src={img.src}
                    {...responsiveImg(
                      img.src,
                      'gallery',
                      '(min-width: 1440px) 255px, (min-width: 1024px) 18vw, 33vw',
                    )}
                    alt={img.alt}
```

na:
```tsx
                  <img
                    src={img.src}
                    {...responsiveImg(img.src, 'gallery-thumb')}
                    alt={img.alt}
```

> Default sizes presetu `gallery-thumb` jest identyczny z dotychczasowym overridem w GalleryQX, więc override nie jest już potrzebny.

- [ ] **Step 5: Zaktualizuj test parity dla nowego presetu**

W `scripts/__tests__/preset-parity.test.ts` znajdź mapę `SECTION_TO_PRESET` (po linii ~22) i dodaj wpis:

```ts
const SECTION_TO_PRESET: Record<string, string> = {
  hero: 'hero',
  gallery: 'gallery',
  gallery_thumb: 'gallery-thumb',
  packshots: 'packshot',
  overview: 'overview',
  materials_full: 'materials-full',
  materials_thumb: 'materials-thumb',
};
```

- [ ] **Step 6: Run testy + regen**

```bash
npm test -- scripts/__tests__/preset-parity
npm run typecheck
node scripts/generate-thumbnails.mjs
ls public/catalogs/QX/gallery/*-256w.webp | head -3
```

Expected: parity pass, typecheck clean, `*-256w.webp` powstają dla wszystkich gallery assetów.

- [ ] **Step 7: Smoke test**

`npm run dev` → `http://localhost:3000/catalog/QX#gallery` → DevTools network → kliknij thumbnail → request URL: `*-256w.webp` (DPR=1) lub `*-512w.webp` (DPR=2). Wcześniej był `*-400w.webp`.

- [ ] **Step 8: Commit**

```bash
git add scripts/lib/section-widths.mjs scripts/generate-thumbnails.mjs src/lib/responsive-image.ts src/layouts/qx/GalleryQX.tsx scripts/__tests__/preset-parity.test.ts public/catalogs src/generated/responsive-image-manifest.json
git commit -m "feat(images): add gallery-thumb preset [256,512] for sidebar thumbs"
```

---

## Task 7: Dodaj watchdog test dla `overview/` źródeł

**Files:**
- Create: `scripts/__tests__/overview-min-size.test.ts`

P1 z audytu: `overview/packshot.webp` to 1000×1500 — za małe na DPR=2 (1440px potrzebne). Powiększenie wymaga assetu od fotografa (poza zakresem implementacyjnym), ale **dodajemy test który blokuje dodanie nowych obrazów <1500w do overview folderu**, żeby problem nie eskalował.

- [ ] **Step 1: Napisz test sprawdzający min-size dla overview**

Utwórz `scripts/__tests__/overview-min-size.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import sharp from 'sharp';

const MIN_OVERVIEW_WIDTH = 1500;
const PUBLIC_CATALOGS = resolve(__dirname, '../../public/catalogs');

async function getImagesInOverview(): Promise<string[]> {
  const out: string[] = [];
  for (const catalog of readdirSync(PUBLIC_CATALOGS)) {
    const overviewDir = join(PUBLIC_CATALOGS, catalog, 'overview');
    try {
      statSync(overviewDir);
    } catch {
      continue;
    }
    for (const file of readdirSync(overviewDir)) {
      if (!/\.(webp|jpe?g|png)$/i.test(file)) continue;
      if (/-\d+w\.\w+$/.test(file)) continue;
      out.push(join(overviewDir, file));
    }
  }
  return out;
}

describe('overview/ source images', () => {
  it('every original image is at least 1500px wide for retina coverage', async () => {
    const images = await getImagesInOverview();
    expect(images.length, 'no overview images found').toBeGreaterThan(0);

    const tooSmall: { path: string; width: number }[] = [];
    for (const path of images) {
      const meta = await sharp(path).metadata();
      const width = meta.width ?? 0;
      if (width < MIN_OVERVIEW_WIDTH) {
        tooSmall.push({ path, width });
      }
    }

    if (tooSmall.length > 0) {
      const summary = tooSmall
        .map(({ path, width }) => `  ${path} → ${width}px`)
        .join('\n');
      throw new Error(
        `Overview images smaller than ${MIN_OVERVIEW_WIDTH}px (DPR=2 retina need):\n${summary}\n` +
          `Replace originals with ≥${MIN_OVERVIEW_WIDTH}px-wide assets, or update OverviewQX to use a smaller layout slot.`,
      );
    }
  });
});
```

- [ ] **Step 2: Run test — powinien failować dla aktualnego stanu (1000×1500)**

Run: `npm test -- scripts/__tests__/overview-min-size`
Expected: **FAIL** z komunikatem `Overview images smaller than 1500px ... QX/overview/packshot.webp → 1000px`. To jest oczekiwane — test wykrył znany problem z audytu.

- [ ] **Step 3: Tymczasowo `skip` test z linkiem do follow-upu**

W teście zmień `it(...)` na `it.skip(...)` z dopiskiem komentarza:

```ts
  // Skipped: known issue tracked in TODO.md.
  // Re-enable after replacing public/catalogs/QX/overview/packshot.webp with ≥1500px asset.
  it.skip('every original image is at least 1500px wide for retina coverage', async () => {
```

> Test jest na siłę negatywny dziś. Zostawiamy go `skip`-niętego, żeby:
> - Nie blokować buildu.
> - Drugi developer otwierając plik widzi precyzyjny opis warunku do spełnienia.
> - Po podmianie assetu wystarczy usunąć `.skip` i `Why:`-komentarz.

- [ ] **Step 4: Dopisz follow-up do TODO.md**

W `TODO.md` (na końcu) dodaj:

```markdown

## Responsive images — known issues (2026-05-06)

- [ ] Replace `public/catalogs/QX/overview/packshot.webp` (1000×1500) and `QS/overview/packshot.webp` with ≥1500px-wide assets (DPR=2 needs 1440px). After replacement: re-enable test in `scripts/__tests__/overview-min-size.test.ts` (`it.skip` → `it`) and run `npm run thumbnails:force` to regenerate variants. See [docs/responsive-images-audit-2026-05-06.md](docs/responsive-images-audit-2026-05-06.md) §3 "Overview".
```

- [ ] **Step 5: Run wszystkie testy żeby potwierdzić skip działa**

Run: `npm test`
Expected: wszystkie testy pass (1 skip).

- [ ] **Step 6: Commit**

```bash
git add scripts/__tests__/overview-min-size.test.ts TODO.md
git commit -m "test(images): add overview min-size watchdog (skipped pending asset replacement)"
```

---

## Task 8: Zsynchronizuj domyślny `PRESET_SIZES.packshot` z faktycznym overridem

**Files:**
- Modify: `src/lib/responsive-image.ts:40`

P2: default w pliku mówi `(min-width: 1280px) 560px`, faktyczne użycie w `PackshotsQX:273` to `(min-width: 1440px) 710px`. Default jest mylący dla nowych callsite'ów.

- [ ] **Step 1: Zaktualizuj `PRESET_SIZES.packshot`**

W `src/lib/responsive-image.ts:40` zamień:

```ts
  packshot: '(min-width: 1280px) 560px, (min-width: 640px) 46vw, 94vw',
```

na:

```ts
  packshot: '(min-width: 1440px) 710px, (min-width: 640px) 46vw, 94vw',
```

- [ ] **Step 2: Usuń teraz-redundantny override w `PackshotsQX.tsx:270-274`**

W `src/layouts/qx/PackshotsQX.tsx:270-274` zamień:

```tsx
                    {...responsiveImg(
                      item.image,
                      'packshot',
                      '(min-width: 1440px) 710px, (min-width: 640px) 46vw, 94vw',
                    )}
```

na:

```tsx
                    {...responsiveImg(item.image, 'packshot')}
```

> Override = identyczny z nowym defaultem → DRY.

- [ ] **Step 3: Verify build + typecheck + smoke**

```bash
npm run typecheck
npm run build
npm run dev
```

Otwórz `http://localhost:3000/catalog/QX#packshots` → DevTools → network → kliknij obrazek → URL `*-1440w.webp` (DPR=2) lub `*-960w.webp` (DPR=1).

- [ ] **Step 4: Commit**

```bash
git add src/lib/responsive-image.ts src/layouts/qx/PackshotsQX.tsx
git commit -m "refactor(images): sync PRESET_SIZES.packshot default with actual layout, remove redundant override"
```

---

## Task 9: Zaktualizuj domyślny `PRESET_SIZES.gallery` na faktyczny layout main image

**Files:**
- Modify: `src/lib/responsive-image.ts:39`, `src/layouts/qx/GalleryQX.tsx:106-110`

P2: gallery default mówi 33vw (multi-column thumb pattern), faktyczne użycie main image to 1081px @1440. Po Tasku 6 thumbnaile mają osobny preset, więc default `gallery` służy już tylko obrazowi głównemu.

- [ ] **Step 1: Zaktualizuj `PRESET_SIZES.gallery`**

W `src/lib/responsive-image.ts:39` zamień:

```ts
  gallery: '(min-width: 1024px) 33vw, 50vw',
```

na:

```ts
  gallery: '(min-width: 1440px) 1081px, (min-width: 1024px) 75vw, 100vw',
```

- [ ] **Step 2: Usuń redundantny override w `GalleryQX.tsx:106-110`**

W `src/layouts/qx/GalleryQX.tsx:104-110` zamień:

```tsx
              <img
                src={mainImage.src}
                {...responsiveImg(
                  mainImage.src,
                  'gallery',
                  '(min-width: 1440px) 1081px, (min-width: 1024px) 75vw, 100vw',
                )}
```

na:

```tsx
              <img
                src={mainImage.src}
                {...responsiveImg(mainImage.src, 'gallery')}
```

- [ ] **Step 3: Verify**

```bash
npm run typecheck
npm run build
```

Smoke: `npm run dev` → `http://localhost:3000/catalog/QX#gallery` → main image → DPR=2 powinno wybrać `*-1600w.webp` (z Task 5).

- [ ] **Step 4: Commit**

```bash
git add src/lib/responsive-image.ts src/layouts/qx/GalleryQX.tsx
git commit -m "refactor(images): sync PRESET_SIZES.gallery with main image layout, remove redundant override"
```

---

## Task 10: Usuń martwy preset `finishes`

**Files:**
- Modify: `scripts/lib/section-widths.mjs`, `src/lib/responsive-image.ts`, `scripts/generate-thumbnails.mjs:369-377`, `scripts/__tests__/preset-parity.test.ts`

P2: po Tasku 2 folder `catalogs/{id}/finishes/` ma tylko `content.json` (bez obrazów). Preset `finishes` w `PRESET_WIDTHS` był już usunięty w Task 6 Step 3 (jeśli wykonano), tutaj porządkujemy resztę.

- [ ] **Step 1: Sprawdź czy `'finishes'` jest jeszcze w `PRESET_WIDTHS`**

Run: `grep -n "'finishes'\|finishes:" src/lib/responsive-image.ts`

Jeżeli linia typu `finishes: [400, 800],` jeszcze istnieje w `PRESET_WIDTHS` lub `PRESET_SIZES` — usuń ją.

Jeżeli `'finishes'` jest w `ImagePreset` typie — usuń wpis `| 'finishes'`.

- [ ] **Step 2: Usuń `finishes` z `SECTION_WIDTHS`**

W `scripts/lib/section-widths.mjs` usuń linię:

```js
  finishes: [400, 800],
```

- [ ] **Step 3: Wytnij blok obsługi `finishes/` z generatora**

W `scripts/generate-thumbnails.mjs:369-377` usuń cały blok:

```js
    // Finishes
    const finishesDir = path.join(catalogPath, 'finishes');
    const finishesCount = await processDirectory(
      finishesDir,
      SECTION_WIDTHS.finishes,
      force,
    );
    if (finishesCount) {
      console.log(`    finishes: ${finishesCount} thumbnails`);
    }
```

I usuń `finishesCount +` z agregacji `totalGenerated +=` (po linii 393):

```js
    totalGenerated +=
      heroCount +
      galleryCount +
      overviewCount +
      finishesCount +  // <-- USUŃ tę linię
      packshotsCount +
      materialsCount;
```

> Zostaje:
```js
    totalGenerated +=
      heroCount +
      galleryCount +
      overviewCount +
      packshotsCount +
      materialsCount;
```

- [ ] **Step 4: Włącz `finishes` z powrotem do parity test**

W `scripts/__tests__/preset-parity.test.ts` znajdź linię:

```ts
      if (section === 'finishes') continue;
```

Usuń tę linię. Teraz `SECTION_WIDTHS` nie ma już `finishes`, więc loop nie będzie próbował go znaleźć w `PRESET_WIDTHS`.

- [ ] **Step 5: Run pełną suite testów**

```bash
npm test
npm run typecheck
```

Expected: wszystkie testy pass; typecheck clean (0 błędów). Jeśli jakiś plik tsx miał `responsiveImg(..., 'finishes')` — typecheck pokaże gdzie. **Per audyt punkt 4 — `finishes` preset nie jest używany w żadnym layoucie**, więc spodziewane: clean.

- [ ] **Step 6: Verify generator po usunięciu**

Run: `node scripts/generate-thumbnails.mjs --clean && node scripts/generate-thumbnails.mjs`
Expected: stdout nie zawiera już sekcji `finishes:`. Manifest ma tylko entries z `hero/`, `gallery/`, `overview/`, `packshots/`, `materials/`, `shared/materials/`.

- [ ] **Step 7: Commit**

```bash
git add scripts/lib/section-widths.mjs scripts/generate-thumbnails.mjs src/lib/responsive-image.ts scripts/__tests__/preset-parity.test.ts src/generated/responsive-image-manifest.json
git commit -m "refactor(images): remove dead 'finishes' preset (post-consolidation cleanup)"
```

---

## Task 11: Napisz test jednostkowy dla `responsiveProps()`

**Files:**
- Create: `src/lib/responsive-image.test.ts`

P3: zabezpieczenie przyszłych refaktorów — test sanity-check buildowania srcset i fallbacku do presetu gdy brak wpisu w manifeście.

- [ ] **Step 1: Napisz failing test**

Utwórz `src/lib/responsive-image.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { responsiveProps } from './responsive-image';

describe('responsiveProps', () => {
  it('returns undefined for empty src', () => {
    expect(responsiveProps('', 'hero')).toBeUndefined();
    expect(responsiveProps(undefined, 'hero')).toBeUndefined();
  });

  it('returns undefined for external URLs', () => {
    expect(responsiveProps('https://example.com/img.webp', 'hero')).toBeUndefined();
  });

  it('returns undefined for SVG sources', () => {
    expect(responsiveProps('/catalogs/QX/metro_logo.svg', 'hero')).toBeUndefined();
  });

  it('returns undefined for already-generated thumbnail (recursion guard)', () => {
    expect(
      responsiveProps('/catalogs/QX/hero/img-640w.webp', 'hero'),
    ).toBeUndefined();
  });

  it('uses manifest widths when src is in manifest', () => {
    const result = responsiveProps(
      '/catalogs/QX/hero/02_26_Metro_QX_HERO_1_R3-clean_noise_thumb.webp',
      'hero',
    );
    expect(result).toBeDefined();
    expect(result!.srcSet).toContain('-640w.webp 640w');
    expect(result!.srcSet).toContain('-1280w.webp 1280w');
    expect(result!.srcSet).toContain('-1920w.webp 1920w');
    expect(result!.srcSet).toContain('-2560w.webp 2560w');
    expect(result!.srcSet).toContain(
      '/catalogs/QX/hero/02_26_Metro_QX_HERO_1_R3-clean_noise_thumb.webp 4000w',
    );
    expect(result!.sizes).toBe('100vw');
  });

  it('uses sizesOverride when provided', () => {
    const result = responsiveProps(
      '/catalogs/QX/hero/02_26_Metro_QX_HERO_1_R3-clean_noise_thumb.webp',
      'hero',
      '50vw',
    );
    expect(result!.sizes).toBe('50vw');
  });

  it('falls back to PRESET_WIDTHS for unmanaged paths not in manifest', () => {
    const result = responsiveProps(
      '/some/other/path/image.webp',
      'hero',
    );
    expect(result).toBeDefined();
    expect(result!.srcSet).toContain('-640w.webp 640w');
    expect(result!.srcSet).toContain('-2560w.webp 2560w');
  });

  it('returns undefined for managed asset missing from manifest (no widths fallback)', () => {
    // Managed prefix but not in manifest → empty array → undefined
    const result = responsiveProps(
      '/catalogs/NOPE/hero/missing.webp',
      'hero',
    );
    expect(result).toBeUndefined();
  });

  it('uses gallery-thumb preset sizes by default', () => {
    const result = responsiveProps(
      '/some/path/thumb.webp',
      'gallery-thumb',
    );
    expect(result!.sizes).toBe(
      '(min-width: 1440px) 255px, (min-width: 1024px) 18vw, 33vw',
    );
  });
});
```

- [ ] **Step 2: Run testów**

Run: `npm test -- src/lib/responsive-image`
Expected: `9 passed`. Jeżeli pierwszy test "uses manifest widths" failuje — sprawdź czy hero asset faktycznie jest w manifeście (po Task 3 powinien mieć `2560`).

- [ ] **Step 3: Commit**

```bash
git add src/lib/responsive-image.test.ts
git commit -m "test(images): add responsiveProps unit tests (manifest, presets, edge cases)"
```

---

## Task 12: Final verification — pełny build + manifest sanity

**Files:**
- żadne (tylko run + commit jeśli manifest się zmieni)

- [ ] **Step 1: Force-regen manifestu**

Run: `npm run thumbnails:force`
Expected: pełna regeneracja, kończy się `Updated responsive image manifest for <N> assets.`. Liczba `<N>` powinna wzrosnąć z dotychczasowej (~46 po Task 2 usunął finishes) o liczbę nowych wariantów: 4 hero × 2 (2560w) + 9 gallery × 2 (1600w) + 9 gallery × 2 (256w + 512w) + 13 materials_full per swatch × ~30 wariantów × 2 nowych (1200w, 1600w gdzie source ≥). Konkretna liczba zależy od oryginałów ale powinna być w okolicach 200+ wpisów.

- [ ] **Step 2: Run pełna baterie testów**

Run: `npm test && npm run lint && npm run typecheck && npm run build`
Expected:
- `npm test`: wszystkie testy pass (z 1 skip overview-min-size)
- `npm run lint`: zero nowych warningów
- `npm run typecheck`: 0 błędów
- `npm run build`: SSG buduje, brak ostrzeżeń o brakujących obrazach

- [ ] **Step 3: Snapshot rozmiaru**

```bash
du -sh public/catalogs/QX public/catalogs/QS public/shared
echo "manifest assets:"
node -e "console.log(Object.keys(require('./src/generated/responsive-image-manifest.json')).length)"
```

Spodziewane (zgrubsze):
- `public/catalogs/QX` — spadek o ~2.7 MB (usunięty `finishes/*.webp`)
- `public/catalogs/QS` — spadek o ~2.7 MB
- `public/shared` — bez zmian (~2.7 MB)
- manifest assets — wzrost względem 166 (+ kilkadziesiąt nowych wariantów)

- [ ] **Step 4: Commit (jeżeli manifest się zmienił od poprzednich tasków)**

```bash
git status
# Jeśli src/generated/responsive-image-manifest.json ma diff:
git add src/generated/responsive-image-manifest.json
git commit -m "chore(images): regenerate manifest after preset expansions"
```

---

## Self-Review Checklist (wykonane)

**Spec coverage** (z [responsive-images-audit-2026-05-06.md](../../responsive-images-audit-2026-05-06.md) §6):
- P0.1 (finishes generator bug) — Task 2 (consolidation usuwa pliki, więc bug znika) ✓
- P0.2 (duplicate consolidation) — Task 2 ✓
- P1.3 (2560w hero) — Task 3 ✓
- P1.4 (1200/1600w materials-full) — Task 4 ✓
- P1.5 (1600w gallery) — Task 5 ✓
- P1.6 (overview origin enlargement) — Task 7 (watchdog test + TODO follow-up; podmiana assetu poza zakresem implementacyjnym) ✓
- P2.7 (256w gallery thumb) — Task 6 ✓
- P2.8 (sync packshot sizes default) — Task 8 ✓
- P2.9 (sync gallery sizes default) — Task 9 ✓
- P2.10 (remove dead `finishes` preset) — Task 10 ✓
- P3.11 (parity sanity-check test) — Task 1 + Task 11 ✓
- P3.12 (Lighthouse CI) — **explicit out of scope** — wymaga osobnego planu CI/observability ✓

**Placeholder scan:** brak "TBD"/"TODO inside steps". Każdy krok ma kod albo dokładną komendę. Step 8 w T2 zawiera warunkową logikę ("jeżeli previewImage referuje usunięty plik...") — to świadome, bo content.json w QX/QS może referować różne pliki. Engineer ma instrukcję co sprawdzić i jak naprawić.

**Type consistency:**
- `'gallery-thumb'` jako preset — dodawany do `ImagePreset` w T6S3 i używany w T6S4 (GalleryQX) + T11 (test). Spójnie.
- `'finishes'` preset — usuwany w T6S3 (z `PRESET_WIDTHS`) i potwierdzany w T10S1 (sanity check). Symetria.
- `SECTION_WIDTHS.gallery_thumb` (snake_case) ↔ `'gallery-thumb'` (kebab-case w PRESET_WIDTHS) — mapowanie jawne w `SECTION_TO_PRESET` w teście parity (T1S4 + T6S5).
- `discoverMaterialsConfigurator(finishesBase, { includeShared: true })` — typ `{ includeShared?: boolean }` istnieje już w [catalog-loader.ts:365](src/lib/catalog-loader.ts#L365), więc dodanie opcji w T2S1 jest type-safe.
