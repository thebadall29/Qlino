import React, { useState } from 'react';
import "../DoctorDashboard.scss";
import { mockDoctorData } from '../mockData';

const TodaysBookings = () => {
  const initialBookings = mockDoctorData.todaysBookings;
  // Ensure all bookings have a valid status
  const validatedBookings = initialBookings.map(booking => ({
    ...booking,
    status: booking.status || "Waiting" // Set default status if undefined
  }));

  const [activeBookings, setActiveBookings] = useState(validatedBookings);
  const [completedBookings, setCompletedBookings] = useState([]);

  const handleStatusChange = (id, newStatus) => {
    setActiveBookings(prevBookings => {
      const booking = prevBookings.find(b => b.id === id);
      if (!booking) return prevBookings;
      
      const updatedBookings = prevBookings.map(b => {
        // Update the status of the selected booking
        if (b.id === id) {
          return { ...b, status: newStatus };
        }
        
        // If current booking is marked as "In Process", set next booking as "Ready"
        if (newStatus === "In Process" && b.queue === booking.queue + 1) {
          return { ...b, status: "Ready" };
        }
        
        return b;
      });

      // If a booking is completed, move it to completedBookings
      if (newStatus === "Completed") {
        const completedBooking = updatedBookings.find(b => b.id === id);
        setCompletedBookings(prev => [...prev, completedBooking]);
        return updatedBookings.filter(b => b.id !== id);
      }

      return updatedBookings;
    });
  };

  const sendNotification = (name) => {
    // Notification logic would go here
    console.log(`Notification sent to ${name}`);
  };

  return (
    <div className="section-container todays-bookings-container">
      <div className="section">
        <h3 className="section-title">Today's Bookings</h3>
        <div className="bookings-list">
          {activeBookings.map(booking => {
            // Ensure status is never undefined
            const status = booking.status || "Waiting";
            
            return (
              <div key={booking.id} className="booking-item">
                <div className="booking-info">
                  <div className="booking-header">
                    <span className="queue-number">#{booking.queue}</span>
                    <span className="patient-name">{booking.name}</span>
                  </div>
                  <div className="booking-details">
                    <span className="booking-time">{booking.time}</span>
                    <span className={`status-badge ${status.toLowerCase()}`}>
                      {status}
                    </span>
                  </div>
                </div>
                <div className="booking-actions">
                  <button 
                    onClick={() => sendNotification(booking.name)} 
                    className="notify-button"
                  >
                    Notify
                  </button>
                  <div className="status-actions">
                    {status === "Waiting" && (
                      <button 
                        onClick={() => handleStatusChange(booking.id, "Ready")}
                        className="status-button ready-button"
                      >
                        Ready
                      </button>
                    )}
                    {status === "Ready" && (
                      <button 
                        onClick={() => handleStatusChange(booking.id, "In Process")}
                        className="status-button process-button"
                      >
                        Start
                      </button>
                    )}
                    {status === "In Process" && (
                      <button 
                        onClick={() => handleStatusChange(booking.id, "Completed")}
                        className="status-button complete-button"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {completedBookings.length > 0 && (
        <div className="section completed-section">
          <h3 className="section-title">Completed Appointments</h3>
          <div className="bookings-list completed-list">
            {completedBookings.map(booking => (
              <div key={booking.id} className="booking-item completed">
                <div className="booking-info">
                  <div className="booking-header">
                    <span className="queue-number">#{booking.queue}</span>
                    <span className="patient-name">{booking.name}</span>
                  </div>
                  <div className="booking-details">
                    <span className="booking-time">{booking.time}</span>
                    <span className="status-badge completed">Completed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodaysBookings;