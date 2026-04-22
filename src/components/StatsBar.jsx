import React from 'react';

function Pill({ value, label }) {
  return (
    <div
      style={{
        flex: 1,
        padding: '18px 20px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 6,
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: 2,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function StatsBar({ issues }) {
  const total = issues.length;
  const p0 = issues.filter((i) => i.priority === 'P0').length;
  const p1 = issues.filter((i) => i.priority === 'P1').length;
  const p2 = issues.filter((i) => i.priority === 'P2').length;
  const p3 = issues.filter((i) => i.priority === 'P3').length;
  const hours = issues.reduce((sum, i) => sum + (Number(i.estimated_hours) || 0), 0);

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        marginBottom: 24,
        animation: 'fadeSlideIn 360ms ease both',
      }}
    >
      <Pill value={total} label="Total Issues" />
      <Pill value={p0} label="Critical (P0)" />
      <Pill value={p1} label="High (P1)" />
      <Pill value={p2} label="Medium (P2)" />
      <Pill value={p3} label="Low (P3)" />
      <Pill value={`${Math.round(hours)}h`} label="Est. Eng Hours" />
    </div>
  );
}
