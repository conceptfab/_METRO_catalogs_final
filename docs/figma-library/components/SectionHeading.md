# SectionHeading

Two-line heading block used at the top of every catalog section. Source: [src/components/catalog/SectionHeading.tsx](../../../src/components/catalog/SectionHeading.tsx).

## Properties

| Figma property | Type    | Notes |
| -------------- | ------- | ----- |
| `sectionLabel` | text    | small uppercase eyebrow (rendered via QxText) |
| `title`        | text    | main heading line 1 |
| `titleLine2`   | text    | optional heading line 2 (separated by `<br>`) |
| `showLine2`    | boolean | toggles visibility of `titleLine2` |
| `breakpoint`   | variant | `mobile` (<768) / `desktop` (≥768) — drives text-style selection |

## Anatomy

```
container
├── p .section_ID .font-display .uppercase
│   └── text-style: section-id-qx0 (desktop) | section-id-qx0-mobile (mobile)
└── h2 .section_Title .mt-8 .lg:mt-7 .font-display .font-normal
    ├── line 1 — text-style: section-title-qx0 (desktop) | section-title-qx0-mobile (mobile)
    └── line 2 (optional, preceded by <br/>) — same style as line 1
```

Spacing between eyebrow and title:
- `mobile`: margin-top 32 (`mt-8`)
- `desktop` (lg+): margin-top 28 (`lg:mt-7`)

## Tokens used

- `text-style/section-id-qx0` + `section-id-qx0-mobile`
- `text-style/section-title-qx0` + `section-title-qx0-mobile`
- color: `--section-id-color` = `#302d2d` desktop / `#1a1a1a` mobile (catalog-qx0 theme override) — recommend adding as a dedicated `color/section-id` token if SectionHeading expands beyond the qx0 catalogs
- `color/foreground` for the title (`--section-title-color: var(--foreground)`)

## QxText behaviour

Words matching `/^(?:Q[SX]|VR|TS|FM|FOTA|MRC(?:800|1000))$/i` (QS, QX, VR, TS, FM, FOTA, MRC800, MRC1000) get wrapped in `<span class="qx-word">` with:
- `letter-spacing: 0.04em`
- `font-weight: 600 (700 inside .hero-text)`
- `text-transform: uppercase`

Plus `\n`, `/n`, and `\\n` literals become `<br/>`.

Model as a Figma text style override applied to those substrings; or simpler — present designers with a property `emphasis-token` (e.g. `QX`) that toggles the override on a single span.

## A11y

`h2` id pattern: `{section-id}-title` — must match the `aria-labelledby` on the parent [`SectionShell`](./SectionShell.md).
