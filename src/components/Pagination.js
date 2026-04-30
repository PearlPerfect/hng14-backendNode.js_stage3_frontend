'use client';

export default function Pagination({ page, totalPages, total, limit, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      marginTop: 16, fontFamily: 'JetBrains Mono', fontSize: 12, color: '#566070',
    }}>
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        style={{
          background: '#131619', border: '1px solid #22282f', color: '#dde4ee',
          fontFamily: 'JetBrains Mono', fontSize: 12,
          padding: '6px 14px', borderRadius: 5, cursor: 'pointer',
          opacity: page <= 1 ? 0.4 : 1,
        }}
      >← Prev</button>

      <span style={{ flex: 1, textAlign: 'center' }}>
        Page {page} of {totalPages} · {total} total · {limit}/page
      </span>

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        style={{
          background: '#131619', border: '1px solid #22282f', color: '#dde4ee',
          fontFamily: 'JetBrains Mono', fontSize: 12,
          padding: '6px 14px', borderRadius: 5, cursor: 'pointer',
          opacity: page >= totalPages ? 0.4 : 1,
        }}
      >Next →</button>
    </div>
  );
}