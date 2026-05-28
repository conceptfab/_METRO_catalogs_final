# Audyt dostępności frontendu — METRO Catalogs

**Audit ID:** metro_catalogs_zasady_20260507_115012
**Data:** 2026-05-07 11:50 GMT+2
**Zakres:** custom UI Next.js — `src/app/**`, `src/layouts/qx/**`, `src/layouts/type2/**`, `src/layouts/type3/**`, `src/components/catalog/**`, `src/lib/{icon-map,motion}`, tokeny (`globals.css`, `tailwind.config.ts`)
**Standard:** WCAG 2.1 Level AA
**Podstawa prawna / merytoryczna:** [docs/zasady.md](../../docs/zasady.md) — zasady uniwersalnego projektowania (Rozporządzenie PE i Rady UE 2021/1057, Ustawa z dnia 19.07.2019 o zapewnianiu dostępności osobom ze szczególnymi potrzebami)

> Audyt **statyczny** (analiza kodu). Nie zastępuje testów manualnych z technologiami asystującymi ani pomiarów kontrastu na rzeczywistych zdjęciach hero/overview. W kilku miejscach (kontrast tekstu na zdjęciach) wskazano to wprost.

---

## Podsumowanie wykonawcze

**Status zgodności:** **Wymaga poprawek przed deklaracją zgodności WCAG AA.**

| Kategoria | Liczba | Charakter |
| --- | --- | --- |
| Krytyczne | 5 | Blokują użytkowników z niepełnosprawnościami (modal bez focus-trap, brak grupowania semantycznego radio, target < 24×24, błędna wartość `aria-current`) |
| Poważne | 8 | Znaczące bariery (kontrast graniczny, focus ring na ikonach, color-only state, video bez napisów) |
| Umiarkowane | 9 | Utrudnienie dla niektórych użytkowników |
| Drobne | 5 | Najlepsze praktyki / poziom AAA |

**Liczba audytowanych plików:** 27
**Mocne fundamenty (passed):** wsparcie `prefers-reduced-motion` (globals.css:367–379), globalny `:focus-visible` z 3 px outline (globals.css:382–386), poprawna implementacja `lang="en"` na `<html>`, semantyczny `<main id="main-content">`, skip-link (CatalogPageQX.tsx:39–41), wzorzec `aria-labelledby` w sekcjach QX (`SectionShell` + `SectionHeading`), poprawny tablist w `HeroQX` i `FeaturesQX`, poprawne `aria-pressed`/`aria-expanded` w nawigacji, `aria-live="polite"` na liczniku packshotów.

---

## Mapowanie zasad uniwersalnego projektowania → WCAG 2.1 AA

| Zasada z `docs/zasady.md` | Powiązane kryterium WCAG | Stan |
| --- | --- | --- |
| 1. Równe i niedyskryminujące użytkowanie | 1.4.5, 4.1.2 | ✅ Brak osobnej wersji „dostępnej"; jedna ścieżka dla wszystkich |
| 2. Elastyczność użytkowania (mysz/klawiatura/dotyk/AT) | 2.1.1, 2.1.2, 2.5.7 | ⚠️ Klawiatura w `Lightbox` częściowa (brak focus-trap), kilka komponentów bez fokus-restore |
| 3. Prosta i intuicyjna obsługa | 3.2.3, 3.2.4 | ✅ Spójna nawigacja; predykcyjne zachowanie |
| 4. Czytelna i wielokanałowa komunikacja | 1.1.1, 1.4.1 | ⚠️ Stan zaznaczenia (slider, swatche) komunikowany kolorem — `aria-pressed`/`aria-current` częściowo brak/błędne |
| 5. Tolerancja na błędy | 3.3.1–3.3.4 | ✅ N/A (brak formularzy) |
| 6. Niski wysiłek fizyczny i poznawczy | 2.5.5, 2.4.3 | ⚠️ `ColorChip` 24×24 px na granicy AA |
| 7. Odpowiedni rozmiar i przestrzeń interakcji | 1.4.10, 2.5.5 | ⚠️ `max-w-xl` w Type2/Type3 może wymuszać reflow < 320 px |
| 8. Zgodność z WCAG AA | całość | ⚠️ Patrz lista poniżej |
| 9. Spójność i przewidywalność | 3.2.3 | ✅ |
| 10. Pełna dostępność treści produktowych | 1.1.1, 1.3.1 | ⚠️ Video w `FeaturesQX` `aria-hidden="true"` — pomija opisy alternatywne dla treści funkcjonalnej |

