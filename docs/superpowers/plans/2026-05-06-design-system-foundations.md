# Design System Foundations — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Naprawić najważniejsze braki fundamentalne design-systemu zidentyfikowane w [docs/design-system-audit-2026-05-06.md](../../design-system-audit-2026-05-06.md): brakujące tokeny (warning, shadow, z-index, chart), reużywalne komponenty (`ColorChip`, `Lightbox`, `SectionShell`, `SectionHeading`), walidację schematu treści (Zod) oraz uruchomienie infrastruktury testów Vitest.

**Architecture:** Dodajemy tokeny w jednym źródle prawdy (`src/app/globals.css`) i replikujemy je do rejestru (`src/lib/design-tokens.ts`) z testem walidującym synchronizację. Wyciągamy `ColorChip` i lightbox do `src/components/catalog/` jako shared komponenty. Wprowadzamy `SectionShell` + `SectionHeading` jako wspólny scaffold layoutu i migrujemy `OverviewQX` jako proof-of-concept (pełna migracja pozostałych 10 layoutów to follow-up). Dodajemy Zod schemy dla `hero/content.json` i `packshots/content.json` z walidacją parse-time w `catalog-loader.ts`.

**Tech Stack:** Next.js 15.5 (App Router) · React 19 · TypeScript 5.9 · Tailwind 3.4 · framer-motion 12 · Zod 3.23 · **Vitest** (zostaje zainstalowany w Tasku 1) · @testing-library/react · jsdom

**Niewchodzi w zakres tego planu (osobne plany / brainstormingi):**
- Storybook + visual regression (Plan 2)
- Strona produktu + konfigurator z ceną (Plan 3)
- Brand-scoping `qs0` + implementacja Type2/Type3 (Plan 4)
- Pełna migracja wszystkich 11 QX layoutów na `SectionShell` (zostaje task po Plan 1 jako nieblokujący follow-up)
- I18n, OG meta, container queries, brand assets

---

## File Structure

**Create:**
- `vitest.config.ts` — konfiguracja runnera testów + jsdom
- `src/components/catalog/ColorChip.tsx` — wyciągnięty komponent + jego test
- `src/components/catalog/ColorChip.test.tsx`
- `src/components/catalog/Lightbox.tsx` — wyciągnięty komponent + jego test
- `src/components/catalog/Lightbox.test.tsx`
- `src/components/catalog/SectionShell.tsx` — wspólny wrapper + jego test
- `src/components/catalog/SectionShell.test.tsx`
- `src/components/catalog/SectionHeading.tsx` — wspólny header sekcji + jego test
- `src/components/catalog/SectionHeading.test.tsx`
- `src/lib/schemas/hero.ts` — Zod schema dla `hero/content.json`
- `src/lib/schemas/packshots.ts` — Zod schema dla `packshots/content.json`
- `src/lib/schemas/index.ts` — barrel export
- `src/lib/schemas/schemas.test.ts` — testy parse() na fixturach
- `src/lib/design-tokens.test.ts` — assert: `colorTokens` ⊇ tokeny w `globals.css`

**Modify:**
- `package.json` — devDependencies (vitest, @testing-library, jsdom, @vitejs/plugin-react), scripts (test, test:watch)
- `src/app/globals.css` — dodać `--warning`, `--warning-foreground`, `--shadow-{sm,md,lg,xl}`, `--z-{base,dropdown,sticky,modal,popover,tooltip}`, `--chart-{1..5}` w `:root` i `.dark`
- `tailwind.config.ts` — zmapować nowe tokeny pod `colors.warning`, `boxShadow`, `zIndex`, `colors.chart`
- `src/lib/design-tokens.ts` — dodać wpisy `Warning`, `Warning foreground`, `Chart 1..5`
- `src/lib/catalog-loader.ts` — wpiąć `parseHeroContent` / `parsePackshotsContent` w odczytach JSON
- `src/layouts/qx/PackshotsQX.tsx` — usunąć inline `ColorChip`, importować z `@/components/catalog/ColorChip`
- `src/layouts/qx/GalleryQX.tsx` — usunąć inline lightbox, użyć `Lightbox`
- `src/layouts/qx/OverviewQX.tsx` — przenieść scaffold do `SectionShell` + `SectionHeading` (proof-of-concept)
- `src/test/setup.ts` — dodać import `vi` mocku dla framer-motion `useInView`

**Delete:** żadne (wyciągnięcie ≠ usunięcie kontraktów; wszystkie zmiany kompatybilne wstecz).

---

## Task 1: Wire up Vitest test infrastructure

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`, `src/test/setup.ts`

Aktualnie `src/test/setup.ts` i `src/test/example.test.ts` istnieją, ale `vitest` nie jest w `devDependencies` i brak skryptu `test` w `package.json`. Bez tego TDD jest niemożliwy.

- [ ] **Step 1: Zainstaluj brakujące devDependencies**

```bash
npm install -D vitest@^2 @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 2: Utwórz `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 3: Dopisz skrypty w `package.json`**

W bloku `"scripts"` dodaj między `"start"` a `"lint"`:

```json
"test": "vitest run",
"test:watch": "vitest",
"typecheck": "tsc --noEmit",
```

- [ ] **Step 4: Rozszerz `src/test/setup.ts` o vi globals**

Zamień zawartość `src/test/setup.ts` na:

```ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useInView: () => true,
    useReducedMotion: () => false,
  };
});
```

- [ ] **Step 5: Uruchom `example.test.ts`, żeby zweryfikować że runner działa**

Run: `npm test`
Expected: `1 passed` z `src/test/example.test.ts`.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/test/setup.ts
git commit -m "chore(test): wire up vitest with jsdom and framer-motion mock"
```

---

## Task 2: Add `--warning` semantic token

**Files:**
- Modify: `src/app/globals.css`, `tailwind.config.ts`, `src/lib/design-tokens.ts`

- [ ] **Step 1: Dodaj zmienne w `:root` (po linii `--info: #227bc3;` w `globals.css:65`)**

```css
    --info: #227bc3;
    --warning: #ca8a04;
    --warning-foreground: #1a1a1a;
```

- [ ] **Step 2: Dodaj zmienne w `.dark` (po linii `--info: #227bc3;` ok. linii 107)**

