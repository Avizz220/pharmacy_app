import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import { FiMail, FiLock } from 'react-icons/fi';
import { FcGoogle, FcApproval, FcFlashOn, FcShipped } from 'react-icons/fc';
import { MdLocalPharmacy } from 'react-icons/md';
import { FaHeartbeat } from 'react-icons/fa';
import { authAPI } from '../../services/authAPI';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      const result = await authAPI.login(email, password);
      
      if (result.success) {
        // Call the parent component's onLogin function if provided
        if (onLogin) {
          onLogin(result.data);
        }
        navigate('/dashboard');
      } else {
        setLoginError(result.message || 'Invalid email/username or password. Please try again.');
      }
    } catch (error) {
      setLoginError('Login failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-form">
          <div className="login-header">
            <h1>WELCOME BACK</h1>
            <p className="subtitle">Welcome back! Please enter your details.</p>
          </div>
          
          {loginError && <div className="error-message">{loginError}</div>}
          
          <form onSubmit={handleSubmit} className="login-form-main">
            <div className="form-group">
              <label htmlFor="email">Email or Username</label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email or username"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me for 30 days</span>
              </label>
              <button type="button" className="forgot-password">
                Forgot password?
              </button>
            </div>

            <div className="button-group">
              <button type="submit" className="sign-in-button primary-button" disabled={isLoading}>
                <span>{isLoading ? 'Signing in...' : 'Login'}</span>
              </button>

              <div className="divider">
                <span>or</span>
              </div>

              <button type="button" className="google-button secondary-button">
                <FcGoogle className="google-icon" />
                <span>Continue with Google</span>
              </button>
            </div>
          </form>

          <div className="signup-section">
            <p className="signup-prompt">
              Don't have an account? <Link to="/signup" className="signup-link">Create account</Link>
            </p>
          </div>
        </div>
      </div>
      
      <div className="login-right">
        <div className="overlay-content">
          <div className="pharmacy-brand">
            <div className="brand-header">
              <MdLocalPharmacy className="pharmacy-icon" />
              <h1>Crystal Pharmacy</h1>
            </div>
            <p className="brand-tagline">Your Health, Our Priority</p>
          </div>
          
          <div className="greeting-section">
            <h2>{getTimeBasedGreeting()}</h2>
          </div>
          
          <div className="feature-cards">
            <div className="feature-card">
              <FcApproval className="icon" />
              <span>Trusted Healthcare Partner</span>
            </div>
            <div className="feature-card">
              <FaHeartbeat className="icon heartbeat" />
              <span>Quality Medicines & Care</span>
            </div>
            <div className="feature-card">
              <FcShipped className="icon" />
              <span>Fast & Reliable Service</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
