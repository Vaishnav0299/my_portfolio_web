/**
 * API fetch wrapper for the frontend.
 * ─────────────────────────────────────
 * - Uses VITE_API_URL (defaults to '/api' for same-domain Vercel deployment)
 * - Automatically injects Authorization header for admin requests
 * - Returns parsed JSON or throws an error with a clear message
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

function getAuthToken() {
  return localStorage.getItem('portfolio_admin_token');
}

/**
 * Core fetch wrapper.
 * @param {string} path - API path, e.g. '/projects'
 * @param {RequestInit} options - fetch options
 * @param {boolean} requiresAuth - inject Authorization header if true
 */
async function apiFetch(path, options = {}, requiresAuth = false) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };

  if (requiresAuth) {
    const token = getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  // Consider successful if response.ok AND (data.success is true OR data.ok is true OR success is not explicitly false)
  const isSuccess = response.ok && (data.success !== false) && (data.ok !== false);

  if (!isSuccess) {
    const message = data.error ?? data.message ?? `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return data;
}

// ── Public & Admin API methods ───────────────────────────────────────────────

export const api = {
  // Health
  health: () => apiFetch('/health'),

  // Site Configuration & Feature Flags
  getConfig:    () => apiFetch('/config'),
  updateConfig: (body) => apiFetch('/config/admin', { method: 'PUT', body: JSON.stringify(body) }, true),

  // Data endpoints (public)
  getProjects:      () => apiFetch('/projects'),
  getProject:       (id) => apiFetch(`/projects/${id}`),
  getSkills:        () => apiFetch('/skills'),
  getTimeline:      () => apiFetch('/timeline'),
  getBio:           () => apiFetch('/bio'),
  getServices:      () => apiFetch('/services'),
  getTestimonials:  () => apiFetch('/testimonials'),
  getBlogPosts:     () => apiFetch('/blog'),
  getBlogPost:      (slug) => apiFetch(`/blog/${slug}`),
  getFaqs:          () => apiFetch('/faq'),
  getNow:           () => apiFetch('/meta/now'),
  getUses:          () => apiFetch('/meta/uses'),
  getGithubStats:   () => apiFetch('/meta/github'),
  sendContact:      (body) => apiFetch('/contact', { method: 'POST', body: JSON.stringify(body) }),

  // Auth
  login:  (email, password) => apiFetch('/auth/login',  { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),

  // Admin — Projects
  createProject: (body) => apiFetch('/projects/admin',       { method: 'POST', body: JSON.stringify(body) }, true),
  updateProject: (id, body) => apiFetch(`/projects/admin/${id}`, { method: 'PUT',  body: JSON.stringify(body) }, true),
  deleteProject: (id) => apiFetch(`/projects/admin/${id}`,   { method: 'DELETE' }, true),

  // Admin — Skills
  createSkill:   (body) => apiFetch('/skills/admin',       { method: 'POST', body: JSON.stringify(body) }, true),
  updateSkill:   (id, body) => apiFetch(`/skills/admin/${id}`, { method: 'PUT',  body: JSON.stringify(body) }, true),
  deleteSkill:   (id) => apiFetch(`/skills/admin/${id}`,   { method: 'DELETE' }, true),

  // Admin — Timeline
  createTimeline: (body) => apiFetch('/timeline/admin',        { method: 'POST', body: JSON.stringify(body) }, true),
  updateTimeline: (id, body) => apiFetch(`/timeline/admin/${id}`, { method: 'PUT',  body: JSON.stringify(body) }, true),
  deleteTimeline: (id) => apiFetch(`/timeline/admin/${id}`,    { method: 'DELETE' }, true),

  // Admin — Bio
  updateBio: (body) => apiFetch('/bio/admin', { method: 'PUT', body: JSON.stringify(body) }, true),

  // Admin — Services
  createService: (body) => apiFetch('/services/admin', { method: 'POST', body: JSON.stringify(body) }, true),
  updateService: (id, body) => apiFetch(`/services/admin/${id}`, { method: 'PUT', body: JSON.stringify(body) }, true),
  deleteService: (id) => apiFetch(`/services/admin/${id}`, { method: 'DELETE' }, true),

  // Admin — Testimonials
  createTestimonial: (body) => apiFetch('/testimonials/admin', { method: 'POST', body: JSON.stringify(body) }, true),
  updateTestimonial: (id, body) => apiFetch(`/testimonials/admin/${id}`, { method: 'PUT', body: JSON.stringify(body) }, true),
  deleteTestimonial: (id) => apiFetch(`/testimonials/admin/${id}`, { method: 'DELETE' }, true),

  // Admin — Blog
  createBlogPost: (body) => apiFetch('/blog/admin', { method: 'POST', body: JSON.stringify(body) }, true),
  updateBlogPost: (id, body) => apiFetch(`/blog/admin/${id}`, { method: 'PUT', body: JSON.stringify(body) }, true),
  deleteBlogPost: (id) => apiFetch(`/blog/admin/${id}`, { method: 'DELETE' }, true),

  // Admin — FAQs
  createFaq: (body) => apiFetch('/faq/admin', { method: 'POST', body: JSON.stringify(body) }, true),
  updateFaq: (id, body) => apiFetch(`/faq/admin/${id}`, { method: 'PUT', body: JSON.stringify(body) }, true),
  deleteFaq: (id) => apiFetch(`/faq/admin/${id}`, { method: 'DELETE' }, true),

  // Admin — Meta: Now & Uses
  updateNow:     (body) => apiFetch('/meta/admin/now', { method: 'PUT', body: JSON.stringify(body) }, true),
  addNowItem:    (body) => apiFetch('/meta/admin/now', { method: 'POST', body: JSON.stringify(body) }, true),
  deleteNowItem: (index) => apiFetch(`/meta/admin/now/${index}`, { method: 'DELETE' }, true),
  updateUses:    (body) => apiFetch('/meta/admin/uses', { method: 'PUT', body: JSON.stringify(body) }, true),

  // Admin — Contact Messages
  getMessages:   () => apiFetch('/contact/messages', {}, true),
  deleteMessage: (id) => apiFetch(`/contact/messages/${id}`, { method: 'DELETE' }, true),

  // Offline sync — flush queue
  syncBatch: (operations) => apiFetch('/sync', { method: 'POST', body: JSON.stringify({ operations }) }, true),

  // Manual DB Sync — force sync between Supabase and local cache
  syncDb: () => apiFetch('/sync/db', { method: 'POST' }, true),
  getDbSyncStatus: () => apiFetch('/sync/db', { method: 'GET' }, true),
};
