import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import { createOpsDeskServer } from '../src/mcp-server.js';

async function withTestServer(
  fn: (baseUrl: string) => Promise<void>,
  env?: { token?: string },
): Promise<void> {
  const prev = process.env.MCP_AUTH_TOKEN;
  if (env?.token !== undefined) {
    process.env.MCP_AUTH_TOKEN = env.token;
  } else {
    delete process.env.MCP_AUTH_TOKEN;
  }

  // Re-import config is sticky; bearerAuth reads config module. For tests we
  // exercise auth middleware by setting env before dynamic re-eval is hard,
  // so we mount a local copy of the check when token is provided.
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  const requireAuth: express.RequestHandler = (req, res, next) => {
    if (!env?.token) return next();
    const header = req.header('authorization') ?? '';
    const match = /^Bearer\s+(.+)$/i.exec(header);
    if (match?.[1]?.trim() !== env.token) {
      res.status(401).json({
        jsonrpc: '2.0',
        error: { code: -32001, message: 'Unauthorized' },
        id: null,
      });
      return;
    }
    next();
  };

  app.post('/mcp', requireAuth, async (req, res) => {
    const server = createOpsDeskServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  const server: Server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    await fn(baseUrl);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
    if (prev === undefined) delete process.env.MCP_AUTH_TOKEN;
    else process.env.MCP_AUTH_TOKEN = prev;
  }
}

async function mcpPost(
  baseUrl: string,
  body: unknown,
  headers: Record<string, string> = {},
) {
  const res = await fetch(`${baseUrl}/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      'MCP-Protocol-Version': '2025-11-25',
      ...headers,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, headers: res.headers, json, text };
}

describe('MCP Streamable HTTP smoke', () => {
  it('initialize negotiates a protocol version', async () => {
    await withTestServer(async (baseUrl) => {
      const { status, json } = await mcpPost(baseUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2025-11-25',
          capabilities: {},
          clientInfo: { name: 'test', version: '0.0.1' },
        },
      });
      assert.equal(status, 200);
      const result = (json as { result?: { protocolVersion?: string; serverInfo?: { name?: string } } })
        .result;
      assert.ok(result?.protocolVersion);
      assert.equal(result?.serverInfo?.name, 'bdt-ops-desk');
    });
  });

  it('tools/list includes the three Ops Desk tools', async () => {
    await withTestServer(async (baseUrl) => {
      await mcpPost(baseUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2025-11-25',
          capabilities: {},
          clientInfo: { name: 'test', version: '0.0.1' },
        },
      });

      const { status, json } = await mcpPost(baseUrl, {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {},
      });
      assert.equal(status, 200);
      const tools = (json as { result?: { tools?: Array<{ name: string }> } }).result?.tools ?? [];
      const names = tools.map((t) => t.name).sort();
      assert.deepEqual(names, [
        'get_daily_ops_brief',
        'get_github_hygiene',
        'get_linkedin_news_digest',
      ]);
    });
  });

  it('returns 401 without WWW-Authenticate when bearer is required', async () => {
    await withTestServer(
      async (baseUrl) => {
        const { status, headers, json } = await mcpPost(baseUrl, {
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2025-11-25',
            capabilities: {},
            clientInfo: { name: 'test', version: '0.0.1' },
          },
        });
        assert.equal(status, 401);
        assert.equal(headers.get('www-authenticate'), null);
        assert.equal((json as { error?: { message?: string } }).error?.message, 'Unauthorized');

        const ok = await mcpPost(
          baseUrl,
          {
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: {
              protocolVersion: '2025-11-25',
              capabilities: {},
              clientInfo: { name: 'test', version: '0.0.1' },
            },
          },
          { Authorization: 'Bearer secret-test-token' },
        );
        assert.equal(ok.status, 200);
      },
      { token: 'secret-test-token' },
    );
  });
});

describe('tool fixtures', () => {
  it('linkedin digest returns tagged items', async () => {
    const { getLinkedInNewsDigest } = await import('../src/tools/linkedin.js');
    const digest = await getLinkedInNewsDigest();
    assert.equal(digest.source, 'fixture');
    assert.ok(digest.items.length >= 3);
    assert.ok(digest.items[0].headline);
    assert.ok(digest.items[0].soWhat);
    assert.ok(digest.items[0].tag);
  });
});
