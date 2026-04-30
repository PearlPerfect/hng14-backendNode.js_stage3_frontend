'use client';

export default function StatsGrid({ stats }) {
  const cards = [
    { val: stats.total,  label: 'Total Profiles', icon: '👥' },
    { val: stats.male,   label: 'Male', icon: '👨' },
    { val: stats.female, label: 'Female', icon: '👩' },
    { val: stats.adult,  label: 'Adults', icon: '🧑' },
    { val: stats.senior, label: 'Seniors', icon: '👴' },
  ];

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 16,
      marginBottom: 40,
    }}>
      {cards.map((card) => (
        <div key={card.label} className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 28 }}>{card.icon}</span>
            <span className="gradient-text" style={{ fontSize: 32, fontWeight: 700 }}>
              {formatNumber(card.val)}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, margin: 0 }}>
            {card.label}
          </p>
        </div>
      ))}
    </div>
  );
}