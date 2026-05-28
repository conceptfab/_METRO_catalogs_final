import { getCatalogList } from '@/lib/catalog-loader';
import { getSiteUrl } from '@/lib/site-url';

export const runtime = 'nodejs';

const SERVER_INFO = {
  name: 'com.metro.catalogs/catalog-discovery',
  version: '0.1.0',
};
const PROTOCOL_VERSION = '2025-06-18';
const CAPABILITIES = {
  resources: {
    listChanged: false,
  },
  tools: {
    listChanged: false,
  },
  prompts: {
    listChanged: false,
  },
};

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: {
    uri?: string;
  };
};

function mcpHeaders() {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, MCP-Protocol-Version',
  };
}

function resultResponse(id: JsonRpcRequest['id'], result: unknown) {
  return {
    jsonrpc: '2.0',
    id,
    result,
  };
}

function errorResponse(
  id: JsonRpcRequest['id'],
  code: number,
  message: string,
) {
  return {
    jsonrpc: '2.0',
    id: id ?? null,
    error: {
      code,
      message,
    },
  };
}

async function listCatalogResources() {
  const base = getSiteUrl();
  const catalogs = await getCatalogList();

  return [
    {
      uri: `${base}/api/catalogs`,
      name: 'catalogs',
      description: 'List of available METRO catalog identifiers.',
      mimeType: 'application/json',
    },
    ...catalogs.map((catalog) => ({
      uri: `${base}/catalog/${catalog.id}`,
      name: catalog.meta.title,
      description: catalog.meta.description,
      mimeType: 'text/html',
    })),
  ];
}

async function handleRpc(request: JsonRpcRequest) {
  switch (request.method) {
    case 'initialize':
      return resultResponse(request.id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: CAPABILITIES,
        serverInfo: SERVER_INFO,
      });
    case 'resources/list':
      return resultResponse(request.id, {
        resources: await listCatalogResources(),
      });
    case 'resources/read':
      if (request.params?.uri === `${getSiteUrl()}/api/catalogs`) {
        return resultResponse(request.id, {
          contents: [
            {
              uri: request.params.uri,
              mimeType: 'application/json',
              text: JSON.stringify(
                {
                  catalogs: (await getCatalogList()).map((catalog) => catalog.id),
                },
                null,
                2,
              ),
            },
          ],
        });
      }
      return errorResponse(request.id, -32602, 'Unsupported resource URI');
    case 'tools/list':
      return resultResponse(request.id, {
        tools: [],
      });
    case 'prompts/list':
      return resultResponse(request.id, {
        prompts: [],
      });
    default:
      return errorResponse(request.id, -32601, 'Method not found');
  }
}

export function GET() {
  return new Response(
    JSON.stringify(
      {
        serverInfo: SERVER_INFO,
        protocolVersion: PROTOCOL_VERSION,
        capabilities: CAPABILITIES,
      },
      null,
      2,
    ),
    {
      headers: mcpHeaders(),
    },
  );
}

export async function POST(request: Request) {
  let body: JsonRpcRequest;

  try {
    body = (await request.json()) as JsonRpcRequest;
  } catch {
    return new Response(JSON.stringify(errorResponse(null, -32700, 'Parse error')), {
      status: 400,
      headers: mcpHeaders(),
    });
  }

  if (body.id === undefined && body.method?.startsWith('notifications/')) {
    return new Response(null, {
      status: 202,
      headers: mcpHeaders(),
    });
  }

  return new Response(JSON.stringify(await handleRpc(body), null, 2), {
    headers: mcpHeaders(),
  });
}

export function OPTIONS() {
  return new Response(null, {
    headers: mcpHeaders(),
  });
}
