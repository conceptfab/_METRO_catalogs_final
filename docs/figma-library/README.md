# METRO Catalogs — Figma library starter kit

This folder is a **handoff package** for rebuilding the Next.js design system in a Figma library. It is not a Figma file — Figma can only be modified inside Figma. What you have here:

- [`tokens.json`](./tokens.json) — Tokens Studio format, ready to import as Figma Variables (light + dark)
- [`components/*.md`](./components) — per-component spec (props → Figma properties, anatomy, states, tokens, a11y)

Source of truth is the codebase. If a token changes here without changing [src/app/globals.css](../../src/app/globals.css) or [tailwind.config.ts](../../tailwind.config.ts), it's a bug.

---

## Importing tokens into Figma

Use the **Tokens Studio** plugin (free for token sync; paid for variable push).

1. Open your target Figma file → Plugins → run **Tokens Studio for Figma**
2. Plugin → Settings → **Set Storage Type** → **File** → upload `tokens.json` (or paste contents into the JSON tab)
3. Tokens Studio shows three sets: `core`, `light`, `dark`, `typography`
4. Create two **themes**:
   - **Light**: enable `core` + `light` + `typography`
   - **Dark**: enable `core` + `dark` + `typography`
5. Click **Sync** → **Update styles & variables** → choose Figma **Variables** (recommended over local styles)
6. Bind both modes (Light/Dark) on a single Variable Collection so designers can toggle via the layer panel

After sync, Figma will have:
- Color variables (per mode): `color/background`, `color/foreground`, `color/primary[/foreground]`, etc.
- Number variables: `radius/*`, `z/*`, `spacing/section-padding-*`
- Text styles: `text-style/heading-default`, `section-id-qx0`, `section-title-qx0`, `hero-text`, `nav-link`, `brand-wordmark`, `packshot-meta`, `chip-label`, `qx-emphasis-title`, `qx-item-title`, etc.
- Effects (shadows): `shadow/sm`, `shadow/md`, `shadow/lg`, `shadow/xl`

### Naming convention

Names match `--css-variables` 1:1 wherever possible. The point: when you (or future you) wire up Code Connect, Figma → Code mapping is mechanical.

```
CSS                            Figma                       Tailwind class
--background                   color/background            bg-background
--primary-foreground           color/primary-foreground    text-primary-foreground
--shadow-md                    shadow/md                   shadow-token-md
--radius                       radius/DEFAULT              rounded         (Tailwind reads var(--radius) directly)
```

---

## Rebuilding the components

The 10 components in [`components/`](./components):

| Component                                                  | Type      | Notes                                            |
| ---------------------------------------------------------- | --------- | ------------------------------------------------ |
| [CatalogNav](./components/CatalogNav.md)                   | component | 2 variants × scroll/menu states                  |
| [CatalogNavMRC800](./components/CatalogNavMRC800.md)       | component | own file in code; same anatomy as qx0 variant    |
| [CatalogNavMRC1000](./components/CatalogNavMRC1000.md)     | component | own file in code; same anatomy as qx0 variant    |
| [ColorChip](./components/ColorChip.md)                     | component | hover/focus tooltip                              |
| [Lightbox](./components/Lightbox.md)                       | component | modal w/ prev/next                               |
| [MaterialsOptionGroup](./components/MaterialsOptionGroup.md) | component | radio group; 2 title variants; tile sizes split mobile/desktop |
| [PdfDownloadButton](./components/PdfDownloadButton.md)     | component | FAB, hidden on print                             |
| [SectionHeading](./components/SectionHeading.md)           | component | eyebrow + title (+ optional line 2)              |
| [SectionShell](./components/SectionShell.md)               | component | wrapper; 5 bg variants                           |
| [CatalogPagePlaceholder](./components/CatalogPagePlaceholder.md) | template  | page-level frame, not an atom              |

**Suggested order to build:**

1. Tokens → Variables (above)
2. Text styles (from `typography.text-style`)
3. `SectionShell` (foundation for layouts)
4. `SectionHeading` (used inside every Shell)
5. `CatalogNav` + variants
6. `MaterialsOptionGroup` (component + nested OptionTile)
7. `ColorChip`, `PdfDownloadButton`, `Lightbox` (atoms)
8. `CatalogPagePlaceholder` (template — last, depends on the rest)

---

## Helpers that are NOT Figma components

These exist in `src/components/catalog/` but are runtime utilities, not visual components:

- `QxText` — string-renderer that wraps tokens (`QX`, `QS`, `MRC800`, …) in `<span class="qx-word">` and converts `\n` to `<br/>`. In Figma, model the `qx-word` styling as a **selectable text style override** applied to those substrings inside any other text.
- `CatalogMotion` — Framer Motion provider
- `PrintImage` — Next/Image wrapper for print
- `PrintAutoTrigger` — triggers `window.print()` on mount
- `WebMcpProvider` — context provider for MCP server

---

## Maintenance

When code changes:

| Change in code                  | Update here                                  |
| ------------------------------- | -------------------------------------------- |
| New color variable in globals.css | add to `tokens.json` → re-sync via Tokens Studio |
| New component prop                | update the relevant `.md` table              |
| Renamed component                | rename `.md` file + update links in this README |

Owner: anyone touching `src/components/catalog/` or `src/app/globals.css` should keep this folder in sync. Treat it like an API contract.

---

## Known gaps / suggested cleanups

Things noted while extracting the system that aren't fixes here, just observations for later:

- `CatalogNavMRC800` / `MRC1000` are near-duplicates of `CatalogNav variant=qx0` — if they don't diverge soon, collapse into one component with a `variant` prop.
- The `PdfDownloadButton` uses literal `z-50` instead of a token. Consider adding `--z-fab: 50` if there will be more floating elements.
- The 1024+ breakpoint sets `px-0` on `SectionShell`'s inner container — relies on the outer page providing padding. Worth documenting (or tokenising as `container-padding`).
- `--font-display`, `--font-body`, `--font-qx` all resolve to Lato today. If they should diverge in the future, keep the three font-family tokens in this kit even though their values are identical now.
- `:focus-visible` outline (`3px solid var(--ring)` global) doesn't match every component's per-element focus ring (most use 2px `outline-foreground`). Worth aligning or documenting which contexts use which.
- `prefers-contrast: more` overrides exist for `MaterialsOptionGroup`. Currently the only component honouring high-contrast mode — worth deciding whether other tile/chip components should follow.
