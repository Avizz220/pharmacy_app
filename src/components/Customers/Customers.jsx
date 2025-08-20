import React, { useState, useEffect } from 'react';
import './Customers.css';
import '../payment-style-popup.css';
import { FiSearch, FiUsers, FiUserCheck, FiPlus, FiX, FiEdit, FiTrash2 } from 'react-icons/fi';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { BsArrowUp, BsArrowDown, BsSun, BsMoon, BsCloud } from 'react-icons/bs';
import { useSweetDialog } from '../SweetDialog/SweetDialog';

const Customers = ({ onBack }) => {
  // Sweet Dialog Hook
  const { 
    showSuccess, 
    showError, 
    showDeleteSuccess, 
    showUpdateSuccess, 
    showAddSuccess,
    DialogComponent 
  } = useSweetDialog();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Action popup state
  const [showActionPopup, setShowActionPopup] = useState(false);
  const [activeRowId, setActiveRowId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'Male'
  });
  
  // Form validation
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer data state
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/customers');
      const data = await response.json();
      
      if (data.success) {
        setCustomers(data.customers || []);
        setError('');
      } else {
        setError(data.message || 'Failed to fetch customers');
        setCustomers([]);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to connect to server');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Load customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Get current time-based greeting and icon
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { text: "Good Morning", icon: <BsSun /> };
    } else if (hour >= 12 && hour < 17) {
      return { text: "Good Afternoon", icon: <BsCloud /> };
    } else if (hour >= 17 && hour < 21) {
      return { text: "Good Evening", icon: <BsMoon /> };
    } else {
      return { text: "Good Night", icon: <BsMoon /> };
    }
  };

  const greeting = getTimeBasedGreeting();

  // Current date formatting
  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }) + ' - ' + now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleCustomerSearch = (e) => {
    setCustomerSearchQuery(e.target.value);
  };

  const handleAddNewCustomer = () => {
    setIsEditMode(false);
    setSelectedCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      gender: 'Male'
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedCustomer(null);
    // Reset form data and errors when closing modal
    setFormData({
      name: '',
      phone: '',
      email: '',
      gender: 'Male'
    });
    setFormErrors({});
    setIsSubmitting(false);
  };
  
  const handleUpdateCustomer = (customer) => {
    console.log('Update customer clicked:', customer);
    setSelectedCustomer(customer);
    setIsEditMode(true);
    setFormData({
      name: customer.customerName,
      phone: customer.phoneNumber,
      email: customer.email,
      gender: customer.gender
    });
    setFormErrors({});
    setIsModalOpen(true);
  };
  
  const handleDeleteClickOld = (customer) => {
    console.log('Delete click - customer:', customer);
    setSelectedCustomer(customer);
    setIsDeleteModalOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!selectedCustomer) {
      console.log('No customer selected for deletion');
      return;
    }

    console.log('Deleting customer:', selectedCustomer);
    console.log('Delete URL:', `http://localhost:8080/api/customers/${selectedCustomer.id}`);

    try {
      const response = await fetch(`http://localhost:8080/api/customers/${selectedCustomer.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Delete response status:', response.status);
      const result = await response.json();
      console.log('Delete response:', result);
      
      if (result.success) {
        showDeleteSuccess(`Customer ${selectedCustomer.customerName}`);
        
        // Refresh the customer list
        await fetchCustomers();
      } else {
        showError(`Failed to delete customer: ${result.message}`, 'Delete Failed');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      showError('Failed to connect to server', 'Connection Error');
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedCustomer(null);
    }
  };
  
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Required fields validation
    if (!formData.name.trim()) errors.name = "Customer name is required";
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    
    // Phone validation - must match (XXX) XXX-XXXX format
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      errors.phone = "Phone number must be in format (XXX) XXX-XXXX";
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    setFormErrors(validationErrors);
    
    // If no errors, proceed with submission
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      
      console.log('Form submit - isEditMode:', isEditMode);
      console.log('Form submit - selectedCustomer:', selectedCustomer);
      
      try {
        // Prepare data for API (match the backend format)
        const customerData = {
          customerName: formData.name,
          phoneNumber: formData.phone,
          email: formData.email,
          gender: formData.gender
        };

        console.log('Sending customer data:', customerData);

        let response;
        if (isEditMode) {
          console.log('Update URL:', `http://localhost:8080/api/customers/${selectedCustomer.id}`);
          // Update existing customer
          response = await fetch(`http://localhost:8080/api/customers/${selectedCustomer.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(customerData)
          });
        } else {
          // Create new customer
          response = await fetch('http://localhost:8080/api/customers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(customerData)
          });
        }

        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Response result:', result);
        
        if (result.success) {
          if (isEditMode) {
            showUpdateSuccess(`Customer ${formData.name}`);
          } else {
            showAddSuccess(`Customer ${formData.name}`);
          }
          
          // Refresh the customer list
          await fetchCustomers();
          
          // Close modal
          handleCloseModal();
        } else {
          setFormErrors({ general: result.message || 'Operation failed' });
        }
      } catch (error) {
        console.error('Error submitting customer:', error);
        setFormErrors({ general: 'Failed to connect to server' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleRowClick = (customer, e) => {
    e.preventDefault();
    
    setSelectedCustomer(customer);
    setShowActionPopup(true);
    setActiveRowId(customer.id);
  };
  
  // Close the popup
  const closePopup = () => {
    setShowActionPopup(false);
    setSelectedCustomer(null);
    setActiveRowId(null);
  };
  
  // Handle clicks outside the popup to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActionPopup && !event.target.closest('.action-popup') && 
          !event.target.closest('.customer-table tr')) {
        closePopup();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionPopup]);

  // Filter customers based on active tab and search query
  const filteredCustomers = customers.filter(customer => {
    // Filter by gender and search query
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'active' && customer.gender === 'Male') ||
                      (activeTab === 'inactive' && customer.gender === 'Female');
    
    const matchesSearch = customerSearchQuery === '' || 
      customer.customerName?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      customer.gender?.toLowerCase().includes(customerSearchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });
  
  // Sort customers based on selected option
  const sortedCustomers = [...filteredCustomers];
  
  switch(sortOption) {
    case 'newest':
      // Sort by createdAt if available, otherwise by id
      sortedCustomers.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return b.id - a.id; // Fallback to ID sorting
      });
      break;
    case 'oldest':
      sortedCustomers.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }
        return a.id - b.id; // Fallback to ID sorting
      });
      break;
    case 'name-asc':
      sortedCustomers.sort((a, b) => a.customerName.localeCompare(b.customerName));
      break;
    case 'name-desc':
      sortedCustomers.sort((a, b) => b.customerName.localeCompare(a.customerName));
      break;
    case 'recent-transaction':
      sortedCustomers.sort((a, b) => {
        if (!a.lastTransaction && !b.lastTransaction) return 0;
        if (!a.lastTransaction) return 1;
        if (!b.lastTransaction) return -1;
        return new Date(b.lastTransaction) - new Date(a.lastTransaction);
      });
      break;
    case 'oldest-transaction':
      sortedCustomers.sort((a, b) => {
        if (!a.lastTransaction && !b.lastTransaction) return 0;
        if (!a.lastTransaction) return 1;
        if (!b.lastTransaction) return -1;
        return new Date(a.lastTransaction) - new Date(b.lastTransaction);
      });
      break;
    default:
      break;
  }

  return (
    <div className="customers-container">
      {/* Header */}
      <header className="customers-header">
        <div className="header-left">
          <button className="header-back-btn" onClick={onBack}>
            <HiChevronLeft /> Back to Dashboard
          </button>
        </div>
        <div className="header-right">
          <div className="language-selector">
            <span>🌐 English (US)</span>
          
          </div>
          <div className="greeting-container">
            <span className="greeting-icon">{greeting.icon}</span>
            <span className="greeting-text">{greeting.text}</span>
          </div>
          <div className="date-time">
            {getCurrentDate()}
          </div>
        </div>
      </header>

      {/* Customers Content */}
      <div className="customers-content">
        <div className="content-header">
          <div className="breadcrumb-section">
            <div className="page-title">
              <h1>Customer Management 👥</h1>
              <p>Here are your customer statistics and data</p>
            </div>
          </div>
          <button className="add-customer-btn" onClick={handleAddNewCustomer}>
            <FiPlus style={{ marginRight: "0.5rem" }} /> Add New Customer
          </button>
        </div>

        {/* Customer Stats Cards */}
        <div className="customer-stats-cards">
          <div className="stat-card total-customers">
            <div className="stat-icon-container">
              <FiUsers className="stat-icon" />
            </div>
            <div className="stat-content">
              <p className="stat-title">Total Customers</p>
              <h3 className="stat-value">{customers.length}</h3>
              <p className="stat-change increase">
                <BsArrowUp /> Active customers
              </p>
            </div>
          </div>
          
          <div className="stat-card members">
            <div className="stat-icon-container">
              <FiUserCheck className="stat-icon" />
            </div>
            <div className="stat-content">
              <p className="stat-title">Male Customers</p>
              <h3 className="stat-value">{customers.filter(c => c.gender === 'Male').length}</h3>
              <p className="stat-change decrease">
                <BsArrowDown /> Female: {customers.filter(c => c.gender === 'Female').length}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Management */}
        <div className="customer-management">
          <div className="customer-tabs">
            <h2>All Customers</h2>
            <div className="tab-buttons">
              <button 
                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => handleTabChange('all')}
              >
                All
              </button>
              <button 
                className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                onClick={() => handleTabChange('active')}
              >
                Male Customers
              </button>
              <button 
                className={`tab-btn ${activeTab === 'inactive' ? 'active' : ''}`}
                onClick={() => handleTabChange('inactive')}
              >
                Female Customers
              </button>
            </div>
          </div>
          
          <div className="customer-controls">
            <div className="customer-search">
              <span className="search-icon"><FiSearch /></span>
              <input
                type="text"
                placeholder="Search in customer list..."
                className="customer-search-input"
                value={customerSearchQuery}
                onChange={handleCustomerSearch}
              />
            </div>
            
            <div className="sort-control">
              <span>Sort by: </span>
              <select 
                className="sort-select"
                value={sortOption}
                onChange={handleSortChange}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="recent-transaction">Recent Transactions</option>
                <option value="oldest-transaction">Oldest Transactions</option>
              </select>
            </div>
          </div>
          
          {/* Customer Table */}
          <div className="customer-table-container">
            {loading ? (
              <div className="loading-state">
                <p>Loading customers...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>Error: {error}</p>
                <button onClick={fetchCustomers} className="retry-btn">
                  Retry
                </button>
              </div>
            ) : (
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Phone Number</th>
                    <th>Email</th>
                    <th>Gender</th>
                    <th>Last Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCustomers.length > 0 ? (
                    sortedCustomers.map(customer => (
                    <tr 
                      key={customer.id} 
                      onClick={(e) => handleRowClick(customer, e)}
                      className={activeRowId === customer.id ? 'active' : ''}
                    >
                      <td>{customer.customerName}</td>
                      <td>{customer.phoneNumber}</td>
                      <td>{customer.email}</td>
                      <td>
                        <span className={`gender-pill ${customer.gender?.toLowerCase()}`}>
                          {customer.gender}
                        </span>
                      </td>
                      <td>
                        {customer.lastTransaction 
                          ? new Date(customer.lastTransaction).toLocaleDateString('en-GB', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : 'No transactions'
                        }
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                      No customers found matching your criteria
                    </td>
                  </tr>
                )}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="pagination">
            <div className="pagination-info">
              Showing data 1 to {sortedCustomers.length} of 256K entries
            </div>
            <div className="pagination-controls">
              <button className="pagination-btn" disabled>
                <HiChevronLeft />
              </button>
              <button className="pagination-btn active">1</button>
              <button className="pagination-btn">2</button>
              <button className="pagination-btn">3</button>
              <button className="pagination-btn">4</button>
              <span>...</span>
              <button className="pagination-btn">40</button>
              <button className="pagination-btn">
                <HiChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="customer-modal">
            <div className="modal-header">
              <h2>{isEditMode ? 'Edit Customer' : 'Add New Customer'}</h2>
              <button className="close-modal-btn" onClick={handleCloseModal}>
                <FiX />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="customer-form">
              {formErrors.general && (
                <div className="error-banner">
                  {formErrors.general}
                </div>
              )}
              <div className="form-content">
                <div className="form-group">
                  <label htmlFor="name">Customer Name <span className="required-mark">*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={formErrors.name ? 'error' : ''}
                    placeholder="Enter customer name"
                  />
                  {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email Address <span className="required-mark">*</span></label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={formErrors.email ? 'error' : ''}
                      placeholder="Enter email address"
                    />
                    {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number <span className="required-mark">*</span></label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={formErrors.phone ? 'error' : ''}
                      placeholder="Enter phone number"
                    />
                    {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group gender-group">
                    <label htmlFor="gender">Gender <span className="required-mark">*</span></label>
                    <div className="gender-buttons">
                      <label className={`gender-option ${formData.gender === 'Male' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="gender"
                          value="Male"
                          checked={formData.gender === 'Male'}
                          onChange={handleInputChange}
                          hidden
                        />
                        <span className="option-icon">👨</span>
                        <span className="option-text">Male</span>
                      </label>
                      <label className={`gender-option ${formData.gender === 'Female' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="gender"
                          value="Female"
                          checked={formData.gender === 'Female'}
                          onChange={handleInputChange}
                          hidden
                        />
                        <span className="option-icon">👩</span>
                        <span className="option-text">Female</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting 
                    ? (isEditMode ? 'Updating... ⏳' : 'Adding... ⏳') 
                    : (isEditMode ? 'Update Customer' : 'Add Customer')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <h2>Confirm Deletion</h2>
              <button className="close-modal-btn" onClick={handleCancelDelete}>
                <FiX />
              </button>
            </div>
            <div className="delete-modal-content">
              <div className="delete-icon">
                <FiTrash2 />
              </div>
              <p>Are you sure you want to delete the customer <strong>{selectedCustomer?.customerName}</strong>?</p>
              <p className="delete-warning">This action cannot be undone.</p>
            </div>
            <div className="delete-modal-actions">
              <button className="cancel-btn" onClick={handleCancelDelete}>
                Cancel
              </button>
              <button className="delete-confirm-btn" onClick={handleConfirmDelete}>
                Delete Customer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Action Popup */}
      {showActionPopup && selectedCustomer && (
        <div className="action-popup-overlay" onClick={closePopup}>
          <div className="action-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-content">
              <div className="popup-actions">
                <button className="btn-update" onClick={() => {
                  const customerToUpdate = selectedCustomer;
                  closePopup();
                  handleUpdateCustomer(customerToUpdate);
                }}>
                  <FiEdit /> Update
                </button>
                <button className="btn-delete" onClick={() => {
                  const customerToDelete = selectedCustomer;
                  closePopup();
                  handleDeleteClickOld(customerToDelete);
                }}>
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sweet Dialog Component */}
      <DialogComponent />
    </div>
  );
};

export default Customers;
