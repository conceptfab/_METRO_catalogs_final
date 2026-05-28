# Plan: optymalizacja obrazów — TODO

Sesja 2026-05-07. Zrobione w dwóch fazach.

## Zrobione

### Faza 1
1. **Overview preset rozszerzony** `[400, 800]` → `[400, 800, 1200, 1600]`
   - [scripts/lib/section-widths.mjs](../../../scripts/lib/section-widths.mjs)
   - [src/lib/responsive-image.ts](../../../src/lib/responsive-image.ts)

2. **Overview `sizes` capped do max-w-[1440px]**
   - `(min-width: 1440px) 720px, (min-width: 1024px) 50vw, 100vw`
   - 1× DPR desktop pobiera 800w (~19 KB) zamiast 1200w / oryginału (516 KB)

3. **Per-preset aspect ratio cropping**
   - `SECTION_ASPECTS` map; `overview: 720/960` (3:4)
   - Skrypt: `fit: 'cover'` + `position: 'center'` gdy aspect ustawiony

4. **Kompresja zaostrzona**: WebP q82→q75 effort 4→6, PNG 8→9, JPEG 82→78
   - Overview 1600w: 248 KB → 110 KB

5. **Gallery: split rola main/thumb przez content.json**
   - `processGalleryDirectory()`: image[0] dostaje gallery widths, reszta gallery_thumb
   - Stale thumbnaile prune-owane przy regeneracji
   - QS gallery: 28 → 14 plików; QX: ~30 → 14 plików

### Faza 2
6. **Lightbox srcset** ([Lightbox.tsx](../../../src/components/catalog/Lightbox.tsx))
   - Dodane `responsiveImg(src, 'gallery', '100vw')`
   - Dla głównego obrazu galerii: 1× DPR fullscreen pobiera 1600w zamiast oryginału
   - Dla thumbów (tylko 256/512 dostępne): browser nadal sięga po oryginał — bez zmiany, bez generowania dodatkowych dużych wariantów

7. **Materials-full `sizes` capped** do faktycznego container width 687 px
   - `(min-width: 1440px) 687px, (min-width: 1024px) 50vw, 100vw`

8. **Gallery thumb aspect crop 1:1**
   - `SECTION_ASPECTS.gallery_thumb = 1`
   - 256w/512w warianty teraz wymiary 256×256 / 512×512 zamiast zachowanego źródła

9. **Build-time warning** gdy źródło < największy preset width
   - W `generateForImage`: `console.warn` z ostrzeżeniem o fallback do oryginału na Retinie
   - Przy aktualnych assetach żadne nie odpaliło → wszystkie źródła w porządku

## Świadomie odłożone

**Globalny `4000w` fallback w `responsiveProps`** — [responsive-image.ts:108-109](../../../src/lib/responsive-image.ts#L108-L109)
Po zrewidowaniu trade-offów: bez tego fallbacku gallery main na Retinie dostaje 1600w wyświetlone na 2162 device px (~1.35× upscale = miękko), a hero na 4K dostaje 2560w na 3840 device px (1.5× upscale). Żeby usunąć bezpiecznie, trzeba dodać większe widthy do preset gallery/hero (np. 2400w/3200w). Trade-off: koszt dysku vs jakość na Retina/4K. Decyzja produktowa, nie techniczna.

## Wymaga decyzji użytkownika

1. **Orphan base files w QX/gallery** — 3 pliki nie referowane w content.json:
   - `02_26_Metro_QX_SOLO_A0001.webp`
   - `02_26_Metro_QX_SOLO_B_0000.webp`
   - `02_26_Metro_QX_SOLO_C_0000.webp`

   Dodać do content.json czy usunąć z dysku?

## Statystyki końcowe

- Tests: 44 passed, 1 skipped (poprzednio 41)
- Typecheck: ✓
- Wszystkie thumby zregenerowane z nowymi parametrami
