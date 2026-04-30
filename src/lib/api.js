import { getTokens, refreshTokens, clearTokens } from './auth';

const API = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(path, options = {}) {
  const { accessToken } = getTokens();

  const headers = {
    'Content-Type':  'application/json',
    'X-API-Version': '1',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };

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
    window.location.href = '/login';
    return null;
  }

  return res;
}

export async function getProfiles(params = {}) {
  const qs  = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
  );
  const res = await apiFetch(`/api/profiles?${qs}`);
  return res?.json();
}

export async function searchProfiles(q, page = 1, limit = 10) {
  const res = await apiFetch(`/api/profiles/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`);
  return res?.json();
}

export async function getProfile(id) {
  const res = await apiFetch(`/api/profiles/${id}`);
  return res?.json();
}

export async function createProfile(name) {
  const res = await apiFetch('/api/profiles', {
    method: 'POST',
    body:   JSON.stringify({ name }),
  });
  return res?.json();
}

export async function deleteProfile(id) {
  const res = await apiFetch(`/api/profiles/${id}`, { method: 'DELETE' });
  return res?.status === 204 ? { status: 'success' } : res?.json();
}

export async function getMe() {
  const res = await apiFetch('/auth/me');
  return res?.json();
}

export async function logout(refreshToken) {
  await apiFetch('/auth/logout', {
    method: 'POST',
    body:   JSON.stringify({ refresh_token: refreshToken }),
  });
}