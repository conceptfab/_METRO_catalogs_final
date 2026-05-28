# Lightbox

Modal image viewer with prev/next controls. Source: [src/components/catalog/Lightbox.tsx](../../../src/components/catalog/Lightbox.tsx).

## Properties

| Figma property | Type    | Values         | Notes |
| -------------- | ------- | -------------- | ----- |
| `image`        | swap    | image fill     | replaces the centered photo |
| `index`        | number  | e.g. `2`       | caption shows `Image {index+1} of {total}` |
| `total`        | number  |                | total count for caption |
| `alt`          | text    |                | caption descriptor |
| `showPrev`     | boolean | true / false   | hide on first image if you don't loop |
| `showNext`     | boolean | true / false   |                                       |

## Anatomy

```
dialog  [fixed inset-0; z-index: 80 (modal); bg: color/foreground @ 90%; backdrop-blur: 12px; padding: 16]
├── close       [absolute top-4 right-4; 44×44; icon: X 28; color: white @ 80% → white on hover]
├── prev        [absolute left-4 top-1/2; 44×44; icon: ChevronLeft 32]
├── next        [absolute right-4 top-1/2; 44×44; icon: ChevronRight 32]
├── image       [max-h: 85vh; max-w: 100%; radius: radius/lg; object-fit: contain]
└── counter     [absolute bottom-6 centered; text-style: chip-label; color: white @ 70%]
```

## Tokens used

- `color/foreground` (overlay, at 90% alpha)
- white @ 70% / 80% / 100% for controls (these are intentional fixed values — modal is always dark)
- `radius/lg` on the image
- `z/modal` (80)

## Motion

- enter / exit: opacity 0 ↔ 1
- image swap: opacity 0 + scale 0.95 → 1 + scale 1
- duration: ~200ms ease-out (`motion/accordion-down` works as a proxy)

## A11y

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby={counterId}`
- focus trap (custom `useFocusTrap` hook) — focus moves to Close button on open
- keyboard: `Esc` closes, `←` prev, `→` next
- backdrop click closes; control clicks stop propagation
- counter `<p>` is `aria-live="off"` (don't read on every nav step — alt is already in screen-reader output)
- focus outlines on controls: white, 2px, offset 2px (against the dark overlay)

## Mobile

Buttons keep 44×44 minimum touch target (WCAG AA). On small screens the prev/next stay anchored to side edges — consider whether the image min-height constraint needs adjustment in your Figma layout.
