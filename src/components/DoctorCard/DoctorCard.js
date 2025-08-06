import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DoctorCard.scss';
import AppointmentManager from '../AppointmentManager/AppointmentManager';
import config from '../../config/config';

const colors = [
  '#FF6B6B', // coral red
  '#4ECDC4', // turquoise
  '#45B7D1', // sky blue
  '#96CEB4', // sage green
  '#FFEEAD', // cream yellow
  '#D4A5A5', // dusty rose
  '#9B6B9W', // lavender
  '#77A1D3', // periwinkle
];

const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const DoctorCard = ({ 
  doctor, 
  index, 
  doctorReviews, 
  reviewsLoading, 
  onViewProfile,
  reviewSliderRef 
}) => {
  const navigate = useNavigate();
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  const handleBookAppointment = (e) => {
    e.preventDefault();
    setShowAppointmentModal(true);
  };

  const handleCloseAppointmentModal = () => {
    setShowAppointmentModal(false);
  };

  return (
    <>
      <div className="doctor-profile" style={{ '--index': index }}>
        <div className="profile-header">
          <div className="profile-main">
            <div className="doctor-image">
              {doctor.photoUrl && doctor.photoUrl !== "" ? (
                <img 
                  src={`${config.API_URL}${doctor.photoUrl}`} 
                  alt={`${doctor.firstName} ${doctor.lastName}`} 
                  onError={(e) => {
                    e.target.src = '/default-doctor.png';
                  }}
                />
              ) : (
                <div className="name-avatar" style={{ backgroundColor: getAvatarColor(`${doctor.firstName} ${doctor.lastName}`) }}>
                  {doctor.firstName?.charAt(0)}{doctor.lastName?.charAt(0)}
                </div>
              )}
            </div>
            
            <div className="basic-details">
              <div className="doctor-name">
                <h3>{`Dr. ${doctor.firstName} ${doctor.lastName}`}</h3>
                <p className="specialty">{doctor.specialization}</p>
              </div>
              
              <div className="info-grid">
                {doctor.qualification && (
                  <div className="info-item">
                    <span className="label">Education</span>
                    <span className="value">{doctor.qualification}</span>
                  </div>
                )}
                
                {doctor.city && doctor.state && (
                  <div className="info-item">
                    <span className="label">Location</span>
                    <span className="value">{`${doctor.city}, ${doctor.state}`}</span>
                  </div>
                )}
                
                {doctor.experience && (
                  <div className="info-item">
                    <span className="label">Experience</span>
                    <span className="value">{doctor.experience} Years</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="cta-section">
            <button 
              className="book-appointment"
              onClick={handleBookAppointment}
            >
              Book Appointment
            </button>
            <button 
              className="view-profile"
              onClick={() => onViewProfile(doctor)}
            >
              View Full Profile
            </button>
          </div>
        </div>

        <div className="extended-info">
          {doctor.about && (
            <div className="about-section">
              <h4>About</h4>
              <p>{doctor.about}</p>
            </div>
          )}

          {(doctorReviews[doctor._id]?.reviews?.length > 0 || reviewsLoading[doctor._id]) && (
            <div className="reviews-section">
              <h4>Patient Reviews</h4>
              <div className="review-slider" ref={reviewSliderRef}>
                {reviewsLoading[doctor._id] ? (
                  <div className="reviews-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading reviews...</p>
                  </div>
                ) : doctorReviews[doctor._id]?.reviews?.length > 0 ? (
                  <>
                    {doctorReviews[doctor._id].reviews.map((review, index) => (
                      <div key={index} className="review-card">
                        <div className="review-header">
                          <div className="rating">
                            <span className="stars">{'★'.repeat(review.rating)}</span>
                            <span className="rating-text">({review.rating}/5)</span>
                          </div>
                          <span className="date">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="review-text">{review.comment}</p>
                        <div className="reviewer">
                          - {review.patientName}
                        </div>
                      </div>
                    ))}
                  </>
                ) : null}
              </div>
              {doctorReviews[doctor._id]?.averageRating && (
                <div className="average-rating">
                  <span>Average Rating: </span>
                  <span className="stars">
                    {'★'.repeat(Math.round(Number(doctorReviews[doctor._id].averageRating)))}
                  </span>
                  <span className="rating-text">
                    ({typeof doctorReviews[doctor._id].averageRating === 'number' 
                      ? doctorReviews[doctor._id].averageRating.toFixed(1) 
                      : Number(doctorReviews[doctor._id].averageRating).toFixed(1)
                    }/5)
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showAppointmentModal && (
        <div className="modal-overlay" onClick={handleCloseAppointmentModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Book Appointment</h2>
              <button className="close-button" onClick={handleCloseAppointmentModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <AppointmentManager doctorId={doctor._id}  onBookingSuccess={() => {
                handleCloseAppointmentModal();
                // You can add additional success handling here
              }}/>
          </div>
        </div>
      )}
    </>
  );
};

export default DoctorCard;