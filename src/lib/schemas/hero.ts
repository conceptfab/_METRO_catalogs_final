import { z } from 'zod';

const heroContentSchema = z.object({
  brandLabel: z.string().default(''),
  collectionName: z.string().default(''),
  tagline: z.string().default(''),
  taglineLine2: z.string().default(''),
  ctaLabel: z.string().default(''),
  heroImage: z.string().optional(),
  heroImageAlt: z.string().optional(),
  printCover: z
    .object({
      image: z.string(),
      alt: z.string().default(''),
    })
    .optional(),
});

type HeroContent = z.infer<typeof heroContentSchema>;

export function parseHeroContent(input: unknown): HeroContent {
  return heroContentSchema.parse(input);
}
