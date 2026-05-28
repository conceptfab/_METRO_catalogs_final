import { getSiteUrl } from '@/lib/site-url';

const API_CATALOG_PROFILE = 'https://www.rfc-editor.org/info/rfc9727';
const API_CATALOG_CONTENT_TYPE = `application/linkset+json; profile="${API_CATALOG_PROFILE}"; charset=utf-8`;
const API_CATALOG_LINK =
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"';

function buildApiCatalog() {
  const base = getSiteUrl();

  return {
    linkset: [
      {
        anchor: `${base}/.well-known/api-catalog`,
        item: [
          {
            href: `${base}/api/catalogs`,
            type: 'application/json',
            title: 'Catalog listing API',
          },
        ],
      },
    ],
  };
}

function apiCatalogHeaders() {
  return {
    'Content-Type': API_CATALOG_CONTENT_TYPE,
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    Link: API_CATALOG_LINK,
  };
}

export function GET() {
  return new Response(JSON.stringify(buildApiCatalog(), null, 2), {
    headers: apiCatalogHeaders(),
  });
}

export function HEAD() {
  return new Response(null, {
    headers: apiCatalogHeaders(),
  });
}
