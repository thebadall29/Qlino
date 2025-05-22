import React, { useState, useEffect } from 'react';
import '../PatientDashboard.scss';
import SearchBox from '../../SearchBox/SearchBox';
import PatientAppointmentHistory from '../../PatientAppointmentHistory/PatientAppointmentHistory';

const AppointmentManager = () => {
  const [userEmail, setUserEmail] = useState('');
  
  useEffect(() => {
    // Get logged in user's email from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.email) {
      setUserEmail(user.email);
    }
  }, []);

  return (
    <div className="section-container">
      <h2>Find and Book Appointments</h2>

      {/* Unified Doctor Search Section */}
      <SearchBox />
      
      {/* Display appointments for logged in user */}
      {userEmail && (
        <PatientAppointmentHistory 
          patientEmail={userEmail} 
          onClearSelection={() => {}} 
        />
      )}
    </div>
  );
};

export default AppointmentManager;