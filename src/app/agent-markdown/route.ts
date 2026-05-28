import {
  getCatalogList,
  getGlobalConfig,
  loadCatalog,
} from '@/lib/catalog-loader';
import type { CatalogData, ProductCodeGroup } from '@/types/catalog';

export const runtime = 'nodejs';

const HOMEPAGE_AGENT_LINKS = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"; profile="https://www.rfc-editor.org/info/rfc9727"',
  '</api/catalogs>; rel="service-desc"; type="application/json"',
].join(', ');

type OverviewFeature = {
  title: string;
  desc: string;
};

function compact(value: string | undefined): string {
  return (value ?? '').replace(/\/n/g, '\n').replace(/\s+/g, ' ').trim();
}

function frontmatter(fields: Record<string, string | undefined>): string {
  const lines = Object.entries(fields).flatMap(([key, value]) => {
    const compactValue = compact(value);
    return compactValue.length > 0
      ? [`${key}: ${JSON.stringify(compactValue)}`]
      : [];
  });

  return lines.length > 0 ? `---\n${lines.join('\n')}\n---\n\n` : '';
}

function joinBlocks(blocks: Array<string | false | undefined>): string {
  return blocks.filter(Boolean).join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
}

function tokenEstimate(markdown: string): string {
  const words = markdown.trim().match(/\S+/g)?.length ?? 0;
  return Math.max(1, Math.ceil(words * 1.35)).toString();
}

async function renderHomeMarkdown(): Promise<string> {
  const [catalogs, globalConfig] = await Promise.all([
    getCatalogList(),
    getGlobalConfig(),
  ]);

  const catalogLinks = catalogs
    .map((catalog) => {
      const title = catalog.meta.tagline
        ? `${catalog.meta.title} - ${catalog.meta.tagline}`
        : catalog.meta.title;
      return `- [${title}](/catalog/${catalog.id}): ${catalog.meta.description}`;
    })
    .join('\n');

  return joinBlocks([
    frontmatter({
      title: globalConfig.siteTitle,
      description: globalConfig.siteSubtitle,
    }),
    `# ${globalConfig.siteTitle}`,
    globalConfig.siteSubtitle,
    '## Catalogs',
    catalogLinks,
    '## Agent Resources',
    [
      '- [API catalog](/.well-known/api-catalog)',
      '- [Catalog listing API](/api/catalogs)',
      '- [Sitemap](/sitemap.xml)',
    ].join('\n'),
  ]);
}

function renderCodes(groups: ProductCodeGroup[]): string {
  return groups
    .slice(0, 8)
    .map((group) => {
      const rows = group.rows
        .slice(0, 8)
        .map(
          (row) =>
            `- ${row.index}: ${row.dimensions}${
              row.indexR ? `; regulated variant ${row.indexR}` : ''
            }`,
        )
        .join('\n');
      return `### ${group.title}\n${rows}`;
    })
    .join('\n\n');
}

function renderCatalogMarkdown(catalog: CatalogData): string {
  const sectionLinks = catalog.sections
    ?.map((section) => `- ${section.label}`)
    .join('\n');
  const overviewFeatures = (
    'features' in catalog.overview
      ? (catalog.overview.features as OverviewFeature[] | undefined)
      : undefined
  )
    ?.map((feature) => `- ${feature.title}: ${feature.desc}`)
    .join('\n');
  const gallery = catalog.gallery.images
    .map((image) => `- ${image.category}: ${image.alt} (${image.src})`)
    .join('\n');
  const desktopColors = catalog.finishes.desktopColors
    .map((color) => `- ${color.name}${color.ral ? ` (${color.ral})` : ''}`)
    .join('\n');
  const frameColors = catalog.finishes.frameColors
    .map((color) => `- ${color.name}${color.ral ? ` (${color.ral})` : ''}`)
    .join('\n');
  const specs = catalog.dimensions.specs
    .map((spec) => `- ${spec.label}: ${spec.value}`)
    .join('\n');
  const materials = catalog.materials.materials
    .map((material) => `- ${material.name}: ${material.desc} ${material.specs}`)
    .join('\n');
  const features = catalog.features.items
    .map((feature) => `- ${feature.title}: ${feature.desc}`)
    .join('\n');
  const steps = catalog.gettingStarted.steps
    .map((step) => `- ${step.step}. ${step.title}: ${step.desc}`)
    .join('\n');
  const models = catalog.packshots?.groups
    .slice(0, 12)
    .map((group) => {
      const items = group.items
        .slice(0, 4)
        .flatMap((item) => {
          const label = item.name || item.code;
          return label ? [label] : [];
        })
        .join(', ');
      return `- ${group.label}${items ? `: ${items}` : ''}`;
    })
    .join('\n');

  return joinBlocks([
    frontmatter({
      title: catalog.meta.title,
      description: catalog.meta.description,
    }),
    `# ${catalog.meta.title}`,
    catalog.meta.tagline,
    catalog.meta.description,
    sectionLinks && `## Sections\n${sectionLinks}`,
    `## ${catalog.overview.title}`,
    catalog.overview.paragraphs.join('\n\n'),
    overviewFeatures && `### Highlights\n${overviewFeatures}`,
    `## ${catalog.gallery.title}\n${gallery}`,
    `## ${catalog.finishes.title}`,
    catalog.finishes.description,
    desktopColors && `### Desktop Colors\n${desktopColors}`,
    frameColors && `### Frame Colors\n${frameColors}`,
    models && `## ${catalog.packshots?.title}\n${models}`,
    `## ${catalog.dimensions.title}`,
    catalog.dimensions.description,
    specs,
    catalog.dimensions.certifications.length > 0 &&
      `### Certifications\n${catalog.dimensions.certifications
        .map((certification) => `- ${certification}`)
        .join('\n')}`,
    `## ${catalog.materials.title}`,
    catalog.materials.description,
    materials,
    `## ${catalog.features.title}\n${features}`,
    `## ${catalog.gettingStarted.title}\n${steps}`,
    `## ${catalog.productCodes.title}`,
    catalog.productCodes.description,
    renderCodes(catalog.productCodes.groups),
    catalog.productCodes.legend,
  ]);
}

async function renderDesignSystemMarkdown(): Promise<string> {
  return joinBlocks([
    frontmatter({
      title: 'METRO Design System',
      description: 'Design tokens, components, and catalog section patterns.',
    }),
    '# METRO Design System',
    'The design system documents the live tokens, components, and section patterns used by the METRO catalog UI.',
    '## Resources',
    [
      '- [Catalog list](/)',
      '- [QX catalog](/catalog/QX)',
      '- [QS catalog](/catalog/QS)',
    ].join('\n'),
  ]);
}

async function renderMarkdown(pathname: string): Promise<{
  markdown: string;
  status: number;
}> {
  if (pathname === '/') {
    return { markdown: await renderHomeMarkdown(), status: 200 };
  }

  if (pathname === '/design-system') {
    return { markdown: await renderDesignSystemMarkdown(), status: 200 };
  }

  const catalogMatch = pathname.match(/^\/catalog\/([^/]+)$/);
  if (catalogMatch) {
    const catalog = await loadCatalog(catalogMatch[1]);
    if (catalog) {
      return { markdown: renderCatalogMarkdown(catalog), status: 200 };
    }
  }

  return {
    markdown: joinBlocks([
      frontmatter({
        title: 'Not found',
        description: 'The requested page could not be found.',
      }),
      '# Not found',
      `No Markdown representation is available for ${pathname}.`,
    ]),
    status: 404,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pathname = url.searchParams.get('path') || '/';
  const { markdown, status } = await renderMarkdown(pathname);

  return new Response(`${markdown}\n`, {
    status,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'Content-Location': `${url.origin}${pathname}`,
      'Content-Signal': 'search=yes, ai-train=no, ai-input=yes',
      Vary: 'Accept',
      'x-markdown-tokens': tokenEstimate(markdown),
      ...(pathname === '/' ? { Link: HOMEPAGE_AGENT_LINKS } : {}),
    },
  });
}
