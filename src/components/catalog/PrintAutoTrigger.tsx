'use client';

import { useEffect } from 'react';

/**
 * Mounted on /print routes. Adds body.print-preview class so the page
 * renders A4 boundaries (scaled down) on screen — without it the body
 * is 1920 × N×1358 tall and scrolls miles past the last page.
 *
 * Skipped when ?puppeteer=1 is set: the PDF generator needs the
 * un-scaled DOM so its viewport matches the print-page dimensions
 * exactly when page.pdf() rasterises.
 */
export default function PrintAutoTrigger() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('puppeteer') === '1') return;

    document.body.classList.add('print-preview');
    return () => {
      document.body.classList.remove('print-preview');
    };
  }, []);

  return null;
}
