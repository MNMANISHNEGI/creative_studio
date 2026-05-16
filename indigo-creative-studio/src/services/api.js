const BASE = '/api';

function getToken() {
  return localStorage.getItem('indigo_token');
}

function headers(extra = {}) {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: headers(options.headers),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

/* ── Auth ──────────────────────────────────────────────────────── */
export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const getMe = () => request('/auth/me');

/* ── Projects ──────────────────────────────────────────────────── */
export const getProjects = () => request('/projects');

export const createProject = (name, description, color_idx) =>
  request('/projects', { method: 'POST', body: JSON.stringify({ name, description, color_idx }) });

export const deleteProject = (id) =>
  request(`/projects/${id}`, { method: 'DELETE' });

/* ── Generate ──────────────────────────────────────────────────── */
export const generateCopy = (payload) =>
  request('/generate/copy', { method: 'POST', body: JSON.stringify(payload) });

export const generateSocial = (payload) =>
  request('/generate/social', { method: 'POST', body: JSON.stringify(payload) });

export const generateBanner = (payload) =>
  request('/generate/banner', { method: 'POST', body: JSON.stringify(payload) });

export const getHistory = (projectId) =>
  request(`/generate/history/${projectId}`);

/* ── Explore ───────────────────────────────────────────────────── */
export const getExplore = (type) =>
  request(`/explore${type ? `?type=${type}` : ''}`);
