import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DoctorDashboard.scss';
import Profile from './tabs/Profile';
import PatientManagement from './tabs/PatientManagement';
import Appointments from './tabs/Appointments';
import Chat from './tabs/Chat';
import TodaysBookings from './tabs/TodaysBookings';

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
        
        // Update state with doctor data
        setDoctorData({
          name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
          specialization: doctor.specialization || 'Specialist',
          avatar: `${doctor.firstName?.[0]}${doctor.lastName?.[0]}` || 'DR',
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
          <div className="user-avatar">{doctorData.avatar}</div>
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