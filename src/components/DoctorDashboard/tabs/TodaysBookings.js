import React, { useState, useEffect } from 'react';
import "../DoctorDashboard.scss";
import axios from 'axios';
import { FaPrint } from 'react-icons/fa';

const TodaysBookings = () => {
  const [activeBookings, setActiveBookings] = useState([]);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [holdBookings, setHoldBookings] = useState([]); // New state for hold bookings
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch today's bookings from API
    const fetchTodaysBookings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication required');
        }

        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        
        // Fetch queue data from API
        const response = await axios.get(
          `http://localhost:5000/api/doctor/queue/${formattedDate}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          // Map API data to match the structure expected by the component
          const bookings = response.data.queue.map((item, index) => ({
            id: item.id,
            name: item.name,
            email: item.email,
            reason: item.reason,
            status: item.status || "Waiting", // Default to "Waiting" if status is not provided
            queue: item.queueNumber || index + 1,
            time: formatTime(item.createdAt) || "N/A",
            contact: item.contact || item.phone || "N/A"
          }));

          // Separate active, completed, and hold bookings
          const completed = bookings.filter(b => b.status === "Completed");
          const hold = bookings.filter(b => b.status === "Hold");
          const active = bookings.filter(b => b.status !== "Completed" && b.status !== "Hold");
          
          setActiveBookings(active);
          setCompletedBookings(completed);
          setHoldBookings(hold);
        } else {
          throw new Error(response.data.message || 'Failed to fetch bookings');
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err.message || 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchTodaysBookings();
  }, []);

  // Helper function to format time from ISO string
  const formatTime = (isoString) => {
    if (!isoString) return null;
    
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (err) {
      console.error('Error formatting time:', err);
      return null;
    }
  };

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

      // If a booking is completed or on hold, move it to the appropriate list
      if (newStatus === "Completed") {
        const completedBooking = updatedBookings.find(b => b.id === id);
        setCompletedBookings(prev => [...prev, completedBooking]);
        return updatedBookings.filter(b => b.id !== id);
      } else if (newStatus === "Hold") {
        const holdBooking = updatedBookings.find(b => b.id === id);
        setHoldBookings(prev => [...prev, holdBooking]);
        return updatedBookings.filter(b => b.id !== id);
      }

      return updatedBookings;
    });

    // Update booking status in the backend
    updateBookingStatus(id, newStatus);
  };

  // Function to add a patient back to the queue
  const addBackToQueue = (booking) => {
    // Remove from hold list
    setHoldBookings(prev => prev.filter(b => b.id !== booking.id));
    
    // Add to active bookings at the end of the queue
    const lastQueueNumber = activeBookings.length > 0 
      ? Math.max(...activeBookings.map(b => b.queue))
      : 0;
    
    const updatedBooking = {
      ...booking,
      status: "Waiting",
      queue: lastQueueNumber + 1
    };
    
    setActiveBookings(prev => [...prev, updatedBooking]);
    
    // Update booking status in the backend
    updateBookingStatus(booking.id, "Waiting");
  };

  const updateBookingStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:5000/api/doctor/queue/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        console.log(`Status updated successfully for booking ${id}`);
      } else {
        console.error('Error updating status:', response.data.message);
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      // You might want to show an error message to the user
    }
  };
  const sendNotification = async (id, name) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/notifications/patient/${id}`,
        { 
          message: `Your doctor is ready to see you now.`,
          type: 'appointment'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`Notification sent to ${name}`);
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  };

  if (loading) {
    return <div className="section-container loading">Loading bookings...</div>;
  }

  if (error) {
    return <div className="section-container error">Error: {error}</div>;
  }

  return (
    <div className="section-container todays-bookings-container">
      <div className="section">
        <h3 className="section-title">Today's Bookings</h3>
        {activeBookings.length === 0 ? (
          <div className="no-bookings">No active bookings for today</div>
        ) : (
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
                      onClick={() => sendNotification(booking.id, booking.name)} 
                      className="notify-button"
                    >
                      Notify
                    </button>
                    <button 
                      onClick={() => handleStatusChange(booking.id, "Completed")} 
                      className="status-button completed"
                    >
                      Finish
                    </button>
                    <button 
                      onClick={() => handleStatusChange(booking.id, "Hold")} 
                      className="status-button hold"
                    >
                      No Show
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hold Section */}
      {holdBookings.length > 0 && (
        <div className="section hold-section">
          <h3 className="section-title">On Hold</h3>
          <div className="bookings-list">
            {holdBookings.map(booking => (
              <div key={booking.id} className="booking-item">
                <div className="booking-info">
                  <div className="booking-header">
                    <span className="patient-name">{booking.name}</span>
                  </div>
                  <div className="booking-details">
                    <span className="booking-time">{booking.time}</span>
                    <span className="status-badge hold">Hold</span>
                  </div>
                </div>
                <div className="booking-actions">
                  <button 
                    onClick={() => addBackToQueue(booking)} 
                    className="status-button in-process"
                  >
                    Add to Queue
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Section */}
      {completedBookings.length > 0 && (
        <div className="section completed-section">
          <h3 className="section-title">Completed</h3>
          <div className="bookings-list">
            {completedBookings.map(booking => (
              <div key={booking.id} className="booking-item completed">
                <div className="booking-info">
                  <div className="booking-header">
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