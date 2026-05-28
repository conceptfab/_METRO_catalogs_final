import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ColorChip } from '@/components/catalog/ColorChip';
import { SectionShell } from '@/components/catalog/SectionShell';
import { SectionHeading } from '@/components/catalog/SectionHeading';
import { QxText } from '@/components/catalog/QxText';
import { colorTokens } from '@/lib/design-tokens';

export const metadata: Metadata = {
  title: 'METRO Design System',
  description:
    'Tokeny, komponenty, wzorce, layouty i schematy używane w katalogach METRO oraz planowane do wdrożenia.',
};

/* ================================================================ */
/*  DATA                                                            */
/* ================================================================ */

const COLOR_GROUPS: Array<{ heading: string; codes: string[] }> = [
  {
    heading: 'Powierzchnie',
    codes: [
      '--background',
      '--card',
      '--popover',
      '--surface',
      '--surface-elevated',
      '--warm-light',
      '--catalog-footer-background',
      '--hero-overlay',
    ],
  },
  {
    heading: 'Tekst',
    codes: [
      '--foreground',
      '--card-foreground',
      '--popover-foreground',
      '--muted-foreground',
      '--on-dark',
      '--on-dark-muted',
      '--on-dark-subtle',
    ],
  },
  {
    heading: 'Akcent · brand',
    codes: [
      '--primary',
      '--primary-foreground',
      '--secondary',
      '--secondary-foreground',
      '--accent',
      '--accent-foreground',
      '--muted',
    ],
  },
  {
    heading: 'Status',
    codes: [
      '--success',
      '--info',
      '--warning',
      '--warning-foreground',
      '--destructive',
      '--destructive-foreground',
    ],
  },
  {
    heading: 'Tabele produktowe',
    codes: [
      '--product-table-header',
      '--product-table-muted',
      '--product-table-text',
    ],
  },
  {
    heading: 'Wykresy',
    codes: ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'],
  },
  {
    heading: 'Pola · linie · focus',
    codes: ['--border', '--input', '--ring'],
  },
];

const SHADOW_TOKENS = [
  { name: 'shadow-token-sm', cssVar: '--shadow-sm', usage: 'Karty pasywne, separacja warstw bez akcji.' },
  { name: 'shadow-token-md', cssVar: '--shadow-md', usage: 'Domyślny cień dla popoverów i menu.' },
  { name: 'shadow-token-lg', cssVar: '--shadow-lg', usage: 'Tooltipy, swatch hovery, ColorChip preview.' },
  { name: 'shadow-token-xl', cssVar: '--shadow-xl', usage: 'Modale, lightbox, najwyższe powierzchnie.' },
];

const Z_INDEX_TOKENS = [
  { name: 'z-base', value: '0', usage: 'Domyślna warstwa kontentu.' },
  { name: 'z-dropdown', value: '30', usage: 'Menu, listy rozwijane.' },
  { name: 'z-sticky', value: '40', usage: 'Sticky nav, sticky header.' },
  { name: 'z-modal', value: '80', usage: 'Lightbox, dialogi blokujące.' },
  { name: 'z-popover', value: '60', usage: 'Popovery i hovercardy.' },
  { name: 'z-tooltip', value: '90', usage: 'Tooltipy ColorChip, hint na ikony.' },
];

const TYPOGRAPHY_SAMPLES = [
  {
    label: '.section_Title',
    description: '46px (lg) · weight 400 · letter-spacing 0.03em',
    source: 'globals.css · .catalog-qx0 .section_Title',
    render: (
      <h3 className="section_Title font-display font-normal">
        <QxText text="Sekcja /n QX" />
      </h3>
    ),
  },
  {
    label: '.section_ID',
    description: '18px · weight 700 · uppercase',
    source: 'globals.css · .catalog-qx0 .section_ID',
    render: (
      <p className="section_ID font-display uppercase">
        Models
      </p>
    ),
  },
  {
    label: '.sec_main_text',
    description: '18px · weight 400 · line-height 1.5',
    source: 'globals.css · .catalog-qx0 .sec_main_text',
    render: (
      <p className="sec_main_text max-w-[44ch]">
        Akapit treści sekcji: opis kolekcji, parametrów lub wprowadzenia. Trzyma się szerokości czytelnej.
      </p>
    ),
  },
  {
    label: '.qx-emphasis-title',
    description: '20px · weight 500 · uppercase · -0.025em',
    source: 'globals.css',
    render: <p className="qx-emphasis-title">Akcent</p>,
  },
  {
    label: '.qx-item-title',
    description: '18px · weight 700 · 0.03em',
    source: 'globals.css',
    render: <p className="qx-item-title">QX11 / RAL 9005 / W240</p>,
  },
  {
    label: '.hero-text',
    description: '2.4rem · weight 300 · uppercase · #a6a09f',
    source: 'globals.css',
    render: (
      <p className="hero-text">
        <QxText text="QX Modular desk system" />
      </p>
    ),
  },
  {
    label: '.qx-word',
    description: 'Inline emphasis na słowie QX: weight 600',
    source: 'globals.css',
    render: (
      <p className="font-display text-2xl">
        Kolekcja <span className="qx-word">QX</span> Modular
      </p>
    ),
  },
  {
    label: '.label-tight',
    description: 'letter-spacing 0.1em · uppercase',
    source: 'globals.css',
    render: <p className="label-tight text-sm">Tight label</p>,
  },
  {
    label: '.label-wide',
    description: 'letter-spacing 0.14em · uppercase',
    source: 'globals.css',
    render: <p className="label-wide text-sm">Wide label</p>,
  },
  {
    label: '.label-extra-wide',
    description: 'letter-spacing 0.3em · uppercase',
    source: 'globals.css',
    render: <p className="label-extra-wide text-sm">Extra wide label</p>,
  },
];

const PACKSHOT_DEMO = {
  image: '/catalogs/QX/packshots/QX11_W240_black__Shot_A__4K_R10.webp',
  alt: 'QX11 desk packshot: black frame, natural oak top',
  code: 'QX11',
  frameOption: {
    id: 'frame-ral9005',
    code: 'RAL9005',
    label: 'RAL 9005 Jet Black',
    image: '/shared/materials/RAL 9005.webp',
    thumbnail: '/shared/materials/RAL 9005_thumb.webp',
  },
  topOption: {
    id: 'desktop-w240',
    code: 'W240',
    label: 'W240 Natural Oak',
    image: '/shared/materials/W240 NATURAL OAK.webp',
    thumbnail: '/shared/materials/W240 NATURAL OAK_thumb.webp',
  },
};

const SHARED_COMPONENTS = [
  {
    name: 'ColorChip',
    source: 'src/components/catalog/ColorChip.tsx',
    description:
      '24×24 swatch z tooltipem na hover. Pokazuje kod (RAL/U/W), nazwę i zdjęcie próbki. Używany w packshot-meta.',
  },
  {
    name: 'Lightbox',
    source: 'src/components/catalog/Lightbox.tsx',
    description:
      'Pełnoekranowy viewer obrazów. Sterowanie: ←/→, Esc, focus trap. AnimatePresence + framer-motion.',
  },
  {
    name: 'SectionShell',
    source: 'src/components/catalog/SectionShell.tsx',
    description:
      'Wrapper sekcji: <section> + max-w-[1440px] + responsive padding + aria-labelledby. Domyślne tło bg-surface-elevated.',
  },
  {
    name: 'SectionHeading',
    source: 'src/components/catalog/SectionHeading.tsx',
    description:
      'Para .section_ID (label) + .section_Title (heading) z opcjonalnym titleLine2. Używa QxText.',
  },
  {
    name: 'MaterialsOptionGroup',
    source: 'src/components/catalog/MaterialsOptionGroup.tsx',
    description:
      'Siatka swatchy 7.25rem × 9.75rem z aria-pressed, hover scale 1.05. Bazuje na MaterialsConfiguratorOption.',
  },
  {
    name: 'CatalogNav',
    source: 'src/components/catalog/CatalogNav.tsx',
    description:
      'Nav katalogu (QX family — QX/QS/VR/TS/FM/FOTA): desktop z linkami sekcji + mobile burger menu. Smooth scroll, aria-current, RAF scroll spy. Brand label używa text-foreground.',
  },
  {
    name: 'CatalogNavMRC800',
    source: 'src/components/catalog/CatalogNavMRC800.tsx',
    description:
      'Wariant CatalogNav dla MRC800. Domyślne sekcje: Cover/Overview/Looks/Finishes/Models/Specs/Build/Tech/Getting Started. Renderowany w CatalogPageMRC800.',
  },
  {
    name: 'CatalogNavMRC1000',
    source: 'src/components/catalog/CatalogNavMRC1000.tsx',
    description:
      'Wariant CatalogNav dla MRC1000 — analog CatalogNavMRC800 z tymi samymi sekcjami. Renderowany w CatalogPageMRC1000.',
  },
  {
    name: 'CatalogMotion',
    source: 'src/components/catalog/CatalogMotion.tsx',
    description:
      'MotionConfig wrapper z globalną skalą czasu ×2 (catalog-motion-slow). Honoruje prefers-reduced-motion.',
  },
  {
    name: 'QxText',
    source: 'src/components/catalog/QxText.tsx',
    description:
      'Tokenizer tekstu: \\bQX\\b → <span class="qx-word">, /n + \\n → <br />. Używany przez wszystkie sekcje QX.',
  },
  {
    name: 'PdfDownloadButton',
    source: 'src/components/catalog/PdfDownloadButton.tsx',
    description:
      'Floating CTA (bottom-6 right-6, z-50) z Lucide Download + niestandardową ikoną PDF. Linkuje do /catalogs/{ID}/Download/metro-{id}.pdf z atrybutem download. Klasa print-hide chowa go w wydruku. Hit-area 44×44 (WCAG 2.5.5). Renderowany w CatalogPageQX, CatalogPageMRC800 i print routes.',
  },
  {
    name: 'PrintAutoTrigger',
    source: 'src/components/catalog/PrintAutoTrigger.tsx',
    description:
      'Client-only, mountowany w /print routes. Dodaje body.print-preview by pokazać A4 boundaries na ekranie. Skipowany gdy ?puppeteer=1 — generator PDF potrzebuje DOM bez zoom-skali.',
  },
  {
    name: 'PrintImage',
    source: 'src/components/catalog/PrintImage.tsx',
    description:
      'Wspólny wrapper next/image dla print/PDF: fill + eager + unoptimized, żeby zachować bezpośrednie publiczne src i klasy object-fit z print.css.',
  },
  {
    name: 'CatalogPagePlaceholder',
    source: 'src/components/catalog/CatalogPagePlaceholder.tsx',
    description:
      'Fallback dla layoutType "type2" / "type3" — tytuł, opis, badge "Layout in preparation" + footer z CONCEPTFAB.COM. Używany przez layoutMap zanim powstanie dedykowany template.',
  },
  {
    name: 'WebMcpProvider',
    source: 'src/components/catalog/WebMcpProvider.tsx',
    description:
      'Client-only. Rejestruje narzędzia MCP w window.modelContext (chrome.ai / WebMCP). Pozwala agentowi przeglądarkowemu odpytywać aktualną stronę katalogu (readOnly tools, untrustedContentHint). Mounted globalnie w layout.tsx.',
  },
];

const FEATURED_SHARED_COMPONENTS = new Set([
  'ColorChip',
  'SectionShell',
  'SectionHeading',
]);
const SUPPORTING_SHARED_COMPONENTS = SHARED_COMPONENTS.filter(
  (component) => !FEATURED_SHARED_COMPONENTS.has(component.name),
);

