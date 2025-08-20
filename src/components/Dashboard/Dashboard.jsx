import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Reports from '../Reports/Reports';
import MedicineGroups from '../MedicineGroups/MedicineGroups';
import PaymentReport from '../PaymentReport/PaymentReport';
import SalesReport from '../SalesReport/SalesReport';
import Profile from '../Profile/Profile';
import EquipmentStock from '../EquipmentStock/EquipmentStock';
import Customers from '../Customers/Customers';
import Suppliers from '../Suppliers/Suppliers';
import AboutUs from '../AboutUs/AboutUs';
import { FiLogOut, FiUser } from 'react-icons/fi';
import { useSweetDialog } from '../SweetDialog/SweetDialog';

const Dashboard = ({ onLogout }) => {
  // Sweet Dialog Hook
  const { 
    showSuccess, 
    showError, 
    showWarning,
    showConfirm,
    DialogComponent 
  } = useSweetDialog();

  const [selectedMonth, setSelectedMonth] = useState('January 2022');
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryDropdownOpen, setInventoryDropdownOpen] = useState(false);
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false);
  const [contactDropdownOpen, setContactDropdownOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [currentView, setCurrentView] = useState('dashboard'); // Add navigation state
  
  // Dashboard stats state
  const [dashboardStats, setDashboardStats] = useState({
    totalMedicines: 0,
    totalCustomers: 0,
    totalSuppliers: 0,
    totalUsers: 0,
    totalEquipment: 0,
    medicineShortage: 0,
    totalPayments: 0,
    medicinesSold: 0,
    invoicesGenerated: 0,
    frequentlyBoughtItem: 'Loading...',
    inventoryStatus: 'Good'
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Get user information from localStorage
  const [userInfo, setUserInfo] = useState({
    username: 'User',
    fullName: 'User',
    role: 'User'
  });

  // Load user info from localStorage on component mount
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        setUserInfo({
          username: parsedUserInfo.username || 'User',
          fullName: parsedUserInfo.fullName || parsedUserInfo.username || 'User',
          role: parsedUserInfo.role || 'User'
        });
      } catch (error) {
        console.error('Error parsing user info:', error);
      }
    }
    
    // Fetch dashboard data on component mount
    fetchDashboardData();
  }, []);

  // Fetch all dashboard statistics
  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      await Promise.all([
        fetchMedicinesData(),
        fetchCustomersData(),
        fetchSuppliersData(),
        fetchSalesData(),
        fetchPaymentsData(),
        fetchEquipmentData()
      ]);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch medicines data
  const fetchMedicinesData = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/medicines?size=1000', {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.success) {
        const medicines = data.medicines || [];
        const shortageCount = medicines.filter(med => med.stockQuantity < 10).length;
        
        setDashboardStats(prev => ({
          ...prev,
          totalMedicines: medicines.length,
          medicineShortage: shortageCount,
          inventoryStatus: shortageCount === 0 ? 'Good' : shortageCount < 5 ? 'Warning' : 'Critical'
        }));
      }
    } catch (err) {
      console.error('Error fetching medicines:', err);
    }
  };

  // Fetch customers data
  const fetchCustomersData = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/customers', {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.success) {
        setDashboardStats(prev => ({
          ...prev,
          totalCustomers: (data.customers || []).length
        }));
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  // Fetch suppliers data
  const fetchSuppliersData = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/suppliers', {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.success) {
        setDashboardStats(prev => ({
          ...prev,
          totalSuppliers: (data.suppliers || []).length
        }));
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  };

  // Fetch sales data and calculate revenue
  const fetchSalesData = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/sales?size=1000', {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.success) {
        const sales = data.sales || [];
        const totalRevenue = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
        
        // Count sales by saleType to find most frequently sold type
        let mostFrequentItem = 'No sales data';
        if (sales.length > 0) {
          const saleTypeFrequency = {};
          sales.forEach(sale => {
            const saleType = sale.saleType || 'Unknown';
            saleTypeFrequency[saleType] = (saleTypeFrequency[saleType] || 0) + 1;
          });
          
          const entries = Object.entries(saleTypeFrequency);
          if (entries.length > 0) {
            const mostFrequentType = entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
            // Format the display name
            mostFrequentItem = mostFrequentType.charAt(0).toUpperCase() + mostFrequentType.slice(1).toLowerCase();
          }
        }
        
        setDashboardStats(prev => ({
          ...prev,
          medicinesSold: sales.filter(sale => sale.saleType && sale.saleType.toLowerCase() === 'medicine').length,
          invoicesGenerated: sales.length,
          frequentlyBoughtItem: mostFrequentItem
        }));
      }
    } catch (err) {
      console.error('Error fetching sales:', err);
      setDashboardStats(prev => ({
        ...prev,
        frequentlyBoughtItem: 'Unable to load'
      }));
    }
  };

  // Fetch payments data to get total payments amount
  const fetchPaymentsData = async () => {
    try {
      console.log('Fetching payments data...');
      const response = await fetch('http://localhost:8080/api/payments?size=1000', {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('Payments response status:', response.status);
      const data = await response.json();
      console.log('Payments response data:', data);
      
      if (data.success) {
        const payments = data.payments || [];
        console.log('Number of payments found:', payments.length);
        console.log('Sample payment data:', payments[0]);
        
        const totalPaymentsAmount = payments.reduce((sum, payment) => {
          const amount = parseFloat(payment.amount) || 0;
          console.log(`Payment ${payment.paymentId}: ${amount}`);
          return sum + amount;
        }, 0);
        
        console.log('Total payments amount calculated:', totalPaymentsAmount);
        
        // Update total payments amount
        setDashboardStats(prev => ({
          ...prev,
          totalPayments: totalPaymentsAmount
        }));
      } else {
        console.error('Payments API returned error:', data.message);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
    }
  };

  // Fetch equipment data
  const fetchEquipmentData = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/equipment?size=1000', {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.success) {
        const equipment = data.equipment || [];
        // Calculate total quantity of all equipment
        const totalEquipmentQuantity = equipment.reduce((sum, item) => {
          return sum + (item.noOfEquipments || 0);
        }, 0);
        
        setDashboardStats(prev => ({
          ...prev,
          totalEquipment: totalEquipmentQuantity
        }));
      }
    } catch (err) {
      console.error('Error fetching equipment:', err);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('₹', 'Rs. ');
  };

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  // Toggle dropdown for navigation items
  const toggleDropdown = (itemName) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };  // Navigation functions
  const navigateToReports = () => {
    setCurrentView('reports');
    setOpenDropdowns({}); // Close all dropdowns
  };

  const navigateToPaymentReport = () => {
    setCurrentView('payment-report');
    setOpenDropdowns({}); // Close all dropdowns
  };

  const navigateToSalesReport = () => {
    setCurrentView('sales-report');
    setOpenDropdowns({}); // Close all dropdowns
  };

  const navigateToMedicineGroups = () => {
    setCurrentView('medicine-groups');
    setOpenDropdowns({}); // Close all dropdowns
  };
  
  const navigateToEquipmentStock = () => {
    setCurrentView('equipment-stock');
    setOpenDropdowns({}); // Close all dropdowns
  };
  const navigateToDashboard = () => {
    setCurrentView('dashboard');
  };

  const navigateToProfile = () => {
    setCurrentView('profile');
  };
  
  const navigateToCustomers = () => {
    setCurrentView('customers');
    setOpenDropdowns({}); // Close all dropdowns
  };
  
  const navigateToSuppliers = () => {
    setCurrentView('suppliers');
    setOpenDropdowns({}); // Close all dropdowns
  };

  const navigateToAboutUs = () => {
    setCurrentView('about-us');
    setOpenDropdowns({}); // Close all dropdowns
  };

  // Handle logout functionality
  const handleLogout = async () => {
    try {
      // Show confirmation dialog using SweetDialog
      const result = await showConfirm(
        'Are you sure you want to logout?',
        'You will be redirected to the login page.',
        'Logout Confirmation'
      );
      
      if (result) {
        // Clear any stored user data
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        
        // Show success message
        showSuccess('Successfully logged out!', 'Goodbye');
        
        // Small delay to show the success message
        setTimeout(() => {
          // Call the onLogout function passed from parent component
          if (onLogout) {
            onLogout();
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error during logout:', error);
      showError('An error occurred during logout. Please try again.', 'Logout Error');
    }
  };

  // Get current time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon";
    } else  {
      return "Good Evening";
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

  const handleDownloadReport = async () => {
    try {
      console.log('Generating Dashboard Report PDF...');
      
      // Create new PDF document
      const doc = new jsPDF();
      
      // Set document properties
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Add header with pharmacy branding
      doc.setFontSize(24);
      doc.setTextColor(34, 197, 94);
      doc.text(' CRYSTAL PHARMACY MANAGEMENT SYSTEM', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text(' Dashboard Summary Report', pageWidth / 2, 35, { align: 'center' });
      
      // Add report date and time
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      const currentDate = new Date().toLocaleString();
      doc.text(`Generated on: ${currentDate}`, pageWidth / 2, 45, { align: 'center' });
      doc.text(`Report by: ${userInfo.fullName} (${userInfo.role})`, pageWidth / 2, 52, { align: 'center' });
      
      // Add separator line
      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 60, pageWidth - 20, 60);
      
      // Start content position
      let yPosition = 75;
      
      // Key Performance Indicators Section
      doc.setFontSize(16);
      doc.setTextColor(34, 197, 94);
      doc.text('Key Performance Indicators', 20, yPosition);
      yPosition += 15;
      
      // Create KPI table data
      const kpiData = [
        [' Total Revenue', formatCurrency(dashboardStats.totalPayments)],
        [' Total Medicines', formatNumber(dashboardStats.totalMedicines)],
        [' Total Customers', formatNumber(dashboardStats.totalCustomers)],
        [' Total Suppliers', formatNumber(dashboardStats.totalSuppliers)],
        [' Total Equipment', formatNumber(dashboardStats.totalEquipment)],
        [' Medicines Sold', formatNumber(dashboardStats.medicinesSold)],
        [' Invoices Generated', formatNumber(dashboardStats.invoicesGenerated)],
        [' Inventory Status', dashboardStats.inventoryStatus],
        [' Medicine Shortage', dashboardStats.medicineShortage < 5 ? 'No Shortage' : formatNumber(dashboardStats.medicineShortage)],
        [' Most Popular Item', dashboardStats.frequentlyBoughtItem]
      ];
      
      // Add KPI table
      autoTable(doc, {
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: kpiData,
        theme: 'striped',
        headStyles: {
          fillColor: [34, 197, 94],
          textColor: [255, 255, 255],
          fontSize: 12,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 11,
          textColor: [60, 60, 60]
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        margin: { left: 20, right: 20 },
        columnStyles: {
          0: { cellWidth: 80, fontStyle: 'bold' },
          1: { cellWidth: 80, halign: 'center' }
        }
      });
      
      // Update y position after table
      yPosition = doc.lastAutoTable.finalY + 20;
      
      // Business Insights Section
      doc.setFontSize(16);
      doc.setTextColor(34, 197, 94);
      doc.text(' Business Insights', 20, yPosition);
      yPosition += 15;
      
      // Calculate insights
      const insights = [];
      
      // Revenue per customer
      const revenuePerCustomer = dashboardStats.totalCustomers > 0 ? 
        dashboardStats.totalPayments / dashboardStats.totalCustomers : 0;
      insights.push(` Average revenue per customer: ${formatCurrency(revenuePerCustomer)}`);
      
      // Inventory utilization
      const medicinesPerSupplier = dashboardStats.totalSuppliers > 0 ? 
        dashboardStats.totalMedicines / dashboardStats.totalSuppliers : 0;
      insights.push(` Average medicines per supplier: ${medicinesPerSupplier.toFixed(1)}`);
      
      // Sales efficiency
      const salesEfficiency = dashboardStats.totalMedicines > 0 ? 
        (dashboardStats.medicinesSold / dashboardStats.totalMedicines * 100) : 0;
      insights.push(` Sales efficiency: ${salesEfficiency.toFixed(1)}% of inventory sold`);
      
      // Inventory health
      if (dashboardStats.inventoryStatus === 'Good') {
        insights.push(` Inventory status is healthy with minimal shortages`);
      } else if (dashboardStats.inventoryStatus === 'Warning') {
        insights.push(` Inventory requires attention - some items running low`);
      } else {
        insights.push(` Critical inventory shortage - immediate restocking needed`);
      }
      
      // Customer engagement
      if (dashboardStats.frequentlyBoughtItem !== 'Loading...' && 
          dashboardStats.frequentlyBoughtItem !== 'No sales data') {
        insights.push(` "${dashboardStats.frequentlyBoughtItem}" is the most popular item`);
      }
      
      // Add insights to PDF
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      
      insights.forEach((insight, index) => {
        const lines = doc.splitTextToSize(insight, pageWidth - 50);
        doc.text(lines, 25, yPosition);
        yPosition += lines.length * 6 + 3;
      });
      
      // Check if we need a new page
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 30;
      }
      
      // Summary Section
      yPosition += 10;
      doc.setFontSize(16);
      doc.setTextColor(34, 197, 94);
      doc.text('Executive Summary', 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      
      const summaryText = `Crystal Pharmacy is currently managing ${formatNumber(dashboardStats.totalMedicines)} medicines with ${formatNumber(dashboardStats.totalCustomers)} active customers and ${formatNumber(dashboardStats.totalSuppliers)} suppliers. The business has generated ${formatCurrency(dashboardStats.totalPayments)} in total revenue with ${formatNumber(dashboardStats.invoicesGenerated)} invoices processed. The inventory status is ${dashboardStats.inventoryStatus.toLowerCase()}, and the most popular item among customers is "${dashboardStats.frequentlyBoughtItem}".`;
      
      const summaryLines = doc.splitTextToSize(summaryText, pageWidth - 40);
      doc.text(summaryLines, 20, yPosition);
      yPosition += summaryLines.length * 6 + 15;
      
      // Footer
      const footerY = pageHeight - 20;
      doc.setFontSize(9);
      doc.setTextColor(128, 128, 128);
      doc.text('Crystal Pharmacy Management System - Confidential Dashboard Report', pageWidth / 2, footerY, { align: 'center' });
      doc.text(`Page 1 of 1 | Generated: ${currentDate}`, pageWidth / 2, footerY + 5, { align: 'center' });
      
      // Save the PDF
      const fileName = `Crystal_Pharmacy_Dashboard_Report_${new Date().toISOString().split('T')[0]}_${new Date().getTime()}.pdf`;
      console.log('Saving Dashboard PDF as:', fileName);
      doc.save(fileName);
      
      console.log('Dashboard PDF generated successfully');
      
    } catch (error) {
      console.error('Error generating Dashboard PDF:', error);
      alert('❌ Failed to generate Dashboard PDF. Please try again.\nError: ' + error.message);
    }
  };  // Render Reports component if current view is reports
  if (currentView === 'reports') {
    return <Reports onBack={navigateToDashboard} />;
  }

  // Render Payment Report component if current view is payment-report
  if (currentView === 'payment-report') {
    return <PaymentReport onBack={navigateToDashboard} />;
  }

  // Render Sales Report component if current view is sales-report
  if (currentView === 'sales-report') {
    return <SalesReport onBack={navigateToDashboard} />;
  }
  // Render Medicine Groups component if current view is medicine-groups
  if (currentView === 'medicine-groups') {
    return <MedicineGroups onBack={navigateToDashboard} />;
  }

  // Render Profile component if current view is profile
  if (currentView === 'profile') {
    return <Profile onBack={navigateToDashboard} onLogout={onLogout} />;
  }
  
  // Render Equipment Stock component if current view is equipment-stock
  if (currentView === 'equipment-stock') {
    return <EquipmentStock onBack={navigateToDashboard} />;
  }
  
  // Render Customers component if current view is customers
  if (currentView === 'customers') {
    return <Customers onBack={navigateToDashboard} />;
  }
  
  // Render Suppliers component if current view is suppliers
  if (currentView === 'suppliers') {
    return <Suppliers onBack={navigateToDashboard} />;
  }

  // Render About Us component if current view is about-us
  if (currentView === 'about-us') {
    return <AboutUs onBack={navigateToDashboard} />;
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">🏥</div>
            <h2 className="logo-text">Crystal Pharmacy</h2>
          </div>
        </div>

        <div className="user-profile">
          <div className="user-avatar">
            <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face" alt="User" />
          </div>
          <div className="user-info">
            <h3>{userInfo.fullName}</h3>
            <span className="user-role">{userInfo.role}</span>
          </div>
          <button className="user-menu-btn" onClick={onLogout} title="Logout">
            🚪
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item active">
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </div>
          
          <div className="nav-item-container">
            <div 
              className={`nav-item ${openDropdowns.inventory ? 'expanded' : ''}`}
              onClick={() => toggleDropdown('inventory')}
            >
              <span className="nav-icon">📦</span>
              <span className="nav-text">Inventory</span>
              <span className={`nav-arrow ${openDropdowns.inventory ? 'rotated' : ''}`}>▶</span>
            </div>
            {openDropdowns.inventory && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={navigateToMedicineGroups}>
                  <span className="dropdown-icon">💊</span>
                  <span className="dropdown-text">Medicine Stock</span>
                </div>
                <div className="dropdown-item" onClick={navigateToEquipmentStock}>
                  <span className="dropdown-icon">🩺</span>
                  <span className="dropdown-text">Equipment Stock</span>
                </div>
              </div>
            )}
          </div>

          <div className="nav-item-container">
            <div 
              className={`nav-item ${openDropdowns.reports ? 'expanded' : ''}`}
              onClick={() => toggleDropdown('reports')}
            >
              <span className="nav-icon">📋</span>
              <span className="nav-text">Reports</span>
              <span className={`nav-arrow ${openDropdowns.reports ? 'rotated' : ''}`}>▶</span>
            </div>
            {openDropdowns.reports && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={navigateToPaymentReport}>
                  <span className="dropdown-icon">💳</span>
                  <span className="dropdown-text">Payment Report</span>
                </div>
                <div className="dropdown-item" onClick={navigateToSalesReport}>
                  <span className="dropdown-icon">📊</span>
                  <span className="dropdown-text">Sales Report</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="nav-item-container">
            <div 
              className={`nav-item ${openDropdowns.contact ? 'expanded' : ''}`}
              onClick={() => toggleDropdown('contact')}
            >
              <span className="nav-icon">👥</span>
              <span className="nav-text">Contacts</span>
              <span className={`nav-arrow ${openDropdowns.contact ? 'rotated' : ''}`}>▶</span>
            </div>
            {openDropdowns.contact && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={navigateToCustomers}>
                  <span className="dropdown-icon">👤</span>
                  <span className="dropdown-text">Customers</span>
                </div>
                <div className="dropdown-item" onClick={navigateToSuppliers}>
                  <span className="dropdown-icon">🏭</span>
                  <span className="dropdown-text">Suppliers</span>
                </div>
              </div>
            )}
          </div>

          <div className="nav-item" onClick={navigateToProfile}>
            <span className="nav-icon">🛠️</span>
            <span className="nav-text">Profile Settings</span>
          </div>

          <div className="nav-item" onClick={navigateToAboutUs}>
            <span className="nav-icon">ℹ️</span>
            <span className="nav-text">About Us</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <p>Powered by {userInfo.username} © 2023</p>
          <p>v1.1.3</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
           
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
            <div className="user-actions">
              <button className="profile-btn" onClick={navigateToProfile} title="Profile">
                <FiUser />
              </button>
              <button className="logout-btn" onClick={handleLogout} title="Logout">
                <FiLogOut />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          <div className="content-header">
            <div className="page-title">
              <h1>Dashboard</h1>
              <p>A quick data overview of the inventory.</p>
            </div>
            <button className="download-report-btn" onClick={handleDownloadReport}>
              Download Report ▼
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="error-message">
              <span>⚠️</span>
              {error}
              <button onClick={fetchDashboardData} style={{marginLeft: '10px', padding: '5px 10px'}}>
                Retry
              </button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className={`stat-card ${dashboardStats.inventoryStatus.toLowerCase()}`}>
              <div className="stat-icon">
                {dashboardStats.inventoryStatus === 'Good' ? '✅' : 
                 dashboardStats.inventoryStatus === 'Warning' ? '⚠️' : '❌'}
              </div>
              <div className="stat-content">
                <h3>{dashboardStats.inventoryStatus}</h3>
                <p>Inventory Status</p>
              </div>
            </div>

            <div className="stat-card revenue">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>{loading ? 'Loading...' : formatCurrency(dashboardStats.totalPayments)}</h3>
                <p>Total Payments </p>
              </div>
            </div>

            <div className="stat-card medicines">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <h3>{loading ? 'Loading...' : formatNumber(dashboardStats.totalMedicines)}</h3>
                <p>Medicines Available</p>
              </div>
            </div>

            <div className="stat-card shortage">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <h3>
                  {loading ? 'Loading...' : 
                   dashboardStats.medicineShortage < 5 ? 'No Medicine Shortage' : 
                   formatNumber(dashboardStats.medicineShortage)}
                </h3>
                <p>Medicine Shortage</p>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="bottom-section">
            <div className="section-left">
              <div className="inventory-section">
                <div className="section-header">
                  <h2>Inventory</h2>
                </div>
                <div className="inventory-stats">
                  <div className="inventory-item">
                    <h3>{loading ? 'Loading...' : formatNumber(dashboardStats.totalMedicines)}</h3>
                    <p>Total no of Medicines</p>
                  </div>
                  <div className="inventory-item">
                    <h3>{loading ? 'Loading...' : formatNumber(dashboardStats.totalEquipment)}</h3>
                    <p>Total Equipment</p>
                  </div>
                </div>
              </div>

              <div className="pharmacy-section">
                <div className="section-header">
                  <h2>My Pharmacy</h2>
                </div>
                <div className="pharmacy-stats">
                  <div className="pharmacy-item">
                    <h3>{loading ? 'Loading...' : formatNumber(dashboardStats.totalSuppliers)}</h3>
                    <p>Total no of Suppliers</p>
                  </div>
                  <div className="pharmacy-item">
                    <h3>{loading ? 'Loading...' : formatNumber(dashboardStats.totalCustomers)}</h3>
                    <p>Total no of Customers</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="section-right">
              <div className="quick-report-section">
                <div className="section-header">
                  <h2>Quick Report</h2>

                </div>
                <div className="report-stats">
                  <div className="report-item">
                    <h3>{loading ? 'Loading...' : formatNumber(dashboardStats.medicinesSold)}</h3>
                    <p>Qty of Medicines Sold</p>
                  </div>
                  <div className="report-item">
                    <h3>{loading ? 'Loading...' : formatNumber(dashboardStats.invoicesGenerated)}</h3>
                    <p>Invoices Generated</p>
                  </div>
                </div>
              </div>

              <div className="customers-section">
                <div className="section-header">
                  <h2>Customers</h2>
                </div>
                <div className="customers-stats">
                  <div className="customers-item">
                    <h3>{loading ? 'Loading...' : formatNumber(dashboardStats.totalCustomers)}</h3>
                    <p>Total no of Customers</p>
                  </div>
                  <div className="customers-item featured">
                    <h3>{loading ? 'Loading...' : dashboardStats.frequentlyBoughtItem}</h3>
                    <p>Frequently bought Item</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sweet Dialog Component */}
      <DialogComponent />
    </div>
  );
};

export default Dashboard;