```css
    --info: #227bc3;
    --warning: #f59e0b;
    --warning-foreground: #1a1a1a;
```

- [ ] **Step 3: Dodaj mapowanie Tailwind w `tailwind.config.ts`**

W obiekcie `theme.extend.colors` (linie ~20–82) dodaj po wpisie `info`:

```ts
        warning: {
          DEFAULT: 'rgb(from var(--warning) r g b / <alpha-value>)',
          foreground: 'rgb(from var(--warning-foreground) r g b / <alpha-value>)',
        },
```

- [ ] **Step 4: Dodaj wpisy w `src/lib/design-tokens.ts` (po `Info`)**

```ts
  {
    name: 'Warning',
    cssVar: '--warning',
    tailwind: 'text-warning bg-warning',
    light: '#ca8a04',
    dark: '#f59e0b',
    role: 'Status ostrzegawczy',
    usage: 'Komunikaty wymagające uwagi, walidacja niska priorytet, banery info-warning.',
    editIn: 'src/app/globals.css :root + .dark',
  },
  {
    name: 'Warning foreground',
    cssVar: '--warning-foreground',
    tailwind: 'text-warning-foreground',
    light: '#1a1a1a',
    dark: '#1a1a1a',
    role: 'Tekst na warning',
    usage: 'Tekst i ikony na tle warning.',
    editIn: 'src/app/globals.css :root + .dark',
  },
```

- [ ] **Step 5: Run typecheck + build, żeby wykluczyć regresję**

Run: `npm run typecheck && npm run build`
Expected: zero błędów.

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css tailwind.config.ts src/lib/design-tokens.ts
git commit -m "feat(tokens): add --warning + --warning-foreground semantic tokens"
```

---

## Task 3: Add `--shadow-{sm,md,lg,xl}` token scale

**Files:**
- Modify: `src/app/globals.css`, `tailwind.config.ts`

- [ ] **Step 1: Dodaj zmienne w `:root` (po `--section-padding`)**

```css
    --section-padding: clamp(3rem, 6vw, 6rem);

    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
    --shadow-xl: 0 16px 40px rgba(0, 0, 0, 0.18);
```

- [ ] **Step 2: Dodaj zmienne w `.dark` (na końcu bloku `.dark`, po `--sidebar-ring`)**

```css
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.5);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.6);
    --shadow-xl: 0 16px 40px rgba(0, 0, 0, 0.7);
```

- [ ] **Step 3: Dodaj `boxShadow` w `tailwind.config.ts` (po `borderRadius`)**

```ts
      boxShadow: {
        'token-sm': 'var(--shadow-sm)',
        'token-md': 'var(--shadow-md)',
        'token-lg': 'var(--shadow-lg)',
        'token-xl': 'var(--shadow-xl)',
      },
```

> Prefiks `token-` chroni przed kolizją z domyślną skalą Tailwind (`shadow-sm`, `shadow-md` itp.) i sygnalizuje, że to nasz custom token.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: build pass; tailwind generuje klasy `shadow-token-sm` … `shadow-token-xl`.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css tailwind.config.ts
git commit -m "feat(tokens): add --shadow-{sm,md,lg,xl} scale + Tailwind shadow-token-* utilities"
```

---

## Task 4: Add `--z-{base,dropdown,sticky,modal,popover,tooltip}` token scale

**Files:**
- Modify: `src/app/globals.css`, `tailwind.config.ts`

- [ ] **Step 1: Dodaj zmienne w `:root` (po `--shadow-xl`)**

```css
    --shadow-xl: 0 16px 40px rgba(0, 0, 0, 0.18);

    --z-base: 0;
    --z-dropdown: 30;
    --z-sticky: 40;
    --z-modal: 50;
    --z-popover: 60;
    --z-tooltip: 70;
```

> Tokeny `z-*` są niezmienne między light/dark, więc dodajemy tylko w `:root`.

- [ ] **Step 2: Dodaj `zIndex` w `tailwind.config.ts` (po `boxShadow`)**

```ts
      zIndex: {
        base: 'var(--z-base)',
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        modal: 'var(--z-modal)',
        popover: 'var(--z-popover)',
        tooltip: 'var(--z-tooltip)',
      },
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build pass; tailwind akceptuje klasy `z-tooltip`, `z-modal` itp.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css tailwind.config.ts
git commit -m "feat(tokens): add --z-* scale (base/dropdown/sticky/modal/popover/tooltip)"
```

---

## Task 5: Add `--chart-{1..5}` palette tokens

**Files:**
- Modify: `src/app/globals.css`, `tailwind.config.ts`, `src/lib/design-tokens.ts`

- [ ] **Step 1: Dodaj zmienne w `:root` (po `--z-tooltip`)**

```css
    --z-tooltip: 70;

    --chart-1: #141414;
    --chart-2: #ffcd05;
    --chart-3: #227bc3;
    --chart-4: #318153;
    --chart-5: #ca8a04;
```

- [ ] **Step 2: Dodaj zmienne w `.dark` (na końcu bloku `.dark`)**

```css
    --chart-1: #f5f3f0;
    --chart-2: #ffcd05;
    --chart-3: #5aa9d6;
    --chart-4: #4ea878;
    --chart-5: #f59e0b;
```

- [ ] **Step 3: Dodaj mapowanie w `tailwind.config.ts` w `theme.extend.colors`**

```ts
        chart: {
          '1': 'rgb(from var(--chart-1) r g b / <alpha-value>)',
          '2': 'rgb(from var(--chart-2) r g b / <alpha-value>)',
          '3': 'rgb(from var(--chart-3) r g b / <alpha-value>)',
          '4': 'rgb(from var(--chart-4) r g b / <alpha-value>)',
          '5': 'rgb(from var(--chart-5) r g b / <alpha-value>)',
        },
```

- [ ] **Step 4: Dodaj 5 wpisów w `src/lib/design-tokens.ts` (na końcu `colorTokens`)**

