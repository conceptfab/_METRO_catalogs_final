import { describe, expect, it } from 'vitest';
import type { FeatureItem } from '@/types/catalog';
import { orderFeatureItems, orderFeatureVariants } from './feature-variant-order';

const titles = (vs: { title: string }[]) => vs.map((v) => v.title);

describe('orderFeatureVariants', () => {
  it('puts Single first, then Bench, then common', () => {
    const input = [
      { title: 'Bench — width 120–180 cm' },
      { title: 'Optional return desk' },
      { title: 'Single — height 64–84 cm' },
      { title: 'Bench — height 64–84 cm' },
      { title: 'Single — width 120–180 cm' },
    ];
    expect(titles(orderFeatureVariants(input))).toEqual([
      'Single — height 64–84 cm',
      'Single — width 120–180 cm',
      'Bench — width 120–180 cm',
      'Bench — height 64–84 cm',
      'Optional return desk',
    ]);
  });

  it('preserves authoring order within each group (stable)', () => {
    const input = [
      { title: 'Single — A' },
      { title: 'Single — B' },
      { title: 'Bench — A' },
      { title: 'Bench — B' },
    ];
    expect(titles(orderFeatureVariants(input))).toEqual([
      'Single — A',
      'Single — B',
      'Bench — A',
      'Bench — B',
    ]);
  });

  it('leaves prefix-less titles as common, in original order', () => {
    const input = [
      { title: 'Height 64–127 cm' },
      { title: 'Width 120–180 cm' },
      { title: 'Optional return desk' },
    ];
    expect(titles(orderFeatureVariants(input))).toEqual([
      'Height 64–127 cm',
      'Width 120–180 cm',
      'Optional return desk',
    ]);
  });
});

describe('orderFeatureItems', () => {
  it('reorders variants per item and leaves variant-less items untouched', () => {
    const items: FeatureItem[] = [
      {
        icon: 'layout-grid',
        title: 'Modular & scalable',
        desc: '',
        variants: [
          { title: 'Bench — depth 140–160 cm' },
          { title: 'Single — depth 70–80 cm' },
        ],
      },
      { icon: 'wrench', title: 'Quick & simple assembly', desc: '' },
    ];
    const out = orderFeatureItems(items);
    expect(titles(out[0].variants!)).toEqual([
      'Single — depth 70–80 cm',
      'Bench — depth 140–160 cm',
    ]);
    expect(out[1].variants).toBeUndefined();
  });
});
