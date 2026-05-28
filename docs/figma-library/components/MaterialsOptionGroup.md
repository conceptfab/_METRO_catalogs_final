# MaterialsOptionGroup

Group of selectable material/finish tiles (radio group). Source: [src/components/catalog/MaterialsOptionGroup.tsx](../../../src/components/catalog/MaterialsOptionGroup.tsx).

## Properties

| Figma property | Type    | Values                  | Source prop |
| -------------- | ------- | ----------------------- | ----------- |
| `variant`      | variant | `primary` / `secondary` | `variant` (default `secondary`) — controls title style |
| `title`        | text    |                         | rendered through QxText |

Each tile (sub-component) has its own props — see "OptionTile" below.

## Anatomy

```
group
├── title (h3)
│   ├── variant=primary:   text-style: qx-emphasis-title;  mb: 12
│   └── variant=secondary: text-style: section-text;       mb: 8;
│                          font-display, 18px, normal, color/foreground
└── radiogroup [flex-wrap, gap: 5]
    └── OptionTile × N
```

### OptionTile

Breakpoint-driven sizing — model in Figma as two size variants (`mobile` / `desktop`):

| Property | mobile (<sm) | desktop (sm+) |
| -------- | ------------ | ------------- |
| frame    | 80 × 104     | 116 × 156     |
| swatch   | 56 × 56      | 96 × 96       |
| swatch position | top center | top center |
| gap (swatch → label) | 6 | 8 |
| padding  | 6            | 6             |

| Tile state | Border                                            | Notes |
| ---------- | ------------------------------------------------- | ----- |
| default    | `border-transparent` (1px)                        | use a transparent stroke or no stroke + spacing |
| hover      | `border-foreground/50` (1px, color/foreground @ 50%) |    |
| selected   | `border-foreground` 2px + ring `0 0 0 2px rgba(0,0,0,0.18)` | radio aria-checked |
| focus-visible | outline 2px color/foreground offset 2px        |    |

**Prefers-contrast: more** — unchecked tiles get a real `border-foreground` 1px border (override in globals.css). Worth modelling as a separate "high-contrast" variant if your library serves the accessibility theme.

### Label

- Text style: `chip-label` (Lato 500, 11px / 12px on sm)
- Color: `color/foreground`
- Two lines: code (formatted, e.g. `RAL 9005`) + optional name

## Tokens used

- `color/background` (tile fill)
- `color/foreground` (border-selected, label, focus outline)
- `color/foreground` @ 50% (border-hover) — apply as 50% opacity stroke
- `text-style/qx-emphasis-title` (primary group title)
- `text-style/section-text` (secondary group title)
- `text-style/chip-label` (tile label)

## A11y

- `<h3>` with `id` linked via `aria-labelledby` on the `<div role="radiogroup">`
- Each tile: `role="radio"`, `aria-checked`, `tabIndex={selected ? 0 : -1}` (roving tabindex)
- Selected tile gets the outer ring + double-stroke to be visually distinct beyond color alone