```ts
  {
    name: 'Chart 1',
    cssVar: '--chart-1',
    tailwind: 'bg-chart-1 text-chart-1',
    light: '#141414',
    dark: '#f5f3f0',
    role: 'Wykres — seria 1',
    usage: 'Pierwsza seria danych w wykresach (recharts/shadcn chart).',
    editIn: 'src/app/globals.css :root + .dark',
  },
  {
    name: 'Chart 2',
    cssVar: '--chart-2',
    tailwind: 'bg-chart-2 text-chart-2',
    light: '#ffcd05',
    dark: '#ffcd05',
    role: 'Wykres — seria 2',
    usage: 'Druga seria danych (akcent METRO).',
    editIn: 'src/app/globals.css :root + .dark',
  },
  {
    name: 'Chart 3',
    cssVar: '--chart-3',
    tailwind: 'bg-chart-3 text-chart-3',
    light: '#227bc3',
    dark: '#5aa9d6',
    role: 'Wykres — seria 3',
    usage: 'Trzecia seria danych (info).',
    editIn: 'src/app/globals.css :root + .dark',
  },
  {
    name: 'Chart 4',
    cssVar: '--chart-4',
    tailwind: 'bg-chart-4 text-chart-4',
    light: '#318153',
    dark: '#4ea878',
    role: 'Wykres — seria 4',
    usage: 'Czwarta seria danych (success).',
    editIn: 'src/app/globals.css :root + .dark',
  },
  {
    name: 'Chart 5',
    cssVar: '--chart-5',
    tailwind: 'bg-chart-5 text-chart-5',
    light: '#ca8a04',
    dark: '#f59e0b',
    role: 'Wykres — seria 5',
    usage: 'Piąta seria danych (warning).',
    editIn: 'src/app/globals.css :root + .dark',
  },
```

- [ ] **Step 5: Verify build + typecheck**

Run: `npm run typecheck && npm run build`
Expected: zero błędów.

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css tailwind.config.ts src/lib/design-tokens.ts
git commit -m "feat(tokens): add --chart-1..5 palette + Tailwind chart-N utilities"
```

---

## Task 6: Add registry-sync test for design-tokens.ts ↔ globals.css

**Files:**
- Create: `src/lib/design-tokens.test.ts`

Cel: złapać przyszłe rozjazdy między dwoma źródłami prawdy (per memory 1598).

- [ ] **Step 1: Napisz test sprawdzający że każdy token z `colorTokens` istnieje w `globals.css`**

Utwórz `src/lib/design-tokens.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { colorTokens } from './design-tokens';

const globalsCss = readFileSync(
  resolve(__dirname, '../app/globals.css'),
  'utf8',
);

describe('design-tokens.ts registry', () => {
  it('every cssVar in colorTokens is declared in globals.css :root', () => {
    const rootBlock =
      globalsCss.match(/:root\s*{([\s\S]*?)}/)?.[1] ?? '';
    for (const token of colorTokens) {
      expect(
        rootBlock.includes(`${token.cssVar}:`),
        `Missing ${token.cssVar} in :root block`,
      ).toBe(true);
    }
  });

  it('every cssVar with a `dark` value is declared in globals.css .dark', () => {
    const darkBlock = globalsCss.match(/\.dark\s*{([\s\S]*?)}/)?.[1] ?? '';
    for (const token of colorTokens) {
      if (!token.dark) continue;
      expect(
        darkBlock.includes(`${token.cssVar}:`),
        `Missing ${token.cssVar} in .dark block`,
      ).toBe(true);
    }
  });

  it('light hex value matches globals.css declaration', () => {
    const rootBlock = globalsCss.match(/:root\s*{([\s\S]*?)}/)?.[1] ?? '';
    for (const token of colorTokens) {
      const re = new RegExp(`${token.cssVar}:\\s*(#[0-9a-f]{3,8})`, 'i');
      const match = rootBlock.match(re);
      if (!match) continue;
      expect(match[1].toLowerCase()).toBe(token.light.toLowerCase());
    }
  });
});
```

- [ ] **Step 2: Uruchom test, sprawdź że przechodzi**

Run: `npm test -- src/lib/design-tokens.test.ts`
Expected: `3 passed`. Jeżeli failuje na konkretnym tokenie — popraw albo `colorTokens`, albo `globals.css`, aż się zsynchronizują.

- [ ] **Step 3: Commit**

```bash
git add src/lib/design-tokens.test.ts
git commit -m "test(tokens): assert design-tokens.ts registry matches globals.css"
```

---

## Task 7: Zod schema for hero/content.json

**Files:**
- Create: `src/lib/schemas/hero.ts`, `src/lib/schemas/index.ts`, `src/lib/schemas/schemas.test.ts`

- [ ] **Step 1: Utwórz `src/lib/schemas/hero.ts`**

```ts
import { z } from 'zod';

export const heroContentSchema = z.object({
  brandLabel: z.string().default(''),
  collectionName: z.string().default(''),
  tagline: z.string().default(''),
  taglineLine2: z.string().default(''),
  ctaLabel: z.string().default(''),
  heroImage: z.string().optional(),
  heroImageAlt: z.string().optional(),
});

export type HeroContent = z.infer<typeof heroContentSchema>;

export function parseHeroContent(input: unknown): HeroContent {
  return heroContentSchema.parse(input);
}
```

- [ ] **Step 2: Utwórz `src/lib/schemas/index.ts`**

```ts
export { heroContentSchema, parseHeroContent } from './hero';
export type { HeroContent } from './hero';
export {
  packshotsContentSchema,
  parsePackshotsContent,
} from './packshots';
export type { PackshotsContent } from './packshots';
```

> Plik importuje `./packshots` który dodamy w Tasku 8 — nie commituj jeszcze, użyj importu w jednym kroku z Task 8 lub zakomentuj do tego czasu. **Najprostsze:** zostaw barrel z tylko hero do Tasku 8.

W kroku tutaj zamiast całego barrel'a stwórz minimalny:

```ts
export { heroContentSchema, parseHeroContent } from './hero';
export type { HeroContent } from './hero';
```

- [ ] **Step 3: Napisz test parsowania**

Utwórz `src/lib/schemas/schemas.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseHeroContent } from './hero';

const heroFixture = JSON.parse(
  readFileSync(
    resolve(__dirname, '../../../public/catalogs/QX/hero/content.json'),
    'utf8',
  ),
);

