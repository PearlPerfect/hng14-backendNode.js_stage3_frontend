import { getTokens, refreshTokens, clearTokens } from './auth';

const API = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(path, options = {}) {
  const { accessToken } = getTokens();

  const headers = {
    'Content-Type': 'application/json',
    'X-API-Version': '1',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API}${path}`, { ...options, headers });

    // Auto-refresh on 401
    if (res.status === 401) {
      const refreshed = await refreshTokens();
      if (refreshed) {
        const { accessToken: newToken } = getTokens();
        const retry = await fetch(`${API}${path}`, {
          ...options,
          headers: { ...headers, Authorization: `Bearer ${newToken}` },
        });
        return retry;
      }
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }

    return res;
  } catch (error) {
    console.error(`API fetch error for ${path}:`, error);
    return null;
  }
}

export async function getProfiles(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
  );
  try {
    const res = await apiFetch(`/api/profiles?${qs}`);
    if (!res) return null;
    return await res.json();
  } catch (error) {
    console.error('Get profiles error:', error);
    return null;
  }
}

export async function searchProfiles(q, page = 1, limit = 10) {
  try {
    const res = await apiFetch(`/api/profiles/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`);
    if (!res) return null;
    return await res.json();
  } catch (error) {
    console.error('Search profiles error:', error);
    return null;
  }
}

export async function getProfile(id) {
  try {
    const res = await apiFetch(`/api/profiles/${id}`);
    if (!res) return null;
    return await res.json();
  } catch (error) {
    console.error('Get profile error:', error);
    return null;
  }
}

export async function createProfile(name) {
  try {
    const res = await apiFetch('/api/profiles', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    if (!res) return null;
    return await res.json();
  } catch (error) {
    console.error('Create profile error:', error);
    return null;
  }
}

export async function deleteProfile(id) {
  try {
    const res = await apiFetch(`/api/profiles/${id}`, { method: 'DELETE' });
    if (!res) return null;
    return res.status === 204 ? { status: 'success' } : await res.json();
  } catch (error) {
    console.error('Delete profile error:', error);
    return null;
  }
}

export async function getMe() {
  try {
    const res = await apiFetch('/auth/me');
    if (!res) return null;
    return await res.json();
  } catch (error) {
    console.error('Get me error:', error);
    return null;
  }
}

export async function logout(refreshToken) {
  try {
    await apiFetch('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// ============= USER MANAGEMENT FUNCTIONS =============

export async function getUsers(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
  );
  try {
    const res = await apiFetch(`/api/users?${qs}`);
    if (!res) return null;
    return await res.json();
  } catch (error) {
    console.error('Get users error:', error);
    return null;
  }
}

export async function getUser(id) {
  try {
    const res = await apiFetch(`/api/users/${id}`);
    if (!res) return null;
    return await res.json();
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

export async function createUser(userData) {
  try {
    const res = await apiFetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (!res) return null;
    return await res.json();
  } catch (error) {
    console.error('Create user error:', error);
    return null;
  }
}

export async function updateUser(id, userData) {
  try {
    const res = await apiFetch(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    if (!res) return null;
    return await res.json();
  } catch (error) {
    console.error('Update user error:', error);
    return null;
  }
}

export async function deleteUser(id) {
  try {
    const res = await apiFetch(`/api/users/${id}`, { method: 'DELETE' });
    if (!res) return null;
    return res.status === 204 ? { status: 'success' } : await res.json();
  } catch (error) {
    console.error('Delete user error:', error);
    return null;
  }
}