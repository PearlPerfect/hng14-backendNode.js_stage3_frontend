'use client';
import { useState } from 'react';
import ProfileModal from './ProfileModal';
import Pagination from './Pagination';

function GenderBadge({ gender }) {
  const style = gender === 'male'
    ? { background: 'rgba(56,189,248,.12)', color: '#38bdf8', border: '1px solid rgba(56,189,248,.25)' }
    : { background: 'rgba(167,139,250,.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,.25)' };
  return (
    <span style={{ ...style, fontFamily: 'JetBrains Mono', fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
      {gender}
    </span>
  );
}

function AgeBadge({ group }) {
  return (
    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(0,229,160,.08)', color: '#00e5a0', border: '1px solid rgba(0,229,160,.2)' }}>
      {group}
    </span>
  );
}

export default function ProfilesTable({ data, page, totalPages, total, limit, onPageChange }) {
  const [selected, setSelected] = useState(null);

  if (!data?.length) {
    return <div style={{ textAlign: 'center', padding: 48, fontFamily: 'JetBrains Mono', fontSize: 13, color: '#566070' }}>No profiles found.</div>;
  }

  return (
    <>
      <div style={{ overflowX: 'auto', border: '1px solid #22282f', borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Name', 'Gender', 'Age', 'Age Group', 'Country', 'Country Name', 'G. Prob.'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '12px 14px',
                  background: '#131619', fontFamily: 'JetBrains Mono',
                  fontSize: 10, color: '#566070', letterSpacing: '.08em',
                  textTransform: 'uppercase', borderBottom: '1px solid #22282f',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr
                key={p.id}
                onClick={() => setSelected(p)}
                style={{ cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#131619'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '11px 14px', borderBottom: '1px solid #22282f' }}>{p.name}</td>
                <td style={{ padding: '11px 14px', borderBottom: '1px solid #22282f' }}><GenderBadge gender={p.gender} /></td>
                <td style={{ padding: '11px 14px', borderBottom: '1px solid #22282f', fontFamily: 'JetBrains Mono' }}>{p.age}</td>
                <td style={{ padding: '11px 14px', borderBottom: '1px solid #22282f' }}><AgeBadge group={p.age_group} /></td>
                <td style={{ padding: '11px 14px', borderBottom: '1px solid #22282f', fontFamily: 'JetBrains Mono', color: '#38bdf8' }}>{p.country_id}</td>
                <td style={{ padding: '11px 14px', borderBottom: '1px solid #22282f', color: '#566070' }}>{p.country_name || '—'}</td>
                <td style={{ padding: '11px 14px', borderBottom: '1px solid #22282f', fontFamily: 'JetBrains Mono', color: '#566070' }}>{((p.gender_probability || 0) * 100).toFixed(0)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} total={total} limit={limit} onChange={onPageChange} />
      <ProfileModal profile={selected} onClose={() => setSelected(null)} />
    </>
  );
}