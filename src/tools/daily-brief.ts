import { generateDailyBrief } from '../lib/bedrock.js';
import { getLinkedInNewsDigest } from './linkedin.js';
import { getGitHubHygiene } from './github.js';

export async function getDailyOpsBrief(): Promise<{
  generatedAt: string;
  summary: string;
  source: 'bedrock' | 'mock';
  modelId?: string;
  linkedIn: unknown;
  github: unknown;
}> {
  const [linkedIn, github] = await Promise.all([
    getLinkedInNewsDigest(),
    getGitHubHygiene(),
  ]);

  const brief = await generateDailyBrief({
    linkedInDigest: linkedIn,
    githubHygiene: github,
  });

  return {
    generatedAt: new Date().toISOString(),
    summary: brief.summary,
    source: brief.source,
    modelId: brief.modelId,
    linkedIn,
    github,
  };
}
