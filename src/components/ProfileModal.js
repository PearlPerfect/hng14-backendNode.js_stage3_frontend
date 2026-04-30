'use client';

export default function ProfileModal({ profile, onClose, userRole, onEdit }) {
  if (!profile) return null;

  const fields = [
    ['ID', profile.id],
    ['Name', profile.name],
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
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderRadius: 12, padding: 32, maxWidth: 550, width: '100%', position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 18, cursor: 'pointer',
          }}
        >✕</button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800 }}>{profile.name}</h3>
          {userRole === 'admin' && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
                onEdit(profile, e);
              }}
              style={{
                padding: '6px 16px',
                background: 'var(--accent)',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                color: '#000',
              }}
            >
              Edit Profile
            </button>
          )}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {fields.map(([k, v]) => (
            <div key={k}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>{k}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--text-primary)' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}