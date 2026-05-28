# ColorChip

Small swatch button used inside product code rows; opens a tooltip card on hover/focus. Source: [src/components/catalog/ColorChip.tsx](../../../src/components/catalog/ColorChip.tsx).

## Properties

| Figma property | Type    | Values                                | Notes |
| -------------- | ------- | ------------------------------------- | ----- |
| `variant`      | variant | `frame` / `top` / `body` / `hutch`    | only used for aria-label / tooltip title |
| `state`        | variant | `default` / `hover-focus`             | `hover-focus` shows the tooltip |
| `swatch`       | swap    | image fill                            | thumbnail from option |
| `code`         | text    | e.g. `RAL 9005`                       | auto-formatted (`RAL` prefix gets a space) |
| `label`        | text    | optional descriptive name             | second line in tooltip |

## Anatomy

```
button  [size: 44×44; padding: center 0; cursor: help]
└── swatch  [size: 24×24; border 1px color/foreground @ 60%; object-fit: cover]

tooltip (state=hover-focus)  [z-index: 90; absolute; bottom: button + 8]
└── card  [w: 116; bg: color/background; border 1px color/foreground; padding: 4; shadow: shadow/lg]
    ├── swatch-large  [w: full; aspect: 1; object-cover]
    └── caption  [mt: 8; px: 4; pb: 4; text-style: chip-label]
        ├── code      [block]
        └── name      [block, optional]
```

## Tokens used

- `color/foreground` (border, focus outline, text)
- `color/background` (tooltip bg)
- `color/foreground` @ alpha 60% on the small swatch border (apply as opacity on a fill)
- `shadow/lg`
- `text-style/chip-label` (tooltip caption)
- `z/tooltip` (90)

## Interaction & a11y

- Trigger: `mouseenter` / `focus` → open. `mouseleave` / `blur` / `Escape` → close.
- `aria-label="{variantLabel}: {code} {label}"`
- `aria-expanded` reflects tooltip state.
- Focus ring: `outline: 2px color/foreground; outline-offset: 2px`.
- Tooltip is `role="tooltip"`, `pointer-events: none`.

## Variants list (for tooltip label only)

`Frame`, `Top`, `Body`, `Hutch` — these come from the design and are not user-facing in the chip itself; they appear in screen-reader text and could be added to the tooltip caption if the column header ever needs reinforcement.
