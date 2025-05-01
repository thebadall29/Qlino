import React from 'react';

const MedicalRecord = () => {
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

        <button className="cta-button">
          View Your Medical Records
        </button>
      </div>
    </div>
  );
};

export default MedicalRecord;