'use client';
import { useRouter } from 'next/navigation';
import { clearTokens, getTokens } from '@/lib/auth';
import { logout } from '@/lib/api';

export default function NavBar({ user }) {
  const router = useRouter();

  async function handleLogout() {
    const { refreshToken } = getTokens();
    await logout(refreshToken);
    clearTokens();
    router.push('/login');
  }

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(11,13,15,.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #22282f',
      padding: '0 32px', height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, background: '#00e5a0', borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 600, color: '#000',
        }}>IL</div>
        <span style={{ fontSize: 16, fontWeight: 800 }}>
          Insighta <span style={{ color: '#00e5a0' }}>Labs+</span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#131619', border: '1px solid #22282f',
            borderRadius: 40, padding: '4px 14px 4px 4px',
          }}>
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt="avatar"
                width={30} height={30}
                style={{ borderRadius: '50%', border: '2px solid #22282f', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'linear-gradient(135deg,#00e5a0,#38bdf8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 600, color: '#000',
              }}>
                {user.username?.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: 600 }}>
                @{user.username}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#566070' }}>
                {user.role}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{
            fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 600,
            background: 'transparent', border: '1px solid rgba(244,63,94,.4)',
            color: '#f43f5e', padding: '7px 14px', borderRadius: 6, cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}