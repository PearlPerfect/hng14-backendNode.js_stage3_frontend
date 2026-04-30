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
    console.error('API fetch error:', error);
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