'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn, getTokens, clearTokens } from '@/lib/auth';
import { getMe, getProfiles } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import StatsGrid from '@/components/StatsGrid';
import ProfilesTable from '@/components/ProfilesTable';
import NlpSearch from '@/components/NlpSearch';
import ProfileManagement from '@/components/ProfileManagement';
import toast, { Toaster } from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [profiles, setProfiles] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0, limit: 15 });
  const [filters, setFilters] = useState({ gender: '', age_group: '', country_id: '', min_age: '', max_age: '', sort_by: '', order: '' });
  const [activeTab, setActiveTab] = useState('browse');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = isLoggedIn();
      if (!loggedIn) {
        router.replace('/login');
        return;
      }
      await init();
    };
    checkAuth();
  }, []);

  async function init() {
    try {
      const me = await getMe();
      if (!me?.data) {
        clearTokens();
        router.replace('/login');
        return;
      }
      setUser(me.data);

      await refreshStats();

      await loadProfiles(1);
      setLoading(false);
    } catch (err) {
      console.error('Init error:', err);
      clearTokens();
      setError(err.message);
      setLoading(false);
      router.replace('/login');
    }
  }

  // Function to refresh stats
  async function refreshStats() {
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
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  }

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

  const handleProfileUpdate = async (updatedProfile) => {
    // Update the profile in the local state
    setProfiles(prev => prev.map(p => 
      p.id === updatedProfile.id ? updatedProfile : p
    ));
    
    // Refresh stats
    if (updatedProfile.age_group || updatedProfile.gender) {
      await refreshStats();
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'browse':
        return (
          <>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Filter & Sort Profiles</h2>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <select 
                  style={inputStyle} 
                  value={filters.gender} 
                  onChange={e => handleFilterChange('gender', e.target.value)}
                >
                  <option value="">Any gender</option>
                  <option>male</option>
                  <option>female</option>
                </select>
                <select 
                  style={inputStyle} 
                  value={filters.age_group} 
                  onChange={e => handleFilterChange('age_group', e.target.value)}
                >
                  <option value="">Any age group</option>
                  <option>child</option>
                  <option>teenager</option>
                  <option>adult</option>
                  <option>senior</option>
                </select>
                <input 
                  style={{ ...inputStyle, width: 150 }} 
                  placeholder="Country (NG, GH…)" 
                  value={filters.country_id} 
                  onChange={e => handleFilterChange('country_id', e.target.value)} 
                />
                <input 
                  style={{ ...inputStyle, width: 90 }} 
                  placeholder="Min age" 
                  type="number" 
                  value={filters.min_age} 
                  onChange={e => handleFilterChange('min_age', e.target.value)} 
                />
                <input 
                  style={{ ...inputStyle, width: 90 }} 
                  placeholder="Max age" 
                  type="number" 
                  value={filters.max_age} 
                  onChange={e => handleFilterChange('max_age', e.target.value)} 
                />
                <select 
                  style={inputStyle} 
                  value={filters.sort_by} 
                  onChange={e => handleFilterChange('sort_by', e.target.value)}
                >
                  <option value="">Sort by…</option>
                  <option value="age">Age</option>
                  <option value="created_at">Created</option>
                  <option value="gender_probability">Gender prob.</option>
                </select>
                <select 
                  style={inputStyle} 
                  value={filters.order} 
                  onChange={e => handleFilterChange('order', e.target.value)}
                >
                  <option value="asc">Asc</option>
                  <option value="desc">Desc</option>
                </select>
                <button 
                  onClick={() => loadProfiles(1)} 
                  style={buttonPrimaryStyle}
                >
                  Apply Filters
                </button>
                
                <a
                  href={`${API}/api/profiles/export?format=csv&gender=${filters.gender}&country_id=${filters.country_id}`}
                  target="_blank"
                  rel="noreferrer"
                  style={buttonSecondaryStyle}
                >
                  ↓ Export CSV
                </a>
              </div>
            </div>

            <ProfilesTable
              data={profiles}
              page={meta.page}
              totalPages={meta.totalPages}
              total={meta.total}
              limit={meta.limit}
              onPageChange={loadProfiles}
              userRole={user?.role}
              onProfileUpdate={handleProfileUpdate}
            />
          </>
        );
      case 'search':
        return <NlpSearch userRole={user?.role} />;
      case 'profiles':
        return user?.role === 'admin' ? (
          <ProfileManagement 
            userRole={user?.role} 
            onProfileUpdate={handleProfileUpdate}
            onStatsUpdate={refreshStats}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 48 }}>Access denied. Admin only.</div>
        );
      default:
        return null;
    }
  };

  const inputStyle = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    fontFamily: 'JetBrains Mono',
    fontSize: 12,
    padding: '10px 14px',
    borderRadius: 8,
    outline: 'none',
    transition: 'all 0.2s',
  };

  const buttonPrimaryStyle = {
    background: 'var(--accent)',
    border: 'none',
    color: '#000',
    fontFamily: 'JetBrains Mono',
    fontSize: 12,
    fontWeight: 600,
    padding: '10px 20px',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const buttonSecondaryStyle = {
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    fontFamily: 'JetBrains Mono',
    fontSize: 12,
    fontWeight: 600,
    padding: '10px 20px',
    borderRadius: 8,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'all 0.2s',
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 16px' }} />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--danger)' }}>Error loading dashboard: {error}</p>
          <button onClick={() => window.location.reload()} style={buttonPrimaryStyle}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            fontFamily: 'JetBrains Mono',
            fontSize: 13,
            whiteSpace: 'pre-line',
          },
          success: {
            iconTheme: {
              primary: 'var(--accent)',
              secondary: '#000',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--danger)',
              secondary: '#fff',
            },
          },
        }}
      />
      <DashboardLayout user={user} activeTab={activeTab} onTabChange={setActiveTab}>
        <StatsGrid stats={stats} />
        {renderContent()}
      </DashboardLayout>
    </>
  );
}