describe('heroContentSchema', () => {
  it('parses real QX hero/content.json', () => {
    const result = parseHeroContent(heroFixture);
    expect(result.tagline).toContain('QX Modular');
    expect(result.ctaLabel).toBe('Explore Collection');
  });

  it('fills defaults when fields missing', () => {
    const result = parseHeroContent({});
    expect(result.brandLabel).toBe('');
    expect(result.collectionName).toBe('');
    expect(result.tagline).toBe('');
  });

  it('rejects non-string field', () => {
    expect(() => parseHeroContent({ tagline: 42 })).toThrow();
  });
});
```

- [ ] **Step 4: Run test**

Run: `npm test -- src/lib/schemas`
Expected: `3 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/schemas/hero.ts src/lib/schemas/index.ts src/lib/schemas/schemas.test.ts
git commit -m "feat(schema): add Zod schema + parser for hero/content.json"
```

---

## Task 8: Zod schema for packshots/content.json

**Files:**
- Create: `src/lib/schemas/packshots.ts`
- Modify: `src/lib/schemas/index.ts`, `src/lib/schemas/schemas.test.ts`

- [ ] **Step 1: Utwórz `src/lib/schemas/packshots.ts`**

```ts
import { z } from 'zod';

export const packshotItemSchema = z.object({
  code: z.string(),
  name: z.string().default(''),
  image: z.string(),
  frameColorName: z.string().default(''),
  frameColorCode: z.string().default(''),
  desktopColorName: z.string().default(''),
  desktopColorCode: z.string().default(''),
  colorName: z.string().default(''),
  colorCode: z.string().default(''),
});

export const packshotGroupSchema = z.object({
  model: z.string(),
  label: z.string().default(''),
  desc: z.string().default(''),
  items: z.array(packshotItemSchema),
});

export const packshotsContentSchema = z.object({
  sectionLabel: z.string().default(''),
  title: z.string().default(''),
  subtitle: z.string().default(''),
  groups: z.array(packshotGroupSchema),
});

export type PackshotsContent = z.infer<typeof packshotsContentSchema>;

export function parsePackshotsContent(input: unknown): PackshotsContent {
  return packshotsContentSchema.parse(input);
}
```

- [ ] **Step 2: Rozszerz `src/lib/schemas/index.ts`**

Zamień zawartość na:

```ts
export { heroContentSchema, parseHeroContent } from './hero';
export type { HeroContent } from './hero';
export {
  packshotsContentSchema,
  packshotItemSchema,
  packshotGroupSchema,
  parsePackshotsContent,
} from './packshots';
export type { PackshotsContent } from './packshots';
```

- [ ] **Step 3: Dopisz test do `src/lib/schemas/schemas.test.ts`**

Dodaj po istniejącym `describe('heroContentSchema', ...)`:

```ts
import { parsePackshotsContent } from './packshots';

const packshotsFixture = JSON.parse(
  readFileSync(
    resolve(__dirname, '../../../public/catalogs/QX/packshots/content.json'),
    'utf8',
  ),
);

describe('packshotsContentSchema', () => {
  it('parses real QX packshots/content.json', () => {
    const result = parsePackshotsContent(packshotsFixture);
    expect(result.title).toBe('QX Collection');
    expect(result.groups.length).toBeGreaterThan(0);
    expect(result.groups[0].items[0].image).toMatch(/\.webp$/);
  });

  it('fills defaults for missing optional strings', () => {
    const result = parsePackshotsContent({
      groups: [{ model: 'TEST', items: [{ code: 'C', image: 'x.webp' }] }],
    });
    expect(result.sectionLabel).toBe('');
    expect(result.groups[0].label).toBe('');
    expect(result.groups[0].items[0].name).toBe('');
  });

  it('rejects malformed group (missing model)', () => {
    expect(() =>
      parsePackshotsContent({ groups: [{ items: [] }] }),
    ).toThrow();
  });
});
```

- [ ] **Step 4: Run testy**

Run: `npm test -- src/lib/schemas`
Expected: `6 passed` (3 hero + 3 packshots).

- [ ] **Step 5: Commit**

```bash
git add src/lib/schemas/packshots.ts src/lib/schemas/index.ts src/lib/schemas/schemas.test.ts
git commit -m "feat(schema): add Zod schema + parser for packshots/content.json"
```

---

## Task 9: Wire schemas into catalog-loader

**Files:**
- Modify: `src/lib/catalog-loader.ts`

Cel: walidacja parse-time. Jeśli `content.json` ma błąd, build padnie z czytelnym komunikatem zamiast skutkować pustym renderem.

- [ ] **Step 1: Znajdź miejsce odczytu `hero/content.json` w `catalog-loader.ts`**

Run: `grep -n "hero/content.json" src/lib/catalog-loader.ts`

Zapisz numer linii (np. `L:520`).

- [ ] **Step 2: Dodaj import schem na górze pliku**

Po istniejących importach (po linii ~10):

```ts
import { parseHeroContent, parsePackshotsContent } from './schemas';
```

- [ ] **Step 3: Owinąć odczyt hero w `parseHeroContent`**

W miejscu gdzie loader robi `const heroJson = JSON.parse(...)` z `hero/content.json`, zamień na:

```ts
const heroRaw = JSON.parse(await readFile(heroJsonPath, 'utf8'));
const heroJson = parseHeroContent(heroRaw);
```

> Konkretną linię odnajdziesz w Stepie 1; klucz semantyczny: gdziekolwiek `JSON.parse` operuje na zawartości `hero/content.json`. Jeżeli loader używa innego helpera (`safeReadJson` itp.), opakuj jego zwrotkę: `const heroJson = parseHeroContent(await safeReadJson(...))`.

- [ ] **Step 4: To samo dla packshots**

Run: `grep -n "packshots/content.json" src/lib/catalog-loader.ts`. W miejscu `JSON.parse(...)` dla packshots, opakuj rezultat:

```ts
const packshotsRaw = JSON.parse(await readFile(packshotsJsonPath, 'utf8'));
const packshotsJson = parsePackshotsContent(packshotsRaw);
```

- [ ] **Step 5: Verify typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: zero błędów. Build powinien zalogować pełne katalogi QX i QS.

- [ ] **Step 6: Verify regression test (smoke)**

Run: `npm run dev` w tle, otwórz `http://localhost:3000/catalog/QX`, sprawdź że Hero i Packshots renderują się tak jak przed zmianą.
Expected: identyczny render. Ubij dev-server.

