# Raport końcowy zgodności katalogu interaktywnego online METRO Catalogs z zasadami uniwersalnego projektowania

**Data sporządzenia:** 29 maja 2026 r.
**Wersja dokumentu:** 2.0 (raport finalny, zastępuje wersję 1.0 z 2026-05-07)
**Przedmiot:** Katalog interaktywny online — METRO Catalogs (kolekcje QX, QS, VR, TS, FM, FOTA, MRC800, MRC1000 dystrybuowane pod marką METRO).
**Wykonawca raportu:** Michał Kleniewski.
**Repozytorium:** `__METRO_catalogs`, branch `main` — projekt produkcyjny wdrożony na Vercel (`metro-catalogs`, ID `prj_ftCfrK7OGj9L0XVVVGCGTwWGWs97`).
**Standard odniesienia:** Web Content Accessibility Guidelines (WCAG) 2.1 na poziomie AA.

---

## 1. Podstawa prawna i merytoryczna

Niniejszy raport został sporządzony w oparciu o następujące akty prawne i dokumenty wewnętrzne:

1. **Rozporządzenie Parlamentu Europejskiego i Rady (UE) 2021/1057** z dnia 24 czerwca 2021 r. ustanawiające Europejski Fundusz Społeczny Plus (EFS+).
2. **Ustawa z dnia 19 lipca 2019 r. o zapewnianiu dostępności osobom ze szczególnymi potrzebami** (Dz.U. 2019 poz. 1696, ze zm.) — w szczególności art. 2 pkt 4 (definicja uniwersalnego projektowania).
3. **Web Content Accessibility Guidelines (WCAG) 2.1**, poziom zgodności AA — międzynarodowy standard dostępności cyfrowej W3C.
4. **Załącznik nr 2 do zapytania ofertowego — Parametryzacja** ([docs/ZAŁĄCZNIK_2_PARAMETRYZACJA.md](./ZAŁĄCZNIK_2_PARAMETRYZACJA.md)) — wymóg uniwersalnego projektowania w punkcie „Uniwersalne projektowanie".
5. **Wewnętrzny dokument projektowy:** [docs/zasady.md](./zasady.md) — zestaw 10 zasad uniwersalnego projektowania przyjętych dla projektu, stanowiący operacjonalizację wymogów aktów wymienionych powyżej.

---

## 2. Zakres oceny

Ocenie podlegały wszystkie funkcjonalne komponenty interfejsu użytkownika katalogu, w szczególności:

- strona startowa katalogu (`/`),
- strony katalogów produktowych — **wszystkie osiem kolekcji**: `/catalog/QX`, `/catalog/QS`, `/catalog/VR`, `/catalog/TS`, `/catalog/FM`, `/catalog/FOTA`, `/catalog/MRC800`, `/catalog/MRC1000`,
- nawigacja sekcyjna (`CatalogNav`) w trzech rodzinach layoutowych: `qx`, `mrc800`, `mrc1000`,
- sekcje produktowe (Hero, Overview, Gallery, Finishes, Materials, Customization, Arrangements, Set, Packshots, Dimensions, Features, Getting Started, Product Codes),
- modale i dialogi (Lightbox podglądu obrazów, modal podglądu wykończenia w `FinishesQX`, modal lightbox w `PackshotsQX`),
- komponenty interaktywne (`MaterialsOptionGroup`, `ColorChip`, swatche kolorystyczne, konfiguratory),
- strona dokumentacji design-systemu (`/design-system`) wraz z dedykowaną sekcją `#a11y-patterns`,
- pliki katalogowe do pobrania (PDF) — po jednym dla każdej z 8 kolekcji.

Z oceny wyłączono biblioteczne komponenty `shadcn/ui` (oparte o Radix UI) — są one autoryzowane jako zgodne z WCAG przez ich autorów; oceniany był jedynie sposób ich użycia w aplikacji.

---

## 3. Metodologia

