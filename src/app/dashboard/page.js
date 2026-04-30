'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn, logout } from '@/lib/auth';
import { getMe, getProfiles } from '@/lib/api';
import StatsGrid from '@/components/StatsGrid';
import ProfilesTable from '@/components/ProfilesTable';
import NlpSearch from '@/components/NlpSearch';
import ThemeToggle from '@/components/ThemeToggle';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [profiles, setProfiles] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0, limit: 15 });
  const [filters, setFilters] = useState({ gender: '', age_group: '', country_id: '', min_age: '', max_age: '', sort_by: '', order: '' });
  const [tab, setTab] = useState('browse');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) { router.replace('/login'); return; }
    init();
  }, []);

  async function init() {
    const me = await getMe();
    if (!me?.data) { router.replace('/login'); return; }
    setUser(me.data);

    const [total, male, female, adult, senior] = await Promise.all([
      getProfiles({ limit: 1 }),
      getProfiles({ gender: 'male', limit: 1 }),
      getProfiles({ gender: 'female', limit: 1 }),
      getProfiles({ age_group: 'adult', limit: 1 }),
      getProfiles({ age_group: 'senior', limit: 1 }),
    ]);

    setStats({
      total: total?.total,
      male: male?.total,
      female: female?.total,
      adult: adult?.total,
      senior: senior?.total,
    });

    await loadProfiles(1);
    setLoading(false);
  }

  async function loadProfiles(page = 1) {
    const data = await getProfiles({ ...filters, page, limit: 15 });
    if (!data) return;
    setProfiles(data.data || []);
    setMeta({ page: data.page, totalPages: data.total_pages, total: data.total, limit: data.limit });
  }

  function handleFilterChange(key, val) {
    setFilters(f => ({ ...f, [key]: val }));
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString();
  };

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48,
          height: 48,
          border: '3px solid rgba(6, 182, 212, 0.1)',
          borderTopColor: '#06b6d4',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading dashboard...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        
        {/* Welcome Section with Theme Toggle and Logout */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 32,
        }}>
          <div>
            <h2 style={{ 
              fontSize: 28, 
              fontWeight: 700, 
              color: 'var(--text-primary)',
              marginBottom: 8,
              letterSpacing: '-0.02em',
            }}>
              Welcome back, <span className="gradient-text">{user?.username}</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Here's what's happening with your demographic data today.
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ThemeToggle />
            
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.username} style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--accent-primary)',
              }} />
            ) : (
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 600,
                color: '#fff',
              }}>
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            )}
            
            <button 
              onClick={handleLogout} 
              className="btn-secondary"
              style={{
                padding: '8px 16px',
                fontSize: 13,
              }}
            >
              Logout
            </button>
          </div>
        </div>

        <StatsGrid stats={stats} />

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: 8, 
          marginBottom: 32,
          borderBottom: '1px solid var(--border)',
        }}>
          <button 
            onClick={() => setTab('browse')}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: 'none',
              color: tab === 'browse' ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'Inter, sans-serif',
              borderBottom: tab === 'browse' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            Browse Profiles
          </button>
          <button 
            onClick={() => setTab('search')}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: 'none',
              color: tab === 'search' ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'Inter, sans-serif',
              borderBottom: tab === 'search' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            Natural Language Search
          </button>
        </div>

        {/* Browse tab */}
        {tab === 'browse' && (
          <>
            <div className="card" style={{ padding: 24, marginBottom: 32 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: 20,
              }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Filters</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Refine your profile search</p>
                </div>
                <button 
                  onClick={() => {
                    setFilters({ gender: '', age_group: '', country_id: '', min_age: '', max_age: '', sort_by: '', order: '' });
                    loadProfiles(1);
                  }}
                  className="btn-secondary"
                  style={{ padding: '6px 14px', fontSize: 12 }}
                >
                  Clear all
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
                <select className="input" value={filters.gender} onChange={e => handleFilterChange('gender', e.target.value)}>
                  <option value="">All genders</option>
                  <option>male</option>
                  <option>female</option>
                </select>

                <select className="input" value={filters.age_group} onChange={e => handleFilterChange('age_group', e.target.value)}>
                  <option value="">All age groups</option>
                  <option>child</option>
                  <option>teenager</option>
                  <option>adult</option>
                  <option>senior</option>
                </select>

                <input className="input" placeholder="Country code (e.g., NG, US)" value={filters.country_id} onChange={e => handleFilterChange('country_id', e.target.value)} />

                <input className="input" placeholder="Min age" type="number" value={filters.min_age} onChange={e => handleFilterChange('min_age', e.target.value)} />

                <input className="input" placeholder="Max age" type="number" value={filters.max_age} onChange={e => handleFilterChange('max_age', e.target.value)} />

                <select className="input" value={filters.sort_by} onChange={e => handleFilterChange('sort_by', e.target.value)}>
                  <option value="">Sort by</option>
                  <option value="age">Age</option>
                  <option value="created_at">Created date</option>
                  <option value="gender_probability">Gender probability</option>
                </select>

                <select className="input" value={filters.order} onChange={e => handleFilterChange('order', e.target.value)}>
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => loadProfiles(1)} className="btn-primary">
                  Apply Filters
                </button>
                
                <a
                  href={`${API}/api/profiles/export?format=csv${filters.gender ? `&gender=${filters.gender}` : ''}${filters.country_id ? `&country_id=${filters.country_id}` : ''}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  📥 Export CSV
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '0 4px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                Showing <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{profiles.length}</span> of <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{formatNumber(meta.total)}</span> profiles
              </p>
            </div>

            <ProfilesTable
              data={profiles}
              page={meta.page}
              totalPages={meta.totalPages}
              total={meta.total}
              limit={meta.limit}
              onPageChange={loadProfiles}
            />
          </>
        )}

        {tab === 'search' && <NlpSearch />}
      </div>
    </div>
  );
}