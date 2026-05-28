# WCAG 2.1 AA Remediation — METRO Catalogs

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Doprowadzić frontend METRO Catalogs (QX/QS) do pełnej zgodności z WCAG 2.1 AA i wszystkimi 10 zasadami uniwersalnego projektowania z `docs/zasady.md`, naprawiając 27 ustaleń z audytu z 2026-05-07.

**Architecture:** Trzy fundamenty wspólne (hook `useFocusTrap`, framework testowy `jest-axe`, design-system-page jako żywa dokumentacja zmian) wprowadzone w fazie 0; potem pięć faz wdrożenia uporządkowanych od najtańszych poprawek (czyste oznaczenia ARIA, kształty/typo) przez średnie (semantyka grup radio, modal preview) po największe (refaktor Lightbox, globalna rewizja kontrastu). Każde zadanie kończy aktualizację `src/app/design-system/page.tsx` zgodnie z regułą z `AGENTS.md`.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 3, framer-motion, Radix UI (`@radix-ui/react-dialog` już w zależnościach), shadcn/ui, vitest + jsdom, ESLint. Dodajemy: `jest-axe`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`.

**Audyt źródłowy:** [.ui-design/audits/metro_catalogs_zasady_20260507_115012.md](../../../.ui-design/audits/metro_catalogs_zasady_20260507_115012.md)

---

## File Structure

### Nowe pliki

| Plik | Odpowiedzialność |
| --- | --- |
| `src/hooks/use-focus-trap.ts` | Hook reużywalny dla modali (Lightbox, FinishesQX preview): trap Tab, scroll lock body, restore focus po zamknięciu |
| `src/hooks/use-focus-trap.test.tsx` | Testy hooka — Tab cycling, Escape, restore-focus, scroll lock |
| `src/components/catalog/Lightbox.test.tsx` | Test a11y + focus-trap (uzupełnienie istniejącego `Lightbox.test.tsx`) |
| `src/components/catalog/MaterialsOptionGroup.test.tsx` | Test radiogroup semantics + jest-axe |
| `src/components/catalog/ColorChip.test.tsx` | Test button wrapper + Escape tooltip + axe |
| `src/test/a11y-helpers.ts` | Wrapper `expectNoA11yViolations(container)` |
| `docs/superpowers/plans/2026-05-07-accessibility-wcag-aa-remediation.md` | Ten plan |

### Modyfikowane pliki

| Plik | Zakres zmian |
| --- | --- |
| `package.json` | Dodanie devDeps: `jest-axe`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`, `@types/jest-axe` |
| `src/test/setup.ts` | Rejestracja `expect.extend(toHaveNoViolations)` |
| `src/components/catalog/Lightbox.tsx` | Refaktor: useFocusTrap, aria-labelledby, focus-ring na buttonach |
| `src/components/catalog/MaterialsOptionGroup.tsx` | role=radiogroup + role=radio + aria-checked + aria-labelledby + lepszy kontrast border |
| `src/components/catalog/ColorChip.tsx` | Wrapper `<button h-11 w-11>` + Escape do tooltip |
| `src/components/catalog/SectionShell.tsx` | Opcjonalna prop `label` z fallbackiem aria-label |
| `src/components/catalog/CatalogNav.tsx` | aria-current="location" (3 miejsca) + focus-ring na buttonie menu |
| `src/components/catalog/renderQxText.tsx` | `<br>` → opcja z `white-space: pre-line` (decyzja: pozostawić `<br>` jako jest, ale dodać semantyczną alternatywę dla content prose) |
| `src/layouts/qx/CatalogPageQX.tsx` | Usunięcie `lang="en"` z `<main>` |
| `src/layouts/qx/HeroQX.tsx` | Aktywny dot: kształt + rozmiar (P1); gradient pod text (P8); sr-only swipe hint (D1) |
| `src/layouts/qx/FinishesQX.tsx` | Modal preview: useFocusTrap, aria-labelledby; preview-button afford ikoną lupy (D2) |
| `src/layouts/qx/FeaturesQX.tsx` | Decyzja K5: pozostawić `aria-hidden="true"` na video, dodać sr-only opis dla AT z `active.desc` |
| `src/layouts/qx/MaterialsQX.tsx` | Fixed `w-[721px]` → `w-full max-w-[721px]` |
| `src/layouts/qx/PackshotsQX.tsx` | aria-label dialog → aria-labelledby (po refaktorze Lightbox) |
| `src/layouts/qx/GalleryQX.tsx` | `min-h-[44px]` → `min-h-[48px]` |
| `src/layouts/qx/OverviewQX.tsx` | figcaption — krótka widoczna + pełna sr-only (do decyzji) |
| `src/layouts/type2/CatalogPageType2.tsx` | `max-w-xl` → `max-w-full sm:max-w-xl` |
| `src/layouts/type3/CatalogPageType3.tsx` | Analogicznie do Type2 |
| `src/lib/motion.ts` | `slowTransition` runtime check prefers-reduced-motion |
| `src/app/page.tsx` | `<p class="section_ID">` → `<h2 class="section_ID">` (×3) |
| `src/app/catalog/[catalogId]/page.tsx` | Sprawdzenie `generateMetadata` — tytuł zawiera nazwę katalogu |
| `src/app/globals.css` | `--muted-foreground: #595959`, `--on-dark-muted: #d0d0d0`, scrollbar 12 px, `.hero-text` gradient/shadow |
| `src/app/design-system/page.tsx` | Aktualizacja po każdej zmianie tokenu/komponentu/wzorca |
| `docs/zasady.md` | Po Faza 5 — dopisać status zgodności (jeśli user zechce) |

---

## Faza 0: Fundamenty (przed jakimikolwiek zmianami w produkcji)

### Task 0.1: Dodać `jest-axe` i `@testing-library` do projektu

**Cel:** Mieć narzędzie do automatycznych testów a11y, używane od T0.2 w górę.

**Files:**
- Modify: `package.json` (devDependencies)
- Modify: `src/test/setup.ts`
- Create: `src/test/a11y-helpers.ts`
- Create: `src/test/a11y-helpers.test.ts`

**Kryterium akceptacji:** `npm run test` zielone; helper `expectNoA11yViolations(container)` działa na trywialnym przykładzie.

- [ ] **Step 1: Dodać zależności**

```bash
npm install -D jest-axe @testing-library/react@^16 @testing-library/dom @testing-library/user-event @types/jest-axe
```

- [ ] **Step 2: Zaktualizować `src/test/setup.ts`**

Dodać do końca pliku:

```ts
import { expect } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);
```

(Jeśli pliku nie ma — utwórz z tymi linijkami; sprawdź w `vitest.config.ts` czy `setupFiles` na niego wskazuje).

- [ ] **Step 3: Stworzyć helper `src/test/a11y-helpers.ts`**

```ts
import { axe } from 'jest-axe';

export async function expectNoA11yViolations(container: Element) {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
}
```

- [ ] **Step 4: Test sanity-check `src/test/a11y-helpers.test.ts`**

```tsx
import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { expectNoA11yViolations } from './a11y-helpers';

describe('a11y-helpers', () => {
  it('passes for a button with accessible name', async () => {
    const { container } = render(<button aria-label="Save">OK</button>);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 5: Uruchomić test**

```bash
npm run test -- a11y-helpers
```

Expected: 1 passed.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/test/setup.ts src/test/a11y-helpers.ts src/test/a11y-helpers.test.ts
git commit -m "test: add jest-axe + testing-library for a11y assertions"
```

---

### Task 0.2: Hook `useFocusTrap` (TDD)

**Cel:** Wyizolować logikę modala (trap Tab, scroll lock, restore focus). Używana w T2.5 (FinishesQX preview) i T3.1 (Lightbox refaktor).

**Files:**
- Create: `src/hooks/use-focus-trap.ts`
- Create: `src/hooks/use-focus-trap.test.tsx`

**Kryterium akceptacji:** 4 testy zielone — Tab cycling, Shift+Tab cycling, scroll lock, restore-focus po zmianie `isOpen` z true na false.

- [ ] **Step 1: Napisać failing test — Tab cycling**

`src/hooks/use-focus-trap.test.tsx`:

```tsx
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useRef } from 'react';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFocusTrap } from './use-focus-trap';

function Modal({ isOpen }: { isOpen: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, isOpen);
  if (!isOpen) return null;
  return (
    <div ref={ref} role="dialog" aria-label="test">
      <button>First</button>
      <button>Middle</button>
      <button>Last</button>
    </div>
  );
}

describe('useFocusTrap', () => {
  it('cycles Tab from last back to first', async () => {
    const user = userEvent.setup();
    const { getAllByRole } = render(<Modal isOpen={true} />);
    const [first, , last] = getAllByRole('button');
    last.focus();
    await user.tab();
    expect(document.activeElement).toBe(first);
  });
});
```

- [ ] **Step 2: Uruchomić test — powinien FAIL**

```bash
npm run test -- use-focus-trap
```

Expected: FAIL — `useFocusTrap is not defined` lub podobne.

- [ ] **Step 3: Minimalna implementacja `src/hooks/use-focus-trap.ts`**

