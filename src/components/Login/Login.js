import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown, FaUserMd, FaUser } from 'react-icons/fa';
import './Login.scss';

const Login = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const loginOptions = [
    {
      title: 'Doctor Login',
      icon: <FaUserMd />,
      path: '/doctor-login',
      description: 'Login as a healthcare provider'
    },
    {
      title: 'Patient Login',
      icon: <FaUser />,
      path: '/patient-login',
      description: 'Login as a patient'
    }
  ];

  const handleOptionClick = (path) => {
    navigate(path);
    setIsDropdownOpen(false);
  };

  return (
    <div className="login-dropdown-container">
      <button 
        className={`login-dropdown-toggle ${isDropdownOpen ? 'active' : ''}`}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        Login
        <FaChevronDown className={`dropdown-arrow ${isDropdownOpen ? 'rotated' : ''}`} />
      </button>

      {isDropdownOpen && (
        <div className="login-dropdown-menu">
          {loginOptions.map((option, index) => (
            <button
              key={index}
              className="login-option"
              onClick={() => handleOptionClick(option.path)}
            >
              <span className="option-icon">{option.icon}</span>
              <div className="option-content">
                <span className="option-title">{option.title}</span>
                <span className="option-description">{option.description}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Login;