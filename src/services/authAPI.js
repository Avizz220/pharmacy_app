// API base URL - change this to match your backend server
const API_BASE_URL = 'http://localhost:8080/api';

// API service for authentication
export const authAPI = {
  // Login user
  login: async (usernameOrEmail, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usernameOrEmail,
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userInfo', JSON.stringify({
            username: data.username,
            email: data.email,
            fullName: data.fullName,
            role: data.role
          }));
        }
        return { success: true, data };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please check if the backend server is running.' };
    }
  },

  // Register user
  register: async (username, email, password, fullName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          fullName
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userInfo', JSON.stringify({
            username: data.username,
            email: data.email,
            fullName: data.fullName,
            role: data.role
          }));
        }
        return { success: true, data };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Network error. Please check if the backend server is running.' };
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
  },

  // Get current user info
  getCurrentUser: () => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  },

  // Check if user is logged in
  isLoggedIn: () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  // Get auth token
  getToken: () => {
    return localStorage.getItem('authToken');
  },

  // Test backend connection
  testConnection: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/test`);
      return response.ok;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }
};

// Helper function to make authenticated API requests
export const authenticatedFetch = async (url, options = {}) => {
  const token = authAPI.getToken();
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  return fetch(url, mergedOptions);
};
