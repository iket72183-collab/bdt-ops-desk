# Friction Log — BDT Ops Desk

Judging bonus template for Amazon App Dev 2026. Log real blockers as we ship.

| Date (CT) | Area | Friction | Workaround / ask |
|-----------|------|----------|------------------|
| 2026-09-19 | Alexa+ Preview | No Alexa+ Preview access on builder machine | Ship simulated web chat UI that calls the same tool logic; document `alexa-ai` registration path |
| 2026-09-19 | MCP auth | Alexa+ notes prefer 401 without WWW-Authenticate for some flows | Implement Bearer gate that omits WWW-Authenticate when `MCP_AUTH_TOKEN` is set |
| 2026-09-19 | LinkedIn | No official LinkedIn News API for this use case | Fixture digest + clear interface for a future fetch hook |
| 2026-09-19 | Bedrock | Credentials may be absent in CI / demos | Graceful mock brief when InvokeModel fails |
| 2026-09-19 | MCP SDK | Streamable HTTP vs legacy SSE confusion in older samples | Use `@modelcontextprotocol/sdk` `StreamableHTTPServerTransport` with `enableJsonResponse` |

## Open questions
- Phase 2: OAuth 2.1 / PRM for production Alexa+ account linking
- Bedrock AgentCore hosting path vs ECS/Fargate for the MCP container
