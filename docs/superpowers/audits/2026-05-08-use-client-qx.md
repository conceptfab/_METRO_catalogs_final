# Audyt `'use client'` w QX layoutach

**Data:** 2026-05-08
**Cel:** zidentyfikować, które sekcje QX dałyby się przerobić na Server Components + thin ClientMotionWrapper, oraz zarejestrować obecne zależności od client-side runtime.

---

## Streszczenie

Wszystkie 10 sekcji QX nosi dyrektywę `'use client'`. Z przeprowadzonego audytu wynika, że **4 sekcje to MUST CLIENT** (głęboka interaktywność: suwak, konfigurator, lightbox, wideo), **4 to SPLIT** (~80–95% statycznego markupu, klient potrzebny wyłącznie do `useRef`+`useInView` dla reveal-on-scroll), **1 to SPLIT z zastrzeżeniem** (ProductCodesQX — klient potrzebny do `useIsMobile` jako propsy sterujące HTML, ale można go wyizolować), a **1 sekcja (DimensionsQX) jest de facto gotowa do serwera** — używa tylko `useRef`+`useInView` i nie ma żadnej innej logiki klienckiej. Refactor sekcji SPLIT/CAN BE SERVER jest wykonalny i może istotnie obniżyć wolumen hydracji.

---

## Tabela klasyfikacji

| Sekcja | useState | useEffect | useRef | framer-motion | Event handlers | Custom hooks | **Werdykt** |
|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| HeroQX | ✓ | ✓ | — | ✓ | ✓ | `useReducedMotion`, `useCallback` | MUST CLIENT |
| OverviewQX | ✗ | ✗ | ✓ | ✓ | ✗ | — | SPLIT |
| MaterialsQX | ✓ | ✓ | ✓ | ✓ | ✗ | `useMemo` | MUST CLIENT |
| FeaturesQX | ✓ | ✓ | ✓ | ✓ | ✓ | `useReducedMotion` | MUST CLIENT |
| GalleryQX | ✓ | ✗ | ✓ | ✓ | ✓ | — | MUST CLIENT |
| FinishesQX | ✓ | ✓ | ✓ | ✓ | ✓ | `useFocusTrap`, `useMemo` | MUST CLIENT |
| GettingStartedQX | ✗ | ✗ | ✓ | ✓ | ✗ | — | SPLIT |
| ProductCodesQX | ✗ | ✗ | ✓ | ✓ | ✗ | `useIsMobile` | SPLIT* |
| DimensionsQX | ✗ | ✗ | ✓ | ✓ | ✗ | — | CAN BE SERVER |
| PackshotsQX | ✓ | ✓ | ✓ | ✓ | ✓ | `useFocusTrap`, `useIsMobile`, `useId` | MUST CLIENT |

*ProductCodesQX: `useIsMobile` wpływa na prop `open` komponentu `<details>` — da się to wyizolować do osobnego wrappera.

---

## Per-section analysis

### HeroQX

**Pliki:** `src/layouts/qx/HeroQX.tsx` (16 315 B)

**Dlaczego client:**
- `useState`: `currentIndex` (aktywny slajd) + `isHovered` (pauza auto-advance)
- `useEffect` x2: timer auto-advance (`setInterval`) + nasłuch `keydown` na `window`
- `useCallback`: `goTo`, `goPrev`, `goNext`
- `useReducedMotion`: steruje prędkością i animacjami
- `AnimatePresence` + `motion.*`: przejścia slajdów, strzałki, dots, blok tekstowy, CTA
- Event handlers: `onMouseEnter/Leave` na `<section>`, `onClick` na strzałkach, dots, CTA button
- Browser API: `window.addEventListener`, `document.getElementById().scrollIntoView()`

**Werdykt:** MUST CLIENT

**Uwagi:** Komponent jest w całości interaktywny — slider wymaga stanu, timera, klawiatury i scroll API. Nie ma sensu dzielić na warstwy. Jedyna potencjalna optymalizacja to wydzielenie statycznej warstwy gradientu tła jako osobnego SC, ale zysk byłby pomijalny wobec złożoności komponentu.

---

### OverviewQX

**Pliki:** `src/layouts/qx/OverviewQX.tsx` (2 849 B)

