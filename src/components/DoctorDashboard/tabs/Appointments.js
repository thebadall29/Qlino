import React, { useState, useEffect } from 'react';
import AppointmentManager from '../../AppointmentManager/AppointmentManager';
import "../DoctorDashboard.scss";

const Appointments = () => {
  const [doctorData, setDoctorData] = useState(null);

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
        console.log('Doctor data from API:', data);

        // Transform the doctor data to match expected structure
        if (data.doctor) {
          const transformedDoctorData = {
            ...data.doctor,
            _id: data.doctor._id
          };
          setDoctorData(transformedDoctorData);
        }
      } catch (error) {
        console.error('Error fetching doctor data:', error);
      }
    };

    fetchDoctorData();
  }, []);

  // If doctor data is not loaded yet, you might want to show a loading state
  if (!doctorData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="section-container">
      <AppointmentManager 
        doctorId={doctorData._id}
        workingDays={doctorData.workingDays}
        bookingPreference={doctorData.bookingPreference}
        name={doctorData.name}
      />
    </div>
  );
};

export default Appointments;