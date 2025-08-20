import React, { useState, useEffect } from 'react';
import './SalesReport.css';
import '../payment-style-popup.css';
import { FiSearch, FiPackage, FiPlus, FiX, FiEdit, FiTrash2, FiDollarSign } from 'react-icons/fi';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { BsArrowUp, BsArrowDown, BsSun, BsMoon, BsCloud } from 'react-icons/bs';
import { useSweetDialog } from '../SweetDialog/SweetDialog';

const SalesReport = ({ onBack }) => {
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
  const [saleSearchQuery, setSaleSearchQuery] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Action popup state
  const [showActionPopup, setShowActionPopup] = useState(false);
  const [activeRowId, setActiveRowId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    saleType: 'Medicine',
    date: new Date().toISOString().split('T')[0],
    customer: '',
    amount: '',
    status: 'Completed'
  });
  
  // Form validation
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sales data state
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch sales from API
  const fetchSales = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8080/api/sales', {
        method: 'GET',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSales(data.sales || []);
        setError('');
      } else {
        setError(data.message || 'Failed to fetch sales');
        setSales([]);
      }
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError('Failed to connect to server');
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  // Load sales on component mount
  useEffect(() => {
    fetchSales();
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

  const handleAddNewSale = () => {
    console.log('Add new sale clicked');
    setIsEditMode(false);
    setSelectedSale(null);
    setFormData({
      saleType: 'Medicine',
      date: new Date().toISOString().split('T')[0],
      customer: '',
      amount: '',
      status: 'Completed'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };
  
  const handleUpdateSale = (sale) => {
    console.log('Update sale clicked:', sale);
    setSelectedSale(sale);
    setIsEditMode(true);
    setFormData({
      saleType: sale.saleType,
      date: sale.date,
      customer: sale.customer,
      amount: sale.amount.toString(),
      status: sale.status
    });
    setFormErrors({});
    setIsModalOpen(true);
  };
  
  const handleDeleteClickOld = (sale) => {
    console.log('Delete click - sale:', sale);
    setSelectedSale(sale);
    setIsDeleteModalOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!selectedSale) {
      console.log('No sale selected for deletion');
      return;
    }

    console.log('Deleting sale:', selectedSale);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8080/api/sales/${selectedSale.saleId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      const result = await response.json();
      console.log('Delete response:', result);
      
      if (result.success) {
        showDeleteSuccess(`Sale #${selectedSale.saleId}`);
        await fetchSales();
      } else {
        showError(`Failed to delete sale: ${result.message}`, 'Delete Failed');
      }
    } catch (error) {
      console.error('Error deleting sale:', error);
      showError('Failed to connect to server', 'Connection Error');
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedSale(null);
    }
  };
  
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setSelectedSale(null);
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
    if (!formData.saleType.trim()) errors.saleType = "Sale type is required";
    if (!formData.customer.trim()) errors.customer = "Customer name is required";
    if (!formData.date) errors.date = "Date is required";
    if (!formData.amount || parseFloat(formData.amount) <= 0) errors.amount = "Amount must be greater than 0";
    if (!formData.status.trim()) errors.status = "Status is required";
    
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
      
      try {
        const token = localStorage.getItem('authToken');
        
        const saleData = {
          saleType: formData.saleType.trim(),
          date: formData.date,
          customer: formData.customer.trim(),
          amount: parseFloat(formData.amount),
          status: formData.status.trim()
        };

        let url = 'http://localhost:8080/api/sales';
        let method = 'POST';
        
        if (isEditMode && selectedSale) {
          url = `http://localhost:8080/api/sales/${selectedSale.saleId}`;
          method = 'PUT';
        }

        console.log(`${isEditMode ? 'Updating' : 'Creating'} sale:`, saleData);

        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify(saleData)
        });

        const data = await response.json();

        if (data.success) {
          if (isEditMode) {
            showUpdateSuccess(`Sale #${selectedSale.saleId}`);
          } else {
            showAddSuccess(`New sale for ${saleData.customer}`);
          }
          
          // Refresh the sales list
          await fetchSales();
          
          // Close modal
          setIsModalOpen(false);
          setIsEditMode(false);
          setSelectedSale(null);
          setFormData({
            saleType: 'Medicine',
            date: new Date().toISOString().split('T')[0],
            customer: '',
            amount: '',
            status: 'Completed'
          });
          setFormErrors({});
        } else {
          setFormErrors({ general: data.message || `Failed to ${isEditMode ? 'update' : 'create'} sale` });
        }
      } catch (error) {
        console.error(`Error ${isEditMode ? 'updating' : 'creating'} sale:`, error);
        setFormErrors({ general: 'Failed to connect to server' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleRowClick = (sale, e) => {
    e.preventDefault();
    
    setSelectedSale(sale);
    setShowActionPopup(true);
    setActiveRowId(sale.saleId);
  };
  
  // Close the popup
  const closePopup = () => {
    setShowActionPopup(false);
    setSelectedSale(null);
    setActiveRowId(null);
  };
  
  // Handle clicks outside the popup to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActionPopup && !event.target.closest('.action-popup') && 
          !event.target.closest('.sales-table tr')) {
        closePopup();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionPopup]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSaleSearch = (e) => {
    setSaleSearchQuery(e.target.value);
  };

  // Filter and sort sales
  const getFilteredSales = () => {
    let filtered = sales;

    // Filter by search query
    if (saleSearchQuery) {
      filtered = filtered.filter(sale =>
        sale.customer?.toLowerCase().includes(saleSearchQuery.toLowerCase()) ||
        sale.saleType?.toLowerCase().includes(saleSearchQuery.toLowerCase()) ||
        sale.status?.toLowerCase().includes(saleSearchQuery.toLowerCase()) ||
        sale.amount?.toString().includes(saleSearchQuery)
      );
    }

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(sale => {
        switch (activeTab) {
          case 'completed':
            return sale.status?.toLowerCase() === 'completed';
          case 'pending':
            return sale.status?.toLowerCase() === 'pending';
          case 'cancelled':
            return sale.status?.toLowerCase() === 'cancelled';
          default:
            return true;
        }
      });
    }

    // Sort sales
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.date) - new Date(a.date);
        case 'oldest':
          return new Date(a.date) - new Date(b.date);
        case 'amount-high':
          return parseFloat(b.amount) - parseFloat(a.amount);
        case 'amount-low':
          return parseFloat(a.amount) - parseFloat(b.amount);
        case 'customer':
          return a.customer?.localeCompare(b.customer) || 0;
        default:
          return 0;
      }
    });

    return filtered;
  };

  return (
    <div className="sales-container">
      {/* Header */}
      <header className="sales-header">
        <div className="header-left">
          <button className="header-back-btn" onClick={onBack}>
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

      {/* Sales Content */}
      <div className="sales-content">
        <div className="content-header">
          <div className="breadcrumb-section">
            <div className="page-title">
              <h1>Sales Report Management 📊</h1>
              <p>Here are your sales statistics and data</p>
            </div>
          </div>
          <button className="add-sale-btn" onClick={handleAddNewSale}>
            <FiPlus style={{ marginRight: "0.5rem" }} /> Add New Sale
          </button>
        </div>

        {/* Search Sales */}
        <div className="sales-search-container">
          <input
            type="text"
            placeholder="Search Sales..."
            value={saleSearchQuery}
            onChange={handleSaleSearch}
            className="sales-search-input"
          />
          <button className="sales-search-btn">🔍</button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')} className="close-error">×</button>
          </div>
        )}

        {/* Sales Table */}
        <div className="sales-table-container">
          {loading ? (
            <div className="loading-state">
              <span>Loading sales...</span>
            </div>
          ) : (
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Sale ID ↕</th>
                  <th>Sale Type ↕</th>
                  <th>Date ↕</th>
                  <th>Customer ↕</th>
                  <th>Amount ↕</th>
                  <th>Status ↕</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredSales().length > 0 ? (
                  getFilteredSales().map((sale) => (
                    <tr 
                      key={sale.saleId} 
                      className={`sale-row ${activeRowId === sale.saleId ? 'active' : ''}`}
                      onClick={(e) => handleRowClick(sale, e)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{sale.saleId}</td>
                      <td>{sale.saleType}</td>
                      <td>{new Date(sale.date).toLocaleDateString()}</td>
                      <td>{sale.customer}</td>
                      <td>${parseFloat(sale.amount).toFixed(2)}</td>
                      <td>
                        <span className={`status ${sale.status?.toLowerCase()}`}>
                          {sale.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-cell">
                          <span className="action-indicator">⋮</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                      No sales found. Click "Add New Sale" to add your first sale.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Action Popup */}
        {showActionPopup && selectedSale && (
          <div className="action-popup-overlay" onClick={closePopup}>
            <div className="action-popup" onClick={(e) => e.stopPropagation()}>
              <div className="popup-content">
                <div className="popup-actions">
                  <button className="btn-update" onClick={() => {
                    const saleToUpdate = selectedSale;
                    closePopup();
                    handleUpdateSale(saleToUpdate);
                  }}>
                    <FiEdit /> Update
                  </button>
                  <button className="btn-delete" onClick={() => {
                    const saleToDelete = selectedSale;
                    closePopup();
                    handleDeleteClickOld(saleToDelete);
                  }}>
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Sale Modal */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
            <div className="add-sale-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  <FiPlus className="header-icon" />
                  {isEditMode ? 'Update Sale' : 'Add New Sale'}
                </h2>
                <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                  <FiX />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="sale-form">
                {formErrors.general && (
                  <div className="error-message">
                    {formErrors.general}
                  </div>
                )}
                
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      <FiPackage className="label-icon" />
                      Sale Type
                    </label>
                    <select
                      name="saleType"
                      value={formData.saleType}
                      onChange={handleInputChange}
                      className={formErrors.saleType ? 'error' : ''}
                      required
                    >
                      <option value="Medicine">Medicine</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Consultation">Consultation</option>
                      <option value="Other">Other</option>
                    </select>
                    {formErrors.saleType && (
                      <span className="error-text">{formErrors.saleType}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      <FiDollarSign className="label-icon" />
                      Customer Name
                    </label>
                    <input
                      type="text"
                      name="customer"
                      placeholder="Enter customer name"
                      value={formData.customer}
                      onChange={handleInputChange}
                      className={formErrors.customer ? 'error' : ''}
                      required
                    />
                    {formErrors.customer && (
                      <span className="error-text">{formErrors.customer}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      <FiDollarSign className="label-icon" />
                      Amount
                    </label>
                    <input
                      type="number"
                      name="amount"
                      placeholder="Enter amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className={formErrors.amount ? 'error' : ''}
                      step="0.01"
                      min="0"
                      required
                    />
                    {formErrors.amount && (
                      <span className="error-text">{formErrors.amount}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className={formErrors.date ? 'error' : ''}
                      required
                    />
                    {formErrors.date && (
                      <span className="error-text">{formErrors.date}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className={formErrors.status ? 'error' : ''}
                      required
                    >
                      <option value="Completed">Completed</option>
                      <option value="Pending">Pending</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    {formErrors.status && (
                      <span className="error-text">{formErrors.status}</span>
                    )}
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    <FiPlus /> {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Sale' : 'Add Sale')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && selectedSale && (
          <div className="modal-overlay" onClick={handleCancelDelete}>
            <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
              <div className="delete-header">
                <FiTrash2 className="delete-icon" />
                <h3>Delete Sale</h3>
              </div>
              <div className="delete-content">
                <p>Are you sure you want to delete this sale?</p>
                <div className="sale-info">
                  <strong>Sale #{selectedSale.saleId}</strong>
                  <span>Customer: {selectedSale.customer}</span>
                  <span>Amount: ${parseFloat(selectedSale.amount).toFixed(2)}</span>
                </div>
                <p className="warning-text">This action cannot be undone.</p>
              </div>
              <div className="delete-actions">
                <button className="cancel-btn" onClick={handleCancelDelete}>
                  Cancel
                </button>
                <button className="delete-confirm-btn" onClick={handleConfirmDelete}>
                  <FiTrash2 /> Delete Sale
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sweet Dialog Component */}
        <DialogComponent />
      </div>
    </div>
  );
};

export default SalesReport;
