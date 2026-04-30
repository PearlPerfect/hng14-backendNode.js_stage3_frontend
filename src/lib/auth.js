const API = process.env.NEXT_PUBLIC_API_URL;

export function getTokens() {
  if (typeof window === 'undefined') return {};
  return {
    accessToken:  localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token'),
    username:     localStorage.getItem('username'),
  };
}

export function saveTokens({ accessToken, refreshToken, username }) {
  localStorage.setItem('access_token',  accessToken);
  localStorage.setItem('refresh_token', refreshToken);
  if (username) localStorage.setItem('username', username);
}

export function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('username');
}

export function isLoggedIn() {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('access_token');
}

export async function refreshTokens() {
  const { refreshToken } = getTokens();
  if (!refreshToken) return false;
  try {
    const res  = await fetch(`${API}/auth/refresh`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refresh_token: refreshToken }),
    });
    const data = await res.json();
    if (data.access_token) {
      saveTokens({ accessToken: data.access_token, refreshToken: data.refresh_token });
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Add logout function
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