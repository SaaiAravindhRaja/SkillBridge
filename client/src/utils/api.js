import axios from 'axios';

// Use environment variables for API URL with fallback
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance with configuration
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add token from localStorage to all requests if present
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error types (can be extended as needed)
    if (error.code === 'ERR_NETWORK') {
      // Network error handling - server might be down
      // You could implement retry logic here if needed
    }
    
    // Always reject the promise to let the calling code handle the error
    return Promise.reject(error);
  }
);

export default api;