**Dlaczego client:**
- `useRef` + `useInView`: detekcja widoczności sekcji w viewporcie
- `motion.div` x2: reveal header + reveal image na podstawie `isInView`
- Brak `useState`, `useEffect`, event handlerów, custom hooków

**Werdykt:** SPLIT (~90% statyczne)

**Szkic podziału:**
1. `OverviewQX` staje się Server Component — renderuje `<SectionShell>`, `<SectionHeading>`, tekst paragrafów, `<figure>/<img>` statycznie.
2. Dwa bloki `motion.div` owijamy w `<MotionReveal preset="slide">` — generyczny client wrapper przyjmujący `children` + preset animacji.
3. `MotionReveal` zawiera `useRef` + `useInView` + `motion.div` i jest jedynym klientem.

---

### MaterialsQX

**Pliki:** `src/layouts/qx/MaterialsQX.tsx` (11 838 B)

**Dlaczego client:**
- `useState` x2: `selectedFrameId`, `selectedDesktopId` — sterują widocznym obrazem konfiguratora
- `useEffect` x2: synchronizacja wybranych opcji przy zmianie dostępnych opcji
- `useMemo` x5: sortowanie i deduplikacja opcji materiałowych (obliczeniowo kosztowne przy dużych zbiorach)
- `useInView` + `useRef`: reveal-on-scroll
- `AnimatePresence` + `motion.img`: crossfade między warstwami konfiguratora (ramka + blat)
- Konfigurator przyjmuje `onSelect` z `MaterialsOptionGroup` (client child)

**Werdykt:** MUST CLIENT

**Uwagi:** Interaktywny konfigurator materiałów jest rdzeniem sekcji. `selectedFrameId` + `selectedDesktopId` steruje dynamicznym złożonym obrazem z dwóch warstw. Wydzielenie reveal-motion do osobnego wrappera byłoby możliwe technicznie, ale zysk jest marginalny — konfigurator i tak wymaga hydracji całości.

---

### FeaturesQX

**Pliki:** `src/layouts/qx/FeaturesQX.tsx` (6 759 B)

**Dlaczego client:**
- `useState`: `activeIndex` — wybrany tab funkcjonalności
- `useEffect`: `IntersectionObserver` do autoplay/pauzy wideo przy wejściu/wyjściu z viewportu
- `useRef` x3: `ref` (reveal), `mobileVideoRef`, `desktopVideoRef`
- `useReducedMotion`: wyłącza autoplay wideo przy prefers-reduced-motion
- `useInView`: reveal-on-scroll
- `AnimatePresence` + `motion.*`: reveal header/content, crossfade opisu aktywnego taba
- `onClick` na każdym przycisku taba

**Werdykt:** MUST CLIENT

**Uwagi:** Tab panel z aktywnym indeksem + `IntersectionObserver` do kontroli wideo czynią komponent głęboko interaktywnym. Zarówno panel opisu jak i wideo wymagają reaktywnego stanu.

---

### GalleryQX

**Pliki:** `src/layouts/qx/GalleryQX.tsx` (4 891 B)

**Dlaczego client:**
- `useState`: `lightboxIndex` — otwarty indeks lightboksa (null = zamknięty)
- `useRef` + `useInView`: reveal-on-scroll
- `motion.button` x4: reveal-on-scroll dla głównego obrazu i thumbnailów
- `onClick` na każdym przycisku-obrazie: otwiera lightbox (desktop-only)
- Browser API: `window.matchMedia('(max-width: 1023px)')` — guard mobilny w `openLightbox`
- `<Lightbox>` client component: przyjmuje `index`, `onClose`, `onNavigate`

**Werdykt:** MUST CLIENT

**Uwagi:** Lightbox wymaga `useState` i dostępu do `window`. Alternatywna ścieżka: siatka obrazów może być Server Component, a lightbox — osobnym wyizolowanym client componentem. Jednak `motion.button` (reveal) i `onClick` są na każdym kafelku, więc podział wymagałby przeprojektowania layoutu siatki.

---

### FinishesQX

**Pliki:** `src/layouts/qx/FinishesQX.tsx` (12 397 B)

