'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { saveTokens, isLoggedIn } from '@/lib/auth';
import { Suspense } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Check if we have tokens in URL (from OAuth callback)
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const username = searchParams.get('username');
    
    if (accessToken && refreshToken) {
      // Save tokens and redirect to dashboard
      saveTokens({ accessToken, refreshToken, username });
      // Clean URL by removing tokens
      router.replace('/dashboard');
      return;
    }
    
    // If already logged in, go to dashboard
    if (isLoggedIn()) {
      router.replace('/dashboard');
    }
  }, [searchParams, router]);

  const handleGitHubLogin = (e) => {
    e.preventDefault();
    setIsRedirecting(true);
    // Redirect to GitHub OAuth
    const redirectUri = `${window.location.origin}/login`;
    window.location.href = `${API}/auth/github?redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  const Spinner = () => (
    <div style={{
      display: 'inline-block',
      width: '18px',
      height: '18px',
      border: '2px solid rgba(0,0,0,0.1)',
      borderTopColor: '#000',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
    }} />
  );

  // Add keyframes for spinner animation
  if (typeof window !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    if (!document.head.querySelector('#spinner-keyframes')) {
      style.id = 'spinner-keyframes';
      document.head.appendChild(style);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0b0d0f',
    }}>
      <div style={{
        background: '#131619', border: '1px solid #22282f',
        borderRadius: 12, padding: '48px 40px', textAlign: 'center',
        maxWidth: 400, width: '100%',
      }}>
        <div style={{
          width: 48, height: 48, background: '#00e5a0', borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontFamily: 'JetBrains Mono', fontSize: 16, fontWeight: 700, color: '#000',
        }}>IL</div>

        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          Insighta <span style={{ color: '#00e5a0' }}>Labs+</span>
        </h1>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#566070', marginBottom: 32 }}>
          Demographic intelligence platform
        </p>

        <button
          onClick={handleGitHubLogin}
          disabled={isRedirecting}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            background: '#fff', color: '#000', fontWeight: 600, fontSize: 15,
            padding: '13px 24px', borderRadius: 8, textDecoration: 'none',
            transition: 'opacity .2s',
            cursor: isRedirecting ? 'default' : 'pointer',
            opacity: isRedirecting ? 0.7 : 1,
            border: 'none',
            width: '100%',
          }}
        >
          {isRedirecting ? (
            <>
              <Spinner />
              <span>Redirecting to GitHub...</span>
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.1.82-.26.82-.58v-2.03c-3.34.73-4.04-1.6-4.04-1.6-.55-1.38-1.34-1.75-1.34-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.48.99.1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 013-.4c1.02 0 2.04.13 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0024 12C24 5.37 18.63 0 12 0z"/>
              </svg>
              <span>Continue with GitHub</span>
            </>
          )}
        </button>
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
        background: '#0b0d0f',
        color: '#00e5a0',
        fontFamily: 'JetBrains Mono'
      }}>
        Loading...
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}