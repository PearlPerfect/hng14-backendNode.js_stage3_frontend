const API = process.env.NEXT_PUBLIC_API_URL;

export function getTokens() {
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const username = localStorage.getItem('username');
    
    console.log('=== Getting Tokens ===');
    console.log('Access Token exists:', !!accessToken);
    console.log('Refresh Token exists:', !!refreshToken);
    console.log('Username:', username);
    if (accessToken) {
      console.log('Access Token Preview:', accessToken.substring(0, 30) + '...');
      console.log('Access Token Length:', accessToken.length);
    }
    if (refreshToken) {
      console.log('Refresh Token Preview:', refreshToken.substring(0, 30) + '...');
      console.log('Refresh Token Length:', refreshToken.length);
    }
    
    return { accessToken, refreshToken, username };
  }
  return { accessToken: null, refreshToken: null, username: null };
}

export function saveTokens({ accessToken, refreshToken, username }) {
  console.log('=== Saving Tokens ===');
  console.log('Access Token:', accessToken);
  console.log('Refresh Token:', refreshToken);
  console.log('Username:', username);
  console.log('Access Token Length:', accessToken?.length);
  console.log('Refresh Token Length:', refreshToken?.length);
  
  if (typeof window !== 'undefined') {
    if (accessToken) localStorage.setItem('access_token', accessToken);
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
    if (username) localStorage.setItem('username', username);
    
    // Verify save
    const savedAccess = localStorage.getItem('access_token');
    const savedRefresh = localStorage.getItem('refresh_token');
    console.log('Verification - Access Token Saved:', !!savedAccess);
    console.log('Verification - Refresh Token Saved:', !!savedRefresh);
    if (savedAccess) {
      console.log('Saved Access Token Preview:', savedAccess.substring(0, 30) + '...');
    }
    if (savedRefresh) {
      console.log('Saved Refresh Token Preview:', savedRefresh.substring(0, 30) + '...');
    }
  }
}

export function clearTokens() {
  console.log('=== Clearing Tokens ===');
  if (typeof window !== 'undefined') {
    const hadAccess = !!localStorage.getItem('access_token');
    const hadRefresh = !!localStorage.getItem('refresh_token');
    console.log('Had Access Token:', hadAccess);
    console.log('Had Refresh Token:', hadRefresh);
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    
    console.log('Tokens cleared successfully');
  }
}

export function isLoggedIn() {
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('access_token');
    const isLogged = !!accessToken;
    console.log('=== Check Login Status ===');
    console.log('Is Logged In:', isLogged);
    if (accessToken) {
      console.log('Access Token Preview:', accessToken.substring(0, 30) + '...');
    }
    return isLogged;
  }
  return false;
}

export async function refreshTokens() {
  const { refreshToken } = getTokens();
  if (!refreshToken) {
    console.log('No refresh token available');
    return false;
  }
  
  try {
    console.log('Refreshing tokens...');
    console.log('Current refresh token:', refreshToken.substring(0, 30) + '...');
    const res = await fetch(`${API}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const data = await res.json();
    console.log('Refresh response:', { 
      hasAccessToken: !!data.access_token, 
      hasRefreshToken: !!data.refresh_token,
      status: res.status 
    });
    
    if (data.access_token) {
      saveTokens({ 
        accessToken: data.access_token, 
        refreshToken: data.refresh_token || refreshToken,
        username: data.username 
      });
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
  console.log('=== Logging out ===');
  const { refreshToken } = getTokens();
  if (refreshToken) {
    console.log('Sending logout request with refresh token');
    try {
      const response = await fetch(`${API}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      console.log('Logout response status:', response.status);
    } catch (error) {
      console.error('Logout error:', error);
    }
  } else {
    console.log('No refresh token found for logout');
  }
  clearTokens();
}
