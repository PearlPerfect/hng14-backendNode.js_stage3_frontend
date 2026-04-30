'use client';
import { useState } from 'react';
import { searchProfiles } from '@/lib/api';
import ProfilesTable from './ProfilesTable';

const CHIPS = [
  'young males from nigeria',
  'females above 30',
  'adult males from kenya',
  'senior females',
  'teenagers from ghana',
  'males between 20 and 35',
  'people from angola',
  'children from south africa',
];

export default function NlpSearch() {
  const [q, setQ]           = useState('');
  const [result, setResult] = useState(null);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage]     = useState(1);

  async function doSearch(query = q, p = 1) {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    const data = await searchProfiles(query, p, 10);
    setLoading(false);
    if (data?.status === 'error') { setError(data.message); setResult(null); }
    else { setResult(data); setPage(p); }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doSearch()}
          placeholder="e.g. young males from nigeria, females above 30…"
          style={{
            flex: 1, background: '#131619', border: '1px solid #22282f',
            color: '#dde4ee', fontFamily: 'JetBrains Mono', fontSize: 13,
            padding: '11px 16px', borderRadius: 8, outline: 'none',
          }}
        />
        <button
          onClick={() => doSearch()}
          style={{
            background: '#a78bfa', border: 'none', color: '#000',
            fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: 600,
            padding: '11px 22px', borderRadius: 8, cursor: 'pointer',
          }}
        >Search</button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
        {CHIPS.map(c => (
          <span
            key={c}
            onClick={() => { setQ(c); doSearch(c, 1); }}
            style={{
              fontFamily: 'JetBrains Mono', fontSize: 10, padding: '4px 12px',
              borderRadius: 20, cursor: 'pointer',
              background: 'rgba(167,139,250,.08)', border: '1px solid rgba(167,139,250,.2)', color: '#a78bfa',
            }}
          >{c}</span>
        ))}
      </div>

      {loading && <div style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: '#566070' }}>Searching…</div>}
      {error   && <div style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: '#f43f5e' }}>⚠ {error}</div>}

      {result && !loading && (
        <ProfilesTable
          data={result.data}
          page={result.page}
          totalPages={result.total_pages}
          total={result.total}
          limit={result.limit}
          onPageChange={p => doSearch(q, p)}
        />
      )}
    </div>
  );
}