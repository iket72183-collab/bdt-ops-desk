import { config as loadEnv } from 'dotenv';

loadEnv();

export const config = {
  port: Number(process.env.PORT ?? 3000),
  host: process.env.HOST ?? '0.0.0.0',
  mcpAuthToken: process.env.MCP_AUTH_TOKEN?.trim() || undefined,
  githubToken: process.env.GITHUB_TOKEN?.trim() || undefined,
  githubRepos: (process.env.GITHUB_REPOS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  awsRegion: process.env.AWS_REGION ?? 'us-east-1',
  bedrockModelId: process.env.BEDROCK_MODEL_ID ?? 'amazon.nova-pro-v1:0',
};

export type AppConfig = typeof config;
