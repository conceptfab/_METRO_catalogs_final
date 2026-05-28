# Pakiet dokumentacji odbiorowej METRO Catalogs

**Data zestawienia:** 29 maja 2026 r.
**Przedmiot zamówienia:** Zaprojektowanie i realizacja interaktywnych katalogów produktowych w wersji online dla 8 kolekcji mebli METRO (QX, QS, VR, TS, FM, FOTA, MRC800, MRC1000).
**Okres realizacji:** 1.01.2026 – 31.05.2026.
**Wykonawca:** Michał Kleniewski.
**Repozytorium produkcyjne:** `__METRO_catalogs`, branch `main`.
**Wdrożenie produkcyjne:** Vercel, projekt `metro-catalogs`.

---

## 1. Cel pakietu

Niniejszy folder stanowi **samowystarczalny pakiet odbiorowy** projektu METRO Catalogs. Zawiera komplet dokumentów niezbędnych do odbioru końcowego — bez duplikacji, w jednym miejscu, gotowy do przekazania Zamawiającemu lub organom kontrolnym.

Pakiet może być przedłożony:

- **Zamawiającemu** jako podstawa odbioru końcowego,
- **właściwym organom kontrolnym** (PFRON, Ministerstwo Cyfryzacji, Ministerstwo Rodziny i&nbsp;Polityki Społecznej),
- do archiwum projektu wraz z dowodami zgodności.

---

## 2. Zawartość pakietu

| # | Plik | Opis |
| --- | --- | --- |
| **0.** | [README.md](./README.md) | Indeks pakietu (ten plik) |
| **1.** | [**odbior-koncowy.html**](./odbior-koncowy.html) | **Główny dokument dla Zamawiającego** — pełne zestawienie wymagań Załącznika nr 2 z potwierdzeniem realizacji, w czytelnej formie z nawigacją, gotowe do druku. Otwórz w&nbsp;przeglądarce. |
| **2.** | [raport-dostepnosci-final-2026-05-29.md](./raport-dostepnosci-final-2026-05-29.md) | Raport końcowy zgodności z zasadami uniwersalnego projektowania (wersja 2.0) — szczegółowy dowód zgodności z WCAG 2.1 AA |
| **3.** | [potwierdzenie-zgodnosci-zalacznik-2-2026-05-29.md](./potwierdzenie-zgodnosci-zalacznik-2-2026-05-29.md) | Potwierdzenie zgodności z Załącznikiem nr 2 (wersja markdown) — alternatywna forma tekstowa dokumentu HTML (1) |
| **4.** | [ZAŁĄCZNIK_2_PARAMETRYZACJA.md](./ZAŁĄCZNIK_2_PARAMETRYZACJA.md) | Załącznik nr 2 do zapytania ofertowego — Parametryzacja (dokument źródłowy postępowania) |
| **5.** | [zasady.md](./zasady.md) | 10 zasad uniwersalnego projektowania przyjętych dla projektu — operacjonalizacja art. 2 pkt 4 Ustawy z dnia 19 lipca 2019 r. |
| **6.** | [dokumentacja.html](./dokumentacja.html) | Dokumentacja techniczna projektu — 13 sekcji (stos, architektura, build, deploy, design system, onboarding). Otwórz w przeglądarce. |

> **Uwaga:** dokumenty 2 i 3 stanowią markdownowe odpowiedniki sekcji z dokumentu HTML (1). HTML jest preferowaną formą prezentacji dla Zamawiającego; markdown służy do wersjonowania w git i ewentualnej dalszej obróbki tekstowej.

### Historia zmian pakietu

- **2026-05-28** — Aktualizacja sekcji 11 (`dokumentacja.html`) i&nbsp;dodanie podsekcji 10.6 (`odbior-koncowy.html`) z&nbsp;opisem rozszerzonych metadanych SEO oraz danych strukturalnych JSON-LD (`Organization`, `WebSite`, `CollectionPage`, `BreadcrumbList`). Wprowadzono spójną konwencję graficzną oznaczania pracy wykonanej ponad wymagany standard (badge `PONAD WYMAGANY STANDARD`, klasy `.badge.plus` / `.callout.plus`). Zastosowano ją również retroaktywnie do sekcji 9 (design system) i&nbsp;10 (PDF pipeline).

