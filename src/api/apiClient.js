/**
 * PHP API Client
 * Custom HTTP client for PHP backend
 */

const API_BASE_URL = '/api';

class APIClient {
  constructor() {
    this.token = localStorage.getItem('auth_token');
    this.user = JSON.parse(localStorage.getItem('auth_user') || '{}');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  setUser(user) {
    this.user = user;
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  clearAuth() {
    this.token = null;
    this.user = {};
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const method = options.method || 'GET';
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
      method,
      headers: this.getHeaders(),
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);

      if (response.status === 401 && !endpoint.startsWith('/auth/')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }

      const text = await response.text();
    let data={};
    try{data=JSON.parse(text);}catch(e){throw new Error('Server returned invalid JSON. Check API URL.');}

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      return data?.data ?? data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }

  async put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Auth methods
  auth = {
  login: (email, password) =>
    this.post('/auth/login', { email, password }).then((response) => {
      const payload = response;

      if (!payload?.token || !payload?.user) {
        console.error("Login response invalid:", payload);
        throw new Error("Invalid login response shape");
      }

      return payload;
    }),

 register: (email, password, full_name, role = 'inspector', department = null) =>
  this.post('/auth/register', { email, password, full_name, role, department })
    .then((response) => {
      const payload = response;

      console.log("REGISTER RESPONSE:", payload);

      const token = payload?.token ?? payload?.data?.token;
      const user = payload?.user ?? payload?.data?.user;

      if (!token || !user) {
        throw new Error(
          "Invalid register response shape: expected token + user"
        );
      }

      this.setToken(token);
      this.setUser(user);

      return user;
    }),
    
  me: () => this.get('/auth/me'),

  resetPassword: () => Promise.reject(new Error('Password reset is not yet available. Please contact an administrator.')),

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this.token = null;
    this.user = {};
    return this.get('/auth/logout');
  },
};
  // Entity methods
  entities = {
    Vehicle: {
      list: (sort = '', limit = 20) =>
        this.get(`/vehicles?page=1&limit=${limit}`),
      get: (id) => this.get(`/vehicles/${id}`),
      create: (data) =>
        this.post('/vehicles/create', data),
      update: (id, data) =>
        this.put(`/vehicles/${id}/update`, data),
      delete: (id) =>
        this.delete(`/vehicles/${id}/delete`),
      search: (query) =>
        this.get(`/vehicles/search?q=${encodeURIComponent(query)}`),
    },

    InspectionReport: {
      list: (sort = '', limit = 20) =>
        this.get(`/inspection-reports?page=1&limit=${limit}`),
      get: (id) => this.get(`/inspection-reports/${id}`),
      create: (data) =>
        this.post('/inspection-reports/create', data),
      update: (id, data) =>
        this.put(`/inspection-reports/${id}/update`, data),
      delete: (id) =>
        this.delete(`/inspection-reports/${id}/delete`),
      getByVehicle: (vehicleId) =>
        this.get(`/inspection-reports/by-vehicle/${vehicleId}`),
      getByStatus: (status) =>
        this.get(`/inspection-reports/by-status?status=${status}`),
      filter: (params) =>
        params?.status ? this.get(`/inspection-reports/by-status?status=${params.status}`) : Promise.reject(new Error('Filter not supported')),
    },

    JobCard: {
      list: (sort = '', limit = 20) =>
        this.get(`/job-cards?page=1&limit=${limit}`),
      get: (id) => this.get(`/job-cards/${id}`),
      create: (data) =>
        this.post('/job-cards/create', data),
      update: (id, data) =>
        this.put(`/job-cards/${id}/update`, data),
      delete: (id) =>
        this.delete(`/job-cards/${id}/delete`),
      getByStatus: (status) =>
        this.get(`/job-cards/by-status?status=${status}`),
    },

    PartsRequest: {
      list: (sort = '', limit = 20) =>
        this.get(`/parts-requests?page=1&limit=${limit}`),
      get: (id) => this.get(`/parts-requests/${id}`),
      create: (data) =>
        this.post('/parts-requests/create', data),
      update: (id, data) =>
        this.put(`/parts-requests/${id}/update`, data),
      delete: (id) =>
        this.delete(`/parts-requests/${id}/delete`),
      getByStatus: (status) =>
        this.get(`/parts-requests/by-status?status=${status}`),
    },

    InventoryItem: {
      list: (sort = '', limit = 20) =>
        this.get(`/inventory?page=1&limit=${limit}`),
      get: (id) => this.get(`/inventory/${id}`),
      create: (data) =>
        this.post('/inventory/create', data),
      update: (id, data) =>
        this.put(`/inventory/${id}/update`, data),
      delete: (id) =>
        this.delete(`/inventory/${id}/delete`),
      getLowStock: () =>
        this.get('/inventory/low-stock'),
      getByCategory: (category) =>
        this.get(`/inventory/by-category?category=${category}`),
      search: (query) =>
        this.get(`/inventory/search?q=${encodeURIComponent(query)}`),
      deductStock: (id, quantity) =>
        this.put(`/inventory/${id}/deduct-stock`, { quantity }),
      addStock: (id, quantity) =>
        this.put(`/inventory/${id}/add-stock`, { quantity }),
    },

    Notification: {
      list: (sort = '', limit = 20) =>
        this.get(`/notifications?page=1&limit=${limit}`),
      get: (id) => this.get(`/notifications/${id}`),
      create: (data) =>
        this.post('/notifications/create', data),
      delete: (id) =>
        this.delete(`/notifications/${id}/delete`),
      getLatest: (limit = 10) =>
        this.get(`/notifications/latest?limit=${limit}`),
      getByType: (type) =>
        this.get(`/notifications/by-type?type=${type}`),
      getUnread: () =>
        this.get('/notifications/unread'),
      markAsRead: (id) =>
        this.put(`/notifications/${id}/mark-as-read`, {}),
      markAllAsRead: () =>
        this.put('/notifications/mark-all-as-read', {}),
    },
  };
}

export const api = new APIClient();

