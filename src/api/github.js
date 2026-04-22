const GITHUB_API = 'https://api.github.com';

export async function fetchIssues(repo) {
  const url = `${GITHUB_API}/repos/${repo}/issues?state=open&per_page=25&sort=created&direction=asc`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!res.ok) {
    throw new Error(
      `GitHub API error ${res.status} — verify the repo name is correct and the repo is public`
    );
  }
  const raw = await res.json();
  const issues = (Array.isArray(raw) ? raw : [])
    .filter((i) => !i.pull_request)
    .slice(0, 20)
    .map((i) => ({
      number: i.number,
      title: i.title,
      body: (i.body || '').slice(0, 500),
      labels: (i.labels || []).map((l) => (typeof l === 'string' ? l : l.name)).filter(Boolean),
      comments: i.comments ?? 0,
      days_open: Math.floor(
        (Date.now() - new Date(i.created_at).getTime()) / 86400000
      ),
      html_url: i.html_url,
    }));
  return issues;
}
