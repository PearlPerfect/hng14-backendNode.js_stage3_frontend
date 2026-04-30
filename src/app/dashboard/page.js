'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn, getTokens } from '@/lib/auth';
import { getMe, getProfiles } from '@/lib/api';
import NavBar from '@/components/NavBar';
import StatsGrid from '@/components/StatsGrid';
import ProfilesTable from '@/components/ProfilesTable';
import NlpSearch from '@/components/NlpSearch';

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
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = isLoggedIn();
      console.log('Dashboard - isLoggedIn:', loggedIn);
      console.log('Dashboard - tokens:', getTokens());
      
      if (!loggedIn) {
        console.log('Not logged in, redirecting to login');
        router.replace('/login');
        return;
      }
      await init();
    };
    
    checkAuth();
  }, []);

  async function init() {
    try {
      console.log('Fetching user data...');
      const me = await getMe();
      console.log('getMe response:', me);
      
      if (!me?.data) {
        console.log('No user data, redirecting to login');
        router.replace('/login');
        return;
      }
      setUser(me.data);

      console.log('Fetching profile stats...');
      const [total, male, female, adult, senior] = await Promise.all([
        getProfiles({ limit: 1 }),
        getProfiles({ gender: 'male', limit: 1 }),
        getProfiles({ gender: 'female', limit: 1 }),
        getProfiles({ age_group: 'adult', limit: 1 }),
        getProfiles({ age_group: 'senior', limit: 1 }),
      ]);

      console.log('Stats received:', { total, male, female, adult, senior });

      setStats({
        total: total?.total || 0,
        male: male?.total || 0,
        female: female?.total || 0,
        adult: adult?.total || 0,
        senior: senior?.total || 0,
      });

      await loadProfiles(1);
      setLoading(false);
    } catch (err) {
      console.error('Init error:', err);
      setError(err.message);
      setLoading(false);
    }
  }

  async function loadProfiles(page = 1) {
    try {
      console.log('Loading profiles for page:', page, 'filters:', filters);
      const data = await getProfiles({ ...filters, page, limit: 15 });
      console.log('Profiles response:', data);
      
      if (!data) {
        console.log('No profiles data received');
        return;
      }
      setProfiles(data.data || []);
      setMeta({ 
        page: data.page, 
        totalPages: data.total_pages, 
        total: data.total, 
        limit: data.limit 
      });
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  }

  function handleFilterChange(key, val) {
    setFilters(f => ({ ...f, [key]: val }));
  }

  const inputStyle = {
    background: '#131619', border: '1px solid #22282f', color: '#dde4ee',
    fontFamily: 'JetBrains Mono', fontSize: 12, padding: '8px 12px',
    borderRadius: 6, outline: 'none',
  };

  const tabStyle = (active) => ({
    fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: 600,
    padding: '10px 18px', cursor: 'pointer', border: 'none',
    background: 'transparent', marginBottom: -1,
    color: active ? '#00e5a0' : '#566070',
    borderBottom: active ? '2px solid #00e5a0' : '2px solid transparent',
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono', color: '#566070' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid rgba(0,229,160,0.1)',
            borderTopColor: '#00e5a0',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p>Loading dashboard...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono', color: '#ef4444' }}>
        <div style={{ textAlign: 'center' }}>
          <p>Error loading dashboard: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: 16, padding: '8px 16px', background: '#00e5a0', border: 'none', borderRadius: 6, cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavBar user={user} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Welcome banner */}
        <div style={{
          background: 'linear-gradient(135deg,rgba(0,229,160,.08),rgba(56,189,248,.05))',
          border: '1px solid rgba(0,229,160,.15)', borderRadius: 12,
          padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32,
        }}>
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="avatar" width={56} height={56}
              style={{ borderRadius: '50%', border: '3px solid rgba(0,229,160,.4)', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg,#00e5a0,#38bdf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'JetBrains Mono', fontSize: 20, fontWeight: 700, color: '#000',
              border: '3px solid rgba(0,229,160,.4)',
            }}>
              {user?.username?.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
              Welcome back, <span style={{ color: '#00e5a0' }}>{user?.username}</span>
            </h2>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#566070' }}>
              {user?.role === 'admin' ? '⚡ Admin — full access' : '👁 Analyst — read-only'}
              {user?.last_login_at && ` · Last login: ${new Date(user.last_login_at).toLocaleString()}`}
            </p>
          </div>
        </div>

        <StatsGrid stats={stats} />

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #22282f', marginBottom: 24 }}>
          <button style={tabStyle(tab === 'browse')} onClick={() => setTab('browse')}>Browse Profiles</button>
          <button style={tabStyle(tab === 'search')} onClick={() => setTab('search')}>NL Search</button>
        </div>

        {/* Browse tab */}
        {tab === 'browse' && (
          <>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#566070', letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 14 }}>
              Filter &amp; Sort
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              <select style={inputStyle} value={filters.gender} onChange={e => handleFilterChange('gender', e.target.value)}>
                <option value="">Any gender</option><option>male</option><option>female</option>
              </select>
              <select style={inputStyle} value={filters.age_group} onChange={e => handleFilterChange('age_group', e.target.value)}>
                <option value="">Any age group</option><option>child</option><option>teenager</option><option>adult</option><option>senior</option>
              </select>
              <input style={{ ...inputStyle, width: 150 }} placeholder="Country (NG, GH…)" value={filters.country_id} onChange={e => handleFilterChange('country_id', e.target.value)} />
              <input style={{ ...inputStyle, width: 90 }} placeholder="Min age" type="number" value={filters.min_age} onChange={e => handleFilterChange('min_age', e.target.value)} />
              <input style={{ ...inputStyle, width: 90 }} placeholder="Max age" type="number" value={filters.max_age} onChange={e => handleFilterChange('max_age', e.target.value)} />
              <select style={inputStyle} value={filters.sort_by} onChange={e => handleFilterChange('sort_by', e.target.value)}>
                <option value="">Sort by…</option><option value="age">Age</option><option value="created_at">Created</option><option value="gender_probability">Gender prob.</option>
              </select>
              <select style={inputStyle} value={filters.order} onChange={e => handleFilterChange('order', e.target.value)}>
                <option value="asc">Asc</option><option value="desc">Desc</option>
              </select>
              <button onClick={() => loadProfiles(1)} style={{ background: '#00e5a0', border: 'none', color: '#000', fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: 600, padding: '8px 18px', borderRadius: 6, cursor: 'pointer' }}>
                Apply
              </button>
              
              <a
                href={`${API}/api/profiles/export?format=csv&gender=${filters.gender}&country_id=${filters.country_id}`}
                target="_blank"
                rel="noreferrer"
                style={{ background: 'transparent', border: '1px solid #22282f', color: '#dde4ee', fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: 600, padding: '8px 18px', borderRadius: 6, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
              >
                ↓ Export CSV
              </a>
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
    </>
  );
}
