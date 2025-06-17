import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

    const handleClickOutside = (event) => {
      if (!event.target.closest('.login-dropdown-container')) {
        setShowDropdown(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    document.addEventListener('click', handleClickOutside);

    // Prevent body scroll when mobile menu is open
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [scrolled, mobileMenuOpen]);

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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setShowDropdown(false); // Close login dropdown when opening mobile menu
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleNavLinkClick = () => {
    setMobileMenuOpen(false);
    setShowDropdown(false);
  };

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <nav className="nav-container">
          <div className="logo-section">
            <Link to="/" className="logo-text" onClick={handleNavLinkClick}>
              Qlino
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Navigation Links */}
          <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
            <Link to="/" onClick={handleNavLinkClick}>Home</Link>
            <Link to="/find-your-doctor" onClick={handleNavLinkClick}>Find Doctors</Link>
            <Link to="/appointments" onClick={handleNavLinkClick}>Appointments</Link>
            <Link to="/medical-records" onClick={handleNavLinkClick}>Medical Records</Link>
            
            <div className="login-dropdown-container">
              <button className="login-btn" onClick={handleLoginIconClick}>
                <i className="fas fa-user"></i>
              </button>
              {showDropdown && (
                <div className="login-dropdown">
                  <Link 
                    to="/doctor-login" 
                    className="dropdown-item" 
                    onClick={() => {
                      setShowDropdown(false);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <i className="fas fa-user-md"></i> Doctor Login
                  </Link>
                  <Link 
                    to="/patient-login" 
                    className="dropdown-item" 
                    onClick={() => {
                      setShowDropdown(false);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <i className="fas fa-user-injured"></i> Patient Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>}
    </>
  );
};

export default Header;