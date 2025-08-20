import React, { useState, useEffect } from 'react';
import './PaymentReport.css';
import './blue-card.css';
import './payment-update-modal.css';
import { FiSearch, FiChevronLeft, FiDownload, FiCalendar, FiFilter, FiPieChart, FiEdit, FiTrash2, FiX } from 'react-icons/fi';
import { HiOutlineCreditCard, HiOutlineCash, HiOutlineGlobe, HiOutlinePhone, HiOutlineRefresh, HiOutlineCurrencyDollar } from 'react-icons/hi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSweetDialog } from '../SweetDialog/SweetDialog';

const PaymentReport = ({ onBack }) => {
  console.log('PaymentReport component rendering...');
  
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  
  // Add Payment Form states
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
  const [newPaymentData, setNewPaymentData] = useState({
    type: 'Bank Transfer',
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    amount: '',
    status: 'Done'
  });
  const [formErrors, setFormErrors] = useState({});
  
  // State for payments data
  const [paymentData, setPaymentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // API base URL
  const API_BASE_URL = 'http://localhost:8080/api/payments';

  // Fetch payments from API
  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching payments from:', API_BASE_URL);
      
      const token = localStorage.getItem('authToken');
      console.log('Auth token found:', token ? 'Yes' : 'No');
      
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Raw API response:', data);
        
        // Handle the API response format: { totalItems: 5, success: true, payments: [...] }
        let payments = [];
        if (data && Array.isArray(data.payments)) {
          payments = data.payments;
          console.log('Extracted payments from data.payments:', payments);
        } else if (Array.isArray(data)) {
          payments = data;
          console.log('Data is direct array:', payments);
        } else {
          console.warn('Unexpected data format:', data);
          payments = [];
        }
        
        console.log('Final payments array:', payments);
        console.log('Payment count:', payments.length);
        
        if (payments.length > 0) {
          console.log('First payment structure:', payments[0]);
        }
        
        setPaymentData(payments);
      } else {
        console.error('Failed to fetch payments, status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setError(`Failed to fetch payments (Status: ${response.status})`);
        setPaymentData([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError(`Failed to connect to server: ${error.message}`);
      setPaymentData([]);
    } finally {
      setLoading(false);
    }
  };

  // Add payment to API
  const addPayment = async (paymentData) => {
    try {
      console.log('Adding payment with data:', paymentData);
      
      const token = localStorage.getItem('authToken');
      console.log('Auth token found:', token ? 'Yes' : 'No');
      
      const requestBody = {
        paymentType: paymentData.type,
        date: paymentData.date,
        paymentBy: paymentData.supplier,
        amount: parseFloat(paymentData.amount),
        status: paymentData.status
      };
      
      console.log('Request body:', requestBody);
      
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Add payment response status:', response.status);

      if (response.ok) {
        const newPayment = await response.json();
        console.log('Successfully added payment:', newPayment);
        
        // Refresh the payments list
        console.log('Refreshing payments list...');
        await fetchPayments();
        console.log('Payments refreshed');
        
        return { success: true, data: newPayment };
      } else {
        const errorData = await response.text();
        console.error('Failed to add payment:', errorData);
        return { success: false, error: errorData || 'Failed to add payment' };
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      return { success: false, error: 'Failed to connect to server' };
    }
  };

  // Update payment
  const updatePayment = async (paymentId, paymentData) => {
    try {
      console.log('Updating payment with ID:', paymentId);
      console.log('Update data:', paymentData);
      
      const token = localStorage.getItem('authToken');
      console.log('Auth token found:', token ? 'Yes' : 'No');
      
      const requestBody = {
        paymentType: paymentData.type,
        date: paymentData.date,
        paymentBy: paymentData.supplier,
        amount: parseFloat(paymentData.amount.replace(/[^0-9.-]+/g, '')),
        status: paymentData.status
      };
      
      console.log('Update request body:', requestBody);
      console.log('Update URL:', `${API_BASE_URL}/${paymentId}`);
      
      const response = await fetch(`${API_BASE_URL}/${paymentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('Update response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Update response:', result);
        await fetchPayments();
        return { success: true };
      } else {
        const errorData = await response.json();
        console.error('Update failed:', errorData);
        return { success: false, error: errorData.message || 'Failed to update payment' };
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      return { success: false, error: 'Failed to connect to server' };
    }
  };

  // Delete payment
  const deletePayment = async (paymentId) => {
    try {
      console.log('Deleting payment with ID:', paymentId);
      
      const token = localStorage.getItem('authToken');
      console.log('Auth token found:', token ? 'Yes' : 'No');
      
      const response = await fetch(`${API_BASE_URL}/${paymentId}`, {
        method: 'DELETE',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      console.log('Delete response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Delete response:', result);
        await fetchPayments();
        return { success: true };
      } else {
        const errorData = await response.json();
        console.error('Delete failed:', errorData);
        return { success: false, error: errorData.message || 'Failed to delete payment' };
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      return { success: false, error: 'Failed to connect to server' };
    }
  };

  // Load payments on component mount
  useEffect(() => {
    const loadPayments = async () => {
      try {
        await fetchPayments();
      } catch (error) {
        console.error('Error in useEffect:', error);
        setError('Failed to initialize payment data');
        setLoading(false);
      }
    };
    
    loadPayments();
  }, []);

  // Get current time-based greeting
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

  // Filter payments safely
  const safePaymentDataForFilter = Array.isArray(paymentData) ? paymentData : [];
  const filteredPayments = safePaymentDataForFilter.filter(payment => {
    const matchesSearch = 
      payment.paymentId?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.paymentBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.paymentType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.amount?.toString().toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === 'all' || payment.paymentType?.toLowerCase() === typeFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination - with safety checks
  const safeFilteredPayments = Array.isArray(filteredPayments) ? filteredPayments : [];
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = safeFilteredPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(safeFilteredPayments.length / itemsPerPage));

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Add Payment Form Handlers
  const openAddPaymentForm = () => {
    console.log('Opening Add Payment form');
    setShowAddPaymentForm(true);
  };

  const closeAddPaymentForm = () => {
    setShowAddPaymentForm(false);
    setFormErrors({});
    // Reset form data
    setNewPaymentData({
      type: 'Bank Transfer',
      date: new Date().toISOString().split('T')[0],
      supplier: '',
      amount: '',
      status: 'Done'
    });
  };

  const handleNewPaymentChange = (e) => {
    const { name, value } = e.target;
    setNewPaymentData({
      ...newPaymentData,
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

  const validatePaymentForm = () => {
    const errors = {};
    
    if (!newPaymentData.supplier.trim()) errors.supplier = "Supplier name is required";
    if (!newPaymentData.date) errors.date = "Date is required";
    
    // Validate amount is a number
    if (!newPaymentData.amount) {
      errors.amount = "Amount is required";
    } else if (isNaN(newPaymentData.amount) || parseFloat(newPaymentData.amount) <= 0) {
      errors.amount = "Amount must be a positive number";
    }
    
    return errors;
  };

  const handleAddPaymentSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validatePaymentForm();
    setFormErrors(validationErrors);
    
    // If no errors, add the payment
    if (Object.keys(validationErrors).length === 0) {
      console.log('Adding new payment with data:', newPaymentData);
      
      // Call API to add the payment
      const result = await addPayment(newPaymentData);
      
      if (result.success) {
        showAddSuccess(`Payment to ${newPaymentData.supplier}`);
        // Close the form
        closeAddPaymentForm();
      } else {
        setError(result.error);
        showError(`Failed to add payment: ${result.error}`, 'Payment Addition Failed');
      }
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Calculate payment stats safely
  const safePaymentData = Array.isArray(paymentData) ? paymentData : [];
  const bankTransfers = safePaymentData.filter(p => p.paymentType === 'Bank Transfer').length;
  const cashPayments = safePaymentData.filter(p => p.paymentType === 'Cash').length;
  const cardPayments = safePaymentData.filter(p => p.paymentType === 'Credit Card').length;
  const digitalWallets = safePaymentData.filter(p => p.paymentType === 'Digital Wallet').length;
  const pendingPayments = safePaymentData.filter(p => p.status === 'Pending').length;
  
  // Calculate total payment amount safely
  const totalAmount = safePaymentData.reduce((sum, payment) => {
    const amount = Number(payment.amount || 0);
    return sum + amount;
  }, 0).toLocaleString('en-IN');

  // PDF Export Function
  const exportToPDF = async () => {
    try {
      setIsExporting(true);
      console.log('Starting PDF export...');
      console.log('Payment data:', safePaymentData);
      
      // Validation check
      if (!safePaymentData || safePaymentData.length === 0) {
        showWarning('No payment data available to export. Please ensure you have payment records.', 'Export Warning');
        return;
      }
      
      // Create new PDF document
      const doc = new jsPDF();
      
      // Set document properties
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Add header with pharmacy branding
      doc.setFontSize(24);
      doc.setTextColor(220, 38, 38);
      doc.text(' PHARMACY MANAGEMENT SYSTEM', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text('Payment Report', pageWidth / 2, 30, { align: 'center' });
      
      // Add generation date and filter info
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Generated on: ${currentDate}`, pageWidth / 2, 38, { align: 'center' });
      
      // Add filter information
      let filterText = `Filters Applied: Status: ${statusFilter}, Type: ${typeFilter}`;
      if (searchQuery) {
        filterText += `, Search: "${searchQuery}"`;
      }
      doc.text(filterText, pageWidth / 2, 44, { align: 'center' });
      
      // Prepare filtered table data
      const filteredData = safePaymentData.filter(payment => {
        const matchesSearch = payment.paymentBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            payment.paymentType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            payment.id?.toString().includes(searchQuery);
        const matchesStatus = statusFilter === 'all' || payment.status?.toLowerCase() === statusFilter;
        const matchesType = typeFilter === 'all' || payment.paymentType?.toLowerCase() === typeFilter.toLowerCase();
        return matchesSearch && matchesStatus && matchesType;
      });

      console.log('Filtered data for PDF:', filteredData);

      const tableData = filteredData.map(payment => [
        payment.id || 'N/A',
        payment.paymentType || 'N/A',
        payment.date ? formatDate(payment.date) : 'N/A',
        payment.paymentBy || 'N/A',
        `Rs. ${Number(payment.amount || 0).toLocaleString('en-IN')}`,
        payment.status || 'N/A'
      ]);

      // Add table
      const tableResult = autoTable(doc, {
        head: [['Payment ID', 'Payment Type', 'Date', 'Payment By (Supplier)', 'Amount', 'Status']],
        body: tableData,
        startY: 52,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          halign: 'center',
          valign: 'middle'
        },
        headStyles: {
          fillColor: [220, 38, 38],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: [252, 248, 248]
        },
        columnStyles: {
          0: { halign: 'center' },
          1: { halign: 'left' },
          2: { halign: 'center' },
          3: { halign: 'left' },
          4: { halign: 'right', fontStyle: 'bold' },
          5: { halign: 'center' }
        },
        margin: { left: 10, right: 10 }
      });

      // Calculate summary statistics
      const summaryY = doc.lastAutoTable.finalY + 15;
      
      // Add summary section header
      doc.setFontSize(16);
      doc.setTextColor(220, 38, 38);
      doc.text('Payment Summary & Statistics', 15, summaryY);
      
      // Summary statistics
      const totalAmountNum = safePaymentData.reduce((sum, payment) => {
        const amount = Number(payment.amount || 0);
        return sum + amount;
      }, 0);

      const filteredAmountNum = filteredData.reduce((sum, payment) => {
        const amount = Number(payment.amount || 0);
        return sum + amount;
      }, 0);

      const summaryData = [
        [' Total Transactions', safePaymentData.length.toString()],
        [' Filtered Transactions', filteredData.length.toString()],
        [' Total Amount (All)', `Rs. ${totalAmountNum.toLocaleString('en-IN')}`],
        [' Filtered Amount', `Rs. ${filteredAmountNum.toLocaleString('en-IN')}`],
        [' Bank Transfers', bankTransfers.toString()],
        [' Cash Payments', cashPayments.toString()],
        [' Card Payments', cardPayments.toString()],
        [' Digital Wallets', digitalWallets.toString()],
        [' Pending Payments', pendingPayments.toString()],
        [' Completed Payments', (safePaymentData.length - pendingPayments).toString()],
        [' Success Rate', `${safePaymentData.length > 0 ? Math.round((safePaymentData.length - pendingPayments) / safePaymentData.length * 100) : 0}%`]
      ];

      const summaryResult = autoTable(doc, {
        body: summaryData,
        startY: summaryY + 8,
        styles: {
          fontSize: 11,
          cellPadding: 5,
          halign: 'left'
        },
        columnStyles: {
          0: { 
            fontStyle: 'bold', 
            fillColor: [252, 248, 248], 
            halign: 'left',
            textColor: [220, 38, 38]
          },
          1: { 
            textColor: [40, 40, 40], 
            halign: 'right',
            fontStyle: 'bold'
          }
        },
        margin: { left: 15, right: 15 }
      });

      // Add footer
      const footerY = pageHeight - 15;
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Pharmacy Management System - Confidential Report', pageWidth / 2, footerY, { align: 'center' });
      doc.text(`Page 1 of 1 | Total Records: ${filteredData.length}`, pageWidth / 2, footerY + 5, { align: 'center' });
      
      // Save the PDF
      const fileName = `Payment_Report_${new Date().toISOString().split('T')[0]}_${new Date().getTime()}.pdf`;
      console.log('Saving PDF as:', fileName);
      doc.save(fileName);
      
      // Show success message
      showSuccess(`Payment report exported successfully! 📁 File: ${fileName} 📊 Records: ${filteredData.length} transactions 💰 Total: Rs. ${filteredAmountNum.toLocaleString('en-IN')}`, 'Export Successful! 🎉');
      console.log('PDF export completed successfully');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      showError(`Failed to generate PDF. Please try again. Error: ${error.message}`, 'Export Failed');
    } finally {
      setIsExporting(false);
    }
  };

  // Add new state for handling popup and forms
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    id: '',
    type: '',
    date: '',
    supplier: '',
    amount: '',
    status: ''
  });

  // Handle row click
  const handleRowClick = (payment) => {
    setSelectedPayment(payment);
    setUpdateFormData({
      id: payment.paymentId,
      type: payment.paymentType,
      date: payment.date,
      supplier: payment.paymentBy,
      amount: payment.amount,
      status: payment.status
    });
    setShowUpdateModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    const result = await updatePayment(selectedPayment.paymentId, updateFormData);
    
    if (result.success) {
      showUpdateSuccess(`Payment to ${updateFormData.supplier}`);
      setShowUpdateModal(false);
    } else {
      setError(result.error);
      showError(`Failed to update payment: ${result.error}`, 'Update Failed');
    }
  };

  const handleDelete = async () => {
    const result = await deletePayment(selectedPayment.paymentId);
    
    if (result.success) {
      showDeleteSuccess(`Payment to ${selectedPayment.supplier}`);
      setShowDeleteConfirm(false);
      setShowUpdateModal(false);
    } else {
      setError(result.error);
      showError(`Failed to delete payment: ${result.error}`, 'Delete Failed');
    }
  };

  // Close all modals
  const handleCloseModals = () => {
    setShowUpdateModal(false);
    setShowDeleteConfirm(false);
  };

  console.log('PaymentReport about to render, paymentData:', paymentData);
  console.log('Loading state:', loading, 'Error state:', error);
  console.log('Current search query:', searchQuery);
  console.log('Status filter:', statusFilter, 'Type filter:', typeFilter);
  console.log('Filtered payments:', safeFilteredPayments);
  console.log('Current items for table:', currentItems);

  // Early return for debugging - remove this after testing
  if (false) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Payment Report (Debug Mode)</h1>
        <p>Component is working. Loading: {loading ? 'true' : 'false'}</p>
        <p>Error: {error || 'none'}</p>
        <p>Payment count: {Array.isArray(paymentData) ? paymentData.length : 'not array'}</p>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }

  return (
    <div className="payment-report-container">
      {/* Header */}
      <header className="payment-report-header">
        <div className="header-left">
          <button className="header-back-btn" onClick={onBack}>
            <FiChevronLeft /> Back to Dashboard
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

      {/* Payment Report Content */}
      <div className="payment-report-content">
        <div className="payment-report-title">
          <h1>Payment Report</h1>
          <p>Track and manage all payment transactions with suppliers</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message" style={{ color: 'red', padding: '10px', marginBottom: '20px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Loading Display */}
        {loading && (
          <div className="loading-message" style={{ padding: '20px', textAlign: 'center' }}>
            <p>Loading payments...</p>
          </div>
        )}

        {/* Filter Controls */}
        <div className="payment-controls">
          <div className="payment-search">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchQuery}
              onChange={handleSearch}
              className="payment-search-input"
            />
          </div>
          
          <div className="filter-controls">
            <div className="filter-group">
              <label><FiFilter /> Payment Type:</label>
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Types</option>
                <option value="bank transfer">Bank Transfer</option>
                <option value="digital wallet">Digital Wallet</option>
                <option value="cash">Cash</option>
                <option value="credit card">Credit Card</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label><FiCalendar /> Status:</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="done">Done</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            <button 
              className="export-btn" 
              onClick={exportToPDF}
              disabled={isExporting}
            >
              <FiDownload /> {isExporting ? 'Generating PDF...' : 'Export Report'}
            </button>
            
            <button className="add-payment-btn" onClick={openAddPaymentForm}>
              <HiOutlineCurrencyDollar /> Add Payment
            </button>
            
            <button 
              className="export-btn" 
              onClick={fetchPayments}
              style={{ backgroundColor: '#28a745', marginLeft: '10px' }}
            >
              <HiOutlineRefresh /> Refresh Data
            </button>
          </div>
        </div>

        {/* Payments Table */}
        <div className="payment-table-container">
          <table className="payment-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Payment Type</th>
                <th>Date</th>
                <th>Payment By (Supplier)</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                    <div>Loading payments...</div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                    <div>Error: {error}</div>
                    <button 
                      onClick={fetchPayments} 
                      style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Retry Loading
                    </button>
                  </td>
                </tr>
              ) : !Array.isArray(paymentData) ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'orange' }}>
                    <div>Invalid data format received from server</div>
                    <button 
                      onClick={fetchPayments} 
                      style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Reload Data
                    </button>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    <div>No payments found. Click "Add Payment" to add your first payment.</div>
                    <small style={{ display: 'block', marginTop: '8px' }}>
                      Total payments in database: {safePaymentData.length}
                      {safePaymentData.length > 0 && " (check filters above)"}
                    </small>
                  </td>
                </tr>
              ) : (
                currentItems.map((payment, index) => {
                  console.log('Rendering payment row:', payment);
                  return (
                    <tr 
                      key={payment.paymentId || payment.id || index} 
                      onClick={() => handleRowClick(payment)}
                      className="clickable-row"
                    >
                      <td>{payment.paymentId || payment.id || 'N/A'}</td>
                      <td>
                        <span className={`payment-type ${(payment.paymentType || payment.type || '').toLowerCase().replace(' ', '-')}`}>
                          {payment.paymentType || payment.type || 'N/A'}
                        </span>
                      </td>
                      <td>{payment.date ? formatDate(payment.date) : 'N/A'}</td>
                      <td>{payment.paymentBy || payment.supplier || 'N/A'}</td>
                      <td className="amount-cell">Rs. {payment.amount || '0'}</td>
                      <td>
                        <span className={`status-pill ${(payment.status || '').toLowerCase()}`}>
                          {payment.status || 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <div className="pagination-info">
            Showing {safeFilteredPayments.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, safeFilteredPayments.length)} of {safeFilteredPayments.length} payments
          </div>
          <div className="pagination-controls">
            <button 
              className="pagination-btn" 
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              &lt;
            </button>
            
            {totalPages > 0 && Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            
            <button 
              className="pagination-btn" 
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              &gt;
            </button>
          </div>
        </div>

        {/* Payment Categories Summary */}
        <div className="payment-summary-title">
          <h2>Payment Categories</h2>
          <p>Overview of different payment methods and their statistics</p>
        </div>

        <div className="payment-categories-grid">
          <div className="payment-summary-card total blue-card">
            <div className="card-header">
              <FiPieChart className="card-icon" />
              <div className="card-title">
                <h3>All Transactions</h3>
                <p>Total payment activities</p>
              </div>
            </div>
            <div className="card-stats">
              <div className="stat-value">{safePaymentData.length}</div>
              <div className="stat-amount">Rs. {totalAmount}</div>
            </div>
            <div className="card-footer">
              <div className="success-rate">
                <span className="rate-label">Success Rate:</span>
                <span className="rate-value">{safePaymentData.length > 0 ? Math.round((safePaymentData.length - pendingPayments) / safePaymentData.length * 100) : 0}%</span>
              </div>
            </div>
          </div>

          <div className="payment-summary-card bank">
            <div className="card-header">
              <HiOutlineCurrencyDollar className="card-icon" />
              <div className="card-title">
                <h3>Bank Transfers</h3>
                <p>Direct bank payment transactions</p>
              </div>
            </div>
            <div className="card-stats">
              <div className="stat-value">{bankTransfers}</div>
            </div>
            <div className="card-footer">
              <div className="trend">
                <span className="trend-positive">↗ 12% this month</span>
              </div>
            </div>
          </div>

          <div className="payment-summary-card cash">
            <div className="card-header">
              <HiOutlineCash className="card-icon" />
              <div className="card-title">
                <h3>Cash Payments</h3>
                <p>In-store cash transactions</p>
              </div>
            </div>
            <div className="card-stats">
              <div className="stat-value">{cashPayments}</div>
            </div>
            <div className="card-footer">
              <div className="trend">
                <span className="trend-positive">↗ 8% this month</span>
              </div>
            </div>
          </div>

          <div className="payment-summary-card card">
            <div className="card-header">
              <HiOutlineCreditCard className="card-icon" />
              <div className="card-title">
                <h3>Card Payments</h3>
                <p>Credit and debit card transactions</p>
              </div>
            </div>
            <div className="card-stats">
              <div className="stat-value">{cardPayments}</div>
            </div>
            <div className="card-footer">
              <div className="trend">
                <span className="trend-positive">↗ 15% this month</span>
              </div>
            </div>
          </div>

          <div className="payment-summary-card digital">
            <div className="card-header">
              <HiOutlinePhone className="card-icon" />
              <div className="card-title">
                <h3>Digital Wallets</h3>
                <p>Mobile payment solutions</p>
              </div>
            </div>
            <div className="card-stats">
              <div className="stat-value">{digitalWallets}</div>
            </div>
            <div className="card-footer">
              <div className="trend">
                <span className="trend-positive">↗ 25% this month</span>
              </div>
            </div>
          </div>

          <div className="payment-summary-card pending">
            <div className="card-header">
              <FiFilter className="card-icon" />
              <div className="card-title">
                <h3>Pending Payments</h3>
                <p>Transactions awaiting clearance</p>
              </div>
            </div>
            <div className="card-stats">
              <div className="stat-value">{pendingPayments}</div>
            </div>
            <div className="card-footer">
              <div className="trend">
                <span className="trend-attention">Needs attention</span>
              </div>
            </div>
          </div>
        </div>

        {/* Update Payment Modal */}
        {showUpdateModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Update Payment</h2>
                <button className="close-btn" onClick={() => setShowUpdateModal(false)}>
                  <FiX />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="update-form">
                <div className="form-group">
                  <label>Payment ID</label>
                  <input
                    type="text"
                    value={updateFormData.id}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Payment Type</label>
                  <select
                    value={updateFormData.type}
                    onChange={(e) => setUpdateFormData({...updateFormData, type: e.target.value})}
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Digital Wallet">Digital Wallet</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={updateFormData.date}
                    onChange={(e) => setUpdateFormData({...updateFormData, date: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Supplier</label>
                  <input
                    type="text"
                    value={updateFormData.supplier}
                    onChange={(e) => setUpdateFormData({...updateFormData, supplier: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="text"
                    value={updateFormData.amount}
                    onChange={(e) => setUpdateFormData({...updateFormData, amount: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={updateFormData.status}
                    onChange={(e) => setUpdateFormData({...updateFormData, status: e.target.value})}
                  >
                    <option value="Done">Done</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div className="button-group">
                  <button type="button" className="cancel-btn" onClick={() => setShowUpdateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="update-btn">
                    Update Payment
                  </button>
                  <button type="button" className="delete-btn" onClick={() => setShowDeleteConfirm(true)}>
                    Delete Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="delete-confirm-modal">
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete this payment record?</p>
              <div className="button-group">
                <button className="cancel-btn" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
                <button className="delete-btn" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Payment Modal */}
        {showAddPaymentForm && (
          <div className="modal-overlay">
            <div className="modal-content add-payment-modal">
              <div className="modal-header">
                <h3>
                  <HiOutlineCurrencyDollar className="modal-icon" />
                  Add New Payment
                </h3>
                <button className="close-btn" onClick={closeAddPaymentForm}>
                  <FiX />
                </button>
              </div>
              <form onSubmit={handleAddPaymentSubmit}>
                <div className="form-group">
                  <label htmlFor="payment-type">Payment Type</label>
                  <select
                    id="payment-type"
                    name="type"
                    value={newPaymentData.type}
                    onChange={handleNewPaymentChange}
                    className={formErrors.type ? 'error' : ''}
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Digital Wallet">Digital Wallet</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                  {formErrors.type && <span className="error-message">{formErrors.type}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="payment-date">Payment Date</label>
                  <input
                    type="date"
                    id="payment-date"
                    name="date"
                    value={newPaymentData.date}
                    onChange={handleNewPaymentChange}
                    className={formErrors.date ? 'error' : ''}
                  />
                  {formErrors.date && <span className="error-message">{formErrors.date}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="supplier-name">Supplier Name</label>
                  <input
                    type="text"
                    id="supplier-name"
                    name="supplier"
                    placeholder="Enter supplier name"
                    value={newPaymentData.supplier}
                    onChange={handleNewPaymentChange}
                    className={formErrors.supplier ? 'error' : ''}
                  />
                  {formErrors.supplier && <span className="error-message">{formErrors.supplier}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="payment-amount">Amount (Rs.)</label>
                  <input
                    type="number"
                    id="payment-amount"
                    name="amount"
                    placeholder="Enter payment amount"
                    value={newPaymentData.amount}
                    onChange={handleNewPaymentChange}
                    step="0.01"
                    min="0"
                    className={formErrors.amount ? 'error' : ''}
                  />
                  {formErrors.amount && <span className="error-message">{formErrors.amount}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="payment-status">Payment Status</label>
                  <select
                    id="payment-status"
                    name="status"
                    value={newPaymentData.status}
                    onChange={handleNewPaymentChange}
                    className={formErrors.status ? 'error' : ''}
                  >
                    <option value="Done">Done</option>
                    <option value="Pending">Pending</option>
                  </select>
                  {formErrors.status && <span className="error-message">{formErrors.status}</span>}
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={closeAddPaymentForm}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    <HiOutlineCurrencyDollar />
                    Add Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sweet Dialog Component */}
        <DialogComponent />
      </div>
    </div>
  );
};

export default PaymentReport;
