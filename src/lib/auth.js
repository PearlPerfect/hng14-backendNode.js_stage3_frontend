const API = process.env.NEXT_PUBLIC_API_URL;

export function getTokens() {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null, username: null };
  return {
    accessToken: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token'),
    username: localStorage.getItem('username'),
  };
}

export function saveTokens({ accessToken, refreshToken, username }) {
  if (typeof window === 'undefined') return;
  if (accessToken) localStorage.setItem('access_token', accessToken);
  if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
  if (username) localStorage.setItem('username', username);
  
  // Debug: Log when tokens are saved
  console.log('Tokens saved:', { accessToken: !!accessToken, refreshToken: !!refreshToken, username });
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('username');
  console.log('Tokens cleared');
}

export function isLoggedIn() {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('access_token');
  console.log('isLoggedIn check:', !!token);
  return !!token;
}

export async function refreshTokens() {
  const { refreshToken } = getTokens();
  if (!refreshToken) {
    console.log('No refresh token available');
    return false;
  }
  
  try {
    console.log('Refreshing tokens...');
    const res = await fetch(`${API}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const data = await res.json();
    if (data.access_token) {
      saveTokens({ accessToken: data.access_token, refreshToken: data.refresh_token });
      console.log('Tokens refreshed successfully');
      return true;
    }
    console.log('Token refresh failed:', data);
    return false;
  } catch (error) {
    console.error('Refresh token error:', error);
    return false;
  }
}

export async function logout() {
  const { refreshToken } = getTokens();
  if (refreshToken) {
    try {
      await fetch(`${API}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  clearTokens();
}
