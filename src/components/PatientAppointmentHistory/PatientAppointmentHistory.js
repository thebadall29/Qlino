import React, { useState, useEffect, useCallback } from 'react'
import './PatientAppointmentHistory.scss';

const PatientAppointmentHistory = ({ patientEmail, onClearSelection }) => {
  const [patientHistory, setPatientHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Add state for filters
  const [filters, setFilters] = useState({
    doctorName: '',
    date: '',
    status: ''
  });
  
  // Add state for filtered appointments
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  
  // Add state for categorized appointments
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [missedAppointments, setMissedAppointments] = useState([]);
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [cancelledAppointments, setCancelledAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  // Categorize appointments function
  const categorizeAppointments = useCallback(() => {
    if (!patientHistory || !patientHistory.allAppointments) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison
    
    const upcoming = [];
    const missed = [];
    const completed = [];
    const cancelled = [];
    
    patientHistory.allAppointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.date);
      
      if (appointment.status && appointment.status.toLowerCase() === 'completed') {
        completed.push(appointment);
      } else if (appointment.status && appointment.status.toLowerCase() === 'cancelled') {
        cancelled.push(appointment);
      } else if (appointmentDate < today && 
                (appointment.status === 'scheduled' || appointment.status === 'Hold')) {
        missed.push(appointment);
      } else if (appointmentDate >= today) {
        upcoming.push(appointment);
      }
    });
    
    setUpcomingAppointments(upcoming);
    setMissedAppointments(missed);
    setCompletedAppointments(completed);
    setCancelledAppointments(cancelled);
  }, [patientHistory]);

  // Call categorizeAppointments when patientHistory changes
  useEffect(() => {
    categorizeAppointments();
  }, [patientHistory, categorizeAppointments]);

  // Fetch patient appointments from API - using useCallback to prevent recreation
  const fetchPatientAppointments = useCallback(async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/patient/appointment/${email}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch patient appointments: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setPatientHistory(data.patientHistory);
      // Don't set filteredAppointments here, let the useEffect handle it
    } catch (err) {
      console.error('Error fetching patient appointments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fetch patient appointments when component mounts or email changes
  useEffect(() => {
    if (patientEmail) {
      fetchPatientAppointments(patientEmail);
    }
  }, [patientEmail, fetchPatientAppointments]);
  
  // Apply filters when appointments or filters change
  useEffect(() => {
    if (patientHistory && patientHistory.allAppointments) {
      let filtered = [...patientHistory.allAppointments];
      
      // Filter by doctor name
      if (filters.doctorName) {
        filtered = filtered.filter(app => 
          app.doctorName && app.doctorName.toLowerCase().includes(filters.doctorName.toLowerCase())
        );
      }
      
      // Filter by date
      if (filters.date) {
        const filterDate = new Date(filters.date);
        filtered = filtered.filter(app => {
          const appDate = new Date(app.date);
          return appDate.toDateString() === filterDate.toDateString();
        });
      }
      
      // Filter by status
      if (filters.status) {
        filtered = filtered.filter(app => 
          app.status && app.status.toLowerCase() === filters.status.toLowerCase()
        );
      }
      
      setFilteredAppointments(filtered);
    }
  }, [patientHistory, filters]);
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      doctorName: '',
      date: '',
      status: ''
    });
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    try {
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (error) {
      return dateString; // Return original string if formatting fails
    }
  };

  // Get status badge class based on appointment status
  const getStatusBadgeClass = (status) => {
    if (!status) return 'status-badge';
    
    switch(status.toLowerCase()) {
      case 'completed':
        return 'status-badge completed';
      case 'scheduled':
        return 'status-badge scheduled';
      case 'cancelled':
        return 'status-badge cancelled';
      case 'no-show':
        return 'status-badge no-show';
      case 'pending':
        return 'status-badge pending';
      default:
        return 'status-badge';
    }
  };

  // Add function to handle appointment cancellation
  const handleCancelAppointment = async (appointmentId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/patient/appointment/cancel/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel appointment: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Update the appointment status in the local state
        const updatedAppointments = patientHistory.allAppointments.map(app => 
          app._id === appointmentId ? { ...app, status: 'cancelled' } : app
        );
        
        setPatientHistory({
          ...patientHistory,
          allAppointments: updatedAppointments
        });
        
        // Re-categorize appointments
        categorizeAppointments();
        
        alert('Appointment cancelled successfully');
      } else {
        throw new Error(data.message || 'Failed to cancel appointment');
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Retry function for failed requests
  const handleRetry = () => {
    fetchPatientAppointments(patientEmail);
  };

  if (!patientEmail) {
    return null;
  }
  
  // Remove console logs from render function
  
  return (
    <div className="patient-appointment-history-container">
      <div className="patient-appointment-section">
        <div className="section-header">
          <h3>My Appointments</h3>
          {onClearSelection && (
            <button 
              onClick={onClearSelection} 
              className="close-button"
              aria-label="Close appointment history"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Section */}
        <div className="appointment-filters">
          <div className="filter-group">
            <label htmlFor="doctorName">Doctor Name:</label>
            <input
              type="text"
              id="doctorName"
              name="doctorName"
              value={filters.doctorName}
              onChange={handleFilterChange}
              placeholder="Filter by doctor name"
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
          </div>
          
          <button onClick={clearFilters} className="clear-filters-button">
            Clear Filters
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading appointment history...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="error-message">
            <h4>Error Loading Appointments</h4>
            <p>{error}</p>
            <button onClick={handleRetry} className="retry-button">
              Try Again
            </button>
          </div>
        )}
        
        {/* Success State - Display Appointment History */}
        {!loading && !error && patientHistory && (
          <div className="patient-appointment-history">
            {/* Summary Statistics */}
            <div className="history-summary">
              <h4>Appointment Summary</h4>
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Visits</span>
                  <span className="stat-value">{patientHistory.totalVisits || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Follow-up Count</span>
                  <span className="stat-value">{patientHistory.followUpCount || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Is Follow-up Patient</span>
                  <span className="stat-value">
                    {patientHistory.isFollowUp ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* All Appointments Section */}
            <div className="all-appointments">
              <div className="appointment-tabs">
                <button 
                  className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  All ({filteredAppointments.length})
                </button>
                <button 
                  className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
                  onClick={() => setActiveTab('upcoming')}
                >
                  Upcoming ({upcomingAppointments.length})
                </button>
                <button 
                  className={`tab-button ${activeTab === 'missed' ? 'active' : ''}`}
                  onClick={() => setActiveTab('missed')}
                >
                  Missed ({missedAppointments.length})
                </button>
                <button 
                  className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
                  onClick={() => setActiveTab('completed')}
                >
                  Completed ({completedAppointments.length})
                </button>
                <button 
                  className={`tab-button ${activeTab === 'cancelled' ? 'active' : ''}`}
                  onClick={() => setActiveTab('cancelled')}
                >
                  Cancelled ({cancelledAppointments.length})
                </button>
              </div>
              
              {/* Display appointments based on active tab */}
              {activeTab === 'all' && (
                <>
                  {filteredAppointments.length === 0 ? (
                    <div className="no-appointments">
                      <p>No appointments found matching your filters.</p>
                    </div>
                  ) : (
                    <div className="appointments-list">
                      {filteredAppointments.map((appointment, index) => (
                        <div key={appointment._id || index} className="appointment-card">
                          <div className="appointment-header">
                            <div className="appointment-date">
                              {formatDate(appointment.date)}
                            </div>
                            <div className={getStatusBadgeClass(appointment.status)}>
                              {appointment.status || 'Unknown'}
                            </div>
                          </div>
                          <div className="appointment-details">
                            <div className="detail-row">
                              <span className="detail-label">Doctor:</span>
                              <span className="detail-value">{appointment.doctorName || 'Not specified'}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Reason:</span>
                              <span className="detail-value">{appointment.reason || 'Not specified'}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Type:</span>
                              <span className="detail-value">{appointment.type || 'Regular'}</span>
                            </div>
                            {appointment.queueNumber && (
                              <div className="detail-row">
                                <span className="detail-label">Queue Number:</span>
                                <span className="detail-value">{appointment.queueNumber}</span>
                              </div>
                            )}
                            {(appointment.contact || appointment.contactNumber) && (
                              <div className="detail-row">
                                <span className="detail-label">Contact:</span>
                                <span className="detail-value">
                                  {appointment.contact || appointment.contactNumber}
                                </span>
                              </div>
                            )}
                            
                            {/* Add cancel button for scheduled appointments */}
                            {appointment.status && 
                             appointment.status.toLowerCase() === 'scheduled' && (
                              <div className="appointment-actions">
                                <button 
                                  className="cancel-appointment-btn" 
                                  onClick={() => handleCancelAppointment(appointment._id)}
                                  disabled={loading}
                                >
                                  Cancel Appointment
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              
              {/* Upcoming Appointments */}
              {activeTab === 'upcoming' && (
                <>
                  {upcomingAppointments.length === 0 ? (
                    <div className="no-appointments">
                      <p>No upcoming appointments found.</p>
                    </div>
                  ) : (
                    <div className="appointments-list">
                      {upcomingAppointments.map((appointment, index) => (
                        <div key={appointment._id || index} className="appointment-card">
                          <div className="appointment-header">
                            <div className="appointment-date">
                              {formatDate(appointment.date)}
                            </div>
                            <div className={getStatusBadgeClass(appointment.status)}>
                              {appointment.status || 'Unknown'}
                            </div>
                          </div>
                          <div className="appointment-details">
                            <div className="detail-row">
                              <span className="detail-label">Doctor:</span>
                              <span className="detail-value">{appointment.doctorName || 'Not specified'}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Reason:</span>
                              <span className="detail-value">{appointment.reason || 'Not specified'}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Type:</span>
                              <span className="detail-value">{appointment.type || 'Regular'}</span>
                            </div>
                            {appointment.queueNumber && (
                              <div className="detail-row">
                                <span className="detail-label">Queue Number:</span>
                                <span className="detail-value">{appointment.queueNumber}</span>
                              </div>
                            )}
                            {(appointment.contact || appointment.contactNumber) && (
                              <div className="detail-row">
                                <span className="detail-label">Contact:</span>
                                <span className="detail-value">
                                  {appointment.contact || appointment.contactNumber}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              
              {/* Missed Appointments */}
              {activeTab === 'missed' && (
                <>
                  {missedAppointments.length === 0 ? (
                    <div className="no-appointments">
                      <p>No missed appointments found.</p>
                    </div>
                  ) : (
                    <div className="appointments-list">
                      {missedAppointments.map((appointment, index) => (
                        <div key={appointment._id || index} className="appointment-card missed">
                          <div className="appointment-header">
                            <div className="appointment-date">
                              {formatDate(appointment.date)}
                            </div>
                            <div className="status-badge missed">
                              Missed
                            </div>
                          </div>
                          <div className="appointment-details">
                            <div className="detail-row">
                              <span className="detail-label">Doctor:</span>
                              <span className="detail-value">{appointment.doctorName || 'Not specified'}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Reason:</span>
                              <span className="detail-value">{appointment.reason || 'Not specified'}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Type:</span>
                              <span className="detail-value">{appointment.type || 'Regular'}</span>
                            </div>
                            {appointment.queueNumber && (
                              <div className="detail-row">
                                <span className="detail-label">Queue Number:</span>
                                <span className="detail-value">{appointment.queueNumber}</span>
                              </div>
                            )}
                            {(appointment.contact || appointment.contactNumber) && (
                              <div className="detail-row">
                                <span className="detail-label">Contact:</span>
                                <span className="detail-value">
                                  {appointment.contact || appointment.contactNumber}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              
              {/* Completed Appointments */}
              {activeTab === 'completed' && (
                <>
                  {completedAppointments.length === 0 ? (
                    <div className="no-appointments">
                      <p>No completed appointments found.</p>
                    </div>
                  ) : (
                    <div className="appointments-list">
                      {/* Render appointment cards */}
                      <div className="appointments-list">
                        {(activeTab === 'all' ? filteredAppointments : 
                          activeTab === 'upcoming' ? upcomingAppointments : 
                          activeTab === 'missed' ? missedAppointments : 
                          completedAppointments).map((appointment, index) => (
                          <div 
                            key={appointment._id || index} 
                            className={`appointment-card ${index === 0 ? 'featured' : ''}`}
                          >
                            <div className="appointment-header">
                              <span className="appointment-date">
                                {formatDate(appointment.date)}
                              </span>
                              <span className={getStatusBadgeClass(appointment.status)}>
                                {appointment.status || 'Unknown'}
                              </span>
                            </div>
                            <div className="appointment-details">
                              <div className="detail-row">
                                <span className="detail-label">Doctor:</span>
                                <span className="detail-value">{appointment.doctorName || 'Unknown'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="detail-label">Specialization:</span>
                                <span className="detail-value">{appointment.doctorSpecialization || 'General'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="detail-label">Reason:</span>
                                <span className="detail-value">{appointment.reason || 'Not specified'}</span>
                              </div>
                              {/* Add cancel button for scheduled appointments */}
                              {appointment.status && 
                               appointment.status.toLowerCase() === 'scheduled' && (
                                <div className="appointment-actions">
                                  <button 
                                    className="cancel-appointment-btn" 
                                    onClick={() => handleCancelAppointment(appointment._id)}
                                    disabled={loading}
                                  >
                                    Cancel Appointment
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {/* Cancelled Appointments */}
              {activeTab === 'cancelled' && (
                <>
                  {cancelledAppointments.length === 0 ? (
                    <div className="no-appointments">
                      <p>No cancelled appointments found.</p>
                    </div>
                  ) : (
                    <div className="appointments-list">
                      {cancelledAppointments.map((appointment, index) => (
                        <div key={appointment._id || index} className="appointment-card cancelled">
                          <div className="appointment-header">
                            <div className="appointment-date">
                              {formatDate(appointment.date)}
                            </div>
                            <div className="status-badge cancelled">
                              Cancelled
                            </div>
                          </div>
                          <div className="appointment-details">
                            <div className="detail-row">
                              <span className="detail-label">Doctor:</span>
                              <span className="detail-value">{appointment.doctorName || 'Not specified'}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Reason:</span>
                              <span className="detail-value">{appointment.reason || 'Not specified'}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Type:</span>
                              <span className="detail-value">{appointment.type || 'Regular'}</span>
                            </div>
                            {appointment.queueNumber && (
                              <div className="detail-row">
                                <span className="detail-label">Queue Number:</span>
                                <span className="detail-value">{appointment.queueNumber}</span>
                              </div>
                            )}
                            {(appointment.contact || appointment.contactNumber) && (
                              <div className="detail-row">
                                <span className="detail-label">Contact:</span>
                                <span className="detail-value">
                                  {appointment.contact || appointment.contactNumber}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* No Data State */}
        {!loading && !error && !patientHistory && (
          <div className="no-data">
            <p>No appointment data available for this patient.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientAppointmentHistory;