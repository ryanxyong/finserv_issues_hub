import React, { useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import RepoInput from './components/RepoInput.jsx';
import LiveLog from './components/LiveLog.jsx';
import StatsBar from './components/StatsBar.jsx';
import FilterTabs from './components/FilterTabs.jsx';
import IssueCard from './components/IssueCard.jsx';
import Spinner from './components/Spinner.jsx';
import { fetchIssues } from './api/github.js';
import { triageWithOpenAI } from './api/openai.js';

const PRIORITY_ORDER = { P0: 0, P1: 1, P2: 2, P3: 3 };

function now() {
  return new Date().toLocaleTimeString([], { hour12: false });
}

export default function App() {
  const [phase, setPhase] = useState('idle'); // idle | fetching | analyzing | done | error
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState('All');
  const [logLines, setLogLines] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeRepo, setActiveRepo] = useState(null);

  const appendLog = (text) => {
    setLogLines((prev) => [...prev, { time: now(), text }]);
  };

  const reset = () => {
    setPhase('idle');
    setIssues([]);
    setFilter('All');
    setLogLines([]);
    setErrorMsg(null);
    setActiveRepo(null);
  };

  const runTriage = async (repo) => {
    setPhase('fetching');
    setIssues([]);
    setLogLines([]);
    setErrorMsg(null);
    setActiveRepo(repo);
    appendLog(`Connecting to GitHub API...`);

    try {
      appendLog(`Requesting open issues from ${repo}...`);
      const raw = await fetchIssues(repo);
      appendLog(`Fetched ${raw.length} issues from ${repo}`);

      setPhase('analyzing');
      appendLog(`Sending to GPT-4o for triage analysis...`);
      const triaged = await triageWithOpenAI(raw);
      appendLog(`Received triage data for ${triaged.length} issues`);
      appendLog(`Rendering priority queue...`);

      const sorted = [...triaged].sort((a, b) => {
        const pa = PRIORITY_ORDER[a.priority] ?? 9;
        const pb = PRIORITY_ORDER[b.priority] ?? 9;
        if (pa !== pb) return pa - pb;
        return (Number(b.estimated_hours) || 0) - (Number(a.estimated_hours) || 0);
      });

      setIssues(sorted);
      setPhase('done');
    } catch (err) {
      setErrorMsg(err?.message || String(err));
      setPhase('error');
    }
  };

  const filtered = useMemo(() => {
    if (filter === 'All') return issues;
    return issues.filter((i) => i.priority === filter);
  }, [issues, filter]);

  const totalHours = useMemo(
    () => Math.round(issues.reduce((s, i) => s + (Number(i.estimated_hours) || 0), 0)),
    [issues]
  );

  const busy = phase === 'fetching' || phase === 'analyzing';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Header phase={phase} issueCount={issues.length} totalHours={totalHours} />

      {phase === 'idle' && <RepoInput onTriage={runTriage} disabled={false} />}

      {busy && (
        <div style={{ padding: '40px 40px 0' }}>
          <div
            style={{
              maxWidth: 720,
              margin: '40px auto 0',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              color: 'var(--text-muted)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}
          >
            <Spinner />
            <span>
              {phase === 'fetching' ? 'Fetching issues' : 'Analyzing with GPT-4o'}
              {activeRepo ? ` · ${activeRepo}` : ''}
            </span>
          </div>
          <LiveLog lines={logLines} />
        </div>
      )}

      {phase === 'error' && (
        <div
          style={{
            maxWidth: 720,
            margin: '80px auto 0',
            padding: '0 40px',
            animation: 'fadeSlideIn 300ms ease both',
          }}
        >
          <div
            style={{
              padding: '20px 24px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 6,
              color: '#fca5a5',
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 2,
                color: '#ef4444',
                marginBottom: 8,
              }}
            >
              Triage failed
            </div>
            {errorMsg}
          </div>
          <button
            onClick={reset}
            style={{
              padding: '10px 18px',
              border: '1px solid var(--accent-gold)',
              color: 'var(--accent-gold)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 0.5,
              borderRadius: 4,
              background: 'transparent',
            }}
          >
            ↻ Retry
          </button>
        </div>
      )}

      {phase === 'done' && (
        <div
          style={{
            maxWidth: 1120,
            margin: '32px auto 80px',
            padding: '0 40px',
            animation: 'fadeSlideIn 400ms ease both',
          }}
        >
          <StatsBar issues={issues} />
          <FilterTabs issues={issues} filter={filter} onChange={setFilter} />
          <div>
            {filtered.length === 0 && (
              <div
                style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                }}
              >
                No issues in this filter.
              </div>
            )}
            {filtered.map((issue, i) => (
              <IssueCard key={issue.number} issue={issue} index={i} />
            ))}
          </div>
          <div style={{ marginTop: 24 }}>
            <button
              onClick={reset}
              style={{
                padding: '8px 14px',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                borderRadius: 4,
                background: 'transparent',
              }}
            >
              ← Triage another repo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
