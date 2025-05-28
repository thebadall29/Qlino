import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DoctorDashboard.scss';
import Profile from './tabs/Profile';
import PatientManagement from './tabs/PatientManagement';
import Appointments from './tabs/Appointments';
import Chat from './tabs/Chat';
import TodaysBookings from './tabs/TodaysBookings';
import Photos from './tabs/Photos'; // Import the new Photos component

const DoctorDashboardCompo = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [doctorData, setDoctorData] = useState({
    name: "Loading...",
    specialization: "",
    avatar: "...",
    availability: ""
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        
        // Extract doctor data from response
        const doctor = data.doctor || data;

        console.log('Extracted doctor data:', doctor);
        
        // Update state with doctor data
        setDoctorData({
          name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
          specialization: doctor.specialization || 'Specialist',
          avatar: doctor.photoUrl,
          availability: doctor.availability || 'Available'
        });
      } catch (error) {
        console.error('Error fetching doctor data:', error);
        // Keep the default values if there's an error
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <Profile />;
      case 'patients':
        return <PatientManagement />;
      case 'appointments':
        return <Appointments />;
      case 'chat':
        return <Chat />;
      case 'todaysBookings':
        return <TodaysBookings />;
      case 'photos':
        return <Photos />; // Add the Photos component
      default:
        return <Profile />;
    }
  };

  const handleLogout = () => {
    // Clear the authentication token
    localStorage.removeItem('token');
    // Redirect to login page
    navigate('/');
  };


  return (
    <div className="doctor-dashboard">
      <header className="dashboard-header">
        <h1>Doctor Admin Panel</h1>
        <div className="user-info">
          <span>Welcome, {doctorData.name}</span>
           <div className="user-avatar">
    {doctorData.avatar ? (
      <img 
        src={(doctorData?.avatar ? `http://localhost:5000${doctorData.avatar}` : '')} 
        alt={doctorData.name}
        onError={(e) => {
          e.target.onError = null;
          e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="20">${doctorData.name.charAt(0)}</text></svg>`;
        }}
      />
    ) : (
      <div className="avatar-fallback">
        {doctorData.name.charAt(0)}
      </div>
    )}
  </div>
        </div>
      </header>

      <div className="dashboard-container">
        <nav className="dashboard-nav">
          <ul>
            <li>
              <button 
                className={activeTab === 'profile' ? 'active' : ''} 
                onClick={() => setActiveTab('profile')}
              >
                <span className="icon">👤</span>
                Profile
              </button>
            </li>
            <li>
              <button 
                className={activeTab === 'patients' ? 'active' : ''} 
                onClick={() => setActiveTab('patients')}
              >
                <span className="icon">👥</span>
                Patient Management
              </button>
            </li>
            <li>
              <button 
                className={activeTab === 'appointments' ? 'active' : ''} 
                onClick={() => setActiveTab('appointments')}
              >
                <span className="icon">📅</span>
                Appointments
              </button>
            </li>
            <li>
              <button 
                className={activeTab === 'chat' ? 'active' : ''} 
                onClick={() => setActiveTab('chat')}
              >
                <span className="icon">💬</span>
                Chat
              </button>
            </li>
            <li>
              <button 
                className={activeTab === 'todaysBookings' ? 'active' : ''} 
                onClick={() => setActiveTab('todaysBookings')}
              >
                <span className="icon">📋</span>
                Today's Bookings
              </button>
            </li>
            <li>
              <button 
                className={activeTab === 'photos' ? 'active' : ''} 
                onClick={() => setActiveTab('photos')}
              >
                <span className="icon">📷</span>
                Photos
              </button>
            </li>
            <li className="logout-item">
              <button 
                onClick={handleLogout}
                className="logout-button"
              >
                <span className="icon">🚪</span>
                Logout
              </button>
            </li>
          </ul>
        </nav>

        <main className="dashboard-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboardCompo;