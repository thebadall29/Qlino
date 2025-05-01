import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import "../DoctorDashboard.scss";
import { mockDoctorData } from '../mockData';

// Day names constant for mapping day numbers to names
const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Helper function to format date to YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Get available time slots for a specific date based on doctor's schedule
const getAvailableSlots = (date, schedule) => {
  const dayName = dayNames[date.getDay()];
  const daySchedule = mockDoctorData.workingDays[dayName];
  
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
const isDoctorAvailable = (date) => {
  const dayName = dayNames[date.getDay()];
  return mockDoctorData.workingDays[dayName] && mockDoctorData.workingDays[dayName].active;
};

// Helper function to find the next available time slot
const findNextAvailableSlot = (date, appointments) => {
  if (!isDoctorAvailable(date)) {
    return null;
  }
  
  const formattedDate = new Date(date).toISOString().split('T')[0];
  let availableSlots = appointments[formattedDate] || getAvailableSlots(date);
  
  // Filter to only get available slots
  availableSlots = availableSlots.filter(slot => slot.available);
  
  // If it's today, only show slots from current time onwards
  if (isToday(date)) {
    const currentTime = new Date();
    availableSlots = availableSlots.filter(slot => {
      const slotTime = parseTimeString(slot.time);
      return slotTime > currentTime;
    });
  }
  
  // Return the first available slot, or null if none available
  return availableSlots.length > 0 ? availableSlots[0] : null;
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

const Appointments = () => {
  const [bookingMode, setBookingMode] = useState('queue'); // Default to queue mode
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    contact: '',
    reason: '',
    date: new Date()
  });

  // Mock data for appointments
  const [appointments, setAppointments] = useState({
    '2024-04-26': [
      { time: "09:00 AM", available: true },
      { time: "09:30 AM", available: false, patient: "John Doe" },
      { time: "10:00 AM", available: true },
      { time: "10:30 AM", available: true },
      { time: "11:00 AM", available: false, patient: "Jane Smith" },
      { time: "11:30 AM", available: true },
    ],
    '2024-04-27': [
      { time: "09:00 AM", available: true },
      { time: "09:30 AM", available: true },
      { time: "10:00 AM", available: false, patient: "Mike Johnson" },
      { time: "10:30 AM", available: true },
      { time: "11:00 AM", available: true },
      { time: "11:30 AM", available: true },
    ]
  });

  // Queue data - stored by date
  const [queuesByDate, setQueuesByDate] = useState({
    [formatDate(new Date())]: [
      { number: 1, name: "Jane Smith", status: "In Progress", time: "10:00 AM" },
      { number: 2, name: "Mike Johnson", status: "Waiting", time: "10:30 AM" },
    ]
  });

  // Today's appointments
  const [todayAppointments, setTodayAppointments] = useState([]);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Get queue for the selected date
  const getQueueForSelectedDate = () => {
    const formattedDate = formatDate(selectedDate);
    return queuesByDate[formattedDate] || [];
  };

  // Handle date change from calendar
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // Handle adding patient to queue
  const handleAddToQueue = () => {
    // Check if doctor is available on selected date
    if (!isDoctorAvailable(selectedDate)) {
      alert("Cannot add patients to queue when doctor is not available on the selected date");
      return;
    }
    
    // Set default date to selected date
    setNewPatient(prev => ({...prev, date: selectedDate}));
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
  const handlePatientSubmit = (e) => {
    e.preventDefault();
    
    // Get selected date
    const queueDate = newPatient.date;
    const formattedDate = formatDate(queueDate);
    
    // Check doctor availability
    if (!isDoctorAvailable(queueDate)) {
      alert("Cannot add patients to queue when doctor is not available on the selected date");
      return;
    }
    
    // Find next available slot
    const nextAvailableSlot = findNextAvailableSlot(queueDate, appointments);
    
    if (!nextAvailableSlot) {
      alert("No available time slots for the selected date. Please choose another date.");
      return;
    }
    
    // Get current queue for date or initialize new one
    const currentQueue = queuesByDate[formattedDate] || [];
    
    // Create queue item
    const newQueueItem = {
      number: currentQueue.length + 1,
      name: newPatient.name,
      contact: newPatient.contact,
      reason: newPatient.reason,
      time: nextAvailableSlot.time,
      status: "Waiting",
      timestamp: new Date().getTime()
    };

    // Update queues
    setQueuesByDate(prevQueues => ({
      ...prevQueues,
      [formattedDate]: [...(prevQueues[formattedDate] || []), newQueueItem]
    }));
    
    // Also create appointment for this queue item
    const newAppointment = {
      time: nextAvailableSlot.time,
      patient: newPatient.name,
      contact: newPatient.contact,
      reason: newPatient.reason,
      available: false,
      status: 'Scheduled from Queue'
    };
    
    // Update appointments
    setAppointments(prevAppointments => {
      const updatedAppointments = { ...prevAppointments };
      
      if (updatedAppointments[formattedDate]) {
        updatedAppointments[formattedDate] = updatedAppointments[formattedDate].map(slot => {
          if (slot.time === nextAvailableSlot.time) {
            return newAppointment;
          }
          return slot;
        });
      } else {
        const availableSlots = getAvailableSlots(queueDate);
        updatedAppointments[formattedDate] = availableSlots.map(slot => {
          if (slot.time === nextAvailableSlot.time) {
            return newAppointment;
          }
          return slot;
        });
      }
      
      return updatedAppointments;
    });
    
    // Update today's appointments if date is today
    if (formattedDate === getTodayDate()) {
      setTodayAppointments(prev => sortAppointmentsByTime([...prev, newAppointment]));
    }
    
    // Reset form and close modal
    setNewPatient({ name: '', contact: '', reason: '', date: new Date() });
    setShowAddPatientForm(false);
    
   
  };

  // Get appointments for specific date
  const getAppointmentsForDate = (date) => {
    // If doctor is not available on this day, return empty array
    if (!isDoctorAvailable(date)) {
      return [];
    }
    
    const formattedDate = formatDate(date);
    return appointments[formattedDate] || getAvailableSlots(date);
  };

  // State for appointment booking modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    patientName: '',
    contact: '',
    reason: ''
  });

  // Handle time slot click for slot-based booking
  const handleSlotClick = (slot) => {
    // Only allow slot selection if doctor is available on selected date
    if (slot.available && isDoctorAvailable(selectedDate)) {
      setSelectedSlot(slot);
      setShowBookingModal(true);
    }
  };

  // Handle booking form submission
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    
    // Check if doctor is available on the selected date
    if (!isDoctorAvailable(selectedDate)) {
      alert("Cannot book appointments on days the doctor is not available");
      setShowBookingModal(false);
      return;
    }
    
    // Create new appointment object with complete details
    const newAppointment = {
      time: selectedSlot.time,
      patient: bookingDetails.patientName,
      contact: bookingDetails.contact,
      reason: bookingDetails.reason,
      available: false,
      status: 'Scheduled'
    };
    
    // Get the formatted date for the selected date
    const formattedDate = formatDate(selectedDate);
    
    // Update appointments state
    setAppointments(prevAppointments => {
      const updatedAppointments = { ...prevAppointments };
      
      // If this date already exists in appointments
      if (updatedAppointments[formattedDate]) {
        updatedAppointments[formattedDate] = updatedAppointments[formattedDate].map(slot => {
          if (slot.time === selectedSlot.time) {
            return newAppointment;
          }
          return slot;
        });
      } else {
        // If this is a new date, initialize with slots
        const availableSlots = getAvailableSlots(selectedDate);
        updatedAppointments[formattedDate] = availableSlots.map(slot => {
          if (slot.time === selectedSlot.time) {
            return newAppointment;
          }
          return slot;
        });
      }
      
      return updatedAppointments;
    });
    
    // Update today's appointments if the selected date is today
    if (formattedDate === getTodayDate()) {
      setTodayAppointments(prev => sortAppointmentsByTime([...prev, newAppointment]));
    }
    
    // Clear booking details and close modal
    setBookingDetails({ patientName: '', contact: '', reason: '' });
    setShowBookingModal(false);
  };

  // Handle queue status change
  const handleQueueStatusChange = (queueNumber, newStatus, date) => {
    const formattedDate = formatDate(date);
    
    setQueuesByDate(prevQueues => {
      const updatedQueues = { ...prevQueues };
      if (updatedQueues[formattedDate]) {
        updatedQueues[formattedDate] = updatedQueues[formattedDate].map(item => {
          if (item.number === queueNumber) {
            return { ...item, status: newStatus };
          }
          return item;
        });
      }
      return updatedQueues;
    });
  };

  return (
    <div className="section-container">
      <div className="booking-mode-toggle">
        <button 
          className={bookingMode === 'slot' ? 'active' : ''}
          onClick={() => setBookingMode('slot')}
        >
          Slot-based
        </button>
        <button 
          className={bookingMode === 'queue' ? 'active' : ''}
          onClick={() => setBookingMode('queue')}
        >
          Queue-based
        </button>
      </div>

      {bookingMode === 'slot' ? (
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
                tileDisabled={({date}) => {
                  const dayName = dayNames[date.getDay()];
                  return !mockDoctorData.workingDays[dayName] || !mockDoctorData.workingDays[dayName].active;
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
                {!isDoctorAvailable(selectedDate) && (
                  <p className="not-working-day">Doctor is not available on this day</p>
                )}
              </div>
              
              {/* Only show time slots if doctor is available */}
              {isDoctorAvailable(selectedDate) && (
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
                {!isDoctorAvailable(selectedDate) ? (
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
                                <span className={`status-badge ${appointment.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                  {appointment.status}
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
                                <span className="status-badge scheduled">
                                  Scheduled
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
                tileDisabled={({date}) => {
                  const dayName = dayNames[date.getDay()];
                  return !mockDoctorData.workingDays[dayName] || !mockDoctorData.workingDays[dayName].active;
                }}
                tileClassName={({date}) => {
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
                
                {isDoctorAvailable(selectedDate) ? (
                  <p>Patients added to the queue will be assigned the next available time slot</p>
                ) : (
                  <p className="not-working-day">Doctor is not available on this date. Queue is closed.</p>
                )}
              </div>
            </div>

            <div className="queue-section">
              <div className="selected-date">
                <h4>Queue for {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</h4>
              </div>
              
              <div className="current-queue">
                {getQueueForSelectedDate().length > 0 ? (
                  getQueueForSelectedDate().map((item, index) => (
                    <div key={index} className={`queue-item ${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      <div className="queue-number">#{item.number}</div>
                      <div className="queue-details">
                        <div className="queue-patient">{item.name}</div>
                        <div className="queue-time">Time: {item.time || "Not assigned"}</div>
                      </div>
                      <div className="queue-actions">
                        <div className="queue-status">{item.status}</div>
                        <div className="status-controls">
                          <button 
                            className="status-button in-progress"
                            onClick={() => handleQueueStatusChange(item.number, "In Progress", selectedDate)}
                            disabled={item.status === "In Progress" || item.status === "Completed"}
                          >
                            Start
                          </button>
                          <button 
                            className="status-button completed"
                            onClick={() => handleQueueStatusChange(item.number, "Completed", selectedDate)}
                            disabled={item.status === "Completed" || item.status === "Waiting"}
                          >
                            Complete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-queue">No patients in queue for this date</p>
                )}
              </div>
              
              <button 
                className="add-to-queue-btn" 
                onClick={handleAddToQueue}
                disabled={!isDoctorAvailable(selectedDate)}
              >
                Add Patient to Queue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal Form */}
      {showAddPatientForm && (
        <div className="modal-overlay">
          <div className="modal-wrapper">
            <h3>Add Patient to Queue</h3>
            <form onSubmit={handlePatientSubmit}>
              <div className="form-group">
                <label>Patient Name</label>
                <input
                  type="text"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="text"
                  value={newPatient.contact}
                  onChange={(e) => setNewPatient({...newPatient, contact: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Reason for Visit</label>
                <textarea
                  value={newPatient.reason}
                  onChange={(e) => setNewPatient({...newPatient, reason: e.target.value})}
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label>Queue Date</label>
                <input
                  type="date"
                  value={formatDate(newPatient.date)}
                  min={formatDate(new Date())}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    // Check if doctor is available
                    if (!isDoctorAvailable(newDate)) {
                      alert("Doctor is not available on this date. Please select another date.");
                      return;
                    }
                    setNewPatient({...newPatient, date: newDate});
                  }}
                  required
                />
              </div>
              <div className="form-buttons">
                <button type="submit" className="submit-button">Add to Queue</button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => {
                    setNewPatient({ name: '', contact: '', reason: '', date: new Date() });
                    setShowAddPatientForm(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Modal for Slot-based system */}
      {showBookingModal && isDoctorAvailable(selectedDate) && (
        <div className="modal-overlay">
          <div className="modal-wrapper">
            <h3>Book Appointment</h3>
            <p className="selected-slot-info">
              Time: {selectedSlot.time} - {selectedDate.toLocaleDateString()}
            </p>
            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label>Patient Name</label>
                <input
                  type="text"
                  value={bookingDetails.patientName}
                  onChange={(e) => setBookingDetails({
                    ...bookingDetails,
                    patientName: e.target.value
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="text"
                  value={bookingDetails.contact}
                  onChange={(e) => setBookingDetails({
                    ...bookingDetails,
                    contact: e.target.value
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Reason for Visit</label>
                <textarea
                  value={bookingDetails.reason}
                  onChange={(e) => setBookingDetails({
                    ...bookingDetails,
                    reason: e.target.value
                  })}
                  required
                />
              </div>
              <div className="form-buttons">
                <button type="submit" className="submit-button">Book Appointment</button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowBookingModal(false)}
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