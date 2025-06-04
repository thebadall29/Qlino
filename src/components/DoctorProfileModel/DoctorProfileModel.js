import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './DoctorProfileModel.scss';
import AppointmentManager from '../AppointmentManager/AppointmentManager';
import DoctorReview from '../DoctorReview/DoctorReview';

const DoctorProfileModel = ({ doctor, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [doctorData, setDoctorData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const FALLBACK_IMAGE = 'https://placehold.co/300x200/e2e8f0/64748b?text=No+Image';
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingFormData, setBookingFormData] = useState({
    name: '',
    email: '',
    phone: '',
    reason: ''
  });

  console.log("DoctorProfileModel received doctor:", doctor);

  useEffect(() => {
    if (isOpen && doctor && doctor.id) {
      fetchDoctorData(doctor.id);
      
    }
  }, [isOpen, doctor]);

  useEffect(() => {
    // Fetch available slots when date changes
    if (doctorData && doctorData.bookingPreference === 'slot' && selectedDate) {
      fetchAvailableSlots(doctorData.id, selectedDate);
    }
  }, [selectedDate, doctorData]);

  const fetchDoctorData = async (doctorId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/doctor/${doctorId}/data`);
   const photosResponse = await fetch(`http://localhost:5000/api/doctor/photos/${doctorId}`);
      
   if (photosResponse.ok) {
      const photosData = await photosResponse.json();
      if (photosData.success && Array.isArray(photosData.photos)) {
        setPhotos(photosData.photos);
      }}

   if (!response.ok) {
        throw new Error('Failed to fetch doctor data');
      }

      const data = await response.json();
      setDoctorData(data);

      // Set reviews if available in the API response
      if (data.reviews && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      }

      // Set appointments if available in the API response
      if (data.appointments && Array.isArray(data.appointments)) {
        setAppointments(data.appointments);
      } else {
        // Fallback to default appointments if not available in API
        setAppointments([
          { id: 101, date: '2023-11-20', time: '10:00 AM', status: 'Available' },
          { id: 102, date: '2023-11-20', time: '11:00 AM', status: 'Booked' },
          { id: 103, date: '2023-11-20', time: '12:00 PM', status: 'Available' },
          { id: 104, date: '2023-11-21', time: '09:00 AM', status: 'Available' },
          { id: 105, date: '2023-11-21', time: '10:00 AM', status: 'Available' }
        ]);
      }

      // Set photos if available in the API response
      if (data.photos && Array.isArray(data.photos)) {
        setPhotos(data.photos);
      } else {
        // Fallback to default photos if not available in API
        setPhotos([
          { id: 201, url: 'https://via.placeholder.com/300x200?text=Clinic+Photo', caption: 'Clinic Entrance' },
          { id: 202, url: 'https://via.placeholder.com/300x200?text=Doctor+Photo', caption: 'With Patients' },
          { id: 203, url: 'https://via.placeholder.com/300x200?text=Certificate', caption: 'Medical Certificate' }
        ]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    try {
      const response = await fetch(`http://localhost:5000/api/doctor/${doctorId}/slots?date=${date}`);

      if (!response.ok) {
        throw new Error('Failed to fetch available slots');
      }

      const data = await response.json();
      setAppointments(data.slots || []);
    } catch (error) {
      console.error('Error fetching available slots:', error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (userRating === 0) {
      alert('Please select a rating');
      return;
    }

    // Add the new review to the list (in a real app, you'd send this to an API)
    const newReview = {
      id: reviews.length + 1,
      patientName: 'You', // In a real app, this would be the logged-in user's name
      rating: userRating,
      comment: userReview,
      date: new Date().toISOString().split('T')[0]
    };

    setReviews([newReview, ...reviews]);
    setUserRating(0);
    setUserReview('');
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const handleBookingFormChange = (e) => {
    const { name, value } = e.target;
    setBookingFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    try {
      // Get user data from localStorage if available
      const userData = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

      // Prepare booking data
      const bookingData = {
        doctorId: doctorData.id,
        date: selectedDate,
        time: selectedSlot.time,
        patientName: userData?.firstName ? `${userData.firstName} ${userData.lastName}` : bookingFormData.name,
        patientEmail: userData?.email || bookingFormData.email,
        contactNumber: userData?.mobile || bookingFormData.phone,
        reason: bookingFormData.reason
      };

      // Make API call to book appointment
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userData ? `Bearer ${localStorage.getItem('token')}` : undefined
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        throw new Error('Failed to book appointment');
      }

      // Update UI to show the slot as booked
      setAppointments(appointments.map(app =>
        app.id === selectedSlot.id ? { ...app, status: 'Booked' } : app
      ));

      // Close modal and reset form
      setShowBookingModal(false);
      setSelectedSlot(null);
      setBookingFormData({
        name: '',
        email: '',
        phone: '',
        reason: ''
      });

      alert('Appointment booked successfully!');
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    }
  };

  const handleJoinQueue = async () => {
    try {
      // Get user data from localStorage if available
      const userData = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

      if (!userData) {
        alert('Please log in to join the queue');
        return;
      }

      // Prepare queue data
      const queueData = {
        doctorId: doctorData.id,
        patientName: `${userData.firstName} ${userData.lastName}`,
        patientEmail: userData.email,
        contactNumber: userData.mobile,
        reason: 'General consultation'
      };

      // Make API call to join queue
      const response = await fetch('http://localhost:5000/api/doctor/queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(queueData)
      });

      if (!response.ok) {
        throw new Error('Failed to join queue');
      }

      alert('You have been added to the queue!');
    } catch (error) {
      console.error('Error joining queue:', error);
      alert('Failed to join queue. Please try again.');
    }
  };

  if (!isOpen || !doctor) return null;

  // Use merged data from props and API response
  const displayDoctor = doctorData || doctor;

  console.log("photos", photos)

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="dpm-modal-content" onClick={e => e.stopPropagation()}>
        <div className="dpm-header">
          <h2>Doctor Profile: {displayDoctor.name}</h2>
          <button className="dpm-close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="dpm-modal-tabs">
          <button
            className={`dpm-tab-button ${activeTab === 'profile' ? 'dpm-active' : ''}`}
            onClick={() => handleTabChange('profile')}
          >
            <i className="fas fa-user"></i> Profile
          </button>
          <button
            className={`dpm-tab-button ${activeTab === 'appointments' ? 'dpm-active' : ''}`}
            onClick={() => handleTabChange('appointments')}
          >
            <i className="far fa-calendar-check"></i> Appointments
          </button>
          <button
            className={`dpm-tab-button ${activeTab === 'reviews' ? 'dpm-active' : ''}`}
            onClick={() => handleTabChange('reviews')}
          >
            <i className="fas fa-star"></i> Reviews
          </button>
          <button
            className={`dpm-tab-button ${activeTab === 'photos' ? 'dpm-active' : ''}`}
            onClick={() => handleTabChange('photos')}
          >
            <i className="fas fa-images"></i> Photos
          </button>
        </div>

        <div className="dpm-content">
          {loading ? (
            <div className="dpm-loading">
              <p>Loading doctor information...</p>
            </div>
          ) : (
            <>
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="dpm-profile-tab">
                  <div className="dpm-profile-header">
  <div className="dpm-profile-image">
    {displayDoctor.photoUrl ? (
      <img
        src={`http://localhost:5000${displayDoctor.photoUrl}`}
        alt={`Dr. ${displayDoctor.name}`}
        onError={(e) => {
          // If image fails to load, show avatar fallback
          const parent = e.target.parentElement;
          parent.innerHTML = `
            <div class="dpm-profile-avatar" style="background-color: ${displayDoctor.avatarColor || '#3c6382'}">
              ${displayDoctor.firstName ? displayDoctor.firstName.charAt(0).toUpperCase() : 'D'}
            </div>`;
        }}
      />
    ) : (
      <div className="dpm-profile-avatar" style={{ backgroundColor: displayDoctor.avatarColor || '#3c6382' }}>
        {displayDoctor.firstName ? displayDoctor.firstName.charAt(0).toUpperCase() : 'D'}
      </div>
    )}
  </div>
  <div className="dpm-profile-info">
    <h3>{displayDoctor.name}</h3>
    <p className="dpm-specialization">{displayDoctor.specialization || 'General Practitioner'}</p>
    <p className="dpm-location">
      <i className="fas fa-map-marker-alt"></i> {displayDoctor.address}, {displayDoctor.city}, {displayDoctor.state}
    </p>
    <p className="dpm-experience">
      <i className="fas fa-user-md"></i> {displayDoctor.experience || '15'} years experience
    </p>
  </div>
</div>

                  <div className="dpm-profile-details">
                    <div className="dpm-detail-section">
                      <h4>Personal Information</h4>
                      <div className="dpm-detail-grid">
                        <div className="dpm-detail-item">
                          <span className="dpm-label">Full Name:</span>
                          <span className="dpm-value">Dr. {displayDoctor.name}</span>
                        </div>
                        <div className="dpm-detail-item">
                          <span className="dpm-label">Specialization:</span>
                          <span className="dpm-value">{displayDoctor.specialization || 'General Practitioner'}</span>
                        </div>
                        <div className="dpm-detail-item">
                          <span className="dpm-label">Experience:</span>
                          <span className="dpm-value">{displayDoctor.experience || '15'} years</span>
                        </div>
                        <div className="dpm-detail-item">
                          <span className="dpm-label">Languages:</span>
                          <span className="dpm-value">{displayDoctor.languages || 'English, Hindi'}</span>
                        </div>
                        <div className="dpm-detail-item">
                          <span className="dpm-label">Qualification:</span>
                          <span className="dpm-value">{displayDoctor.qualification || 'MBBS'}</span>
                        </div>
                        <div className="dpm-detail-item">
                          <span className="dpm-label">Registration No:</span>
                          <span className="dpm-value">{displayDoctor.registrationNumber || 'MCI-12345'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="dpm-detail-section">
                      <h4>Services Offered</h4>
                      <ul className="dpm-services-list">
                        {displayDoctor.treatments && Array.isArray(displayDoctor.treatments) ?
                          displayDoctor.treatments.map((treatment, index) => (
                            <li key={index}><i className="fas fa-check-circle"></i> {treatment.name}</li>
                          )) :
                          <li><i className="fas fa-check-circle"></i> General Consultation</li>
                        }
                      </ul>
                    </div>

                    <div className="dpm-detail-section">
                      <h4>Consultation Details</h4>
                      <div className="dpm-detail-grid">
                        <div className="dpm-detail-item">
                          <span className="dpm-label">Consultation Fee:</span>
                          <span className="dpm-value">₹{displayDoctor.treatments && displayDoctor.treatments[0] ? displayDoctor.treatments[0].fee : '700'}</span>
                        </div>
                        <div className="dpm-detail-item">
                          <span className="dpm-label">Consultation Time:</span>
                          <span className="dpm-value">{displayDoctor.consultationTime || '15-20 minutes'}</span>
                        </div>
                      
                        <div className="dpm-detail-item">
                          <span className="dpm-label">Days & Timings:</span>
                          <span className="dpm-value dpm-timings-value">
                            {displayDoctor.workingDays ?
                              Object.entries(displayDoctor.workingDays)
                                .filter(([_, day]) => day && day.active)
                                .map(([day, dayData]) => (
                                  <div key={day} className="dpm-timing-day">
                                    <span className="dpm-day-name">{day.charAt(0).toUpperCase() + day.slice(1)}:</span>
                                    <span className="dpm-time-range">{dayData.startTime} - {dayData.endTime}</span>
                                  </div>
                                )) :
                              <div className="dpm-timing-day">
                                <span className="dpm-day-name">Default:</span>
                                <span className="dpm-time-range">10:00 AM - 2:00 PM</span>
                              </div>
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="dpm-detail-section">
                      <h4>About</h4>
                      <p className="dpm-about-text">
                        {displayDoctor.about || `Dr. ${displayDoctor.name} is a highly skilled ${displayDoctor.specialization || 'General Practitioner'} with ${displayDoctor.experience || '15'} years of experience. Specializing in providing comprehensive healthcare services with a patient-centered approach.`}
                      </p>
                    </div>

                    <div className="dpm-action-buttons">
                      <button className="dpm-book-button">
                        <i className="far fa-calendar-check"></i> Book Appointment
                      </button>
                      <button className="dpm-contact-button">
                        <i className="fas fa-phone-alt"></i> Contact
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Appointments Tab */}
              {/* {activeTab === 'appointments' && (
                <div className="dpm-appointments-tab">
                  <h3>Available Appointments</h3>

                  <div className="dpm-date-selector">
                    <label htmlFor="appointment-date">Select Date:</label>
                    <input
                      type="date"
                      id="appointment-date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="dpm-date-input"
                    />
                  </div>

                  {displayDoctor.bookingPreference === 'queue' ? (
                    <div className="dpm-queue-booking">
                      <div className="dpm-queue-info">
                        <p>This doctor uses a queue-based appointment system.</p>
                        <p>Current queue length: {Math.floor(Math.random() * 10)} patients</p>
                        <p>Estimated waiting time: {Math.floor(Math.random() * 60) + 15} minutes</p>
                      </div>

                      <button
                        className="dpm-join-queue-button"
                        onClick={handleJoinQueue}
                      >
                        Join Queue
                      </button>
                    </div>
                  ) : (
                    <div className="dpm-appointments-grid">
                      {appointments.length > 0 ? (
                        appointments.map((appointment, index) => (
                          <div key={index} className="dpm-appointment-card">
                            <div className="dpm-appointment-date">
                              <i className="far fa-calendar"></i> {appointment.date || selectedDate}
                            </div>
                            <div className="dpm-appointment-time">
                              <i className="far fa-clock"></i> {appointment.time}
                            </div>
                            <div className="dpm-appointment-status">
                              <i className={`${appointment.status === 'Available' ? 'fas fa-check-circle' : 'fas fa-times-circle'}`}></i>
                              <span className={appointment.status.toLowerCase()}>
                                {appointment.status === 'Available' ? 'Available' : 'Booked'}
                              </span>
                            </div>
                            {appointment.status === 'Available' && (
                              <button
                                className="dpm-book-slot-button"
                                onClick={() => handleSelectSlot(appointment)}
                              >
                                Book Appointment
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="dpm-no-appointments">No available slots for this date.</p>
                      )}
                    </div>
                  )}
                </div>
              )} */}

              {activeTab === 'appointments' && (
                <AppointmentManager doctorId={displayDoctor.id || displayDoctor._id} />
              )}


              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
    <DoctorReview 
      doctorId={displayDoctor.id || displayDoctor._id} 
      reviews={reviews} 
      setReviews={setReviews} 
    />
  )}
              {/* Photos Tab */}
{activeTab === 'photos' && (
  <div className="dpm-photos-tab">
    <h3>Photos</h3>
    <div className="dpm-photos-grid">
      {photos && photos.length > 0 ? (
        photos.map(photo => (
          <div key={photo._id || photo.id} className="dpm-photo-card">
            <img 
              src={`http://localhost:5000${photo.imageUrl}`} 
              alt={photo.title || photo.caption || 'Doctor photo'} 
              onError={(e) => {
                if (e.target.src !== FALLBACK_IMAGE) {
                  e.target.src = FALLBACK_IMAGE;
                }
              }}
            />
            <div className="dpm-photo-caption">
              <h4>{photo.title || photo.caption || 'Untitled'}</h4>
              {photo.description && (
                <p className="dpm-photo-description">{photo.description}</p>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="dpm-no-photos">No photos available</p>
      )}
    </div>
  </div>
)}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DoctorProfileModel;
