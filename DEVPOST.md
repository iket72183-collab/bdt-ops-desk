# Devpost draft — BDT Ops Desk

## Inspiration
Founders of early-stage studios spend mornings bouncing between LinkedIn market signals and GitHub fire drills. BDT Talent Group (Catholic Daily Scripture, Add Me – Social Card) needed one voice/agent surface: **what changed, what is broken, what to do next**.

## What it does
**BDT Ops Desk** is an MCP server (Streamable HTTP, protocol 2025-11-25+) with three tools:
1. `get_linkedin_news_digest` — headline / so-what / tag digest
2. `get_github_hygiene` — open PRs, stale issues, failing checks
3. `get_daily_ops_brief` — Amazon Bedrock (Nova Pro) combined founder brief

A **simulated Alexa+ web chat** demos the experience without Preview access. Same tools are ready to register with the Alexa+ MCP Toolkit later.

## How we built it
- Node.js 20 + TypeScript
- Official `@modelcontextprotocol/sdk` Streamable HTTP transport (`POST /mcp`)
- Amazon Bedrock Runtime `InvokeModel` (`amazon.nova-pro-v1:0`, `us-east-1`)
- Optional live GitHub API when `GITHUB_TOKEN` is present
- Dockerfile for ECS / AgentCore-ready container deploy

## Challenges
See `FRICTION-LOG.md` — Alexa+ Preview availability, LinkedIn data access, and auth header nuances for MCP clients.

## Accomplishments
- Runnable MCP initialize + tools/list
- End-to-end demo UI
- Bedrock path with safe mock fallback
- MIT-licensed, documented submission checklist

## What we learned
Streamable HTTP (not legacy SSE) is the Alexa+ track requirement; keeping tools fast and fixture-backed makes demos reliable when APIs or credentials flake.

## What's next
- Live LinkedIn fetch hook behind the same schema
- OAuth 2.1 for Alexa+ account linking
- Host MCP on Bedrock AgentCore / ECS with IAM roles (no long-lived keys)

## Example Alexa+ / voice phrases
- "Alexa, ask Ops Desk what's in LinkedIn News today."
- "Alexa, ask Ops Desk how healthy our GitHub work is."
- "Alexa, ask Ops Desk for my daily ops brief."
- "Alexa, open Ops Desk and summarize failing checks."
