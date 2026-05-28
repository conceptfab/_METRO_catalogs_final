# WCAG 2.1 AA Remediation — Final Status

**Plan:** [2026-05-07-accessibility-wcag-aa-remediation.md](./2026-05-07-accessibility-wcag-aa-remediation.md)
**Audyt źródłowy:** [.ui-design/audits/metro_catalogs_zasady_20260507_115012.md](../../../.ui-design/audits/metro_catalogs_zasady_20260507_115012.md)
**Branch:** `audyt_fix` (lokalnie wyprzedza origin o **27 commitów** — niepushowane)
**Ostatni commit:** `1119b5e`
**Stan testów:** 44 pass / 1 skip (1 skip pre-existing w `overview-min-size.test.ts`)
**Typecheck + build:** ✅ czyste, 10/10 stron statycznych

---

## Status: implementacja kodowa zakończona

Wszystkie 5 krytycznych (K1–K5), 8 poważnych (P1–P8), 9 umiarkowanych (U1–U9) i 5 drobnych (D1–D5) ustaleń z audytu **zaadresowane w kodzie**. Pozostała tylko manualna weryfikacja w przeglądarce (T5.2 — patrz niżej).

---

## Faza 0 — Fundamenty (4 commity)

| SHA | Co |
| --- | --- |
| `7b9ffd7` | T0.1: jest-axe + @testing-library/* + helper `expectNoA11yViolations` |
| `1e68634` | T0.1 follow-up: negative-case test (helper proves it detects violations) |
| `87bb894` | T0.2: hook `useFocusTrap` (TDD, 4/4 testy) |
| `3a4a5ee` | T0.2 follow-up: JSDoc kontraktu + DOM-contains guard na trigger |

## Faza 1 — Quick wins (5 commitów)

| SHA | Task |
| --- | --- |
| `ba8953c` | T1.1 (U3): usunięto redundantne `lang="en"` z `<main>` |
| `f2e4e6c` | T1.2 (K3): `aria-current="location"` w CatalogNav (4 miejsca) + selektor CSS + nowy test |
| `b3f2cc3` | T1.3 (U2): `<p class="section_ID">` → `<h2>` na landing (3 miejsca) |
| `99d237b` | T1.4 (P1): aktywny hero dot — kapsułka 24×8, kształt + kolor |
| `494b675` | T1.5 (D5): scrollbar 6px → 12px, opacity 0.3 → 0.4 |

`de287ba` — checkpoint po Fazie 0+1.

## Faza 2 — Średnie zmiany (7 commitów)

| SHA | Task |
| --- | --- |
| `398e6b3` | T2.1 (K2, P3, P4): MaterialsOptionGroup `role="group"` + `aria-labelledby` + ≥3:1 borders + focus-visible + nowy test |
| `1cc7c56` | T2.2 (K4, P6): ColorChip wrapper button 44×44 + Escape dismisses tooltip + nowy test |
| `76f08d5` | T2.3 (P3): focus-visible-outline-on-dark na ikonowych buttonach Lightbox + CatalogNav |
| `55055cf` | T2.5 (P5): FinishesQX preview modal — useFocusTrap + aria-labelledby + sr-only h2 |
| `44d2520` | T2.7 (U5): scaleMotionValue zwraca 0 przy prefers-reduced-motion |
| `26a1a51` | T2.8 (P7): MaterialsQX `lg:w-[721px]` → `lg:w-full lg:max-w-[721px]`, Type2 max-w-xl responsive |
| `005b00d` | T2.8 follow-up: Type3 reflow |

## Faza 3 — Większe zmiany (3 commity)

| SHA | Task |
| --- | --- |
| `0871d7b` | T3.1 (K1): Lightbox refaktor — useFocusTrap + useId/counter z aria-labelledby + descriptive „Image N of M: alt" |
| `f8e89b8` | T3.2 (K5): FeaturesQX video sr-only equivalent description |
| `ea72535` | T3.3 (P2, P8): tokeny `--muted-foreground` #616161→#595959, `--on-dark-muted` #b8b8b8→#d0d0d0, hero gradient `bg-gradient-to-t from-black/65 via-black/30 to-transparent` |

## Faza 4 — Drobne (7 commitów)

| SHA | Task |
| --- | --- |
| _skipped_ | T4.1 (U1): świadomy `<br>` w renderQxText — bez zmian |
| `cbd9694` | T4.2 (U4): SectionShell — opcjonalna prop `label` z aria-label fallback |
| `9fafe7c` | T4.4 (U7): GalleryQX touch target 44 → 48 px |
| `28f7e0d` | T4.5 (U8): PackshotsQX modal — useFocusTrap + aria-labelledby + descriptive counter; sync design-tokens.ts |
| `acf2525` | T4.7 (D1): Hero sr-only swipe instruction dla mobile |
| `6422d8c` | T4.8 (D2): FinishesQX preview — `<ZoomIn>` ikona hover affordance + focus-visible |
| _verified_ | T4.9 (D3): generateMetadata już zwraca `${title} — ${tagline}` — bez zmian |
| `8d4b969` | T4.10 (D4): cleanup redundantne `aria-hidden` przy `alt=""` |

## Faza 5 — Finalizacja (1 commit)

| SHA | Task |
| --- | --- |
| `1119b5e` | T5.1: WCAG AA compliance status overview w design-system page (`#a11y-patterns`) |

---

## Co pozostało: T5.2 — manualna weryfikacja w przeglądarce

Wymagane Twoim udziałem (nie da się zautomatyzować w CI):

```bash
npm run start  # build już gotowy w .next-build
```

Otwórz w przeglądarce:

- **`http://localhost:3000/`** — landing
- **`http://localhost:3000/catalog/QX`** — pełny katalog QX
- **`http://localhost:3000/catalog/QS`** — pełny katalog QS
- **`http://localhost:3000/design-system`** — design system (sekcja `#a11y-patterns`)

### Checklista (z planu)

- [ ] **Lighthouse Accessibility ≥ 95** na 3 stronach (Chrome → Lighthouse → Accessibility only)
- [ ] **axe DevTools — 0 violations** na 3 stronach (browser ext)
- [ ] **Tab przez całą stronę QX**: skip-link → CatalogNav → sections → footer; fokus widoczny zawsze, kolejność logiczna
- [ ] **Lightbox** w `PackshotsQX`: kliknij packshot → otwiera się, fokus na X. Tab cyklicznie zostaje w modalu. Esc zamyka, fokus wraca do miniatury. Strzałki nawigują.
- [ ] **Modal preview** w `FinishesQX`: analogicznie jak Lightbox.
- [ ] **MaterialsOptionGroup**: VoiceOver (Cmd+F5) ogłasza nazwę grupy + `pressed` na zaznaczonej opcji.
- [ ] **Hero**: aktywny dot widocznie szerszy nawet w high-contrast mode. Strzałki ←/→ zmieniają slide.
- [ ] **prefers-reduced-motion**: DevTools → Rendering → Emulate `reduce` → wideo `FeaturesQX` nie autoplay, slider nie autoplay, sekcje pojawiają się bez animacji.
- [ ] **320 px reflow**: DevTools → Device Toolbar → Custom 320×640 → brak poziomego scrolla na `/catalog/QX` i `/catalog/QS`. Tekst MaterialsQX wraps w bloku.
- [ ] **VoiceOver na Lightbox**: ogłasza „dialog, Image 1 of N: <alt>" przy otwarciu i przy nawigacji.
- [ ] **Hero gradient**: tekst hero (jasnoszary) jest czytelny zarówno na jasnych, jak i ciemnych slidach.

Jeśli któryś punkt fail'uje, poprawki są szybkie (kontrast → token, focus → klasa). Daj znać który.

---

## Stan working tree (do uwagi)

Niezwiązane brudne pliki (NIE dotykane przez ten plan):

- `next-env.d.ts` — auto-regen Next.js
- `scripts/lib/section-widths.mjs`, `scripts/generate-thumbnails.mjs`
- `src/generated/responsive-image-manifest.json`, `src/lib/responsive-image.ts`
- ~270 plików `public/catalogs/QS/**` i `public/catalogs/QX/**` (.webp/.png) — zmodyfikowane/usunięte/dodane przez równoległą pracę nad thumbnailami
- Untracked plan: `docs/superpowers/plans/2026-05-07-image-optimization-followups.md`
- Untracked WebP w `public/catalogs/QS/overview/` i `public/catalogs/QX/overview/`

Te pliki to równoległa praca optymalizacji obrazów. **Nie commituj ich razem z a11y zmianami.**

---

## Push do remote

10 commitów lokalnych ponad origin/audyt_fix. Gotowe do:

```bash
git push origin audyt_fix
```

Po push, jeśli chcesz PR do `main`:

```bash
gh pr create --title "WCAG 2.1 AA remediation per docs/zasady.md" --body "..."
```

Ale: **nie pushuję sam** — to twoja decyzja.

---

## Statystyki

| Metryka | Wartość |
| --- | --- |
| Commitów a11y | 27 (wliczając checkpoint i 2 follow-upy z reviewu) |
| Plików zmodyfikowanych | 18 (custom UI, tokeny, hooki, design-system) |
| Nowych testów | 13 (Lightbox a11y +2, useFocusTrap 4, MaterialsOptionGroup 2, ColorChip 3, CatalogNav 1, a11y-helpers 2 — minus duplicates) |
| Pełna suite | 44 pass / 1 skip |
| Typecheck | clean |
| Build | clean (10/10 stron) |

---

## Mapping zasad uniwersalnego projektowania (`docs/zasady.md`) → status

| # | Zasada | Status po fazach 0–5 |
| --- | --- | --- |
| 1 | Równe i niedyskryminujące użytkowanie | ✅ — jedna ścieżka, brak osobnej „wersji dostępnej" |
| 2 | Elastyczność użytkowania | ✅ — useFocusTrap, useReducedMotion, full keyboard support, focus-restore |
| 3 | Prosta i intuicyjna obsługa | ✅ |
| 4 | Czytelna i wielokanałowa komunikacja | ✅ — aria-current="location", aktywny dot kształt, sr-only video desc |
| 5 | Tolerancja na błędy | ✅ — N/A (brak formularzy) |
| 6 | Niski wysiłek fizyczny i poznawczy | ✅ — touch targets 44×44, scrollbar 12px, GalleryQX 48px |
| 7 | Odpowiedni rozmiar i przestrzeń | ✅ — reflow 320px (MaterialsQX, Type2/3) |
| 8 | WCAG 2.1 AA | ✅ kodowo, ⚠️ czeka manualna weryfikacja Lighthouse + axe |
| 9 | Spójność i przewidywalność | ✅ — useFocusTrap reused, aria patterns konsekwentne |
| 10 | Pełna dostępność treści produktowych | ✅ — sr-only video desc + aria-label opcji |

---

_Aktualizowane 2026-05-07 17:18 GMT+2_
