import axios from 'axios';

// Use relative /api URL to leverage Vite proxy and avoid any CORS/IPv4/IPv6 mismatch issues
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject User ID and Admin credentials from localStorage
api.interceptors.request.use((config) => {
  try {
    const savedUser = localStorage.getItem('shopsmart_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed && parsed.id) {
        config.headers['X-User-Id'] = parsed.id;
      }
      if (parsed && parsed.is_admin) {
        config.headers['X-Admin-Auth'] = 'true';
      }
    }
  } catch (e) {
    // ignore parse error
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
