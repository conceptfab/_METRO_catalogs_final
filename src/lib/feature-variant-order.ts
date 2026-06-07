import type { FeatureItem, FeatureVariant } from '@/types/catalog';

/**
 * Canonical ordering for Features variants:
 *   1. Single desk variants  (title starts with "Single")
 *   2. Bench variants        (title starts with "Bench")
 *   3. Shared / common ones   (everything else, e.g. "Optional return desk")
 *
 * Within each group the original authoring order is preserved (stable sort),
 * so editors only control intra-group order; Single-before-Bench-before-common
 * is enforced here regardless of how content.json is written.
 */
function variantGroupRank(title: string): number {
  const t = title.trim().toLowerCase();
  if (t.startsWith('single')) return 0;
  if (t.startsWith('bench')) return 1;
  return 2;
}

export function orderFeatureVariants<T extends FeatureVariant>(variants: T[]): T[] {
  return variants
    .map((variant, index) => ({ variant, index }))
    .sort(
      (a, b) =>
        variantGroupRank(a.variant.title) - variantGroupRank(b.variant.title) ||
        a.index - b.index,
    )
    .map(({ variant }) => variant);
}

/** Returns items with their variants reordered Single → Bench → common. */
export function orderFeatureItems(items: FeatureItem[]): FeatureItem[] {
  return items.map((item) =>
    item.variants && item.variants.length > 0
      ? { ...item, variants: orderFeatureVariants(item.variants) }
      : item,
  );
}
