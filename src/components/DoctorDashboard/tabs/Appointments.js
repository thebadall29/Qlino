import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import "../DoctorDashboard.scss";

// Day names constant for mapping day numbers to names
const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Helper function to format date to YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Get available time slots for a specific date based on doctor's schedule
const getAvailableSlots = (date, workingDays) => {
  const dayName = dayNames[date.getDay()];
  const daySchedule = workingDays[dayName];

  // Return empty array if doctor is not available on this day
  if (!daySchedule || !daySchedule.active) {
    return [];
  }

  const slots = [];
  const startTime = new Date(`2000/01/01 ${daySchedule.startTime}`);
  const endTime = new Date(`2000/01/01 ${daySchedule.endTime}`);

  let currentTime = startTime;
  while (currentTime < endTime) {
    slots.push({
      time: currentTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      available: true
    });
    currentTime = new Date(currentTime.getTime() + 30 * 60000); // Add 30 minutes
  }

  return slots;
};

// Helper function to check if doctor is available on a given date
const isDoctorAvailable = (date, workingDays) => {
  if (!workingDays) return false;
  const dayName = dayNames[date.getDay()];
  return workingDays[dayName] && workingDays[dayName].active;
};

// Helper to check if a date is today
const isToday = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

// Helper to parse time string like "9:30 AM" to Date object
const parseTimeString = (timeStr) => {
  const today = new Date();
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');

  if (hours === '12') {
    hours = '00';
  }

  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }

  return new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
};

// Handle queue status change
const handleQueueStatusChange = (queueNumber, newStatus, selectedDate, queuesByDate, setQueuesByDate) => {
  const formattedDate = formatDate(selectedDate);

  setQueuesByDate(prevQueues => {
    const updatedQueue = [...(prevQueues[formattedDate] || [])];
    const queueItemIndex = updatedQueue.findIndex(item => item.number === queueNumber);

    if (queueItemIndex !== -1) {
      updatedQueue[queueItemIndex] = {
        ...updatedQueue[queueItemIndex],
        status: newStatus
      };
    }

    return {
      ...prevQueues,
      [formattedDate]: updatedQueue
    };
  });
};



// Fetch appointments for a specific date from API
const fetchAppointmentsForDate = async (date) => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No authentication token found');
      return null;
    }

    const formattedDate = formatDate(date);
    const response = await fetch(`http://localhost:5000/api/doctor/appointments/${formattedDate}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch appointments: ${response.status}`);
    }

    const data = await response.json();

    return data.success ? data.appointments : [];
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return null;
  }
};

// Fetch queue data for a specific date
const fetchQueueForDate = async (date) => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No authentication token found');
      return null;
    }

    const formattedDate = formatDate(date);
    const response = await fetch(`http://localhost:5000/api/doctor/queue/${formattedDate}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch queue: ${response.status}`);
    }

    const data = await response.json();
    console.log('Queue data from API:', data);

    return data.success ? data.queue : []; // Changed from data.appointments to data.queue
  } catch (error) {
    console.error('Error fetching queue:', error);
    return null;
  }
};

