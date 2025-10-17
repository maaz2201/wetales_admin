import axios from 'axios';

// Get the API base URL from your environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create a new Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// --- Request Interceptor ---
// This runs BEFORE each request is sent
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // If a token exists, add it to the Authorization header
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
// This runs AFTER a response is received
api.interceptors.response.use(
  (response) => {
    // If the request was successful, just return the response
    return response;
  },
  (error) => {
    // Check if the error is due to an expired token (401 Unauthorized)
    if (error.response && error.response.status === 401) {
      console.log("Session expired. Logging out...");
      
      // Clear all stored user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to the login page.
      // Using window.location.href ensures a full page refresh, clearing any old state.
      window.location.href = '/login'; 
    }
    
    // For all other errors, just pass them along
    return Promise.reject(error);
  }
);

export default api;