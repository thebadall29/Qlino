import React, { useState, useEffect } from 'react';
import '../PatientDashboard.scss';
import SearchBox from '../../SearchBox/SearchBox';
const AppointmentManager = () => {
  // State for doctors list and search functionality
  const [allDoctors, setAllDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    name: '',
    location: '',
    specialization: ''
  });
  
  // State for appointments
  const [appointments, setAppointments] = useState([]);
  const [queuePositions, setQueuePositions] = useState([]);
  
  // State for booking form
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    reason: ''
  });
  
  // State for available slots
  const [availableSlots, setAvailableSlots] = useState([]);
  
  // Fetch doctors on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No authentication token found');
          return;
        }
        
        const response = await fetch('http://localhost:5000/api/patient/doctors', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch doctors: ${response.status}`);
        }
        
        const data = await response.json();
        setAllDoctors(data.doctors);
        setFilteredDoctors(data.doctors);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No authentication token found');
          return;
        }
        
        const response = await fetch('http://localhost:5000/api/patient/appointments', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch appointments: ${response.status}`);
        }
        
        const data = await response.json();
        setAppointments(data.appointments || []);
        setQueuePositions(data.queuePositions || []);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };
    
    fetchDoctors();
    fetchAppointments();
  }, []);
  
  // Handle search input changes
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Filter doctors based on search parameters
  const handleSearch = (e) => {
    e.preventDefault();
    
    const filtered = allDoctors.filter(doctor => {
      const nameMatch = doctor.firstName.toLowerCase().includes(searchParams.name.toLowerCase()) || 
                        doctor.lastName.toLowerCase().includes(searchParams.name.toLowerCase());
      const locationMatch = !searchParams.location || 
                           (doctor.city && doctor.city.toLowerCase().includes(searchParams.location.toLowerCase()));
      const specializationMatch = !searchParams.specialization || 
                                 (doctor.specialization && doctor.specialization.toLowerCase().includes(searchParams.specialization.toLowerCase()));
      
      return nameMatch && locationMatch && specializationMatch;
    });
    
    setFilteredDoctors(filtered);
  };
  
  // Reset search filters
  const handleResetSearch = () => {
    setSearchParams({
      name: '',
      location: '',
      specialization: ''
    });
    setFilteredDoctors(allDoctors);
  };
  
  // Select doctor for booking
  const handleSelectDoctor = async (doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingForm(true);
    
    // Reset form data
    setFormData({
      date: '',
      time: '',
      reason: ''
    });
    
    // Only fetch slots if doctor prefers slot-based booking
    if (doctor.bookingPreference === 'slot') {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No authentication token found');
          return;
        }
        
        const response = await fetch(`http://localhost:5000/api/patient/doctor/${doctor._id}/slots`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch slots: ${response.status}`);
        }
        
        const data = await response.json();
        setAvailableSlots(data.slots || []);
      } catch (error) {
        console.error('Error fetching available slots:', error);
      }
    }
  };
  
  // Handle date change for slot-based booking
  const handleDateChange = async (e) => {
    const selectedDate = e.target.value;
    setFormData(prev => ({ ...prev, date: selectedDate }));
    
    if (selectedDoctor && selectedDoctor.bookingPreference === 'slot') {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No authentication token found');
          return;
        }
        
        const response = await fetch(`http://localhost:5000/api/patient/doctor/${selectedDoctor._id}/slots?date=${selectedDate}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch slots: ${response.status}`);
        }
        
        const data = await response.json();
        setAvailableSlots(data.slots || []);
      } catch (error) {
        console.error('Error fetching available slots:', error);
      }
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle booking submission
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const bookingData = {
        doctorId: selectedDoctor._id,
        date: formData.date,
        reason: formData.reason
      };
      
      // Add time for slot-based booking
      if (selectedDoctor.bookingPreference === 'slot') {
        bookingData.time = formData.time;
      }
      
      const response = await fetch('http://localhost:5000/api/patient/book-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to book appointment: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update appointments list
      if (selectedDoctor.bookingPreference === 'slot') {
        setAppointments(prev => [...prev, data.appointment]);
      } else {
        setQueuePositions(prev => [...prev, data.queuePosition]);
      }
      
      // Reset form and close booking form
      setFormData({
        date: '',
        time: '',
        reason: ''
      });
      setShowBookingForm(false);
      setSelectedDoctor(null);
      
      alert('Appointment booked successfully!');
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert(`Failed to book appointment: ${error.message}`);
    }
  };
  
  // Handle appointment cancellation
  const handleCancelAppointment = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/patient/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to cancel appointment: ${response.status}`);
      }
      
      // Update appointments list
      setAppointments(prev => prev.filter(app => app._id !== appointmentId));
      
      alert('Appointment cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert(`Failed to cancel appointment: ${error.message}`);
    }
  };
  
  // Handle queue position cancellation
  const handleLeaveQueue = async (queueId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/patient/queue/${queueId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to leave queue: ${response.status}`);
      }
      
      // Update queue positions list
      setQueuePositions(prev => prev.filter(queue => queue._id !== queueId));
      
      alert('Successfully left the queue!');
    } catch (error) {
      console.error('Error leaving queue:', error);
      alert(`Failed to leave queue: ${error.message}`);
    }
  };

  // Add unified search state
  const [unifiedSearch, setUnifiedSearch] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  
  // Handle unified search input change
  const handleUnifiedSearchChange = (e) => {
    setUnifiedSearch(e.target.value);
  };
  
  // Perform unified search
  const handleUnifiedSearch = (e) => {
    e.preventDefault();
    
    if (!unifiedSearch.trim()) {
      setFilteredDoctors(allDoctors);
      return;
    }
    
    const searchTerm = unifiedSearch.toLowerCase().trim();
    
    const filtered = allDoctors.filter(doctor => {
      // Search across multiple fields
      return (
        // Name search
        `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchTerm) ||
        // Specialization search
        (doctor.specialization && doctor.specialization.toLowerCase().includes(searchTerm)) ||
        // Location search
        (doctor.city && doctor.city.toLowerCase().includes(searchTerm)) ||
        (doctor.state && doctor.state.toLowerCase().includes(searchTerm)) ||
        (doctor.country && doctor.country.toLowerCase().includes(searchTerm)) ||
        // Additional fields that might be relevant
        (doctor.qualification && doctor.qualification.toLowerCase().includes(searchTerm)) ||
        (doctor.treatments && doctor.treatments.some(treatment => 
          treatment.name.toLowerCase().includes(searchTerm)
        ))
      );
    });
    
    setFilteredDoctors(filtered);
  };
  
  // Toggle advanced search
  const toggleAdvancedSearch = () => {
    setShowAdvancedSearch(!showAdvancedSearch);
  };
  
  return (
    <div className="section-container">
      <h2>Find and Book Appointments</h2>
      
      {/* Unified Doctor Search Section */}
<SearchBox/>
      
      {/* Doctors List Section */}
      
      <div className="doctors-section">
        <h3>Available Doctors</h3>
        {loading ? (
          <div className="loading">Loading doctors...</div>
        ) : filteredDoctors.length === 0 ? (
          <div className="no-results">No doctors found matching your search criteria.</div>
        ) : (
          <div className="doctors-grid">
            {filteredDoctors.map(doctor => (
              <div key={doctor._id} className="doctor-card">
                <div className="doctor-avatar">
                  {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                </div>
                <div className="doctor-info">
                  <h4>Dr. {doctor.firstName} {doctor.lastName}</h4>
                  <p className="doctor-specialization">{doctor.specialization}</p>
                  <p className="doctor-location">{doctor.city}, {doctor.state}</p>
                  <p className="booking-type">
                    Booking: {doctor.bookingPreference === 'slot' ? 'Appointment Slots' : 'Queue System'}
                  </p>
                </div>
                <button 
                  className="book-button"
                  onClick={() => handleSelectDoctor(doctor)}
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Booking Form Modal */}
      {showBookingForm && selectedDoctor && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Book Appointment with Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</h3>
              <button className="close-button" onClick={() => setShowBookingForm(false)}>×</button>
            </div>
            
            <form onSubmit={handleBookAppointment} className="booking-form">
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleDateChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              {/* Show time selection only for slot-based booking */}
              {selectedDoctor.bookingPreference === 'slot' && (
                <div className="form-group">
                  <label htmlFor="time">Time Slot</label>
                  <select
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">-- Select Time --</option>
                    {availableSlots.map((slot, index) => (
                      <option key={index} value={slot.time}>
                        {slot.time}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="reason">Reason for Visit</label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Briefly describe your symptoms or reason for visit"
                  required
                />
              </div>
              
              <div className="booking-info">
                {selectedDoctor.bookingPreference === 'queue' ? (
                  <p className="queue-info">
                    <i className="info-icon">ℹ️</i> 
                    You will be added to the queue for the selected date. The doctor will see patients in order of arrival.
                  </p>
                ) : (
                  <p className="slot-info">
                    <i className="info-icon">ℹ️</i> 
                    Please select an available time slot for your appointment.
                  </p>
                )}
              </div>
              
              <button type="submit" className="book-button">
                {selectedDoctor.bookingPreference === 'slot' ? 'Book Appointment' : 'Join Queue'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Appointments and Queue Section */}
      <div className="appointments-section">
        <h3>Your Appointments</h3>
        
        {/* Slot-based Appointments */}
        {appointments.length > 0 && (
          <div className="appointments-list">
            <h4>Scheduled Appointments</h4>
            {appointments.map(app => (
              <div key={app._id} className="appointment-card">
                <div className="appointment-info">
                  <h4>Dr. {app.doctorName}</h4>
                  <p className="appointment-date">{new Date(app.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                  <p className="appointment-time">{app.time}</p>
                  <p className="appointment-reason">{app.reason}</p>
                </div>
                <div className="appointment-actions">
                  <button 
                    className="cancel-appointment-button" 
                    onClick={() => handleCancelAppointment(app._id)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Queue-based Appointments */}
        {queuePositions.length > 0 && (
          <div className="queue-list">
            <h4>Queue Positions</h4>
            {queuePositions.map(queue => (
              <div key={queue._id} className="queue-card">
                <div className="queue-info">
                  <h4>Dr. {queue.doctorName}</h4>
                  <p className="queue-date">{new Date(queue.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                  <div className="queue-position">
                    <span className="position-number">#{queue.position}</span>
                    <span className="position-label">in queue</span>
                  </div>
                  <p className="queue-status">{queue.status}</p>
                  <p className="queue-reason">{queue.reason}</p>
                </div>
                <div className="queue-actions">
                  <button 
                    className="leave-queue-button" 
                    onClick={() => handleLeaveQueue(queue._id)}
                  >
                    Leave Queue
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {appointments.length === 0 && queuePositions.length === 0 && (
          <p className="no-appointments">You don't have any upcoming appointments or queue positions.</p>
        )}
      </div>
    </div>
  );
};

export default AppointmentManager;
