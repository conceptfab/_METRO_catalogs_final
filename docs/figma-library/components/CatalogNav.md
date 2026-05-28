# CatalogNav

Top sticky nav with section anchor links. Source: [src/components/catalog/CatalogNav.tsx](../../../src/components/catalog/CatalogNav.tsx).

## Variants & properties

| Figma property | Type    | Values                                 | Source prop / behaviour |
| -------------- | ------- | -------------------------------------- | ----------------------- |
| `variant`      | variant | `default` / `qx0`                      | `variant` prop |
| `state`       | variant | `expanded` / `scrolled`                | scroll > 50px → `scrolled` |
| `menu`        | variant | `desktop` / `mobile-closed` / `mobile-open` | breakpoint + `isOpen` |
| `logoOnly`    | boolean | true / false                           | hides section links |
| `brandLabel`  | text    |                                        | default `"METRO"` |
| `brandLogoSrc`| swap    | image / none                           | replaces text wordmark |
| `backToCatalogListHref` | boolean | true / false             | renders as `<a>` instead of button |

## Anatomy (variant=default, expanded)

```
nav  [position: fixed; top: 0; w: 100%; z-index: 60]
└── container  [max-w: 1440px; px: 24 (sm: 32)]
    └── row  [h: 56 desktop / lg: 166 when expanded → lg: 56 when scrolled]
        ├── BrandControl
        │   └── wordmark "METRO"  | text-style: brand-wordmark
        ├── desktop link list [hidden <lg; max-w: 1150]
        │   └── ul · flex
        │       └── li (per section) · flex-1
        │           └── button [border-b-2; px: 12; py: 8]
        │               ├── inactive: border-transparent, color-muted-foreground
        │               └── active:   border-foreground,   color-foreground, font-bold
        └── mobile toggle button [hidden lg+, p: 8, icon: Menu/X 24px]
```

## Anatomy (variant=qx0, scrolled)

Differences vs default:
- bg switches from `bg-gradient-to-b from-black/15 to-transparent` → `bg-surface-elevated`
- shadow: `0 8px 24px rgba(0,0,0,0.08)` (= `shadow/md` token in dark mode; in light it's `shadow/lg`)
- nav height collapses to 44 (mobile) / 56 (sm+) / 56 (lg, scrolled)
- link list: no bottom border (uses `catalog-nav-link` class); on active `font-bold !text-foreground`
- mobile icon size: 36px (vs 24px in default)
- all radii overridden to `0` (`!rounded-none`)

## States

| State                  | Background                                          | Shadow              | Text color          |
| ---------------------- | --------------------------------------------------- | ------------------- | ------------------- |
| top-of-page (expanded) | `linear-gradient(to bottom, rgba(0,0,0,0.15), transparent)` | none                | depends on hero     |
| scrolled               | `color/surface-elevated`                            | `shadow/md` (custom: `0 8px 24px rgba(0,0,0,0.08)`) | `color/foreground` |
| mobile menu open       | `color/surface-elevated`                            | `shadow/md`         | `color/foreground` |

Link states:
- default: `color/muted-foreground`
- hover: `color/foreground` + `border-foreground` (default variant)
- active (`aria-current="location"`): `color/foreground`, `font-weight: 700`, border-foreground (default) / no border (qx0)
- focus-visible: `outline: 2px color/foreground; outline-offset: 2px`

## Accessibility

- `<nav aria-label="Catalog sections">`
- Mobile toggle: `aria-expanded`, `aria-label="Open menu" | "Close menu"`
- Active link: `aria-current="location"`
- Cover section is excluded from "active" highlighting

## Mobile drawer (AnimatePresence)

- enter: `opacity 0 → 1`, `y: -20 → 0`
- exit:  reverse
- duration: `motion/accordion-down` (200ms ease-out) is a good Figma proxy

## Default sections

`Cover, Overview, Looks (gallery), Finishes, Models (packshots), Specs (dimensions), Build (materials), Tech (features), Getting Started`

## Build notes

- The `QxText` helper wraps tokens like `QX`, `QS`, `MRC800` in `<span class="qx-word">` with `letter-spacing: 0.04em; font-weight: 600; text-transform: uppercase`. In Figma, model these as a separate "qx-word" text style and apply selectively.
- Variants for MRC800 and MRC1000 are separate components — see [CatalogNavMRC800.md](./CatalogNavMRC800.md) and [CatalogNavMRC1000.md](./CatalogNavMRC1000.md).