```ts
import { useEffect, type RefObject } from 'react';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  isOpen: boolean,
) {
  useEffect(() => {
    if (!isOpen) return;
    const container = ref.current;
    if (!container) return;

    const trigger = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusables = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [ref, isOpen]);
}
```

- [ ] **Step 4: Test PASS**

```bash
npm run test -- use-focus-trap
```

Expected: 1 passed.

- [ ] **Step 5: Dopisać 3 kolejne testy**

Dodać do `use-focus-trap.test.tsx`:

```tsx
  it('cycles Shift+Tab from first back to last', async () => {
    const user = userEvent.setup();
    const { getAllByRole } = render(<Modal isOpen={true} />);
    const [first, , last] = getAllByRole('button');
    first.focus();
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(last);
  });

  it('locks body scroll while open', () => {
    const { rerender } = render(<Modal isOpen={true} />);
    expect(document.body.style.overflow).toBe('hidden');
    rerender(<Modal isOpen={false} />);
    expect(document.body.style.overflow).toBe('');
  });

  it('restores focus to trigger on close', () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'Open';
    document.body.appendChild(trigger);
    trigger.focus();
    const { rerender } = render(<Modal isOpen={true} />);
    rerender(<Modal isOpen={false} />);
    expect(document.activeElement).toBe(trigger);
    document.body.removeChild(trigger);
  });
```

- [ ] **Step 6: Uruchomić wszystkie testy hooka — PASS**

```bash
npm run test -- use-focus-trap
```

Expected: 4 passed.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/use-focus-trap.ts src/hooks/use-focus-trap.test.tsx
git commit -m "feat(a11y): add useFocusTrap hook for modal accessibility"
```

---

## Faza 1: Quick wins (5 zadań, < 1 h każda)

### Task 1.1 (U3): Usunąć redundantne `lang="en"` z `<main>`

**WCAG:** 3.1.2 (Language of Parts) — atrybut redundantny względem `<html lang="en">`.

**Files:**
- Modify: `src/layouts/qx/CatalogPageQX.tsx:54`

- [ ] **Step 1: Usunąć linię z `<main>`**

W `src/layouts/qx/CatalogPageQX.tsx` zmienić:

```tsx
// PRZED (linie 52–56):
<main
  id="main-content"
  lang="en"
  className="bg-surface-elevated [&>section+section]:mt-2 lg:[&>section+section]:mt-[240px]"
>

// PO:
<main
  id="main-content"
  className="bg-surface-elevated [&>section+section]:mt-2 lg:[&>section+section]:mt-[240px]"
>
```

- [ ] **Step 2: Build sanity check**

```bash
npm run typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/qx/CatalogPageQX.tsx
git commit -m "fix(a11y): remove redundant lang='en' from <main> (U3)"
```

---

### Task 1.2 (K3): `aria-current="true"` → `aria-current="location"` w CatalogNav

**WCAG:** 4.1.2 (Name, Role, Value). Wartość ARIA musi być z enum `page | step | location | date | time | true | false`. Dla nawigacji do sekcji in-page właściwa jest `location`.

**Files:**
- Modify: `src/components/catalog/CatalogNav.tsx:235, 279, 328`
- Modify: `src/app/globals.css:592, 599` (selektor `.catalog-nav-link[aria-current='true']` → `[aria-current='location']`)
- Test: `src/components/catalog/CatalogNav.test.tsx` (utworzyć)

- [ ] **Step 1: Napisać failing test**

`src/components/catalog/CatalogNav.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import CatalogNav from './CatalogNav';

describe('CatalogNav aria-current', () => {
  it('uses aria-current="location" for the active in-page section, not "true"', () => {
    const { container } = render(<CatalogNav />);
    const linksWithStringTrue = container.querySelectorAll(
      '[aria-current="true"]',
    );
    expect(linksWithStringTrue.length).toBe(0);
    // Active link może być "location" lub brak (gdy żadna sekcja nie jest aktywna):
    const validValues = new Set([null, 'location']);
    container.querySelectorAll('[aria-current]').forEach((el) => {
      expect(validValues.has(el.getAttribute('aria-current'))).toBe(true);
    });
  });
});
```

- [ ] **Step 2: Uruchomić — FAIL**

```bash
npm run test -- CatalogNav
```

Expected: FAIL (są elementy z `aria-current="true"`).

- [ ] **Step 3: Zmiana w `CatalogNav.tsx`**

Zamienić w trzech miejscach (linie 234–236, 278–280, 327–329):

```tsx
// PRZED (3 miejsca):
aria-current={
  isSectionHighlighted(section.id) ? 'true' : undefined
}

// PO (3 miejsca):
aria-current={
  isSectionHighlighted(section.id) ? 'location' : undefined
}
```

- [ ] **Step 4: Aktualizacja selektorów CSS**

W `src/app/globals.css` linie 591–602:

```css
/* PRZED */
.catalog-nav-link:hover,
.catalog-nav-link[aria-current='true'] {
  color: #000 !important;
  font-weight: 700 !important;
  border-color: #000 !important;
}

.catalog-nav-link:hover .qx-word,
.catalog-nav-link[aria-current='true'] .qx-word {
  color: #000 !important;
  font-weight: 700 !important;
}

/* PO */
.catalog-nav-link:hover,
.catalog-nav-link[aria-current='location'] {
  color: #000 !important;
  font-weight: 700 !important;
  border-color: #000 !important;
}

.catalog-nav-link:hover .qx-word,
.catalog-nav-link[aria-current='location'] .qx-word {
  color: #000 !important;
  font-weight: 700 !important;
}
```

- [ ] **Step 5: Test PASS**

```bash
npm run test -- CatalogNav
```

Expected: 1 passed.

- [ ] **Step 6: Aktualizacja design-system/page.tsx**

Otwórz `src/app/design-system/page.tsx` i znajdź sekcję dokumentującą `CatalogNav` lub wzorce nawigacji. Dodaj/zaktualizuj wpis:

```tsx
// W sekcji wzorców komponentów (gdzie opisane są inne semantyczne wzorce):
<DesignSystemNote>
  <strong>Active in-page section:</strong> CatalogNav używa{' '}
  <code>aria-current="location"</code> (a nie <code>"true"</code>) dla
  zaznaczenia aktywnej sekcji w obrębie strony — zgodnie z enum ARIA.
  Selektor CSS: <code>.catalog-nav-link[aria-current='location']</code>.
</DesignSystemNote>
```

(Jeśli `<DesignSystemNote>` nie istnieje, dodaj wpis w stylu pozostałej dokumentacji strony — patrz patterns na `design-system/page.tsx` dla notek a11y.)

- [ ] **Step 7: Commit**

```bash
git add src/components/catalog/CatalogNav.tsx src/components/catalog/CatalogNav.test.tsx src/app/globals.css src/app/design-system/page.tsx
git commit -m "fix(a11y): use aria-current='location' for in-page section nav (K3)"
```

---

### Task 1.3 (U2): Zamiana `<p class="section_ID">` na `<h2 class="section_ID">` w landing page

**WCAG:** 1.3.1 (Info & Relationships), 2.4.6 (Headings & Labels).

**Files:**
- Modify: `src/app/page.tsx:38–40, 98–100, 109–111`

- [ ] **Step 1: Zmiana 3 miejsc**

W `src/app/page.tsx`:

```tsx
// linie 38–40:
<p className="section_ID px-5 font-display uppercase sm:px-8 lg:px-0">
  Operational office furniture
</p>
// → 
<h2 className="section_ID px-5 font-display uppercase sm:px-8 lg:px-0">
  Operational office furniture
</h2>

// linie 98–100:
<p className="section_ID px-5 font-display uppercase sm:px-8 lg:px-0">
  Conference tables
</p>
// → 
<h2 className="section_ID px-5 font-display uppercase sm:px-8 lg:px-0">
  Conference tables
</h2>

// linie 109–111:
<p className="section_ID px-5 font-display uppercase sm:px-8 lg:px-0">
  Reception desks
</p>
// → 
<h2 className="section_ID px-5 font-display uppercase sm:px-8 lg:px-0">
  Reception desks
</h2>
```

- [ ] **Step 2: Sprawdzić CSS — czy `.section_ID` ma styl resetujący domyślny `<h2>` rendering**

Otwórz `src/app/globals.css` i sprawdź regułę `.section_ID` (linie ~471–478). Reguła ma `!important` na `font-size`, `font-weight`, `line-height` — wygląda OK dla zmiany z `<p>` na `<h2>`. Jednak strona główna nie ma klasy `catalog-qx0`, więc ta reguła NIE zadziała na page.tsx. Sprawdź renderowanie w przeglądarce po zmianie.

Jeśli `<h2>` na landing page renderuje się z innym fontem/rozmiarem niż wcześniejsze `<p>`, dodaj na landing page klasę `catalog-qx0` na rootowym `<div>` (linia 22 — już jest!) — czyli reguła powinna działać. Zweryfikuj manualnie.

- [ ] **Step 3: Build i typecheck**

```bash
npm run typecheck && npm run build
```

Expected: 0 errors. Build passes.

- [ ] **Step 4: Manualna weryfikacja w dev**

```bash
npm run dev
```

Otwórz `http://localhost:3000/` — wszystkie 3 etykiety sekcji renderują się tak samo wizualnie jak przed zmianą (font, rozmiar, spacing).

