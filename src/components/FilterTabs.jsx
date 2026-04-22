import React from 'react';

const PRIORITY_STYLES = {
  All: { color: 'var(--text-primary)', bg: 'rgba(255,255,255,0.04)', border: 'var(--border-subtle)' },
  P0: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.3)' },
  P1: { color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.3)' },
  P2: { color: '#eab308', bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.3)' },
  P3: { color: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.2)' },
};

export default function FilterTabs({ issues, filter, onChange }) {
  const counts = {
    All: issues.length,
    P0: issues.filter((i) => i.priority === 'P0').length,
    P1: issues.filter((i) => i.priority === 'P1').length,
    P2: issues.filter((i) => i.priority === 'P2').length,
    P3: issues.filter((i) => i.priority === 'P3').length,
  };

  const tabs = ['All', 'P0', 'P1', 'P2', 'P3'];

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
      {tabs.map((t) => {
        const active = filter === t;
        const s = PRIORITY_STYLES[t];
        return (
          <button
            key={t}
            onClick={() => onChange(t)}
            style={{
              padding: '8px 16px',
              borderRadius: 4,
              border: `1px solid ${active ? s.border : 'var(--border-subtle)'}`,
              background: active ? s.bg : 'transparent',
              color: active ? s.color : 'var(--text-muted)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              transition: 'all 150ms',
            }}
          >
            {t} ({counts[t]})
          </button>
        );
      })}
    </div>
  );
}
