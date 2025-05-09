import React, { useEffect, useState } from 'react';
import './SearchProfile.scss';

const SearchProfile = ({ doctor, resultCount, index }) => {
  // Add this for debugging
  useEffect(() => {
    console.log("SearchProfile received doctor:", doctor);
  }, [doctor]);

  // Enhanced error handling for different data formats
  if (!doctor) {
    console.log("No doctor data provided to SearchProfile");
    return (
      <div className="doctor-profile">
        <div className="doctor-profile-content">
          <div className="doctor-profile-right">
            <div className="doctor-header">
              <h3 className="doctor-name">No results found</h3>
              <p className="doctor-specialization">Try adjusting your search criteria</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle case where doctor might be an array with one item
  const doctorData = Array.isArray(doctor) ? doctor[0] : doctor;

  // Add another safety check to make sure doctorData is a valid object
  if (!doctorData || typeof doctorData !== 'object') {
    console.log("Invalid doctor data format:", doctorData);
    return (
      <div className="doctor-profile">
        <div className="doctor-profile-content">
          <div className="doctor-profile-right">
            <div className="doctor-header">
              <h3 className="doctor-name">Invalid data format</h3>
              <p className="doctor-specialization">Please try again</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Generate dynamic title based on specialization and doctor name
  const generateTitle = () => {
    const name = doctorData.name || 'Doctor';
    const specialization = doctorData.specialization || 'General Practitioner';
    
    return `Dr. ${name} - ${specialization}`;
  };

  // Generate random color for avatar based on doctor name
  const generateAvatarColor = () => {
    if (!doctorData.name) return '#4a69bd'; // Default blue
    
    const colors = [
      '#4a69bd', '#6a89cc', '#1e3799', '#0c2461', // Blues
      '#82ccdd', '#60a3bc', '#3c6382', '#0a3d62', // Light Blues
      '#b8e994', '#78e08f', '#38ada9', '#079992', // Greens
      '#f6b93b', '#e58e26', '#fa983a', '#e58e26', // Oranges
      '#cf6a87', '#c44569', '#9b59b6', '#8e44ad'  // Purples
    ];
    
    // Use the first character of the name to select a color
    const charCode = doctorData.name.charCodeAt(0);
    const colorIndex = charCode % colors.length;
    
    return colors[colorIndex];
  };

  const avatarColor = generateAvatarColor();
  const title = generateTitle();

  return (
    <div className="doctor-profile">
      {/* Section title for the first profile only */}
      {index === 0 && (
        <div className="profile-section-header">
          <h1 className="section-title">Doctor Profiles</h1>
          <div className="result-count">
            <span>{resultCount} {resultCount === 1 ? 'doctor' : 'doctors'} found</span>
          </div>
        </div>
      )}
      
      <div className="profile-title">
        <h2>{title}</h2>
      </div>
      
      <div className="doctor-profile-content">
        <div className="doctor-profile-left">
          <div className="doctor-avatar" style={{ backgroundColor: avatarColor }}>
            {doctorData.name ? doctorData.name.charAt(0) : 'D'}
          </div>
          
          <div className="doctor-rating">
            <div className="stars">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star-half-alt"></i>
            </div>
            <span className="rating-value">4.5</span>
            <span className="review-count">(120 reviews)</span>
          </div>
        </div>
        
        <div className="doctor-profile-right">
          <div className="doctor-header">
            <div className="name-and-badge">
              <h3 className="doctor-name">{doctorData.name || 'Unknown Doctor'}</h3>
              {doctorData.verified && (
                <span className="verified-badge">
                  <i className="fas fa-check-circle"></i> Verified
                </span>
              )}
            </div>
            <p className="doctor-specialization">{doctorData.specialization || 'General Practitioner'}</p>
            <p className="doctor-location">
              <i className="fas fa-map-marker-alt"></i> {doctorData.location || 'Location not available'}
            </p>
            <div className="doctor-experience">
              <span><i className="fas fa-user-md"></i> {doctorData.experience || '15'} years experience</span>
            </div>
          </div>
          
          <div className="doctor-details">
            <div className="doctor-section">
              <h4><i className="fas fa-graduation-cap"></i> Qualification</h4>
              <p>{doctorData.qualification || 'MBBS'}</p>
            </div>
            
            <div className="doctor-section">
              <h4><i className="fas fa-stethoscope"></i> Services</h4>
              <ul className="services-list">
                <li>
                  <span className="service-dot"></span>
                  General Consultation
                </li>
                {doctorData.services && Array.isArray(doctorData.services) && doctorData.services.map((service, index) => (
                  <li key={index}>
                    <span className="service-dot"></span>
                    {service}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="doctor-section">
              <h4><i className="fas fa-rupee-sign"></i> Consultation Fee</h4>
              <p className="fee">₹{doctorData.consultationFee || '500'}</p>
              <div className="action-buttons">
                <button className="book-appointment-btn">
                  <i className="far fa-calendar-check"></i> Book Appointment
                </button>
                <button className="contact-btn">
                  <i className="fas fa-phone-alt"></i> Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchProfile;