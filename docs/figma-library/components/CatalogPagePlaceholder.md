# CatalogPagePlaceholder

Empty-state / placeholder page shown when a catalog hasn't been built out yet. Source: [src/components/catalog/CatalogPagePlaceholder.tsx](../../../src/components/catalog/CatalogPagePlaceholder.tsx).

This is a **page-level template**, not a reusable atom. In Figma, model as a *page frame* in the templates section of the library rather than a component.

## Properties

| Figma property | Type | Notes |
| -------------- | ---- | ----- |
| `brandName`        | text | back-link label, e.g. `← METRO` |
| `collectionName`   | text | eyebrow |
| `title`            | text | catalog title (display, 5xl → md:7xl) |
| `description`      | text | muted body copy |

## Anatomy

```
main  [mx-auto; max-w: 1440; min-h: 100vh; flex-col; px: 24 (sm: 32); py: 64]
├── header  [mb: 48]
│   └── back-link
│       text-style: label-tight, color/muted-foreground
│       hover: color/foreground
└── section  [flex-1; flex-col; centered; text-center]
    ├── eyebrow   (collectionName)
    │   font-display, text-sm, uppercase, letter-spacing: 0.3em (label-extra-wide)
    │   color: color/muted-foreground
    ├── h1        (title)
    │   font-display, text-5xl (md: text-7xl), mt: 24
    ├── body      (description)
    │   color: color/muted-foreground, max-w: prose, mt: 24
    └── (optional footer slot)
```

## Tokens used

- `color/muted-foreground`, `color/foreground`
- `text-style/label-tight` / `text-style/label-extra-wide`
- container max-width pattern (1440 / 1440 / 100%): repeated across the system — consider promoting `container-max` as a token (`1440`).