**Dlaczego client:**
- `useState` x4: `isPreviewOpen`, `selectedFrameId`, `selectedDesktopId`, `selectedPreviewId`
- `useEffect` x4: synchronizacja opcji + Escape handler na `window`
- `useRef` x2: `ref` (reveal), `previewDialogRef` (focus trap)
- `useMemo` x4: sortowanie opcji
- `useFocusTrap`: hook zarządzający fokusem w otwartym dialogu
- `AnimatePresence` + `motion.*`: reveal sekcji, crossfade obrazu podglądu, modal preview
- `onClick` na wielu elementach: otwieranie/zamykanie modalu, wybór swatch
- Browser API: `window.addEventListener('keydown', ...)` (Escape)

**Werdykt:** MUST CLIENT

**Uwagi:** Najbardziej złożona sekcja kliencka. Konfigurator + interaktywny modal preview z focus trapem i obsługą klawiatury. Wydzielenie jakiegokolwiek elementu do SC byłoby tu kontrproduktywne.

---

### GettingStartedQX

**Pliki:** `src/layouts/qx/GettingStartedQX.tsx` (3 289 B)

**Dlaczego client:**
- `useRef` + `useInView`: detekcja widoczności
- `motion.div`: reveal nagłówka
- `motion.article` x N (per step): staggered reveal kart kroków
- Brak `useState`, `useEffect`, event handlerów, custom hooków

**Werdykt:** SPLIT (~95% statyczne)

**Szkic podziału:**
1. `GettingStartedQX` staje się Server Component — renderuje `<section>`, nagłówek, grid kroków ze statycznym markupem (ikona, tytuł, opis).
2. `<MotionReveal preset="lift" stagger>` owija nagłówek i grid.
3. Alternatywnie: pojedynczy `<MotionStaggerGrid>` client wrapper owijający wszystkie karty z konfigurowalnymi opóźnieniami.

---

### ProductCodesQX

**Pliki:** `src/layouts/qx/ProductCodesQX.tsx` (7 457 B)

**Dlaczego client:**
- `useRef` + `useInView`: reveal-on-scroll
- `useIsMobile()`: steruje `open` prop na `<details>` — akordeon jest domyślnie otwarty na desktop, zamknięty na mobile
- `motion.div` x3: reveal nagłówka, obrazu, zawartości
- Brak `useState`, `useEffect`, event handlerów

**Werdykt:** SPLIT* (~85% statyczne)

**Szkic podziału:**
1. Tabele produktów (`<ProductCodeTable>`) są czysto statyczne i mogą być SC.
2. `isMobile` jako prop `open` można obsłużyć przez CSS (`details[open]` + media query override) — eliminuje potrzebę `useIsMobile` w JS.
3. `<MotionReveal>` wrapper owijający trzy animowane bloki pozostaje client.
4. Po CSS-owej obsłudze akordeonów: cały komponent da się sprowadzić do SC + thin motion wrapper.

---

### DimensionsQX

**Pliki:** `src/layouts/qx/DimensionsQX.tsx` (4 133 B)

**Dlaczego client:**
- `useRef` + `useInView`: detekcja widoczności w viewporcie
- `motion.div` x2: reveal nagłówka i siatki treści
- Brak `useState`, `useEffect`, event handlerów, custom hooków, browser API

**Werdykt:** CAN BE SERVER

**Uwagi:** `'use client'` służy tu wyłącznie do `useRef`+`useInView`+`motion.div`. Cały markup jest statyczny: nagłówek, lista specyfikacji `<dl>`, obraz wymiarowy `<Image>`. Po wydzieleniu reveal animacji do `<MotionReveal>` child wrappera — cały komponent może być Server Component bez żadnych zmian w logice czy propach.

---

### PackshotsQX

**Pliki:** `src/layouts/qx/PackshotsQX.tsx` (11 821 B)

**Dlaczego client:**
- `useState`: `lightboxIndex` — otwarty packshot (null = zamknięty)
- `useEffect`: Escape/Arrow key handler na `window`, focus management, auto-close lightbox na mobile
- `useRef` x3: `ref` (reveal), `closeButtonRef` (focus), `dialogRef` (focus trap)
- `useId`: unikalny ID dla `aria-labelledby` w dialogu
- `useIsMobile`: warunkowy render (mobile frame vs desktop button), guard lightboksa
- `useFocusTrap`: zarządzanie fokusem w otwartym dialogu
- `useInView`: reveal-on-scroll
- `motion.article` per item: staggered reveal siatki
- `AnimatePresence` + `motion.*`: lightbox overlay + obraz
- `onClick` na wielu elementach: otwieranie lightboksa, nawigacja, zamykanie
- Browser API: `window.addEventListener('keydown', ...)`

