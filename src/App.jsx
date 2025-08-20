import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login/Login'
import Dashboard from './components/Dashboard/Dashboard'
import CreateAccount from './components/Auth/CreateAccount'
import { authAPI } from './services/authAPI'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on app load
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const isLoggedIn = authAPI.isLoggedIn();
        if (isLoggedIn) {
          // Optionally verify token with backend
          const isBackendConnected = await authAPI.testConnection();
          if (isBackendConnected) {
            setIsAuthenticated(true);
          } else {
            // Backend is not available, but keep user logged in
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        // If there's an error, clear stored authentication
        authAPI.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  const handleLogin = (userData) => {
    // This function is called after successful API login
    setIsAuthenticated(true);
    return true;
  };

  const handleLogout = () => {
    // Clear authentication state and stored data
    authAPI.logout();
    setIsAuthenticated(false);
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#6b7280'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Login onLogin={handleLogin} />
            } 
          />
          <Route path="/signup" element={<CreateAccount />} />
          <Route 
            path="/dashboard/*" 
            element={
              isAuthenticated ? 
              <Dashboard onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
