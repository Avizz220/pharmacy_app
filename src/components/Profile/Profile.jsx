import React, { useState, useEffect } from 'react';
import './Profile.css';
import { useSweetDialog } from '../SweetDialog/SweetDialog';

const Profile = ({ onBack, onLogout }) => {
  // Set document title when component mounts
  useEffect(() => {
    document.title = "Application Settings | Crystal Pharmacy";
    return () => {
      document.title = "Crystal Pharmacy";
    };
  }, []);

  // SweetDialog hook
  const {
    showDialog,
    showSuccess,
    showError,
    showWarning,
    DialogComponent
  } = useSweetDialog();

  const [profileData, setProfileData] = useState({
    fullName: '',
    email: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Load user data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      console.log('Loading user data...');
      const userData = localStorage.getItem('userInfo');
      const token = localStorage.getItem('authToken');
      
      console.log('User data from localStorage:', userData ? 'Found' : 'Not found');
      console.log('Auth token from localStorage:', token ? 'Found' : 'Not found');
      
      if (userData) {
        const user = JSON.parse(userData);
        setUserInfo(user);
        setProfileData({
          fullName: user.fullName || '',
          email: user.email || ''
        });
        console.log('Set initial profile data:', { fullName: user.fullName, email: user.email });
      }

      // Fetch current user profile from API to get latest data
      if (token) {
        try {
          console.log('Fetching user profile from API...');
          const response = await fetch('http://localhost:8080/api/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          console.log('API response status:', response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('API response data:', data);
            
            if (data.success && data.profile) {
              const profile = data.profile;
              setProfileData({
                fullName: profile.fullName || '',
                email: profile.email || ''
              });
              
              // Update userInfo state with latest data
              setUserInfo(profile);
              
              // Update localStorage with latest user info
              localStorage.setItem('userInfo', JSON.stringify(profile));
              console.log('Updated profile data from API');
            }
          } else {
            console.error('Failed to fetch profile:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        console.warn('No auth token found, skipping API call');
      }
    };

    loadUserData();
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

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!profileData.fullName.trim() || !profileData.email.trim()) {
      showDialog({
        type: 'warning',
        title: 'Validation Error',
        message: 'Please fill in all required fields.'
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      console.log('Save profile - Token found:', token ? 'Yes' : 'No');
      
      if (!token) {
        showDialog({
          type: 'error',
          title: 'Authentication Error',
          message: 'Authentication token not found. Please login again.'
        });
        return;
      }

      console.log('Sending profile update request with data:', {
        fullName: profileData.fullName,
        email: profileData.email
      });

      const response = await fetch('http://localhost:8080/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: profileData.fullName,
          email: profileData.email
        })
      });

      console.log('Profile update response status:', response.status);
      const data = await response.json();
      console.log('Profile update response data:', data);

      if (data.success) {
        // Update localStorage with new user info
        const updatedUserInfo = {
          ...userInfo,
          fullName: profileData.fullName,
          email: profileData.email
        };
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        setUserInfo(updatedUserInfo);
        
        showDialog({
          type: 'success',
          title: 'Success',
          message: 'Profile updated successfully!'
        });
      } else {
        showDialog({
          type: 'error',
          title: 'Update Failed',
          message: 'Failed to update profile: ' + data.message
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showDialog({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update profile. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showWarning('Please fill in all password fields.', 'Validation Error');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('New passwords do not match!', 'Validation Error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showWarning('New password must be at least 6 characters long.', 'Validation Error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        showError('Authentication token not found. Please login again.', 'Authentication Error');
        return;
      }

      const response = await fetch('http://localhost:8080/api/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        // Clear password fields
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Show success message and then redirect to login
        showSuccess(
          'Your password has been updated successfully! 🎉\n\nYou will be automatically redirected to the login page in 3 seconds to sign in with your new password.',
          'Password Changed Successfully!'
        );

        // Clear authentication data after a short delay to show the success message
        setTimeout(() => {
          // Clear all authentication related data
          localStorage.removeItem('authToken');
          localStorage.removeItem('userInfo');
          localStorage.removeItem('userToken');
          localStorage.removeItem('userData');
          
          // Redirect to login page
          if (onLogout) {
            onLogout();
          }
        }, 3000); // 3 second delay to show the success message
      } else {
        showError('Failed to change password: ' + data.message, 'Password Change Failed');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showError('Failed to change password. Please try again.', 'Password Change Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      {/* Header */}
      <header className="profile-header">
        <div className="header-left">
          <button className="back-btn-header" onClick={onBack}>
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

      {/* Profile Content */}
      <div className="profile-content">
        {/* Profile Information Form */}
        <div className="profile-form-container">
          <div className="form-section">
            <h2 className="section-title">User Profile</h2>
            
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label required">
                  FULL NAME
                </label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => handleProfileChange('fullName', e.target.value)}
                  className="form-input"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label required">
                  EMAIL
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  className="form-input"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <button 
              className="save-btn" 
              onClick={handleSaveProfile}
              disabled={loading}
            >
              {loading ? 'SAVING...' : 'SAVE CHANGES'}
            </button>
          </div>

          {/* Change Password Section */}
          <div className="password-section">
            <h2 className="section-title">Change Password</h2>
            
            <div className="password-form">
              <div className="form-group">
                <label className="form-label required">CURRENT PASSWORD</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  className="form-input"
                  placeholder="Enter your current password to make changes"
                />
              </div>

              <div className="password-row">
                <div className="form-group">
                  <label className="form-label required">NEW PASSWORD</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className="form-input"
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">CONFIRM PASSWORD</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className="form-input"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <button 
                className="save-btn" 
                onClick={handleSavePassword}
                disabled={loading}
              >
                {loading ? 'SAVING...' : 'SAVE CHANGES'}
              </button>

              <p className="password-note">
                YOU WILL BE ASKED TO LOG IN AGAIN WITH YOUR NEW PASSWORD AFTER YOU SAVE YOUR CHANGES.
              </p>
            </div>
          </div>
        </div>
      </div>
      {DialogComponent()}
    </div>
  );
};

export default Profile;
