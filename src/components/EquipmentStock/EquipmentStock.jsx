import React, { useState, useEffect } from 'react';
import './EquipmentStock.css';
import { FiSearch, FiPackage, FiPlus, FiX, FiEdit, FiTrash2, FiTool, FiEye, FiSettings } from 'react-icons/fi';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { BsArrowUp, BsArrowDown, BsSun, BsMoon, BsCloud } from 'react-icons/bs';
import { useSweetDialog } from '../SweetDialog/SweetDialog';
import { equipmentAPI } from '../../services/api';

const EquipmentStock = ({ onBack }) => {
  // Sweet Dialog Hook
  const { 
    showSuccess, 
    showError, 
    showDeleteSuccess, 
    showUpdateSuccess, 
    showAddSuccess,
    showWarning,
    DialogComponent 
  } = useSweetDialog();

  // State management
  const [equipmentData, setEquipmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState(null);
  
  // Action popup states
  const [showActionPopup, setShowActionPopup] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    equipmentName: '',
    model: '',
    noOfEquipments: ''
  });
  
  // Form validation and submission
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to get user role
  const getUserRole = () => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      console.log('Raw user info from localStorage:', userInfo);
      if (userInfo) {
        const user = JSON.parse(userInfo);
        console.log('Parsed user info:', user);
        console.log('User role:', user.role);
        return user.role || 'USER';
      }
    } catch (error) {
      console.error('Error parsing user info:', error);
    }
    return 'USER';
  };

  // Helper function to check permissions - Now allows all authenticated users
  const canCreateOrUpdate = () => {
    const token = localStorage.getItem('authToken');
    return !!token; // Allow if user is authenticated
  };

  const canDelete = () => {
    const token = localStorage.getItem('authToken');
    return !!token; // Allow if user is authenticated
  };

  // Show permission info message when no actions are available
  const showPermissionInfo = () => {
    // Since all users now have full permissions, no permission info needed
    return null;
  };

  // Fetch equipment data
  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('authToken');
      const userInfo = localStorage.getItem('userInfo');
      console.log('=== DEBUGGING FETCH EQUIPMENT ===');
      console.log('Auth Token exists:', !!token);
      console.log('User Info:', userInfo);
      
      if (!token) {
        setError('Authentication required. Please login again.');
        setLoading(false);
        return;
      }

      console.log('Fetching equipment with token:', token ? 'Token exists' : 'No token');

      const result = await equipmentAPI.getAll(0, 100);
      console.log('Equipment API result:', result);
      
      if (result.success) {
        // Handle different response structures
        const equipmentList = result.data.equipment || result.data.content || result.data || [];
        setEquipmentData(equipmentList);
        setError('');
      } else {
        console.error('Failed to fetch equipment:', result.error);
        setError(result.error || 'Failed to fetch equipment data');
        setEquipmentData([]);
        // If authentication error, redirect to login
        if (result.error && (result.error.includes('Session expired') || result.error.includes('Access denied'))) {
          // Handle session expiry or access denied
          if (result.error.includes('Session expired')) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userInfo');
          }
          // Show user-friendly error message
          showError(result.error, 'Access Error');
        }
      }
    } catch (err) {
      console.error('Error fetching equipment:', err);
      setError('Failed to connect to server. Please ensure backend is running.');
      setEquipmentData([]);
    } finally {
      setLoading(false);
    }
  };

  // Row click handler for action popup
  const handleRowClick = (equipment, event) => {
    event.stopPropagation();
    
    // Allow all users to access the action popup
    setSelectedEquipment(equipment);
    setShowActionPopup(true);
  };

  // Close action popup when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showActionPopup) {
        setShowActionPopup(false);
        setSelectedEquipment(null);
      }
    };

    if (showActionPopup) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showActionPopup]);

  // Modal handlers
  const openAddModal = () => {
    setIsEditing(false);
    setCurrentEquipment(null);
    setFormData({
      equipmentName: '',
      model: '',
      noOfEquipments: ''
    });
    setFormErrors({});
    setShowModal(true);
    setShowActionPopup(false);
  };

  const openEditModal = (equipment) => {
    setIsEditing(true);
    setCurrentEquipment(equipment);
    setFormData({
      equipmentName: equipment.equipmentName,
      model: equipment.model,
      noOfEquipments: equipment.noOfEquipments.toString()
    });
    setFormErrors({});
    setShowModal(true);
    setShowActionPopup(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setCurrentEquipment(null);
    setFormData({
      equipmentName: '',
      model: '',
      noOfEquipments: ''
    });
    setFormErrors({});
    setIsSubmitting(false);
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.equipmentName.trim()) {
      errors.equipmentName = 'Equipment name is required';
    } else if (formData.equipmentName.trim().length < 2) {
      errors.equipmentName = 'Equipment name must be at least 2 characters';
    } else if (formData.equipmentName.trim().length > 100) {
      errors.equipmentName = 'Equipment name must be less than 100 characters';
    }
    
    if (!formData.model.trim()) {
      errors.model = 'Model is required';
    } else if (formData.model.trim().length < 2) {
      errors.model = 'Model must be at least 2 characters';
    } else if (formData.model.trim().length > 100) {
      errors.model = 'Model must be less than 100 characters';
    }
    
    if (!formData.noOfEquipments || parseInt(formData.noOfEquipments) <= 0) {
      errors.noOfEquipments = 'Valid quantity is required (must be positive)';
    }
    
    setFormErrors(errors);
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    setFormErrors({});
    
    try {
      const token = localStorage.getItem('authToken');
      const userInfo = localStorage.getItem('userInfo');
      
      console.log('=== DEBUGGING EQUIPMENT SUBMISSION ===');
      console.log('Auth Token exists:', !!token);
      console.log('Auth Token:', token);
      console.log('User Info:', userInfo);
      console.log('Parsed User Info:', userInfo ? JSON.parse(userInfo) : null);
      
      if (!token) {
        setError('Authentication required. Please login again.');
        showError('Authentication required. Please login again.', 'Authentication Error');
        setIsSubmitting(false);
        return;
      }

      const equipmentPayload = {
        equipmentName: formData.equipmentName.trim(),
        model: formData.model.trim(),
        noOfEquipments: parseInt(formData.noOfEquipments)
      };

      console.log('Submitting equipment data:', equipmentPayload);
      console.log('Is editing?', isEditing);

      let result;
      if (isEditing) {
        console.log('Updating equipment with ID:', currentEquipment.id);
        result = await equipmentAPI.update(currentEquipment.id, equipmentPayload);
      } else {
        console.log('Creating new equipment');
        result = await equipmentAPI.create(equipmentPayload);
      }

      console.log('API result:', result);

      if (result.success) {
        console.log('Operation successful!');
        if (isEditing) {
          showUpdateSuccess(`Equipment ${formData.equipmentName}`);
        } else {
          showAddSuccess(`Equipment ${formData.equipmentName}`);
        }
        await fetchEquipment(); // Refresh the list
        closeModal();
      } else {
        console.error('Operation failed:', result.error);
        // Show specific error message for access denied
        let errorMessage = result.error || `Failed to ${isEditing ? 'update' : 'add'} equipment`;
        let errorTitle = `${isEditing ? 'Update' : 'Add'} Failed`;
        
        if (result.error && result.error.includes('Access denied')) {
          errorMessage = `Permission denied. Please ensure you are logged in with proper credentials.`;
          errorTitle = 'Permission Denied';
        }
        
        showError(errorMessage, errorTitle);
        setError(errorMessage);
        
        // Handle authentication errors
        if (result.error && result.error.includes('Session expired')) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userInfo');
        }
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      const errorMessage = 'Failed to save equipment. Please try again.';
      setError(errorMessage);
      showError(errorMessage, 'Save Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete handlers
  const openDeleteConfirm = (equipment) => {
    setSelectedEquipment(equipment);
    setShowDeleteConfirm(true);
    setShowActionPopup(false);
  };

  const handleDelete = async () => {
    if (!selectedEquipment) return;
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required. Please login again.');
        return;
      }

      console.log('Deleting equipment:', selectedEquipment);
      
      const result = await equipmentAPI.delete(selectedEquipment.id);
      console.log('Delete result:', result);

      if (result.success) {
        showDeleteSuccess(`Equipment ${selectedEquipment.equipmentName}`);
        await fetchEquipment(); // Refresh the list
        setShowDeleteConfirm(false);
        setSelectedEquipment(null);
      } else {
        // Show specific error message for access denied
        let errorMessage = result.error || 'Failed to delete equipment';
        let errorTitle = 'Delete Failed';
        
        if (result.error && result.error.includes('Access denied')) {
          errorMessage = 'Permission denied. Please ensure you are logged in with proper credentials.';
          errorTitle = 'Permission Denied';
        }
        
        showError(errorMessage, errorTitle);
        setError(errorMessage);
        
        // Handle authentication errors
        if (result.error && result.error.includes('Session expired')) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userInfo');
        }
      }
    } catch (err) {
      console.error('Error deleting equipment:', err);
      setError('Failed to delete equipment. Please try again.');
      showError('Failed to delete equipment. Please try again.', 'Delete Failed');
    } finally {
      setShowDeleteConfirm(false);
      setSelectedEquipment(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setSelectedEquipment(null);
  };

  // Filter equipment based on search
  const filteredEquipment = equipmentData.filter(equipment =>
    equipment.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipment.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get current time-based greeting
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

  return (
    <div className="equipment-stock-container">
      {/* Header */}
      <header className="equipment-stock-header">
        <div className="header-left">
          <button className="back-to-dashboard-btn" onClick={onBack}>
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
            <span className="user-role">({getUserRole()})</span>
          </div>
          <div className="date-time">
            {getCurrentDate()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="equipment-stock-content">
        <div className="content-header">
          <div className="page-title">
            <h1>
              <FiTool className="title-icon" />
              Equipment Stock Management
            </h1>
            <p className="page-subtitle">Manage your medical equipment inventory</p>
          </div>
          <button className="add-equipment-btn" onClick={openAddModal}>
            <FiPlus className="btn-icon" />
            Add New Equipment
          </button>
        </div>

        {/* Search Section */}
        <div className="equipment-search-section">
          <div className="equipment-search-container">
           
            
            <input
              type="text"
              className="search-input"
              placeholder="     Search equipment by name or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Equipment Summary */}
        <div className="equipment-summary">
          <div className="summary-item">
            <span className="summary-label">Total Equipment:</span>
            <span className="summary-value">{equipmentData.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Filtered Results:</span>
            <span className="summary-value">{filteredEquipment.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Low Stock Items:</span>
            <span className="summary-value warning">
              {equipmentData.filter(eq => eq.noOfEquipments < 5).length}
            </span>
          </div>
        </div>

        {/* Equipment Table */}
        <div className="equipment-table-container">
          {loading ? (
            <div className="loading-message">Loading equipment data...</div>
          ) : (
            <table className="equipment-table">
              <thead>
                <tr>
                  <th>Equipment Name</th>
                  <th>Model</th>
                  <th>Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEquipment.length > 0 ? (
                  filteredEquipment.map((equipment) => (
                    <tr 
                      key={equipment.id} 
                      className="clickable-row"
                      onClick={(e) => handleRowClick(equipment, e)}
                    >
                      <td>
                        <div className="equipment-info">
                          <div className="equipment-name">{equipment.equipmentName}</div>
                        </div>
                      </td>
                      <td>{equipment.model}</td>
                      <td>{equipment.noOfEquipments}</td>
                      <td>
                        <span className={`stock-status ${equipment.noOfEquipments < 5 ? 'low-stock' : 'in-stock'}`}>
                          {equipment.noOfEquipments < 5 ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                      {searchTerm ? 'No equipment found matching your search.' : 'No equipment available. Click "Add New Equipment" to get started.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Action Popup */}
      {showActionPopup && selectedEquipment && (
        <div className="action-popup" onClick={(e) => e.stopPropagation()}>
          <div className="action-popup-content">
            <h3>What would you like to do?</h3>
            <div className="action-popup-buttons">
              <button 
                className="action-popup-btn edit-action-btn"
                onClick={() => openEditModal(selectedEquipment)}
              >
                <FiEdit /> Edit Equipment
              </button>
              <button 
                className="action-popup-btn delete-action-btn"
                onClick={() => openDeleteConfirm(selectedEquipment)}
              >
                <FiTrash2 /> Delete Equipment
              </button>
              <button 
                className="action-popup-btn cancel-action-btn"
                onClick={() => setShowActionPopup(false)}
              >
                <FiX /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Equipment Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="add-equipment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <FiTool className="header-icon" />
                {isEditing ? 'Update Equipment' : 'Add New Equipment'}
              </h2>
              <button className="close-btn" onClick={closeModal}>
                <FiX />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="equipment-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    <FiPackage className="label-icon" />
                    Equipment Name *
                  </label>
                  <input
                    type="text"
                    name="equipmentName"
                    value={formData.equipmentName}
                    onChange={handleInputChange}
                    placeholder="Enter equipment name"
                    className={formErrors.equipmentName ? 'error' : ''}
                  />
                  {formErrors.equipmentName && (
                    <span className="form-error">{formErrors.equipmentName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    <FiSettings className="label-icon" />
                    Model *
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="Enter model"
                    className={formErrors.model ? 'error' : ''}
                  />
                  {formErrors.model && (
                    <span className="form-error">{formErrors.model}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    <FiPackage className="label-icon" />
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="noOfEquipments"
                    value={formData.noOfEquipments}
                    onChange={handleInputChange}
                    placeholder="Enter quantity"
                    min="1"
                    className={formErrors.noOfEquipments ? 'error' : ''}
                  />
                  {formErrors.noOfEquipments && (
                    <span className="form-error">{formErrors.noOfEquipments}</span>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>
                  <FiX /> Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  <FiPlus /> {isSubmitting ? 'Saving...' : (isEditing ? 'Update Equipment' : 'Add Equipment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedEquipment && (
        <div className="modal-overlay">
          <div className="delete-confirm-modal">
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete "{selectedEquipment.equipmentName}"? 
              This action cannot be undone.
            </p>
            <div className="button-group">
              <button className="cancel-btn" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="delete-btn" onClick={handleDelete}>
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sweet Dialog Component */}
      <DialogComponent />
    </div>
  );
};

export default EquipmentStock;
