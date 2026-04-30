'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn, logout, getTokens, refreshTokens } from '@/lib/auth';
import { getMe, getProfiles } from '@/lib/api';
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
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (!isLoggedIn()) {
      router.replace('/login');
      return;
    }

    try {
      const me = await getMe();
      if (!me?.data) {
        const refreshed = await refreshTokens();
        if (refreshed) {
          const retryMe = await getMe();
          if (!retryMe?.data) {
            router.replace('/login');
            return;
          }
          setUser(retryMe.data);
        } else {
          router.replace('/login');
          return;
        }
      } else {
        setUser(me.data);
      }
      
      await loadInitialData();
      setAuthChecking(false);
    } catch (error) {
      console.error('Auth check error:', error);
      router.replace('/login');
    }
  };

  const loadInitialData = async () => {
    try {
      const [total, male, female, adult, senior] = await Promise.all([
        getProfiles({ limit: 1 }),
        getProfiles({ gender: 'male', limit: 1 }),
        getProfiles({ gender: 'female', limit: 1 }),
        getProfiles({ age_group: 'adult', limit: 1 }),
        getProfiles({ age_group: 'senior', limit: 1 }),
      ]);

      setStats({
        total: total?.total || 0,
        male: male?.total || 0,
        female: female?.total || 0,
        adult: adult?.total || 0,
        senior: senior?.total || 0,
      });

      await loadProfiles(1);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  async function loadProfiles(page = 1) {
    try {
      const data = await getProfiles({ ...filters, page, limit: 15 });
      if (!data) return;
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

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString();
  };

  if (authChecking || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0c10',
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
          <p style={{ color: '#6b7280', fontSize: 14 }}>Loading dashboard...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#0a0c10', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        
        {/* Welcome Section with Logout */}
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
              color: '#ffffff',
              marginBottom: 8,
              letterSpacing: '-0.02em',
            }}>
              Welcome back, <span style={{ color: '#06b6d4' }}>{user?.username || 'User'}</span>
            </h2>
            <p style={{ color: '#6b7280', fontSize: 14 }}>
              Here's what's happening with your demographic data today.
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.username} style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #06b6d4',
              }} />
            ) : (
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #06b6d4, #22d3ee)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 600,
                color: '#fff',
              }}>
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            
            <button 
              onClick={handleLogout} 
              style={{
                background: 'transparent',
                border: '1px solid #374151',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 13,
                color: '#9ca3af',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#ef4444';
                e.currentTarget.style.color = '#ef4444';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#374151';
                e.currentTarget.style.color = '#9ca3af';
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
          borderBottom: '1px solid #374151',
        }}>
          <button 
            onClick={() => setTab('browse')}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: 'none',
              color: tab === 'browse' ? '#06b6d4' : '#6b7280',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'Inter, sans-serif',
              borderBottom: tab === 'browse' ? '2px solid #06b6d4' : '2px solid transparent',
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
              color: tab === 'search' ? '#06b6d4' : '#6b7280',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'Inter, sans-serif',
              borderBottom: tab === 'search' ? '2px solid #06b6d4' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            Natural Language Search
          </button>
        </div>

        {/* Browse tab */}
        {tab === 'browse' && (
          <>
            <div style={{ 
              background: '#111827', 
              borderRadius: 16, 
              padding: 24, 
              marginBottom: 32,
              border: '1px solid #374151',
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: 20,
              }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', marginBottom: 4 }}>Filters</h3>
                  <p style={{ fontSize: 12, color: '#6b7280' }}>Refine your profile search</p>
                </div>
                <button 
                  onClick={() => {
                    setFilters({ gender: '', age_group: '', country_id: '', min_age: '', max_age: '', sort_by: '', order: '' });
                    loadProfiles(1);
                  }}
                  style={{
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: 8,
                    padding: '6px 14px',
                    fontSize: 12,
                    color: '#6b7280',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#06b6d4'}
                  onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
                >
                  Clear all
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
                <select 
                  style={{
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: '#e5e7eb',
                    fontSize: 13,
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                  }}
                  value={filters.gender} 
                  onChange={e => handleFilterChange('gender', e.target.value)}
                >
                  <option value="">All genders</option>
                  <option>male</option>
                  <option>female</option>
                </select>

                <select 
                  style={{
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: '#e5e7eb',
                    fontSize: 13,
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                  }}
                  value={filters.age_group} 
                  onChange={e => handleFilterChange('age_group', e.target.value)}
                >
                  <option value="">All age groups</option>
                  <option>child</option>
                  <option>teenager</option>
                  <option>adult</option>
                  <option>senior</option>
                </select>

                <input 
                  style={{
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: '#e5e7eb',
                    fontSize: 13,
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                  }}
                  placeholder="Country code (e.g., NG, US)"
                  value={filters.country_id} 
                  onChange={e => handleFilterChange('country_id', e.target.value)} 
                />

                <input 
                  style={{
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: '#e5e7eb',
                    fontSize: 13,
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                  }}
                  placeholder="Min age"
                  type="number" 
                  value={filters.min_age} 
                  onChange={e => handleFilterChange('min_age', e.target.value)} 
                />

                <input 
                  style={{
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: '#e5e7eb',
                    fontSize: 13,
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                  }}
                  placeholder="Max age"
                  type="number" 
                  value={filters.max_age} 
                  onChange={e => handleFilterChange('max_age', e.target.value)} 
                />

                <select 
                  style={{
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: '#e5e7eb',
                    fontSize: 13,
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                  }}
                  value={filters.sort_by} 
                  onChange={e => handleFilterChange('sort_by', e.target.value)}
                >
                  <option value="">Sort by</option>
                  <option value="age">Age</option>
                  <option value="created_at">Created date</option>
                  <option value="gender_probability">Gender probability</option>
                </select>

                <select 
                  style={{
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: '#e5e7eb',
                    fontSize: 13,
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                  }}
                  value={filters.order} 
                  onChange={e => handleFilterChange('order', e.target.value)}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  onClick={() => loadProfiles(1)} 
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 24px',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Apply Filters
                </button>
                
                <a
                  href={`${API}/api/profiles/export?format=csv${filters.gender ? `&gender=${filters.gender}` : ''}${filters.country_id ? `&country_id=${filters.country_id}` : ''}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: 10,
                    padding: '10px 24px',
                    color: '#e5e7eb',
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#06b6d4';
                    e.currentTarget.style.color = '#06b6d4';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#374151';
                    e.currentTarget.style.color = '#e5e7eb';
                  }}
                >
                  📥 Export CSV
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '0 4px' }}>
              <p style={{ color: '#6b7280', fontSize: 13 }}>
                Showing <span style={{ color: '#06b6d4', fontWeight: 600 }}>{profiles.length}</span> of <span style={{ color: '#ffffff', fontWeight: 600 }}>{formatNumber(meta.total)}</span> profiles
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