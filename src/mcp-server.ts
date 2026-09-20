import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getLinkedInNewsDigest } from './tools/linkedin.js';
import { getGitHubHygiene } from './tools/github.js';
import { getDailyOpsBrief } from './tools/daily-brief.js';

function asText(data: unknown) {
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

/** Fresh McpServer per request (stateless Streamable HTTP). */
export function createOpsDeskServer(): McpServer {
  const server = new McpServer({
    name: 'bdt-ops-desk',
    version: '1.0.0',
  });

  server.registerTool(
    'get_linkedin_news_digest',
    {
      description:
        'Return a structured LinkedIn News-style digest for BDT (headline, soWhat, tag). Uses fixtures in v1.',
    },
    async () => asText(await getLinkedInNewsDigest()),
  );

  server.registerTool(
    'get_github_hygiene',
    {
      description:
        'Summarize open PRs, stale issues, and failing checks for configured GitHub repos. Uses live API when GITHUB_TOKEN is set; otherwise fixtures.',
    },
    async () => asText(await getGitHubHygiene()),
  );

  server.registerTool(
    'get_daily_ops_brief',
    {
      description:
        'Combine LinkedIn digest + GitHub hygiene into a founder daily ops brief. Uses Amazon Bedrock (Nova Pro) when AWS credentials are available; otherwise a mock brief.',
    },
    async () => asText(await getDailyOpsBrief()),
  );

  return server;
}
