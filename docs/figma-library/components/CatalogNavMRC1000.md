# CatalogNavMRC1000

Catalog nav variant for MRC1000 product line. Source: [src/components/catalog/CatalogNavMRC1000.tsx](../../../src/components/catalog/CatalogNavMRC1000.tsx).

Same API and structure as [CatalogNavMRC800](./CatalogNavMRC800.md) — separate file in code, separate Figma component for parity. See [CatalogNav.md](./CatalogNav.md) for anatomy and tokens.

## Properties

| Figma property | Type    | Values                            | Source prop |
| -------------- | ------- | --------------------------------- | ----------- |
| `state`        | variant | `expanded` / `scrolled`           | scroll > 50 |
| `menu`         | variant | `desktop` / `mobile-closed` / `mobile-open` | breakpoint + isOpen |
| `logoOnly`     | boolean |                                   |             |
| `brandLabel`   | text    | default `"METRO"`                 |             |
| `brandLogoSrc` | swap    | image / none                      |             |
| `backToCatalogListHref` | boolean |                          |             |