const QX_LAYOUTS = [
  { name: 'HeroQX', file: 'src/layouts/qx/HeroQX.tsx', desc: 'Pełnoekranowy slider z auto-advance i klawiaturą; hero używa sizes 100vw (pełnoekranowy object-cover). CTA arrow ma subtelny hover translate zamiast ciągłego bounce. Per-slide overrides: textStyle, mobileTextStyle, mobileContentLayout, mobileImageOffsetX (CSS custom props).' },
  { name: 'OverviewQX', file: 'src/layouts/qx/OverviewQX.tsx', desc: 'Dwukolumnowy: tekst + packshot. Reveal SLIDE.' },
  { name: 'GalleryQX', file: 'src/layouts/qx/GalleryQX.tsx', desc: 'Desktop: siatka 4 obrazów + Lightbox. Mobile: horizontal scroll-snap carousel z naturalnym aspect-ratio (bez kropowania). Reveal LIFT.' },
  { name: 'FeaturesQX', file: 'src/layouts/qx/FeaturesQX.tsx', desc: 'Zakładki z ikonami Lucide + autoplay video; mobile pokazuje animację nad tabami. Reveal SLIDE. Opcjonalne variants[]: gdy feature ma sub-warianty, tab pokazuje + → × (rotate 45°), rozwija role="group" z listą buttonów (aria-pressed) — przełączają wideo bez zmiany taba. Variant 0 ładuje się przy zmianie taba.' },
  { name: 'GettingStartedQX', file: 'src/layouts/qx/GettingStartedQX.tsx', desc: '3-kolumnowe kroki montażu z hover scale. Reveal LIFT.' },
  { name: 'PackshotsQX', file: 'src/layouts/qx/PackshotsQX.tsx', desc: 'Modele z ColorChip frame+top; mobile full-bleed do krawędzi ekranu (negative margin) + powiększony kadr inline; desktop ma lightbox renderowany poza #packshots. Reveal SLIDE. FM ma własny PackshotsFM (chip "Decor" zamiast "Top", bez "Frame").' },
  { name: 'MaterialsQX', file: 'src/layouts/qx/MaterialsQX.tsx', desc: 'Biblioteka swatchy desktop+mobile. FOTA: preview configuratora kadrowany przez `.catalog-id-fota #materials .materials-configurator-preview-layer` (translate 7% + scale 1.24, overflow hidden). Reveal SETTLE. FM ma własny MaterialsFM (nagłówek "Decor", frame zawężony do RAL 9006).' },
  { name: 'FinishesQX', file: 'src/layouts/qx/FinishesQX.tsx', desc: 'Konfigurator + preview toggle. Dla FOTA obraz preview (inline + modal) skalowany do 115% przy stałym kontenerze. Reveal SETTLE. FM ma własny FinishesFM (nagłówek "Decor", Steel parts colors zawężone do RAL 9006).' },
  { name: 'DimensionsQX', file: 'src/layouts/qx/DimensionsQX.tsx', desc: 'Diagram + tabela specyfikacji. Reveal LIFT.' },
  { name: 'ProductCodesQX', file: 'src/layouts/qx/ProductCodesQX.tsx', desc: '3 tabele kodów (single/bench/manager) z subgrid. Nagłówki grup używają font-semibold. Reveal SETTLE.' },
  { name: 'CatalogPageQX', file: 'src/layouts/qx/CatalogPageQX.tsx', desc: 'Orchestrator: 11 sekcji w kolejności + theme scope. Renderuje PdfDownloadButton na końcu.' },
];

const MRC800_LAYOUTS = [
  { name: 'HeroMRC800', file: 'src/layouts/mrc800/HeroMRC800.tsx', desc: 'Hero kolekcji recepcji — analog HeroQX, dedykowany dla MRC800.' },
  { name: 'OverviewMRC800', file: 'src/layouts/mrc800/OverviewMRC800.tsx', desc: 'Dwukolumnowy overview MRC800. Reveal SLIDE.' },
  { name: 'GalleryMRC800', file: 'src/layouts/mrc800/GalleryMRC800.tsx', desc: 'Galeria kompozycji recepcyjnych z Lightbox. Reveal LIFT.' },
  { name: 'ArrangementsMRC800', file: 'src/layouts/mrc800/ArrangementsMRC800.tsx', desc: 'Wzorcowe aranżacje recepcji — siatka 2×2 z fallback-placeholderami gdy katalog nie ma arrangements. Reveal LIFT. Renderowana przez CatalogPageMRC800 między Gallery a Packshots. Podpisy pod kafelkami używają wzorca qx-packshot-meta / qx-packshot-code (ujednolicone z PackshotsMRC800).' },
  { name: 'FeaturesMRC800', file: 'src/layouts/mrc800/FeaturesMRC800.tsx', desc: 'Features tabbar + video; analog FeaturesQX.' },
  { name: 'GettingStartedMRC800', file: 'src/layouts/mrc800/GettingStartedMRC800.tsx', desc: 'Kroki montażu recepcji. Reveal LIFT.' },
  { name: 'PackshotsMRC800', file: 'src/layouts/mrc800/PackshotsMRC800.tsx', desc: 'Modele recepcji z ColorChip + Lightbox.' },
  { name: 'MaterialsMRC800', file: 'src/layouts/mrc800/MaterialsMRC800.tsx', desc: 'Biblioteka materiałów MRC800. Reveal SETTLE.' },
  { name: 'FinishesMRC800', file: 'src/layouts/mrc800/FinishesMRC800.tsx', desc: 'Konfigurator wykończeń MRC800. Reveal SETTLE.' },
  { name: 'DimensionsMRC800', file: 'src/layouts/mrc800/DimensionsMRC800.tsx', desc: 'Diagram + tabela wymiarów recepcji. Reveal LIFT. Podpisy modułów pod ikonkami używają qx-packshot-meta / qx-packshot-code (ujednolicone z PackshotsMRC800).' },
  { name: 'ProductCodesMRC800', file: 'src/layouts/mrc800/ProductCodesMRC800.tsx', desc: 'Tabele kodów produktowych recepcji. Reveal SETTLE. Podpisy modułów w sekcji "Single desks" używają qx-packshot-meta / qx-packshot-code (ujednolicone z PackshotsMRC800).' },
  { name: 'CatalogPageMRC800', file: 'src/layouts/mrc800/CatalogPageMRC800.tsx', desc: 'Orchestrator MRC800: sekcje w kolejności + theme scope + PdfDownloadButton.' },
];

const MRC1000_LAYOUTS = [
  { name: 'HeroMRC1000', file: 'src/layouts/mrc1000/HeroMRC1000.tsx', desc: 'Hero modułowej kolekcji recepcyjnej MRC1000 — analog HeroQX/HeroMRC800.' },
  { name: 'OverviewMRC1000', file: 'src/layouts/mrc1000/OverviewMRC1000.tsx', desc: 'Dwukolumnowy overview MRC1000. Reveal SLIDE.' },
  { name: 'GalleryMRC1000', file: 'src/layouts/mrc1000/GalleryMRC1000.tsx', desc: 'Galeria kompozycji recepcyjnych MRC1000 z Lightbox. Reveal LIFT.' },
  { name: 'ArrangementsMRC1000', file: 'src/layouts/mrc1000/ArrangementsMRC1000.tsx', desc: 'Wzorcowe aranżacje MRC1000 — siatka 2×2 z fallback-placeholderami. Reveal LIFT. Renderowana między Gallery a Packshots. Podpisy pod kafelkami używają wzorca qx-packshot-meta / qx-packshot-code (ujednolicone z PackshotsMRC1000).' },
  { name: 'FeaturesMRC1000', file: 'src/layouts/mrc1000/FeaturesMRC1000.tsx', desc: 'Tabbar features + animacja produktu; analog FeaturesQX.' },
  { name: 'GettingStartedMRC1000', file: 'src/layouts/mrc1000/GettingStartedMRC1000.tsx', desc: 'Kroki montażu recepcji modułowej. Reveal LIFT.' },
  { name: 'PackshotsMRC1000', file: 'src/layouts/mrc1000/PackshotsMRC1000.tsx', desc: 'Modele MRC1000 z ColorChip + Lightbox.' },
  { name: 'MaterialsMRC1000', file: 'src/layouts/mrc1000/MaterialsMRC1000.tsx', desc: 'Konfigurator dual-part: niezależny wybór body i hutch (segmented control editTarget) + toggle hutchVisible (On/Off). Preview to 3-warstwowy compositor: base (body finish), shadow (mix-blend-multiply) i hutch (overlay z alfa). Asset cieniowania: /catalogs/MRC1000/customization/metro_top_shadow.webp. Renderuje ExampleSetsMRC1000 pod konfiguratorem. Reveal SETTLE.' },
  { name: 'ExampleSetsMRC1000', file: 'src/layouts/mrc1000/ExampleSetsMRC1000.tsx', desc: 'Sekcja "Example sets" pod MaterialsMRC1000: galeria gotowych zestawów body/hutch (illustrations[]) z ColorChip dla każdej aranżacji. Reużywa parseMRC1000Image + pickConfiguratorOption z lib/materials-options. Reveal SETTLE. Renderowana wyłącznie przez MaterialsMRC1000 (nie sekcja top-level orchestratora).' },
  { name: 'FinishesMRC1000', file: 'src/layouts/mrc1000/FinishesMRC1000.tsx', desc: 'Konfigurator wykończeń MRC1000 — pojedyncza warstwa preview, dedupedDesktops z auto-discover. Reveal SETTLE.' },
  { name: 'DimensionsMRC1000', file: 'src/layouts/mrc1000/DimensionsMRC1000.tsx', desc: 'Diagram + tabela wymiarów MRC1000. Reveal LIFT. Podpisy modułów pod ikonkami używają qx-packshot-meta / qx-packshot-code (ujednolicone z PackshotsMRC1000).' },
  { name: 'ProductCodesMRC1000', file: 'src/layouts/mrc1000/ProductCodesMRC1000.tsx', desc: 'Tabele kodów produktowych MRC1000. Reveal SETTLE. Podpisy modułów w sekcji "Single desks" używają qx-packshot-meta / qx-packshot-code (ujednolicone z PackshotsMRC1000).' },
  { name: 'CatalogPageMRC1000', file: 'src/layouts/mrc1000/CatalogPageMRC1000.tsx', desc: 'Orchestrator MRC1000 (layoutType: "mrc1000"): sekcje w kolejności + theme scope + PdfDownloadButton.' },
];

const PRINT_LAYOUTS = [
  { name: 'CatalogPrintQX', file: 'src/layouts/qx/CatalogPrintQX.tsx', desc: 'Wydruk QX (A4 portrait) — orkiestracja stron z page-break. Renderowany w /catalog/[id]/print. Dispatch FM-wariantów dla Finishes i Packshots gdy catalog.id === "FM".' },
  { name: 'HeroPrintQX', file: 'src/layouts/qx/HeroPrintQX.tsx', desc: 'Statyczna strona hero dla wydruku — pojedyncza ramka A4 zamiast slidera.' },
  { name: 'GalleryPrintQX', file: 'src/layouts/qx/GalleryPrintQX.tsx', desc: 'Galeria dla wydruku — grid bez Lightbox/lazy-load.' },
  { name: 'FeaturesPrintQX', file: 'src/layouts/qx/FeaturesPrintQX.tsx', desc: 'Multi-page features print — wszystkie taby rozwinięte sekwencyjnie, bez video.' },
  { name: 'FinishesPrintQX', file: 'src/layouts/qx/FinishesPrintQX.tsx', desc: 'Konfigurator dla wydruku — losowy preview + pełna lista swatchy. Współdzielony przez QX, QS, VR, TS, FOTA (FM ma własny FinishesPrintFM).' },
  { name: 'PackshotsPrintQX', file: 'src/layouts/qx/PackshotsPrintQX.tsx', desc: 'Paginowane packshoty — siatka z konfigurowalnym pacing per-strona. Współdzielony przez QX, QS, VR, TS, FOTA (FM ma własny PackshotsPrintFM).' },
  { name: 'ContactPrintQX', file: 'src/layouts/qx/ContactPrintQX.tsx', desc: 'Strona kontaktu na końcu wydruku, wspólny układ dla QX i MRC800.' },
  { name: 'CatalogPrintMRC800', file: 'src/layouts/mrc800/CatalogPrintMRC800.tsx', desc: 'Wydruk MRC800 — analog CatalogPrintQX. + dedykowane print sekcje MRC800 (Hero/Overview/Gallery/Finishes/Packshots/Arrangements/Materials/Features/Contact).' },
  { name: 'ArrangementsPrintMRC800', file: 'src/layouts/mrc800/ArrangementsPrintMRC800.tsx', desc: 'Wzorcowe aranżacje dla wydruku — paginowana siatka 2×2 (chunk po 4), współdzieli .packshots-print-* CSS. Lustro ekranowego ArrangementsMRC800; renderuje null gdy katalog nie ma arrangements. Współdzielona z MRC1000 (ten sam pattern).' },
  { name: 'CatalogPrintMRC1000', file: 'src/layouts/mrc1000/CatalogPrintMRC1000.tsx', desc: 'Wydruk MRC1000 — analog CatalogPrintMRC800. Orkiestruje dedykowane print sekcje (Hero/Overview/Gallery/Arrangements/Packshots/Materials/Finishes/Features/Contact). MaterialsPrint i FinishesPrint przepisane na configurator + priceGroups z 3-layer compositorem (body/shadow/hutch).' },
  { name: 'ArrangementsPrintMRC1000', file: 'src/layouts/mrc1000/ArrangementsPrintMRC1000.tsx', desc: 'Wzorcowe aranżacje MRC1000 dla wydruku — analog ArrangementsPrintMRC800.' },
  { name: 'MaterialsPrintMRC1000', file: 'src/layouts/mrc1000/MaterialsPrintMRC1000.tsx', desc: 'Materials print MRC1000 — czyta configurator.desktopOptions + priceGroups, renderuje siatkę tile + 3-warstwowy preview body/shadow/hutch z figcaption "Body finish / Hutch finish / online CTA". Default decor = dedupedDesktops[0], hutch zawsze ON.' },
  { name: 'FinishesPrintMRC1000', file: 'src/layouts/mrc1000/FinishesPrintMRC1000.tsx', desc: 'Finishes print MRC1000 — ten sam wzorzec tile/group co MaterialsPrintMRC1000, ale flat single-layer preview + figcaption "Finish:".' },
  { name: 'ExampleSetsPrintMRC1000', file: 'src/layouts/mrc1000/ExampleSetsPrintMRC1000.tsx', desc: 'Print-wariant ExampleSetsMRC1000 — paginowana siatka illustrations[] z A4 page-break i ColorChip per kafelka. Orkiestrowana przez CatalogPrintMRC1000 obok MaterialsPrint/FinishesPrint.' },
];

