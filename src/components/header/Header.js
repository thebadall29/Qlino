import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

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
          <Link to="/contact">Appointments</Link>
          <Link to="/updates">Medical Records</Link>
          <Link to="/login" className="login-btn">
            <i className="fas fa-user"></i>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;