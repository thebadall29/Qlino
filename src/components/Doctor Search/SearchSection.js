import React from 'react';

const SearchSection = () => {
  return (
    <div className="custom-search-section">
      <div className="search-content-wrapper">
        <div className="search-header">
          <h1>Your home for health</h1>
          <h2>Find and Book</h2>
        </div>
        
        <div className="search-container">
          <div className="custom-search-bar">
            <div className="select-wrapper">
              <select className="custom-location-select">
                <option value="bangalore">Bangalore</option>
                <option value="mumbai">Mumbai</option>
                <option value="delhi">Delhi</option>
              </select>
              <i className="fas fa-chevron-down"></i>
            </div>
            <div className="search-input-wrapper">
              <i className="fas fa-search search-icon"></i>
              <input 
                type="text" 
                placeholder="Search doctors, clinics, hospitals, etc." 
                className="custom-search-input" 
              />
            </div>
            <button className="custom-search-button">
              <span>Search</span>
            </button>
          </div>
        </div>

        <div className="custom-popular-searches">
          <span className="popular-searches-label">Popular searches:</span>
          <div className="custom-search-tags-container">
            <button className="custom-search-tag">
              <i className="fas fa-user-md tag-icon"></i>
              Dermatologist
            </button>
            <button className="custom-search-tag">
              <i className="fas fa-baby tag-icon"></i>
              Pediatrician
            </button>
            <button className="custom-search-tag">
              <i className="fas fa-female tag-icon"></i>
              Gynecologist
            </button>
            <button className="custom-search-tag">
              <i className="fas fa-plus-circle tag-icon"></i>
              Other
            </button>
          </div>
        </div>

        <a href="#" className="all-specialties-link">
          View all specialties
          <i className="fas fa-arrow-right"></i>
        </a>

        <div className="custom-action-section">
          <div className="action-item">
            <div className="action-icon">
              <i className="fas fa-comments"></i>
            </div>
            <span>Consult with a doctor</span>
          </div>
         
          <div className="action-item">
            <div className="action-icon">
              <i className="fas fa-file-medical"></i>
            </div>
            <span>View medical records</span>
          </div>
          <div className="action-item">
            <div className="action-icon">
              <i className="fas fa-vial"></i>
            </div>
            <span>Book test</span>
          </div>
          <div className="action-item">
            <div className="action-icon">
              <i className="fas fa-book-open"></i>
            </div>
            <span>Read articles</span>
          </div>
          <div className="action-item">
            <div className="action-icon">
              <i className="fas fa-briefcase-medical"></i>
            </div>
            <span>For healthcare providers</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchSection;