import React, { useState } from 'react';
import Spinner from './Spinner.jsx';
import { dispatchToDevin } from '../api/devin.js';

const PRIORITY_COLORS = {
  P0: { fg: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.3)' },
  P1: { fg: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.3)' },
  P2: { fg: '#eab308', bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.3)' },
  P3: { fg: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.2)' },
};

const CATEGORY_ICONS = {
  bug: '●',
  feature: '✦',
  debt: '⬢',
  question: '?',
};

function Badge({ children, color, border, bg }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        borderRadius: 3,
        border: `1px solid ${border}`,
        background: bg,
        color,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </span>
  );
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 8,
        marginTop: 18,
      }}
    >
      {children}
    </div>
  );
}

export default function IssueCard({ issue, index }) {
  const [expanded, setExpanded] = useState(false);
  const [dispatchState, setDispatchState] = useState('idle'); // idle | loading | success | error
  const [sessionUrl, setSessionUrl] = useState(null);
  const [error, setError] = useState(null);

  const colors = PRIORITY_COLORS[issue.priority] || PRIORITY_COLORS.P3;
  const hasDevin = Boolean(
    import.meta.env.VITE_DEVIN_API_KEY && import.meta.env.VITE_DEVIN_ORG_ID
  );

  const handleDispatch = async (e) => {
    e.stopPropagation();
    if (!hasDevin || dispatchState === 'loading') return;
    setDispatchState('loading');
    setError(null);
    try {
      const { session_url } = await dispatchToDevin(issue, {
        priority: issue.priority,
        complexity: issue.complexity,
        category: issue.category,
        estimated_hours: issue.estimated_hours,
        approach: issue.approach,
        files_hint: issue.files_hint,
      });
      setSessionUrl(session_url);
      setDispatchState('success');
    } catch (err) {
      setError(err?.message || 'Dispatch failed');
      setDispatchState('error');
    }
  };

  return (
    <div
      onClick={() => setExpanded((v) => !v)}
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        padding: '18px 22px',
        marginBottom: 10,
        cursor: 'pointer',
        transition: 'transform 120ms ease, background 120ms ease',
        animation: `fadeSlideIn 300ms ease both`,
        animationDelay: `${index * 40}ms`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
              flexWrap: 'wrap',
            }}
          >
            <Badge color={colors.fg} border={colors.border} bg={colors.bg}>
              {issue.priority}
            </Badge>
            <Badge
              color="var(--text-muted)"
              border="var(--border-subtle)"
              bg="rgba(255,255,255,0.02)"
            >
              {issue.complexity}
            </Badge>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              {CATEGORY_ICONS[issue.category] || '●'} {issue.category}
            </span>
          </div>

          <div
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--text-primary)',
              lineHeight: 1.4,
              marginBottom: 6,
            }}
          >
            {issue.title}
          </div>

          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: 'var(--text-muted)',
            }}
          >
            #{issue.number} · {issue.comments} comments · open {issue.days_open}d
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 8,
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: colors.fg,
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
          >
            ~{issue.estimated_hours}h
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              color: 'var(--text-muted)',
              transition: 'transform 150ms',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              display: 'inline-block',
            }}
          >
            ▾
          </span>
        </div>
      </div>

      {expanded && (
        <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 8 }}>
          <SectionLabel>Approach</SectionLabel>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
            {issue.approach || '—'}
          </div>

          <SectionLabel>Why It's Stalled</SectionLabel>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
            {issue.stall_reason || '—'}
          </div>

          <SectionLabel>Likely Files to Touch</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(issue.files_hint || []).length === 0 && (
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
            )}
            {(issue.files_hint || []).map((f) => (
              <span
                key={f}
                style={{
                  padding: '4px 10px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 999,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: 'var(--text-primary)',
                }}
              >
                {f}
              </span>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 22,
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <a
              href={issue.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="gh-link"
              style={{
                color: 'var(--accent-gold)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                borderBottom: '1px solid transparent',
                paddingBottom: 2,
                transition: 'border-color 150ms',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = 'var(--accent-gold)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = 'transparent')}
            >
              View on GitHub →
            </a>

            {dispatchState === 'success' && sessionUrl ? (
              <a
                href={sessionUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '10px 18px',
                  border: '1px solid #10b981',
                  color: '#10b981',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  borderRadius: 4,
                  background: 'rgba(16,185,129,0.08)',
                }}
              >
                ✓ Devin Session Created
              </a>
            ) : (
              <button
                onClick={handleDispatch}
                disabled={!hasDevin || dispatchState === 'loading'}
                title={
                  !hasDevin
                    ? 'Add VITE_DEVIN_API_KEY and VITE_DEVIN_ORG_ID to enable Devin dispatch'
                    : dispatchState === 'error'
                    ? error || 'Dispatch failed'
                    : undefined
                }
                style={{
                  padding: '10px 18px',
                  border: `1px solid ${
                    dispatchState === 'error' ? '#ef4444' : 'var(--accent-gold)'
                  }`,
                  color: dispatchState === 'error' ? '#ef4444' : 'var(--accent-gold)',
                  background:
                    dispatchState === 'error' ? 'rgba(239,68,68,0.06)' : 'transparent',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  borderRadius: 4,
                  opacity: !hasDevin || dispatchState === 'loading' ? 0.55 : 1,
                  cursor:
                    !hasDevin || dispatchState === 'loading' ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {dispatchState === 'loading' ? (
                  <>
                    <Spinner size={12} />
                    Dispatching...
                  </>
                ) : dispatchState === 'error' ? (
                  '✗ Dispatch failed'
                ) : (
                  '⬡ Dispatch to Devin →'
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
