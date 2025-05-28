import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import '@fortawesome/fontawesome-free/css/all.min.css';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  // Function to check login status (you'll need to implement this based on your auth logic)
  const getLoginStatus = () => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType'); // 'doctor' or 'patient'

    if (token && userType) {
      return { isLoggedIn: true, userType };
    }
    return { isLoggedIn: false, userType: null };
  };

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);

    const handleClickOutside = (event) => {
      if (!event.target.closest('.login-dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [scrolled]);

  const handleLoginIconClick = (e) => {
    e.stopPropagation();
    const { isLoggedIn, userType } = getLoginStatus();

    // Add this console.log for debugging:
    console.log('Login Status:', { isLoggedIn, userType });

    if (isLoggedIn) {
      setShowDropdown(false); // Ensure dropdown is hidden before navigating
      if (userType === 'doctor') {
        navigate('/doctor-dashboard');
      } else if (userType === 'patient') {
        navigate('/patient-dashboard');
      }
    } else {
      setShowDropdown(!showDropdown); // Only toggle dropdown if not logged in
    }
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <nav className="nav-container">
        <div className="logo-section">
          <Link to="/" className="logo-text">
            Qlino
          </Link>
        </div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/find-your-doctor">Find Doctors</Link>
          <Link to="/appointments">Appointments</Link>
          <Link to="/medical-records">Medical Records</Link>
          <div className="login-dropdown-container">
            <button className="login-btn" onClick={handleLoginIconClick}>
              <i className="fas fa-user"></i>
            </button>
            {showDropdown && (
              <div className="login-dropdown">
                <Link to="/doctor-login" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                  <i className="fas fa-user-md"></i> Doctor Login
                </Link>
                <Link to="/patient-login" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                  <i className="fas fa-user-injured"></i> Patient Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;