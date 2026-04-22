import React from 'react';

export default function Header({ phase, issueCount, totalHours }) {
  const showStats = phase === 'done';

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 40px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-primary)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: 'var(--accent-gold)',
            textTransform: 'uppercase',
            letterSpacing: 3,
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          ⬡ ISSUETRIAGE
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Serif', Georgia, serif",
            fontStyle: 'italic',
            color: 'var(--text-muted)',
            fontSize: 13,
          }}
        >
          by ryan
        </span>
      </div>

      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: 2,
        }}
      >
        {showStats
          ? `${issueCount} ISSUES · ${totalHours}h ESTIMATED`
          : 'GITHUB ISSUE INTELLIGENCE'}
      </div>
    </header>
  );
}
