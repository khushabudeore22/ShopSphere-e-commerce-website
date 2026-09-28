import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://shopsphere-e-commerce-website-api.onrender.com/api';

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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional auto cleanup if token is invalid
      // localStorage.removeItem('shopsphere_token');
      // localStorage.removeItem('shopsphere_user');
    }

    return Promise.reject(error);
  }
);

export default api;