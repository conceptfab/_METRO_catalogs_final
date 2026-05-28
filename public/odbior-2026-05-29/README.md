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

---

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

## 4. Mapa zależności dokumentów

```
              ZAŁĄCZNIK_2_PARAMETRYZACJA (4) ◄── w binderze
                          │
                          │ definiuje wymóg „uniwersalne projektowanie"
                          ▼
                      zasady.md (5) ◄── w binderze
                          │
                          │ operacjonalizacja
                          ▼
            audyt-dostepnosci-frontend (A) ◄── poza binderem
                          │
                          │ wskazał 27 ustaleń
                          ▼
        plan-implementacji-napraw (B) ─── rejestr-postepu (C)
                          │
                          │ 28 napraw wdrożonych
                          ▼
   ┌─────────────────────────────────────────────────────┐
   │ KANONICZNE DELIVERABLE-Y (w binderze)               │
   │   • odbior-koncowy.html (1) — główny dokument       │
   │   • raport-dostepnosci-final-2026-05-29.md (2)      │
   │   • potwierdzenie-zgodnosci-zalacznik-2-...md (3)   │
   └─────────────────────────────────────────────────────┘

  Dokumenty techniczne równoległe:
  • dokumentacja.html (6) — pełny opis projektu (w binderze)
  • AGENTS.md (D) — zasady utrzymania (poza binderem)
  • manifest-katalogow (E) — formalny rejestr katalogów (poza binderem)
```

---

## 5. Kluczowe wskaźniki realizacji (stan 2026-05-29)

| Wskaźnik | Wartość | Źródło |
| --- | --- | --- |
| Dostarczone systemy meblowe | **8 / 8** | (E) manifest |
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
| Audyt — ustaleń łącznie | **27** (5 K, 8 P, 9 U, 5 D) | (A) |
| Wdrożonych napraw | **28** (T0.1 – T5.1) | (C) |

---

## 6. Kolejność czytania (rekomendacja)

Dla **Zamawiającego (odbiór końcowy)** — wystarczy jeden dokument:

1. **[odbior-koncowy.html](./odbior-koncowy.html)** — otwórz w przeglądarce, czytaj sekcjami 1–15 od początku do końca. Wszystkie wymagania Załącznika nr 2 zestawione z dowodem realizacji.

Dla **organów kontrolnych (dostępność cyfrowa)**:

1. **(5) zasady.md** — przyjęte zasady uniwersalnego projektowania.
2. **(2) raport-dostepnosci-final** — pełen dowód zgodności WCAG 2.1 AA.
3. **(A) audyt + (B) plan napraw + (C) rejestr postępu** — dowód ścieżki audytowej.

Dla **archiwum projektu**:

1. Cały folder `docs/odbior-2026-05-29/` + linkowane dokumenty pomocnicze (A–E w sekcji 3).
2. Pakowanie do archiwum całego repo: <code>git archive --format=tar.gz HEAD -o metro-catalogs-2026-05-29.tar.gz</code>.

---

## 7. Uwagi techniczne

1. **Ścieżki względne.** Linki w dokumentach bindera używają ścieżek: <code>./</code> dla plików w binderze, <code>../</code> dla plików w <code>docs/</code>, <code>../../</code> dla plików spoza <code>docs/</code> (np. <code>AGENTS.md</code>, <code>public/</code>, <code>.ui-design/</code>).
2. **Format dla Zamawiającego.** Dokument HTML (1) jest preferowaną formą prezentacji — zawiera nawigację, czytelne tabele, statystyki i jest gotowy do druku (CSS `@media print`).
3. **Wersjonowanie.** Folder bindera jest częścią repozytorium git — każda zmiana jest widoczna w historii commitów.

---

**Sporządził pakiet:** Michał Kleniewski
**Data:** 29 maja 2026 r.
**Lokalizacja w repo:** `docs/odbior-2026-05-29/`
