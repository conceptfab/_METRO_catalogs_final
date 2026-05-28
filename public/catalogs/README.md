# Szablon katalogow - struktura tresci

Nazwa folderu glownego = nazwa kolekcji (np. QX, QS, TS).

## Plik konfiguracyjny globalny

`public/config.json` - ustawienia dla calej aplikacji:

- `brandName` - nazwa marki w nawigacji
- `siteTitle` - tytul na stronie glownej
- `siteSubtitle` - podtytul na stronie glownej
- `footerText` - tekst w stopce
- `catalogListTitle` - naglowek listy katalogow

## Struktura

```text
config.json                 <- konfiguracja globalna (w public/)
catalogs/
  index.json                <- lista katalogow (dodaj nowy ID do tablicy)
  QX/                       <- folder = nazwa kolekcji
    config.json             <- definicje globalne (meta, sections)
    hero/
      content.json
      slider.json           <- nowy plik: ustawienia slidera + opisy slajdow
      hero_00.webp
      hero_01.webp
      ...
    overview/
      content.json
      packshot.webp
    gallery/
      content.json
      packshot.webp
      hero-office.webp
      ...
    variants/
      content.json
      packshot.webp
    packshots/
      content.json
      model-a.webp
      model-b.webp
      ...
    dimensions/
      content.json
    materials/
      content.json
      detail.webp
    features/
      content.json
    getting-started/
      content.json
```

## Dodawanie nowego katalogu

1. Skopiuj folder `QX` i zmien nazwe na nazwe kolekcji (np. `QS`).
2. Edytuj `config.json` - meta, sections.
3. Edytuj pliki `content.json` w kazdej sekcji.
4. Podmien obrazy w podfolderach (nazwy plikow zgodne z `content.json`).
5. Dodaj nowy identyfikator do tablicy `catalogs` w `index.json`.

Preferowany format obrazow to `webp`.
Jesli obok siebie istnieja pliki o tym samym basename, np. `packshot.webp` i `packshot.jpg`, aplikacja wybierze `webp`.

## Hero - nowy model slidera per katalog

W kazdym folderze `<KATALOG>/hero/` konfigurujesz slider osobno przez `slider.json`.

### `hero/content.json`

Trzyma tylko tresci sekcji hero (bez ustawien slidera):

```json
{
  "brandLabel": "",
  "collectionName": "QX",
  "tagline": "Modular desk system engineered for the modern workspace.",
  "taglineLine2": "Where precision meets flexibility.",
  "ctaLabel": "Explore Collection",
  "heroImage": "hero_00.webp",
  "heroImageAlt": "QX desk system in a modern open-space office with people working"
}
```

### `hero/slider.json`

Trzyma ustawienia slidera, definicje slajdow (kolejnosc + opisy) oraz styl opisu tylko dla tego katalogu:

```json
{
  "settings": {
    "autoAdvance": true,
    "interval": 5000,
    "pauseOnHover": true,
    "transitionMs": 900,
    "showArrows": true,
    "showDots": true,
    "initialSlide": 0
  },
  "slides": [
    {
      "image": "hero_00.webp",
      "alt": "Accessible alt text",
      "description": "Visible description/caption for this slide",
      "heroContent": {
        "brandLabel": "METRO QX",
        "collectionName": "QX",
        "tagline": "Per-slide tagline override.",
        "taglineLine2": "Optional second line.",
        "ctaLabel": "Explore"
      },
      "contentLayout": {
        "anchor": "bottom-left",
        "textAlign": "left",
        "maxWidth": "36rem",
        "paddingX": "1.25rem",
        "paddingY": "2.5rem",
        "textColor": "#151515",
        "secondaryTextColor": "rgba(21, 21, 21, 0.78)",
        "titleFontSize": "clamp(5.6rem, 17.5vw, 15.4rem)",
        "titleFontWeight": 200,
        "titleLineHeight": "0.9",
        "titleLetterSpacing": "-0.02em",
        "taglineFontSize": "1.125rem",
        "taglineLine2FontSize": "1rem",
        "brandLabelFontSize": "0.875rem",
        "ctaPosition": "inline"
      }
    },
    {
      "image": "hero_01.webp"
    }
  ],
  "descriptionStyle": {
    "enabled": true,
    "position": "bottom-left",
    "offsetPx": 34,
    "textColor": "#F4ECE4",
    "backgroundColor": "rgba(17,15,13,0.55)",
    "backdropBlurPx": 8,
    "paddingX": 18,
    "paddingY": 10,
    "borderRadiusPx": 14,
    "fontSizePx": 14,
    "fontWeight": 600,
    "letterSpacingEm": 0.02,
    "maxWidth": "520px",
    "textAlign": "left",
    "uppercase": false
  }
}
```

- `slides` definiuje kolejnosc slajdow.
- `alt` jest opcjonalny (fallback do `heroImageAlt`).
- `description` jest opcjonalny i moze byc wyswietlany na hero.
- `descriptionStyle` dziala per katalog `QX-*` (zmiana w jednym `slider.json` nie zmienia innych).
- Jesli `slider.json` nie istnieje, aplikacja fallbackuje do auto-detekcji `hero_00.webp`, `hero_01.webp`, itd. Jesli `webp` nie ma, uzyje `jpg/jpeg/png`.

