import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUser } from 'react-icons/fa';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Prevent body scroll when menu is open
    document.body.style.overflow = !isMenuOpen ? 'hidden' : 'auto';
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="logo-section">
          <Link to="/" className="logo-text">
            Qlino
          </Link>
        </div>

        <button 
          className={`mobile-menu-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <nav className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          {token && (
            <div className="profile-section mobile">
              <div className="profile-info">
                <FaUser />
                <span>{user?.name || 'User'}</span>
              </div>
            </div>
          )}
          <Link to="/">Home</Link>
          <Link to="/find-doctors">Find Doctors</Link>
          <Link to="/appointments">Appointments</Link>
          <Link to="/medical-records">Medical Records</Link>
          {token && <Link to="/profile">My Profile</Link>}
          {token && <Link to="/settings">Settings</Link>}
          {!token && <Link to="/login" className="mobile-login">Login</Link>}
        </nav>

        {token && (
          <div className="profile-section desktop">
            <Link to="/profile" className="profile-link">
              <FaUser />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;