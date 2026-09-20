# Devpost fields to paste

## Project name
BDT Ops Desk

## Tagline (short)
Founder ops desk for Alexa+: LinkedIn news, GitHub hygiene, and a Bedrock daily brief over MCP.

## Description
BDT Ops Desk is a self-hosted MCP server (Streamable HTTP, protocol 2025-11-25) that gives early-stage founders a single agent surface for morning ops.

Built for BDT Talent Group (Catholic Daily Scripture, Add Me – Social Card). Three tools power the experience:

1. get_linkedin_news_digest — headline / so-what / tag digest (fixture-backed for reliable demos)
2. get_github_hygiene — open PRs, stale issues, failing checks via GitHub API
3. get_daily_ops_brief — Amazon Bedrock Nova Pro combined brief, with a safe mock fallback when the AWS account is still verifying

Includes a simulated Alexa+ web chat so judges can see the flow without Alexa+ Preview access. Same MCP endpoint is ready for Alexa+ MCP Toolkit registration (OAuth/PRM Phase 2).

Stack: Node 20, TypeScript, @modelcontextprotocol/sdk, Amazon Bedrock Runtime, optional GitHub API, Dockerfile for ECS/AgentCore.

Repo: https://github.com/iket72183-collab/bdt-ops-desk (MIT)

## Tracks
Primary: Alexa+
Mini-challenges: AWS Builder, Open Source

## Built with
MCP, Streamable HTTP, TypeScript, Node.js, Amazon Bedrock, Amazon Nova Pro, GitHub API, Express, Docker

## Product feedback
- MCP SDK Streamable HTTP: clear initialize/tools path; auth header nuances across clients need sharper examples.
- Alexa+ MCP Toolkit docs: excellent QuickStart; OAuth/PRM bar is high for a 3-week hackathon — a demo-tier registration would help.
- AWS free developer + Bedrock: CLI remote login saved us when Root console returned Bad Request; Bedrock correctly gated during account verification but the error should link a status page.
- Would build again with MCP + Bedrock once verification clears.

## AWS Builder notes
Uses Amazon Bedrock Runtime InvokeModel (amazon.nova-pro-v1:0, us-east-1) inside get_daily_ops_brief. Dockerfile prepared for container deploy toward AgentCore/ECS. During submission, account verification blocked live InvokeModel; mock path documented.

## Open Source notes
New public MIT repo: https://github.com/iket72183-collab/bdt-ops-desk
GitHub username: iket72183-collab