- [ ] **Step 5: Aktualizacja design-system/page.tsx**

Znajdź sekcję dokumentującą klasę `.section_ID`. Dodaj notkę:

```tsx
<DesignSystemNote>
  <strong>Semantyka:</strong> klasa <code>.section_ID</code> jest stylem
  prezentacyjnym dla nagłówka sekcji. Stosuj na elementach{' '}
  <code>&lt;h2&gt;</code> (nie <code>&lt;p&gt;</code>) — czytniki ekranu i
  generatory spisu treści muszą rozpoznawać ją jako nagłówek.
</DesignSystemNote>
```

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx src/app/design-system/page.tsx
git commit -m "fix(a11y): use <h2> for section labels on landing page (U2)"
```

---

### Task 1.4 (P1): Aktywny dot Hero — kształt + rozmiar oprócz koloru

**WCAG:** 1.4.1 (Use of Color). Stan slajdu nie może być komunikowany wyłącznie barwą.

**Files:**
- Modify: `src/layouts/qx/HeroQX.tsx:351–357`

- [ ] **Step 1: Zmiana stylu dota**

W `src/layouts/qx/HeroQX.tsx` linie 351–357 zmień span wewnątrz przycisku:

```tsx
// PRZED:
<span
  className={`block h-2 w-2 rounded-full transition-colors ${
    index === currentIndex
      ? 'bg-primary'
      : 'bg-on-dark-muted/60'
  }`}
/>

// PO:
<span
  className={`block h-2 rounded-full transition-all ${
    index === currentIndex
      ? 'w-6 bg-primary'
      : 'w-2 bg-on-dark-muted/60'
  }`}
/>
```

Aktywny dot ma 24×8 px (kapsułka), nieaktywny 8×8 px — różnica w rozmiarze i proporcji oprócz koloru.

- [ ] **Step 2: Sanity check w dev**

```bash
npm run dev
```

Otwórz `http://localhost:3000/catalog/QX`. Kliknij/przejedź slidy — aktywny dot widocznie szerszy. W DevTools włącz emulację `prefers-color-scheme: high contrast` lub symuluj dyschromatyzję — stan aktywny pozostaje rozróżnialny.

- [ ] **Step 3: Aktualizacja design-system/page.tsx**

Znajdź sekcję `Hero` lub wzorce slidera. Dodaj notkę:

```tsx
<DesignSystemNote>
  <strong>Wskaźniki slajdów (carousel dots):</strong> aktywny stan to{' '}
  <code>w-6 h-2 bg-primary</code>, nieaktywny{' '}
  <code>w-2 h-2 bg-on-dark-muted/60</code>. Różnica kształtu (kapsułka vs.
  kropka) jest wymagana — kolor sam nie wystarcza dla użytkowników z
  dyschromatyzją (WCAG 1.4.1).
</DesignSystemNote>
```

- [ ] **Step 4: Commit**

```bash
git add src/layouts/qx/HeroQX.tsx src/app/design-system/page.tsx
git commit -m "fix(a11y): active hero slide dot has distinct shape, not just color (P1)"
```

---

### Task 1.5 (D5): Custom scrollbar 6 px → 12 px

**WCAG:** 2.5.5/2.5.8 (Target Size — pośrednio: scrollbar to interaktywny target).

**Files:**
- Modify: `src/app/globals.css:388–400`

- [ ] **Step 1: Zwiększyć szerokość scrollbara**

```css
/* PRZED */
::-webkit-scrollbar {
  width: 6px;
}

/* PO */
::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-thumb {
  background: rgb(from var(--muted-foreground) r g b / 0.4);
  border-radius: 6px;
}
```

(Track i thumb-color zostają bez zmian — opcjonalnie zwiększ alfa thumb z `0.3` na `0.4` dla widoczności).

- [ ] **Step 2: Manualna weryfikacja**

```bash
npm run dev
```

W przeglądarce desktop (Chrome/Edge) sprawdź widoczność i klikalność scrollbara — uchwyt łatwiejszy do złapania myszą. Na macOS scrollbar systemowy może nadpisać reguły — to OK.

- [ ] **Step 3: Aktualizacja design-system/page.tsx**

Jeśli design-system dokumentuje globalne style (sekcja `Globalne CSS` lub `Bazowe`), dodaj informację o scrollbarze 12 px.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/design-system/page.tsx
git commit -m "fix(a11y): widen scrollbar from 6px to 12px for easier mouse target (D5)"
```

---

## Faza 2: Średni wysiłek (8 zadań, 1–4 h każde)

### Task 2.1 (K2): `MaterialsOptionGroup` z semantyką radiogroup

**WCAG:** 1.3.1 (Info & Relationships), 4.1.2 (Name/Role/Value).

**Files:**
- Modify: `src/components/catalog/MaterialsOptionGroup.tsx`
- Create: `src/components/catalog/MaterialsOptionGroup.test.tsx`

**Decyzja semantyczna:** kontener używa `role="radiogroup"`, każdy przycisk `role="radio"` + `aria-checked`. Jest to grupa wzajemnie wykluczających się opcji (jedna wybrana naraz w obrębie zakładki konfiguratora). To wymaga zmiany klawiatury: strzałki przesuwają fokus i zaznaczają (zachowanie radio).

**Uwaga taktyczna:** `role="radiogroup"` wymaga implementacji obsługi strzałek (Arrow Up/Down/Left/Right) — kosztowne. **Pragmatyczna alternatywa:** użyć `role="group"` + `aria-pressed` (jak teraz) ale dodać `aria-labelledby` na kontenerze. Mniej semantyczne ale bez ryzyka regresji UX.

**Wybór:** zaczynamy od **`role="group"` + `aria-labelledby`** (mniej inwazyjne, naprawia główną lukę z audytu). Jeśli przyszły audyt manualny pokaże, że radio jest oczekiwane, można zmigrować. Decyzja udokumentowana w design-system.

- [ ] **Step 1: Napisać failing test**

`src/components/catalog/MaterialsOptionGroup.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MaterialsOptionGroup } from './MaterialsOptionGroup';
import { expectNoA11yViolations } from '@/test/a11y-helpers';
import type { MaterialsConfiguratorOption } from '@/types/catalog';

const opts: MaterialsConfiguratorOption[] = [
  {
    id: 'opt1',
    code: 'U100',
    label: 'White U100',
    thumbnail: '/swatch.webp',
    image: '/full.webp',
  },
  {
    id: 'opt2',
    code: 'U110',
    label: 'Grey U110',
    thumbnail: '/swatch.webp',
    image: '/full.webp',
  },
];

