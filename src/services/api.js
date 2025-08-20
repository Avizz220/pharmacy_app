// API base URL - change this to match your backend server
const API_BASE_URL = 'http://localhost:8080/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Check if user is authenticated
const isAuthenticated = () => {
  return !!getAuthToken();
};

// Create headers with authentication
const createHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Generic API request handler
const apiRequest = async (endpoint, options = {}) => {
  try {
    // Check authentication for protected endpoints
    if (!isAuthenticated() && !endpoint.includes('/auth/')) {
      throw new Error('Authentication required. Please login again.');
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: createHeaders(),
      ...options
    };

    const response = await fetch(url, config);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      throw new Error('Session expired. Please login again.');
    }
    
    // Handle 403 Forbidden
    if (response.status === 403) {
      throw new Error('Access denied. You do not have permission to perform this action.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    return { 
      success: false, 
      error: error.message || 'Network error occurred'
    };
  }
};

// Equipment API
export const equipmentAPI = {
  // Get all equipment with pagination
  getAll: async (page = 0, size = 100) => {
    return apiRequest(`/equipment?page=${page}&size=${size}`);
  },

  // Get equipment by ID
  getById: async (id) => {
    return apiRequest(`/equipment/${id}`);
  },

  // Create new equipment
  create: async (equipmentData) => {
    return apiRequest('/equipment', {
      method: 'POST',
      body: JSON.stringify(equipmentData)
    });
  },

  // Update equipment
  update: async (id, equipmentData) => {
    return apiRequest(`/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(equipmentData)
    });
  },

  // Delete equipment
  delete: async (id) => {
    return apiRequest(`/equipment/${id}`, {
      method: 'DELETE'
    });
  },

  // Search equipment
  search: async (searchTerm) => {
    return apiRequest(`/equipment/search?q=${encodeURIComponent(searchTerm)}`);
  }
};

// Customers API
export const customersAPI = {
  getAll: async (page = 0, size = 100) => {
    return apiRequest(`/customers?page=${page}&size=${size}`);
  },

  getById: async (id) => {
    return apiRequest(`/customers/${id}`);
  },

  create: async (customerData) => {
    return apiRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData)
    });
  },

  update: async (id, customerData) => {
    return apiRequest(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData)
    });
  },

  delete: async (id) => {
    return apiRequest(`/customers/${id}`, {
      method: 'DELETE'
    });
  }
};

// Suppliers API
export const suppliersAPI = {
  getAll: async (page = 0, size = 100) => {
    return apiRequest(`/suppliers?page=${page}&size=${size}`);
  },

  getById: async (id) => {
    return apiRequest(`/suppliers/${id}`);
  },

  create: async (supplierData) => {
    return apiRequest('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierData)
    });
  },

  update: async (id, supplierData) => {
    return apiRequest(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplierData)
    });
  },

  delete: async (id) => {
    return apiRequest(`/suppliers/${id}`, {
      method: 'DELETE'
    });
  }
};

// Medicine Groups API
export const medicineGroupsAPI = {
  getAll: async (page = 0, size = 100) => {
    return apiRequest(`/medicine-groups?page=${page}&size=${size}`);
  },

  getById: async (id) => {
    return apiRequest(`/medicine-groups/${id}`);
  },

  create: async (groupData) => {
    return apiRequest('/medicine-groups', {
      method: 'POST',
      body: JSON.stringify(groupData)
    });
  },

  update: async (id, groupData) => {
    return apiRequest(`/medicine-groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(groupData)
    });
  },

  delete: async (id) => {
    return apiRequest(`/medicine-groups/${id}`, {
      method: 'DELETE'
    });
  }
};

// Reports API
export const reportsAPI = {
  getSalesReport: async (startDate, endDate) => {
    return apiRequest(`/reports/sales?startDate=${startDate}&endDate=${endDate}`);
  },

  getPaymentReport: async (startDate, endDate) => {
    return apiRequest(`/reports/payments?startDate=${startDate}&endDate=${endDate}`);
  },

  getInventoryReport: async () => {
    return apiRequest('/reports/inventory');
  }
};

// Generic API for any endpoint
export const api = {
  get: (endpoint) => apiRequest(endpoint),
  post: (endpoint, data) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  put: (endpoint, data) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (endpoint) => apiRequest(endpoint, {
    method: 'DELETE'
  })
};

// User utilities
export const userUtils = {
  getCurrentUser: () => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  },
  
  getUserRole: () => {
    const user = userUtils.getCurrentUser();
    return user ? user.role : null;
  },
  
  hasRole: (requiredRole) => {
    const userRole = userUtils.getUserRole();
    return userRole === requiredRole;
  },
  
  hasAnyRole: (roles) => {
    const userRole = userUtils.getUserRole();
    return roles.includes(userRole);
  },
  
  isAdmin: () => userUtils.hasRole('ADMIN'),
  isManager: () => userUtils.hasRole('MANAGER'),
  isPharmacist: () => userUtils.hasRole('PHARMACIST'),
  
  canManageEquipment: () => {
    // Allow all users to manage equipment
    return true;
  }
};

export default api;