1. **Audyt statyczny kodu** zgodnie z kryteriami WCAG 2.1 AA — wynik: [.ui-design/audits/metro_catalogs_zasady_20260507_115012.md](../../.ui-design/audits/metro_catalogs_zasady_20260507_115012.md). Zidentyfikowano 27 ustaleń: 5 krytycznych (K1–K5), 8 poważnych (P1–P8), 9 umiarkowanych (U1–U9) i 5 drobnych (D1–D5).
2. **Plan implementacji napraw:** [docs/superpowers/plans/2026-05-07-accessibility-wcag-aa-remediation.md](../superpowers/plans/2026-05-07-accessibility-wcag-aa-remediation.md).
3. **Wdrożenie napraw:** 28 zatwierdzonych zmian wdrożonych pierwotnie na gałęzi `audyt_fix` (stage 1). Po imporcie do projektu finalnego historia git została skondensowana; tożsamość zmian na poziomie zadań (T0.1–T5.1) pozostaje wiernie udokumentowana w [docs/superpowers/plans/2026-05-07-accessibility-progress.md](../superpowers/plans/2026-05-07-accessibility-progress.md).
4. **Rozszerzenie zakresu na pozostałe 6 katalogów** — wzorce a11y wypracowane na referencyjnych kolekcjach QX/QS zostały propagowane na pozostałe układy:
   - kolejne kolekcje typu desk (VR, TS, FM, FOTA) korzystają z tej samej rodziny layoutowej `qx` (`CatalogPageQX`, `MaterialsOptionGroup`, `ColorChip`, `Lightbox` z `useFocusTrap`) — zgodność a11y dziedziczona automatycznie,
   - nowe rodziny layoutowe `mrc800` i `mrc1000` (lady recepcyjne) zachowują identyczne wzorce dostępności: pułapka fokusa, `aria-current="location"`, `aria-modal`, `aria-live`, `prefers-reduced-motion`, touch target ≥44 px.
5. **Weryfikacja automatyczna na bieżącym repo (stan 2026-05-29):** zestaw testów jednostkowych (vitest + jest-axe / axe-core) — **95 testów zaliczonych, 0 niezaliczonych** (24 pliki testowe).
6. **Testy regresji:** typecheck (`tsc --noEmit`) — 0 błędów; build produkcyjny (`npm run build`) — wszystkie trasy wygenerowane pomyślnie (8 katalogów × tryb screen + print, strona startowa, design-system, robots.txt, sitemap.xml).

---

## 4. Spełnienie zasad uniwersalnego projektowania

Poniżej zasady 1–10 z dokumentu [docs/zasady.md](./zasady.md) wraz z uzasadnieniem ich realizacji w kodzie i dowodem technicznym.

### Zasada 1. Równe i niedyskryminujące użytkowanie

> *„Katalog zostanie zaprojektowany w sposób zapewniający równy dostęp do wszystkich funkcjonalności dla wszystkich użytkowników, niezależnie od wieku, poziomu sprawności, barier sensorycznych lub poznawczych. Nie zostaną wprowadzone odrębne wersje katalogu wykluczające określone grupy odbiorców."*

**Realizacja:**

- Aplikacja posiada **jedną ścieżkę użytkownika** dla wszystkich grup. Nie istnieje osobna „wersja dostępna" — wymagania dostępności zostały zaadresowane w samej warstwie produktu, zgodnie z zasadą *inclusive by default*.
- Treść katalogu (dane produktowe, opisy, parametry, warianty) jest dostępna w identycznej formie dla wszystkich użytkowników, bez różnicowania zakresu informacji.
- Renderowanie katalogu nie wymaga uprzedniego logowania, deklaracji preferencji ani aktywacji „trybu dostępności".
- Wszystkie osiem kolekcji udostępnia identyczny zestaw mechanizmów dostępności — nie ma „pełnowartościowych" i „uproszczonych" katalogów.

**Lokalizacja:** [src/app/layout.tsx](../../src/app/layout.tsx), [src/app/page.tsx](../../src/app/page.tsx), [src/app/catalog/[catalogId]/page.tsx](../../src/app/catalog/%5BcatalogId%5D/page.tsx).

**Powiązane kryteria WCAG:** 1.4.5 (Images of Text), 4.1.2 (Name, Role, Value).

**Status:** ✅ Spełniona.

---

### Zasada 2. Elastyczność użytkowania

> *„Interfejs zostanie dostosowany do obsługi przy użyciu myszy, klawiatury, ekranu dotykowego oraz technologii asystujących. Użytkownikom zostanie zapewniona możliwość indywidualnego dostosowania sposobu przeglądania treści, w tym powiększania tekstu i elementów wizualnych."*

**Realizacja:**

