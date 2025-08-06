import React, { useState, useEffect } from 'react';
import config from '../../config/config';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { handleAuthRedirect } from '../../utils/authUtils';
import { 
  FaUserAlt, FaThermometerHalf, FaCalendarAlt, FaPills, 
  FaFolder, FaComments, FaSignOutAlt, FaBars, FaTimes 
} from 'react-icons/fa';
import './PatientDashboard.scss';

// Import tab components
import UserProfile from './tabs/UserProfile';
import SymptomChecker from './tabs/SymptomChecker';
import AppointmentManager from './tabs/AppointmentManager';
import MedicationPlan from './tabs/MedicationPlan';
import EducationalResources from './tabs/EducationalResources';
import Chat from './tabs/Chat';
import Loader from '../ui/Loader';
import MedicalRecordsTab from './tabs/MedicalRecordsTab';

const PatientDashboardCompo = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardTitle, setDashboardTitle] = useState('Patient Dashboard');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // Get URL parameters and query parameters
  const params = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  useEffect(() => {
    // Check if we have a token in the URL (from Google OAuth redirect)
    const userData = handleAuthRedirect();
    if (userData) {
      // If we have user data from the token but need additional profile data
      if (!userData.medicalHistory) {
        // Fetch the complete patient profile if needed
        const fetchPatientProfile = async () => {
          try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${config.API_URL}/api/patient/profile/${userData.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              // Update user data in localStorage with complete profile
              localStorage.setItem('user', JSON.stringify({
                ...data,
                role: 'patient'
              }));
            }
          } catch (error) {
            console.error('Error fetching patient profile after OAuth:', error);
          }
        };
        fetchPatientProfile();
      }
    }
    
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
        const response = await fetch(`${config.API_URL}/api/patient/patient-dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
    
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }
    
        const data = await response.json();
        
        if (data.user) {
          setUserData(data.user);
        }
        
        // Fetch profile photo
        try {
          const photoResponse = await fetch(`${config.API_URL}/api/patient/profile-photo`, {
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false); // Close mobile menu when changing tabs
  };

  if (loading) {
    return <Loader />;
  }
  
  // Define navigation items with icons
  const navItems = [
    { id: 'profile', label: 'Profile', icon: <FaUserAlt /> },
    { id: 'symptoms', label: 'Symptom Checker', icon: <FaThermometerHalf /> },
    { id: 'appointments', label: 'Appointment Manager', icon: <FaCalendarAlt /> },
    { id: 'medications', label: 'Medication Plan', icon: <FaPills /> },
    { id: 'medicalrecords', label: 'Medical Records', icon: <FaFolder /> },
    { id: 'chat', label: 'Chat', icon: <FaComments /> },
  ];
  
  return (
    <div className={`patient-dashboard ${mobileMenuOpen ? 'menu-open' : ''}`}>
      <header className="dashboard-header">
        <div className="menu-toggle-container">
          <button 
            className="menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
          <h1>{dashboardTitle}</h1>
        </div>
        
        <div className="user-info">
          <span>Welcome, {userData?.username || 'User'}</span>
          <div className="user-avatar">
            {profilePhoto ? (
              <img 
                src={`${config.API_URL}${profilePhoto}`} 
                alt="Profile" 
                className="avatar-image"
                onError={(e) => {
                  e.target.onError = null;
                  e.target.style.display = 'none';
                  // Show user initials instead
                  const avatarFallback = document.createElement('div');
                  avatarFallback.className = 'avatar-fallback';
                  avatarFallback.textContent = userData?.username?.[0]?.toUpperCase() || 'U';
                  e.target.parentNode.appendChild(avatarFallback);
                }}
              />
            ) : (
              <div className="avatar-fallback">
                {userData?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        <nav className={`dashboard-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <ul>
            {navItems.map(item => (
              <li key={item.id}>
                <button 
                  className={activeTab === item.id ? 'active' : ''}
                  onClick={() => handleTabChange(item.id)}
                >
                  <span className="icon">{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
            <li className="logout-item">
              <button 
                onClick={handleLogout}
                className="logout-button"
                aria-label="Logout"
              >
                <span className="icon"><FaSignOutAlt /></span>
                Logout
              </button>
            </li>
          </ul>
        </nav>

        <main className="dashboard-content">
          {activeTab === 'profile' && <UserProfile userData={userData} />}
          {activeTab === 'symptoms' && <SymptomChecker />}
          {activeTab === 'appointments' && <AppointmentManager />}
          {activeTab === 'medications' && <MedicationPlan />}
          {activeTab === 'medicalrecords' && <MedicalRecordsTab />}
          {activeTab === 'chat' && <Chat />}
        </main>
      </div>
    </div>
  );
};

export default PatientDashboardCompo;

