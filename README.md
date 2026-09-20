# BDT Ops Desk

Founder ops assistant for **BDT Talent Group** — Amazon Developer Hackathon 2026 (Alexa+ track + AWS Builder mini-challenge).

Self-hosted **MCP server** over **Streamable HTTP** (protocol **2025-11-25** via `@modelcontextprotocol/sdk`) plus a **simulated Alexa+ web chat** for demos without Preview access.

## Tools

| Tool | Purpose |
|------|---------|
| `get_linkedin_news_digest` | Fixture LinkedIn-style digest (`headline` / `soWhat` / `tag`) |
| `get_github_hygiene` | Open PRs, stale issues, failing checks (live GitHub API or fixture) |
| `get_daily_ops_brief` | Combined brief via **Amazon Bedrock** `amazon.nova-pro-v1:0` (mock fallback) |

## Quick start

```bash
cd bdt-ops-desk
cp .env.example .env
npm install
npm test
npm run build
npm start
```

Dev (hot reload):

```bash
npm run dev
```

Open the simulated Alexa+ UI: [http://127.0.0.1:3000/](http://127.0.0.1:3000/)

MCP endpoint: `POST http://127.0.0.1:3000/mcp`

### Optional env

See `.env.example`:

- `MCP_AUTH_TOKEN` — when set, require `Authorization: Bearer …` (401 **without** `WWW-Authenticate`)
- `GITHUB_TOKEN` + `GITHUB_REPOS` — live hygiene; otherwise fixtures
- AWS default credential chain + `AWS_REGION` / `BEDROCK_MODEL_ID` — live Bedrock; otherwise mock brief

**Do not commit secrets.** Prefer IAM roles in deployed environments.

## Demo: curl initialize + tools/list

```bash
# Initialize (stateless JSON response)
curl -sS http://127.0.0.1:3000/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H 'MCP-Protocol-Version: 2025-11-25' \
  -d '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"initialize",
    "params":{
      "protocolVersion":"2025-11-25",
      "capabilities":{},
      "clientInfo":{"name":"curl","version":"0.0.1"}
    }
  }'

# tools/list
curl -sS http://127.0.0.1:3000/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H 'MCP-Protocol-Version: 2025-11-25' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

If `MCP_AUTH_TOKEN` is set, add `-H "Authorization: Bearer $MCP_AUTH_TOKEN"` to both calls.

## Alexa+ track notes

1. This repo **imports and runs** `@modelcontextprotocol/sdk` at runtime (`StreamableHTTPServerTransport`).
2. Transport is **Streamable HTTP** on `POST /mcp` (not legacy standalone HTTP+SSE).
3. Simulated UI proves the agent loop without Alexa+ Preview.
4. Later registration (when you have Preview): use the Alexa+ MCP Toolkit / `alexa-ai` CLI to add an Add-on Agent Skill pointed at your public HTTPS MCP URL, with Bearer token matching `MCP_AUTH_TOKEN`.
5. **Phase 2:** OAuth 2.1 / PRM for production account linking (out of scope for v1).

## AWS Builder mini-challenge

- **Bedrock Runtime** `InvokeModel` with Nova Pro in `us-east-1` for `get_daily_ops_brief`
- **Dockerfile** included for ECS / Fargate / AgentCore-ready container packaging
- Document IAM: `bedrock:InvokeModel` on the chosen model ID; no long-lived keys in the repo

## Scripts

| Script | Action |
|--------|--------|
| `npm run build` | Compile TypeScript + copy static assets |
| `npm start` | Run compiled server |
| `npm run dev` | `tsx watch` for local iteration |
| `npm test` | Minimal MCP initialize + tools/list smoke tests |

## Contest links

- Devpost: https://amazonappdev2026.devpost.com/
- Draft write-up: [`DEVPOST.md`](./DEVPOST.md)
- Friction log: [`FRICTION-LOG.md`](./FRICTION-LOG.md)
- Brief: [`PROJECT-BRIEF.md`](./PROJECT-BRIEF.md)

## License

MIT — see [`LICENSE`](./LICENSE).
