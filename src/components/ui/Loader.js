import React from 'react';
import './Loader.scss'; // We'll create this SCSS file next

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader-spinner"></div>
      <p>Loading data, please wait...</p>
    </div>
  );
};

export default Loader;