const FM_OVERRIDES = [
  { name: 'FinishesFM', file: 'src/layouts/qx/FinishesFM.tsx', desc: 'Klon FinishesQX dla FM: nagłówek "Decor" (mebel płytowy — dekor pokrywa wszystkie powierzchnie), Steel parts colors zawężone do RAL 9006.' },
  { name: 'MaterialsFM', file: 'src/layouts/qx/MaterialsFM.tsx', desc: 'Klon MaterialsQX dla FM: nagłówek "Decor", lista frame zawężona do RAL 9006 (bez leftovers).' },
  { name: 'PackshotsFM', file: 'src/layouts/qx/PackshotsFM.tsx', desc: 'Klon PackshotsQX dla FM: meta pokazuje tylko chip "Decor" pod każdym packshotem; chip "Frame" usunięty (jeden kolor stali w całej kolekcji).' },
  { name: 'FinishesPrintFM', file: 'src/layouts/qx/FinishesPrintFM.tsx', desc: 'Print-wariant FinishesFM — etykieta "Decor", Steel parts colors zawężone do RAL 9006.' },
  { name: 'PackshotsPrintFM', file: 'src/layouts/qx/PackshotsPrintFM.tsx', desc: 'Print-wariant PackshotsFM — chip "Decor" (StaticChip role rozszerzone o "Decor"), bez chipa "Frame".' },
];

const REVEAL_PRESETS = [
  {
    name: 'SECTION_REVEAL_SLIDE',
    used: 'OverviewQX · PackshotsQX · FeaturesQX',
    motion: 'header x: -40 → 0 · content x: +40 → 0',
  },
  {
    name: 'SECTION_REVEAL_LIFT',
    used: 'GalleryQX · DimensionsQX · GettingStartedQX',
    motion: 'header y: 28 → 0 · content y: 40 → 0',
  },
  {
    name: 'SECTION_REVEAL_SETTLE',
    used: 'MaterialsQX · FinishesQX · ProductCodesQX',
    motion: 'header scale 0.96 → 1 · content scale 0.97 → 1',
  },
];

const HOMEPAGE_PATTERNS = [
  {
    name: 'Tile grid · Operational furniture',
    selector: 'src/app/page.tsx · Section 1',
    desc: 'grid-cols-1 lg:grid-cols-5 z li.aspect-[2/1] / lg:aspect-[1/2]. Każdy tile = picture + next/image fill + hover overlay (bg-foreground/55) + brand label (88px font-black, opacity 0 → 1). Sizes: 100vw mobile / 85vw lg. Źródło: /catalogs/{ID}/thumbs/{id}-home.webp; mobile, jeśli istnieje: {id}-home-mobile.webp. Pierwsze 2 tile (LCP-priority) mają priority + fetchPriority="high"; reszta lazy + gallery-thumb preset z manifestu.',
  },
  {
    name: 'Wide hero tile · Conference tables',
    selector: 'src/app/page.tsx · Section 2',
    desc: 'aspect-[5/1] full-width hero — FOTA. Sizes: max 1440px / 100vw. Hover overlay + brand label identyczne jak w siatce 2×3.',
  },
  {
    name: 'Square tile pair · Reception desks',
    selector: 'src/app/page.tsx · Section 3',
    desc: 'grid-cols-1 sm:grid-cols-2 z aspect-square. MRC800 + pusty slot border-border bg-background/40 (placeholder na kolejny katalog).',
  },
  {
    name: 'EU funding banner',
    selector: 'src/app/page.tsx · banner.webp',
    desc: 'Logotypy "Fundusze Europejskie · RP · UE · PARP" — 2545×218px, w 90% mobile / 60% lg. Centrowany, tło bg-surface-elevated. Powtórzony w stopkach catalogów.',
  },
  {
    name: 'Site footer · CONCEPTFAB credit',
    selector: 'src/app/page.tsx · footer',
    desc: 'bg-catalog-footer + py-10. globalConfig.footerText + klikalny CONCEPTFAB.COM (target=_blank, underline hover:text-foreground). Centrowany, font-display uppercase tracking-widest.',
  },
];

const CATALOG_THUMBS = {
  pattern: '/catalogs/{ID}/thumbs/{id}-{role}.webp',
  roles: [
    { name: '-home', purpose: 'Hero scena dla tile na homepage (object-cover, mocno wykadrowana).' },
    { name: '-home-mobile', purpose: 'Mobilny kadr homepage tile, używany przez <source media="(max-width: 639px)"> gdy plik istnieje.' },
    { name: '-nav', purpose: 'Packshot/overview dla CatalogNav footer (overview content.json fallback).' },
  ],
  resolver: 'getCatalogFooterEntries() w catalog-loader: priorytet -nav.webp, fallback do overview/content.json packshot.',
};

const SCHEMAS_USED = [
  { name: 'heroContentSchema', file: 'src/lib/schemas/hero.ts', covers: 'public/catalogs/*/hero/content.json' },
  { name: 'packshotsContentSchema', file: 'src/lib/schemas/packshots.ts', covers: 'public/catalogs/*/packshots/content.json' },
  { name: 'schemas.test.ts', file: 'src/lib/schemas/schemas.test.ts', covers: 'Walidacja parse-time wszystkich content.json przez Zod (fail-fast w build).' },
];

const AGENT_INFRASTRUCTURE = [
  {
    name: 'MCP server (/mcp)',
    file: 'src/app/mcp/route.ts',
    desc: 'JSON-RPC 2.0 endpoint zgodny z protokołem 2025-06-18. Zwraca SERVER_INFO + CAPABILITIES (resources/tools/prompts). Pozwala agentom (Claude, ChatGPT) odpytywać katalogi przez tools/list i resources/read.',
  },
  {
    name: 'OAuth /oauth/authorize',
    file: 'src/app/oauth/authorize/route.ts',
    desc: 'OAuth 2.1 authorization endpoint — obecnie zwraca 503 temporarily_unavailable (discovery działa, interaktywna autoryzacja wyłączona dla publicznego API).',
  },
  {
    name: 'OAuth /oauth/token + /oauth/jwks.json',
    file: 'src/app/oauth/token/route.ts',
    desc: 'Token endpoint i JSON Web Key Set. Obsługuje authorization_code + refresh_token, scopes: openid/profile/email/catalogs:read, PKCE S256.',
  },
  {
    name: '.well-known/openid-configuration',
    file: 'src/app/.well-known/openid-configuration/route.ts',
    desc: 'OpenID Connect discovery — buildOpenIdConfiguration() z oauth-discovery.ts.',
  },
  {
    name: '.well-known/oauth-authorization-server',
    file: 'src/app/.well-known/oauth-authorization-server/route.ts',
    desc: 'RFC 8414 metadata: issuer, authorization_endpoint, token_endpoint, jwks_uri, scopes_supported, code_challenge_methods.',
  },
  {
    name: '.well-known/oauth-protected-resource',
    file: 'src/app/.well-known/oauth-protected-resource/route.ts',
    desc: 'RFC 9728 — deklaruje scope catalogs:read potrzebny do dostępu do API katalogów.',
  },
  {
    name: '.well-known/api-catalog',
    file: 'src/app/.well-known/api-catalog/route.ts',
    desc: 'RFC 9727 linkset — punkt wejścia dla agentów: lista API i ich profili.',
  },
  {
    name: '.well-known/mcp/server-card.json',
    file: 'src/app/.well-known/mcp/server-card.json/route.ts',
    desc: 'MCP server card — manifest serwera MCP (name, version, endpoint, capabilities) dla auto-discovery.',
  },
  {
    name: '.well-known/agent-skills + SKILL.md',
    file: 'src/app/.well-known/agent-skills/...',
    desc: 'Agent Skills 0.2.0 (agentskills.io) — index.json + metro-catalog-discovery/SKILL.md. Skill instruuje LLM jak przeszukiwać katalog (homepage, Markdown negotiation, API, MCP, JSON resources).',
  },
  {
    name: '/api/catalogs',
    file: 'src/app/api/catalogs/route.ts',
    desc: 'REST endpoint: lista i szczegóły katalogów. Zwraca JSON z CatalogData (per ID lub indeks). runtime=nodejs.',
  },
  {
    name: '/agent-markdown',
    file: 'src/app/agent-markdown/route.ts',
    desc: 'Negocjacja Markdown dla agentów — content-negotiation zwracający katalog jako Markdown z frontmatter + nagłówki Link (api-catalog, service-desc).',
  },
];

const BUILD_SCRIPTS = [
  {
    name: 'generate-thumbnails.mjs',
    file: 'scripts/generate-thumbnails.mjs',
    desc: 'Buduje warianty responsywne dla /catalogs/{ID}/thumbs/{id}-home.webp, opcjonalnego -home-mobile.webp i -nav.webp dla wszystkich katalogów.',
  },
  {
    name: 'generate-catalog-pdfs.mjs',
    file: 'scripts/generate-catalog-pdfs.mjs',
    desc: 'Puppeteer renderuje /catalog/[id]/print?puppeteer=1 i zapisuje /catalogs/{ID}/Download/metro-{id}.pdf. A4 landscape, no-zoom mode.',
  },
  {
    name: 'optimize-catalog-pdfs.mjs',
    file: 'scripts/optimize-catalog-pdfs.mjs',
    desc: 'Post-processing PDF: kompresja, linearyzacja, optymalizacja rozmiaru (ghostscript-like).',
  },
  {
    name: 'verify-catalog-pdfs.mjs',
    file: 'scripts/verify-catalog-pdfs.mjs',
    desc: 'Walidacja gotowych PDF — sprawdza istnienie, rozmiar, liczbę stron, brak błędów rasteryzacji.',
  },
  {
    name: 'catalog-assets.mjs',
    file: 'scripts/catalog-assets.mjs',
    desc: 'Zarządzanie assetami katalogu — discovery sierot, walidacja struktury folderów, raporty pokrycia.',
  },
  {
    name: 'process-images.mjs',
    file: 'scripts/process-images.mjs',
    desc: 'Generator wariantów responsywnych (sharp): -640w/-1280w/-1920w/-3840w WebP. Zapisuje src/generated/responsive-image-manifest.json.',
  },
  {
    name: 'recompress-gallery-bases.mjs',
    file: 'scripts/recompress-gallery-bases.mjs',
    desc: 'Recompresja bazowych galerii do lepszej jakości/rozmiaru przed generowaniem wariantów.',
  },
  {
    name: 'check-no-rasterized-non-webp.mjs',
    file: 'scripts/check-no-rasterized-non-webp.mjs',
    desc: 'CI gate — wykrywa JPEG/PNG, które powinny być WebP. Fail-fast w pre-commit.',
  },
  {
    name: 'optimize-images.mjs',
    file: 'scripts/optimize-images.mjs',
    desc: 'Re-encoder bazowych WebP w /public — przepuszcza assety przez sharp z lepszymi parametrami kompresji, bez zmiany wymiarów. Opcjonalny --force pomija skip-already-optimized.',
  },
  {
    name: 'check-packshots.mjs',
    file: 'scripts/check-packshots.mjs',
    desc: 'CI gate dla katalogów: weryfikuje, że każdy packshot z content.json ma plik na dysku, parsowalny stem (frame/top codes) i wpis w materialsConfigurator. Fail-fast.',
  },
  {
    name: 'generate-mrc1000-combinations.mjs',
    file: 'scripts/generate-mrc1000-combinations.mjs',
    desc: 'Generator kombinacji body × hutch dla MRC1000: produkuje listę wszystkich poprawnych zestawów (z deduplikacją price groups) zapisaną do JSON, używaną przez materials manifesty.',
  },
  {
    name: 'scripts/lib (image-utils + section-widths + printable-layouts)',
    file: 'scripts/lib/',
    desc: 'Wspólne helpery dla skryptów: image-utils.mjs (sharp wrapper, format detection) + section-widths.mjs (mapowanie sekcja → szerokość kontenera) + printable-layouts.mjs (lista layoutType + route /catalog/[id]/print obsługiwanych przez PDF generator).',
  },
];

const HOOKS_USED = [
  {
    name: 'useFocusTrap(ref, isOpen)',
    file: 'src/hooks/use-focus-trap.ts',
    desc: 'Focus trap dla modali: Tab/Shift+Tab cyclical, body scroll lock, focus restoration on close. Używany przez Lightbox + FinishesQX preview modal. Test: jest-axe.',
  },
  {
    name: 'useIsMobile()',
    file: 'src/hooks/use-mobile.tsx',
    desc: 'matchMedia(max-width: 767px) z subskrypcją. SSR-safe (undefined → false). Używany do warunkowego renderowania mobile/desktop variants.',
  },
];

