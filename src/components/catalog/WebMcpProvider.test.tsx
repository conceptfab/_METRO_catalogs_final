import { render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import WebMcpProvider from './WebMcpProvider';

describe('<WebMcpProvider />', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(navigator, 'modelContext');
    Reflect.deleteProperty(window, 'fetch');
  });

  it('provides and registers WebMCP tools on page load', async () => {
    const provideContext = vi.fn();
    const registerTool = vi.fn();

    Object.defineProperty(navigator, 'modelContext', {
      configurable: true,
      value: {
        provideContext,
        registerTool,
      },
    });

    render(<WebMcpProvider />);

    await waitFor(() => {
      expect(provideContext).toHaveBeenCalledOnce();
      expect(registerTool).toHaveBeenCalledTimes(4);
    });

    const providedTools = provideContext.mock.calls[0][0].tools;
    expect(providedTools).toHaveLength(4);
    expect(providedTools[0]).toMatchObject({
      name: 'metro.catalogs.list',
      description: expect.any(String),
      inputSchema: expect.objectContaining({ type: 'object' }),
      execute: expect.any(Function),
    });

    expect(registerTool).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'metro.catalogs.open',
        inputSchema: expect.objectContaining({
          required: ['catalogId'],
        }),
        execute: expect.any(Function),
      }),
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it('exposes an executable catalog list tool', async () => {
    Object.defineProperty(window, 'fetch', {
      configurable: true,
      value: vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ catalogs: ['QX', 'QS'] }),
      }),
    });

    const registerTool = vi.fn();
    Object.defineProperty(navigator, 'modelContext', {
      configurable: true,
      value: {
        registerTool,
      },
    });

    render(<WebMcpProvider />);

    await waitFor(() => {
      expect(registerTool).toHaveBeenCalled();
    });

    const listTool = registerTool.mock.calls
      .map(([tool]) => tool)
      .find((tool) => tool.name === 'metro.catalogs.list');

    await expect(listTool.execute({})).resolves.toEqual({
      catalogs: [
        { id: 'QX', url: '/catalog/QX' },
        { id: 'QS', url: '/catalog/QS' },
      ],
    });
  });
});
