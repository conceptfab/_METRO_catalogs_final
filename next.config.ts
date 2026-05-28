import type { NextConfig } from 'next';
import {
  PHASE_PRODUCTION_BUILD,
  PHASE_PRODUCTION_SERVER,
} from 'next/constants';

const DEFAULT_DIST_DIR = '.next';
const LOCAL_ISOLATED_PROD_DIST_DIR = '.next-build';
const HOMEPAGE_AGENT_LINKS = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"; profile="https://www.rfc-editor.org/info/rfc9727"',
  '</api/catalogs>; rel="service-desc"; type="application/json"',
].join(', ');

export default function nextConfig(phase: string): NextConfig {
  const isProdPhase =
    phase === PHASE_PRODUCTION_BUILD || phase === PHASE_PRODUCTION_SERVER;
  const isVercel = process.env.VERCEL === '1';
  const useLocalIsolatedProdDist =
    isProdPhase &&
    !isVercel &&
    process.env.NEXT_LOCAL_ISOLATED_DIST === '1';

  return {
    distDir: useLocalIsolatedProdDist
      ? LOCAL_ISOLATED_PROD_DIST_DIR
      : DEFAULT_DIST_DIR,
    // Keep puppeteer + chromium binary out of the function bundle so Vercel
    // can use the native serverless deps it ships with @sparticuz/chromium.
    serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
    // public/catalogs/** is large (200+ MB of WebP/MP4/PDF assets) and is served
    // as static files — it must not be traced into serverless function bundles
    // or each function exceeds Vercel's 250 MB unzipped limit.
    outputFileTracingExcludes: {
      '*': ['public/catalogs/**/*', 'public/shared/**/*'],
    },
    experimental: {
      optimizePackageImports: ['lucide-react', 'framer-motion'],
      reactCompiler: true,
    },
    images: {
      loader: 'custom',
      // Used by next/image to resolve pre-generated responsive variants.
      loaderFile: './src/lib/image-loader.ts',
    },
    compiler: {
      removeConsole: isProdPhase
        ? { exclude: ['error', 'warn'] }
        : false,
    },
    async headers() {
      return [
        {
          source: '/',
          headers: [
            {
              key: 'Link',
              value: HOMEPAGE_AGENT_LINKS,
            },
          ],
        },
      ];
    },
  };
}
