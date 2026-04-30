'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearTokens, getTokens } from '@/lib/auth';
import { logout } from '@/lib/api';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { id: 'browse', label: 'Browse Profiles', icon: '👥' },
  { id: 'search', label: 'NL Search', icon: '🔍' },
  { id: 'users', label: 'User Management', icon: '👤', adminOnly: true },
];

export default function DashboardLayout({ children, user, activeTab, onTabChange }) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleLogout() {
    const { refreshToken } = getTokens();
    await logout(refreshToken);
    clearTokens();
    router.push('/login');
  }

  if (!mounted) return null;

  const filteredNavItems = navItems.filter(item => 
    !item.adminOnly || user?.role === 'admin'
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarCollapsed ? 80 : 260,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{
          padding: sidebarCollapsed ? '20px 0' : '24px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
        }}>
          {!sidebarCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'JetBrains Mono',
                fontSize: 14,
                fontWeight: 700,
                color: '#000',
              }}>IL</div>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                Insighta <span style={{ color: 'var(--accent)' }}>Labs+</span>
              </span>
            </div>
          )}
          {sidebarCollapsed && (
            <div style={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'JetBrains Mono',
              fontSize: 16,
              fontWeight: 700,
              color: '#000',
            }}>IL</div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: 18,
              padding: 4,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '20px 12px' }}>
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: sidebarCollapsed ? '12px' : '12px 16px',
                marginBottom: 8,
                background: activeTab === item.id ? '#000000' : 'transparent',
                border: 'none',
                borderRadius: 8,
                color: activeTab === item.id ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: 14,
                fontWeight: activeTab === item.id ? 600 : 400,
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User section */}
        <div style={{
          padding: sidebarCollapsed ? '16px' : '20px',
          borderTop: '1px solid var(--border)',
        }}>
          {!sidebarCollapsed && user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 16,
              padding: '8px',
              borderRadius: 8,
              background: 'var(--bg-hover)',
            }}>
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="avatar"
                  width={40}
                  height={40}
                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'JetBrains Mono',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#000',
                }}>
                  {user.username?.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>@{user.username}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{user.role}</div>
              </div>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: 8, justifyContent: sidebarCollapsed ? 'center' : 'stretch' }}>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              style={{
                flex: !sidebarCollapsed ? 1 : 'auto',
                padding: sidebarCollapsed ? '10px' : '10px 16px',
                background: 'transparent',
                border: '1px solid var(--danger)',
                borderRadius: 8,
                color: 'var(--danger)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--danger)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--danger)';
              }}
            >
              <span>🚪</span>
              {!sidebarCollapsed && 'Logout'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        marginLeft: sidebarCollapsed ? 80 : 260,
        flex: 1,
        padding: '32px 40px',
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh',
      }}>
        {/* Welcome header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-hover))',
          borderRadius: 12,
          padding: '24px 32px',
          marginBottom: 32,
          border: '1px solid var(--border)',
        }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
            Welcome back, <span style={{ color: 'var(--accent)' }}>{user?.username}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {user?.role === 'admin' ? '⚡ Admin — Full access to user management and profile editing' : '👁 Analyst — Read-only access'}
          </p>
        </div>

        {children}
      </main>
    </div>
  );
}