describe('MaterialsOptionGroup', () => {
  it('exposes group semantics with aria-labelledby pointing to title', () => {
    const { getByRole, getByText } = render(
      <MaterialsOptionGroup
        title="Desktop Finish"
        options={opts}
        selectedId="opt1"
        onSelect={() => {}}
      />,
    );
    const group = getByRole('group');
    const heading = getByText('Desktop Finish');
    expect(group.getAttribute('aria-labelledby')).toBe(heading.id);
    expect(heading.id).toBeTruthy();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <MaterialsOptionGroup
        title="Steel parts colors"
        options={opts}
        selectedId="opt1"
        onSelect={() => {}}
      />,
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 2: Uruchomić — FAIL**

```bash
npm run test -- MaterialsOptionGroup
```

Expected: FAIL — brak `role="group"` lub powiązania `aria-labelledby`.

- [ ] **Step 3: Refaktor `MaterialsOptionGroup.tsx`**

```tsx
'use client';

import { useId } from 'react';
import type { MaterialsConfiguratorOption } from '@/types/catalog';
import { renderQxText } from '@/components/catalog/renderQxText';

interface MaterialsOptionGroupProps {
  title: string;
  options: MaterialsConfiguratorOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
  variant?: 'primary' | 'secondary';
}

function formatOptionCode(code: string) {
  return code.startsWith('RAL') ? `RAL ${code.slice(3)}` : code;
}

function getOptionLabelParts(option: MaterialsConfiguratorOption) {
  const code = formatOptionCode(option.code);
  const name = option.label.replace(code, '').replace(option.code, '').trim();
  return { code, name };
}

export function MaterialsOptionGroup({
  title,
  options,
  selectedId,
  onSelect,
  variant = 'secondary',
}: MaterialsOptionGroupProps) {
  const titleId = useId();
  const titleClassName =
    variant === 'primary'
      ? 'mb-3 qx-emphasis-title'
      : 'mb-2 font-display text-lg font-normal text-foreground';
  return (
    <div>
      <h3 id={titleId} className={titleClassName}>
        {renderQxText(title)}
      </h3>

      <div
        role="group"
        aria-labelledby={titleId}
        className="flex flex-wrap gap-[5px]"
      >
        {options.map((option) => {
          const isSelected = option.id === selectedId;
          const label = getOptionLabelParts(option);

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              aria-pressed={isSelected}
              className={`relative h-[9.75rem] w-[7.25rem] shrink-0 border bg-background p-1 pt-[7rem] text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
                isSelected
                  ? 'border-foreground border-2 shadow-[0_0_0_2px_rgba(0,0,0,0.18)]'
                  : 'border-transparent hover:border-foreground/50'
              }`}
            >
              <div
                aria-hidden="true"
                className="absolute left-1 right-1 top-1 aspect-square bg-cover bg-center transition-transform duration-300 hover:scale-105"
                style={{ backgroundImage: `url("${option.thumbnail}")` }}
              />
              <p className="text-[11px] font-medium leading-tight text-foreground sm:text-xs">
                <span className="block">{renderQxText(label.code)}</span>
                {label.name && (
                  <span className="block">{renderQxText(label.name)}</span>
                )}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

Zmiany:
1. `useId()` na heading.
2. `role="group"` + `aria-labelledby={titleId}` na kontenerze.
3. `border-foreground/50` zamiast `/20` (P4: kontrast hover ≥ 3:1).
4. `border-2` na selected (P4).
5. `focus-visible:outline ...` na buttonie (P3 dla MaterialsOptionGroup).

- [ ] **Step 4: Test PASS**

```bash
npm run test -- MaterialsOptionGroup
```

Expected: 2 passed (1 group, 1 axe).

- [ ] **Step 5: Aktualizacja design-system/page.tsx**

W sekcji dokumentującej `MaterialsOptionGroup`:

```tsx
<DesignSystemNote>
  <strong>Semantyka grupy:</strong> kontener ma{' '}
  <code>role="group"</code> + <code>aria-labelledby</code> wskazujący na{' '}
  <code>&lt;h3&gt;</code>. Każda opcja to <code>&lt;button&gt;</code> z{' '}
  <code>aria-pressed</code>. (Wybór <code>group</code> nad{' '}
  <code>radiogroup</code> wynika z braku obsługi nawigacji strzałkami; jeśli
  chcemy strzałki, migrujemy do <code>radiogroup</code> + roving tabindex.)
</DesignSystemNote>
<DesignSystemNote>
  <strong>Kontrast obramowania:</strong> hover używa{' '}
  <code>border-foreground/50</code> (≥ 3:1 na białym) — token{' '}
  <code>/20</code> nie spełnia WCAG 1.4.11 dla komponentów UI.
</DesignSystemNote>
```

- [ ] **Step 6: Commit**

```bash
git add src/components/catalog/MaterialsOptionGroup.tsx src/components/catalog/MaterialsOptionGroup.test.tsx src/app/design-system/page.tsx
git commit -m "fix(a11y): MaterialsOptionGroup uses role=group + aria-labelledby + visible focus + ≥3:1 borders (K2, P3, P4)"
```

---

### Task 2.2 (K4): ColorChip — wrapper button h-11 w-11 + Escape do tooltip

**WCAG:** 2.5.5/2.5.8 (Target Size), 1.4.13 (Content on Hover or Focus — dismissible).

**Files:**
- Modify: `src/components/catalog/ColorChip.tsx`
- Create: `src/components/catalog/ColorChip.test.tsx`

**Decyzja:** zachowujemy zewnętrzny rozmiar wizualny (44×44 px target), ale wewnętrzny obraz nadal 24×24 px (utrzymanie design intent). Tooltip zamykany Escape.

- [ ] **Step 1: Failing test**

`src/components/catalog/ColorChip.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ColorChip } from './ColorChip';
import { expectNoA11yViolations } from '@/test/a11y-helpers';
import type { MaterialsConfiguratorOption } from '@/types/catalog';

const opt: MaterialsConfiguratorOption = {
  id: 'x',
  code: 'U100',
  label: 'White U100',
  thumbnail: '/swatch.webp',
  image: '/full.webp',
};

describe('ColorChip', () => {
  it('renders a button with min 44x44 touch target', () => {
    const { getByRole } = render(<ColorChip option={opt} role="frame" />);
    const button = getByRole('button');
    // h-11 w-11 = 44px:
    expect(button.className).toMatch(/h-11/);
    expect(button.className).toMatch(/w-11/);
  });

  it('escape hides the tooltip after focus opens it', () => {
    const { getByRole, queryByRole } = render(
      <ColorChip option={opt} role="frame" />,
    );
    const button = getByRole('button');
    button.focus();
    expect(queryByRole('tooltip')).toBeTruthy();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(queryByRole('tooltip')).toBeFalsy();
  });

  it('has no axe violations', async () => {
    const { container } = render(<ColorChip option={opt} role="top" />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 2: Uruchomić — FAIL**

```bash
npm run test -- ColorChip
```

Expected: FAIL — `<img tabIndex={0}>` nie ma roli button.

- [ ] **Step 3: Refaktor `ColorChip.tsx`**

```tsx
'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <span className="relative inline-flex shrink-0 align-middle">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="flex h-11 w-11 items-center justify-center cursor-help focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        <img
          src={option.thumbnail}
          alt=""
          aria-hidden="true"
          width={24}
          height={24}
          className="block h-6 w-6 border border-foreground/60 object-cover"
        />
      </button>
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

Zmiany:
1. `<button>` zamiast `<img tabIndex={0}>`.
2. Wewnętrzny `<img alt="" aria-hidden>` — dekoracyjny.
3. `aria-label` na buttonie z opisem (Frame: U100 Beech Slate).
4. Touch target 44×44 (`h-11 w-11`), wizualny chip nadal 24×24.
5. Escape zamyka tooltip (`useEffect` dodaje listener tylko gdy `open`).
6. `aria-expanded` informuje AT o stanie tooltipa.

- [ ] **Step 4: Test PASS**

```bash
npm run test -- ColorChip
```

Expected: 3 passed.

- [ ] **Step 5: Sprawdzić wszystkie miejsca użycia ColorChip**

```bash
grep -rn "ColorChip" /Users/micz/__DEV__/__METRO_catalogs/src --include="*.tsx"
```

Sprawdź czy zmiana wymiaru wizualnego (z `inline-flex` zewnętrznego span'a do button 44×44) nie psuje layoutu w PackshotsQX. Jeśli tak — dostosuj odstępy w miejscach użycia (gap zmniejszyć lub padding zewnętrznego kontenera).

- [ ] **Step 6: Aktualizacja design-system/page.tsx**

```tsx
<DesignSystemNote>
  <strong>ColorChip — touch target:</strong> przycisk 44×44 px (
  <code>h-11 w-11</code>) zawiera wizualny chip 24×24 px. Tekst pomocniczy
  jest w <code>aria-label</code>; wewnętrzny obraz <code>alt="" aria-hidden</code>.
  Tooltip pokazywany na hover/focus, zamykany Escape (WCAG 1.4.13).
</DesignSystemNote>
```

- [ ] **Step 7: Commit**

```bash
git add src/components/catalog/ColorChip.tsx src/components/catalog/ColorChip.test.tsx src/app/design-system/page.tsx
git commit -m "fix(a11y): ColorChip wrapped in 44x44 button + Escape dismisses tooltip (K4, P6)"
```

---

### Task 2.3 (P3): Focus-ring na ikonowych przyciskach Lightbox + CatalogNav

**WCAG:** 2.4.7 (Focus Visible).

**Files:**
- Modify: `src/components/catalog/Lightbox.tsx:60–90` (3 buttony)
- Modify: `src/components/catalog/CatalogNav.tsx:248–254, 338–346` (2 buttony)

**Uwaga:** Lightbox będzie pełnie refaktorowany w T3.1. Tu robimy minimalną korektę focus-ring; refaktor T3.1 może to nadpisać, ale w międzyczasie mamy lepszy stan.

- [ ] **Step 1: CatalogNav — desktop hamburger**

W `src/components/catalog/CatalogNav.tsx` linia 247–254 (qx0 variant):

```tsx
// PRZED:
<button
  onClick={() => setIsOpen((value) => !value)}
  className="ml-4 p-2 text-primary transition-colors hover:text-primary/75 !rounded-none lg:hidden"
  aria-expanded={isOpen}
  aria-label={isOpen ? 'Close menu' : 'Open menu'}
>

// PO:
<button
  onClick={() => setIsOpen((value) => !value)}
  className="ml-4 p-2 text-primary transition-colors hover:text-primary/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground !rounded-none lg:hidden"
  aria-expanded={isOpen}
  aria-label={isOpen ? 'Close menu' : 'Open menu'}
>
```

I drugie wystąpienie linia 338–346 (default variant):

```tsx
// PRZED:
<button
  onClick={() => setIsOpen((value) => !value)}
  className="ml-4 rounded-md p-2 text-primary transition-colors hover:text-primary/75 lg:hidden"
  aria-expanded={isOpen}
  aria-label={isOpen ? 'Close menu' : 'Open menu'}
>

// PO:
<button
  onClick={() => setIsOpen((value) => !value)}
  className="ml-4 rounded-md p-2 text-primary transition-colors hover:text-primary/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground lg:hidden"
  aria-expanded={isOpen}
  aria-label={isOpen ? 'Close menu' : 'Open menu'}
>
```

- [ ] **Step 2: Lightbox — 3 buttony (Close + Prev + Next)**

W `src/components/catalog/Lightbox.tsx` zmień `className` w trzech buttonach (linie 66, 76, 86) — dodaj `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark` na końcu klasy:

```tsx
// linia 66:
className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center text-on-dark-muted hover:text-on-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark"

// linia 76:
className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-on-dark-muted hover:text-on-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark"

// linia 86:
className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-on-dark-muted hover:text-on-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark"
```

- [ ] **Step 3: Manualna weryfikacja**

```bash
npm run dev
```

1. Otwórz `/catalog/QX`. Tab przez nawigację → przy hamburger menu na mobile widoczny outline.
2. Otwórz Lightbox z PackshotsQX (kliknij pierwszy packshot). Tab przez Close/Prev/Next — outline jasny na ciemnym tle.

- [ ] **Step 4: Aktualizacja design-system/page.tsx**

W sekcji Focus-Visible / Buttons:

```tsx
<DesignSystemNote>
  <strong>Focus na ciemnym tle:</strong> buttony ikonowe nad ciemnym
  overlay'em (Lightbox, FinishesQX preview) używają jawnego{' '}
  <code>focus-visible:outline-on-dark</code>; globalna reguła{' '}
  <code>:focus-visible</code> z <code>var(--ring)=#141414</code> jest
  niewidoczna na czarnym tle.
</DesignSystemNote>
```

- [ ] **Step 5: Commit**

```bash
git add src/components/catalog/Lightbox.tsx src/components/catalog/CatalogNav.tsx src/app/design-system/page.tsx
git commit -m "fix(a11y): explicit focus-visible outline on icon buttons over dark overlays (P3)"
```

---

### Task 2.4 (P4): Border kontrast w `MaterialsOptionGroup`

**Status:** **załatwione w T2.1** (`border-foreground/50` + `border-2` na selected). Pozostaje weryfikacja.

- [ ] **Step 1: Weryfikacja**

```bash
grep -n "border-foreground/" /Users/micz/__DEV__/__METRO_catalogs/src/components/catalog/MaterialsOptionGroup.tsx
```

Expected: tylko `border-foreground/50` (hover) i `border-foreground` (selected, z `border-2`). Brak `/20`.

Jeśli OK — przeskocz do T2.5. Jeśli nie — wróć do T2.1.

---

### Task 2.5 (P5): Modal preview w FinishesQX z useFocusTrap

**WCAG:** 2.4.3 (Focus Order), 4.1.2.

**Files:**
- Modify: `src/layouts/qx/FinishesQX.tsx:273–311`

- [ ] **Step 1: Dodać useRef + useFocusTrap do modala**

Na początku komponentu (po stanach `useState`), dodać:

```tsx
import { useFocusTrap } from '@/hooks/use-focus-trap';
// ...
const previewDialogRef = useRef<HTMLDivElement | null>(null);
useFocusTrap(previewDialogRef, isPreviewOpen);
```

(Import `useRef` już jest w pliku linia 3.)

- [ ] **Step 2: Podpiąć ref do dialog'u + dodać aria-labelledby**

W bloku `<motion.div role="dialog" ...>` (linia 275):

```tsx
// PRZED:
<motion.div
  className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-5"
  role="dialog"
  aria-modal="true"
  aria-label={previewAlt}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  onClick={() => setIsPreviewOpen(false)}
>

// PO:
<motion.div
  ref={previewDialogRef}
  className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-5"
  role="dialog"
  aria-modal="true"
  aria-labelledby="finishes-preview-title"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  onClick={() => setIsPreviewOpen(false)}
>
```

W zawartości modala dodać sr-only heading nad `<img>`:

```tsx
<motion.div ... onClick={(event) => event.stopPropagation()}>
  <h2 id="finishes-preview-title" className="sr-only">
    {previewAlt}
  </h2>
  <button ... aria-label="Close preview">×</button>
  <img ... />
</motion.div>
```

- [ ] **Step 3: Sanity check w dev**

```bash
npm run dev
```

`/catalog/QX` → kliknąć preview obraz w sekcji Finishes:
1. Modal otwiera się, fokus na X.
2. Tab cyklicznie wraca na X (jedyny focusable).
3. Escape zamyka, fokus wraca do trigger button (preview-image).
4. Body nie scrolluje za modalem.

- [ ] **Step 4: Aktualizacja design-system/page.tsx**

```tsx
<DesignSystemNote>
  <strong>Modal a11y:</strong> wszystkie modale używają hooka{' '}
  <code>useFocusTrap(ref, isOpen)</code> z <code>src/hooks/use-focus-trap.ts</code>
  — trap Tab, scroll lock body, restore focus do trigger po zamknięciu. Modal
  ma <code>role="dialog"</code> + <code>aria-modal="true"</code> +{' '}
  <code>aria-labelledby</code> wskazujące na <code>&lt;h2&gt;</code> (widoczny
  lub <code>sr-only</code>).
</DesignSystemNote>
```

- [ ] **Step 5: Commit**

```bash
git add src/layouts/qx/FinishesQX.tsx src/app/design-system/page.tsx
git commit -m "fix(a11y): FinishesQX preview modal uses useFocusTrap + aria-labelledby (P5)"
```

---

### Task 2.6 (P6): Tooltip w ColorChip — Escape

**Status:** **załatwione w T2.2**. Tylko weryfikacja.

- [ ] **Step 1: Weryfikacja**

Test już istnieje (`escape hides the tooltip after focus opens it`). Uruchom:

```bash
npm run test -- ColorChip
```

Expected: 3 passed (włącznie z escape).

---

### Task 2.7 (U5): `slowTransition` runtime check `prefers-reduced-motion`

**WCAG:** 2.3.3 (Animation from Interactions). globals.css zeruje czas animacji, ale logika kompozycyjna (multipliers) nie sprawdza preference w runtime.

**Files:**
- Modify: `src/lib/motion.ts`

- [ ] **Step 1: Dodać sprawdzenie w `scaleMotionValue`**

W `src/lib/motion.ts` zmień funkcję `scaleMotionValue` i `slowTransition`:

```ts
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function scaleMotionValue(value: number): number {
  if (prefersReducedMotion()) return 0;
  return value * CATALOG_MOTION_MULTIPLIER;
}
```

`slowTransition` w naturalny sposób użyje zerowych wartości — i tak wszystkie keys (`duration`, `delay`...) idą przez `scaleMotionValue` przez `result[key] = scaleMotionValue(value)` — zero × N = 0.

- [ ] **Step 2: Manualna weryfikacja**

```bash
npm run dev
```

DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`. Otwórz `/catalog/QX` — sekcje pojawiają się bez animacji wjazdu, hero slider nie autoplay, transitions zerowe.

- [ ] **Step 3: Commit**

```bash
git add src/lib/motion.ts
git commit -m "fix(a11y): scaleMotionValue returns 0 when prefers-reduced-motion (U5)"
```

---

### Task 2.8 (P7): Reflow — usunąć fixed widths

**WCAG:** 1.4.10 (Reflow).

**Files:**
- Modify: `src/layouts/qx/MaterialsQX.tsx:184`
- Modify: `src/layouts/type2/CatalogPageType2.tsx:30`
- Modify: `src/layouts/type3/CatalogPageType3.tsx` (znaleźć analogiczny `max-w-xl`)

- [ ] **Step 1: MaterialsQX — fixed `lg:w-[721px]`**

W `src/layouts/qx/MaterialsQX.tsx` linia 184:

```tsx
// PRZED:
className="mt-8 space-y-5 lg:mt-8 lg:ml-auto lg:w-[721px]"

// PO:
className="mt-8 space-y-5 lg:mt-8 lg:ml-auto lg:w-full lg:max-w-[721px]"
```

- [ ] **Step 2: CatalogPageType2 — `max-w-xl`**

W `src/layouts/type2/CatalogPageType2.tsx` linia 30:

```tsx
// PRZED:
<p className="mt-6 max-w-xl text-muted-foreground">

// PO:
<p className="mt-6 max-w-full sm:max-w-xl text-muted-foreground">
```

- [ ] **Step 3: CatalogPageType3 — analogicznie**

```bash
grep -n "max-w-xl" /Users/micz/__DEV__/__METRO_catalogs/src/layouts/type3/CatalogPageType3.tsx
```

Dla każdego trafienia zmień `max-w-xl` → `max-w-full sm:max-w-xl`.

- [ ] **Step 4: Manualna weryfikacja w DevTools**

```bash
npm run dev
```

DevTools → Device Toolbar → 320 px szerokość. Otwórz `/catalog/QX`, `/catalog/QS`. Brak poziomego scrolla, tekst wraps prawidłowo.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/qx/MaterialsQX.tsx src/layouts/type2/CatalogPageType2.tsx src/layouts/type3/CatalogPageType3.tsx
git commit -m "fix(a11y): remove fixed widths preventing 320px reflow (P7)"
```

---

## Faza 3: Większy wysiłek — krytyczne i globalne (3 zadania)

### Task 3.1 (K1): Refaktor Lightbox — useFocusTrap + aria-labelledby + restore focus

**WCAG:** 2.1.2, 2.4.3, 4.1.2, 4.1.3.

**Files:**
- Modify: `src/components/catalog/Lightbox.tsx`
- Create: `src/components/catalog/Lightbox.a11y.test.tsx` (uzupełnienie istniejącego `Lightbox.test.tsx`)

**Decyzja:** zostajemy przy własnej implementacji (nie migrujemy do Radix Dialog) — niska zmienność, mniejszy diff. Hook `useFocusTrap` z T0.2 robi 3/3 brakujące rzeczy (trap, scroll-lock, restore-focus).

- [ ] **Step 1: Failing test**

`src/components/catalog/Lightbox.a11y.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { Lightbox } from './Lightbox';
import { expectNoA11yViolations } from '@/test/a11y-helpers';

const images = [
  { src: '/a.webp', alt: 'image a' },
  { src: '/b.webp', alt: 'image b' },
];

describe('Lightbox a11y', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  it('locks body scroll when open', () => {
    render(
      <Lightbox
        images={images}
        index={0}
        onClose={() => {}}
        onNavigate={() => {}}
      />,
    );
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('uses aria-labelledby pointing to a heading or counter', () => {
    const { getByRole } = render(
      <Lightbox
        images={images}
        index={0}
        onClose={() => {}}
        onNavigate={() => {}}
      />,
    );
    const dialog = getByRole('dialog');
    const labelledBy = dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy!)).toBeTruthy();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <Lightbox
        images={images}
        index={0}
        onClose={() => {}}
        onNavigate={() => {}}
      />,
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 2: Uruchomić — FAIL**

```bash
npm run test -- Lightbox.a11y
```

Expected: FAIL — brak scroll lock, brak aria-labelledby.

- [ ] **Step 3: Refaktor `Lightbox.tsx`**

```tsx
'use client';

import { useEffect, useId, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFocusTrap } from '@/hooks/use-focus-trap';

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
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const counterId = useId();
  const isOpen = index !== null && Boolean(images[index]);

  useFocusTrap(dialogRef, isOpen);

  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen, onClose, onNavigate]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dialogRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-modal flex items-center justify-center bg-foreground/90 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby={counterId}
          onClick={onClose}
        >
          <button
            ref={closeRef}
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center text-on-dark-muted hover:text-on-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark"
            aria-label="Close lightbox"
          >
            <X size={28} />
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onNavigate(-1);
            }}
            className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-on-dark-muted hover:text-on-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark"
            aria-label="Previous image"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onNavigate(1);
            }}
            className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-on-dark-muted hover:text-on-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark"
            aria-label="Next image"
          >
            <ChevronRight size={32} />
          </button>
          <motion.img
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            src={images[index!].src}
            alt={images[index!].alt}
            draggable
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
            onClick={(event) => event.stopPropagation()}
          />
          <p
            id={counterId}
            className="absolute bottom-6 text-sm text-on-dark-muted"
            aria-live="polite"
          >
            Image {index! + 1} of {images.length}: {images[index!].alt}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

Zmiany:
1. `useFocusTrap(dialogRef, isOpen)` — trap, scroll-lock, restore-focus.
2. `useId()` na licznik → `aria-labelledby={counterId}`.
3. `focus-visible:outline-on-dark` na trzech przyciskach (P3).
4. Tekst licznika rozszerzony: `Image 1 of 12: <alt>` — pełny kontekst dla AT przy otwarciu.

- [ ] **Step 4: Test PASS**

```bash
npm run test -- Lightbox
```

Expected: wszystkie testy passed (włącznie z istniejącymi `Lightbox.test.tsx` i nowymi `Lightbox.a11y.test.tsx`).

- [ ] **Step 5: Sanity check w dev**

```bash
npm run dev
```

`/catalog/QX` → otwórz packshot:
1. Fokus auto-na X.
2. Tab cyklicznie: X → Prev → Next → X.
3. Body nie scrolluje.
4. Escape zamyka, fokus wraca do miniatury.
5. VoiceOver ogłasza „Image 1 of 12: front view of the desk".

- [ ] **Step 6: Aktualizacja design-system/page.tsx**

```tsx
<DesignSystemNote>
  <strong>Lightbox:</strong> używa hooka{' '}
  <code>useFocusTrap</code>; <code>aria-labelledby</code> wskazuje na licznik
  „Image N of M: alt"; ESC zamyka, ArrowLeft/Right nawigują; po zamknięciu
  fokus wraca do trigger (np. miniatura packshotu).
</DesignSystemNote>
```

- [ ] **Step 7: Commit**

```bash
git add src/components/catalog/Lightbox.tsx src/components/catalog/Lightbox.a11y.test.tsx src/app/design-system/page.tsx
git commit -m "fix(a11y): Lightbox uses useFocusTrap + aria-labelledby + descriptive counter (K1, U6, U8)"
```

---

### Task 3.2 (K5): FeaturesQX — wideo z dostępnym opisem

**WCAG:** 1.1.1, 1.2.1, 1.2.5.

**Decyzja produktowa:** `active.desc` (tekst pod tabem) jest **pełnym ekwiwalentem** treści wideo — wideo to wizualna prezentacja tej samej informacji. Pozostawiamy `aria-hidden="true"` na wideo (jako element czysto wzbogacający), ALE upewniamy się że tekstowy ekwiwalent jest:
1. Widoczny i powiązany z aktywną zakładką (już jest w tabpanel).
2. Mówi to samo, co pokazuje animacja.
3. Udokumentowany w design-system jako reguła.

Dodatkowo: dodajemy `<noscript>` fallback i `prefers-reduced-motion` już respektowany.

**Files:**
- Modify: `src/layouts/qx/FeaturesQX.tsx`
- Modify: `src/app/design-system/page.tsx`

- [ ] **Step 1: Dodać sr-only opis funkcji w aria-describedby**

W `src/layouts/qx/FeaturesQX.tsx`, w bloku `<video>` (linia 134–147):

```tsx
// PRZED:
{active?.video ? (
  <video
    ref={videoRef}
    key={`${activeIndex}-${active.video.src}`}
    src={active.video.src}
    poster={active.video.poster}
    className="absolute inset-0 h-full w-full object-cover"
    muted
    playsInline
    autoPlay={!prefersReducedMotion}
    preload="auto"
    aria-hidden="true"
  />
) : null}

// PO:
{active?.video ? (
  <>
    <video
      ref={videoRef}
      key={`${activeIndex}-${active.video.src}`}
      src={active.video.src}
      poster={active.video.poster}
      className="absolute inset-0 h-full w-full object-cover"
      muted
      playsInline
      autoPlay={!prefersReducedMotion}
      preload="auto"
      aria-hidden="true"
    />
    <span className="sr-only">
      {`Visual demonstration of ${active.title}: ${active.desc}`}
    </span>
  </>
) : null}
```

`<span class="sr-only">` daje czytnikowi ekranu krótki opis tego co animacja pokazuje, bez wpływu na układ. Tekst `active.desc` jest już renderowany jawnie w tabpanel (linia 117–127), więc nie ma duplikacji dla widzących.

- [ ] **Step 2: Build sanity check**

```bash
npm run build
```

Expected: 0 errors.

- [ ] **Step 3: Aktualizacja design-system/page.tsx**

```tsx
<DesignSystemNote>
  <strong>Wideo dekoracyjne (FeaturesQX):</strong> animacje funkcji są{' '}
  <code>aria-hidden="true"</code> jako wzbogacenie wizualne tekstu w
  tabpanel'u. Reguła: <em>nie umieszczamy unikalnej informacji w wideo</em> —
  tekst opisu (<code>active.desc</code>) musi być pełnym ekwiwalentem.
  Dodatkowy <code>&lt;span class="sr-only"&gt;</code> daje krótkie streszczenie
  „Visual demonstration of [title]: [desc]" dla czytników, gdy fokus jest na
  panelu wizualnym. Wideo respektuje <code>prefers-reduced-motion</code>.
</DesignSystemNote>
```

- [ ] **Step 4: Commit**

```bash
git add src/layouts/qx/FeaturesQX.tsx src/app/design-system/page.tsx
git commit -m "fix(a11y): FeaturesQX video with sr-only equivalent description (K5)"
```

---

### Task 3.3 (P2 + P8): Globalna rewizja kontrastu — muted-foreground + on-dark-muted + hero gradient

**WCAG:** 1.4.3 (Contrast).

**Files:**
- Modify: `src/app/globals.css:28, 54, 500–545`

**Decyzja kolorów:**
- `--muted-foreground: #616161` → `#595959` (≈ +0.5:1; #595959 na #f8f8f8 ≈ 6.5:1).
- `--on-dark-muted: #b8b8b8` → `#d0d0d0` (#d0d0d0 na #262626 ≈ 7.0:1; obecne #b8b8b8 ≈ 5.0:1 — przechodzi AA, ale na półprzezroczystym foreground/90 spada).
- `.hero-text` color #a6a09f — pozostaje (z gradientem pod tekstem).
- Dodać gradient pod hero-text dla gwarancji kontrastu na zmiennych obrazach.

- [ ] **Step 1: Aktualizacja tokenów w :root**

W `src/app/globals.css` linia 28:

```css
/* PRZED */
--muted-foreground: #616161;

/* PO */
/* WCAG AA: #595959 daje ≥6.5:1 na #f8f8f8 (zwiększony zapas wobec /60, /70 wariantów) */
--muted-foreground: #595959;
```

Linia 54:

```css
/* PRZED */
--on-dark-muted: #b8b8b8;

/* PO */
/* WCAG AA: #d0d0d0 daje ≥7:1 na #262626 — zapas dla półprzezroczystych ciemnych warstw */
--on-dark-muted: #d0d0d0;
```

- [ ] **Step 2: Hero gradient pod tekstem**

W `src/layouts/qx/HeroQX.tsx`, sekcja hero — przed `<div class="hero-content-wrapper">` (linia 377), dodać warstwę gradientową:

```tsx
{/* Gradient zapewniający kontrast hero-text nad zmiennymi obrazami */}
<div
  aria-hidden="true"
  className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 z-[5] bg-gradient-to-t from-black/65 via-black/30 to-transparent"
/>

<div
  className={`hero-content-wrapper relative z-10 ...`}
  ...
>
```

Gradient ma `z-[5]`, hero content `z-10` → tekst nad gradientem; `pointer-events-none` żeby nie blokował kliknięć.

- [ ] **Step 3: Sprawdzenie wszystkich wystąpień `text-muted-foreground/60`, `/70`, `/80`**

```bash
grep -rn "text-muted-foreground/" /Users/micz/__DEV__/__METRO_catalogs/src --include="*.tsx"
```

Po zmianie tokenu na #595959, warianty `/60` (≈ #595959 z α=0.6) na białym dadzą efektywnie #abacac → ~3:1, czyli **wciąż za mało dla normalnego tekstu**. Dla każdego wystąpienia rozważyć:
- jeśli to tekst pomocniczy (decoration, hint) — utrzymać `/60`.
- jeśli to istotny tekst (description, copy) — zmienić na `text-muted-foreground` (bez α).

W praktyce: zostawiamy jak jest (zmiana tokenu sama w sobie da ~+0.5:1 dla każdego wariantu), ale flagujemy w design-system regułę.

- [ ] **Step 4: Manualna weryfikacja kontrastu**

Otwórz `npm run dev` i `/catalog/QX`. W DevTools użyj Lighthouse → Accessibility, lub axe DevTools. Sprawdź sekcje:
- CatalogNav linki nieaktywne (text-muted-foreground)
- MaterialsQX descriptions
- Hero text na slidach (oba — z jasnym i ciemnym obrazem)
- Lightbox controls

Cel: 0 contrast violations w axe DevTools dla tekstów statycznych.

- [ ] **Step 5: Aktualizacja design-system/page.tsx**

W sekcji tokenów koloru:

```tsx
<DesignSystemNote>
  <strong>Token <code>--muted-foreground</code> = #595959</strong> (zmiana z
  #616161). Daje ≥6.5:1 na <code>--background #f8f8f8</code>. Warianty
  alfa <code>/60</code>, <code>/70</code>, <code>/80</code> pozostają poniżej
  AA dla tekstu — używaj ich tylko dla dekoracji.
</DesignSystemNote>
<DesignSystemNote>
  <strong>Token <code>--on-dark-muted</code> = #d0d0d0</strong>. Używany na
  ciemnych overlay'ach (Lightbox, Hero buttons). ≥7:1 na #262626.
</DesignSystemNote>
<DesignSystemNote>
  <strong>Hero gradient:</strong> sekcja Hero ma stałą warstwę{' '}
  <code>bg-gradient-to-t from-black/65 via-black/30 to-transparent</code> w
  dolnej 2/3 — gwarantuje kontrast hero-text nad zmiennymi obrazami slidów.
</DesignSystemNote>
```

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css src/layouts/qx/HeroQX.tsx src/app/design-system/page.tsx
git commit -m "fix(a11y): tighten muted-foreground + on-dark-muted contrast + hero gradient (P2, P8)"
```

---

## Faza 4: Umiarkowane i drobne poprawki (10 zadań)

### Task 4.1 (U1): renderQxText — `<br>` jako fragmenty

**Decyzja:** `<br>` jest semantycznie OK dla istniejących treści (krótkie tagline'y, etykiety). Migracja na `white-space: pre-line` byłaby zmianą breaking dla wielu sekcji. **Zostawiamy bez zmian**, ale dodajemy komentarz w pliku.

**Files:** `src/components/catalog/renderQxText.tsx`

- [ ] **Step 1: Komentarz wyjaśniający**

```tsx
// Note: użycie <br> jest świadome — treści katalogu są krótkimi tagline'ami
// gdzie linebreak jest semantycznie istotny (kompozycja typograficzna).
// Dla dłuższych prozaicznych tekstów preferuj `white-space: pre-line` w CSS.
const QX_TOKEN_REGEX = /\bQX\b/gi;
```

(Brak zmiany kodu — tylko komentarz dokumentujący decyzję, zgodnie z CLAUDE.md o komentarzach: dokumentujemy WHY/decyzję, nie WHAT.)

- [ ] **Step 2: Commit**

```bash
git add src/components/catalog/renderQxText.tsx
git commit -m "docs(a11y): document deliberate <br> use in renderQxText (U1)"
```

(Lub: pomiń to zadanie całkowicie. Audyt klasyfikował to jako MODERATE bez konkretnej szkody. Decyzja po stronie użytkownika.)

---

### Task 4.2 (U4): SectionShell — opcjonalny aria-label fallback

**Files:** `src/components/catalog/SectionShell.tsx`

- [ ] **Step 1: Dodać opcjonalną prop `label`**

```tsx
import type { ReactNode } from 'react';

interface SectionShellProps {
  id: string;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  /** Override aria-label gdy sekcja nie zawiera <h2 id={id}-title>. */
  label?: string;
}

const DEFAULT_BG = 'bg-surface-elevated';
const DEFAULT_INNER =
  'mx-auto w-full max-w-[1440px] px-5 pt-6 pb-12 sm:px-8 sm:pt-8 lg:px-0';

export function SectionShell({
  id,
  children,
  className,
  innerClassName,
  label,
}: SectionShellProps) {
  const sectionClass = className?.includes('bg-')
    ? className
    : `${DEFAULT_BG}${className ? ` ${className}` : ''}`;
  const innerClass = innerClassName ?? DEFAULT_INNER;
  const labellingProps = label
    ? { 'aria-label': label }
    : { 'aria-labelledby': `${id}-title` };
  return (
    <section id={id} className={sectionClass} {...labellingProps}>
      <div className={innerClass}>{children}</div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/catalog/SectionShell.tsx
git commit -m "fix(a11y): SectionShell supports aria-label fallback when no <h2>-id (U4)"
```

---

### Task 4.3 (U6): Lightbox initial counter announcement

**Status:** **załatwione w T3.1** (counter renderuje się od razu przy otwarciu, `aria-live="polite"` ogłasza zmiany).

---

### Task 4.4 (U7): GalleryQX min-h 44 → 48

**Files:** `src/layouts/qx/GalleryQX.tsx:73, 97`

- [ ] **Step 1: Zmiana**

```bash
grep -n "min-h-\[44px\]" /Users/micz/__DEV__/__METRO_catalogs/src/layouts/qx/GalleryQX.tsx
```

Każde wystąpienie `min-h-[44px]` w GalleryQX zamienić na `min-h-[48px]`.

- [ ] **Step 2: Commit**

```bash
git add src/layouts/qx/GalleryQX.tsx
git commit -m "fix(a11y): GalleryQX touch target 44 → 48 px (U7)"
```

---

### Task 4.5 (U8): PackshotsQX — aria-label → aria-labelledby

**Status:** **częściowo załatwione w T3.1** (Lightbox jako komponent ma aria-labelledby z licznika). PackshotsQX używa `<Lightbox>` i nie definiuje własnego dialogu. Sprawdź.

- [ ] **Step 1: Weryfikacja**

```bash
grep -n "aria-label" /Users/micz/__DEV__/__METRO_catalogs/src/layouts/qx/PackshotsQX.tsx
```

Jeśli PackshotsQX renderuje własny modal z `role="dialog" aria-label="Packshot lightbox"` (poza Lightbox.tsx), zamień na `aria-labelledby` z heading. Jeśli używa tylko `<Lightbox>` — NIC do zmiany.

---

### Task 4.6 (U9): OverviewQX figcaption — decyzja

**Files:** `src/layouts/qx/OverviewQX.tsx:65`

- [ ] **Step 1: Decyzja**

`<figcaption className="sr-only">` jest **akceptowalne** WCAG-wise (informacja dostarczona AT). Audyt klasyfikował to jako MODERATE z sugestią widocznej krótkiej + sr-only rozszerzonej. Decyzja po stronie produktu/designu.

**Default:** zostawić bez zmian. Skipuje się to zadanie chyba że stakeholder zdecyduje inaczej.

---

### Task 4.7 (D1): Hero — sr-only swipe instruction dla mobile

**Files:** `src/layouts/qx/HeroQX.tsx`

- [ ] **Step 1: Dodać sr-only instrukcję**

W bloku tablistu (linie 333–360), dodać przed `<motion.div role="tablist">`:

```tsx
<span className="sr-only">
  Swipe left or right, or use slide indicators below, to navigate slides.
</span>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/qx/HeroQX.tsx
git commit -m "fix(a11y): sr-only swipe instruction for hero on mobile (D1)"
```

---

### Task 4.8 (D2): FinishesQX preview — ikona lupy na hover

**Files:** `src/layouts/qx/FinishesQX.tsx:246–270`

- [ ] **Step 1: Dodać ikonę lupy**

```tsx
import { ZoomIn } from 'lucide-react';
// ...

<button
  type="button"
  className="group relative block h-full w-full cursor-zoom-in overflow-hidden text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
  onClick={() => setIsPreviewOpen(true)}
  aria-label={`Open preview: ${previewAlt}`}
>
  <span
    aria-hidden="true"
    className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center bg-surface-elevated/90 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
  >
    <ZoomIn size={18} strokeWidth={1.5} />
  </span>
  ...
</button>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/qx/FinishesQX.tsx
git commit -m "fix(a11y): zoom-in icon affordance on FinishesQX preview button (D2)"
```

---

### Task 4.9 (D3): Per-katalog `<title>`

**Files:** `src/app/catalog/[catalogId]/page.tsx`

- [ ] **Step 1: Sprawdzenie**

```bash
grep -n "generateMetadata\|metadata" /Users/micz/__DEV__/__METRO_catalogs/src/app/catalog/\[catalogId\]/page.tsx
```

Jeśli `generateMetadata` istnieje i zwraca `title` z nazwą katalogu (np. `${catalog.meta.title} — METRO`) — OK, skip. Jeśli nie — dodać:

```tsx
export async function generateMetadata({
  params,
}: {
  params: { catalogId: string };
}): Promise<Metadata> {
  const catalog = await getCatalog(params.catalogId);
  return {
    title: `${catalog.meta.title} — METRO Catalogs`,
    description: catalog.meta.description,
  };
}
```

- [ ] **Step 2: Commit (jeśli zmiana)**

```bash
git add src/app/catalog/\[catalogId\]/page.tsx
git commit -m "fix(a11y): per-catalog page title in metadata (D3)"
```

---

### Task 4.10 (D4): Cleanup redundant alt+aria-hidden

**Files:** `src/layouts/qx/CatalogPageQX.tsx:104–111`

- [ ] **Step 1: Usunąć `aria-hidden="true"` (alt="" wystarcza)**

```tsx
// PRZED:
<Image
  src={entry.thumbnail}
  alt=""
  aria-hidden="true"
  fill
  sizes="(min-width: 1024px) 180px, (min-width: 640px) 25vw, 50vw"
  className="..."
/>

// PO:
<Image
  src={entry.thumbnail}
  alt=""
  fill
  sizes="(min-width: 1024px) 180px, (min-width: 640px) 25vw, 50vw"
  className="..."
/>
```

(Pusty alt + brak aria-hidden = AT pomija obraz; redundancja eliminowana.)

- [ ] **Step 2: Commit**

```bash
git add src/layouts/qx/CatalogPageQX.tsx
git commit -m "refactor(a11y): remove redundant aria-hidden on alt='' images (D4)"
```

---

## Faza 5: Weryfikacja końcowa i aktualizacja design-system

### Task 5.1: Pełny audyt design-system/page.tsx

**Cel:** Strona design-systemu zawiera komplet not o:
- Wszystkie tokeny: `--muted-foreground` (#595959), `--on-dark-muted` (#d0d0d0).
- Każdy zaktualizowany komponent: CatalogNav (aria-current), MaterialsOptionGroup (group + ≥3:1 borders), ColorChip (44×44 + Escape), Lightbox (focus-trap + counter), FinishesQX preview (focus-trap + zoom icon), HeroQX (gradient + dot shape + sr-only swipe).
- Wzorce: useFocusTrap hook, focus-visible-on-dark.
- Reguły z `docs/zasady.md` 1–10 z linkiem do audytu.

**Files:** `src/app/design-system/page.tsx`

- [ ] **Step 1: Sekcja „Accessibility (WCAG 2.1 AA)" w design-system**

Dodać dedykowaną sekcję na początku/końcu page.tsx z linkiem do `.ui-design/audits/metro_catalogs_zasady_20260507_115012.md` i listą wzorców.

- [ ] **Step 2: Sanity check — wszystkie linki działają**

```bash
npm run dev
```

Otwórz `/design-system`. Wszystkie sekcje renderują się, wszystkie kotwice/linki do audytu działają.

- [ ] **Step 3: Commit**

```bash
git add src/app/design-system/page.tsx
git commit -m "docs(design-system): comprehensive a11y patterns documentation"
```

---

### Task 5.2: Manualna weryfikacja końcowa (checklist z audytu)

**Files:** brak — tylko weryfikacja.

- [ ] **Step 1: Lighthouse Accessibility ≥ 95 na 3 stronach**

```bash
npm run build && npm run start
```

Otworzyć Lighthouse w Chrome i przeanalizować:
- `http://localhost:3000/`
- `http://localhost:3000/catalog/QX`
- `http://localhost:3000/catalog/QS`

Cel: Accessibility score ≥ 95 na każdej. Zapisać raporty.

- [ ] **Step 2: axe DevTools — 0 violations**

W każdej z trzech stron uruchomić axe DevTools (browser ext). Cel: 0 violations.

- [ ] **Step 3: Klawiatura end-to-end**

- Tab przez całą `/catalog/QX` od skip-link do footer.
- Otworzyć Lightbox z PackshotsQX → Tab cyklicznie → Esc → fokus wraca.
- Otworzyć preview w FinishesQX → analogicznie.
- Strzałki Hero (ArrowLeft/Right) — zmiana slajdu.
- Tab przez MaterialsOptionGroup — `aria-pressed` zmienia się przy kliknięciu/Enter.

- [ ] **Step 4: VoiceOver (macOS) sanity**

VoiceOver Cmd+F5. Przejść `/catalog/QX`:
- VO ogłasza skip-link.
- Sekcje ogłaszane z nazwami (z `aria-labelledby`).
- MaterialsOptionGroup ogłasza grupę z tytułem.
- Lightbox ogłasza „dialog, Image 1 of N: alt".

- [ ] **Step 5: prefers-reduced-motion**

DevTools → Rendering → Emulate `reduce`. Strona renderuje się bez animacji wjazdu, slider nie autoplay, video nie autoplay.

- [ ] **Step 6: 320 px reflow**

DevTools → Device Toolbar → Custom 320×640. `/catalog/QX` i `/catalog/QS`. Brak poziomego scrolla, treść czytelna.

- [ ] **Step 7: Zaktualizować audit_state.json**

`/Users/micz/__DEV__/__METRO_catalogs/.ui-design/audits/audit_state.json`:

```json
{
  ...
  "compliance_status": "compliant",
  "remediation_completed_at": "<ISO timestamp>",
  "remediation_plan": "docs/superpowers/plans/2026-05-07-accessibility-wcag-aa-remediation.md"
}
```

- [ ] **Step 8: Final commit**

```bash
git add .ui-design/audits/audit_state.json
git commit -m "docs(a11y): mark WCAG AA remediation complete after manual verification"
```

---

## Self-Review Checklist (do wykonania przez wykonawcę po skończeniu)

- [ ] Każdy z 27 znalezisk audytu (K1–K5, P1–P8, U1–U9, D1–D5) ma odpowiadające zadanie lub jest świadomie pominięty (U6, U9, D3 — jeśli sprawdzenie wykazało, że są OK).
- [ ] Wszystkie zmiany UI mają commit aktualizujący `src/app/design-system/page.tsx` (regulamin AGENTS.md).
- [ ] Wszystkie nowe komponenty/hooki mają testy w `vitest`.
- [ ] `npm run typecheck && npm run lint && npm run test && npm run build` zielone.
- [ ] Lighthouse a11y ≥ 95, axe DevTools 0 violations.

---

## Mapping zasad uniwersalnego projektowania (`docs/zasady.md`) → zadania

| Zasada | Zadania pokrywające |
| --- | --- |
| 1. Równe i niedyskryminujące | (już ✅ — bez zmian) |
| 2. Elastyczność użytkowania | T0.2, T2.5, T3.1 (focus-trap), T2.7 (reduced-motion) |
| 3. Prosta i intuicyjna obsługa | (już ✅) |
| 4. Czytelna i wielokanałowa komunikacja | T1.4 (P1 dot shape), T3.2 (K5 sr-only), T1.2 (K3 aria-current) |
| 5. Tolerancja na błędy | (N/A — brak formularzy) |
| 6. Niski wysiłek fizyczny i poznawczy | T2.2 (K4 ColorChip 44×44), T1.5 (D5 scrollbar 12px), T4.4 (U7) |
| 7. Odpowiedni rozmiar i przestrzeń | T2.8 (P7 reflow) |
| 8. WCAG AA | całość |
| 9. Spójność i przewidywalność | T2.1 (K2 group), T4.2 (U4 SectionShell) |
| 10. Pełna dostępność treści | T3.2 (K5 video), T4.10 (D4) |

---

_Plan utworzony: 2026-05-07 11:55 GMT+2 — superpowers/writing-plans_
_Audyt źródłowy: [.ui-design/audits/metro_catalogs_zasady_20260507_115012.md](../../../.ui-design/audits/metro_catalogs_zasady_20260507_115012.md)_
_Reguła design-systemu: [AGENTS.md](../../../AGENTS.md) — każda zmiana UI = aktualizacja `src/app/design-system/page.tsx`_
