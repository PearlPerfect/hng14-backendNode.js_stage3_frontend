'use client';

export default function StatsGrid({ stats }) {
  const cards = [
    { val: stats.total,  label: 'Total Profiles' },
    { val: stats.male,   label: 'Male' },
    { val: stats.female, label: 'Female' },
    { val: stats.adult,  label: 'Adults' },
    { val: stats.senior, label: 'Seniors' },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: 14, marginBottom: 36,
    }}>
      {cards.map((c) => (
        <div key={c.label} style={{
          background: '#131619', border: '1px solid #22282f',
          borderRadius: 8, padding: 20,
        }}>
          <div style={{
            fontFamily: 'JetBrains Mono', fontSize: 32,
            fontWeight: 800, color: '#00e5a0', lineHeight: 1,
          }}>
            {c.val ?? '—'}
          </div>
          <div style={{
            fontFamily: 'JetBrains Mono', fontSize: 10,
            color: '#566070', marginTop: 6, textTransform: 'uppercase', letterSpacing: '.08em',
          }}>
            {c.label}
          </div>
        </div>
      ))}
    </div>
  );
}