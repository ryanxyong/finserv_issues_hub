import React, { useState } from 'react';

function normalizeRepo(value) {
  let v = value.trim();
  v = v.replace(/^https?:\/\/(www\.)?github\.com\//i, '');
  v = v.replace(/\.git$/i, '');
  v = v.replace(/^\/+|\/+$/g, '');
  return v;
}

function isValidRepo(value) {
  const v = normalizeRepo(value);
  if (!v) return false;
  const parts = v.split('/');
  return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
}

export default function RepoInput({ onTriage, disabled }) {
  const [repo, setRepo] = useState('vercel/next.js');

  const submit = () => {
    const normalized = normalizeRepo(repo);
    if (!isValidRepo(normalized)) return;
    onTriage(normalized);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div
      style={{
        maxWidth: 720,
        margin: '80px auto 0',
        padding: '0 40px',
        animation: 'fadeSlideIn 400ms ease both',
      }}
    >
      <h1
        style={{
          fontFamily: "'IBM Plex Serif', Georgia, serif",
          fontStyle: 'italic',
          fontSize: 32,
          fontWeight: 500,
          color: 'var(--text-primary)',
          marginBottom: 14,
          letterSpacing: -0.3,
        }}
      >
        Stop the bleeding.
      </h1>
      <p
        style={{
          fontSize: 14,
          color: 'var(--text-muted)',
          marginBottom: 28,
          lineHeight: 1.6,
          maxWidth: 560,
        }}
      >
        Point IssueTriage at any public GitHub repo. We'll pull the open issue
        backlog, rank it with GPT-4o, and let you dispatch a Devin session to
        fix the ones that matter — in one click.
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            color: 'var(--text-muted)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            borderRight: '1px solid var(--border-subtle)',
            background: 'rgba(0,0,0,0.2)',
          }}
        >
          github.com /
        </div>
        <input
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="owner/repo"
          disabled={disabled}
          style={{
            flex: 1,
            padding: '14px 16px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            color: 'var(--text-primary)',
            background: 'transparent',
          }}
        />
        <button
          onClick={submit}
          disabled={disabled || !isValidRepo(repo)}
          style={{
            padding: '0 22px',
            background: 'var(--accent-gold)',
            color: '#08090c',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: 'uppercase',
            opacity: disabled || !isValidRepo(repo) ? 0.5 : 1,
            transition: 'opacity 150ms',
          }}
        >
          Triage →
        </button>
      </div>

      <ul
        style={{
          listStyle: 'none',
          marginTop: 36,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}
      >
        {[
          ['Ranked queue', 'P0 → P3 across 20 issues'],
          ['Real triage', 'Approach, stall reason, files to touch'],
          ['One-click fix', 'Dispatch Devin directly from any card'],
        ].map(([title, sub]) => (
          <li
            key={title}
            style={{
              padding: '16px 18px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 6,
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: 'var(--accent-gold)',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                marginBottom: 6,
              }}
            >
              {title}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{sub}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
