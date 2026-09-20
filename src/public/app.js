const transcript = document.getElementById('transcript');
const form = document.getElementById('composer');
const promptInput = document.getElementById('prompt');
const tokenInput = document.getElementById('token');

function authHeaders() {
  const token = tokenInput.value.trim();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function addBubble(role, text, meta = '') {
  const el = document.createElement('div');
  el.className = `bubble ${role}`;
  if (meta) {
    const m = document.createElement('span');
    m.className = 'meta';
    m.textContent = meta;
    el.appendChild(m);
  }
  el.appendChild(document.createTextNode(text));
  transcript.appendChild(el);
  transcript.scrollTop = transcript.scrollHeight;
}

function routePhrase(text) {
  const t = text.toLowerCase();
  if (t.includes('linkedin') || t.includes('news')) return 'linkedin';
  if (t.includes('github') || t.includes('hygiene') || t.includes('pr')) return 'github';
  return 'daily-brief';
}

function formatLinkedIn(data) {
  return (data.items || [])
    .map((i, idx) => `${idx + 1}. [${i.tag}] ${i.headline}\n   So what: ${i.soWhat}`)
    .join('\n\n');
}

function formatGithub(data) {
  const s = data.summary || {};
  const lines = [
    `Source: ${data.source}`,
    `Open PRs: ${s.openPrCount ?? 0} · Stale issues: ${s.staleIssueCount ?? 0} · Failing checks: ${s.failingCheckCount ?? 0}`,
    '',
  ];
  for (const repo of data.repos || []) {
    lines.push(`Repo ${repo.repo}`);
    for (const pr of repo.openPullRequests || []) {
      lines.push(`  PR #${pr.number}: ${pr.title}`);
    }
    for (const issue of repo.staleIssues || []) {
      lines.push(`  Stale #${issue.number}: ${issue.title} (${issue.daysStale}d)`);
    }
    for (const check of repo.failingChecks || []) {
      lines.push(`  Fail: ${check.name} on ${check.headBranch}`);
    }
  }
  return lines.join('\n');
}

function formatBrief(data) {
  return `${data.summary}\n\n(source: ${data.source}${data.modelId ? ` · ${data.modelId}` : ''})`;
}

async function ask(text) {
  addBubble('user', text);
  const kind = routePhrase(text);
  const path =
    kind === 'linkedin'
      ? '/api/tools/linkedin'
      : kind === 'github'
        ? '/api/tools/github'
        : '/api/tools/daily-brief';

  try {
    const res = await fetch(path, { headers: { ...authHeaders() } });
    const data = await res.json();
    if (!res.ok) {
      addBubble('bot', JSON.stringify(data, null, 2), `HTTP ${res.status}`);
      return;
    }
    const body =
      kind === 'linkedin'
        ? formatLinkedIn(data)
        : kind === 'github'
          ? formatGithub(data)
          : formatBrief(data);
    addBubble('bot', body, `tool · ${kind}`);
  } catch (err) {
    addBubble('bot', String(err), 'error');
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = promptInput.value.trim();
  if (!text) return;
  promptInput.value = '';
  void ask(text);
});

document.querySelectorAll('[data-phrase]').forEach((btn) => {
  btn.addEventListener('click', () => void ask(btn.getAttribute('data-phrase')));
});

addBubble(
  'bot',
  'Hi — I am the simulated Alexa+ surface for BDT Ops Desk. Try “Give me my daily ops brief”.',
  'ready',
);