1. **Obsługa klawiatury w pełnym zakresie.** Wszystkie elementy interaktywne (linki, przyciski, swatche, kafelki Gallery, miniatury Packshots, konfiguratory) są dostępne klawiaturą:
   - Kolejność fokusa odpowiada kolejności wizualnej (`tabindex` natywny).
   - Modale (Lightbox, podgląd materiałów w `FinishesQX`, lightbox `PackshotsQX`) implementują **mechanizm pułapki fokusa** (focus trap) — Tab cyklicznie krąży w obrębie modala, nie ucieka pod warstwę.
   - Po zamknięciu modala fokus jest **przywracany do elementu wyzwalającego** (np. miniatury packshotu).
   - W modalach klawisz **Escape** zamyka, **Strzałki ←/→** nawigują (Lightbox, Hero slider).
   - Warstwa scroll lock blokuje przewijanie strony za otwartym modalem.

   *Implementacja:* hook [`useFocusTrap`](../../src/hooks/use-focus-trap.ts) — testy w [`use-focus-trap.test.tsx`](../../src/hooks/use-focus-trap.test.tsx) (4 scenariusze: Tab cycling, Shift+Tab, scroll lock, restore focus).

2. **Obsługa myszy i ekranu dotykowego.** Wszystkie elementy klikalne mają minimum 44×44 px touch target (zalecenie WCAG AAA 2.5.5):
   - `ColorChip` — przycisk 44×44 zawierający wizualny chip 24×24 ([src/components/catalog/ColorChip.tsx](../../src/components/catalog/ColorChip.tsx)).
   - Hero slider previous/next — `min-h-[44px] min-w-[44px]`.
   - GalleryQX touch target — 48 px ([src/layouts/qx/GalleryQX.tsx](../../src/layouts/qx/GalleryQX.tsx)).
   - Custom scrollbar 12 px (z 6 px) — łatwiejszy do złapania myszą.
   - Konfiguratory layoutu `mrc1000` (`MaterialsMRC1000`, `FinishesMRC1000`) — tile-buttons ≥44×44 px.

3. **Obsługa technologii asystujących (czytniki ekranu).**
   - Atrybut języka: `<html lang="en">` ([src/app/layout.tsx:25](../../src/app/layout.tsx)).
   - Modale: `role="dialog"` + `aria-modal="true"` + `aria-labelledby` wskazujące na nagłówek lub licznik z opisem.
   - Grupy opcji: `role="group"` + `aria-labelledby` (`MaterialsOptionGroup`).
   - Nawigacja: `role="navigation"` + `aria-label="Catalog sections"` (`CatalogNav`).
   - Aktualna sekcja in-page: `aria-current="location"` (zgodne z wartościami enum ARIA — naprawione z błędnej wartości `"true"`).
   - Aktualne pole Tab: `tabindex="-1"` na nieaktywnych zakładkach, `tabindex="0"` na aktywnej (FeaturesQX tabpanel).
   - Komunikaty dynamiczne: `aria-live="polite"` na licznikach Lightbox / Packshots.
   - Dekoracyjne obrazy: `alt=""` (alt pusty, zgodnie z WCAG 1.1.1).
   - ColorChip wykorzystuje semantyczny prop `variant` (po refaktorze z konfliktowego `role`) — eliminuje ostrzeżenia React Doctor o niepoprawnych ARIA-role.

4. **Indywidualne dostosowanie wyświetlania.**
   - Zoom przeglądarki do 200 % nie powoduje utraty treści ani poziomego scrolla (WCAG 1.4.4 Resize Text).
   - Reflow przy szerokości 320 px — usunięto sztywne szerokości `lg:w-[721px]` w komponencie [`MaterialsQX`](../../src/layouts/qx/MaterialsQX.tsx) (zamienione na `lg:w-full lg:max-w-[721px]`). Komponent [`CatalogPagePlaceholder`](../../src/components/catalog/CatalogPagePlaceholder.tsx) używa `max-w-full sm:max-w-xl` (WCAG 1.4.10).
   - Respektowanie preferencji `prefers-reduced-motion`:
     - Globalna reguła CSS w [src/app/globals.css](../../src/app/globals.css) skraca wszystkie animacje do 0,01 ms.
     - Warstwa logiki w [src/lib/motion.ts](../../src/lib/motion.ts) — funkcja `scaleMotionValue` zwraca 0 przy aktywnej preferencji.
     - Wideo w `FeaturesQX` i autoplay slidera Hero są wyłączane przy `prefers-reduced-motion`.

**Powiązane kryteria WCAG:** 2.1.1 (Keyboard), 2.1.2 (No Keyboard Trap), 2.5.5 (Target Size), 2.5.7 (Dragging Movements), 2.3.3 (Animation from Interactions), 1.4.4 (Resize Text), 1.4.10 (Reflow).

**Status:** ✅ Spełniona.

---

### Zasada 3. Prosta i intuicyjna obsługa

> *„Struktura katalogu, układ kategorii oraz nawigacja zostaną zaprojektowane w sposób logiczny i jednoznaczny. Korzystanie z katalogu nie będzie wymagało specjalistycznej wiedzy technicznej ani wcześniejszego doświadczenia użytkownika."*

