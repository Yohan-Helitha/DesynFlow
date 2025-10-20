const API_BASE = '/api/warehouse/notifications';

function getAuthHeader() {
  try {
    if (typeof window === 'undefined') return {};
    const possibleKeys = ['token', 'accessToken', 'authToken', 'jwt'];
    for (const k of possibleKeys) {
      const v = localStorage.getItem(k);
      if (v) return { Authorization: `Bearer ${v}` };
    }
    return {};
  } catch (e) {
    return {};
  }
}

async function request(path, opts = {}) {
  const headers = Object.assign({ 'Content-Type': 'application/json' }, getAuthHeader(), opts.headers || {});
  const res = await fetch(path, { ...opts, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`Request failed ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.body = text;
    throw err;
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

export async function listNotifications({ recipient = 'warehouse', limit = 50, skip = 0 } = {}) {
  const url = `${API_BASE}?recipient=${encodeURIComponent(recipient)}&limit=${limit}&skip=${skip}`;
  const payload = await request(url, { method: 'GET' });
  // normalize shapes: { notifications: [...] } or { data: [...] } or array
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.notifications)) return payload.notifications;
  if (Array.isArray(payload.data)) return payload.data;
  // fallback: try to extract common keys
  return payload.notifications || payload.data || [];
}

export async function getUnreadCount(recipient = 'warehouse') {
  const url = `${API_BASE}/unread-count?recipient=${encodeURIComponent(recipient)}`;
  const payload = await request(url, { method: 'GET' });
  // support { count } or { data: number }
  if (typeof payload === 'object') return payload.count ?? payload.data ?? payload.unreadCount ?? 0;
  return Number(payload) || 0;
}

export async function markRead(id) {
  const url = `${API_BASE}/${encodeURIComponent(id)}/read`;
  const payload = await request(url, { method: 'PUT' });
  return payload;
}

export async function markAllRead(recipient = 'warehouse') {
  const url = `${API_BASE}/mark-all-read?recipient=${encodeURIComponent(recipient)}`;
  const payload = await request(url, { method: 'PUT' });
  return payload;
}

export async function deleteNotification(id) {
  const url = `${API_BASE}/${encodeURIComponent(id)}`;
  const payload = await request(url, { method: 'DELETE' });
  return payload;
}

export async function createNotification(body) {
  const url = `${API_BASE}`;
  const payload = await request(url, { method: 'POST', body: JSON.stringify(body) });
  return payload;
}

const FnotificationService = {
  listNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  deleteNotification,
  createNotification
};

export default FnotificationService;