const TOOLING_USED = [
  { name: 'responsive-image (7 presets)', file: 'src/lib/responsive-image.ts', desc: 'hero / gallery / gallery-thumb / packshot / overview / materials-full / materials-thumb. Hero: 100vw sizes (pełnoekranowy object-cover). Packshot: 100vw sizes pod mobile full-bleed. gallery-thumb dla LCP mini-tile na homepage. Manifest-first z fallbackiem.' },
  { name: 'image-loader (custom)', file: 'src/lib/image-loader.ts', desc: 'Custom next/image loader z generated/responsive-image-manifest.json. Dopasowuje najmniejszy wariant ≥ requested width. SVG i http:// pomijane, paths z -{w}w już zoptymalizowane.' },
  { name: 'catalog-loader', file: 'src/lib/catalog-loader.ts', desc: 'Parallelized loader: hero, slider, overview, gallery, finishes, dimensions, materials, features, getting-started, codes, packshots. Auto-discover heroSlides + materialsConfigurator. Plus: getCatalogList, getCatalogFooterEntries (resolver -nav.webp + overview fallback), getGlobalConfig (public/config.json override).' },
  { name: 'layoutMap (catalog dispatch)', file: 'src/app/catalog/[catalogId]/page.tsx', desc: 'Record<CatalogLayoutType, Component> mapuje meta.layoutType → CatalogPageQX | CatalogPageMRC800 | CatalogPagePlaceholder. type2/type3 fallbackują do Placeholder.' },
  { name: 'design-tokens registry', file: 'src/lib/design-tokens.ts', desc: '40 tokenów kolorów ze synchronizacją do globals.css (test: design-tokens.test.ts).' },
  { name: 'icon-map (17 ikon)', file: 'src/lib/icon-map.tsx', desc: 'Mapa nazw → komponentów Lucide używana w features/getting-started.' },
  { name: 'materials-options.ts', file: 'src/lib/materials-options.ts', desc: 'Helpery do options: parsePackshotImage (filename → frame/top codes), parseMRC1000Image (body/hutch codes), pickConfiguratorOption, dedupeByCode, orderOptions, formatOptionCode (RAL9005 → "RAL 9005"), enrichConfigurator. Reużywany przez QX/MRC packshots i ExampleSets.' },
  { name: 'motion utilities', file: 'src/lib/motion.ts', desc: 'SECTION_REVEAL_* presets + slowTransition() + CATALOG_MOTION_MULTIPLIER ×2.' },
  { name: 'agent-skills.ts', file: 'src/lib/agent-skills.ts', desc: 'Rejestr Agent Skills (agentskills.io 0.2.0). Buduje index.json + SKILL.md dla metro-catalog-discovery. Zawiera content-hash dla cache invalidation.' },
  { name: 'oauth-discovery.ts', file: 'src/lib/oauth-discovery.ts', desc: 'Buduje metadata OpenID/OAuth (issuer, endpoints, scopes, PKCE). + oauthEndpointHeaders() helper z CORS i Cache-Control.' },
  { name: 'site-url.ts', file: 'src/lib/site-url.ts', desc: 'Resolver bazowego URL (env NEXT_PUBLIC_SITE_URL → Vercel deployment URL → localhost). Używany przez OAuth/MCP do absolutnych linków.' },
  { name: 'types/catalog.ts', file: 'src/types/catalog.ts', desc: 'Centralny model domeny: CatalogData, CatalogMeta, CatalogLayoutType, ProductCodeGroup, HeroSlide, GalleryImage, FinishesContent. Współdzielony przez loader, API, MCP, layouty.' },
  { name: 'styles/print.css', file: 'src/styles/print.css', desc: '@page A4 landscape + @media print rules. Klasy .print-hide (UI controls), .print-page (A4 boundary box w preview), .print-only. PrintImage korzysta z klas object-fit/object-position z tego pliku. -webkit-print-color-adjust: exact dla wiernych kolorów.' },
  { name: 'generated/responsive-image-manifest.json', file: 'src/generated/responsive-image-manifest.json', desc: 'Output process-images.mjs — mapa src → [generated widths]. Używana przez image-loader.ts i responsive-image.ts.' },
];

const PLANNED: Array<{ category: string; items: string[] }> = [
  {
    category: 'Tokeny',
    items: [
      'Skala opacity (--opacity-disabled, --opacity-subtle, --opacity-overlay)',
      'Tokeny easingu (--ease-in, --ease-out, --ease-bounce)',
      '--accent-strong dla lepszego kontrastu w dark mode',
    ],
  },
  {
    category: 'Typografia',
    items: [
      'Semantyczna skala rozmiarów (display-xl, body-lg, caption, label)',
      'Fluid clamp() dla body/caption (tylko section_Title ma to dziś)',
      'Skala line-height jako tokeny',
      'Tabular nums w tabelach kodów',
      'Alternatywny krój display dla Type2/Type3',
    ],
  },
  {
    category: 'Komponenty udostępnione',
    items: [
      'PriceTag / Badge produktowy',
      'CatalogFooter (ekstrakcja z CatalogPageQX)',
      'SiteHeader (logo · język · search)',
      'Branded Skeleton + Empty State + Error Boundary',
      'Toast wrapper (sonner styled)',
      'Command Palette (shadcn command)',
      'Carousel: unifikacja HeroQX + shadcn carousel',
      'Tooltip: unifikacja ColorChip + shadcn tooltip',
      'Form components QX-styled (Input · Select · Textarea)',
      'MetroLogo component (dziś inline w nav)',
    ],
  },
  {
    category: 'Layouty katalogu',
    items: [
      'Type2: projekt + implementacja',
      'Type3: projekt + implementacja',
      'QS brand-scoping (.catalog-qs0)',
      'Strona produktu /catalog/[c]/[p] z konfiguratorem i ceną',
      'Komparator produktów /catalog/compare',
      'Strona kontaktu / quote /quote',
      'Inspiracje / case studies',
    ],
  },
  {
    category: 'Schematy treści',
    items: [
      'Zod schema dla overview/content.json',
      'Zod schema dla gallery/content.json',
      'Zod schema dla finishes/content.json',
      'Zod schema dla dimensions/content.json',
      'Zod schema dla materials/content.json',
      'Zod schema dla features/content.json',
      'Zod schema dla getting-started/content.json',
      'Zod schema dla codes/content.json',
      'Wielojęzyczne warianty pl/en',
      'Walidacja content na build-time (CI gate)',
    ],
  },
  {
    category: 'Motion',
    items: [
      'SECTION_REVEAL_NONE (preset dla prefers-reduced-motion)',
      'Microinteraction presets (button hover · swatch select · modal · toggle)',
      'Stagger children dla list (gallery · swatches)',
    ],
  },
  {
    category: 'Tooling',
    items: [
      'Storybook lub Ladle',
      'Visual regression (Chromatic / Playwright snapshots)',
      'Automatyczne testy a11y (axe-core / pa11y w CI)',
      'Walidacja kontrastu WCAG AA/AAA',
      'Style Dictionary: auto-sync design-tokens.ts ↔ globals.css',
      'Tokeny typografii / motion w design-tokens.ts (dziś tylko kolory)',
    ],
  },
  {
    category: 'Responsywność',
    items: [
      'Container queries (@container) dla MaterialsOptionGroup',
      'Custom breakpoint tablet (768px)',
      'Audit PackshotsQX <640px (siatka 7.25rem nie mieści 4 swatchów)',
    ],
  },
  {
    category: 'Interakcja',
    items: [
      'Loading state patterns (skeleton + spinner)',
      'Form validation patterns',
      'Modal transitions (shadcn dialog)',
      'Touch swipe na hero slider i swatchach',
    ],
  },
  {
    category: 'Branding',
    items: [
      'Favicon / app icon set',
      'Open Graph / Twitter Card meta',
      'Brand guidelines doc (TOV · logo · prawa)',
      'Pipeline Figma → token (dziś manualny eksport)',
    ],
  },
];

/* ================================================================ */
/*  HELPERS                                                         */
/* ================================================================ */

function getToken(cssVar: string) {
  return colorTokens.find((t) => t.cssVar === cssVar);
}

function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <p className="section_ID font-display uppercase">
      <span className="text-foreground/40">{index} ·</span> {label}
    </p>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-l border-foreground/15 pl-5">
      <p className="font-display text-4xl font-light leading-none">{value}</p>
      <p className="mt-2 label-tight text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function SourcePath({ path }: { path: string }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
      {path}
    </p>
  );
}

/**
 * Inline tag pinned to a surface, showing which design token paints it.
 * Use it on every preview area so the page is self-documenting.
 */
function SurfaceTag({ token, position = 'top-left' }: { token: string; position?: 'top-left' | 'top-right' }) {
  const pos = position === 'top-right' ? 'right-2' : 'left-2';
  return (
    <span
      className={`pointer-events-none absolute top-2 ${pos} z-10 inline-flex items-center gap-1.5 border border-foreground/15 bg-card/90 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground backdrop-blur-sm`}
    >
      <span className="size-2 border border-foreground/30" style={{ background: `var(${token})` }} />
      bg · {token}
    </span>
  );
}