**Werdykt:** MUST CLIENT

**Uwagi:** Lightbox z focus trapem, keyboard navigation, `useIsMobile` warunkującym renderowany HTML — głęboka interaktywność bez możliwości sensownego podziału.

---

## Rekomendacje

### MUST CLIENT (bez zmian)

- **HeroQX** — pełny slider z timerem, klawiaturą i scroll API
- **MaterialsQX** — konfigurator materiałów z dynamicznym obrazem dwuwarstwowym
- **FeaturesQX** — tab panel + autoplay wideo przez IntersectionObserver
- **GalleryQX** — lightbox z `window.matchMedia` guard + `useState`
- **FinishesQX** — konfigurator + modal preview z focus trapem
- **PackshotsQX** — lightbox z keyboard nav, focus trapem, `useIsMobile` HTML split

### SPLIT (Server + ClientMotionWrapper)

- **OverviewQX** — statyczny tekst + obraz; tylko dwa `motion.div` reveal wrappers
- **GettingStartedQX** — statyczne karty kroków; tylko staggered reveal grid
- **ProductCodesQX** — tabele statyczne; `useIsMobile` można zastąpić CSS `details[open]` + `@media`; tylko motion reveal pozostaje client

**Sugerowany nowy komponent:** `src/components/catalog/MotionReveal.tsx`
```tsx
'use client';
// Przyjmuje: children, preset: 'slide' | 'lift' | 'settle', delay?: number
// Wewnętrznie: useRef + useInView + motion.div
// Stosowany jako wrapper w Server Component-rodzicu
```

### CAN BE SERVER (minimalna zmiana: usunięcie `'use client'` + wydzielenie motion wrappera)

- **DimensionsQX** — `useRef`+`useInView`+`motion.div` to jedyne powody klienta; cały markup jest statyczny

---

## Szacowany impact

Całkowity rozmiar źródeł 10 plików: **~82 kB** (niezmniejszony TypeScript).

Szacunkowy rozkład:

| Kategoria | Sekcje | Łączny rozmiar źródła | Uwagi |
|---|---|---|---|
| MUST CLIENT | 6 | ~63 kB | Bez zmian — hydracja nieunikniona |
| SPLIT | 3 | ~14 kB | ~80–95% mogłoby być SC; client payload: ~1–2 kB per motion wrapper |
| CAN BE SERVER | 1 | ~4 kB | Praktycznie cały plik może opuścić client bundle |

**Potencjalna redukcja hydracji:** ~12–15 kB kodu źródłowego dla 3 komponentów SPLIT + 4 kB dla DimensionsQX = **~16–19 kB surowego TS** przeniesionych poza client bundle. Po kompilacji i tree-shakingu framer-motion: faktyczny zysk w JS bundle będzie mniejszy (framer-motion jest już dołączony przez MUST CLIENT sekcje), ale każde usunięte `'use client'` oznacza o jeden hydration root mniej — co bezpośrednio przekłada się na TTI.

Najważniejszy zysk: **DimensionsQX** może stać się w pełni statycznym SC bez żadnego JSX klienta; przy reużyciu `<MotionReveal>` z innej sekcji nie dodaje nowego kodu klienta w ogóle.

---

## Następne kroki

1. **Proof-of-concept (zalecane):** Rozpocząć od `DimensionsQX` — najmniejsza zmiana, zerowe ryzyko regresji interaktywności. Wydzielić `<MotionReveal>` jako generyczny wrapper, usunąć `'use client'` z głównego komponentu. Zmierzyć delta TTI na Vercel Preview.

2. **Implementacja SPLIT:** Po weryfikacji PoC, zastosować ten sam wzorzec do `OverviewQX` i `GettingStartedQX`. Dla `ProductCodesQX` — najpierw podmienić `useIsMobile` na CSS-ową obsługę akordeonów.

3. **Pomiń refactor MUST CLIENT:** Sekcje z konfiguratorem (`MaterialsQX`, `FinishesQX`) i lightboksami (`GalleryQX`, `PackshotsQX`) pozostawiamy bez zmian — koszt podziału przewyższa zysk.

4. **Nie tworzyć `<MotionReveal>` prewencyjnie** — wydzielić go razem z pierwszym użyciem (DimensionsQX PoC), żeby uniknąć martwego kodu.
