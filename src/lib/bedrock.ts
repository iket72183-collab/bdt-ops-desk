import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { config } from './config.js';

export interface BriefInputs {
  linkedInDigest: unknown;
  githubHygiene: unknown;
}

/**
 * Invoke Amazon Nova Pro for a founder-facing daily ops brief.
 * Returns a mock summary when credentials are missing or the call fails.
 */
export async function generateDailyBrief(inputs: BriefInputs): Promise<{
  summary: string;
  source: 'bedrock' | 'mock';
  modelId?: string;
}> {
  const prompt = [
    'You are Ops Desk for BDT Talent Group (apps: Catholic Daily Scripture, Add Me – Social Card).',
    'Write a crisp founder daily ops brief (max ~180 words) with:',
    '1) LinkedIn news takeaways',
    '2) GitHub hygiene risks',
    '3) Top 3 actions for today',
    'Use plain text, short bullets. No markdown fences.',
    '',
    'LinkedIn digest JSON:',
    JSON.stringify(inputs.linkedInDigest),
    '',
    'GitHub hygiene JSON:',
    JSON.stringify(inputs.githubHygiene),
  ].join('\n');

  try {
    const client = new BedrockRuntimeClient({ region: config.awsRegion });
    const body = {
      messages: [
        {
          role: 'user',
          content: [{ text: prompt }],
        },
      ],
      inferenceConfig: {
        maxTokens: 600,
        temperature: 0.3,
      },
    };

    const response = await client.send(
      new InvokeModelCommand({
        modelId: config.bedrockModelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: Buffer.from(JSON.stringify(body)),
      }),
    );

    const raw = new TextDecoder().decode(response.body);
    const parsed = JSON.parse(raw) as {
      output?: { message?: { content?: Array<{ text?: string }> } };
      results?: Array<{ outputText?: string }>;
    };

    const text =
      parsed.output?.message?.content?.map((c) => c.text ?? '').join('') ||
      parsed.results?.[0]?.outputText ||
      '';

    if (!text.trim()) {
      throw new Error('Empty Bedrock response');
    }

    return {
      summary: text.trim(),
      source: 'bedrock',
      modelId: config.bedrockModelId,
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    return {
      summary: mockBrief(inputs, reason),
      source: 'mock',
    };
  }
}

function mockBrief(inputs: BriefInputs, reason: string): string {
  const li = Array.isArray(inputs.linkedInDigest)
    ? inputs.linkedInDigest
    : (inputs.linkedInDigest as { items?: unknown[] })?.items ?? [];
  const items = Array.isArray(li) ? li : [];
  const headlines = items
    .slice(0, 3)
    .map((i: { headline?: string }) => `• ${i.headline ?? 'Signal'}`)
    .join('\n');

  const gh = inputs.githubHygiene as {
    summary?: { openPrCount?: number; staleIssueCount?: number; failingCheckCount?: number };
    source?: string;
  };

  return [
    'BDT Ops Desk — Daily brief (mock; Bedrock unavailable)',
    `Reason: ${reason}`,
    '',
    'LinkedIn signals:',
    headlines || '• No fixture headlines',
    '',
    'GitHub hygiene:',
    `• Open PRs: ${gh.summary?.openPrCount ?? 0}`,
    `• Stale issues: ${gh.summary?.staleIssueCount ?? 0}`,
    `• Failing checks: ${gh.summary?.failingCheckCount ?? 0}`,
    `• Source: ${gh.source ?? 'unknown'}`,
    '',
    'Top actions:',
    '1. Triage failing CI before new feature work',
    '2. Close or comment on the oldest stale issue',
    '3. Turn one LinkedIn signal into a client outreach note',
  ].join('\n');
}
