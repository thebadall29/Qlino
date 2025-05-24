import React, { useEffect, useState } from 'react';
import './SearchProfile.scss';
import DoctorProfileModel from '../DoctorProfileModel/DoctorProfileModel';

const SearchProfile = ({ doctor, resultCount, index }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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

  // Format working days for display
  const formatWorkingDays = (workingDays) => {
    if (!workingDays) return 'Not specified';
    
    const daysMap = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun'
    };
    
    const availableDays = Object.entries(workingDays)
      .filter(([_, day]) => day && day.available)
      .map(([day, _]) => daysMap[day] || day);
    
    return availableDays.length > 0 ? availableDays.join(', ') : 'Not specified';
  };

  // Format treatments for display
  const formatTreatments = (treatments) => {
    if (!treatments || !Array.isArray(treatments) || treatments.length === 0) {
      return ['General Consultation'];
    }
    
    return treatments.map(treatment => treatment.name || 'General Consultation');
  };

  const avatarColor = generateAvatarColor();
  const title = generateTitle();
  const availableDays = doctorData.workingDays ? formatWorkingDays(doctorData.workingDays) : 'Not specified';
  const services = formatTreatments(doctorData.treatments);

  // Open/close modal handlers
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Enrich the doctor data with avatar color for the modal
  const enrichedDoctorData = {
    ...doctorData,
    avatarColor: avatarColor
  };


  return (
    <div className="doctor-profile">
      {index === 0 && (
        <div className="profile-section-header">
          <h1 className="section-title">Doctor Profiles</h1>
          <div className="result-count">
            <span>{resultCount} {resultCount === 1 ? 'doctor' : 'doctors'} found</span>
          </div>
        </div>
      )}
      
      <div className="profile-title">
        <h2>Dr. {doctorData.name} - {doctorData.specialization}</h2>
      </div>
      
      <div className="doctor-profile-content">
        <div className="doctor-profile-left">
          <div className="doctor-avatar" style={{ backgroundColor: generateAvatarColor() }}>
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
          
          <div className="doctor-contact-info">
            <h4><i className="fas fa-phone-alt"></i> Contact</h4>
            <p><strong>Mobile:</strong> {doctorData.mobile}</p>
            {/* <p><strong>Emergency:</strong> {doctorData.emergency}</p> */}
            <p><strong>Email:</strong> {doctorData.email}</p>
          </div>
        </div>
        
        <div className="doctor-profile-right">
          <div className="doctor-header">
            <div className="name-and-badge">
              <h3 className="doctor-name">{doctorData.name}</h3>
              {doctorData.verified && (
                <span className="verified-badge">
                  <i className="fas fa-check-circle"></i> Verified
                </span>
              )}
            </div>
            <p className="doctor-specialization">{doctorData.specialization}</p>
            <p className="doctor-location">
              <i className="fas fa-map-marker-alt"></i> {doctorData.address}, {doctorData.city}, {doctorData.state}, {doctorData.country}
            </p>
            <div className="doctor-experience">
              <span><i className="fas fa-user-md"></i> {doctorData.experience} years experience</span>
            </div>
          </div>
          
          <div className="doctor-details">
            <div className="doctor-section">
              <h4><i className="fas fa-stethoscope"></i> Services</h4>
              <ul className="services-list">
                {doctorData.treatments && doctorData.treatments.length > 0 ? 
                  doctorData.treatments.map((treatment, idx) => (
                    <li key={idx}>
                      <span className="service-dot"></span>
                      {treatment.name}
                    </li>
                  )) : 
                  <li><span className="service-dot"></span>General Consultation</li>
                }
              </ul>
            </div>
            
            <div className="doctor-section">
              <h4><i className="fas fa-rupee-sign"></i> Consultation Fee</h4>
              <p className="fee">₹{doctorData.treatments && doctorData.treatments[0] ? doctorData.treatments[0].fee : '700'}</p>
            </div>
            
            <div className="doctor-section about-section">
              <h4><i className="fas fa-info-circle"></i> About</h4>
              <p>{doctorData.about || 'No information available'}</p>
            </div>
            
            <div className="action-buttons-container">
              <div className="action-buttons">
                <button className="book-appointment-btn">
                  <i className="far fa-calendar-check"></i> Book Appointment
                </button>
                <button className="contact-btn" onClick={() => setIsModalOpen(true)}>
                  <i className="fas fa-user-alt"></i> View Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {isModalOpen && (
        <DoctorProfileModel 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          doctor={{...doctorData, avatarColor: generateAvatarColor()}} 
        />
      )}
    </div>
  );
};

export default SearchProfile;