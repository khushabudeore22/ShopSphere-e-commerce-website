import axios from 'axios';

let rawBaseUrl =
  import.meta.env.VITE_API_URL ||
  'https://shopsphere-e-commerce-website-api.onrender.com/api';

// Normalize base URL: trim whitespace and remove trailing slashes
rawBaseUrl = rawBaseUrl.trim().replace(/\/+$/, '');

// Ensure /api suffix exists
if (!rawBaseUrl.endsWith('/api')) {
  rawBaseUrl = `${rawBaseUrl}/api`;
}

const API_BASE_URL = rawBaseUrl;

console.log('API BASE URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shopsphere_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      'API Error:',
      error.response?.status,
      error.response?.data || error.message
    );

    if (error.response && error.response.status === 401) {
      // localStorage.removeItem('shopsphere_token');
      // localStorage.removeItem('shopsphere_user');
    }

    return Promise.reject(error);
  }
);

export default api;