- [ ] **Step 7: Commit**

```bash
git add src/lib/catalog-loader.ts
git commit -m "feat(loader): validate hero + packshots JSON via Zod schemas at parse-time"
```

---

## Task 10: Extract ColorChip → src/components/catalog/ColorChip.tsx

**Files:**
- Create: `src/components/catalog/ColorChip.tsx`, `src/components/catalog/ColorChip.test.tsx`
- Modify: `src/layouts/qx/PackshotsQX.tsx`

`ColorChip` żyje obecnie inline w [PackshotsQX.tsx:94–147](src/layouts/qx/PackshotsQX.tsx#L94). Wyciągamy 1:1.

- [ ] **Step 1: Napisz failing test**

Utwórz `src/components/catalog/ColorChip.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColorChip } from './ColorChip';
import type { MaterialsConfiguratorOption } from '@/types/catalog';

const option: MaterialsConfiguratorOption = {
  id: 'frame-ral9005',
  code: 'RAL9005',
  label: 'Black RAL 9005',
  image: '/img.webp',
  thumbnail: '/img-thumb.webp',
};

describe('<ColorChip />', () => {
  it('renders the swatch image with role-aware aria label', () => {
    render(<ColorChip option={option} role="frame" />);
    const img = screen.getByAltText(/Frame: RAL 9005/i);
    expect(img).toBeInTheDocument();
  });

  it('shows tooltip on mouseEnter and hides on mouseLeave', () => {
    const { container } = render(<ColorChip option={option} role="top" />);
    const wrapper = container.firstChild as HTMLElement;
    fireEvent.mouseEnter(wrapper);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.mouseLeave(wrapper);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('formats RAL codes with space (RAL9005 → RAL 9005)', () => {
    render(<ColorChip option={option} role="frame" />);
    const wrapper = screen.getByAltText(/Frame: RAL 9005/i).parentElement!;
    fireEvent.mouseEnter(wrapper);
    expect(screen.getByText('RAL 9005')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test, zweryfikuj że failuje (modułu jeszcze nie ma)**

Run: `npm test -- src/components/catalog/ColorChip`
Expected: FAIL z `Failed to resolve import "./ColorChip"`.

- [ ] **Step 3: Utwórz `src/components/catalog/ColorChip.tsx`**

```tsx
'use client';

import { useState } from 'react';
import type { MaterialsConfiguratorOption } from '@/types/catalog';

export type ChipRole = 'frame' | 'top';

const CHIP_ROLE_LABEL: Record<ChipRole, string> = {
  frame: 'Frame',
  top: 'Top',
};

export function formatOptionCode(code: string): string {
  return code.startsWith('RAL') ? `RAL ${code.slice(3)}` : code;
}

export function getOptionDescriptor(option: MaterialsConfiguratorOption) {
  const codeFormatted = formatOptionCode(option.code);
  const labelText = option.label
    .replace(codeFormatted, '')
    .replace(option.code, '')
    .trim();
  return { codeFormatted, labelText };
}

interface ColorChipProps {
  option: MaterialsConfiguratorOption;
  role: ChipRole;
}

export function ColorChip({ option, role }: ColorChipProps) {
  const { codeFormatted, labelText } = getOptionDescriptor(option);
  const roleLabel = CHIP_ROLE_LABEL[role];
  const ariaLabel = labelText
    ? `${roleLabel}: ${codeFormatted} ${labelText}`
    : `${roleLabel}: ${codeFormatted}`;
  const [open, setOpen] = useState(false);
  const show = () => setOpen(true);
  const hide = () => setOpen(false);

  return (
    <span
      className="relative inline-flex shrink-0 align-middle"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <img
        src={option.thumbnail}
        alt={ariaLabel}
        width={24}
        height={24}
        tabIndex={0}
        className="block h-6 w-6 border border-foreground/60 object-cover cursor-help focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-foreground"
      />
      {open && (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-tooltip -translate-x-1/2"
        >
          <span className="block w-[7.25rem] border border-foreground bg-background p-1 text-left shadow-token-lg">
            <img
              src={option.thumbnail}
              alt=""
              aria-hidden="true"
              className="block aspect-square w-full object-cover"
            />
            <span className="mt-2 block px-1 pb-1 text-[11px] font-medium leading-tight text-foreground sm:text-xs">
              <span className="block">{codeFormatted}</span>
              {labelText && <span className="block">{labelText}</span>}
            </span>
          </span>
        </span>
      )}
    </span>
  );
}
```

> Zmiana semantyczna w stosunku do oryginału: `z-50` → `z-tooltip`, hardkodowany `shadow-[0_8px_24px_rgba(0,0,0,0.18)]` → `shadow-token-lg`. To celowe wykorzystanie nowych tokenów z Task 3 + 4.

- [ ] **Step 4: Run testów — wszystkie powinny przechodzić**

Run: `npm test -- src/components/catalog/ColorChip`
Expected: `3 passed`.

- [ ] **Step 5: Zastąp inline ColorChip w PackshotsQX**

W `src/layouts/qx/PackshotsQX.tsx`:
- Usuń linie 87–147 (definicje `CHIP_ROLE_LABEL`, `ColorChip`).
- Usuń linie 74–85 (`formatOptionCode`, `getOptionDescriptor`) — teraz są w `ColorChip.tsx`.
- Dodaj import na górze (po linii 13):

```tsx
import { ColorChip, formatOptionCode, getOptionDescriptor } from '@/components/catalog/ColorChip';
```

> Wewnątrz pliku PackshotsQX `formatOptionCode` i `getOptionDescriptor` mogą być nadal używane przez logikę poza `ColorChip`. Re-eksport z `ColorChip.tsx` zachowuje API.

- [ ] **Step 6: Verify typecheck + build + smoke**

Run: `npm run typecheck && npm run build`
Expected: zero błędów.

Run: `npm run dev`, sprawdź `http://localhost:3000/catalog/QX#packshots` — chipy mają identyczny render i tooltip jak przed wyciągnięciem.

- [ ] **Step 7: Commit**

```bash
git add src/components/catalog/ColorChip.tsx src/components/catalog/ColorChip.test.tsx src/layouts/qx/PackshotsQX.tsx
git commit -m "refactor(catalog): extract ColorChip to shared component with tests"
```

---

## Task 11: Extract Lightbox → src/components/catalog/Lightbox.tsx

**Files:**
- Create: `src/components/catalog/Lightbox.tsx`, `src/components/catalog/Lightbox.test.tsx`
- Modify: `src/layouts/qx/GalleryQX.tsx`

Lightbox jest dziś inline w [GalleryQX.tsx:149–209](src/layouts/qx/GalleryQX.tsx#L149) i bardzo podobny inline w PackshotsQX. Wyciągamy do reużywalnego API.

- [ ] **Step 1: Failing test**

Utwórz `src/components/catalog/Lightbox.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Lightbox } from './Lightbox';

const images = [
  { src: '/a.webp', alt: 'Image A' },
  { src: '/b.webp', alt: 'Image B' },
  { src: '/c.webp', alt: 'Image C' },
];

describe('<Lightbox />', () => {
  it('renders nothing when index is null', () => {
    render(<Lightbox images={images} index={null} onClose={() => {}} onNavigate={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders image at given index', () => {
    render(<Lightbox images={images} index={1} onClose={() => {}} onNavigate={() => {}} />);
    expect(screen.getByAltText('Image B')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<Lightbox images={images} index={0} onClose={onClose} onNavigate={() => {}} />);
    fireEvent.click(screen.getByLabelText(/close/i));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onNavigate(+1) when next button clicked', () => {
    const onNavigate = vi.fn();
    render(<Lightbox images={images} index={0} onClose={() => {}} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByLabelText(/next/i));
    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  it('calls onClose on Escape key', () => {
    const onClose = vi.fn();
    render(<Lightbox images={images} index={0} onClose={onClose} onNavigate={() => {}} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test, zweryfikuj fail**

Run: `npm test -- src/components/catalog/Lightbox`
Expected: FAIL — moduł nie istnieje.

- [ ] **Step 3: Utwórz `src/components/catalog/Lightbox.tsx`**

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export interface LightboxImage {
  src: string;
  alt: string;
}

interface LightboxProps {
  images: LightboxImage[];
  index: number | null;
  onClose: () => void;
  onNavigate: (direction: 1 | -1) => void;
}

export function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (index === null) return;
    closeRef.current?.focus();

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onNavigate(-1);
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        onNavigate(1);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [index, onClose, onNavigate]);

  return (
    <AnimatePresence>
      {index !== null && images[index] && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-modal flex items-center justify-center bg-foreground/90 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          onClick={onClose}
        >
          <button
            ref={closeRef}
            onClick={onClose}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center text-on-dark-muted hover:text-on-dark"
            aria-label="Close lightbox"
          >
            <X size={28} />
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onNavigate(-1);
            }}
            className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-on-dark-muted hover:text-on-dark"
            aria-label="Previous image"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onNavigate(1);
            }}
            className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-on-dark-muted hover:text-on-dark"
            aria-label="Next image"
          >
            <ChevronRight size={32} />
          </button>
          <motion.img
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            src={images[index].src}
            alt={images[index].alt}
            draggable
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
            onClick={(event) => event.stopPropagation()}
          />
          <p className="absolute bottom-6 text-sm text-on-dark-muted" aria-live="polite">
            {index + 1} / {images.length}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

> Token `z-modal` w miejsce hardkodowanego `z-[60]`.

- [ ] **Step 4: Run testów**

Run: `npm test -- src/components/catalog/Lightbox`
Expected: `5 passed`.

- [ ] **Step 5: Refactor `GalleryQX.tsx`**

W `src/layouts/qx/GalleryQX.tsx`:
- Usuń linie 149–209 (cały `<AnimatePresence>` z lightboxem).
- Usuń linie 40–65 (efekt klawiatury).
- Usuń `closeButtonRef` (linia 20).
- Usuń niepotrzebne importy: `AnimatePresence`, `X`, `ChevronLeft`, `ChevronRight`, `useEffect`.
- Dodaj import (linia ~7):

```tsx
import { Lightbox } from '@/components/catalog/Lightbox';
```

- W miejscu starego `<AnimatePresence>` wstaw:

```tsx
      <Lightbox
        images={galleryImages.map((img) => ({ src: img.src, alt: img.alt }))}
        index={lightboxIndex}
        onClose={closeLightbox}
        onNavigate={navigate}
      />
```

> Lokalna `navigate(dir: number)` zostaje bez zmian — `Lightbox` ją wywoła z `1` lub `-1`.

- [ ] **Step 6: Verify typecheck + build + smoke**

Run: `npm run typecheck && npm run build`
Expected: zero błędów.

Run: `npm run dev`, otwórz `http://localhost:3000/catalog/QX#gallery`, kliknij obrazek — sprawdź że lightbox: otwiera, zamyka (Esc, X, kliknięcie tła), nawiguje (strzałki, klik na lewy/prawy chevron).

- [ ] **Step 7: Commit**

```bash
git add src/components/catalog/Lightbox.tsx src/components/catalog/Lightbox.test.tsx src/layouts/qx/GalleryQX.tsx
git commit -m "refactor(catalog): extract Lightbox to shared component with tests"
```

---

## Task 12: Create SectionShell + SectionHeading components

**Files:**
- Create: `src/components/catalog/SectionShell.tsx`, `src/components/catalog/SectionShell.test.tsx`
- Create: `src/components/catalog/SectionHeading.tsx`, `src/components/catalog/SectionHeading.test.tsx`

- [ ] **Step 1: Failing test dla `SectionHeading`**

Utwórz `src/components/catalog/SectionHeading.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionHeading } from './SectionHeading';

describe('<SectionHeading />', () => {
  it('renders sectionLabel as section_ID class', () => {
    render(<SectionHeading id="overview" sectionLabel="Overview" title="Title" />);
    const label = screen.getByText('Overview');
    expect(label).toHaveClass('section_ID');
  });

  it('renders title with id matching prop+ -title', () => {
    render(<SectionHeading id="features" sectionLabel="Features" title="Engineered" />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.id).toBe('features-title');
    expect(heading.textContent).toContain('Engineered');
  });

  it('renders titleLine2 with explicit line break when provided', () => {
    render(
      <SectionHeading
        id="overview"
        sectionLabel="Overview"
        title="Designed for the way you"
        titleLine2="work today"
      />,
    );
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.textContent).toContain('Designed for the way you');
    expect(heading.textContent).toContain('work today');
  });
});
```

- [ ] **Step 2: Run test, zweryfikuj fail**

Run: `npm test -- src/components/catalog/SectionHeading`
Expected: FAIL — moduł nie istnieje.

- [ ] **Step 3: Utwórz `src/components/catalog/SectionHeading.tsx`**

```tsx
import { renderQxText } from './renderQxText';

interface SectionHeadingProps {
  id: string;
  sectionLabel: string;
  title: string;
  titleLine2?: string;
  className?: string;
}

export function SectionHeading({
  id,
  sectionLabel,
  title,
  titleLine2,
  className = '',
}: SectionHeadingProps) {
  return (
    <div className={className}>
      <p className="section_ID font-display uppercase">{renderQxText(sectionLabel)}</p>
      <h2 id={`${id}-title`} className="section_Title mt-8 font-display font-normal lg:mt-7">
        {renderQxText(title)}
        {titleLine2 && (
          <>
            <br />
            {renderQxText(titleLine2)}
          </>
        )}
      </h2>
    </div>
  );
}
```

- [ ] **Step 4: Run testów (wszystkie 3 powinny przechodzić)**

Run: `npm test -- src/components/catalog/SectionHeading`
Expected: `3 passed`.

- [ ] **Step 5: Failing test dla `SectionShell`**

Utwórz `src/components/catalog/SectionShell.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionShell } from './SectionShell';

describe('<SectionShell />', () => {
  it('renders <section> with given id and aria-labelledby', () => {
    render(
      <SectionShell id="overview">
        <p>content</p>
      </SectionShell>,
    );
    const section = screen.getByRole('region', { name: undefined }) ?? document.querySelector('section');
    expect(section).toHaveAttribute('id', 'overview');
    expect(section).toHaveAttribute('aria-labelledby', 'overview-title');
  });

  it('applies bg-surface-elevated by default', () => {
    const { container } = render(<SectionShell id="x">x</SectionShell>);
    const section = container.querySelector('section')!;
    expect(section.className).toContain('bg-surface-elevated');
  });

  it('allows overriding background via className prop', () => {
    const { container } = render(
      <SectionShell id="x" className="bg-warm-light">
        x
      </SectionShell>,
    );
    const section = container.querySelector('section')!;
    expect(section.className).toContain('bg-warm-light');
    expect(section.className).not.toContain('bg-surface-elevated');
  });

  it('passes through children', () => {
    render(
      <SectionShell id="overview">
        <p>hello</p>
      </SectionShell>,
    );
    expect(screen.getByText('hello')).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run, zweryfikuj fail**

Run: `npm test -- src/components/catalog/SectionShell`
Expected: FAIL.

- [ ] **Step 7: Utwórz `src/components/catalog/SectionShell.tsx`**

```tsx
import type { ReactNode } from 'react';

interface SectionShellProps {
  id: string;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}

const DEFAULT_BG = 'bg-surface-elevated';
const DEFAULT_INNER =
  'mx-auto w-full max-w-[1440px] px-5 pt-6 pb-12 sm:px-8 sm:pt-8 lg:px-0';

export function SectionShell({
  id,
  children,
  className,
  innerClassName,
}: SectionShellProps) {
  const sectionClass = className?.includes('bg-')
    ? className
    : `${DEFAULT_BG}${className ? ` ${className}` : ''}`;
  const innerClass = innerClassName ?? DEFAULT_INNER;
  return (
    <section id={id} className={sectionClass} aria-labelledby={`${id}-title`}>
      <div className={innerClass}>{children}</div>
    </section>
  );
}
```

- [ ] **Step 8: Run testów**

Run: `npm test -- src/components/catalog/SectionShell`
Expected: `4 passed`.

- [ ] **Step 9: Commit**

```bash
git add src/components/catalog/SectionShell.tsx src/components/catalog/SectionShell.test.tsx src/components/catalog/SectionHeading.tsx src/components/catalog/SectionHeading.test.tsx
git commit -m "feat(catalog): add SectionShell + SectionHeading shared scaffold components"
```

---

## Task 13: Migrate OverviewQX to SectionShell + SectionHeading (proof-of-concept)

**Files:**
- Modify: `src/layouts/qx/OverviewQX.tsx`

> Migracja pozostałych 10 sekcji to **świadomy follow-up** — zostawiamy je do osobnej iteracji, bo każda ma własną geometrię i ryzyko regresji wizualnej. Tutaj robimy jedną sekcję, żeby zwalidować API.

- [ ] **Step 1: Zastąp zawartość `src/layouts/qx/OverviewQX.tsx`**

```tsx
'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import type { OverviewData } from '@/types/catalog';
import { SECTION_REVEAL_SLIDE, slowTransition } from '@/lib/motion';
import { renderQxText } from '@/components/catalog/renderQxText';
import { responsiveImg } from '@/lib/responsive-image';
import { SectionShell } from '@/components/catalog/SectionShell';
import { SectionHeading } from '@/components/catalog/SectionHeading';

interface OverviewSectionProps {
  data: OverviewData;
}

const OverviewQX = ({ data }: OverviewSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const reveal = SECTION_REVEAL_SLIDE;

  return (
    <SectionShell
      id="overview"
      className="bg-surface-elevated lg:min-h-[960px]"
      innerClassName="relative mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-10 px-5 pt-6 pb-12 sm:px-8 sm:pt-8 lg:min-h-[960px] lg:grid-cols-12 lg:gap-0 lg:px-0 lg:py-0"
    >
      <div className="relative z-10 flex flex-col lg:col-span-6 lg:max-w-[540px] lg:pt-3" ref={ref}>
        <motion.div
          initial={reveal.header.initial}
          animate={isInView ? reveal.header.animate : {}}
          transition={slowTransition({ duration: 0.6 })}
        >
          <SectionHeading
            id="overview"
            sectionLabel={data.sectionLabel}
            title={data.title}
            titleLine2={data.titleLine2}
            className="mb-12 lg:mb-[120px]"
          />
          <div className="sec_main_text mt-12 max-w-[520px] space-y-4 font-body lg:mt-[120px]">
            {data.paragraphs.map((p, i) => (
              <p key={i}>{renderQxText(p)}</p>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="min-h-[360px] lg:absolute lg:inset-y-0 lg:left-1/2 lg:right-0 lg:min-h-0">
        <motion.div
          initial={reveal.content.initial}
          animate={isInView ? reveal.content.animate : {}}
          transition={slowTransition({ duration: 0.6, delay: 0.2 })}
          className="h-full w-full"
        >
          <figure className="h-full w-full overflow-hidden bg-transparent">
            <div className="relative h-full min-h-[360px] w-full overflow-hidden">
              <img
                src={data.packshotImage}
                {...responsiveImg(data.packshotImage, 'overview')}
                alt={data.packshotImageAlt}
                className="absolute inset-0 h-full w-full object-cover object-center"
                loading="lazy"
              />
            </div>
            <figcaption className="sr-only">{renderQxText(data.packshotCaption)}</figcaption>
          </figure>
        </motion.div>
      </div>
    </SectionShell>
  );
};

export default OverviewQX;
```

> **Co się zmieniło względem oryginału:** `<section ...>` + zewnętrzny `<div ...>` → `<SectionShell>`. Para `<p class="section_ID">` + `<h2 id="overview-title">` → `<SectionHeading>`. Cała geometria (`grid grid-cols-12`, `min-h-[960px]`) zostaje 1:1 — bez regresji wizualnej.

- [ ] **Step 2: Verify typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: zero błędów.

- [ ] **Step 3: Visual smoke test**

Run: `npm run dev`, otwórz `http://localhost:3000/catalog/QX#overview`. Porównaj z poprzednim renderem (jeśli masz screenshot przed-zmianą — najlepiej; jeśli nie — sprawdź:
- nagłówek "Collection Overview" (lub równoważnik) wyświetla się w prawym górnym rogu kolumny lewej
- title z line-break renderuje się
- packshot po prawej stronie zachowuje proporcje 1:1
- animacja reveal SLIDE działa przy scrollu
).

- [ ] **Step 4: Run wszystkie testy + lint**

Run: `npm test && npm run lint`
Expected: wszystkie testy przechodzą; eslint co najwyżej dotychczasowe warninigi (raw `<img>`).

- [ ] **Step 5: Commit**

```bash
git add src/layouts/qx/OverviewQX.tsx
git commit -m "refactor(qx): migrate OverviewQX to SectionShell + SectionHeading (PoC)"
```

---

## Task 14: Final verification + README update for follow-ups

**Files:**
- Modify: `TODO.md` (lub `docs/superpowers/specs/`)

- [ ] **Step 1: Run pełna baterie testów**

Run: `npm test`
Expected: wszystkie testy z Tasków 1, 6, 7, 8, 10, 11, 12 przechodzą.

- [ ] **Step 2: Run typecheck + lint + build**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: zero błędów typu / nowych warningów ESLint, build pass.

- [ ] **Step 3: Dopisz follow-upy w `TODO.md`**

Dodaj na końcu:

```markdown
## Design System — follow-up po Plan 1 (2026-05-06)

- [ ] Migracja pozostałych 10 sekcji QX na SectionShell + SectionHeading (HeroQX, GalleryQX, FeaturesQX, GettingStartedQX, PackshotsQX, MaterialsQX, FinishesQX, DimensionsQX, ProductCodesQX, CatalogPageQX). Każda jako osobny commit.
- [ ] Zod schemy dla pozostałych content.json (overview, gallery, finishes, dimensions, materials, features, getting-started, codes).
- [ ] Plan 2: Storybook + visual regression (Chromatic/Playwright snapshots).
- [ ] Plan 3: Strona produktu + konfigurator z ceną.
- [ ] Plan 4: Brand-scoping `qs0` + implementacja Type2/Type3.
```

- [ ] **Step 4: Final commit**

```bash
git add TODO.md
git commit -m "docs: log design-system follow-ups after Plan 1"
```

---

## Self-Review Checklist (wykonane)

**Spec coverage:** Każdy punkt audytu z Części B przypisany:
- B.1 tokeny: warning (T2), shadow (T3), z-index (T4), chart (T5) ✓ — *brand-scoping qs0 → Plan 4, opacity tokens → wstrzymane (mała wartość, wysoki koszt zmian inline 0.82/0.05)*
- B.2 typografia: *odłożone do Plan 2 (Storybook ujawni które utility żyją)*
- B.3 komponenty: ColorChip (T10), Lightbox (T11), SectionShell+SectionHeading (T12+T13). *PriceTag, CatalogFooter, SiteHeader → Plan 3*
- B.4 layouty: stuby Type2/Type3, qs0 → Plan 4
- B.5 motion: *odłożone — wymagają osobnego brainstormingu*
- B.6 schemy JSON: hero (T7), packshots (T8), wired (T9). Pozostałe sekcje → follow-up T14
- B.7 tooling: vitest infra (T1), registry-sync test (T6). Storybook/visual regression → Plan 2
- B.8 prymitywy interaction: *odłożone — wymagają designu*
- B.9 branding: *odłożone — wymagają assetów*
- B.10 responsywność: *odłożone — wymagają decyzji o Tailwind v4 / pluginie container queries*

**Placeholder scan:** brak "TBD"/"TODO inside steps". Każdy krok ma kod albo dokładną komendę. Step 3 w T9 ma dependency na grep z poprzedniego kroku — to zamierzone (loader ma kilka helperów odczytu, dokładne miejsce zna engineer w trakcie wykonywania).

**Type consistency:** `MaterialsConfiguratorOption`, `LightboxImage`, `ChipRole` — używane spójnie. `formatOptionCode`/`getOptionDescriptor` re-eksportowane z `ColorChip.tsx` zgodnie z importem w `PackshotsQX.tsx`. `parseHeroContent`/`parsePackshotsContent` jako jedyne API publiczne barrel'a `schemas/`.
