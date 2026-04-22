export function buildDevinPrompt(issue, triageData) {
  const files = (triageData.files_hint || []).join('\n');
  return `Fix GitHub issue #${issue.number} in this repository.

## Issue
Title: ${issue.title}
URL: ${issue.html_url}

## Description
${issue.body}

## Triage Analysis
- Priority: ${triageData.priority}
- Complexity: ${triageData.complexity} (~${triageData.estimated_hours} engineering hours)
- Category: ${triageData.category}

## Suggested Approach
${triageData.approach}

## Files Likely Involved
${files}

## Instructions
1. Explore the repository to understand the codebase structure
2. Locate the files listed above and understand the relevant code paths
3. Implement a targeted fix that addresses the issue without breaking existing functionality
4. Write or update tests if applicable
5. Open a pull request with a clear description referencing issue #${issue.number}

Do not over-engineer. Match the fix scope to the complexity rating above.`;
}

export async function dispatchToDevin(issue, triageData) {
  const apiKey = import.meta.env.VITE_DEVIN_API_KEY;
  const orgId = import.meta.env.VITE_DEVIN_ORG_ID;

  if (!apiKey || !orgId) {
    throw new Error('Missing VITE_DEVIN_API_KEY or VITE_DEVIN_ORG_ID');
  }

  const url = 'https://api.devin.ai/v1/sessions';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt: buildDevinPrompt(issue, triageData),
    }),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const t = await res.text();
      detail = t ? ` — ${t.slice(0, 180)}` : '';
    } catch (_) {
      /* ignore */
    }
    throw new Error(`Devin API error ${res.status}${detail}`);
  }

  const data = await res.json().catch(() => ({}));
  const rawId = data.session_id || data.id || '';
  const sessionId = typeof rawId === 'string' ? rawId.replace(/^devin-/, '') : '';

  const session_url =
    data.url ||
    data.session_url ||
    (sessionId ? `https://app.devin.ai/sessions/${sessionId}` : 'https://app.devin.ai/sessions');

  return { session_url };
}
