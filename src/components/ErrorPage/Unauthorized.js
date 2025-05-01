import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="unauthorized-page">
      <div className="container">
        <div className="unauthorized-content text-center">
          <h1>Unauthorized Access</h1>
          <p>You don't have permission to access this page.</p>
          <div className="action-buttons">
            <Link to="/" className="btn btn-primary">Go to Homepage</Link>
            <Link to="/patient-login" className="btn btn-outline-primary ms-3">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;