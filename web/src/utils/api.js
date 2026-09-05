import { API_BASE_URL } from '../config';
import { demoFetch } from './demoApi';

export function getAuthHeaders(role = 'admin') {
  const saved = localStorage.getItem('dk_user');
  let userRole = role;
  if (saved) {
    try { userRole = JSON.parse(saved).role || role; } catch {}
  }
  return {
    'Content-Type': 'application/json',
    'X-User-Role': userRole,
  };
}

export function isDemoMode() {
  const saved = localStorage.getItem('dk_user');
  if (!saved) return false;
  try {
    return JSON.parse(saved).demo === true;
  } catch {
    return false;
  }
}

export async function apiFetch(path, options = {}) {
  if (isDemoMode()) {
    return demoFetch(path, options);
  }
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = { ...getAuthHeaders(), ...(options.headers || {}) };
  if (isFormData) delete headers['Content-Type']; // let the browser set the multipart boundary
  return fetch(`${API_BASE_URL}${path}`, { ...options, headers });
}
