import React, { useEffect, useRef } from 'react';

export default function LiveLog({ lines }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div
      ref={ref}
      style={{
        maxWidth: 720,
        margin: '40px auto 0',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 6,
        padding: '16px 18px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        lineHeight: 1.7,
        color: 'var(--text-muted)',
        maxHeight: 220,
        overflowY: 'auto',
      }}
    >
      {lines.length === 0 && <span style={{ opacity: 0.5 }}>Waiting for log output…</span>}
      {lines.map((line, i) => {
        const isLast = i === lines.length - 1;
        const distance = lines.length - 1 - i;
        const opacity = isLast ? 1 : Math.max(0.35, 1 - distance * 0.08);
        return (
          <div
            key={i}
            style={{
              opacity,
              animation: isLast ? 'pulse 1.6s ease-in-out infinite' : 'none',
              color: isLast ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            <span style={{ color: 'var(--accent-gold)', marginRight: 10 }}>
              [{line.time}]
            </span>
            {line.text}
          </div>
        );
      })}
    </div>
  );
}