---

## ⛔ KRYTYCZNE — naprawić przed publikacją

### K1. Lightbox bez focus-trap, scroll-lock i przywrócenia fokusa
**WCAG:** 2.1.2 (No Keyboard Trap — odwrotnie: brak utrzymania fokusa w modalu), 4.1.2 (Name/Role/Value), 2.4.3 (Focus Order)
**Plik:** [src/components/catalog/Lightbox.tsx:19–109](../../src/components/catalog/Lightbox.tsx#L19-L109)
**Element:**
```tsx
<motion.div role="dialog" aria-modal="true" aria-label="Image lightbox" onClick={onClose}>
```
**Problem:**
1. Tab wyprowadza fokus na elementy w tle pod warstwą modala (brak focus-trap).
2. Brak blokady przewijania `<body>` — strona za modalem przewija się.
3. Po zamknięciu fokus nie wraca do elementu wyzwalającego (np. miniatury w `PackshotsQX` / `GalleryQX`).
4. `aria-label="Image lightbox"` jest zbyt ogólne — brakuje `aria-labelledby` do tytułu/licznika.

**Wpływ:** Użytkownicy klawiatury (osoby z niepełnosprawnością ruchową, AT) tracą orientację — fokus „ucieka" pod modal, po zamknięciu trafia na początek dokumentu.

**Naprawa:**
```tsx
// Lightbox.tsx — dodać do useEffect(index)
useEffect(() => {
  if (index === null) return;
  const trigger = document.activeElement as HTMLElement | null;
  document.body.style.overflow = 'hidden';
  closeRef.current?.focus();

  const trapTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], [tabindex]:not([tabindex="-1"])',
    );
    if (!focusables?.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  window.addEventListener('keydown', trapTab);
  return () => {
    window.removeEventListener('keydown', trapTab);
    document.body.style.overflow = '';
    trigger?.focus();
  };
}, [index]);
```
Dodać `<p id="lightbox-counter">` i `aria-labelledby="lightbox-counter"` na `<motion.div>`.

---

### K2. `MaterialsOptionGroup` — brak semantyki grupy radio/listbox
**WCAG:** 1.3.1 (Info & Relationships), 4.1.2 (Name/Role/Value)
**Plik:** [src/components/catalog/MaterialsOptionGroup.tsx:41–74](../../src/components/catalog/MaterialsOptionGroup.tsx#L41-L74)
**Element:**
```tsx
<h3 id={...}>{title}</h3>
<div className="flex flex-wrap gap-2">
  {options.map(o => <button aria-pressed={isSelected} onClick={...} />)}
</div>
```
**Problem:** Pojedyncze przyciski mają `aria-pressed`, ale brak kontenera z `role="radiogroup"` lub `role="group"` powiązanego z `<h3>` przez `aria-labelledby`. Czytnik ekranu nie ogłasza „grupa opcji X, 1 z 6 zaznaczone".

**Naprawa:**
```tsx
<div role="radiogroup" aria-labelledby={`${idPrefix}-title`} className="flex flex-wrap gap-2">
  {options.map(o => (
    <button role="radio" aria-checked={isSelected} ... />
  ))}
</div>
```
Albo (gdy zachowanie różni się od radio — np. dopuszczalna deselekcja) zostać przy `aria-pressed`, ale dodać `role="group"` na kontenerze.

---

### K3. `aria-current="true"` zamiast wartości enumerowanej
**WCAG:** 4.1.2 (Name/Role/Value)
**Plik:** [src/components/catalog/CatalogNav.tsx:234–236, 278–280, 327–329](../../src/components/catalog/CatalogNav.tsx)
**Element:**
```tsx
aria-current={isSectionHighlighted(section.id) ? 'true' : undefined}
```
**Problem:** Specyfikacja ARIA wymaga jednej z wartości `page | step | location | date | time | true | false`. Wartość `'true'` jako string działa, ale dla nawigacji w obrębie strony właściwą wartością jest `'location'` (sekcja jest celem in-page) lub `'page'` (gdy traktujemy sekcje jako mini-strony). Niektóre czytniki (NVDA + IE) ignorują nietypowe wartości.

**Naprawa:**
```tsx
aria-current={isSectionHighlighted(section.id) ? 'location' : undefined}
```

---

### K4. `ColorChip` — touch target 24×24 px (granica AA / poniżej AAA)
**WCAG:** 2.5.5 (Target Size — AAA), 2.5.8 (Target Size Minimum — AA, ≥ 24 px)
**Plik:** [src/components/catalog/ColorChip.tsx:49–56](../../src/components/catalog/ColorChip.tsx#L49-L56)
**Element:** `<img tabIndex={0} className="block h-6 w-6 ..." />` (24×24 px)
**Problem:** Element jest interaktywny (otwiera tooltip), ale rozmiar dokładnie odpowiada minimum AA z WCAG 2.2 (kryt. 2.5.8) i jest poniżej rekomendowanego 44×44 px (2.5.5). Dla osób z ograniczoną sprawnością manualną i na ekranach dotykowych celowanie w 24 px jest trudne. Dodatkowo `<img tabIndex={0}>` to nietypowy wzorzec — element nie ma roli interaktywnej.

**Naprawa:**
```tsx
<button
  type="button"
  className="flex h-11 w-11 items-center justify-center rounded-full ..."
  aria-label={ariaLabel}
  onFocus={show} onBlur={hide} onMouseEnter={show} onMouseLeave={hide}
>
  <img src={option.thumbnail} alt="" aria-hidden="true" className="h-6 w-6" />
</button>
```

---

### K5. `FeaturesQX` — wideo `aria-hidden="true"` jako jedyny nośnik treści funkcji
**WCAG:** 1.1.1 (Non-text Content), 1.2.1/1.2.3 (Audio-only & Video-only Alternatives), 1.2.5 (Audio Description — AA)
**Plik:** [src/layouts/qx/FeaturesQX.tsx:145](../../src/layouts/qx/FeaturesQX.tsx)
**Element:** `<video aria-hidden="true" autoPlay={!prefersReducedMotion} muted ... />`
**Problem:** Wideo `QS_accessory.mp4`, `QS_assembly.mp4`, `QS_extend.mp4`, `QS_modular.mp4`, `QS_welds.mp4` ilustrują *funkcje produktu* (akcesoria, montaż, modułowość, spawy). To **treść**, a nie dekoracja. `aria-hidden="true"` całkowicie ukrywa je przed AT — użytkownicy czytników ekranu nie dostają żadnej informacji.

**Naprawa (wybierz jedno):**
1. **Pełna dostępność:** dodać `<track kind="captions">` + tekstową alternatywę pod wideo (każda zakładka funkcji już ma tytuł + opis tekstowy — sprawdzić, czy opis pokrywa treść animacji; jeśli tak, można uzasadnić techniczną dekoracyjność).
2. **Pragmatycznie:** jeśli opis tekstowy pod każdą zakładką jest pełnym ekwiwalentem (sprawdzić w `content.json`), pozostawić `aria-hidden="true"`, ale **udokumentować w design-system/page.tsx**, że animacje są wzbogaceniem wizualnym, nie nośnikiem unikalnej informacji. Wówczas dodać `<noscript>` lub widoczny tekstowy opis.

---

## 🟧 POWAŻNE — wymagają poprawki w najbliższym sprincie

### P1. Wskaźniki slajdów Hero — stan tylko kolorem
**WCAG:** 1.4.1 (Use of Color)
**Plik:** [src/layouts/qx/HeroQX.tsx:345–356](../../src/layouts/qx/HeroQX.tsx)
**Problem:** Aktywny dot ma `bg-primary`, nieaktywny `bg-on-dark-muted/60`. To różnica wyłącznie barwowa. `role="tab"` + `aria-selected` jest poprawnie ustawione, ale wizualnie użytkownik z dyschromatyzją lub w high-contrast mode nie odróżni stanów.
**Naprawa:** zwiększyć aktywny dot (np. `w-6 h-2 rounded-full`) — różnica kształtu/rozmiaru oprócz koloru. Lub dodać obramowanie/glif na aktywnym.

### P2. Kontrast `text-muted-foreground` (#616161) graniczny
**WCAG:** 1.4.3 (Contrast)
**Plik:** [src/app/globals.css](../../src/app/globals.css) — token `--muted-foreground: #616161` na `--background: #f8f8f8`
**Problem:** Wyliczony kontrast ≈ **5.5:1** dla #616161 na #f8f8f8 — przechodzi AA dla tekstu normalnego (4.5:1), ale na białym tle (#ffffff) #616161 daje **6.0:1**, a na ciemniejszych warstwach (`bg-secondary`, `bg-muted`) spada ku granicy. Występuje masowo: `CatalogNav.tsx:232,276`, `CatalogPageType2.tsx:17`, `MaterialsQX`, opisy w `OverviewQX`. **Test ręczny niezbędny** — szczególnie dla `text-muted-foreground/60` itp. wariantów.
**Naprawa:** rozważyć `--muted-foreground: #595959` (≈ 6.5:1) — niewielka zmiana, większy zapas. Zweryfikować wszystkie warianty `/60`, `/70`, `/80` w designie.

### P3. Brak focus-ring na przyciskach ikonowych w `CatalogNav` i `Lightbox`
**WCAG:** 2.4.7 (Focus Visible)
**Plik:** [CatalogNav.tsx:248–251, 338–342](../../src/components/catalog/CatalogNav.tsx); [Lightbox.tsx:60–90](../../src/components/catalog/Lightbox.tsx)
**Problem:** Brak jawnego `focus-visible:outline` — komponenty polegają na globalnej regule `:focus-visible` (globals.css:382), ale na ciemnym overlay'u (`bg-foreground/90`) outline w kolorze `var(--ring)` może być słabo widoczny.
**Naprawa:**
```tsx
className="... focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark"
```

### P4. `MaterialsOptionGroup` — kontrast obramowania zaznaczonej opcji
**WCAG:** 1.4.11 (Non-text Contrast)
**Plik:** [MaterialsOptionGroup.tsx:56–60](../../src/components/catalog/MaterialsOptionGroup.tsx)
**Problem:** Hover state `border-foreground/20` ≈ 2.0:1 na białym — poniżej wymaganych 3:1 dla komponentów UI. Cień `rgba(0,0,0,0.18)` jest słabym wzmocnieniem.
**Naprawa:** zmienić hover na `border-foreground/50` i zwiększyć szerokość obramowania zaznaczenia do 2 px solid.

### P5. Modal podglądu materiału w `FinishesQX` — brak `aria-labelledby` i focus-trap
**WCAG:** 1.3.1, 2.4.3, 4.1.2
**Plik:** [src/layouts/qx/FinishesQX.tsx:275–310](../../src/layouts/qx/FinishesQX.tsx)
**Problem:** `role="dialog"` + `aria-modal="true"` + `aria-label={previewAlt}` — działa, ale brak focus-trap (Tab wychodzi do tła) i brak przywrócenia fokusa do triggera.
**Naprawa:** wydzielić logikę z Lightbox K1 do hooka `useFocusTrap(ref, isOpen)` i użyć w obu komponentach.

### P6. Tooltip `ColorChip` — brak Escape do zamknięcia
**WCAG:** 1.4.13 (Content on Hover or Focus)
**Plik:** [ColorChip.tsx:42–78](../../src/components/catalog/ColorChip.tsx)
**Problem:** Tooltip pojawia się na focus/hover, ale nie można go schować klawiszem Escape (warunek WCAG 1.4.13: dismissible).
**Naprawa:** dodać globalny `keydown` na Escape w mount tooltipa i `setTooltipVisible(false)`.

### P7. Reflow — `max-w-xl` w Type2/Type3 i fixed widths w `MaterialsQX`
**WCAG:** 1.4.10 (Reflow)
**Pliki:** [CatalogPageType2.tsx:17,30](../../src/layouts/type2/CatalogPageType2.tsx); [CatalogPageType3.tsx](../../src/layouts/type3/CatalogPageType3.tsx); fixed `w-[721px]` w `MaterialsQX`
**Problem:** Przy 320 px viewport ograniczenia nie wymuszają overflow — Tailwind `max-w-xl` (576 px) na `<p>` przy `width:100%` daje wrap. Fixed `w-[721px]` w sekcji konfiguracji materiałów (kontener tile'i) może wymuszać poziomy scroll na mobile.
**Naprawa:** zweryfikować w DevTools przy 320 px; zmienić sztywne `w-[721px]` na `w-full max-w-[721px]`.

### P8. `text-on-dark-muted` (#b8b8b8) na półprzezroczystym tle wideo
**WCAG:** 1.4.3
**Pliki:** [HeroQX.tsx](../../src/layouts/qx/HeroQX.tsx), [Lightbox.tsx:66,76,86](../../src/components/catalog/Lightbox.tsx)
**Problem:** Kontrast jest wyliczalny tylko deklaratywnie wobec stałego tła. Na obrazach/wideo (Hero) z dynamiczną luminancją kontrast jest **niegwarantowany** — wymaga gradientu/maski pod tekstem (jest częściowo: `bg-foreground/90` w Lightbox, ale w Hero overlay może być słabszy).
**Naprawa:** wymusić minimalny gradient pod tekstem hero (np. `bg-gradient-to-t from-black/70 via-black/30 to-transparent`) lub użyć `text-shadow`.

---

## 🟨 UMIARKOWANE

### U1. `<br>` w `renderQxText` zamiast semantyki
[src/components/catalog/renderQxText.tsx:20–28](../../src/components/catalog/renderQxText.tsx) — `<br>` po split na `\n` / `/n` jest prezentacyjny. Dla typografii lepiej `white-space: pre-line` na kontenerze.

### U2. `<p>` zamiast `<h2>` w sekcjach landing
[src/app/page.tsx:38–40](../../src/app/page.tsx) — etykieta sekcji `Operational office furniture` jest `<p class="section_ID">`. Wizualnie wygląda jak nagłówek, semantycznie nie jest. Poprawić na `<h2>` lub `<p role="doc-subtitle">`.

### U3. Redundantne `lang="en"` na `<main>`
[src/layouts/qx/CatalogPageQX.tsx:52](../../src/layouts/qx/CatalogPageQX.tsx) — `<main lang="en">` powiela atrybut z `<html lang="en">`. Usunąć z `<main>`.

### U4. `SectionShell` zakłada istnienie `${id}-title`
[src/components/catalog/SectionShell.tsx:25](../../src/components/catalog/SectionShell.tsx) — `aria-labelledby={`${id}-title`}` bez fallbacka. Jeśli ktoś użyje shella bez `SectionHeading`, AT odczyta sekcję bez nazwy. Dodać guard albo wymusić heading w propsach (TypeScript).

### U5. `motion.ts` — `slowTransition` nie sprawdza prefers-reduced-motion w runtime
[src/lib/motion.ts:62–90](../../src/lib/motion.ts) — `CATALOG_MOTION_MULTIPLIER = 2` jest zawsze stosowany; redukcja w globals.css zeruje czas, ale logika kompozycyjna pomija check. Bez negatywnego wpływu na zgodność (globals.css załatwia), ale wartościowa konsystencja.

### U6. Counter w `Lightbox` — `aria-live` ogłasza tylko po zmianie indexu
[Lightbox.tsx:102](../../src/components/catalog/Lightbox.tsx) — przy otwarciu czytnik nie usłyszy „1/12". Dodać początkowe ogłoszenie przez `aria-labelledby` na dialogu.

### U7. Gallery — touch target przy aspect-ratio
[src/layouts/qx/GalleryQX.tsx:73,97](../../src/layouts/qx/GalleryQX.tsx) — `aspect-[1075/1078] min-h-[44px]` przy bardzo wąskim viewport może dawać przycisk 44×44 px. Akceptowalne, ale rozważyć `min-h-[48px]`.

### U8. `aria-label="Packshot lightbox"` zbyt ogólny (przed K1 dotykało także PackshotsQX)
[src/layouts/qx/PackshotsQX.tsx:244](../../src/layouts/qx/PackshotsQX.tsx) — po implementacji K1 zastąpić `aria-labelledby` na licznik + tytuł produktu.

### U9. `OverviewQX` — `figcaption sr-only` jako jedyne źródło opisu
[src/layouts/qx/OverviewQX.tsx:65](../../src/layouts/qx/OverviewQX.tsx) — sr-only caption to ważny element dla AT, ale jeśli zawiera istotne info marketingowe, warto rozważyć widoczną wersję krótką + sr-only rozszerzoną.

---

## 🟩 DROBNE / AAA

### D1. Hero Previous/Next — duże ikony, ale `hidden` na mobile
[HeroQX.tsx:314–329](../../src/layouts/qx/HeroQX.tsx) — desktop OK; brak na mobile to świadoma decyzja UX (swipe). Dodać sr-only instrukcję dla AT mobile: „Swipe left/right or use slide indicators below".

### D2. `FinishesQX` preview-button — jedyny afford to `cursor-zoom-in`
[FinishesQX.tsx:246–250](../../src/layouts/qx/FinishesQX.tsx) — można dodać subtelny `outline` lub ikonę lupy w rogu na hover.

### D3. Brak meaningful `<title>` per katalog
[src/app/catalog/[catalogId]/page.tsx](../../src/app/catalog/%5BcatalogId%5D/page.tsx) — sprawdzić czy `generateMetadata` zwraca tytuł zawierający nazwę katalogu (QX/QS).

### D4. Thumbnails footer w `CatalogPageQX` — `alt=""` + `aria-hidden`
[CatalogPageQX.tsx:104–111](../../src/layouts/qx/CatalogPageQX.tsx) — redundantne, ale niegroźne. Można uprościć.

### D5. Custom scrollbar 6 px szerokości
[globals.css:389–399](../../src/app/globals.css) — wąski scrollbar utrudnia chwytanie myszą. Dla AAA rozważyć 12 px lub respektowanie systemowego (pominąć custom dla `prefers-reduced-data` itp.).

---

## ✅ Pozytywne praktyki (passed)

| # | Lokalizacja | Praktyka |
| --- | --- | --- |
| 1 | [src/app/layout.tsx:25](../../src/app/layout.tsx) | `<html lang="en">` poprawnie ustawione |
| 2 | [globals.css:367–379](../../src/app/globals.css) | Globalny `prefers-reduced-motion` redukuje wszystkie animacje do 0.01 ms |
| 3 | [globals.css:382–386](../../src/app/globals.css) | Globalny `:focus-visible` z 3 px outline + offset |
| 4 | [globals.css:352–360](../../src/app/globals.css) | Skip-link z prawidłowym wzorcem off-screen → on-focus |
| 5 | [CatalogPageQX.tsx:52](../../src/layouts/qx/CatalogPageQX.tsx) | Semantyczny `<main id="main-content">` |
| 6 | [HeroQX.tsx:338–356](../../src/layouts/qx/HeroQX.tsx) | Prawidłowy wzorzec `tablist` / `tab` / `aria-selected` |
| 7 | [FeaturesQX.tsx:70–115](../../src/layouts/qx/FeaturesQX.tsx) | Prawidłowy `tablist` + `tabpanel` + `aria-controls` |
| 8 | [MaterialsQX.tsx:152, PackshotsQX.tsx:137, GalleryQX.tsx:42](../../src/layouts/qx/) | Konsekwentny `aria-labelledby` na sekcjach |
| 9 | [PackshotsQX.tsx:285](../../src/layouts/qx/PackshotsQX.tsx) | Licznik z `aria-live="polite"` |
| 10 | [Lightbox.tsx:26–45](../../src/components/catalog/Lightbox.tsx) | Pełna obsługa klawiatury: Escape, ArrowLeft, ArrowRight |
| 11 | [Lightbox.tsx:24](../../src/components/catalog/Lightbox.tsx) | Auto-focus na przycisk Close po otwarciu |
| 12 | [HeroQX.tsx:140](../../src/layouts/qx/HeroQX.tsx) | `useReducedMotion()` przed `autoPlay` wideo |
| 13 | [FinishesQX.tsx:113–121](../../src/layouts/qx/FinishesQX.tsx) | Escape zamyka modal podglądu |
| 14 | [CatalogNav.tsx:248–251](../../src/components/catalog/CatalogNav.tsx) | Toggle menu z `aria-expanded` + `aria-label` |
| 15 | [ColorChip.tsx:51,65](../../src/components/catalog/ColorChip.tsx) | Dekoracyjne kopie obrazu z `alt=""` + `aria-hidden="true"` |
| 16 | [not-found.tsx:13](../../src/app/not-found.tsx) | CTA 404 z `min-h-[44px] min-w-[44px]` |

---

## Plan naprawczy

### Quick wins (< 1 h każda)
1. **U3** — usunąć `lang="en"` z `<main>` w `CatalogPageQX.tsx:52`.
2. **K3** — `aria-current="true"` → `aria-current="location"` w `CatalogNav.tsx` (3 miejsca).
3. **U2** — `<p class="section_ID">` → `<h2 class="section_ID">` w `page.tsx:38–40`.
4. **P1** — kształt aktywnego dota Hero (rozszerzony rounded-full).
5. **D5** — usunąć custom scrollbar lub podnieść do 12 px.

### Średni wysiłek (1–4 h każda)
6. **K2** — `role="radiogroup"` + `role="radio"` + `aria-checked` w `MaterialsOptionGroup`.
7. **K4** — wrapper `<button h-11 w-11>` w `ColorChip` + przesunięcie `tabIndex`/handlerów.
8. **P3, P5, P6** — utility hook `useFocusTrap(ref, open)` + globalny Escape w popoverach.
9. **P4** — przejrzeć tokeny obramowań selected/hover w `MaterialsOptionGroup`, dopasować ≥ 3:1.
10. **U5** — `slowTransition` z runtime check `prefers-reduced-motion`.
11. **P7** — usunąć fixed `w-[721px]` w `MaterialsQX` (`w-full max-w-[721px]`), zweryfikować Type2/Type3 w 320 px.

### Większy wysiłek (> 4 h)
12. **K1** — pełna implementacja focus-trap + scroll-lock + restore-focus w `Lightbox`. Rekomendowane: wydzielić komponent `<Modal>` na bazie Radix Dialog (już w deps) i wymienić `Lightbox` + modal preview w `FinishesQX` na jego instancje.
13. **K5** — decyzja produktowa o trybie wideo `FeaturesQX`: napisy + transcript albo świadoma deklaracja dekoracyjności w design-system.
14. **P2 / P8** — globalna rewizja palety `--muted-foreground`, `--on-dark-muted`, gradient pod tekstem hero. Może wymagać uzgodnienia z designem (potencjalnie wpływa na cały katalog).

---

## Testowanie

### Testy zautomatyzowane (do dodania do `vitest`)

```ts
// src/components/catalog/Lightbox.a11y.test.tsx
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';
import { Lightbox } from './Lightbox';

expect.extend(toHaveNoViolations);

test('Lightbox has no a11y violations when open', async () => {
  const { container } = render(
    <Lightbox images={[{src: '/x.webp', alt: 'desk'}]} index={0} onClose={() => {}} onNavigate={() => {}} />
  );
  expect(await axe(container)).toHaveNoViolations();
});
```

Dodać `jest-axe` do devDependencies (kompatybilne z vitest przez `expect.extend`).

### Manualna checklista (przed deklaracją WCAG AA)

- [ ] Tab przez całą stronę QX/QS — fokus widoczny zawsze, kolejność logiczna
- [ ] Otworzyć Lightbox z `PackshotsQX` → Tab nie wychodzi poza modal, Esc zamyka, fokus wraca do miniatury
- [ ] VoiceOver (macOS) na `MaterialsOptionGroup` — czy ogłasza „grupa, X z 6 zaznaczone"
- [ ] NVDA + Firefox — przejście Hero (tablist), Features (tabs), Lightbox
- [ ] Zoom 200% → reflow OK, brak poziomego scrolla
- [ ] DevTools → emulate `prefers-reduced-motion` → wideo nie autoplay, animacje zerowe
- [ ] DevTools → emulate `prefers-color-scheme: high-contrast` → stany aktywne nadal odróżnialne
- [ ] Lighthouse Accessibility ≥ 95 na `/`, `/catalog/QX`, `/catalog/QS`
- [ ] axe DevTools — 0 violations na trzech stronach

### Rekomendowane narzędzia
- `axe DevTools` (browser ext) — automatyczna analiza
- `WAVE` (wave.webaim.org) — sanity check w preview Vercel
- `@axe-core/react` w trybie dev — runtime warnings
- `Polypane` (paid) — wielowidokowy test reflow + a11y inspector

---

## Zgodność z `docs/zasady.md` — werdykt

| Zasada | Status | Komentarz |
| --- | --- | --- |
| 1. Równe i niedyskryminujące użytkowanie | ✅ | Jedna ścieżka, brak osobnej „wersji dostępnej" |
| 2. Elastyczność użytkowania | ⚠️ | Klawiatura: Lightbox ✅, ColorChip granica, focus-trap brak (K1, P5) |
| 3. Prosta i intuicyjna obsługa | ✅ | Spójna nawigacja sekcji |
| 4. Czytelna i wielokanałowa komunikacja | ⚠️ | Stan kolorem (P1), wideo `aria-hidden` (K5), kontrast graniczny (P2) |
| 5. Tolerancja na błędy | ✅ | N/A — brak formularzy w katalogu |
| 6. Niski wysiłek fizyczny i poznawczy | ⚠️ | ColorChip 24 px (K4) |
| 7. Odpowiedni rozmiar i przestrzeń | ⚠️ | Reflow do weryfikacji (P7) |
| 8. WCAG AA | ⚠️ | 5 krytycznych, 8 poważnych do poprawy |
| 9. Spójność i przewidywalność | ✅ | Wzorce sekcji konsekwentne |
| 10. Pełna dostępność treści produktowych | ⚠️ | Wideo funkcji bez alternatyw (K5) |

**Po wdrożeniu Quick wins + Średnich wysiłków** spodziewane przejście większości punktów ⚠️ → ✅. **K5 (wideo)** to decyzja produktowa, nie tylko techniczna.

---

_Wygenerowano: 2026-05-07 11:50 GMT+2 — UI Design Accessibility Audit_
_Referencja: WCAG 2.1 — https://www.w3.org/WAI/WCAG21/quickref/_
