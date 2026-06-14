const API_BASE = import.meta.env.VITE_API_URL || '/api';


const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
};

export const api = {
  // Auth
  async signup(username, email, password) {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, email, password }),
    });
    return handleResponse(response);
  },

  async login(email, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  async googleAuth(credential) {
    const response = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ credential }),
    });
    return handleResponse(response);
  },

  async getMe() {
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // URLs
  async getMyUrls() {
    const response = await fetch(`${API_BASE}/url`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async shorten(urlData) {
    const response = await fetch(`${API_BASE}/url/shorten`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(urlData),
    });
    return handleResponse(response);
  },

  async deleteUrl(id) {
    const response = await fetch(`${API_BASE}/url/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async editUrl(id, updates) {
    const response = await fetch(`${API_BASE}/url/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },

  async togglePublic(id, isPublicStats) {
    const response = await fetch(`${API_BASE}/url/${id}/public-toggle`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ isPublicStats }),
    });
    return handleResponse(response);
  },

  // Bulk shorten — sends a CSV file via multipart/form-data
  async bulkShorten(file) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('csvFile', file);
    const response = await fetch(`${API_BASE}/url/bulk`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData, // Do NOT set Content-Type manually — browser sets multipart boundary
    });
    return handleResponse(response);
  },

  // Analytics
  async getAnalytics(shortCode) {
    const response = await fetch(`${API_BASE}/analytics/${shortCode}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getPublicAnalytics(shortCode) {
    const response = await fetch(`${API_BASE}/analytics/public/${shortCode}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};