### Per-slide customization (pelna kontrola geometrii)

Kazdy slajd moze nadpisac:

**`heroContent`** — tresc per slajd (fallback do `hero/content.json`):

| Pole | Co nadpisuje |
|---|---|
| `brandLabel` | maly label nad tytulem |
| `collectionName` | glowny tytul |
| `tagline` | glowna tresc |
| `taglineLine2` | druga linia tresci |
| `ctaLabel` | label przycisku CTA |

**`contentLayout`** — geometria tekstu per slajd (kazde pole opcjonalne, defaulty = centered/light):

| Pole | Wartosc | Opis |
|---|---|---|
| `anchor` | `top-left`/`top-center`/`top-right`/`center-left`/`center`/`center-right`/`bottom-left`/`bottom-center`/`bottom-right` | gdzie kotwiczy blok tekstu |
| `textAlign` | `left`/`center`/`right` | wyrownanie wewnatrz bloku |
| `maxWidth` | dowolna jednostka CSS (`36rem`, `60vw`, `1440px`) | max szerokosc bloku tekstu |
| `paddingX` | dowolna jednostka CSS | padding od krawedzi bocznych |
| `paddingY` | dowolna jednostka CSS | padding od gory/dolu |
| `textColor` | dowolny CSS color | kolor glownego tekstu |
| `secondaryTextColor` | dowolny CSS color | kolor brand label + taglineLine2 |
| `titleFontSize` | CSS, wspiera `clamp()` | rozmiar tytulu (np. `clamp(3rem, 8vw, 7rem)`) |
| `titleFontWeight` | liczba (100-900) | grubosc tytulu |
| `titleLineHeight` | CSS (`0.9`, `1.1`) | wysokosc linii tytulu |
| `titleLetterSpacing` | CSS (`-0.02em`, `0.04em`) | tracking tytulu |
| `taglineFontSize` | CSS | rozmiar glownej tresci |
| `taglineLine2FontSize` | CSS | rozmiar drugiej linii |
| `brandLabelFontSize` | CSS | rozmiar brand label |
| `ctaPosition` | `inline`/`floating`/`none` | inline = pod tekstem, floating = absolute (uzyte z `ctaFloatingBottom`), none = ukryj CTA |
| `ctaFloatingBottom` | CSS | dystans floating CTA od dolu (np. `16rem`, `clamp(12rem, 22vh, 16rem)`) |
| `contentLift` | CSS transform value | przesuniecie pionowe bloku (np. `-8rem`) |

**`descriptionStyle`** — geometria opisu per slajd (jesli `description` ustawione i `enabled: true`):

Pelny zestaw pol w `HeroDescriptionStyleConfig` (position, offsetPx, textColor, backgroundColor, backdropBlurPx, paddingX, paddingY, borderRadiusPx, fontSizePx, fontWeight, letterSpacingEm, maxWidth, textAlign, uppercase).

## Sciezki do obrazow

W `content.json` uzywaj nazw plikow wzglednych do folderu sekcji:

- `hero/hero-office.webp` -> w `hero/content.json`: `"heroImage": "hero-office.webp"`
- `hero/hero_00.webp`, `hero_01.webp`, ... -> automatycznie wykrywane fallbackowo
- `gallery/packshot.webp` -> w `gallery/content.json`: `"image": "packshot.webp"` (w obiekcie images)
- `packshots/model-a.webp` -> w `packshots/content.json`: `"image": "model-a.webp"`

## Models / Packshots - nazwy wariantow

W `packshots/content.json` kazdy packshot moze miec wlasna nazwe w polu `name`. Nazwa powinna skladac sie z modelu, koloru ramy i koloru blatu:

```json
{
  "code": "QX10-U120",
  "name": "QX10 / White frame / White top",
  "frameColorName": "White",
  "frameColorCode": "RAL 9003",
  "frameColorHex": "#f0f0f0",
  "desktopColorName": "White",
  "desktopColorCode": "U120",
  "desktopColorHex": "#f0efe9",
  "colorName": "White",
  "colorCode": "U120",
  "colorHex": "#f0efe9"
}
```

Jesli `name` nie jest wpisane, loader sklada fallback z `model`, `frameColorName` i `desktopColorName`. Starsze pola `colorName`, `colorCode`, `colorHex` zostaja jako kompatybilny alias dla glownego koloru wariantu.

## Materials - konfigurator warstwowy

Jesli w folderze `materials/` istnieja odpowiednio nazwane pliki `webp`, sekcja Materials automatycznie wlaczy konfigurator.

- kolory stelaza: pliki z `RAL` w nazwie, np. `metro_RAL9006.webp`
- kolory blatow: pliki z `U` lub `W` i numerem, np. `metro_U110.webp`, `metro_W240.webp`
- miniatury: ten sam basename z dopiskiem `_thumb`, np. `metro_RAL9006_thumb.webp`, `metro_U110_thumb.webp`
- glowna ilustracja sklada sie z dwoch warstw alpha `webp`: jednej dla stelarza i jednej dla blatu
- po kliknieciu miniatury aplikacja bierze odpowiadajacy jej plik bez `_thumb`

Przyklad:

- `metro_RAL9006_thumb.webp` -> wybiera warstwe `metro_RAL9006.webp`
- `metro_U110_thumb.webp` -> wybiera warstwe `metro_U110.webp`
