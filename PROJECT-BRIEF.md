# BDT Ops Desk — Amazon App Dev 2026 brief

## Contest
- Hackathon: Build, Ship, Shape — Amazon Developer Hackathon 2026
- Devpost: https://amazonappdev2026.devpost.com/
- Deadline: Oct 23, 2026 @ 12:00pm PDT
- Entrant GitHub: iket72183-collab
- Primary track: Alexa+
- Mini-challenge: AWS Builder

## Product
Working title: **BDT Ops Desk**

A founder ops assistant for BDT Talent Group (early-stage tech/digital services; apps: Catholic Daily Scripture, Add Me – Social Card).

Voice/agent experience that answers:
1. What happened in LinkedIn News today? (digest-style brief)
2. How healthy is our GitHub work right now? (open PRs, stale issues, CI failures)
3. Give me a daily ops brief combining both.

## Technical requirements (must satisfy)
### Alexa+ track
- Self-hosted MCP server implementing MCP protocol **2025-11-25 or later**
- Transport: **Streamable HTTP** (not legacy standalone HTTP+SSE)
- Repo must actually call/import MCP at runtime (not README-only)
- Also include a **simulated Alexa+ web chat UI** so the demo works without Alexa+ Preview access
- Document how to register with Alexa+ MCP Toolkit later (`alexa-ai` CLI / Add-on Agent Skill)

### AWS Builder mini-challenge
Documented use of AWS services. Prefer:
- **Amazon Bedrock** for summarization / brief generation
- **Bedrock AgentCore** (or clear path) for hosting the agent/MCP runtime if feasible in scaffold time
- Fallback: Bedrock Runtime InvokeModel from the MCP tool handlers + Dockerfile ready for AgentCore/ECS

AWS account for runtime (already CLI-authenticated on the builder machine): `984675941027`, region `us-east-1`. Do **not** commit credentials. Use env vars / IAM roles.

## Suggested MCP tools
1. `get_linkedin_news_digest` — returns structured digest items (headline, so-what, tag). Stub with sample fixtures + optional HTTP fetch hook.
2. `get_github_hygiene` — summarize open PRs / failing checks for configured repos via GitHub API token env.
3. `get_daily_ops_brief` — Bedrock-assisted combined brief for the founder.

Keep tools fast (<500ms where possible for Alexa+); heavy work should be cached or stubbed with clear TODOs.

## Deliverables in repo
- Runnable MCP server (Node/TypeScript preferred; Python OK if cleaner)
- `POST /mcp` Streamable HTTP endpoint
- Simple auth: Bearer token via `MCP_AUTH_TOKEN` (401 without WWW-Authenticate for unauthenticated, matching Alexa+ notes where practical for hackathon)
- Simulated web UI for demo
- `README.md` with run/demo/submit instructions
- `LICENSE` (MIT)
- `FRICTION-LOG.md` starter template (judging bonus)
- `DEVPOST.md` draft description + example phrases
- `.env.example` (no secrets)
- Dockerfile
- Minimal tests proving MCP initialize + tools/list work

## Out of scope for v1 scaffold
- Full OAuth 2.1 / PRM for Alexa+ production account linking (document as Phase 2)
- Real LinkedIn scraping automation (use fixtures + interface)
- Live email sending

## Success criteria for this scaffold PR/main
1. `npm start` (or equivalent) serves MCP over Streamable HTTP
2. A client can `initialize` and `tools/list` against it
3. Simulated web UI can call at least one tool end-to-end
4. Bedrock call path exists (works when AWS creds present; graceful mock when not)
5. README explains Alexa+ track + AWS Builder submission checklist
