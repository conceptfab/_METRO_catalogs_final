# PdfDownloadButton

Floating action button for catalog PDF download. Source: [src/components/catalog/PdfDownloadButton.tsx](../../../src/components/catalog/PdfDownloadButton.tsx).

## Properties

| Figma property | Type | Notes |
| -------------- | ---- | ----- |
| `catalogId`    | text | drives href / filename; not user-visible |
| `state`        | variant: `default` / `hover` / `focus-visible` |

## Anatomy

```
anchor  [fixed bottom-6 right-6; z-index: 50; h: 44; min-w: 44; px: 16; gap: 8;
         bg: color/primary; color: color/primary-foreground; shadow: shadow/lg]
├── Download icon  [16×16, strokeWidth 2]
└── PdfFileIcon    [18×18, inline svg with "PDF" text inside, strokeWidth 2]
```

## States

| State           | Background                      | Notes |
| --------------- | ------------------------------- | ----- |
| default         | `color/primary`                 |       |
| hover           | `color/primary` @ 90% (apply 10% black overlay or 90% opacity) |       |
| focus-visible   | outline 2px `color/primary`, offset 2px |       |

## Tokens used

- `color/primary`, `color/primary-foreground`
- `shadow/lg`
- `z/sticky` is 40 but this component uses literal `z-50` — model as a custom layer above sticky (could be promoted to a new `z/fab` token, suggested = 50).

## Hide-on-print

Element has `print-hide` class. In Figma, model as a variant `print: visible / hidden` so the print preview frame can swap visibility.

## PdfFileIcon (inline SVG)

24×24 viewBox, stroke `currentColor`, weight 2; document outline + dog-ear + the word "PDF" baked in. Suitable for converting to a Figma component swap or icon set entry.
