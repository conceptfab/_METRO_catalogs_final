import Link from 'next/link';
import type { CatalogData } from '@/types/catalog';
import type { CatalogFooterEntry, GlobalConfig } from '@/lib/catalog-loader';

interface Props {
  catalog: CatalogData;
  globalConfig: GlobalConfig;
  footerEntries?: CatalogFooterEntry[];
}

export default function CatalogPagePlaceholder({ catalog, globalConfig }: Props) {
  return (
    <main className="mx-auto flex min-h-screen max-w-[1440px] flex-col px-6 py-16 sm:px-8">
      <header className="mb-12">
        <Link
          href="/"
          className="text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          ← {globalConfig.brandName}
        </Link>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-muted-foreground">
          {catalog.meta.collectionName}
        </p>
        <h1 className="mt-6 font-display text-5xl md:text-7xl">
          {catalog.meta.title}
        </h1>
        <p className="mt-6 max-w-full text-muted-foreground sm:max-w-xl">
          {catalog.meta.description}
        </p>
        <p className="mt-12 inline-block border border-border px-6 py-3 font-display text-xs uppercase tracking-widest text-muted-foreground">
          Layout in preparation
        </p>
      </section>

      <footer className="mt-12 text-xs uppercase tracking-widest text-muted-foreground/60">
        {globalConfig.footerText}{' '}
        <a
          href="https://conceptfab.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          CONCEPTFAB.COM
        </a>
      </footer>
    </main>
  );
}