---

## 3. Mapa zależności dokumentów

```
              ZAŁĄCZNIK_2_PARAMETRYZACJA (4)
                          │
                          │ definiuje wymóg „uniwersalne projektowanie"
                          ▼
                      zasady.md (5)
                          │
                          │ operacjonalizacja w warstwie kodu
                          ▼
   ┌─────────────────────────────────────────────────────┐
   │ KANONICZNE DELIVERABLE-Y (w binderze)               │
   │   • odbior-koncowy.html (1) — główny dokument       │
   │   • raport-dostepnosci-final-2026-05-29.md (2)      │
   │   • potwierdzenie-zgodnosci-zalacznik-2-...md (3)   │
   │   • dokumentacja.html (6) — opis techniczny         │
   └─────────────────────────────────────────────────────┘
```

---

## 4. Kluczowe wskaźniki realizacji (stan 2026-05-29)

| Wskaźnik | Wartość | Źródło |
| --- | --- | --- |
| Dostarczone systemy meblowe | **8 / 8** | (1) sekcja 4 |
| Karty katalogowe łącznie | **83** (wymagane min. 64) | (3) sekcja 4 |
| PDF-y do pobrania | **8 / 8** | (3) sekcja 9.5 |
| Język aplikacji | **angielski** | (3) sekcja 4.3 |
| Testy automatyczne a11y | **95 passed / 0 failed** | (2) sekcja 3 |
| Typecheck (TypeScript) | **0 błędów** | (2) sekcja 3 |
| Build produkcyjny | **wszystkie trasy OK** | (2) sekcja 5 |
| Spełnienie zasad uniwersalnego projektowania | **10 / 10** | (2) sekcja 4 |
| Zgodność WCAG 2.1 AA (warstwa kodu) | **pełna** | (2) sekcja 4 |
| Etapy harmonogramu zrealizowane | **5 / 5** | (3) sekcja 9 |
| Spotkania robocze w siedzibie Zamawiającego | **≥ 10** | (3) sekcja 10 |
| Audyt — ustaleń łącznie | **27** (5 K, 8 P, 9 U, 5 D) | (2) sekcja 3 |
| Wdrożonych napraw | **28** (T0.1 – T5.1) | (2) sekcja 3 |

---

## 5. Kolejność czytania (rekomendacja)

Dla **Zamawiającego (odbiór końcowy)** — wystarczy jeden dokument:

1. **[odbior-koncowy.html](./odbior-koncowy.html)** — otwórz w przeglądarce, czytaj sekcjami 1–15 od początku do końca. Wszystkie wymagania Załącznika nr 2 zestawione z dowodem realizacji.

Dla **organów kontrolnych (dostępność cyfrowa)**:

1. **(5) zasady.md** — przyjęte zasady uniwersalnego projektowania.
2. **(2) raport-dostepnosci-final-2026-05-29.md** — pełny dowód zgodności z&nbsp;WCAG 2.1 AA wraz z&nbsp;udokumentowaną ścieżką audytową (27 ustaleń, 28 napraw — sekcja 3).

Dla **archiwum projektu**:

1. Cały folder `docs/odbior-2026-05-29/`.
2. Pakowanie do archiwum całego repo: <code>git archive --format=tar.gz HEAD -o metro-catalogs-2026-05-29.tar.gz</code>.

---

## 6. Uwagi techniczne

1. **Ścieżki względne.** Linki w dokumentach bindera używają ścieżek: <code>./</code> dla plików w binderze, <code>../</code> dla plików w <code>docs/</code>, <code>../../</code> dla plików spoza <code>docs/</code> (np. <code>AGENTS.md</code>, <code>public/</code>, <code>.ui-design/</code>).
2. **Format dla Zamawiającego.** Dokument HTML (1) jest preferowaną formą prezentacji — zawiera nawigację, czytelne tabele, statystyki i jest gotowy do druku (CSS `@media print`).
3. **Wersjonowanie.** Folder bindera jest częścią repozytorium git — każda zmiana jest widoczna w historii commitów.

---

**Sporządził pakiet:** Michał Kleniewski
**Data:** 29 maja 2026 r.
**Lokalizacja w repo:** `docs/odbior-2026-05-29/`