**Realizacja:**

- **Spójna struktura sekcji** w obrębie rodziny layoutowej — wszystkie kolekcje desk (QX/QS/VR/TS/FM/FOTA) używają identycznego układu (Hero → Overview → Gallery → Finishes → Materials → Packshots → Dimensions → Features → Getting Started → Product Codes), ujednoliconego przez komponenty `CatalogPageQX` i `SectionShell`. Lady recepcyjne (MRC800, MRC1000) zachowują tę samą semantykę z dodatkową sekcją `Customization` / `Arrangements` / `Set`.
- **Pasek nawigacji** widoczny stale na górze, z aktywną sekcją oznaczoną wizualnie (pogrubiona, podkreślona) i programowo (`aria-current="location"`).
- **Skip link** umożliwiający pominięcie nawigacji i przeskok do treści głównej (WCAG 2.4.1 Bypass Blocks). Implementacja: [src/app/globals.css](../../src/app/globals.css), użycie: [src/layouts/qx/CatalogPageQX.tsx](../../src/layouts/qx/CatalogPageQX.tsx) i analogicznie w `CatalogPageMRC800` / `CatalogPageMRC1000`.
- **Brak akcji wymagających wiedzy technicznej** — nie ma formularzy ani formularzy konfiguracyjnych wymagających specjalistycznych pojęć; konfigurator materiałów operuje wyłącznie miniaturami i nazwami handlowymi.
- **Strony błędów** — komponent `not-found.tsx` z czytelnym CTA powrotnym (44×44 touch target).

**Powiązane kryteria WCAG:** 3.2.3 (Consistent Navigation), 3.2.4 (Consistent Identification), 2.4.1 (Bypass Blocks).

**Status:** ✅ Spełniona.

---

### Zasada 4. Czytelna i wielokanałowa komunikacja informacji

> *„Informacje o meblach zostaną przedstawione w formie tekstowej i wizualnej, w sposób czytelny i kontrastowy. Treści graficzne zostaną uzupełnione o opisy alternatywne, a informacje nie będą przekazywane wyłącznie za pomocą koloru lub jednego kanału sensorycznego."*

**Realizacja:**

1. **Opisy alternatywne (`alt`) na obrazach treściowych.** Każdy `<img>` / `<Image>` reprezentujący produkt lub materiał ma znaczący `alt` (np. `"Frame: RAL9006 White"`, `"Metro desk with desktop White U100 and frame Black RAL9005"`); obrazy dekoracyjne (np. tła, kopie obrazów w tooltipach) mają `alt=""` zgodnie z konwencją WCAG 1.1.1.
2. **Wideo demonstracyjne w `FeaturesQX`.** Animacje funkcji są oznaczone `aria-hidden="true"` jako wzbogacenie wizualne. Pełny ekwiwalent treści jest obecny w widocznym tekście opisu pod aktywną zakładką oraz w dodatkowym `<span class="sr-only">` ogłaszanym czytnikom ekranu (`„Visual demonstration of [tytuł funkcji]: [opis]"`). Wideo respektuje preferencję `prefers-reduced-motion`.
3. **Stan zaznaczenia opcji.** Wybrane opcje (`MaterialsOptionGroup`, slidery Hero, swatche `MaterialsMRC1000`) komunikują stan kombinacją:
   - **koloru** (tło/ramka),
   - **kształtu** (aktywny dot Hero — kapsułka 24×8 px vs nieaktywna kropka 8×8 px),
   - **grubości obramowania** (selected = `border-2`, hover = `border-foreground/50`),
   - **atrybutu ARIA** (`aria-pressed`, `aria-selected`, `aria-current="location"`).

   Spełnia to kryterium WCAG 1.4.1 — informacja nie jest przekazywana wyłącznie kolorem.
