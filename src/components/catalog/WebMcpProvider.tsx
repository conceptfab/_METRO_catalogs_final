'use client';

import { useEffect } from 'react';

type JsonSchema = {
  type: 'object';
  properties?: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
};

type WebMcpTool = {
  name: string;
  title: string;
  description: string;
  inputSchema: JsonSchema;
  execute: (input: Record<string, unknown>) => Promise<unknown>;
  annotations?: {
    readOnlyHint?: boolean;
    untrustedContentHint?: boolean;
  };
};

type ModelContext = {
  registerTool?: (
    tool: WebMcpTool,
    options?: { signal?: AbortSignal },
  ) => void;
  provideContext?: (context: { tools: WebMcpTool[] }) => void | Promise<void>;
};

declare global {
  interface Navigator {
    modelContext?: ModelContext;
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function fetchText(url: string, accept: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      Accept: accept,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.text();
}

function normalizeCatalogId(value: unknown): string {
  return String(value ?? '').trim().toUpperCase();
}

function buildWebMcpTools(): WebMcpTool[] {
  return [
    {
      name: 'metro.catalogs.list',
      title: 'List METRO catalogs',
      description:
        'Return the available METRO catalog identifiers and their public catalog URLs.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      annotations: {
        readOnlyHint: true,
      },
      async execute() {
        const data = await fetchJson<{ catalogs: string[] }>('/api/catalogs');
        return {
          catalogs: data.catalogs.map((id) => ({
            id,
            url: `/catalog/${id}`,
          })),
        };
      },
    },
    {
      name: 'metro.catalogs.search',
      title: 'Search METRO catalogs',
      description:
        'Search available METRO catalogs by identifier or page text and return matching catalog URLs.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search text, such as QX, QS, desk, finishes, or codes.',
          },
        },
        required: ['query'],
        additionalProperties: false,
      },
      annotations: {
        readOnlyHint: true,
        untrustedContentHint: true,
      },
      async execute(input) {
        const query = String(input.query ?? '').trim().toLowerCase();
        const data = await fetchJson<{ catalogs: string[] }>('/api/catalogs');
        const results = await Promise.all(
          data.catalogs.map(async (id) => {
            const markdown = await fetchText(`/catalog/${id}`, 'text/markdown');
            const haystack = `${id}\n${markdown}`.toLowerCase();
            return haystack.includes(query)
              ? {
                  id,
                  url: `/catalog/${id}`,
                  title: markdown.match(/^#\s+(.+)$/m)?.[1] ?? id,
                }
              : null;
          }),
        );

        return {
          query,
          results: results.filter(Boolean),
        };
      },
    },
    {
      name: 'metro.catalogs.readMarkdown',
      title: 'Read catalog as Markdown',
      description:
        'Return a compact Markdown representation of the homepage or a METRO catalog page.',
      inputSchema: {
        type: 'object',
        properties: {
          catalogId: {
            type: 'string',
            description:
              'Optional catalog identifier, for example QX or QS. Omit for the homepage.',
          },
        },
        additionalProperties: false,
      },
      annotations: {
        readOnlyHint: true,
        untrustedContentHint: true,
      },
      async execute(input) {
        const catalogId = normalizeCatalogId(input.catalogId);
        const url = catalogId ? `/catalog/${catalogId}` : '/';
        return {
          url,
          markdown: await fetchText(url, 'text/markdown'),
        };
      },
    },
    {
      name: 'metro.catalogs.open',
      title: 'Open METRO catalog',
      description:
        'Navigate the current browser tab to a METRO catalog page by catalog identifier.',
      inputSchema: {
        type: 'object',
        properties: {
          catalogId: {
            type: 'string',
            description: 'Catalog identifier to open, for example QX or QS.',
          },
        },
        required: ['catalogId'],
        additionalProperties: false,
      },
      async execute(input) {
        const catalogId = normalizeCatalogId(input.catalogId);
        if (!/^[A-Z0-9-]+$/.test(catalogId)) {
          throw new Error('catalogId must contain only letters, numbers, or hyphens');
        }

        const url = `/catalog/${catalogId}`;
        window.location.assign(url);
        return {
          navigated: true,
          url,
        };
      },
    },
  ];
}

export default function WebMcpProvider() {
  useEffect(() => {
    const modelContext = navigator.modelContext;
    if (!modelContext) return;

    const abortController = new AbortController();
    const tools = buildWebMcpTools();

    // WebMCP is still evolving; support both the scanner-facing and draft APIs.
    void modelContext.provideContext?.({ tools });

    if (modelContext.registerTool) {
      for (const tool of tools) {
        try {
          modelContext.registerTool(tool, {
            signal: abortController.signal,
          });
        } catch (error) {
          if (
            !(error instanceof DOMException) ||
            error.name !== 'InvalidStateError'
          ) {
            throw error;
          }
        }
      }
    }

    return () => {
      abortController.abort();
    };
  }, []);

  return null;
}
