import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

async function isDirectory(absolutePath: string): Promise<boolean> {
  try {
    return (await stat(absolutePath)).isDirectory();
  } catch {
    return false;
  }
}

let catalogsPromise: Promise<string[]> | null = null;

function loadCatalogs(): Promise<string[]> {
  if (!catalogsPromise) {
    catalogsPromise = (async () => {
      const catalogsDir = path.join(process.cwd(), 'public', 'catalogs');
      const entries = await readdir(catalogsDir);
      const visibleEntries = entries.filter((entry) => !entry.startsWith('.'));
      const checks = await Promise.all(
        visibleEntries.map((entry) => isDirectory(path.join(catalogsDir, entry))),
      );
      return visibleEntries
        .filter((_, index) => checks[index])
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    })().catch((error) => {
      catalogsPromise = null;
      throw error;
    });
  }
  return catalogsPromise;
}

export async function GET() {
  try {
    const catalogs = await loadCatalogs();
    return NextResponse.json({ catalogs });
  } catch {
    return NextResponse.json({ catalogs: [] }, { status: 500 });
  }
}
