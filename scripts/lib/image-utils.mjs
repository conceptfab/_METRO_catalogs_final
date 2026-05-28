/**
 * Wspólne helpery dla skryptów image-pipeline.
 * Importowane przez: process-images.mjs, recompress-gallery-bases.mjs, generate-thumbnails.mjs.
 */

import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Wylicza absolutne ścieżki ROOT i PUBLIC z perspektywy skryptu w `scripts/`.
 * Używaj tak: const { ROOT, PUBLIC } = pathsFromScript(import.meta.url);
 */
export function pathsFromScript(importMetaUrl) {
  const __dirname = path.dirname(fileURLToPath(importMetaUrl));
  const ROOT = path.resolve(__dirname, '..');
  const PUBLIC = path.join(ROOT, 'public');
  return { __dirname, ROOT, PUBLIC };
}

/**
 * Próbuje załadować `sharp`; przy błędzie wypisuje komunikat i exit(1).
 * Zwraca `sharp` (callable factory).
 */
export async function loadSharp() {
  try {
    const mod = await import('sharp');
    return mod.default;
  } catch {
    console.error('Error: sharp is not installed. Run: npm install --save-dev sharp');
    process.exit(1);
  }
}

/**
 * Predykat: czy plik `name` jest wariantem responsywnym (np. `hero_00-640w.webp`).
 */
export function isResponsiveVariant(name) {
  return /-\d+w\.webp$/i.test(name);
}
