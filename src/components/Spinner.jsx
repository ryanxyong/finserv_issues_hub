import React from 'react';

export default function Spinner({ size = 14, color = 'var(--accent-gold)' }) {
  return (
    <span
      aria-label="loading"
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: `2px solid ${color}`,
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  );
}
