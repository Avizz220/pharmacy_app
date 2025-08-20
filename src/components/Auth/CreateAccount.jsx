import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './CreateAccount.css';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';
import pharmacyLoginIllustration from '../../assets/pharmacy-login-illustration.js';
import googleIcon from '../../assets/google-icon.svg';
import { authAPI } from '../../services/authAPI';

const CreateAccount = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegistrationError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await authAPI.register(
        formData.username,
        formData.email,
        formData.password,
        formData.fullName
      );
      
      if (result.success) {
        // Registration successful, redirect to dashboard
        navigate('/dashboard');
      } else {
        setRegistrationError(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setRegistrationError('Registration failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-account-container">
      <div className="create-account-card">
        <div className="illustration-section">
          <img src={pharmacyLoginIllustration} alt="Pharmacy Login" className="pharmacy-illustration" />
        </div>
        <div className="create-account-form">
          
          <h1>Create your Account</h1>
          
          {registrationError && (
            <div className="error-message" style={{
              color: '#dc2626',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {registrationError}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-with-icon">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your Username here"
                  value={formData.username}
                  onChange={handleChange}
                  className={`form-input ${errors.username ? 'error' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>
            
            <div className="form-group">
              <div className="input-with-icon">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your Full Name here"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`form-input ${errors.fullName ? 'error' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.fullName && <span className="error-text">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <div className="input-with-icon">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your Email here"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your Password here (min 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group terms">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <br />
                <br/>
                <span>I agree to the Terms and Conditions</span>
              </label>
              {errors.agreeToTerms && <span className="error-text">{errors.agreeToTerms}</span>}
            </div>

            <button type="submit" className="create-account-btn" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="divider">
            <span>- OR -</span>
          </div>

          <button className="google-signup-btn">
            <img src={googleIcon} alt="Google" className="google-icon" />
            Sign up with Google
          </button>

          <div className="login-link">
            Already have an account? <a href="#" onClick={() => navigate('/login')}>Log in</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
