# CatalogNavMRC800

Catalog nav variant for MRC800 product line. Source: [src/components/catalog/CatalogNavMRC800.tsx](../../../src/components/catalog/CatalogNavMRC800.tsx).

Structurally a separate component (its own file, own state machine) but shares the API and section list of [CatalogNav](./CatalogNav.md). In Figma, model as a sibling component (don't merge into CatalogNav variants — they evolve independently in code).

## Properties

Same props as `CatalogNav` except `variant` is omitted (this IS the variant).

| Figma property | Type    | Values                            | Source prop |
| -------------- | ------- | --------------------------------- | ----------- |
| `state`        | variant | `expanded` / `scrolled`           | scroll > 50 |
| `menu`         | variant | `desktop` / `mobile-closed` / `mobile-open` | breakpoint + isOpen |
| `logoOnly`     | boolean |                                   | `logoOnly`  |
| `brandLabel`   | text    | default `"METRO"`                 | `brandLabel`|
| `brandLogoSrc` | swap    | image / none                      |             |
| `backToCatalogListHref` | boolean |                          |             |

## Anatomy & states

Identical anatomy to `CatalogNav variant=qx0` (zero radius, surface-elevated when scrolled, 44/56 heights). Read CatalogNav.md anatomy section and apply identically. Use the same tokens for color/shadow/typography — the only reason for a separate Figma component is **future divergence** as the MRC800 layout evolves.

If anatomy converges with CatalogNav permanently, collapse into one component with `variant: default | qx0 | mrc800 | mrc1000`.
