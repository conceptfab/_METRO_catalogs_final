# SectionShell

Section wrapper providing consistent background, max-width container, and a11y labelling. Source: [src/components/catalog/SectionShell.tsx](../../../src/components/catalog/SectionShell.tsx).

## Properties

| Figma property | Type    | Notes |
| -------------- | ------- | ----- |
| `id`           | text    | section anchor — used by CatalogNav and aria-labelledby |
| `bg`           | variant | `surface-elevated` (default) / `surface` / `warm-light` / `background` / `catalog-footer` / custom |
| `padding`      | variant | `default` / `tight` (override `innerClassName`) |

## Anatomy

```
section  [bg: color/surface-elevated (default); aria-labelledby={id}-title OR aria-label]
└── container  [mx-auto; max-w: 1440; px: 20 → sm: 32 → lg: 0;
                pt: 24 → sm: 32;  pb: 48]
    └── slot (children)
```

## Padding spec (default `innerClassName`)

| Breakpoint | padding-x | padding-top | padding-bottom |
| ---------- | --------- | ----------- | -------------- |
| <640       | 20        | 24          | 48             |
| 640–1024   | 32        | 32          | 48             |
| 1024+      | 0         | 32          | 48             |

The 1024+ "px: 0" assumes the container's outer parent provides horizontal padding. Worth verifying in Figma — if the section sits at viewport edge, restore `px: 32` or rely on the page-level container.

## Tokens used

- `color/surface-elevated` (default bg)
- alternate bgs via property: `color/surface`, `color/warm-light`, `color/background`, `color/catalog-footer-background`

## A11y

- If `label` prop is provided → `aria-label="{label}"`
- Else → `aria-labelledby="{id}-title"` (expects a child `<h2 id="{id}-title">`, typically from [`SectionHeading`](./SectionHeading.md))
- Scroll anchor: `id="{id}"` matches the section IDs used by CatalogNav (`cover`, `overview`, `gallery`, `finishes`, `packshots`, `dimensions`, `materials`, `features`, `getting-started`)

## QX scroll-margin

When wrapped in `.catalog-qx0`, sections inherit `scroll-margin-top: 56px` so anchor navigation lands below the fixed nav. Model as a "scroll target offset" annotation on the section in Figma docs (Figma itself doesn't render this, but designers should know it exists).
