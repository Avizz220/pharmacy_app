import React, { useState, useEffect } from 'react';
import './Suppliers.css';
import '../payment-style-popup.css';
import { FiSearch, FiUsers, FiUserCheck, FiPlus, FiX, FiEdit, FiTrash2, FiPackage } from 'react-icons/fi';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { BsArrowUp, BsArrowDown, BsSun, BsMoon, BsCloud } from 'react-icons/bs';
import { useSweetDialog } from '../SweetDialog/SweetDialog';

const Suppliers = ({ onBack }) => {
  // SweetDialog hook
  const {
    showDialog,
    DialogComponent
  } = useSweetDialog();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
  
  // Suppliers data state
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Action popup state
  const [showActionPopup, setShowActionPopup] = useState(false);
  const [activeRowId, setActiveRowId] = useState(null);
  const [isEditingInPopup, setIsEditingInPopup] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    supplyType: 'Medicine'
  });
  
  // Form validation
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current time-based greeting and icon
  const getTimeBasedGreeting = () => {
    try {
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
    } catch (error) {
      console.error('Error getting greeting:', error);
      return { text: "Hello", icon: <BsSun /> };
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
  
  const handleSupplierSearch = (e) => {
    setSupplierSearchQuery(e.target.value);
  };

  const handleAddNewSupplier = () => {
    setIsEditMode(false);
    setSelectedSupplier(null);
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      supplyType: 'Medicine'
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedSupplier(null);
    // Reset form data and errors when closing modal
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      supplyType: 'Medicine'
    });
    setFormErrors({});
    setIsSubmitting(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedSupplier(null);
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      supplyType: 'Medicine',
      address: '',
      contactPerson: '',
      website: '',
      notes: ''
    });
    setFormErrors({});
  };
  
  const handleUpdateSupplier = (supplier) => {
    console.log('Update supplier clicked:', supplier);
    setSelectedSupplier(supplier);
    setIsEditMode(true);
    setFormData({
      name: supplier.name,
      company: supplier.company,
      email: supplier.email,
      phone: supplier.phone,
      supplyType: supplier.supplyType
    });
    setFormErrors({});
    setIsModalOpen(true);
  };
  
  const handleDeleteClickOld = (supplier) => {
    console.log('Delete click - supplier:', supplier);
    setSelectedSupplier(supplier);
    setIsDeleteModalOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!selectedSupplier) {
      console.log('No supplier selected for deletion');
      return;
    }

    console.log('Deleting supplier:', selectedSupplier);
    console.log('Delete URL:', `http://localhost:8080/api/suppliers/${selectedSupplier.id}`);

    try {
      const response = await fetch(`http://localhost:8080/api/suppliers/${selectedSupplier.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Delete response status:', response.status);
      const result = await response.json();
      console.log('Delete response:', result);
      
      if (result.success) {
        showSweetDialog({
          type: 'success',
          title: 'Supplier Deleted',
          message: `Supplier ${selectedSupplier.name} deleted successfully!`
        });
        
        // Refresh the supplier list
        await fetchSuppliers();
      } else {
        showSweetDialog({
          type: 'error',
          title: 'Delete Failed',
          message: `Failed to delete supplier: ${result.message}`
        });
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      showSweetDialog({
        type: 'error',
        title: 'Connection Error',
        message: 'Failed to connect to server'
      });
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedSupplier(null);
    }
  };
  
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setSelectedSupplier(null);
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
    if (!formData.name.trim()) errors.name = "Supplier name is required";
    if (!formData.company.trim()) errors.company = "Company name is required";
    
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
      console.log('Form submit - selectedSupplier:', selectedSupplier);
      
      try {
        // Prepare data for API (match the backend format)
        const supplierData = {
          supplierName: formData.name,
          company: formData.company,
          email: formData.email,
          phoneNumber: formData.phone,
          supplyType: formData.supplyType
        };

        console.log('Sending supplier data:', supplierData);

        let response;
        if (isEditMode) {
          console.log('Update URL:', `http://localhost:8080/api/suppliers/${selectedSupplier.id}`);
          // Update existing supplier
          response = await fetch(`http://localhost:8080/api/suppliers/${selectedSupplier.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
            },
            body: JSON.stringify(supplierData)
          });
        } else {
          // Create new supplier
          response = await fetch('http://localhost:8080/api/suppliers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
            },
            body: JSON.stringify(supplierData)
          });
        }

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Response result:', result);
        
        if (result.success) {
          if (isEditMode) {
            showDialog({
              type: 'success',
              title: 'Supplier Updated',
              message: `Supplier ${formData.name} updated successfully!`
            });
          } else {
            showDialog({
              type: 'success',
              title: 'Supplier Added',
              message: `Supplier ${formData.name} added successfully!`
            });
          }
          
          // Refresh the supplier list
          await fetchSuppliers();
          
          // Close modal
          handleCloseModal();
        } else {
          console.error('API response error:', result);
          showDialog({
            type: 'error',
            title: 'Operation Failed',
            message: result.message || 'Operation failed. Please check your input and try again.'
          });
        }
      } catch (error) {
        console.error('Error submitting supplier:', error);
        showDialog({
          type: 'error',
          title: 'Connection Error',
          message: 'Failed to connect to server. Please check if the backend is running and try again.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Fetch suppliers from API
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      
      const response = await fetch('http://localhost:8080/api/suppliers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Transform API data to match UI format
        const transformedSuppliers = (data.suppliers || []).map(supplier => ({
          id: supplier.supplierId || supplier.id,
          name: supplier.supplierName || supplier.name,
          company: supplier.company || 'N/A',
          phone: supplier.phoneNumber || supplier.phone || 'N/A',
          email: supplier.email || 'N/A',
          supplyType: supplier.supplyType || 'Medicine'
        }));
        setSuppliers(transformedSuppliers);
        setError('');
      } else {
        console.error('API returned error:', data);
        setError(data.message || 'Failed to fetch suppliers');
        setSuppliers([]);
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      if (err.message.includes('Failed to fetch') || err.message.includes('ERR_CONNECTION_REFUSED')) {
        setError('Cannot connect to server. Please make sure the backend is running on port 8080.');
      } else {
        setError(`Failed to load suppliers: ${err.message}`);
      }
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  // Load suppliers on component mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Filter suppliers based on active tab and search query
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'medicine' && supplier.supplyType === 'Medicine') ||
                      (activeTab === 'equipment' && supplier.supplyType === 'Equipment');
    
    const matchesSearch = supplierSearchQuery === '' || 
      supplier.name.toLowerCase().includes(supplierSearchQuery.toLowerCase()) ||
      supplier.email.toLowerCase().includes(supplierSearchQuery.toLowerCase()) ||
      supplier.company.toLowerCase().includes(supplierSearchQuery.toLowerCase()) ||
      supplier.supplyType.toLowerCase().includes(supplierSearchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });
  
  // Sort suppliers based on selected option
  const sortedSuppliers = [...filteredSuppliers];
  
  switch(sortOption) {
    case 'newest':
      // Keep original order (assumed to be newest)
      break;
    case 'oldest':
      sortedSuppliers.reverse();
      break;
    case 'name-asc':
      sortedSuppliers.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      sortedSuppliers.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'company-asc':
      sortedSuppliers.sort((a, b) => a.company.localeCompare(b.company));
      break;
    case 'company-desc':
      sortedSuppliers.sort((a, b) => b.company.localeCompare(a.company));
      break;
    default:
      break;
  }

  const handleRowClick = (supplier, e) => {
    e.preventDefault();
    
    setSelectedSupplier(supplier);
    setShowActionPopup(true);
    setActiveRowId(supplier.id);
  };
  
  // Close the popup
  const closePopup = () => {
    setShowActionPopup(false);
    setSelectedSupplier(null);
    setActiveRowId(null);
    setIsEditingInPopup(false);
    setEditFormData({});
  };

  // Inline editing handlers
  const handleEditClick = () => {
    setIsEditingInPopup(true);
    setEditFormData({
      name: selectedSupplier.name || '',
      company: selectedSupplier.company || '',
      email: selectedSupplier.email || '',
      phone: selectedSupplier.phone || '',
      supplyType: selectedSupplier.supplyType || 'Medicine'
    });
  };

  const handleCancelEdit = () => {
    setIsEditingInPopup(false);
    setEditFormData({});
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async () => {
    if (!selectedSupplier || !editFormData.name || !editFormData.company) {
      showSweetDialog({
        type: 'warning',
        title: 'Validation Error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8080/api/suppliers/${selectedSupplier.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...selectedSupplier,
          name: editFormData.name,
          company: editFormData.company,
          email: editFormData.email,
          phone: editFormData.phone,
          supplyType: editFormData.supplyType
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        await fetchSuppliers();
        closePopup();
        setError('');
      } else {
        setError(data.message || 'Failed to update supplier');
      }
    } catch (error) {
      console.error('Error updating supplier:', error);
      setError('Error updating supplier. Please try again.');
    }
  };

  const handleDeleteClick = async () => {
    if (!selectedSupplier) return;
    
    // Use simple confirmation for now
    if (window.confirm(`Are you sure you want to delete supplier ${selectedSupplier.name}? This action cannot be undone.`)) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:8080/api/suppliers/${selectedSupplier.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || ''}`
          }
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          showDialog({
            type: 'success',
            title: 'Supplier Deleted',
            message: `Supplier ${selectedSupplier.name} has been deleted successfully.`
          });
          await fetchSuppliers();
          closePopup();
          setError('');
        } else {
          showDialog({
            type: 'error',
            title: 'Delete Failed',
            message: data.message || 'Failed to delete supplier'
          });
        }
      } catch (error) {
        console.error('Error deleting supplier:', error);
        showDialog({
          type: 'error',
          title: 'Connection Error',
          message: 'Error deleting supplier. Please try again.'
        });
      }
    }
  };
  
  // Handle clicks outside the popup to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActionPopup && !event.target.closest('.action-popup') && 
          !event.target.closest('.supplier-table tr')) {
        closePopup();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionPopup]);

  return (
    <div className="suppliers-container">
      {/* Header */}
      <header className="suppliers-header">
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

      {/* Suppliers Content */}
      <div className="suppliers-content">
        <div className="content-header">
          <div className="breadcrumb-section">
            <div className="page-title">
              <h1>Supplier Management 📦</h1>
              <p>Here are your supplier statistics and data</p>
            </div>
          </div>
          <button className="add-supplier-btn" onClick={handleAddNewSupplier}>
            <FiPlus style={{ marginRight: "0.5rem" }} /> Add New Supplier
          </button>
        </div>

        {/* Supplier Stats Cards */}
        <div className="supplier-stats-cards">
          <div className="stat-card total-suppliers">
            <div className="stat-icon-container">
              <FiUsers className="stat-icon" />
            </div>
            <div className="stat-content">
              <p className="stat-title">Total Suppliers</p>
              <h3 className="stat-value">{suppliers.length}</h3>
              <p className="stat-change increase">
                <BsArrowUp /> All suppliers
              </p>
            </div>
          </div>
          
          <div className="stat-card medicine-supplies">
            <div className="stat-icon-container">
              <FiPackage className="stat-icon" />
            </div>
            <div className="stat-content">
              <p className="stat-title">Medicine Suppliers</p>
              <h3 className="stat-value">{suppliers.filter(s => s.supplyType === 'Medicine').length}</h3>
              <p className="stat-change decrease">
                <BsArrowDown /> Equipment: {suppliers.filter(s => s.supplyType === 'Equipment').length}
              </p>
            </div>
          </div>
        </div>

        {/* Supplier Management */}
        <div className="supplier-management">
          <div className="supplier-tabs">
            <h2>All Suppliers</h2>
            <div className="tab-buttons">
              <button 
                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => handleTabChange('all')}
              >
                All
              </button>
              <button 
                className={`tab-btn ${activeTab === 'medicine' ? 'active' : ''}`}
                onClick={() => handleTabChange('medicine')}
              >
                Medicine Suppliers
              </button>
              <button 
                className={`tab-btn ${activeTab === 'equipment' ? 'active' : ''}`}
                onClick={() => handleTabChange('equipment')}
              >
                Equipment Suppliers
              </button>
            </div>
          </div>
          
          <div className="supplier-controls">
            <div className="supplier-search">
              <span className="search-icon"><FiSearch /></span>
              <input
                type="text"
                placeholder="Search in suppliers list..."
                className="supplier-search-input"
                value={supplierSearchQuery}
                onChange={handleSupplierSearch}
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
                <option value="company-asc">Company (A-Z)</option>
                <option value="company-desc">Company (Z-A)</option>
              </select>
            </div>
          </div>
          
          {/* Supplier Table */}
          <div className="supplier-table-container">
            <table className="supplier-table">
              <thead>
                <tr>
                  <th>Supplier Name</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Supply Type</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                      Loading suppliers...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
                      Error: {error}
                      <br />
                      <button 
                        onClick={fetchSuppliers} 
                        style={{ marginTop: '10px', padding: '5px 10px', cursor: 'pointer' }}
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                ) : sortedSuppliers.length > 0 ? (
                  sortedSuppliers.map(supplier => (
                    <tr 
                      key={supplier.id} 
                      onClick={(e) => handleRowClick(supplier, e)}
                      className={activeRowId === supplier.id ? 'active' : ''}
                    >
                      <td>{supplier.name}</td>
                      <td>{supplier.company}</td>
                      <td>{supplier.email}</td>
                      <td>{supplier.phone}</td>
                      <td>
                        <span className={`supply-type-pill ${supplier.supplyType.toLowerCase()}`}>
                          {supplier.supplyType}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                      No suppliers found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="pagination">
            <div className="pagination-info">
              Showing data 1 to {sortedSuppliers.length} of 143 entries
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
              <button className="pagination-btn">18</button>
              <button className="pagination-btn">
                <HiChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Supplier Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="supplier-modal">
            <div className="modal-header">
              <h2>{isEditMode ? 'Edit Supplier' : 'Add New Supplier'}</h2>
              <button className="close-modal-btn" onClick={handleCloseModal}>
                <FiX />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="supplier-form">
              {formErrors.general && (
                <div className="error-banner">
                  {formErrors.general}
                </div>
              )}
              <div className="form-content">
                <div className="form-group">
                  <label htmlFor="name">Supplier Name <span className="required-mark">*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={formErrors.name ? 'error' : ''}
                    placeholder="Enter supplier name"
                  />
                  {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="company">Company <span className="required-mark">*</span></label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className={formErrors.company ? 'error' : ''}
                    placeholder="Enter company name"
                  />
                  {formErrors.company && <span className="error-message">{formErrors.company}</span>}
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
                
                <div className="form-group supply-type-group">
                  <label htmlFor="supplyType">Supply Type <span className="required-mark">*</span></label>
                  <div className="supply-type-buttons">
                    <label className={`supply-type-option ${formData.supplyType === 'Medicine' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="supplyType"
                        value="Medicine"
                        checked={formData.supplyType === 'Medicine'}
                        onChange={handleInputChange}
                        hidden
                      />
                      <span className="option-icon">💊</span>
                      <span className="option-text">Medicine</span>
                    </label>
                    <label className={`supply-type-option ${formData.supplyType === 'Equipment' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="supplyType"
                        value="Equipment"
                        checked={formData.supplyType === 'Equipment'}
                        onChange={handleInputChange}
                        hidden
                      />
                      <span className="option-icon">🔧</span>
                      <span className="option-text">Equipment</span>
                    </label>
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
                    : (isEditMode ? 'Update Supplier' : 'Add Supplier')
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
              <p>Are you sure you want to delete the supplier <strong>{selectedSupplier?.name}</strong>?</p>
              <p className="delete-warning">This action cannot be undone.</p>
            </div>
            <div className="delete-modal-actions">
              <button className="cancel-btn" onClick={handleCancelDelete}>
                Cancel
              </button>
              <button className="delete-confirm-btn" onClick={handleConfirmDelete}>
                Delete Supplier
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Action Popup */}
      {showActionPopup && selectedSupplier && (
        <div className="action-popup-overlay" onClick={closePopup}>
          <div className="action-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-content">
              <div className="popup-actions">
                <button className="btn-update" onClick={() => {
                  const supplierToUpdate = selectedSupplier;
                  closePopup();
                  handleUpdateSupplier(supplierToUpdate);
                }}>
                  <FiEdit /> Update
                </button>
                <button className="btn-delete" onClick={() => {
                  const supplierToDelete = selectedSupplier;
                  closePopup();
                  handleDeleteClick();
                }}>
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {DialogComponent()}
    </div>
  );
};

export default Suppliers;
