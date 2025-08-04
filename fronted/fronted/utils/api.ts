// frontend/utils/api.ts
import axios from 'axios';

// Get the URL from environment variables, with a fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in outgoing requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (or your preferred state management)
    const token = localStorage.getItem('token'); // We'll store it here after login

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor for global error handling (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle 401 Unauthorized errors globally
      // e.g., clear token, redirect to login page
      console.error('Unauthorized request. Redirecting to login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user'); // Clear user info too
      // You might want to programmatically redirect here:
      // window.location.href = '/login'; // Or use Next.js router
    }
    return Promise.reject(error);
  }
);

export default api;