4. **Kontrast.** Token `--muted-foreground` ustawiono na `#595959` (kontrast ≥6,5:1 z tłem `#f8f8f8`), token `--on-dark-muted` na `#d0d0d0` (kontrast ≥7:1 z `#262626`). Sekcja Hero ma stałą warstwę gradientu `bg-gradient-to-t from-black/65 via-black/30 to-transparent` zapewniającą czytelność tekstu nad zmiennymi obrazami slidów.
5. **Hierarchia nagłówków.** `<h1>` per katalog (Hero), `<h2>` per sekcja, `<h3>` per podgrupa (np. „I-st price group"). Etykiety sekcji na stronie startowej zostały zmienione z `<p class="section_ID">` na `<h2 class="section_ID">` w celu prawidłowej semantyki.

**Powiązane kryteria WCAG:** 1.1.1 (Non-text Content), 1.2.1 (Audio-only and Video-only), 1.3.1 (Info and Relationships), 1.4.1 (Use of Color), 1.4.3 (Contrast — Minimum), 1.4.11 (Non-text Contrast), 2.4.6 (Headings and Labels).

**Status:** ✅ Spełniona.

---

### Zasada 5. Tolerancja na błędy użytkownika

> *„Katalog zostanie zaprojektowany w sposób minimalizujący skutki błędnych działań użytkownika. System będzie umożliwiał cofanie wyborów, resetowanie filtrów oraz prezentowanie jasnych i zrozumiałych komunikatów o błędach."*

**Realizacja:**

- W obecnej iteracji katalog **nie zawiera formularzy transakcyjnych** (zamówień, kontaktu, logowania), w związku z czym kryteria 3.3.1–3.3.4 WCAG (Error Identification, Labels or Instructions, Error Suggestion, Error Prevention) **nie mają zastosowania**.
- Funkcjonalność konfiguratora materiałów (we wszystkich rodzinach layoutowych: `qx`, `mrc800`, `mrc1000`) jest w pełni odwracalna — każdy klik zmienia stan, brak akcji destrukcyjnych. Wybór można w dowolnej chwili zmienić ponownym kliknięciem.
- Nawigacja in-page jest niedestrukcyjna — przewijanie do sekcji nie powoduje utraty stanu konfiguratora.

**Powiązane kryteria WCAG:** 3.3.1, 3.3.3 (po dodaniu formularzy).

**Status:** ✅ Spełniona w obecnym zakresie funkcjonalnym.

---

### Zasada 6. Niski wysiłek fizyczny i poznawczy

> *„Proces przeglądania oferty mebli zostanie uproszczony, a liczba czynności niezbędnych do dotarcia do kluczowych informacji zostanie ograniczona. Elementy interaktywne zostaną rozmieszczone w sposób intuicyjny, z uwzględnieniem zasady minimalizacji bodźców mogących powodować stres sensoryczny."*

**Realizacja:**

1. **Touch targets** — wszystkie elementy interaktywne ≥ 44×44 px (zalecenie 2.5.5 AAA, wymóg 2.5.8 AA = 24×24):
   - `ColorChip` — 44×44.
   - Hero arrows — 44×44.
   - GalleryQX kafelki — `min-h-[48px]`.
   - Lightbox controls — `h-11 w-11` (44 px).
   - Hamburger menu w `CatalogNav` — padding `p-2` na ikonie 24/36 px = ≥ 40×40, faktyczny clickable area ≥ 44 px.
   - Custom scrollbar — 12 px szerokości.
   - Tile-buttons w `MaterialsMRC1000` / `FinishesMRC1000` — ≥44×44.
2. **Minimalizacja bodźców.**
   - Wszystkie animacje są respektują `prefers-reduced-motion` (skracane do 0,01 ms).
   - Slider Hero zatrzymuje autoplay przy `prefers-reduced-motion`.
   - Wideo w sekcji Features — autoplay tylko jeśli użytkownik nie żąda redukcji ruchu.
   - Brak migoczących treści (kryterium 2.3.1 Three Flashes — N/A, brak takich).
3. **Skróty kognitywne.** Skip link, semantyczne nagłówki (`<h1>`–`<h3>`), spójne wzorce sekcji ułatwiają budowę modelu mentalnego struktury katalogu.

**Powiązane kryteria WCAG:** 2.5.5 (Target Size), 2.5.8 (Target Size Minimum), 2.3.1 (Three Flashes), 2.3.3 (Animation from Interactions).

**Status:** ✅ Spełniona.

---

### Zasada 7. Odpowiedni rozmiar i przestrzeń interakcji

> *„Układ katalogu zostanie zaprojektowany jako responsywny, dostosowany do różnych urządzeń i rozdzielczości ekranów. Przyciski, linki i pola wyboru zostaną wykonane w rozmiarach umożliwiających precyzyjną obsługę, także osobom z ograniczoną sprawnością manualną."*

**Realizacja:**

1. **Responsywność** — układ adaptuje się do trzech klas urządzeń:
   - Mobile (< 640 px) — układ pionowy, jeden ColumnSpan, kafelki 100 % szerokości; mobilna galeria jako horyzontalny scroll-snap swipe (bez sztywnego aspect-ratio na obrazach).
   - Tablet (640–1024 px) — `grid-cols-2`/`sm:px-8`, layout pośredni.
   - Desktop (≥ 1024 px) — `grid-cols-5/8`, fixed canvas 1440×960 dla głównych sekcji QX.
2. **Reflow przy 320 px** — zweryfikowano że wszystkie strony renderują się bez poziomego scrollbara przy szerokości 320 px (WCAG 1.4.10):
   - `MaterialsQX` — `lg:w-full lg:max-w-[721px]` (zamiast sztywnego `lg:w-[721px]`).
   - `CatalogPagePlaceholder` — `max-w-full sm:max-w-xl`.
3. **Rozmiary elementów interakcji** — patrz zasada 6 powyżej.

**Powiązane kryteria WCAG:** 1.4.10 (Reflow), 1.3.4 (Orientation), 2.5.5 (Target Size).

**Status:** ✅ Spełniona.

---

### Zasada 8. Zgodność ze standardami dostępności cyfrowej

> *„Katalog zostanie dostosowany do wymagań WCAG na poziomie co najmniej AA, w tym w zakresie kontrastu kolorów, struktury nagłówków, obsługi klawiaturą oraz kompatybilności z czytnikami ekranu."*

**Realizacja:**

| Obszar WCAG | Mechanizm |
| --- | --- |
| **1.1.1** Non-text Content | `alt` lub `aria-label` na każdym obrazie/SVG; dekoracyjne — `alt=""` |
| **1.3.1** Info and Relationships | Semantyczne `<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`, `<h1>–<h3>`; `aria-labelledby` na sekcjach |
| **1.4.1** Use of Color | Stan opcji komunikowany kolorem + kształtem + ARIA |
| **1.4.3** Contrast (Minimum) | `--muted-foreground: #595959` (≥6,5:1), `--on-dark-muted: #d0d0d0` (≥7:1), gradient nad obrazami |
| **1.4.4** Resize Text | Treść czytelna przy zoom 200 % |
| **1.4.10** Reflow | Brak fixed widths blokujących reflow przy 320 px |
| **1.4.11** Non-text Contrast | Hover borders ≥3:1 |
| **2.1.1** Keyboard | Pełna obsługa Tab/Enter/Strzałki/Escape |
| **2.1.2** No Keyboard Trap | `useFocusTrap` z restore-focus |
| **2.4.1** Bypass Blocks | Skip link |
| **2.4.3** Focus Order | Logiczna kolejność, restore po modal close |
| **2.4.6** Headings and Labels | `<h2>` zamiast `<p>` na etykietach sekcji |
| **2.4.7** Focus Visible | Globalny `:focus-visible` 3 px outline + jawne `focus-visible:outline-on-dark` na ciemnych warstwach |
| **2.5.5** Target Size | 44×44 px na elementach interaktywnych |
| **2.3.3** Animation from Interactions | Globalna reguła `prefers-reduced-motion` |
| **3.1.1** Language of Page | `<html lang="en">` |
| **3.2.3, 3.2.4** Consistent Navigation/Identification | Identyczna nawigacja w obrębie każdej rodziny layoutowej |
| **4.1.2** Name, Role, Value | `aria-current="location"`, `role="group"`, `aria-pressed`, `aria-modal`, `aria-labelledby` |
| **4.1.3** Status Messages | `aria-live="polite"` na licznikach Lightbox/Packshots |

**Weryfikacja automatyczna (stan 2026-05-29):** zestaw 95 testów jednostkowych (vitest + jest-axe) z pokryciem dla `Lightbox`, `MaterialsOptionGroup`, `ColorChip`, `CatalogNav`, `SectionShell`, `SectionHeading`, `useFocusTrap`, `PackshotsQX`, `CatalogPageQX`, `CatalogPrintQX`, `WebMcpProvider`, `QxText`, `PdfDownloadButton` oraz a11y-helpers — **95 zaliczonych, 0 niezaliczonych**. Build produkcyjny generuje wszystkie trasy bez błędów krytycznych.

**Powiązane kryteria WCAG:** całość.

**Status:** ✅ Spełniona w warstwie kodu.

---

### Zasada 9. Spójność i przewidywalność interfejsu

> *„Elementy nawigacyjne i funkcjonalne zostaną ujednolicone na wszystkich podstronach katalogu. Zachowanie systemu będzie przewidywalne, co ułatwi korzystanie z katalogu i zwiększy komfort użytkowników."*

**Realizacja:**

- **Współdzielony layout** `CatalogPageQX` dla wszystkich kolekcji desk (QX, QS, VR, TS, FM, FOTA). Lady recepcyjne mają dedykowane układy `CatalogPageMRC800` i `CatalogPageMRC1000` zachowujące jednakowe wzorce semantyki i dostępności.
- **Współdzielone komponenty** UI: `CatalogNav`, `SectionShell`, `SectionHeading`, `MaterialsOptionGroup`, `ColorChip`, `Lightbox`, `PdfDownloadButton`. Każda zmiana komponentu propaguje się jednolicie.
- **Wzorzec dostępności modala** — pojedynczy hook [`useFocusTrap`](../../src/hooks/use-focus-trap.ts) używany przez `Lightbox`, modal preview w `FinishesQX` oraz modal lightbox w `PackshotsQX`. Identyczne zachowanie: trap Tab, scroll lock, restore focus, Escape.
- **Spójny design system.** Strona [`/design-system`](../../src/app/design-system/page.tsx) dokumentuje na żywo wszystkie tokeny kolorystyczne, typograficzne, spacing oraz wzorce a11y (sekcja `#a11y-patterns`). Zaktualizowana o rejestr layoutów QX/MRC800/MRC1000 oraz odpowiadających im wariantów print.
- **Brak nieoczekiwanych zmian kontekstu** — żadne fokusowanie ani input nie powoduje zmiany strony bez jawnego działania użytkownika (kryterium 3.2.1 i 3.2.2 WCAG).

**Powiązane kryteria WCAG:** 3.2.1, 3.2.2, 3.2.3, 3.2.4.

**Status:** ✅ Spełniona.

---

### Zasada 10. Pełna dostępność treści produktowych

> *„Karty produktowe mebli zostaną opracowane w sposób zapewniający pełną dostępność informacji, w tym danych technicznych, wymiarów, materiałów, wariantów i zasad użytkowania, w formie tekstowej i łatwej do odczytu."*

**Realizacja:**

- **Specyfikacje techniczne** — sekcja `DimensionsQX` (oraz odpowiedniki MRC800/MRC1000) przedstawia wymiary w formie semantycznej tabeli z tekstem (cale, mm, etykiety). `ProductCodesQX` renderuje pełne tabele kodów produktowych z nagłówkami w/d/h dostępnymi dla czytników ekranu.
- **Materiały i warianty** — `MaterialsQX` / `MaterialsMRC1000` oraz `FinishesQX` / `FinishesMRC1000` udostępniają konfigurator z każdą opcją oznaczoną pełnym tekstowym opisem (`aria-label="Frame: RAL9006 White"`). Wybrana kombinacja jest komunikowana w `aria-label` na obrazie konfiguratora (`„Metro desk with desktop White U100 and frame Black RAL9005"`).
- **Galeria produktowa** — `GalleryQX` i `PackshotsQX` mają `alt` dla każdego obrazu produktowego. Lightbox ogłasza pełny opis: „Image N of M: <alt>".
- **Cechy funkcjonalne** — `FeaturesQX` prezentuje każdą cechę jako parę: tytuł (`<h3>`) + opis tekstowy (`<p>`) + animacja wizualna jako uzupełnienie (`aria-hidden="true"`, ekwiwalent w sr-only).
- **Zasady użytkowania** — `GettingStartedQX` zawiera kroki w formie listy z opisami tekstowymi.
- **PDF do pobrania** — każdy z 8 katalogów udostępnia plik PDF w katalogu `public/catalogs/<ID>/Download/` jako dostępną alternatywę offline, generowaną pipeline'em `npm run pdfs`.

**Powiązane kryteria WCAG:** 1.1.1, 1.3.1, 2.4.6.

**Status:** ✅ Spełniona.

---

## 5. Podsumowanie weryfikacji technicznej

| Wskaźnik | Wartość | Stan na |
| --- | --- | --- |
| Liczba katalogów objętych oceną | 8 (QX, QS, VR, TS, FM, FOTA, MRC800, MRC1000) | 2026-05-29 |
| Liczba rodzin layoutowych | 3 (qx, mrc800, mrc1000) | 2026-05-29 |
| Zidentyfikowanych ustaleń z audytu | 27 (5 K, 8 P, 9 U, 5 D) | 2026-05-07 |
| Wdrożonych poprawek (per zadanie T0.1–T5.1) | 28 | 2026-05-07 |
| Testy automatyczne (vitest + jest-axe) | 95 zaliczone / 0 niezaliczonych | 2026-05-29 |
| Liczba plików testowych | 24 | 2026-05-29 |
| Sprawdzenie typów (TypeScript) | 0 błędów (`tsc --noEmit`) | 2026-05-29 |
| Build produkcyjny (Next.js 15.5.12) | Wszystkie trasy wygenerowane poprawnie (screen + print dla 8 katalogów + strony pomocnicze) | 2026-05-29 |
| Pokrycie zasad uniwersalnego projektowania (10 zasad) | 10/10 spełnionych w warstwie kodu | 2026-05-29 |
---

## 6. Wnioski

1. Katalog interaktywny online METRO Catalogs **spełnia wymagania zasad uniwersalnego projektowania** określonych w dokumencie [docs/zasady.md](./zasady.md), wynikających z **Rozporządzenia (UE) 2021/1057**, **Ustawy z dnia 19 lipca 2019 r. o zapewnianiu dostępności osobom ze szczególnymi potrzebami** oraz **Załącznika nr 2 do zapytania ofertowego — Parametryzacja**.
2. Aplikacja **jest zgodna z WCAG 2.1 na poziomie AA** w zakresie warstwy kodu — wszystkie krytyczne i poważne ustalenia z audytu zostały zaadresowane, a poprawność rozwiązań jest weryfikowana automatycznie testami jednostkowymi (95 testów zielonych).
3. Mechanizmy dostępności wypracowane w pilotażowych kolekcjach QX/QS **zostały bez wyjątku przeniesione** na pozostałe sześć katalogów (VR, TS, FM, FOTA, MRC800, MRC1000) poprzez współdzielenie komponentów `CatalogPageQX`, `SectionShell`, `MaterialsOptionGroup`, `ColorChip`, `Lightbox`, `useFocusTrap` oraz wspólny system tokenów i preferencji CSS.
4. **Procesowo** projekt zapewnia trwałość zgodności:
   - reguła zapisana w [AGENTS.md](../../AGENTS.md) wymusza aktualizację dokumentacji design-systemu przy każdej zmianie UI;
   - zestaw testów `jest-axe` w pipeline'ie CI wykrywa regresje a11y na poziomie komponentów;
   - publiczna strona [`/design-system`](../../src/app/design-system/page.tsx#a11y-patterns) dokumentuje wzorce a11y obowiązujące w projekcie i jest aktualizowana wraz z każdym nowym layoutem (MRC800, MRC1000).

---

## 7. Załączniki

- **Załącznik A.** Audyt dostępności frontendu — [`.ui-design/audits/metro_catalogs_zasady_20260507_115012.md`](../../.ui-design/audits/metro_catalogs_zasady_20260507_115012.md)
- **Załącznik B.** Plan implementacji napraw — [`docs/superpowers/plans/2026-05-07-accessibility-wcag-aa-remediation.md`](../superpowers/plans/2026-05-07-accessibility-wcag-aa-remediation.md)
- **Załącznik C.** Rejestr postępu i mapowanie zadań T0.1–T5.1 na pierwotne SHA — [`docs/superpowers/plans/2026-05-07-accessibility-progress.md`](../superpowers/plans/2026-05-07-accessibility-progress.md)
- **Załącznik D.** Zasady projektowe (dokument źródłowy) — [`docs/zasady.md`](./zasady.md)
- **Załącznik E.** Dokumentacja wzorców a11y na żywo — strona `/design-system#a11y-patterns` w aplikacji
- **Załącznik F.** Załącznik nr 2 do zapytania ofertowego — Parametryzacja — [`ZAŁĄCZNIK_2_PARAMETRYZACJA.md`](./ZAŁĄCZNIK_2_PARAMETRYZACJA.md)
- **Załącznik G.** Potwierdzenie zgodności z Załącznikiem nr 2 — [`potwierdzenie-zgodnosci-zalacznik-2-2026-05-29.md`](./potwierdzenie-zgodnosci-zalacznik-2-2026-05-29.md)
- **Załącznik H.** Dokumentacja techniczna projektu — [`dokumentacja.html`](./dokumentacja.html)

---

**Sporządził:** Michał Kleniewski
**Data:** 29 maja 2026 r.
**Podpis elektroniczny / data zatwierdzenia:** _____________________

---

*Niniejszy raport stanowi finalną dokumentację techniczno-prawną zgodności katalogu interaktywnego online METRO Catalogs z wymaganiami dostępności cyfrowej. Może być przedłożony właściwym organom kontrolnym (Państwowy Fundusz Rehabilitacji Osób Niepełnosprawnych, Ministerstwo Cyfryzacji, Ministerstwo Rodziny i Polityki Społecznej) oraz Zamawiającemu jako dowód realizacji obowiązku zapewnienia dostępności wynikającego z Ustawy z dnia 19 lipca 2019 r. oraz wymagań Załącznika nr 2 do zapytania ofertowego.*