function StatusTag({ kind }: { kind: 'used' | 'planned' }) {
  if (kind === 'used') {
    return (
      <span className="inline-flex items-center gap-1.5 border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-success">
        <span className="size-1.5 rounded-full bg-success" />
        zaimplementowane
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 border border-foreground/15 bg-foreground/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
      <span className="size-1.5 rounded-full bg-muted-foreground" />
      planowane
    </span>
  );
}

function A11yNote({
  children,
  tone = 'default',
}: {
  children: ReactNode;
  tone?: 'default' | 'strong';
}) {
  const toneClass =
    tone === 'strong'
      ? 'border-foreground/15 bg-warm-light'
      : 'border-accent/20 bg-warm-light/50';

  return (
    <aside className={`mt-6 border p-4 text-sm ${toneClass}`}>
      {children}
    </aside>
  );
}

/**
 * Tokeny zdefiniowane w globals.css i obecne w design-tokens.ts, ale obecnie
 * niewywoływane przez żaden layout/komponent w produkcji (audit: 2026-05-06).
 * Pokazane na swatch card z badgem "ZAREZERWOWANY", żeby było jasne że są
 * dostępne w design systemie ale jeszcze nie wpięte w żaden render.
 */
const DORMANT_TOKENS = new Set<string>([
  '--warm-light',
  '--hero-overlay',
  '--info',
  '--warning',
  '--warning-foreground',
  '--success',
  '--chart-1',
  '--chart-2',
  '--chart-3',
  '--chart-4',
  '--chart-5',
]);

function ColorSwatchCard({ cssVar }: { cssVar: string }) {
  const token = getToken(cssVar);
  if (!token) return null;
  const dormant = DORMANT_TOKENS.has(cssVar);
  return (
    <div
      className={`relative flex flex-col border bg-card ${dormant ? 'border-foreground/15' : 'border-foreground/10'}`}
    >
      {dormant && (
        <span className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 border border-foreground/20 bg-card/90 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground backdrop-blur-sm">
          zarezerwowany
        </span>
      )}
      <div
        className="h-24 w-full border-b border-foreground/10"
        style={{ background: `var(${cssVar})` }}
        aria-hidden
      />
      <div className="p-3">
        <p className="font-display text-sm font-bold">{token.name}</p>
        <p className="font-mono text-[11px] text-muted-foreground">{cssVar}</p>
        <div className="mt-2 flex items-center gap-2 text-[11px]">
          <span className="border border-foreground/20 px-1.5 py-0.5 font-mono">
            L · {token.light}
          </span>
          {token.dark && (
            <span className="border border-foreground/20 px-1.5 py-0.5 font-mono">
              D · {token.dark}
            </span>
          )}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">{token.role}</p>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  PAGE                                                            */
/* ================================================================ */

interface DesignSystemCounts {
  usedCount: number;
  plannedCount: number;
}

function getDesignSystemCounts(): DesignSystemCounts {
  const usedCount =
    colorTokens.length +
    SHADOW_TOKENS.length +
    Z_INDEX_TOKENS.length +
    SHARED_COMPONENTS.length +
    QX_LAYOUTS.length +
    MRC800_LAYOUTS.length +
    MRC1000_LAYOUTS.length +
    PRINT_LAYOUTS.length +
    FM_OVERRIDES.length +
    HOMEPAGE_PATTERNS.length +
    REVEAL_PRESETS.length +
    SCHEMAS_USED.length +
    TOOLING_USED.length +
    AGENT_INFRASTRUCTURE.length +
    BUILD_SCRIPTS.length +
    HOOKS_USED.length +
    TYPOGRAPHY_SAMPLES.length;
  const plannedCount = PLANNED.reduce((sum, g) => sum + g.items.length, 0);

  return { usedCount, plannedCount };
}

export default function DesignSystemPage() {
  return renderDesignSystemPage(getDesignSystemCounts());
}

function renderDesignSystemPage({
  usedCount,
  plannedCount,
}: DesignSystemCounts) {
  return (
    <main className="catalog-qx0 min-h-screen bg-background text-foreground">
      {/* HERO ============================================================ */}
      <section
        id="ds-hero"
        className="border-b border-foreground/10 bg-surface-elevated"
        aria-labelledby="ds-hero-title"
      >
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
          <p className="section_ID font-display uppercase">Design System</p>
          <h1
            id="ds-hero-title"
            className="section_Title mt-8 max-w-[20ch] font-display font-normal"
          >
            <QxText text="METRO Catalogs" />
          </h1>
          <p className="sec_main_text mt-10 max-w-[60ch]">
            Co realnie działa w katalogach <span className="qx-word">QX</span>,{' '}
            <span className="qx-word">QS</span>, <span className="qx-word">VR</span>,{' '}
            <span className="qx-word">TS</span>, <span className="qx-word">FM</span>,{' '}
            <span className="qx-word">FOTA</span>,{' '}
            <span className="qx-word">MRC800</span> i{' '}
            <span className="qx-word">MRC1000</span>, z renderem, ścieżką źródła i
            tokenami. Plus to, co dopiero powstanie.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
            <Stat value={String(usedCount)} label="Elementów zaimplementowanych" />
            <Stat value={String(plannedCount)} label="Elementów planowanych" />
            <Stat
              value={`${QX_LAYOUTS.length}+${MRC800_LAYOUTS.length}+${MRC1000_LAYOUTS.length}`}
              label="Layoutów QX + MRC800 + MRC1000"
            />
            <Stat value={String(colorTokens.length)} label="Tokenów kolorów" />
          </div>
          <nav className="mt-12 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <a href="#foundations" className="hover:text-foreground">01 · Foundations</a>
            <a href="#typography" className="hover:text-foreground">02 · Typografia</a>
            <a href="#components" className="hover:text-foreground">03 · Komponenty</a>
            <a href="#patterns" className="hover:text-foreground">04 · Wzorce</a>
            <a href="#layouts" className="hover:text-foreground">05 · Layouty</a>
            <a href="#motion" className="hover:text-foreground">06 · Motion</a>
            <a href="#schemas" className="hover:text-foreground">07 · Schematy</a>
            <a href="#tooling" className="hover:text-foreground">08 · Tooling</a>
            <a href="#hooks" className="hover:text-foreground">09 · Hooks</a>
            <a href="#agent-infrastructure" className="hover:text-foreground">10 · Agent · MCP</a>
            <a href="#build-scripts" className="hover:text-foreground">11 · Build skrypty</a>
            <a href="#planned" className="hover:text-foreground">12 · Planowane</a>
          </nav>
        </div>
      </section>

      {/* FOUNDATIONS ===================================================== */}
      <section
        id="foundations"
        className="bg-background"
        aria-labelledby="foundations-title"
      >
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
          <SectionLabel index="01" label="Foundations" />
          <h2
            id="foundations-title"
            className="section_Title mt-8 font-display font-normal"
          >
            Tokeny kolorów, cienie, z-index
          </h2>

          {COLOR_GROUPS.map((group) => (
            <div key={group.heading} className="mt-16">
              <p className="qx-emphasis-title">{group.heading}</p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {group.codes.map((cssVar) => (
                  <ColorSwatchCard key={cssVar} cssVar={cssVar} />
                ))}
              </div>
            </div>
          ))}

          {/* Shadows */}
          <div className="mt-20">
            <p className="qx-emphasis-title">Cienie · elewacja</p>
            <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {SHADOW_TOKENS.map((s) => (
                <div
                  key={s.name}
                  className="bg-surface-elevated p-6"
                  style={{ boxShadow: `var(${s.cssVar})` }}
                >
                  <p className="font-display text-sm font-bold">{s.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {s.cssVar}
                  </p>
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    {s.usage}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Z-index */}
          <div className="mt-20">
            <p className="qx-emphasis-title">Skala z-index</p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Z_INDEX_TOKENS.map((z) => (
                <div
                  key={z.name}
                  className="flex items-center gap-4 border border-foreground/10 bg-card px-4 py-3"
                >
                  <span className="font-display text-2xl font-light tabular-nums text-foreground/40">
                    {z.value.padStart(2, '0')}
                  </span>
                  <div>
                    <p className="font-mono text-xs font-bold">{z.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {z.usage}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TYPOGRAPHY ====================================================== */}
      <section
        id="typography"
        className="border-y border-foreground/10 bg-surface-elevated"
        aria-labelledby="typography-title"
      >
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
          <SectionLabel index="02" label="Typografia" />
          <h2
            id="typography-title"
            className="section_Title mt-8 font-display font-normal"
          >
            Skala i utility
          </h2>
          <p className="sec_main_text mt-6 max-w-[60ch]">
            Krój <strong>Lato</strong> dla wszystkich ról. Wagi 100/300/400/700/900 z
            Google Fonts. Utility w <code className="font-mono text-sm">.catalog-qx0</code>{' '}
            scope nadpisują domyślne style sekcji.
          </p>
          <div className="mt-12 grid gap-4">
            {TYPOGRAPHY_SAMPLES.map((s) => (
              <div
                key={s.label}
                className="grid grid-cols-1 gap-6 border border-foreground/10 bg-card p-6 lg:grid-cols-[1fr_280px]"
              >
                <div className="flex min-h-[80px] items-center">{s.render}</div>
                <div className="border-t border-foreground/10 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                  <p className="font-mono text-xs font-bold">{s.label}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {s.description}
                  </p>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {s.source}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPONENTS ====================================================== */}
      <section
        id="components"
        className="bg-background"
        aria-labelledby="components-title"
      >
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
          <SectionLabel index="03" label="Komponenty udostępnione" />
          <h2
            id="components-title"
            className="section_Title mt-8 font-display font-normal"
          >
            Reużywalne primitywy
          </h2>

          {/* ColorChip: text card only. Live render shown in 04 Wzorce (real packshot context). */}
          <div className="mt-16 bg-card p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="max-w-[60ch]">
                <StatusTag kind="used" />
                <p className="mt-3 font-display text-xl font-bold">ColorChip</p>
                <SourcePath path="src/components/catalog/ColorChip.tsx" />
                <p className="mt-3 text-sm text-muted-foreground">
                  24×24 swatch z tooltipem na hover. Tooltip:{' '}
                  <code className="font-mono">bg-background</code> +{' '}
                  <code className="font-mono">shadow-token-lg</code> +{' '}
                  <code className="font-mono">z-tooltip</code>. Pokazuje kod
                  (RAL/U/W) + nazwę + zdjęcie próbki. Renderowany wyłącznie
                  wewnątrz <code className="font-mono">qx-packshot-meta</code>{' '}
                  obok labela &quot;Frame&quot; / &quot;Top&quot;, pełny render w sekcji{' '}
                  <a href="#patterns" className="underline">04 Wzorce → packshot-meta</a>.
                </p>
              </div>
            </div>
          </div>

          {/* SectionShell + SectionHeading live: DEFAULT bg (bg-surface-elevated, like every layout uses) */}
          <div className="mt-12">
            <div className="relative border border-foreground/10">
              <SurfaceTag token="--surface-elevated" />
              <SectionShell
                id="ds-shell-demo"
                innerClassName="mx-auto w-full max-w-[1100px] px-8 py-12"
              >
                <SectionHeading
                  id="ds-shell-demo"
                  sectionLabel="Sample"
                  title="Designed for the way you"
                  titleLine2="work today"
                />
                <p className="sec_main_text mt-8 max-w-[44ch]">
                  Tu siedzi treść sekcji. SectionShell daje{' '}
                  <code className="font-mono text-sm">aria-labelledby</code>,
                  responsive padding i opcjonalny inner override.
                </p>
              </SectionShell>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
              <div className="bg-card p-4">
                <StatusTag kind="used" />
                <p className="mt-2 font-display text-sm font-bold">SectionShell</p>
                <SourcePath path="src/components/catalog/SectionShell.tsx" />
              </div>
              <div className="bg-card p-4">
                <StatusTag kind="used" />
                <p className="mt-2 font-display text-sm font-bold">SectionHeading</p>
                <SourcePath path="src/components/catalog/SectionHeading.tsx" />
              </div>
            </div>
          </div>

          {/* All other shared components grid */}
          <div className="mt-16 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SUPPORTING_SHARED_COMPONENTS.map((c) => (
              <div key={c.name} className="border border-foreground/10 bg-card p-5">
                <StatusTag kind="used" />
                <p className="mt-3 font-display text-base font-bold">{c.name}</p>
                <SourcePath path={c.source} />
                <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                  {c.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PATTERNS ======================================================== */}
      <section
        id="patterns"
        className="border-y border-foreground/10 bg-surface-elevated"
        aria-labelledby="patterns-title"
      >
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
          <SectionLabel index="04" label="Wzorce kompozycyjne" />
          <h2
            id="patterns-title"
            className="section_Title mt-8 font-display font-normal"
          >
            Homepage tiles · packshot card · materiały · tabela kodów
          </h2>

          {/* Homepage tile grid + EU banner + footer */}
          <div className="mt-16">
            <div className="flex items-baseline justify-between">
              <p className="qx-emphasis-title">Strona główna · wzorce kompozycji</p>
              <SourcePath path="src/app/page.tsx" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Homepage zestawia katalogi w trzech sekcjach o różnych proporcjach.
              Tile = pełnoekranowy <code className="font-mono">next/image fill</code>{' '}
              z hover overlay (<code className="font-mono">bg-foreground/55</code>)
              + brand label 88px (<code className="font-mono">font-black tracking-tighter</code>),
              opacity 0 → 1 na grupie. Focus-visible: outline 2px na{' '}
              <code className="font-mono">-2px</code> offset (wewnątrz tile).
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {HOMEPAGE_PATTERNS.map((p) => (
                <div key={p.name} className="border border-foreground/10 bg-card p-5">
                  <StatusTag kind="used" />
                  <p className="mt-3 font-display text-base font-bold">{p.name}</p>
                  <SourcePath path={p.selector} />
                  <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Catalog thumbnail pipeline (-home / -nav) */}
          <div className="mt-16">
            <div className="flex items-baseline justify-between">
              <p className="qx-emphasis-title">Pipeline miniatur · -home / -nav</p>
              <SourcePath path={CATALOG_THUMBS.pattern} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Każdy katalog ma do trzech standardowych miniatur w{' '}
              <code className="font-mono">/catalogs/{'{ID}'}/thumbs/</code> o różnych
              rolach. Skrypt generujący buduje je raz dla całego portfolio (8 katalogów,
              -home + opcjonalny -home-mobile + -nav).
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {CATALOG_THUMBS.roles.map((r) => (
                <div key={r.name} className="border border-foreground/10 bg-card p-5">
                  <StatusTag kind="used" />
                  <p className="mt-3 font-mono text-sm font-bold">{r.name}.webp</p>
                  <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                    {r.purpose}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[12px] text-muted-foreground">
              <span className="font-mono text-foreground">Resolver:</span>{' '}
              {CATALOG_THUMBS.resolver}
            </p>
          </div>

          {/* Packshot card pattern: exact replica of PackshotsQX render */}
          <div className="mt-16">
            <div className="flex items-baseline justify-between">
              <p className="qx-emphasis-title">Wzorzec packshot-meta</p>
              <SourcePath path="src/layouts/qx/PackshotsQX.tsx · L166–234" />
            </div>
            <div className="relative mt-8 bg-surface-elevated px-5 py-12 sm:px-8 lg:px-12">
              <SurfaceTag token="--surface-elevated" />
              <article className="mx-auto max-w-[640px]">
                <div className="relative block aspect-[4000/3176] w-full overflow-hidden">
                  <Image
                    src={PACKSHOT_DEMO.image}
                    alt={PACKSHOT_DEMO.alt}
                    fill
                    sizes="(min-width: 1024px) 640px, 100vw"
                    className="object-contain"
                  />
                </div>
                <div className="qx-packshot-meta">
                  <span className="qx-packshot-code">QX11</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="font-display text-[10px] uppercase tracking-[0.12em] text-foreground/70">
                      Frame
                    </span>
                    <ColorChip option={PACKSHOT_DEMO.frameOption} variant="frame" />
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="font-display text-[10px] uppercase tracking-[0.12em] text-foreground/70">
                      Top
                    </span>
                    <ColorChip option={PACKSHOT_DEMO.topOption} variant="top" />
                  </span>
                </div>
              </article>
            </div>

            <p className="mt-4 text-[12px] text-muted-foreground">
              W produkcji <code className="font-mono">PackshotsQX</code> renderuje
              taką kartę dla każdego itema z{' '}
              <code className="font-mono">packshots/content.json</code> w grid{' '}
              <code className="font-mono">sm:grid-cols-2</code>. Na mobile
              packshot używa klas <code className="font-mono">qx-packshot-mobile-frame</code>{' '}
              i <code className="font-mono">qx-packshot-mobile-image</code>, które
              pokazują pełny kadr inline bez otwierania lightboxa; lightbox
              zostaje wzorcem desktop/tablet i renderuje się jako sąsiad sekcji,
              poza <code className="font-mono">#packshots</code>, żeby nie wejść
              w containment z <code className="font-mono">content-visibility</code>.
            </p>
            <p className="mt-2 text-[12px] text-muted-foreground">
              <span className="font-mono text-foreground">qx-packshot-meta</span>{' '}
              + <span className="font-mono text-foreground">qx-packshot-code</span>{' '}
              to jeden token typograficzny dla podpisów pod kafelkami w katalogach.
              Używany poza Packshots także w: ArrangementsMRC800/MRC1000 (Set A…),
              DimensionsMRC800/MRC1000 (moduły pod ikonkami), ProductCodesMRC800/MRC1000
              (moduły w &quot;Single desks&quot;) oraz Materials Example sets MRC1000.
              Reguła: każdy podpis identyfikujący model/moduł/aranżację pod kafelkiem
              ma używać tych klas, nie lokalnych
              <code className="font-mono"> font-display uppercase tracking-[0.15em]</code>.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 text-[12px] text-muted-foreground sm:grid-cols-3">
              <div>
                <span className="font-mono text-foreground">parsePackshotImage()</span>
                {': '}filename → frame/top codes (stem przed{' '}
                <code className="font-mono">__</code>, tokenizowany).
              </div>
              <div>
                <span className="font-mono text-foreground">pickOption()</span>
                {': '}merguje metro+swatch z materialsConfigurator (image z metro,
                label + thumbnail ze swatcha).
              </div>
              <div>
                <span className="font-mono text-foreground">--packshot-meta-* · --packshot-code-*</span>
                {': '}custom props w <code className="font-mono">.catalog-qx0</code>.
              </div>
            </div>
          </div>

          {/* MaterialsOptionGroup: exact replica of configurator render */}
          <div className="mt-20">
            <div className="flex items-baseline justify-between">
              <p className="qx-emphasis-title">Konfigurator · MaterialsOptionGroup</p>
              <SourcePath path="src/components/catalog/MaterialsOptionGroup.tsx · L28–79" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Reużywalna grupa swatchy. Każdy swatch = button{' '}
              <code className="font-mono">7.25rem × 9.75rem</code>, image w{' '}
              <code className="font-mono">absolute top-1 left-1 right-1</code> z{' '}
              <code className="font-mono">aspect-square bg-cover</code>, label
              pod spodem. Stan zaznaczenia: border-foreground +{' '}
              <code className="font-mono">shadow-[0_0_0_2px_rgba(0,0,0,0.18)]</code>.
              Hover: scale-105 na obrazie.
            </p>

            <div className="relative mt-8 bg-surface-elevated px-5 py-12 sm:px-8 lg:px-12">
              <SurfaceTag token="--surface-elevated" />

              {/* Desktop Finish (top): qx-emphasis-title + 2 sub-groups */}
              <div>
                <h3 className="mb-3 qx-emphasis-title">Desktop Finish</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-display text-lg font-normal text-foreground">
                      I-st price group
                    </h4>
                    <div role="radiogroup" aria-label="I-st price group desktop finish" className="flex flex-wrap gap-[5px]">
                      {[
                        { code: 'U100', name: 'White', selected: true },
                        { code: 'U110', name: 'Ash Grey' },
                        { code: 'U120', name: 'Platinium Grey' },
                        { code: 'U130', name: 'Graphite Grey' },
                        { code: 'W220', name: 'Light Oak' },
                        { code: 'W240', name: 'Natural Oak' },
                      ].map((opt) => (
                        <SwatchButton
                          key={opt.code}
                          code={opt.code}
                          label={opt.name}
                          selected={opt.selected}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2 font-display text-lg font-normal text-foreground">
                      II-nd price group
                    </h4>
                    <div role="radiogroup" aria-label="II-nd price group desktop finish" className="flex flex-wrap gap-[5px]">
                      {[
                        { code: 'W200', name: 'Light Beech' },
                        { code: 'W210', name: 'Elm' },
                        { code: 'W250', name: 'Wallnut' },
                        { code: 'W310', name: 'Dark Oak' },
                        { code: 'W330', name: 'Dark Wallnut' },
                      ].map((opt) => (
                        <SwatchButton key={opt.code} code={opt.code} label={opt.name} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Steel parts colors (frame): variant primary, qx-emphasis-title */}
              <div className="mt-8">
                <h3 className="mb-3 qx-emphasis-title">Steel parts colors</h3>
                <div role="radiogroup" aria-label="Steel parts colors" className="flex flex-wrap gap-[5px]">
                  {[
                    { code: 'RAL9006', name: 'Aluminium Grey', selected: true },
                    { code: 'RAL9005', name: 'Jet Black' },
                    { code: 'RAL9003', name: 'Signal White' },
                    { code: 'RAL7024', name: 'Graphite Grey' },
                  ].map((opt) => (
                    <SwatchButton
                      key={opt.code}
                      code={opt.code}
                      label={opt.name}
                      selected={opt.selected}
                    />
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-4 text-[12px] text-muted-foreground">
              Asset:{' '}
              <code className="font-mono">/shared/materials/{'{CODE NAME}'}_thumb.webp</code>{' '}
              (płaska próbka), wspólny folder dla wszystkich katalogów.
              Discovery przez <code className="font-mono">scanMaterialsFolder()</code>{' '}
              w catalog-loader. RAL-y dostają spację w wyświetlaniu (RAL9005 →
              RAL 9005) przez <code className="font-mono">formatOptionCode()</code>.
              Ta sama lista swatchy zasila również ColorChip w packshot-meta
              (przez <code className="font-mono">pickOption()</code>).
            </p>
          </div>

          {/* Product code table: single example showing the pattern */}
          <div className="mt-20">
            <div className="flex items-baseline justify-between">
              <p className="qx-emphasis-title">Tabela kodów produktowych</p>
              <SourcePath path="src/layouts/qx/ProductCodesQX.tsx · L14–61" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Jedna instancja <code className="font-mono">ProductCodeTable</code>:{' '}
              <code className="font-mono">&lt;table table-fixed border-separate&gt;</code>{' '}
              z <code className="font-mono">&lt;colgroup&gt;</code> 34/17/15/34%,
              header <code className="font-mono">bg-product-header</code> +{' '}
              <code className="font-mono">text-accent-foreground</code>, komórki{' '}
              <code className="font-mono">bg-product-muted</code> z 2px{' '}
              <code className="font-mono">border-surface-elevated</code> jako
              separatory. <code className="font-mono">whitespace-nowrap</code> na
              W/D/H: H mieści się w jednej linii.
            </p>

            <div className="relative mt-8 bg-surface-elevated px-5 py-12 sm:px-8 lg:px-12">
              <SurfaceTag token="--surface-elevated" />
              <div className="max-w-[343px]">
                <ProductCodeTablePreview
                  title="QX single desk (depth 70 cm)"
                  rows={[
                    ['QX1(R)*', '120', '70', '74 (63-84)*'],
                    ['QX2(R)*', '140', '70', '74 (63-84)*'],
                    ['QX3(R)*', '160', '70', '74 (63-84)*'],
                    ['QX4(R)*', '180', '70', '74 (63-84)*'],
                  ]}
                />
              </div>
            </div>

            <p className="mt-4 text-[12px] text-muted-foreground">
              W produkcji <code className="font-mono">ProductCodesQX</code>{' '}
              renderuje 9 takich tabel w 3 sekcjach (Single desks · Bench desks ·
              Manager desk), każda sekcja w grid{' '}
              <code className="font-mono">lg:grid-cols-4</code> z legendą
              &quot;* R: height-adjustable desk models&quot; w komórce manager
              desk. Pełna lista kodów w{' '}
              <code className="font-mono">/catalogs/QX/codes/content.json</code>.
            </p>
          </div>
        </div>
      </section>

      {/* LAYOUTS ========================================================= */}
      <section
        id="layouts"
        className="bg-background"
        aria-labelledby="layouts-title"
      >
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
          <SectionLabel index="05" label="Layouty katalogu" />
          <h2
            id="layouts-title"
            className="section_Title mt-8 font-display font-normal"
          >
            <span className="qx-word">QX</span> family · FM overrides · MRC800 family · MRC1000 family · Print pipeline
          </h2>
          <p className="sec_main_text mt-6 max-w-[60ch]">
            Każda sekcja to osobny komponent w{' '}
            <code className="font-mono">src/layouts/{'{family}'}/</code>. Dispatch
            przez <code className="font-mono">layoutMap</code> w{' '}
            <code className="font-mono">/catalog/[catalogId]/page.tsx</code>. QX
            family obsługuje QX, QS, VR, TS, FM, FOTA (layoutType: &quot;qx&quot;);
            MRC800 (layoutType: &quot;mrc800&quot;) i MRC1000 (layoutType: &quot;mrc1000&quot;)
            mają własne rodziny. FM dodatkowo przechwytuje dispatch w
            CatalogPageQX/CatalogPrintQX i renderuje dedykowane warianty Finishes /
            Materials / Packshots (mebel płytowy, etykiety i kolory dopasowane do
            kontekstu).
          </p>
          <div className="mt-8">
            <p className="qx-emphasis-title">QX family · {QX_LAYOUTS.length} layoutów</p>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {QX_LAYOUTS.map((l) => (
              <div key={l.name} className="border border-foreground/10 bg-card p-5">
                <StatusTag kind="used" />
                <p className="mt-3 font-display text-base font-bold">{l.name}</p>
                <SourcePath path={l.file} />
                <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                  {l.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <p className="qx-emphasis-title">FM overrides · {FM_OVERRIDES.length} komponentów</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Klony QX-wariantów Finishes / Materials / Packshots (plus ich wersje
              print) wpięte przez branch <code className="font-mono">catalog.id === &quot;FM&quot;</code> w{' '}
              <code className="font-mono">CatalogPageQX</code> /{' '}
              <code className="font-mono">CatalogPrintQX</code>. Powód: FM to mebel
              płytowy, dekor pokrywa wszystkie powierzchnie (etykieta
              &quot;Decor&quot; zamiast &quot;Desktop Finish&quot; / &quot;Top&quot;),
              jeden kolor stali (RAL 9006), brak chipa &quot;Frame&quot; pod
              packshotami. Pozostałe katalogi z layoutType &quot;qx&quot; (QX, QS,
              VR, TS, FOTA) nadal renderują się oryginalnymi komponentami QX.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FM_OVERRIDES.map((l) => (
              <div key={l.name} className="border border-foreground/10 bg-card p-5">
                <StatusTag kind="used" />
                <p className="mt-3 font-display text-base font-bold">{l.name}</p>
                <SourcePath path={l.file} />
                <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                  {l.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <p className="qx-emphasis-title">MRC800 family · {MRC800_LAYOUTS.length} layoutów</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Dedykowane dla kolekcji recepcyjnej MRC800 (layoutType: &quot;mrc800&quot;).
              Strukturalnie analog QX family, ale z osobnymi assetami i theme-scope
              dopasowanymi pod recepcje. Dodatkowo zawiera ArrangementsMRC800: sekcję
              wzorcowych aranżacji między Gallery a Packshots.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MRC800_LAYOUTS.map((l) => (
              <div key={l.name} className="border border-foreground/10 bg-card p-5">
                <StatusTag kind="used" />
                <p className="mt-3 font-display text-base font-bold">{l.name}</p>
                <SourcePath path={l.file} />
                <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                  {l.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <p className="qx-emphasis-title">MRC1000 family · {MRC1000_LAYOUTS.length} layoutów</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Modułowa kolekcja recepcyjna MRC1000 (layoutType: &quot;mrc1000&quot;).
              Analog MRC800 family, z dwiema cechami unikalnymi: (1)
              MaterialsMRC1000 to konfigurator dual-part: niezależne wybory body
              i hutch (segmented control <code className="font-mono">editTarget</code>)
              z toggle <code className="font-mono">hutchVisible</code>; preview to
              3-warstwowy compositor (base + shadow mix-blend-multiply + hutch z
              alfą). (2) MaterialsPrintMRC1000 i FinishesPrintMRC1000 używają
              <code className="font-mono">configurator + priceGroups</code> zamiast
              starego <code className="font-mono">illustrations[]</code>.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MRC1000_LAYOUTS.map((l) => (
              <div key={l.name} className="border border-foreground/10 bg-card p-5">
                <StatusTag kind="used" />
                <p className="mt-3 font-display text-base font-bold">{l.name}</p>
                <SourcePath path={l.file} />
                <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                  {l.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <p className="qx-emphasis-title">Print pipeline · {PRINT_LAYOUTS.length} layoutów</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Statyczne wersje sekcji renderowane w{' '}
              <code className="font-mono">/catalog/[id]/print</code>. Trigger:{' '}
              <code className="font-mono">PrintAutoTrigger</code> dodaje{' '}
              <code className="font-mono">body.print-preview</code> dla podglądu A4
              na ekranie; <code className="font-mono">?puppeteer=1</code> wyłącza
              zoom dla generatora PDF (Puppeteer page.pdf()). Wyniki:{' '}
              <code className="font-mono">/catalogs/{'{ID}'}/Download/metro-{'{id}'}.pdf</code>.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PRINT_LAYOUTS.map((l) => (
              <div key={l.name} className="border border-foreground/10 bg-card p-5">
                <StatusTag kind="used" />
                <p className="mt-3 font-display text-base font-bold">{l.name}</p>
                <SourcePath path={l.file} />
                <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                  {l.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Hero photo preview */}
          <div className="mt-16">
            <p className="qx-emphasis-title">Hero · ekspozycja produktu</p>
            <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
              <div className="relative aspect-[16/9] overflow-hidden bg-foreground/90">
                <Image
                  src="/catalogs/QX/hero/02_26_Metro_QX_HERO_1_R3-clean_noise_thumb.webp"
                  alt="Hero: biuro otwarte z biurkami QX"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-hero-overlay/40" />
                <div className="absolute inset-0 flex items-end p-8">
                  <p className="hero-text">
                    <QxText text="QX Modular desk system /n engineered for the modern workspace." />
                  </p>
                </div>
              </div>
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src="/catalogs/QX/gallery/02_26_Metro_QX_HOME0000.webp"
                  alt="Gallery: przykład kompozycji domowej"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MOTION ========================================================== */}
      <section
        id="motion"
        className="border-y border-foreground/10 bg-surface-elevated"
        aria-labelledby="motion-title"
      >
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
          <SectionLabel index="06" label="Motion" />
          <h2
            id="motion-title"
            className="section_Title mt-8 font-display font-normal"
          >
            Reveal presets · skala czasu ×2
          </h2>
          <p className="sec_main_text mt-6 max-w-[60ch]">
            framer-motion + <code className="font-mono">useInView</code>. Każda
            sekcja w viewport (margin: -100px) odpala swoją wariację reveal.{' '}
            <code className="font-mono">slowTransition()</code> mnoży durations
            i delays ×2.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {REVEAL_PRESETS.map((p) => (
              <div key={p.name} className="border border-foreground/10 bg-card p-6">
                <StatusTag kind="used" />
                <p className="mt-3 font-mono text-xs font-bold">{p.name}</p>
                <p className="mt-3 text-[11px] uppercase tracking-widest text-muted-foreground">
                  Używany w
                </p>
                <p className="mt-1 text-sm">{p.used}</p>
                <p className="mt-3 text-[11px] uppercase tracking-widest text-muted-foreground">
                  Ruch
                </p>
                <p className="mt-1 font-mono text-xs">{p.motion}</p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <p className="qx-emphasis-title">Keyframes globalne</p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { name: 'animate-fade-in-up', desc: 'opacity 0 + translateY(24px) → 1, 0.6s ease-out' },
                { name: 'animate-accordion-down', desc: 'height 0 → content height, 0.2s' },
                { name: 'animate-accordion-up', desc: 'height content → 0, 0.2s' },
                { name: 'home-tile-pan', desc: 'object-position 45% → 55% → 45%, 120s loop (+ home-tile-pan-reverse 180s). Klasa zdefiniowana w globals.css i gotowa do podpięcia pod tile homepage gdy będzie potrzebny subtelny ken-burns; obecnie tiles homepage używają statycznego object-cover z thumbs/{id}-home.webp.' },
              ].map((k) => (
                <div key={k.name} className="border border-foreground/10 bg-card p-4">
                  <p className="font-mono text-xs font-bold">{k.name}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">{k.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SCHEMAS ========================================================= */}
      <section
        id="schemas"
        className="bg-background"
        aria-labelledby="schemas-title"
      >
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
          <SectionLabel index="07" label="Kontrakty danych" />
          <h2
            id="schemas-title"
            className="section_Title mt-8 font-display font-normal"
          >
            Walidacja content.json przez Zod
          </h2>
          <p className="sec_main_text mt-6 max-w-[60ch]">
            Schemy parse-time. Build pada z czytelnym komunikatem zamiast pustym
            renderem. Wpięte w <code className="font-mono">catalog-loader.ts</code>.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SCHEMAS_USED.map((s) => (
              <div
                key={s.name}
                className="border border-success/30 bg-success/5 p-5"
              >
                <StatusTag kind="used" />
                <p className="mt-3 font-mono text-sm font-bold">{s.name}</p>
                <SourcePath path={s.file} />
                <p className="mt-3 text-[11px] uppercase tracking-widest text-muted-foreground">
                  Pokrywa
                </p>
                <p className="mt-1 font-mono text-xs">{s.covers}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOOLING ========================================================= */}
      <section
        id="tooling"
        className="border-y border-foreground/10 bg-surface-elevated"
        aria-labelledby="tooling-title"
      >
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
          <SectionLabel index="08" label="Tooling · Helpery · Typy" />
          <h2
            id="tooling-title"
            className="section_Title mt-8 font-display font-normal"
          >
            Helpery i infrastruktura
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {TOOLING_USED.map((t) => (
              <div key={t.name} className="border border-foreground/10 bg-card p-5">
                <StatusTag kind="used" />
                <p className="mt-3 font-display text-base font-bold">{t.name}</p>
                <SourcePath path={t.file} />
                <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                  {t.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOOKS =========================================================== */}
      <section
        id="hooks"
        className="bg-background"
        aria-labelledby="hooks-title"
      >
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
          <SectionLabel index="09" label="React hooks" />
          <h2
            id="hooks-title"
            className="section_Title mt-8 font-display font-normal"
          >
            Custom hooks
          </h2>
          <p className="sec_main_text mt-6 max-w-[60ch]">
            Hooki w <code className="font-mono">src/hooks/</code>, wszystkie SSR-safe
            i pokryte testami (use-focus-trap.test.tsx).
          </p>
          <div className="mt-12 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {HOOKS_USED.map((h) => (
              <div key={h.name} className="border border-foreground/10 bg-card p-5">
                <StatusTag kind="used" />
                <p className="mt-3 font-mono text-sm font-bold">{h.name}</p>
                <SourcePath path={h.file} />
                <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                  {h.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AGENT INFRASTRUCTURE ============================================ */}
      <section
        id="agent-infrastructure"
        className="border-y border-foreground/10 bg-surface-elevated"
        aria-labelledby="agent-infrastructure-title"
      >
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
          <SectionLabel index="10" label="Agent · MCP · OAuth" />
          <h2
            id="agent-infrastructure-title"
            className="section_Title mt-8 font-display font-normal"
          >
            Infrastruktura dla agentów AI
          </h2>
          <p className="sec_main_text mt-6 max-w-[60ch]">
            Strona ma pełen stack dla agentów LLM: Model Context Protocol (JSON-RPC),
            OAuth 2.1 + OpenID Connect discovery, Agent Skills 0.2.0 i Markdown
            content-negotiation. Wszystkie endpointy publiczne, scope{' '}
            <code className="font-mono">catalogs:read</code>.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {AGENT_INFRASTRUCTURE.map((a) => (
              <div key={a.name} className="border border-foreground/10 bg-card p-5">
                <StatusTag kind="used" />
                <p className="mt-3 font-display text-base font-bold">{a.name}</p>
                <SourcePath path={a.file} />
                <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                  {a.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BUILD SCRIPTS =================================================== */}
      <section
        id="build-scripts"
        className="bg-background"
        aria-labelledby="build-scripts-title"
      >
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
          <SectionLabel index="11" label="Build · skrypty CLI" />
          <h2
            id="build-scripts-title"
            className="section_Title mt-8 font-display font-normal"
          >
            Pipeline assetów i PDF
          </h2>
          <p className="sec_main_text mt-6 max-w-[60ch]">
            Skrypty <code className="font-mono">scripts/*.mjs</code> generujące
            warianty WebP, miniatury homepage, PDF katalogów (Puppeteer) i raporty
            spójności assetów. Uruchamiane przez npm scripts (zob. package.json).
          </p>
          <div className="mt-12 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {BUILD_SCRIPTS.map((s) => (
              <div key={s.name} className="border border-foreground/10 bg-card p-5">
                <StatusTag kind="used" />
                <p className="mt-3 font-mono text-sm font-bold">{s.name}</p>
                <SourcePath path={s.file} />
                <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACCESSIBILITY PATTERNS ========================================= */}
      <section
        id="a11y-patterns"
        className="bg-background"
        aria-labelledby="a11y-patterns-title"
      >
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
          <p className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
            <span className="text-muted-foreground/50">A11y ·</span>{' '}
            Accessibility patterns
          </p>
          <h2
            id="a11y-patterns-title"
            className="section_Title mt-8 font-display font-normal"
          >
            WCAG 2.1 AA notatki
          </h2>
          <p className="sec_main_text mt-6 max-w-[60ch]">
            Decyzje a11y wbudowane w komponenty katalogu. Każda notatka linkuje
            wzorzec ARIA / WCAG i miejsce, w którym jest stosowany.
          </p>

          <A11yNote tone="strong">
            <strong className="font-semibold">Status WCAG 2.1 AA:</strong> po
            naprawach z audytu{' '}
            <code>.ui-design/audits/metro_catalogs_zasady_20260507_115012.md</code>
            {' '}wszystkie krytyczne (K1–K5) i poważne (P1–P8) ustalenia są
            zaadresowane w kodzie. Foundations:{' '}
            <code>useFocusTrap</code> hook (
            <code>src/hooks/use-focus-trap.ts</code>) +{' '}
            <code>jest-axe</code> w teście. Manualna weryfikacja (Lighthouse,
            axe DevTools, VoiceOver, 320 px reflow), checklist w planie{' '}
            <code>docs/superpowers/plans/2026-05-07-accessibility-wcag-aa-remediation.md</code>
            .
          </A11yNote>

          <A11yNote>
            <strong className="font-semibold">Active in-page section:</strong>{' '}
            CatalogNav uses <code>aria-current=&quot;location&quot;</code> (not{' '}
            <code>&quot;true&quot;</code>) for the active in-page section, per
            ARIA enum. CSS selector:{' '}
            <code>.catalog-nav-link[aria-current=&apos;location&apos;]</code>.
          </A11yNote>

          <A11yNote>
            <strong className="font-semibold">Semantics:</strong> the{' '}
            <code>.section_ID</code> class is a presentational style for
            section labels, apply to <code>&lt;h2&gt;</code> (not{' '}
            <code>&lt;p&gt;</code>) so screen readers and TOC tooling pick
            them up as headings.
          </A11yNote>

          <A11yNote>
            <strong className="font-semibold">
              Carousel slide indicators:
            </strong>{' '}
            active state is <code>w-6 h-2 bg-primary</code> (capsule),
            inactive is <code>w-2 h-2 bg-on-dark-muted/60</code> (dot). Shape
            difference is required; color alone isn&apos;t enough for users
            with colour vision deficiency (WCAG 1.4.1).
          </A11yNote>

          <A11yNote>
            <strong className="font-semibold">Scrollbar:</strong> custom
            WebKit scrollbar widened from 6 px to 12 px for easier mouse
            target (WCAG 2.5.8). Thumb opacity also bumped 0.3 → 0.4 for
            visibility.
          </A11yNote>

          <A11yNote>
            <strong className="font-semibold">Radiogroup semantics (MaterialsOptionGroup):</strong>{' '}
            container has <code>role=&quot;radiogroup&quot;</code> +{' '}
            <code>aria-labelledby</code> pointing at the{' '}
            <code>&lt;h3&gt;</code>. Each option is a{' '}
            <code>&lt;button role=&quot;radio&quot; aria-checked&gt;</code>{' '}
            with roving tabindex (<code>tabIndex={'{'}isSelected ? 0 : -1{'}'}</code>):
            focus enters only the selected option, then native Arrow keys
            navigate between siblings.
          </A11yNote>
          <A11yNote>
            <strong className="font-semibold">Border contrast:</strong> hover
            uses <code>border-foreground/50</code> (≥3:1 on white); token{' '}
            <code>/20</code> fails WCAG 1.4.11 for UI components.
          </A11yNote>

          <A11yNote>
            <strong className="font-semibold">ColorChip touch target:</strong>{' '}
            44×44 px button (<code>h-11 w-11</code>) wraps a 24×24 px visual
            chip. Helper text in <code>aria-label</code>; inner image{' '}
            <code>alt=&quot;&quot; aria-hidden</code>. Tooltip on hover/focus,
            dismissible via Escape (WCAG 1.4.13).
          </A11yNote>

          <A11yNote>
            <strong className="font-semibold">Focus on dark overlays:</strong>{' '}
            icon buttons over dark surfaces (Lightbox, FinishesQX preview)
            use explicit{' '}
            <code>focus-visible:outline-on-dark</code>; the global{' '}
            <code>:focus-visible</code> rule with{' '}
            <code>var(--ring)=#141414</code> is invisible on black backgrounds.
          </A11yNote>

          <A11yNote>
            <strong className="font-semibold">Modal a11y:</strong> all modals
            use the <code>useFocusTrap(ref, isOpen)</code> hook (
            <code>src/hooks/use-focus-trap.ts</code>) for Tab trap, body
            scroll lock, and focus restoration on close. Modal markup uses{' '}
            <code>role=&quot;dialog&quot;</code> +{' '}
            <code>aria-modal=&quot;true&quot;</code> +{' '}
            <code>aria-labelledby</code> pointing at a visible or{' '}
            <code>sr-only</code> <code>&lt;h2&gt;</code>.
          </A11yNote>

          <A11yNote>
            <strong className="font-semibold">Lightbox:</strong> uses{' '}
            <code>useFocusTrap</code>; <code>aria-labelledby</code> points at
            the counter &bdquo;Image N of M: <em>alt</em>&rdquo;; ESC closes,
            Arrow Left/Right navigate; on close focus returns to trigger
            (e.g. packshot thumbnail).
          </A11yNote>

          <A11yNote>
            <strong className="font-semibold">
              Decorative video (FeaturesQX):
            </strong>{' '}
            feature animations are <code>aria-hidden=&quot;true&quot;</code>{' '}
            as visual enrichment of the tabpanel text. Rule:{' '}
            <em>no unique information lives in the video</em>; the description{' '}
            (<code>active.desc</code>) is the full equivalent. A short sr-only
            blurb &bdquo;Visual demonstration of [title]: [desc]&rdquo; is added
            for AT context. Respects <code>prefers-reduced-motion</code>.
          </A11yNote>

          <A11yNote>
            <strong className="font-semibold">
              Mobile FeaturesQX order:
            </strong>{' '}
            on mobile the active feature animation is rendered between the
            section heading and the tab buttons. Desktop keeps the two-column
            composition with media on the right. This keeps the selected
            animation visible before the user chooses another feature.
          </A11yNote>

          <A11yNote>
            <strong className="font-semibold">
              Token <code>--muted-foreground</code> = #595959
            </strong>{' '}
            (was #616161). Gives ≥6.5:1 on{' '}
            <code>--background #f8f8f8</code>. Alpha variants{' '}
            <code>/60</code>, <code>/70</code>, <code>/80</code> still fall
            below AA for body text; use them only for decoration.
          </A11yNote>

          <A11yNote>
            <strong className="font-semibold">
              Token <code>--on-dark-muted</code> = #d0d0d0
            </strong>{' '}
            (was #b8b8b8). Used on dark overlays (Lightbox, Hero buttons).
            ≥7:1 on #262626.
          </A11yNote>

          <A11yNote>
            <strong className="font-semibold">Hero gradient:</strong> Hero
            section has a fixed{' '}
            <code>
              bg-gradient-to-t from-black/65 via-black/30 to-transparent
            </code>{' '}
            layer over the bottom 2/3, guaranteeing hero-text contrast over
            variable slide imagery.
          </A11yNote>

          <A11yNote>
            <strong className="font-semibold">Catalog nav focus ring:</strong>{' '}
            every <code>.catalog-nav-link</code> button (qx0 desktop, qx0 mobile
            drawer, default desktop, default mobile drawer) carries{' '}
            <code>
              focus-visible:outline focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-foreground
            </code>
            . Keyboard users always see a 2 px black ring on the focused link.
          </A11yNote>

          <A11yNote>
            <strong className="font-semibold">Catalog nav smooth-scroll:</strong>{' '}
            duration is clamped to <code>240–500 ms</code> (was 420–900 ms) and
            collapses to <code>0 ms</code> (instant <code>window.scrollTo</code>)
            when <code>useReducedMotion()</code> returns true. Keeps motion under
            the WCAG / Material 500 ms ceiling for vestibular-safe navigation.
          </A11yNote>

          <A11yNote>
            <strong className="font-semibold">Catalog nav transparent scrim:</strong>{' '}
            when not scrolled, both nav variants apply{' '}
            <code>bg-gradient-to-b from-black/15 to-transparent</code> so the
            brand logo and links stay legible over light <em>and</em> dark hero
            imagery. Scrim disappears as soon as the nav switches to{' '}
            <code>bg-surface-elevated</code> on scroll.
          </A11yNote>

          <A11yNote>
            <strong className="font-semibold">Hero arrow-key scope:</strong>{' '}
            the global ArrowLeft / ArrowRight listener in <code>HeroQX</code> is
            gated by an <code>IntersectionObserver</code> on{' '}
            <code>#cover</code> at <code>threshold: 0.25</code>. Arrow keys only
            advance the hero slider while the cover section is in view; they no
            longer silently flip slides while the user reads lower sections.
          </A11yNote>

          <A11yNote>
            <strong className="font-semibold">Hero autoplay focus pause:</strong>{' '}
            the hero <code>&lt;section&gt;</code> wires{' '}
            <code>onFocusCapture</code> + <code>onBlurCapture</code> into the
            same <code>isHoveredRef</code> as the mouse handlers (with a{' '}
            <code>currentTarget.contains(relatedTarget)</code> guard so focus
            moving between dots / arrows does not unpause). Keyboard users
            tabbing into the slider controls get autoplay paused, matching
            mouse hover behaviour.
          </A11yNote>

          <A11yNote>
            <strong className="font-semibold">Hero text line-height:</strong>{' '}
            <code>.hero-text</code> uses <code>line-height: 1.22</code> (was
            1.15) at both desktop and mobile breakpoints. Prevents uppercase
            descenders / ascenders colliding with the row below on small Polish
            phrases (e.g. <em>&quot;KOLEKCJA / OFFICE&quot;</em>) at 320–375 px.
          </A11yNote>

          <A11yNote>
            <strong className="font-semibold">Lightbox image hardening:</strong>{' '}
            the modal image is rendered with <code>draggable={'{false}'}</code>{' '}
            to suppress native OS ghost-drag, and the &bdquo;Image N of M&rdquo;
            counter uses <code>aria-live=&quot;off&quot;</code> so screen
            readers do not re-announce on every arrow-key navigation (the
            dialog itself is already named via <code>aria-labelledby</code>).
            Body scroll lock + focus trap come from{' '}
            <code>useFocusTrap</code> only, no duplicated effect.
          </A11yNote>

          <A11yNote>
            <strong className="font-semibold">color-scheme: light:</strong>{' '}
            <code>:root</code> pins <code>color-scheme: light</code> so
            browser-native scrollbars and form controls render in light theme
            regardless of the user&apos;s OS dark-mode setting. The catalog UI
            is light-only by design; <code>.dark</code> tokens defined in{' '}
            <code>globals.css</code> are not currently applied by any consumer.
          </A11yNote>

          <A11yNote>
            <strong className="font-semibold">prefers-contrast: more:</strong>{' '}
            under high-contrast mode, unselected{' '}
            <code>[role=&quot;radiogroup&quot;] [role=&quot;radio&quot;]</code>{' '}
            tiles render with a 1 px <code>border-foreground</code> instead of{' '}
            <code>border-transparent</code> so the swatch grid structure stays
            visible for low-vision users without changing default visuals.
          </A11yNote>
        </div>
      </section>

      {/* PLANNED ========================================================= */}
      <section
        id="planned"
        className="bg-foreground text-background"
        aria-labelledby="planned-title"
      >
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
          <p className="font-display text-sm font-bold uppercase tracking-widest text-background/60">
            <span className="text-background/30">12 ·</span> Planowane
          </p>
          <h2
            id="planned-title"
            className="section_Title mt-8 font-display font-normal text-background"
          >
            {plannedCount} elementów do zaprojektowania i wdrożenia
          </h2>
          <p className="mt-6 max-w-[60ch] text-base text-background/70">
            Pogrupowane po kategoriach. Każda pozycja z briefem co dokładnie ma
            powstać. Bez deadline&apos;ów; kolejność ustala roadmapa.
          </p>
          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {PLANNED.map((g) => (
              <div key={g.category}>
                <p className="font-display text-base font-bold uppercase tracking-widest text-background">
                  {g.category}
                </p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-background/40">
                  {g.items.length} pozycji
                </p>
                <ul className="mt-4 space-y-2">
                  {g.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 border-b border-background/10 pb-2 text-[13px] leading-relaxed text-background/85"
                    >
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-background/30" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER ========================================================== */}
      <footer className="bg-background">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-5 py-12 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-widest">
              METRO Design System
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
              Zaktualizowano · 2026-05-28
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/" className="hover:underline">
              /
            </Link>
            <Link href="/catalog/QX" className="hover:underline">
              /catalog/QX
            </Link>
            <Link href="/catalog/QS" className="hover:underline">
              /catalog/QS
            </Link>
            <Link href="/catalog/FM" className="hover:underline">
              /catalog/FM
            </Link>
            <Link href="/catalog/TS" className="hover:underline">
              /catalog/TS
            </Link>
            <Link href="/catalog/VR" className="hover:underline">
              /catalog/VR
            </Link>
            <Link href="/catalog/FOTA" className="hover:underline">
              /catalog/FOTA
            </Link>
            <Link href="/catalog/MRC800" className="hover:underline">
              /catalog/MRC800
            </Link>
            <Link href="/catalog/MRC1000" className="hover:underline">
              /catalog/MRC1000
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}

/* ================================================================ */
/*  SUB-COMPONENTS                                                  */
/* ================================================================ */

/**
 * Exact replica of ProductCodesQX.tsx ProductCodeTable (L14–61). Static.
 */
function ProductCodeTablePreview({
  title,
  rows,
}: {
  title: string;
  rows: Array<[string, string, string, string]>;
}) {
  return (
    <article className="grid w-full grid-rows-subgrid row-span-2 gap-y-1 lg:w-[343px]">
      <h4 className="font-body text-[13px] leading-tight text-foreground/65">{title}</h4>
      <table
        className="w-full table-fixed border-separate border-spacing-0 text-[13px]"
      >
        <colgroup>
          <col className="w-[44%]" />
          <col className="w-[15%]" />
          <col className="w-[13%]" />
          <col className="w-[28%]" />
        </colgroup>
        <thead>
          <tr className="bg-product-header font-bold text-accent-foreground">
            <th className="px-3 py-1.5 text-left lowercase">index</th>
            <th className="px-2 py-1.5 text-left lowercase">w</th>
            <th className="px-2 py-1.5 text-left lowercase">d</th>
            <th className="px-2 py-1.5 text-left lowercase">h</th>
          </tr>
        </thead>
        <tbody className="font-body text-product-text">
          {rows.map((row) => (
            <tr key={row[0]}>
              <td className="border-r-2 border-t-2 border-surface-elevated bg-product-muted px-3 py-1.5 font-medium">
                {row[0]}
              </td>
              <td className="whitespace-nowrap border-r-2 border-t-2 border-surface-elevated bg-product-muted px-2 py-1.5">
                {row[1]}
              </td>
              <td className="whitespace-nowrap border-r-2 border-t-2 border-surface-elevated bg-product-muted px-2 py-1.5">
                {row[2]}
              </td>
              <td className="whitespace-nowrap border-t-2 border-surface-elevated bg-product-muted px-2 py-1.5">
                {row[3]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}

/**
 * Static replica of MaterialsOptionGroup.tsx button. No onSelect, no roving
 * tabindex (this is a design preview, not an interactive widget).
 * Image source: /shared/materials/{CODE NAME}_thumb.webp (flat swatch, jak
 * w produkcji), nie /catalogs/QX/materials/metro {CODE}.webp (3D render).
 */
function SwatchButton({
  code,
  label,
  selected = false,
}: {
  code: string;
  label: string;
  selected?: boolean;
}) {
  const displayCode = code.startsWith('RAL') ? `RAL ${code.slice(3)}` : code;
  const filename = code.startsWith('RAL')
    ? `${displayCode}_thumb.webp`
    : `${code} ${label.toUpperCase()}_thumb.webp`;
  const thumbnailUrl = `/shared/materials/${filename}`;
  return (
    <div
      role="radio"
      aria-checked={selected}
      className={`flex flex-col h-[6.5rem] w-[5rem] sm:h-[9.75rem] sm:w-[7.25rem] shrink-0 border bg-background p-1.5 gap-1.5 sm:gap-2 text-left transition-colors ${
        selected
          ? 'border-foreground border-2 shadow-[0_0_0_2px_rgba(0,0,0,0.18)]'
          : 'border-transparent hover:border-foreground/50'
      }`}
    >
      <div
        aria-hidden="true"
        className="aspect-square w-[3.5rem] sm:w-[6rem] mx-auto bg-cover bg-center shrink-0 transition-transform duration-300 hover:scale-105"
        style={{ backgroundImage: `url("${thumbnailUrl}")` }}
      />
      <p className="text-[10px] sm:text-[11px] font-medium leading-tight text-foreground">
        <span className="block">{displayCode}</span>
        <span className="block">{label.toUpperCase()}</span>
      </p>
    </div>
  );
}
