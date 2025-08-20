import React, { useState, useEffect } from 'react';
import './EquipmentStock.css';
import { FiSearch, FiPackage, FiPlus, FiX, FiEdit, FiTrash2, FiTool, FiEye, FiSettings } from 'react-icons/fi';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { BsArrowUp, BsArrowDown, BsSun, BsMoon, BsCloud } from 'react-icons/bs';
import { equipmentAPI, userUtils } from '../../services/api';
import { useSweetDialog } from '../SweetDialog/SweetDialog';

const EquipmentStock = ({ onBack }) => {
  // SweetDialog hook
  const {
    showSweetDialog,
    SweetDialogComponent
  } = useSweetDialog();

  // State management
  const [equipmentData, setEquipmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // User info
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  
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

  // Fetch equipment data
  useEffect(() => {
    // Get user info
    const user = userUtils.getCurrentUser();
    const role = userUtils.getUserRole();
    setCurrentUser(user);
    setUserRole(role);
    
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await equipmentAPI.getAll();
      
      if (result.success) {
        setEquipmentData(result.data.equipment || result.data || []);
      } else {
        setError(result.error || 'Failed to fetch equipment data');
      }
    } catch (err) {
      console.error('Error fetching equipment:', err);
      setError('Failed to connect to server. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Row click handler for action popup
  const handleRowClick = (equipment, event) => {
    event.stopPropagation();
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
    }
    
    if (!formData.model.trim()) {
      errors.model = 'Model is required';
    }
    
    if (!formData.noOfEquipments || parseInt(formData.noOfEquipments) <= 0) {
      errors.noOfEquipments = 'Valid quantity is required';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // All users are now allowed to manage equipment
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const equipmentPayload = {
        equipmentName: formData.equipmentName.trim(),
        model: formData.model.trim(),
        noOfEquipments: parseInt(formData.noOfEquipments)
      };

      const result = isEditing 
        ? await equipmentAPI.update(currentEquipment.id, equipmentPayload)
        : await equipmentAPI.create(equipmentPayload);

      if (result.success) {
        await fetchEquipment(); // Refresh the list
        closeModal();
        showSweetDialog({
          type: 'success',
          title: isEditing ? 'Equipment Updated' : 'Equipment Added',
          message: `Equipment ${isEditing ? 'updated' : 'added'} successfully!`
        });
      } else {
        setError(result.error || `Failed to ${isEditing ? 'update' : 'add'} equipment`);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to save equipment. Please try again.');
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
      const result = await equipmentAPI.delete(selectedEquipment.id);

      if (result.success) {
        await fetchEquipment(); // Refresh the list
        showSweetDialog({
          type: 'success',
          title: 'Equipment Deleted',
          message: 'Equipment deleted successfully!'
        });
      } else {
        showSweetDialog({
          type: 'error',
          title: 'Delete Failed',
          message: `Failed to delete equipment: ${result.error}`
        });
      }
    } catch (err) {
      console.error('Error deleting equipment:', err);
      showSweetDialog({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete equipment. Please try again.'
      });
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
            <span className="dropdown-arrow">▼</span>
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

      {/* Main Content */}
      <div className="equipment-stock-content">
        <div className="content-header">
          <div className="page-title">
            <h1>
              <FiTool className="title-icon" />
              Equipment Stock Management
            </h1>
            <p className="page-subtitle">
              Manage your medical equipment inventory
              {currentUser && (
                <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#666' }}>
                  | Logged in as: {currentUser.fullName} ({userRole})
                </span>
              )}
            </p>
          </div>
          <button className="add-equipment-btn" onClick={openAddModal}>
            <FiPlus className="btn-icon" />
            Add New Equipment
          </button>
        </div>

        {/* Search Section */}
        <div className="equipment-search-section">
          <div className="equipment-search-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search equipment by name or model..."
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
                    <span className="error-text">{formErrors.equipmentName}</span>
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
                    <span className="error-text">{formErrors.model}</span>
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
                    <span className="error-text">{formErrors.noOfEquipments}</span>
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
      {SweetDialogComponent}
    </div>
  );
};

export default EquipmentStock;
