import React from 'react';
import { useNavigate } from 'react-router-dom';
const MedicalRecord = () => {
  const navigate = useNavigate();
  
    const handleAddMedicalRecords = () => {
      // Check if user is logged in by looking for token
      const token = localStorage.getItem('token');
      
      if (!token) {
        // If no token, redirect to login
        navigate('/patient-dashboard', { 
          state: { 
            from: window.location.pathname,
            message: 'Please login to add medicines' 
          } 
        });
      } else {
        // If logged in, go to medicines page
        navigate('/patient-login');
      }
    };
  return (
    <div className="medical-record-intro">
      <div className="intro-container">
        <h1 className="intro-title">
          Secure Medical Records
          <span className="highlight">Always Accessible</span>
        </h1>
        
        <p className="intro-description">
          We securely store all your medical reports, test results, and health documents 
          in one place, accessible anytime from our app.
        </p>

        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">📁</div>
            <div className="feature-text">Centralized document storage</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔒</div>
            <div className="feature-text">Bank-level encryption</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <div className="feature-text">Instant access to records</div>
          </div>
        </div>

        <button className="cta-button" onClick={handleAddMedicalRecords}>
          View Your Medical Records
        </button>
      </div>
    </div>
  );
};

export default MedicalRecord;