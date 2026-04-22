const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT =
  'You are a senior engineering lead triaging GitHub issues. Be opinionated, ruthless with prioritization, and think like an experienced engineer, not a project manager.';

function buildUserMessage(issues) {
  const payload = issues.map((issue, index) => ({
    id: index,
    number: issue.number,
    title: issue.title,
    body: issue.body,
    labels: issue.labels,
    comments: issue.comments,
    days_open: issue.days_open,
  }));

  return `Triage the following GitHub issues. Return ONLY a raw JSON array — no markdown, no backticks, no preamble, no trailing commentary.

Each element of the array must be an object with EXACTLY these keys:
- id: int (matches the id field from the input)
- priority: "P0" | "P1" | "P2" | "P3"  (P0=critical/blocking, P1=high/impactful, P2=medium, P3=low)
- complexity: "XS" | "S" | "M" | "L" | "XL"
- category: "bug" | "feature" | "debt" | "question"
- estimated_hours: number (realistic engineering hours, not story points)
- approach: string (2-3 sentences, concrete and actionable — name specific functions, patterns, or subsystems if inferable)
- stall_reason: string (1 sentence explaining why this likely hasn't been fixed yet)
- files_hint: string[] (2-4 plausible file paths or module names that would need to change)

Here are the issues:
${JSON.stringify(payload, null, 2)}`;
}

function stripCodeFences(text) {
  let t = text.trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/i, '');
    t = t.replace(/```\s*$/i, '');
  }
  return t.trim();
}

export async function triageWithOpenAI(issues) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API error 0 — check your API key and quota');
  }

  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 4000,
      temperature: 0.2,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserMessage(issues) },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error ${res.status} — check your API key and quota`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? '';
  const cleaned = stripCodeFences(content);

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error('Failed to parse triage response — the model returned malformed JSON');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Failed to parse triage response — the model returned malformed JSON');
  }

  const byId = new Map(parsed.map((t) => [t.id, t]));

  return issues.map((issue, index) => {
    const t = byId.get(index) || {};
    return {
      ...issue,
      priority: t.priority || 'P3',
      complexity: t.complexity || 'M',
      category: t.category || 'bug',
      estimated_hours: typeof t.estimated_hours === 'number' ? t.estimated_hours : 0,
      approach: t.approach || '',
      stall_reason: t.stall_reason || '',
      files_hint: Array.isArray(t.files_hint) ? t.files_hint : [],
    };
  });
}
