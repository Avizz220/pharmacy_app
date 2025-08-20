import React, { useState, useEffect } from 'react';
import './MedicineGroups.css';
import { FiSearch, FiPackage, FiPlus, FiX, FiEdit, FiTrash2, FiCalendar, FiMoreVertical } from 'react-icons/fi';
import { useSweetDialog } from '../SweetDialog/SweetDialog';

const MedicineGroups = ({ onBack }) => {
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

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [medicineSearchQuery, setMedicineSearchQuery] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Action popup state
  const [showActionPopup, setShowActionPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [activeRowId, setActiveRowId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    medicineName: '',
    medicineType: '',
    noOfMedicines: '',
    status: 'Available',
    expiredDate: '',
    price: '',
    batchNumber: '',
    manufacturer: '',
    description: ''
  });
  
  // Form validation
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Medicine data state
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch medicines from backend
  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setMedicines([]);
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8080/api/medicines?size=100', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMedicines(data.medicines || []);
      } else {
        showError(data.message || 'Failed to fetch medicines', 'Loading Error');
        setError(data.message || 'Failed to fetch medicines');
        setMedicines([]);
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
      showError('Error connecting to server. Please make sure the backend is running.', 'Connection Error');
      setError('Error connecting to server. Please make sure the backend is running.');
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.medicineName.trim()) {
      errors.medicineName = 'Medicine name is required';
    }
    
    if (!formData.medicineType.trim()) {
      errors.medicineType = 'Medicine type is required';
    }
    
    if (!formData.noOfMedicines || formData.noOfMedicines <= 0) {
      errors.noOfMedicines = 'Quantity must be greater than 0';
    }
    
    if (!formData.expiredDate) {
      errors.expiredDate = 'Expiry date is required';
    } else {
      const today = new Date().toISOString().split('T')[0];
      if (formData.expiredDate <= today) {
        errors.expiredDate = 'Expiry date must be in the future';
      }
    }
    
    if (!formData.price || formData.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    
    if (!formData.batchNumber.trim()) {
      errors.batchNumber = 'Batch number is required';
    }
    
    if (!formData.manufacturer.trim()) {
      errors.manufacturer = 'Manufacturer is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Modal handlers
  const openModal = (medicine = null) => {
    if (medicine) {
      setIsEditMode(true);
      setSelectedMedicine(medicine);
      setFormData({
        medicineName: medicine.medicineName || '',
        medicineType: medicine.medicineType || '',
        noOfMedicines: medicine.noOfMedicines || '',
        status: medicine.status || 'Available',
        expiredDate: medicine.expiredDate || '',
        price: medicine.price || '',
        batchNumber: medicine.batchNumber || '',
        manufacturer: medicine.manufacturer || '',
        description: medicine.description || ''
      });
    } else {
      setIsEditMode(false);
      setSelectedMedicine(null);
      setFormData({
        medicineName: '',
        medicineType: '',
        noOfMedicines: '',
        status: 'Available',
        expiredDate: '',
        price: '',
        batchNumber: '',
        manufacturer: '',
        description: ''
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
    setShowActionPopup(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedMedicine(null);
    setFormData({
      medicineName: '',
      medicineType: '',
      noOfMedicines: '',
      status: 'Available',
      expiredDate: '',
      price: '',
      batchNumber: '',
      manufacturer: '',
      description: ''
    });
    setFormErrors({});
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setIsSubmitting(false);
        return;
      }

      const medicineData = {
        medicineName: formData.medicineName.trim(),
        medicineType: formData.medicineType.trim(),
        noOfMedicines: parseInt(formData.noOfMedicines),
        status: formData.status,
        expiredDate: formData.expiredDate,
        price: parseFloat(formData.price),
        batchNumber: formData.batchNumber.trim(),
        manufacturer: formData.manufacturer.trim(),
        description: formData.description.trim() || null
      };

      const url = isEditMode 
        ? `http://localhost:8080/api/medicines/${selectedMedicine.id}`
        : 'http://localhost:8080/api/medicines';
      
      const method = isEditMode ? 'PUT' : 'POST';

      console.log(`${isEditMode ? 'Updating' : 'Creating'} medicine:`, medicineData);

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(medicineData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log(`Medicine ${isEditMode ? 'updated' : 'created'} successfully:`, data);
        if (isEditMode) {
          showUpdateSuccess(`Medicine ${medicineData.medicineName}`);
        } else {
          showAddSuccess(`Medicine ${medicineData.medicineName}`);
        }
        await fetchMedicines(); // Refresh the list
        closeModal();
        setError('');
      } else {
        console.error(`Failed to ${isEditMode ? 'update' : 'create'} medicine:`, data);
        showError(data.message || `Failed to ${isEditMode ? 'update' : 'create'} medicine`, `${isEditMode ? 'Update' : 'Creation'} Failed`);
        setError(data.message || `Failed to ${isEditMode ? 'update' : 'create'} medicine`);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} medicine:`, error);
      setError(`Error ${isEditMode ? 'updating' : 'creating'} medicine. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action popup handlers
  const handleActionClick = (e, medicine) => {
    e.stopPropagation();
    console.log('Action clicked for medicine:', medicine);
    
    setSelectedMedicine(medicine);
    setActiveRowId(medicine.id);
    setShowActionPopup(true);
  };

  // Row click handler for popup actions
  const handleRowClick = (medicine) => {
    console.log('Row clicked for medicine:', medicine);
    
    // Center the popup on screen
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    setPopupPosition({
      x: screenWidth / 2 - 100, // Approximate popup width/2
      y: screenHeight / 2 - 50  // Approximate popup height/2
    });
    
    setSelectedMedicine(medicine);
    setActiveRowId(medicine.id);
    setShowActionPopup(true);
  };

  const closeActionPopup = () => {
    setShowActionPopup(false);
    setActiveRowId(null);
    setSelectedMedicine(null);
  };

  // Update handler
  const handleUpdateMedicine = () => {
    console.log('Update clicked for medicine:', selectedMedicine);
    const medicineToUpdate = selectedMedicine;
    closeActionPopup();
    openModal(medicineToUpdate);
  };

  // Delete handlers
  const handleDeleteClick = () => {
    console.log('Delete clicked for medicine:', selectedMedicine);
    const medicineToDelete = selectedMedicine;
    closeActionPopup();
    setSelectedMedicine(medicineToDelete);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMedicine) {
      console.error('No medicine selected for deletion');
      return;
    }

    const medicineToDelete = selectedMedicine;
    console.log('Confirming deletion for medicine:', medicineToDelete);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }

      const response = await fetch(`http://localhost:8080/api/medicines/${medicineToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Medicine deleted successfully:', data);
        showDeleteSuccess(`Medicine ${medicineToDelete.medicineName}`);
        await fetchMedicines();
        setError('');
      } else {
        console.error('Failed to delete medicine:', data);
        showError(data.message || 'Failed to delete medicine', 'Delete Failed');
        setError(data.message || 'Failed to delete medicine');
      }
    } catch (error) {
      console.error('Error deleting medicine:', error);
      showError('Error deleting medicine. Please try again.', 'Connection Error');
      setError('Error deleting medicine. Please try again.');
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedMedicine(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setSelectedMedicine(null);
  };

  // Input change handler
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

  // Search handler
  const handleMedicineSearch = (e) => {
    setMedicineSearchQuery(e.target.value);
  };

  // Filter medicines based on search and tab
  const getFilteredMedicines = () => {
    let filtered = medicines;

    // Apply search filter
    if (medicineSearchQuery.trim()) {
      filtered = filtered.filter(medicine =>
        medicine.medicineName.toLowerCase().includes(medicineSearchQuery.toLowerCase()) ||
        medicine.medicineType.toLowerCase().includes(medicineSearchQuery.toLowerCase()) ||
        medicine.manufacturer.toLowerCase().includes(medicineSearchQuery.toLowerCase()) ||
        medicine.batchNumber.toLowerCase().includes(medicineSearchQuery.toLowerCase())
      );
    }

    // Apply tab filter
    if (activeTab === 'available') {
      filtered = filtered.filter(medicine => medicine.status === 'Available');
    } else if (activeTab === 'expired') {
      filtered = filtered.filter(medicine => new Date(medicine.expiredDate) < new Date());
    } else if (activeTab === 'lowstock') {
      filtered = filtered.filter(medicine => medicine.noOfMedicines < 10);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.id) - new Date(a.id);
        case 'oldest':
          return new Date(a.id) - new Date(b.id);
        case 'name':
          return a.medicineName.localeCompare(b.medicineName);
        case 'quantity':
          return b.noOfMedicines - a.noOfMedicines;
        default:
          return 0;
      }
    });

    return filtered;
  };

  // Utility functions
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon";
    } else if (hour >= 17 && hour < 21) {
      return "Good Evening";
    } else {
      return "Good Night";
    }
  };

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

  const handleViewFullDetail = (groupName) => {
    console.log(`View full detail for ${groupName}`);
  };

  return (
    <div className="medicine-groups-container">
      {/* Header */}
      <header className="medicine-groups-header">
        <div className="header-left">
          <button className="back-to-dashboard-btn" onClick={onBack}>
            ← Back to Dashboard
          </button>
        </div>
        <div className="header-right">
          <div className="language-selector">
            <span>🌐 English (US)</span>
           
          </div>
          <div className="greeting-container">
            <span className="greeting-icon">☀️</span>
            <span className="greeting-text">{getTimeBasedGreeting()}</span>
          </div>
          <div className="date-time">
            {getCurrentDate()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="medicine-groups-content">
        {/* Header Section */}
        <div className="content-header">
          <div className="page-title-section">
            <div className="page-title">
              <h1>Inventory › Medicine Groups</h1>
              <p>Manage medicines in your pharmacy inventory</p>
            </div>
          </div>
          <button className="add-group-btn" onClick={() => openModal()}>
            <FiPlus className="btn-icon" />
            Add New Medicine
          </button>
        </div>

        {/* Search and Filters */}
        <div className="search-filter-section">
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="      Search medicines..."
              value={medicineSearchQuery}
              onChange={handleMedicineSearch}
              className="search-input"
            />
          </div>
          
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Medicines
            </button>
            <button 
              className={`filter-tab ${activeTab === 'available' ? 'active' : ''}`}
              onClick={() => setActiveTab('available')}
            >
              Available
            </button>
            <button 
              className={`filter-tab ${activeTab === 'expired' ? 'active' : ''}`}
              onClick={() => setActiveTab('expired')}
            >
              Expired
            </button>
            <button 
              className={`filter-tab ${activeTab === 'lowstock' ? 'active' : ''}`}
              onClick={() => setActiveTab('lowstock')}
            >
              Low Stock
            </button>
          </div>

          <div className="sort-container">
            <select 
              value={sortOption} 
              onChange={(e) => setSortOption(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="quantity">High Quantity</option>
            </select>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')} className="close-error">×</button>
          </div>
        )}

        {/* Medicine Table */}
        <div className="medicine-table-container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading medicines...</p>
            </div>
          ) : (
            <table className="medicine-table">
              <thead>
                <tr>
                  <th>Medicine Name</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Batch No.</th>
                  <th>Manufacturer</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredMedicines().length > 0 ? (
                  getFilteredMedicines().map((medicine) => (
                    <tr 
                      key={medicine.id} 
                      className="medicine-row"
                      onClick={() => handleRowClick(medicine)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="medicine-name">
                        <FiPackage className="medicine-icon" />
                        <div>
                          <span className="name">{medicine.medicineName}</span>
                          {medicine.description && (
                            <span className="description">{medicine.description}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="medicine-type">{medicine.medicineType}</span>
                      </td>
                      <td>
                        <span className={`quantity ${medicine.noOfMedicines < 10 ? 'low-stock' : ''}`}>
                          {medicine.noOfMedicines}
                        </span>
                      </td>
                      <td>
                        <span className="price">₹{medicine.price}</span>
                      </td>
                      <td>
                        <span className="batch-number">{medicine.batchNumber}</span>
                      </td>
                      <td>
                        <span className="manufacturer">{medicine.manufacturer}</span>
                      </td>
                      <td>
                        <span className={`expiry-date ${new Date(medicine.expiredDate) < new Date() ? 'expired' : ''}`}>
                          <FiCalendar className="date-icon" />
                          {new Date(medicine.expiredDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${medicine.status?.toLowerCase()}`}>
                          {medicine.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-cell">
                          <button
                            className="action-btn"
                            onClick={(e) => handleActionClick(e, medicine)}
                            title="More actions"
                          >
                            <FiMoreVertical />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="no-data">
                      <FiPackage className="no-data-icon" />
                      <p>No medicines found</p>
                      <button onClick={() => openModal()} className="add-first-btn">
                        Add Your First Medicine
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Action Popup */}
      {showActionPopup && (
        <div className="action-popup-overlay" onClick={closeActionPopup}>
          <div className="action-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-content">
              <div className="popup-actions">
                <button 
                  className="btn-update"
                  onClick={handleUpdateMedicine}
                >
                  <FiEdit /> Update
                </button>
                <button 
                  className="btn-delete"
                  onClick={handleDeleteClick}
                >
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Medicine Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="medicine-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {isEditMode ? <FiEdit /> : <FiPlus />}
                {isEditMode ? 'Update Medicine' : 'Add New Medicine'}
              </h2>
              <button className="close-btn" onClick={closeModal}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="medicine-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Medicine Name *</label>
                  <input
                    type="text"
                    name="medicineName"
                    placeholder="Enter medicine name"
                    value={formData.medicineName}
                    onChange={handleInputChange}
                    className={formErrors.medicineName ? 'error' : ''}
                  />
                  {formErrors.medicineName && (
                    <span className="error-text">{formErrors.medicineName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Medicine Type *</label>
                  <select
                    name="medicineType"
                    value={formData.medicineType}
                    onChange={handleInputChange}
                    className={formErrors.medicineType ? 'error' : ''}
                  >
                    <option value="">Select medicine type</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Cream">Cream</option>
                    <option value="Drops">Drops</option>
                    <option value="Inhaler">Inhaler</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.medicineType && (
                    <span className="error-text">{formErrors.medicineType}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    name="noOfMedicines"
                    placeholder="Enter quantity"
                    value={formData.noOfMedicines}
                    onChange={handleInputChange}
                    min="1"
                    className={formErrors.noOfMedicines ? 'error' : ''}
                  />
                  {formErrors.noOfMedicines && (
                    <span className="error-text">{formErrors.noOfMedicines}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="Enter price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={formErrors.price ? 'error' : ''}
                  />
                  {formErrors.price && (
                    <span className="error-text">{formErrors.price}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Batch Number *</label>
                  <input
                    type="text"
                    name="batchNumber"
                    placeholder="Enter batch number"
                    value={formData.batchNumber}
                    onChange={handleInputChange}
                    className={formErrors.batchNumber ? 'error' : ''}
                  />
                  {formErrors.batchNumber && (
                    <span className="error-text">{formErrors.batchNumber}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Manufacturer *</label>
                  <input
                    type="text"
                    name="manufacturer"
                    placeholder="Enter manufacturer name"
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                    className={formErrors.manufacturer ? 'error' : ''}
                  />
                  {formErrors.manufacturer && (
                    <span className="error-text">{formErrors.manufacturer}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Expiry Date *</label>
                  <input
                    type="date"
                    name="expiredDate"
                    value={formData.expiredDate}
                    onChange={handleInputChange}
                    className={formErrors.expiredDate ? 'error' : ''}
                  />
                  {formErrors.expiredDate && (
                    <span className="error-text">{formErrors.expiredDate}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Available">Available</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Description (Optional)</label>
                  <textarea
                    name="description"
                    placeholder="Enter medicine description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Medicine' : 'Add Medicine')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedMedicine && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-header">
              <FiTrash2 className="delete-icon" />
              <h3>Delete Medicine</h3>
            </div>
            <div className="delete-content">
              <p>Are you sure you want to delete this medicine?</p>
              <div className="medicine-info">
                <strong>{selectedMedicine.medicineName}</strong>
                <span>{selectedMedicine.medicineType}</span>
              </div>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="delete-actions">
              <button className="cancel-btn" onClick={handleCancelDelete}>
                Cancel
              </button>
              <button className="delete-btn" onClick={handleConfirmDelete}>
                Delete Medicine
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

export default MedicineGroups;
