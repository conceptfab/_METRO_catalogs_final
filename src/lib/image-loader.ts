import responsiveImageManifest from '@/generated/responsive-image-manifest.json';

const MANIFEST = responsiveImageManifest as Record<string, number[]>;

interface LoaderArgs {
  src: string;
  width: number;
}

export default function imageLoader({ src, width }: LoaderArgs): string {
  if (src.startsWith('http') || src.endsWith('.svg')) return src;
  if (/-\d+w\.\w+$/.test(src)) return src;

  const generated = MANIFEST[src];
  if (!generated || generated.length === 0) return src;

  const sorted = generated.toSorted((a, b) => a - b);
  const fit = sorted.find((w) => w >= width) ?? sorted[sorted.length - 1];

  const dotIndex = src.lastIndexOf('.');
  if (dotIndex === -1) return src;
  return `${src.slice(0, dotIndex)}-${fit}w${src.slice(dotIndex)}`;
}
