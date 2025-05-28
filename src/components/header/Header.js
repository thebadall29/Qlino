import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // Function to check login status
  const getLoginStatus = () => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');

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

    console.log('Login Status:', { isLoggedIn, userType });

    if (isLoggedIn) {
      setShowDropdown(false);
      if (userType === 'doctor') {
        navigate('/doctor-dashboard');
      } else if (userType === 'patient') {
        navigate('/patient-dashboard');
      }
    } else {
      setShowDropdown(!showDropdown);
    }
  };

  // New function to handle medical records click
  const handleMedicalRecordsClick = (e) => {
    e.preventDefault(); // Prevent default navigation
    const { isLoggedIn, userType } = getLoginStatus();

    if (isLoggedIn && userType === 'patient') {
      navigate('/medical-records');
    } else {
      // Show alert and redirect to patient login
      navigate('/patient-login');
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
          {/* Replace Link with a button styled as a link */}
          <button 
            onClick={handleMedicalRecordsClick}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              font: 'inherit',
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'none'
            }}
          >
            Medical Records
          </button>
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