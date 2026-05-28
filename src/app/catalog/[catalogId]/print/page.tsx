import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadCatalog, getCatalogList } from '@/lib/catalog-loader';
import CatalogPrintQX from '@/layouts/qx/CatalogPrintQX';
import CatalogPrintMRC800 from '@/layouts/mrc800/CatalogPrintMRC800';
import CatalogPrintMRC1000 from '@/layouts/mrc1000/CatalogPrintMRC1000';
import PrintAutoTrigger from '@/components/catalog/PrintAutoTrigger';
import PdfDownloadButton from '@/components/catalog/PdfDownloadButton';

export async function generateStaticParams() {
  const catalogs = await getCatalogList();
  return catalogs.map((catalog) => ({ catalogId: catalog.id }));
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Render fresh per request so random preview choices in FinishesPrintQX
// re-roll on every PDF generation (Puppeteer navigates to this URL each call).
export const dynamic = 'force-dynamic';

export default async function CatalogPrintPage({
  params,
}: {
  params: Promise<{ catalogId: string }>;
}) {
  const resolvedParams = await params;
  const catalog = await loadCatalog(resolvedParams.catalogId);

  if (!catalog) {
    notFound();
  }

  if (
    catalog.meta.layoutType !== 'qx' &&
    catalog.meta.layoutType !== 'mrc800' &&
    catalog.meta.layoutType !== 'mrc1000'
  ) {
    notFound();
  }

  const PrintLayout =
    catalog.meta.layoutType === 'mrc800'
      ? CatalogPrintMRC800
      : catalog.meta.layoutType === 'mrc1000'
        ? CatalogPrintMRC1000
        : CatalogPrintQX;

  return (
    <>
      <PrintLayout catalog={catalog} />
      <PrintAutoTrigger />
      {/* Visible when a user manually opens /print; hidden by .print-hide
       * during Puppeteer's page.pdf() because that uses @media print. */}
      <PdfDownloadButton catalogId={catalog.id} />
    </>
  );
}
