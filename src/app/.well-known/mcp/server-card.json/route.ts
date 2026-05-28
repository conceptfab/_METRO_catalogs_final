import { getSiteUrl } from '@/lib/site-url';

const SERVER_CARD_SCHEMA =
  'https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json';
const SERVER_NAME = 'com.metro.catalogs/catalog-discovery';
const SERVER_VERSION = '0.1.0';
const SUPPORTED_PROTOCOL_VERSIONS = ['2025-06-18'];

function buildServerCard() {
  const base = getSiteUrl();
  const endpoint = `${base}/mcp`;

  return {
    $schema: SERVER_CARD_SCHEMA,
    serverInfo: {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
    transport: {
      type: 'streamable-http',
      endpoint,
    },
    endpoint,
    capabilities: {
      resources: {
        supported: true,
        listChanged: false,
      },
      tools: {
        supported: false,
      },
      prompts: {
        supported: false,
      },
    },
    name: SERVER_NAME,
    version: SERVER_VERSION,
    title: 'METRO Catalog Discovery',
    description:
      'Public discovery metadata for METRO product catalogs, including catalog IDs and related machine-readable resources.',
    websiteUrl: base,
    remotes: [
      {
        type: 'streamable-http',
        url: endpoint,
        supportedProtocolVersions: SUPPORTED_PROTOCOL_VERSIONS,
      },
    ],
    resources: [
      {
        name: 'catalogs',
        description: 'List of available METRO catalog identifiers.',
        uri: `${base}/api/catalogs`,
        mimeType: 'application/json',
      },
      {
        name: 'api-catalog',
        description: 'RFC 9727 API catalog Linkset for this site.',
        uri: `${base}/.well-known/api-catalog`,
        mimeType: 'application/linkset+json',
      },
    ],
    _meta: {
      specification: 'SEP-1649 / SEP-2127 draft MCP Server Card',
      cardUrl: `${base}/.well-known/mcp/server-card.json`,
    },
  };
}

function serverCardHeaders() {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export function GET() {
  return new Response(JSON.stringify(buildServerCard(), null, 2), {
    headers: serverCardHeaders(),
  });
}

export function HEAD() {
  return new Response(null, {
    headers: serverCardHeaders(),
  });
}

export function OPTIONS() {
  return new Response(null, {
    headers: serverCardHeaders(),
  });
}
