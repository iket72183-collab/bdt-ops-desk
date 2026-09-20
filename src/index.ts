import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import express from 'express';
import { config } from './lib/config.js';
import { bearerAuth } from './lib/auth.js';
import { createOpsDeskServer } from './mcp-server.js';
import { getLinkedInNewsDigest } from './tools/linkedin.js';
import { getGitHubHygiene } from './tools/github.js';
import { getDailyOpsBrief } from './tools/daily-brief.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, 'public');

const app = createMcpExpressApp({
  host: config.host,
  allowedHosts: ['localhost', '127.0.0.1', '[::1]'],
});

app.use(express.static(publicDir));

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    name: 'bdt-ops-desk',
    protocol: '2025-11-25',
    transport: 'streamable-http',
    authRequired: Boolean(config.mcpAuthToken),
  });
});

/** Convenience REST helpers for the simulated Alexa+ web UI (same logic as MCP tools). */
app.get('/api/tools/linkedin', bearerAuth, async (_req, res) => {
  try {
    res.json(await getLinkedInNewsDigest());
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/tools/github', bearerAuth, async (_req, res) => {
  try {
    res.json(await getGitHubHygiene());
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/tools/daily-brief', bearerAuth, async (_req, res) => {
  try {
    res.json(await getDailyOpsBrief());
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/mcp', bearerAuth, async (req, res) => {
  const server = createOpsDeskServer();
  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    res.on('close', () => {
      void transport.close();
      void server.close();
    });
  } catch (error) {
    console.error('MCP POST error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      });
    }
  }
});

app.get('/mcp', bearerAuth, (_req, res) => {
  res.status(405).json({
    jsonrpc: '2.0',
    error: { code: -32000, message: 'Method not allowed. Use POST for Streamable HTTP in this scaffold.' },
    id: null,
  });
});

app.delete('/mcp', bearerAuth, (_req, res) => {
  res.status(405).json({
    jsonrpc: '2.0',
    error: { code: -32000, message: 'Method not allowed (stateless mode).' },
    id: null,
  });
});

app.listen(config.port, config.host, () => {
  console.log(`BDT Ops Desk listening on http://${config.host}:${config.port}`);
  console.log(`MCP endpoint: POST http://${config.host}:${config.port}/mcp`);
  console.log(`Simulated Alexa+ UI: http://127.0.0.1:${config.port}/`);
  console.log(`Auth required: ${Boolean(config.mcpAuthToken)}`);
});
