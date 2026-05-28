# Pakiet dokumentacji odbiorowej METRO Catalogs

**Data zestawienia:** 29 maja 2026 r.
**Przedmiot zamówienia:** Zaprojektowanie i realizacja interaktywnych katalogów produktowych w wersji online dla 8 kolekcji mebli METRO (QX, QS, VR, TS, FM, FOTA, MRC800, MRC1000).
**Okres realizacji:** 1.01.2026 – 31.05.2026.
**Wykonawca:** CONCEPTFAB Michał Kleniewski.
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
| **3.** | [ZAŁĄCZNIK_2_PARAMETRYZACJA.md](./ZAŁĄCZNIK_2_PARAMETRYZACJA.md) | Załącznik nr 2 do zapytania ofertowego — Parametryzacja (dokument źródłowy postępowania) |
| **4.** | [zasady.md](./zasady.md) | 10 zasad uniwersalnego projektowania przyjętych dla projektu — operacjonalizacja art. 2 pkt 4 Ustawy z dnia 19 lipca 2019 r. |
| **5.** | [dokumentacja.html](./dokumentacja.html) | Dokumentacja techniczna projektu — 13 sekcji (stos, architektura, build, deploy, design system, onboarding). Otwórz w przeglądarce. |

> **Uwaga:** dokument HTML (1) jest preferowaną, samowystarczalną formą prezentacji dla Zamawiającego (zawiera pełne zestawienie wymagań Załącznika nr 2 wraz z potwierdzeniem realizacji). Dokument (2) to **pełny, autorytatywny raport dostępności** (sekcja 7 dokumentu HTML jest jego streszczeniem). Pozostałe pliki markdown służą do wersjonowania w git i dalszej obróbki tekstowej.

### Historia zmian pakietu

- **2026-05-28** — Konsolidacja pakietu i&nbsp;korekta numeracji. Usunięto duplikat `potwierdzenie-zgodnosci-zalacznik-2-2026-05-29.md` — jego treść w&nbsp;całości zawiera się w&nbsp;dokumencie HTML (1); dokumenty przenumerowano (ZAŁĄCZNIK_2 → 3, zasady → 4, dokumentacja → 5). Naprawiono numerację podsekcji w&nbsp;`odbior-koncowy.html` (`7.1–7.3`, `8.1–8.3`, `9.1–9.6`, `11.1` — wcześniej przesunięte o&nbsp;jeden). Usunięto wskaźnik „spotkania robocze" (realizację dokumentuje Zamawiający). Ujednolicono nazwę Wykonawcy: „CONCEPTFAB Michał Kleniewski".
- **2026-05-28** — Dodano sekcję **10. Funkcje dostarczone ponad wymagany standard** w&nbsp;`odbior-koncowy.html` — cztery obszary realizacji ponad wymagania Załącznika nr&nbsp;2: (10.1) maszynowo-odczytywalny interfejs katalogu MCP / OAuth&nbsp;2.0 / `.well-known`, (10.2) inżynieria wydajności i&nbsp;Core Web Vitals, (10.3) aplikacja instalowalna PWA, (10.4) automatyzacja kontroli jakości; oraz (10.5) atuty architektoniczne. Sekcje 11–14 przenumerowane. Uzupełniono oświadczenie końcowe o&nbsp;pkt&nbsp;9.
- **2026-05-28** — Aktualizacja sekcji 11 (`dokumentacja.html`) i&nbsp;dodanie podsekcji 9.6 (`odbior-koncowy.html`) z&nbsp;opisem rozszerzonych metadanych SEO oraz danych strukturalnych JSON-LD (`Organization`, `WebSite`, `CollectionPage`, `BreadcrumbList`). Wprowadzono spójną konwencję graficzną oznaczania pracy wykonanej ponad wymagany standard (badge `PONAD WYMAGANY STANDARD`, klasy `.badge.plus` / `.callout.plus`). Zastosowano ją również retroaktywnie do sekcji 8 (design system) i&nbsp;9 (PDF pipeline).

---

## 3. Mapa zależności dokumentów

```
              ZAŁĄCZNIK_2_PARAMETRYZACJA (3)
                          │
                          │ definiuje wymóg „uniwersalne projektowanie"
                          ▼
                      zasady.md (4)
                          │
                          │ operacjonalizacja w warstwie kodu
                          ▼
   ┌─────────────────────────────────────────────────────┐
   │ KANONICZNE DELIVERABLE-Y (w binderze)               │
   │   • odbior-koncowy.html (1) — główny dokument       │
   │   • raport-dostepnosci-final-2026-05-29.md (2)      │
   │   • dokumentacja.html (5) — opis techniczny         │
   └─────────────────────────────────────────────────────┘
```

---

## 4. Kluczowe wskaźniki realizacji (stan 2026-05-29)

| Wskaźnik | Wartość | Źródło |
| --- | --- | --- |
| Dostarczone systemy meblowe | **8 / 8** | (1) sekcja 4 |
| Karty katalogowe łącznie | **83** (wymagane min. 64) | (1) sekcja 4 |
| PDF-y do pobrania | **8 / 8** | (1) sekcja 12 |
| Język aplikacji | **angielski** | (1) sekcja 4 |
| Testy automatyczne a11y | **95 passed / 0 failed** | (2) sekcja 3 |
| Typecheck (TypeScript) | **0 błędów** | (2) sekcja 3 |
| Build produkcyjny | **wszystkie trasy OK** | (2) sekcja 5 |
| Spełnienie zasad uniwersalnego projektowania | **10 / 10** | (2) sekcja 4 |
| Zgodność WCAG 2.1 AA (warstwa kodu) | **pełna** | (2) sekcja 4 |
| Etapy harmonogramu zrealizowane | **5 / 5** | (1) sekcja 11 |
| Audyt — ustaleń łącznie | **27** (5 K, 8 P, 9 U, 5 D) | (2) sekcja 3 |
| Wdrożonych napraw | **28** (T0.1 – T5.1) | (2) sekcja 3 |
| Funkcje ponad wymagany standard | **6 obszarów** (design system, PDF, SEO/JSON-LD, interfejs MCP/OAuth, wydajność/CWV, PWA + QA) | (1) sekcje 8–10 |

---

## 5. Kolejność czytania (rekomendacja)

Dla **Zamawiającego (odbiór końcowy)** — wystarczy jeden dokument:

1. **[odbior-koncowy.html](./odbior-koncowy.html)** — otwórz w przeglądarce, czytaj sekcjami 1–15 od początku do końca. Wszystkie wymagania Załącznika nr 2 zestawione z dowodem realizacji.

Dla **organów kontrolnych (dostępność cyfrowa)**:

1. **(4) zasady.md** — przyjęte zasady uniwersalnego projektowania.
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

**Sporządził pakiet:** CONCEPTFAB Michał Kleniewski
**Data:** 29 maja 2026 r.
**Lokalizacja w repo:** `docs/odbior-2026-05-29/`
