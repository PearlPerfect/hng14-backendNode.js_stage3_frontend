'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { saveTokens, isLoggedIn } from '@/lib/auth';
import { Suspense } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

const API = process.env.NEXT_PUBLIC_API_URL;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [redirectUrl, setRedirectUrl] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    setRedirectUrl(`${API}/auth/github?redirect_uri=${encodeURIComponent(window.location.origin + '/login')}`);
    
    const access = searchParams.get('access_token');
    const refresh = searchParams.get('refresh_token');
    const username = searchParams.get('username');
    if (access && refresh) {
      saveTokens({ accessToken: access, refreshToken: refresh, username });
      router.replace('/dashboard');
      return;
    }
    if (isLoggedIn()) router.replace('/dashboard');
  }, [searchParams, router, API]);

  const handleGitHubLogin = (e) => {
    if (!redirectUrl || redirectUrl === '#') {
      e.preventDefault();
      return;
    }
    setIsRedirecting(true);
  };

  const Spinner = () => (
    <svg 
      width="18" 
      height="18" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{
        animation: 'spin 0.6s linear infinite',
      }}
    >
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
      <path d="M12 2 C6.477 2 2 6.477 2 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );

  return (
    <div style={{
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'center', 
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Theme Toggle Positioned */}
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <ThemeToggle />
      </div>

      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: `radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)`,
        top: '-200px',
        right: '-200px',
        borderRadius: '50%',
      }} />
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: `radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)`,
        bottom: '-250px',
        left: '-250px',
        borderRadius: '50%',
      }} />

      <div className="card" style={{
        padding: '52px 44px',
        textAlign: 'center',
        maxWidth: 440,
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }}>
        <div style={{
          width: 56,
          height: 56,
          background: 'var(--accent-gradient)',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontFamily: 'Fira Code, monospace',
          fontSize: 20,
          fontWeight: 700,
          color: '#fff',
          boxShadow: '0 8px 20px rgba(6, 182, 212, 0.3)',
        }}>
          IL
        </div>

        <h1 style={{ 
          fontSize: 32, 
          fontWeight: 700, 
          marginBottom: 12,
        }} className="gradient-text">
          Insighta Labs+
        </h1>
        <p style={{ 
          fontFamily: 'Inter, sans-serif', 
          fontSize: 13, 
          color: 'var(--text-muted)', 
          marginBottom: 36,
        }}>
          Demographic intelligence platform
        </p>

        <a
          href={redirectUrl || '#'}
          onClick={handleGitHubLogin}
          className="btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            textDecoration: 'none',
            cursor: redirectUrl && !isRedirecting ? 'pointer' : 'default',
            opacity: redirectUrl && !isRedirecting ? 1 : 0.7,
          }}
        >
          {isRedirecting ? (
            <>
              <Spinner />
              <span>Redirecting...</span>
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.1.82-.26.82-.58v-2.03c-3.34.73-4.04-1.6-4.04-1.6-.55-1.38-1.34-1.75-1.34-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.48.99.1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 013-.4c1.02 0 2.04.13 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0024 12C24 5.37 18.63 0 12 0z"/>
              </svg>
              <span>Continue with GitHub</span>
            </>
          )}
        </a>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--accent-primary)',
      }}>
        Loading...
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}