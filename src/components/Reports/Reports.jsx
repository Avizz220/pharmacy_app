import React, { useState } from 'react';
import './Reports.css';

const Reports = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="reports-container">
      {/* Header */}
      <header className="reports-header">
        <div className="header-left">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search for anything here..."
              value={searchQuery}
              onChange={handleSearch}
              className="search-input"
            />
            <button className="search-btn">🔍</button>
          </div>
        </div>
        <div className="header-right">
          <div className="language-selector">
            <span>🌐 English (US)</span>
            <span className="dropdown-arrow">▼</span>
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

      {/* Reports Content */}
      <div className="reports-content">
        <div className="reports-title">
          <button className="back-btn" onClick={onBack}>
            ← Back to Dashboard
          </button>
          <h1>Reports</h1>
          <p>Overall reports related to the pharmacy.</p>
        </div>

        {/* Reports Cards */}
        <div className="reports-grid">
          <div className="report-card sales-report">
            <div className="report-icon">
              <div className="icon-container sales">
                💰
              </div>
            </div>
            <div className="report-content">
              <h3>Rs. 8,55,875</h3>
              <p>Total Sales Report</p>
            </div>
            <button className="report-action">
              View Detailed Report →
            </button>
          </div>

          <div className="report-card payment-report">
            <div className="report-icon">
              <div className="icon-container payment">
                🛡️
              </div>
            </div>
            <div className="report-content">
              <h3>523</h3>
              <p>Payment Report</p>
            </div>
            <button className="report-action">
              View Detailed Report →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
