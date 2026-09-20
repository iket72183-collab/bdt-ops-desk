import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../lib/config.js';

export interface HygieneReport {
  generatedAt: string;
  source: 'github-api' | 'fixture';
  repos: Array<{
    repo: string;
    openPullRequests: Array<Record<string, unknown>>;
    staleIssues: Array<Record<string, unknown>>;
    failingChecks: Array<Record<string, unknown>>;
  }>;
  summary: {
    openPrCount: number;
    staleIssueCount: number;
    failingCheckCount: number;
  };
}

function fixturePath(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, '..', 'fixtures', 'github-hygiene.json');
}

async function loadFixture(): Promise<HygieneReport> {
  const raw = await readFile(fixturePath(), 'utf8');
  const data = JSON.parse(raw) as HygieneReport;
  return { ...data, generatedAt: new Date().toISOString(), source: 'fixture' };
}

const STALE_DAYS = 21;

export async function getGitHubHygiene(): Promise<HygieneReport> {
  if (!config.githubToken || config.githubRepos.length === 0) {
    return loadFixture();
  }

  try {
    const repos = [];
    for (const full of config.githubRepos) {
      const [owner, name] = full.split('/');
      if (!owner || !name) continue;
      repos.push(await fetchRepoHygiene(owner, name, config.githubToken));
    }

    const summary = {
      openPrCount: repos.reduce((n, r) => n + r.openPullRequests.length, 0),
      staleIssueCount: repos.reduce((n, r) => n + r.staleIssues.length, 0),
      failingCheckCount: repos.reduce((n, r) => n + r.failingChecks.length, 0),
    };

    return {
      generatedAt: new Date().toISOString(),
      source: 'github-api',
      repos,
      summary,
    };
  } catch {
    return loadFixture();
  }
}

async function gh<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'bdt-ops-desk',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status} for ${path}`);
  }
  return (await res.json()) as T;
}

async function fetchRepoHygiene(owner: string, name: string, token: string) {
  const repo = `${owner}/${name}`;

  type Pr = {
    number: number;
    title: string;
    user?: { login?: string };
    updated_at: string;
    draft?: boolean;
    html_url: string;
  };
  type Issue = {
    number: number;
    title: string;
    updated_at: string;
    html_url: string;
    pull_request?: unknown;
  };
  type Run = {
    name: string;
    conclusion: string | null;
    html_url: string;
    head_branch: string;
  };

  const [prs, issues, runs] = await Promise.all([
    gh<Pr[]>(`/repos/${owner}/${name}/pulls?state=open&per_page=20`, token),
    gh<Issue[]>(`/repos/${owner}/${name}/issues?state=open&per_page=50`, token),
    gh<{ workflow_runs: Run[] }>(
      `/repos/${owner}/${name}/actions/runs?status=completed&per_page=15`,
      token,
    ),
  ]);

  const cutoff = Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000;
  const staleIssues = issues
    .filter((i) => !i.pull_request)
    .filter((i) => new Date(i.updated_at).getTime() < cutoff)
    .map((i) => ({
      number: i.number,
      title: i.title,
      updatedAt: i.updated_at,
      url: i.html_url,
      daysStale: Math.floor(
        (Date.now() - new Date(i.updated_at).getTime()) / (24 * 60 * 60 * 1000),
      ),
    }));

  const openPullRequests = prs.map((p) => ({
    number: p.number,
    title: p.title,
    author: p.user?.login ?? 'unknown',
    updatedAt: p.updated_at,
    draft: Boolean(p.draft),
    url: p.html_url,
  }));

  const seen = new Set<string>();
  const failingChecks = (runs.workflow_runs ?? [])
    .filter((r) => r.conclusion === 'failure')
    .filter((r) => {
      const key = `${r.name}:${r.head_branch}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 5)
    .map((r) => ({
      name: r.name,
      conclusion: r.conclusion,
      htmlUrl: r.html_url,
      headBranch: r.head_branch,
    }));

  return { repo, openPullRequests, staleIssues, failingChecks };
}