const Appointments = () => {
  const [doctorData, setDoctorData] = useState(null);
  const [bookingPreference, setBookingPreference] = useState('slot'); // Default to slot
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    contact: '',
    email: '',
    reason: '',
    date: new Date()
  });
  const [loading, setLoading] = useState(true);

  // State for appointments and queues
  const [appointments, setAppointments] = useState({});
  const [queuesByDate, setQueuesByDate] = useState({});
  const [todayAppointments, setTodayAppointments] = useState([]);

  // State for booking modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    patientName: '',
    contact: '',
    email: '',
    reason: ''
  });

  // Load queue data for a specific date
  const loadQueueForDate = async (date) => {
    try {
      const formattedDate = formatDate(date);
      const fetchedQueue = await fetchQueueForDate(date);

      if (fetchedQueue) {
        // Update the queuesByDate state directly with the fetched queue data
        setQueuesByDate(prevState => ({
          ...prevState,
          [formattedDate]: fetchedQueue
        }));

        console.log('Queue data loaded for date:', formattedDate, fetchedQueue);
      }
    } catch (error) {
      console.error('Error loading queue data:', error);
    }
  };

  console.log("appointment for the day",queuesByDate)

  // Fetch doctor data when component mounts
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          console.error('No authentication token found');
          return;
        }

        const response = await fetch('http://localhost:5000/api/doctor/doctor-dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch doctor data: ${response.status}`);
        }

        const data = await response.json();

        // Transform the doctor data to match expected structure
        if (data.doctor) {
          const transformedDoctorData = {
            ...data.doctor,
            _id: data.doctor.id // Map id to _id
          };
          setDoctorData(transformedDoctorData);

          // Set booking preference from API data
          if (data.doctor.bookingPreference) {
            setBookingPreference(data.doctor.bookingPreference);
          }

          // After setting doctor data, fetch today's appointments and queue
          const today = new Date();
          loadAppointmentsForDate(today);
          loadQueueForDate(today);
        }
      } catch (error) {
        console.error('Error fetching doctor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, []);

  // Function to load appointments for a specific date
  const loadAppointmentsForDate = async (date) => {
    try {
      const formattedDate = formatDate(date);
      const fetchedAppointments = await fetchAppointmentsForDate(date);

      if (fetchedAppointments) {
        // Process the appointments data
        const processedAppointments = processAppointmentsData(fetchedAppointments, date, doctorData);

        // Update appointments state
        setAppointments(prevAppointments => ({
          ...prevAppointments,
          [formattedDate]: processedAppointments
        }));

        // If loading today's appointments, update todayAppointments state
        if (isToday(date)) {
          const todayAppts = fetchedAppointments.filter(appt => !appt.available && appt.patient)
            .map(appt => ({
              time: appt.time,
              patient: appt.patient,
              contact: appt.contact || '-',
              email: appt.email || '-',
              reason: appt.reason || '-',
              available: false,
              status: appt.status || 'Scheduled'
            }));

          setTodayAppointments(todayAppts);
        }
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  // Process appointments data from API
  const processAppointmentsData = (apiAppointments, date, doctorData) => {
    // If doctor is not available, return empty array
    if (!doctorData || !isDoctorAvailable(date, doctorData.workingDays)) {
      return [];
    }

    // Generate all possible time slots based on doctor's working hours
    const allSlots = getAvailableSlots(date, doctorData.workingDays);

    // Mark slots as booked based on API data
    return allSlots.map(slot => {
      const matchingAppointment = apiAppointments.find(appt =>
        appt.time === slot.time && !appt.available
      );

      if (matchingAppointment) {
        return {
          ...slot,
          ...matchingAppointment,
          available: false
        };
      }

      return slot;
    });
  };

  // Effect to reload appointments and queue data when selected date changes
  useEffect(() => {
    if (doctorData) {
      loadAppointmentsForDate(selectedDate);
      loadQueueForDate(selectedDate);
    }
  }, [selectedDate, doctorData]);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return formatDate(new Date());
  };

  // Get queue for the selected date
 // ... existing code ...

// Get queue for the selected date
// Get queue for the selected date
const getQueueForSelectedDate = () => {
  const formattedDate = formatDate(selectedDate);
  const queueItems = queuesByDate[formattedDate] || [];
  
  if (queueItems.length === 0) {
    return <div className="no-queue-message">No patients in queue for this date</div>;
  }

  return queueItems.map((item) => (
    <div key={item.id} className="queue-item">
      <span className="queue-number">#{item.queueNumber}</span>
      <div className="patient-info">
        <div className="patient-name">{item.name}</div>
        <div className="patient-email">{item.email || '-'}</div>
      </div>
    </div>
  ));
};

// ... existing code ...


  // Handle date change from calendar
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // Handle adding patient to queue
  const handleAddToQueue = () => {
    // Check if doctor is available on selected date
    if (!doctorData || !isDoctorAvailable(selectedDate, doctorData.workingDays)) {
      alert("Cannot add patients to queue when doctor is not available on the selected date");
      return;
    }

    // Set default date to selected date
    setNewPatient(prev => ({ ...prev, date: selectedDate }));
    setShowAddPatientForm(true);
  };

  // Sort appointments by time
  const sortAppointmentsByTime = (appointments) => {
    return appointments.sort((a, b) => {
      const timeA = new Date(`2000/01/01 ${a.time}`);
      const timeB = new Date(`2000/01/01 ${b.time}`);
      return timeA - timeB;
    });
  };

  // Handle form submission for adding patient to queue
  const handlePatientSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        alert('You must be logged in to add patients to queue');
        return;
      }

      // Get selected date
      const queueDate = newPatient.date;
      const formattedDate = formatDate(queueDate);

      // Check doctor availability
      if (!doctorData || !isDoctorAvailable(queueDate, doctorData.workingDays)) {
        alert("Cannot add patients to queue when doctor is not available on the selected date");
        return;
      }

      // Prepare queue data
      const queueData = {
        doctorId: doctorData._id,
        date: formattedDate,
        patientName: newPatient.name,
        contact: newPatient.contact,
        email: newPatient.email,
        reason: newPatient.reason,
        type: 'queue'
      };

      // Send queue request to API
      const response = await fetch('http://localhost:5000/api/doctor/queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(queueData)
      });


      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add patient to queue');
      }

      const data = await response.json();

      // After successful addition, reload the queue data
      await loadQueueForDate(selectedDate);

      // Reset form and close modal
      setNewPatient({ name: '', contact: '', email: '', reason: '', date: new Date() });
      setShowAddPatientForm(false);

      alert('Patient added to queue successfully!');
    } catch (error) {
      console.error('Error adding patient to queue:', error);
      alert('Failed to add patient to queue. Please try again.');
    }
  };

  // Get appointments for specific date based on doctor's working hours
  const getAppointmentsForDate = (date) => {
    // If doctor is not available on this day, return empty array
    if (!doctorData || !isDoctorAvailable(date, doctorData.workingDays)) {
      return [];
    }

    const formattedDate = formatDate(date);
    return appointments[formattedDate] || [];
  };

  // Handle time slot click for slot-based booking
  const handleSlotClick = (slot) => {
    // Only allow slot selection if doctor is available on selected date
    if (slot.available && doctorData && isDoctorAvailable(selectedDate, doctorData.workingDays)) {
      setSelectedSlot(slot);
      setShowBookingModal(true);
    }
  };

  // Handle booking form submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        alert('You must be logged in to book an appointment');
        return;
      }

      // Check if all required fields are present
      if (!doctorData || !doctorData.id) {
        console.error('Doctor data is missing');
        alert('Doctor information is missing. Please try again.');
        return;
      }

      if (!selectedDate) {
        alert('Please select a date for the appointment');
        return;
      }

      if (!selectedSlot || !selectedSlot.time) {
        alert('Please select a time slot for the appointment');
        return;
      }

      if (!bookingDetails.reason || !bookingDetails.patientName || !bookingDetails.contact || !bookingDetails.email) {
        alert('Please fill in all required fields (Name, Contact, Email, and Reason)');
        return;
      }

      // Prepare booking data - match the expected field names in the backend model
      const bookingData = {
        doctorId: doctorData.id,
        date: formatDate(selectedDate),
        time: selectedSlot.time,
        patientName: bookingDetails.patientName,
        patientEmail: bookingDetails.email,
        contactNumber: bookingDetails.contact,
        reason: bookingDetails.reason,
        type: 'slot'
      };


      // Send booking request to API
      const response = await fetch('http://localhost:5000/api/doctor/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to book appointment');
      }

      const data = await response.json();

      // Reload appointments for the selected date to get updated data
      await loadAppointmentsForDate(selectedDate);

      // Close the booking modal and reset form
      setShowBookingModal(false);
      setBookingDetails({
        patientName: '',
        contact: '',
        email: '',
        reason: '',
      });

      alert('Appointment booked successfully!');
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert(`Failed to book appointment: ${error.message}`);
    }
  };

  return (
    <div className="section-container">
      {/* Information display that shows current booking mode */}
      <div className="booking-mode-info">
        <h3>Current Booking Mode: {bookingPreference === 'queue' ? 'Queue-based' : 'Slot-based'}</h3>
        <p className="booking-mode-description">
          {bookingPreference === 'queue'
            ? 'Patients are added to a queue without specific time slots.'
            : 'Patients can book specific time slots directly.'}
        </p>
      </div>

      {bookingPreference === 'slot' ? (
        <div className="slot-booking">
          <div className="appointment-grid">
            <div className="calendar-section">
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                minDate={new Date()}
                className="custom-calendar"
                locale="en-US"
                formatShortWeekday={(locale, date) =>
                  date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)
                }
                tileDisabled={({ date }) => {
                  if (!doctorData || !doctorData.workingDays) return true;

                  const dayName = dayNames[date.getDay()];
                  return !doctorData.workingDays[dayName] || !doctorData.workingDays[dayName].active;
                }}
              />
            </div>
            <div className="slots-section">
              <div className="selected-date">
                <h4>Appointments for {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</h4>
                {(!doctorData || !isDoctorAvailable(selectedDate, doctorData.workingDays)) && (
                  <p className="not-working-day">Doctor is not available on this day</p>
                )}
              </div>

              {/* Only show time slots if doctor is available */}
              {doctorData && isDoctorAvailable(selectedDate, doctorData.workingDays) && (
                <div className="time-slots">
                  {getAppointmentsForDate(selectedDate).map((slot, index) => (
                    <div
                      key={index}
                      className={`time-slot ${slot.available ? '' : 'occupied'}`}
                      onClick={() => handleSlotClick(slot)}
                      style={{ cursor: slot.available ? 'pointer' : 'not-allowed' }}
                    >
                      <div className="slot-time">{slot.time}</div>
                      {!slot.available && slot.patient && (
                        <div className="slot-patient">{slot.patient}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="appointments-list-section">
                <h4>Appointments for {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</h4>

                {/* Conditional display based on doctor availability and date */}
                {(!doctorData || !isDoctorAvailable(selectedDate, doctorData.workingDays)) ? (
                  <p className="no-appointments">Doctor is not available on this day</p>
                ) : formatDate(selectedDate) === getTodayDate() ? (
                  todayAppointments.length > 0 ? (
                    <div className="appointments-table-container">
                      <table className="appointments-table">
                        <thead>
                          <tr>
                            <th>Time</th>
                            <th>Patient Name</th>
                            <th>Contact</th>
                            <th>Reason</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {todayAppointments.map((appointment, index) => (
                            <tr key={index}>
                              <td>{appointment.time}</td>
                              <td>{appointment.patient}</td>
                              <td>{appointment.contact}</td>
                              <td>{appointment.reason}</td>
                              <td>
                                <span className={`status-badge ${(appointment.status || 'scheduled').toLowerCase().replace(/\s+/g, '-')}`}>
                                  {appointment.status || 'Scheduled'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="no-appointments">No appointments scheduled for today</p>
                  )
                ) : (
                  <div className="appointments-table-container">
                    <table className="appointments-table">
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Patient Name</th>
                          <th>Contact</th>
                          <th>Reason</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getAppointmentsForDate(selectedDate)
                          .filter(slot => !slot.available)
                          .map((appointment, index) => (
                            <tr key={index}>
                              <td>{appointment.time}</td>
                              <td>{appointment.patient}</td>
                              <td>{appointment.contact || '-'}</td>
                              <td>{appointment.reason || '-'}</td>
                              <td>
                                <span className={`status-badge ${(appointment.status || 'scheduled').toLowerCase().replace(/\s+/g, '-')}`}>
                                  {appointment.status || 'Scheduled'}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="queue-booking">
          <div className="appointment-grid">
            <div className="calendar-section">
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                minDate={new Date()}
                className="custom-calendar"
                locale="en-US"
                formatShortWeekday={(locale, date) =>
                  date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)
                }
                tileDisabled={({ date }) => {
                  if (!doctorData || !doctorData.workingDays) return true;

                  const dayName = dayNames[date.getDay()];
                  return !doctorData.workingDays[dayName] || !doctorData.workingDays[dayName].active;
                }}
                tileClassName={({ date }) => {
                  const formattedDate = formatDate(date);
                  return queuesByDate[formattedDate] && queuesByDate[formattedDate].length > 0 ? 'has-queue' : '';
                }}
              />

              <div className="queue-info">
                <h3>Queue for {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</h3>

                {doctorData && isDoctorAvailable(selectedDate, doctorData.workingDays) ? (
                  <p>Patients added to the queue will be seen in order</p>
                ) : (
                  <p className="not-working-day">Doctor is not available on this date. Queue is closed.</p>
                )}
              </div>
            </div>

            <div className="queue-section">
              <h4>Queue for {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}</h4>
              {getQueueForSelectedDate()}
              <button className="add-patient-button" onClick={handleAddToQueue}>
                Add Patient to Queue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient to Queue Form */}
      {showAddPatientForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add Patient to Queue</h2>
            <p>Date: {newPatient.date.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>

            <form onSubmit={handlePatientSubmit}>
              <div className="form-group">
                <label htmlFor="patientName">Patient Name</label>
                <input
                  type="text"
                  id="patientName"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact">Contact Number</label>
                <input
                  type="text"
                  id="contact"
                  value={newPatient.contact}
                  onChange={(e) => setNewPatient({ ...newPatient, contact: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reason">Reason for Visit</label>
                <textarea
                  id="reason"
                  value={newPatient.reason}
                  onChange={(e) => setNewPatient({ ...newPatient, reason: e.target.value })}
                  required
                ></textarea>
              </div>


              {/* here start */}
              <div className="modal-actions">
                <button type="submit" className="add-button">Add to Queue</button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowAddPatientForm(false);
                    setNewPatient({ name: '', contact: '', email: '', reason: '', date: new Date() });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Booking Modal */}
      {showBookingModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Book Appointment</h2>
            <p>Time: {selectedSlot.time} - {formatDate(selectedDate)}</p>

            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label htmlFor="patientName">Patient Name</label>
                <input
                  type="text"
                  id="patientName"
                  value={bookingDetails.patientName}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, patientName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact">Contact Number</label>
                <input
                  type="text"
                  id="contact"
                  value={bookingDetails.contact}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, contact: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={bookingDetails.email}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reason">Reason for Visit</label>
                <textarea
                  id="reason"
                  value={bookingDetails.reason}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, reason: e.target.value })}
                  required
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="submit" className="book-button">Book Appointment</button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowBookingModal(false);
                    setBookingDetails({ patientName: '', contact: '', email: '', reason: '' });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
