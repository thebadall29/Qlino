import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './PatientDashboard.scss';
import UserProfile from './tabs/UserProfile';
import SymptomChecker from './tabs/SymptomChecker';
import AppointmentManager from './tabs/AppointmentManager';
import MedicationPlan from './tabs/MedicationPlan';
import EducationalResources from './tabs/EducationalResources';
import Chat from './tabs/Chat';
import Loader from '../ui/Loader'; // Adjust path if you place Loader.js elsewhere

const PatientDashboardCompo = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardTitle, setDashboardTitle] = useState('Patient Admin Panel');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const navigate = useNavigate();
  
  // Get URL parameters and query parameters
  const params = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  useEffect(() => {
    // Get dashboard title from URL query parameter if available
    const titleFromUrl = queryParams.get('title');
    if (titleFromUrl) {
      setDashboardTitle(decodeURIComponent(titleFromUrl));
    } else if (params.title) {
      // Or from route parameter if using that approach
      setDashboardTitle(params.title);
    }
    
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found');
          return;
        }
    
        // Add API call to fetch dashboard data
        const response = await fetch('http://localhost:5000/api/patient/patient-dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
    
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }
    
        const data = await response.json();
        // console.log('Dashboard data:', data);
        
        if (data.user) {
          setUserData(data.user);
        }
        
        // Fetch profile photo
        try {
          const photoResponse = await fetch(`http://localhost:5000/api/patient/profile-photo`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (photoResponse.ok) {
            const photoData = await photoResponse.json();
            if (photoData.success && photoData.photoUrl) {
              setProfilePhoto(photoData.photoUrl);
            }
          }
        } catch (photoError) {
          console.error('Error fetching profile photo:', photoError);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [params.title, queryParams]);

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to home page
    navigate('/');
  };

  if (loading) {
    return <Loader />;
  }
  
  return (
    <div className="patient-dashboard">
      <header className="dashboard-header">
        <h1>{dashboardTitle}</h1>
        <div className="user-info">
          <span>Welcome, {userData?.username || 'User'}</span>
          <div className="user-avatar">
            {profilePhoto ? (
              <img 
                src={`http://localhost:5000${profilePhoto}`} 
                alt="Profile" 
                className="avatar-image"
                onError={(e) => {
                  console.error('Avatar image load error:', e.target.src);
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            ) : (
              <span className="avatar-text">{userData?.username?.[0]?.toUpperCase() || 'U'}</span>
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
                className={activeTab === 'symptoms' ? 'active' : ''} 
                onClick={() => setActiveTab('symptoms')}
              >
                <span className="icon">🤒</span>
                Symptom Checker
              </button>
            </li>
            <li>
              <button 
                className={activeTab === 'appointments' ? 'active' : ''} 
                onClick={() => setActiveTab('appointments')}
              >
                <span className="icon">📅</span>
                Appointment Manager
              </button>
            </li>
            <li>
              <button 
                className={activeTab === 'medications' ? 'active' : ''} 
                onClick={() => setActiveTab('medications')}
              >
                <span className="icon">💊</span>
                Medication Plan
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
              {/* <button 
                className={activeTab === 'resources' ? 'active' : ''} 
                onClick={() => setActiveTab('resources')}
              >
                <span className="icon">📚</span>
                Educational Resources
              </button> */}
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
          {activeTab === 'profile' && <UserProfile />}
          {activeTab === 'symptoms' && <SymptomChecker />}
          {activeTab === 'appointments' && <AppointmentManager />}
          {activeTab === 'medications' && <MedicationPlan />}
          {activeTab === 'chat' && <Chat/>}
          {/* {activeTab === 'resources' && <EducationalResources />} */}
        </main>
      </div>
    </div>
  );
};

export default PatientDashboardCompo;

