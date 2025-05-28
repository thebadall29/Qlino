import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AppointmentHeaderTab.scss';
import PatientAppointmentHistory from '../PatientAppointmentHistory/PatientAppointmentHistory';

const AppointmentHeaderTabCompo = () => {
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get logged in user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Check if user exists and is a patient (not a doctor)
    if (user && user.email && user.role === 'patient') {
      setUserEmail(user.email);
    } else {
      // Redirect to patient login if no user found or if user is a doctor
      navigate('/patient-login');
    }
  }, [navigate]);

  // Show loading or redirect if no user
  if (!userEmail) {
    return null; // Component will unmount and redirect will happen
  }

  return (
    <div className="section-container">
      <h2>Find and Book Appointments</h2>
      
      <PatientAppointmentHistory 
        patientEmail={userEmail} 
        onClearSelection={() => {}} 
      />
    </div>
  );
};

export default AppointmentHeaderTabCompo;