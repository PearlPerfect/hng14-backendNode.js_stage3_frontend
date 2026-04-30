'use client';

export default function ProfileModal({ profile, onClose }) {
  if (!profile) return null;

  const fields = [
    ['ID', profile.id],
    ['Gender', profile.gender],
    ['Age', profile.age],
    ['Age Group', profile.age_group],
    ['Country', profile.country_id],
    ['Country Name', profile.country_name || '—'],
    ['Gender Probability', `${((profile.gender_probability || 0) * 100).toFixed(1)}%`],
    ['Country Probability', `${((profile.country_probability || 0) * 100).toFixed(1)}%`],
    ['Created At', new Date(profile.created_at).toLocaleString()],
  ];

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)',
        backdropFilter: 'blur(4px)', zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <div style={{
        background: '#131619', border: '1px solid #22282f',
        borderRadius: 12, padding: 32, maxWidth: 480, width: '100%', position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none', color: '#566070', fontSize: 18, cursor: 'pointer',
          }}
        >✕</button>
        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>{profile.name}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {fields.map(([k, v]) => (
            <div key={k}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#566070', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>{k}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 13 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}