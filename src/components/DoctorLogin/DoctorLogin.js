import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaUser, FaEnvelope, FaMobile, FaLock, FaStethoscope } from 'react-icons/fa';
import logo from '../../images/logo.png';

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    specialization: '',
    experience: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // SIMPLIFIED: Check for existing login only
  useEffect(() => {
    // Only check for existing login on component mount
    const existingToken = localStorage.getItem('token');
    const existingUser = JSON.parse(localStorage.getItem('user') || 'null');

    console.log('Current token:', existingToken);
    console.log('Token type:', typeof existingToken);
    console.log('Checking existing login:', { 
      hasToken: !!existingToken, 
      tokenLength: existingToken ? existingToken.length : 0,
      user: existingUser 
    });

    if (existingToken && existingUser && existingUser.role === 'doctor') {
      console.log('Found existing doctor login, redirecting to dashboard');
      navigate('/doctor-dashboard', { replace: true });
    }

    // Handle URL parameters from OAuth redirect (if any)
    const urlParams = new URLSearchParams(window.location.search);
    const oauthError = urlParams.get('error');
    const tokenFromUrl = urlParams.get('token');

    // Log any URL parameters
    console.log('URL Parameters:', {
      token: tokenFromUrl,
      error: oauthError,
      allParams: Object.fromEntries(urlParams.entries())
    });

    if (oauthError) {
      setError(decodeURIComponent(oauthError));
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Additional logging after any potential OAuth redirect
    console.log('Current authentication state:', {
      localStorage_token: localStorage.getItem('token'),
      localStorage_user: localStorage.getItem('user'),
      localStorage_userType: localStorage.getItem('userType')
    });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    // Check if passwords match for signup
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    try {
      if (isLogin) {
        // Handle login
        const response = await fetch('http://localhost:5000/api/auth/doctor-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        });

        const data = await response.json();
        console.log('Login response:', data);
        
        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }
        
        // Check if the response is the placeholder message
        if (data.message === 'Login endpoint') {
          throw new Error('Backend login functionality is not fully implemented yet');
        }
        
        // Add error checking for data structure
        if (!data.user) {
          throw new Error('Invalid response format from server');
        }
        
        // Check if the user is a doctor
        if (data.user.role !== 'doctor') {
          throw new Error('This login is for doctors only. Please use the appropriate login page.');
        }
        
        // Store token and user data in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userType', data.user.role);
        
        console.log('Manual login successful, data stored:', {
          token: data.token.substring(0, 20) + '...',
          user: data.user
        });
        
        setSuccess('Login successful! Redirecting to dashboard...');
        
        setTimeout(() => {
          navigate('/doctor-dashboard');
        }, 1500);
        
      } else {
        // Handle signup
        const response = await fetch('http://localhost:5000/api/auth/doctor-register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            role: 'doctor',
            firstName: formData.firstName,
            lastName: formData.lastName,
            mobile: formData.mobile,
            specialization: formData.specialization,
            experience: formData.experience
          }),
        });
        
        const data = await response.json();
        console.log('Registration response:', data);
        
        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }
        
        setSuccess('Registration successful! You can now log in.');
        
        // Reset form and switch to login view after successful registration
        setTimeout(() => {
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            mobile: '',
            specialization: '',
            experience: '',
            password: '',
            confirmPassword: ''
          });
          setIsLogin(true);
        }, 1500);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
  };

  const handleGoogleLogin = () => {
    console.log('Initiating Google OAuth login for doctor');
    
    // Clear existing auth data before starting OAuth
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    
    // Log state after clearing
    console.log('Cleared existing auth data. Current state:', {
      token: localStorage.getItem('token'),
      user: localStorage.getItem('user'),
      userType: localStorage.getItem('userType')
    });
    
    // Clear any existing error messages
    setError('');
    setSuccess('');
    
    // Store current URL for potential fallback
    sessionStorage.setItem('preOAuthUrl', window.location.href);
    
    // Add timestamp to URL to prevent caching
    const timestamp = new Date().getTime();
    const oauthUrl = `http://localhost:5000/api/auth/google/doctor?t=${timestamp}`;
    
    console.log('Redirecting to OAuth URL:', oauthUrl);
    
    // Redirect to Google OAuth
    window.location.href = oauthUrl;
  };

  return (
    <div className="patient-auth-container">
      <div className="auth-card">
        <div className="logo-container">
          <img src={logo} alt="Qlino Logo" className="auth-logo" />
        </div>
        
        <h2 className="auth-title">{isLogin ? 'Doctor Login' : 'Doctor Signup'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">
                    <FaUser className="input-icon" />
                    <span>First Name</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName">
                    <FaUser className="input-icon" />
                    <span>Last Name</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="mobile">
                    <FaMobile className="input-icon" />
                    <span>Mobile Number</span>
                  </label>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">
                    <FaEnvelope className="input-icon" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="specialization">
                    <FaStethoscope className="input-icon" />
                    <span>Specialization</span>
                  </label>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="Enter specialization"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="experience">
                    <FaUser className="input-icon" />
                    <span>Experience (years)</span>
                  </label>
                  <input
                    type="text"
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="Years of experience"
                    required
                  />
                </div>
              </div>
            </>
          )}
          
          {isLogin && (
            <div className="form-group">
              <label htmlFor="email">
                <FaEnvelope className="input-icon" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
          )}
          
          {isLogin ? (
            <div className="form-group">
              <label htmlFor="password">
                <FaLock className="input-icon" />
                <span>Password</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>
          ) : (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">
                  <FaLock className="input-icon" />
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <FaLock className="input-icon" />
                  <span>Confirm Password</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>
          )}
          
          {isLogin && (
            <div className="forgot-password">
              <a href="/forgot-password">Forgot Password?</a>
            </div>
          )}
          
          <button 
            type="submit" 
            className="auth-button" 
            disabled={isLoading}
          >
            {isLoading 
              ? (isLogin ? 'Logging in...' : 'Signing up...') 
              : (isLogin ? 'Login' : 'Sign Up')}
          </button>
          
          <div className="divider">
            <span>OR</span>
          </div>
          
          <button 
            type="button" 
            className="google-button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <FaGoogle className="google-icon" />
            {isLogin ? 'Login with Google' : 'Sign up with Google'}
          </button>
        </form>
        
        <div className="toggle-form">
          {isLogin ? (
            <p>Don't have an account? <button onClick={toggleForm}>Sign up</button></p>
          ) : (
            <p>Already have an account? <button onClick={toggleForm}>Log in</button></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;