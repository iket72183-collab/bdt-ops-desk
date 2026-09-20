# Friction log — BDT Ops Desk (Amazon App Dev 2026)

## Entry 1 — AWS free developer account Root console
- **Task:** Sign into AWS Root console to enable Bedrock for AWS Builder mini-challenge
- **Steps:** Opened billing/console URLs on the agent browser; cleared cookies; tried Root sign-in for the new free developer account
- **Expected:** Clean Root sign-in
- **Actual:** Persistent “Bad Request / Invalid request” on console OAuth; CLI `aws login --remote` succeeded instead
- **Severity:** High (blocks console-only setup)
- **Workaround:** AWS CLI device/remote login + drive work from CLI/SDK
- **Suggestion:** Free-tier Root console sessions should not fail closed with opaque Bad Request when CLI login works for the same account

## Entry 2 — Bedrock during account verification
- **Task:** Invoke `amazon.nova-pro-v1:0` for `get_daily_ops_brief`
- **Steps:** `aws bedrock-runtime invoke-model` and SDK InvokeModel from the MCP server
- **Expected:** Model response for founder brief
- **Actual:** `AccessDeniedException` — account currently being verified (usually &lt; 2 hours)
- **Severity:** Medium
- **Workaround:** Mock brief path that still returns structured LinkedIn + GitHub actions
- **Suggestion:** Surface verification status in Bedrock console/CLI with ETA and which APIs remain available

## Entry 3 — Alexa+ Preview / MCP Toolkit access
- **Task:** Register self-hosted MCP add-on with Alexa+ for a live voice demo
- **Steps:** Reviewed Alexa+ MCP QuickStart (Streamable HTTP, OAuth 2.1/PRM requirements)
- **Expected:** Immediate Preview onboarding for hackathon entrants
- **Actual:** Full account-linking (OAuth/PRM) is Phase 2; simulated web chat used for demo reliability
- **Severity:** Medium
- **Workaround:** Simulated Alexa+ UI calling the same MCP tools over Streamable HTTP
- **Suggestion:** Hackathon track page should deep-link a “sandbox MCP URL” registration that skips production OAuth for demos
