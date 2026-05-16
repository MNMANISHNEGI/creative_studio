import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const IndiGoLogo = () => (
  <svg viewBox="0 0 220 80" xmlns="http://www.w3.org/2000/svg" className="login-logo-svg">
    <rect x="2" y="2" width="216" height="76" rx="4" fill="none" stroke="white" strokeWidth="2.5" />
    <text x="18" y="54" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="42" fill="white">
      Indi
    </text>
    <text x="100" y="54" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="42" fill="white" fontStyle="italic">
      Go
    </text>
    <text x="148" y="20" fontFamily="Arial, sans-serif" fontSize="10" fill="white">®</text>
    <line x1="156" y1="8" x2="156" y2="72" stroke="white" strokeWidth="2" />
    <g transform="translate(165, 12)">
      <circle cx="36" cy="6" r="3" fill="white" />
      <circle cx="27" cy="13" r="3" fill="white" />
      <circle cx="18" cy="20" r="3" fill="white" />
      <circle cx="9" cy="27" r="3" fill="white" />
      <circle cx="0" cy="34" r="3" fill="white" />
      <circle cx="9" cy="20" r="2.5" fill="white" opacity="0.7" />
      <circle cx="18" cy="13" r="2.5" fill="white" opacity="0.7" />
      <circle cx="27" cy="27" r="2.5" fill="white" opacity="0.7" />
      <circle cx="18" cy="34" r="2" fill="white" opacity="0.5" />
      <circle cx="27" cy="41" r="2" fill="white" opacity="0.5" />
    </g>
  </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Email is required';
    if (!formData.password)        newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name])  setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError)      setApiError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    setIsLoading(true);
    setApiError('');
    try {
      await login(formData.username.trim(), formData.password);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-left">
        <div className="login-left-content">
          <IndiGoLogo />
          <p className="login-tagline">On-time. Hassle-free. Affordable.</p>
          <div className="login-feature-list">
            <div className="login-feature-item">
              <span className="feature-icon">&#9632;</span>
              <span>Creative Asset Management</span>
            </div>
            <div className="login-feature-item">
              <span className="feature-icon">&#9632;</span>
              <span>Brand-Compliant Templates</span>
            </div>
            <div className="login-feature-item">
              <span className="feature-icon">&#9632;</span>
              <span>Campaign Collaboration Tools</span>
            </div>
            <div className="login-feature-item">
              <span className="feature-icon">&#9632;</span>
              <span>Real-time Workflow Tracking</span>
            </div>
          </div>
        </div>
        <div className="login-left-dots">
          {[...Array(12)].map((_, i) => (
            <span key={i} className={`dot dot-${i % 4}`} />
          ))}
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to IndiGo Creative Studio</p>
          </div>

          <form className="login-form" onSubmit={handleLogin} noValidate>
            <div className={`form-group ${errors.username ? 'has-error' : ''}`}>
              <label htmlFor="username">Username or Email</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>
              {errors.username && <span className="error-msg">{errors.username}</span>}
            </div>

            <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(p => !p)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="error-msg">{errors.password}</span>}
            </div>

            {apiError && <div className="api-error-msg">{apiError}</div>}

            <div className="form-options">
              <label className="remember-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <button type="button" className="forgot-link">Forgot password?</button>
            </div>

            <button type="submit" className={`login-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              {isLoading ? (
                <span className="spinner-wrap">
                  <span className="spinner" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="login-divider">
            <span>or</span>
          </div>

          <div className="login-signup">
            <p>Don't have an account?</p>
            <button type="button" className="signup-btn">Create Account</button>
          </div>
        </div>

        <p className="login-footer">
          &copy; {new Date().getFullYear()} IndiGo Creative Studio. All rights reserved.
        </p>
      </div>
    </div>
  );
}
