const API_BASE = '/fuel/api';

const api = {
  _token: localStorage.getItem('auth_token'),
  _user: JSON.parse(localStorage.getItem('auth_user') || 'null'),

  get token() { return this._token },
  set token(v) {
    this._token = v;
    if (v) localStorage.setItem('auth_token', v);
    else localStorage.removeItem('auth_token');
  },

  get user() { return this._user },
  set user(v) {
    this._user = v;
    if (v) localStorage.setItem('auth_user', JSON.stringify(v));
    else localStorage.removeItem('auth_user');
  },

  _headers() {
    const h = { 'Content-Type': 'application/json' };
    if (this._token) h['Authorization'] = `Bearer ${this._token}`;
    return h;
  },

  async _fetch(endpoint, opts = {}) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: opts.method || 'GET',
      headers: this._headers(),
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    if (res.status === 401 && !endpoint.startsWith('/auth/')) {
      this.token = null; this.user = null;
      window.location.href = '/fuel/login';
      throw new Error('Unauthorized');
    }
    const text = await res.text();
    let data;
    try { data = JSON.parse(text) } catch { throw new Error('Server returned invalid JSON') }
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data?.data ?? data;
  },

  get(endpoint) { return this._fetch(endpoint) },
  post(endpoint, body) { return this._fetch(endpoint, { method: 'POST', body }) },
  put(endpoint, body) { return this._fetch(endpoint, { method: 'PUT', body }) },
  delete(endpoint) { return this._fetch(endpoint, { method: 'DELETE' }) },

  auth: {
    login: (email, password) =>
      api._fetch('/auth/login', { method: 'POST', body: { email, password } }).then(r => {
        if (!r?.token || !r?.user) throw new Error('Invalid login response');
        return r;
      }),
    register: (email, password, full_name, role, department) =>
      api._fetch('/auth/register', { method: 'POST', body: { email, password, full_name, role, department } }).then(r => {
        const token = r?.token ?? r?.data?.token;
        const user = r?.user ?? r?.data?.user;
        if (!token || !user) throw new Error('Invalid register response');
        api.token = token; api.user = user;
        return user;
      }),
    me: () => api._fetch('/auth/me'),
    logout: () => { api.token = null; api.user = null; return api._fetch('/auth/logout') },
  },

  vehicles: {
    list: (limit = 20) => api._fetch(`/vehicles?page=1&limit=${limit}`),
    get: (id) => api._fetch(`/vehicles/${id}`),
    create: (d) => api._fetch('/vehicles/create', { method: 'POST', body: d }),
    update: (id, d) => api._fetch(`/vehicles/${id}/update`, { method: 'PUT', body: d }),
    delete: (id) => api._fetch(`/vehicles/${id}/delete`, { method: 'DELETE' }),
    search: (q) => api._fetch(`/vehicles/search?q=${encodeURIComponent(q)}`),
  },

  inspectionReports: {
    list: (limit = 20) => api._fetch(`/inspection-reports?page=1&limit=${limit}`),
    get: (id) => api._fetch(`/inspection-reports/${id}`),
    create: (d) => api._fetch('/inspection-reports/create', { method: 'POST', body: d }),
    update: (id, d) => api._fetch(`/inspection-reports/${id}/update`, { method: 'PUT', body: d }),
    delete: (id) => api._fetch(`/inspection-reports/${id}/delete`, { method: 'DELETE' }),
    getByVehicle: (vid) => api._fetch(`/inspection-reports/by-vehicle/${vid}`),
    getByStatus: (s) => api._fetch(`/inspection-reports/by-status?status=${s}`),
    filter: (p) => p?.status ? api._fetch(`/inspection-reports/by-status?status=${p.status}`) : Promise.reject(new Error('Filter not supported')),
  },

  jobCards: {
    list: (limit = 20) => api._fetch(`/job-cards?page=1&limit=${limit}`),
    get: (id) => api._fetch(`/job-cards/${id}`),
    create: (d) => api._fetch('/job-cards/create', { method: 'POST', body: d }),
    update: (id, d) => api._fetch(`/job-cards/${id}/update`, { method: 'PUT', body: d }),
    delete: (id) => api._fetch(`/job-cards/${id}/delete`, { method: 'DELETE' }),
    getByStatus: (s) => api._fetch(`/job-cards/by-status?status=${s}`),
  },

  partsRequests: {
    list: (limit = 20) => api._fetch(`/parts-requests?page=1&limit=${limit}`),
    get: (id) => api._fetch(`/parts-requests/${id}`),
    create: (d) => api._fetch('/parts-requests/create', { method: 'POST', body: d }),
    update: (id, d) => api._fetch(`/parts-requests/${id}/update`, { method: 'PUT', body: d }),
    delete: (id) => api._fetch(`/parts-requests/${id}/delete`, { method: 'DELETE' }),
    getByStatus: (s) => api._fetch(`/parts-requests/by-status?status=${s}`),
  },

  inventory: {
    list: () => api._fetch('/inventory?page=1&limit=100'),
    get: (id) => api._fetch(`/inventory/${id}`),
    create: (d) => api._fetch('/inventory/create', { method: 'POST', body: d }),
    update: (id, d) => api._fetch(`/inventory/${id}/update`, { method: 'PUT', body: d }),
    delete: (id) => api._fetch(`/inventory/${id}/delete`, { method: 'DELETE' }),
    getLowStock: () => api._fetch('/inventory/low-stock'),
    getByCategory: (c) => api._fetch(`/inventory/by-category?category=${c}`),
    search: (q) => api._fetch(`/inventory/search?q=${encodeURIComponent(q)}`),
    deductStock: (id, qty) => api._fetch(`/inventory/${id}/deduct-stock`, { method: 'PUT', body: { quantity: qty } }),
    addStock: (id, qty) => api._fetch(`/inventory/${id}/add-stock`, { method: 'PUT', body: { quantity: qty } }),
  },

  notifications: {
    list: (limit = 20) => api._fetch(`/notifications?page=1&limit=${limit}`),
    get: (id) => api._fetch(`/notifications/${id}`),
    create: (d) => api._fetch('/notifications/create', { method: 'POST', body: d }),
    delete: (id) => api._fetch(`/notifications/${id}/delete`, { method: 'DELETE' }),
    getLatest: (limit = 10) => api._fetch(`/notifications/latest?limit=${limit}`),
    getByType: (t) => api._fetch(`/notifications/by-type?type=${t}`),
    getUnread: () => api._fetch('/notifications/unread'),
    markAsRead: (id) => api._fetch(`/notifications/${id}/mark-as-read`, { method: 'PUT', body: {} }),
    markAllAsRead: () => api._fetch('/notifications/mark-all-as-read', { method: 'PUT', body: {} }),
  },
};

export default api;
