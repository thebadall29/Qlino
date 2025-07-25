import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { handleAuthRedirect } from '../../utils/authUtils';
import { 
  FaUserMd, FaUsers, FaCalendarAlt, FaComments, 
  FaClipboardList, FaImages, FaSignOutAlt, FaBars, FaTimes 
} from 'react-icons/fa';
import './DoctorDashboard.scss';

// Import components
import Profile from './tabs/Profile';
import PatientManagement from './tabs/PatientManagement';
import Appointments from './tabs/Appointments';
import Chat from './tabs/Chat';
import TodaysBookings from './tabs/TodaysBookings';
import Photos from './tabs/Photos';

const DoctorDashboardCompo = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [doctorData, setDoctorData] = useState({
    name: "Loading...",
    specialization: "",
    avatar: "...",
    availability: ""
  });
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for token in URL and handle authentication, then fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // First check URL parameters for token and user data
        const params = new URLSearchParams(window.location.search);
        const tokenFromUrl = params.get('token');
        const userDataFromUrl = params.get('userData');

        console.log('URL parameters:', {
          token: tokenFromUrl,
          userData: userDataFromUrl
        });

        // If we have data in URL, store it
        if (tokenFromUrl) {
          localStorage.setItem('token', tokenFromUrl);
          // Clean up URL
          params.delete('token');
        }

        if (userDataFromUrl) {
          try {
            const userData = JSON.parse(decodeURIComponent(userDataFromUrl));
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('userType', userData.role || 'doctor');
            params.delete('userData');
          } catch (e) {
            console.error('Error parsing userData from URL:', e);
          }
        }

        // Clean up URL if we had parameters
        if (tokenFromUrl || userDataFromUrl) {
          const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
          window.history.replaceState({}, '', newUrl);
        }

        // Now check authentication state
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        console.log('Current auth state after URL check:', {
          token: token ? token.substring(0, 20) + '...' : null,
          userStr: userStr,
          tokenType: typeof token,
          userType: localStorage.getItem('userType')
        });

        if (!token || !userStr) {
          console.error('No authentication data found');
          navigate('/doctor-login'); 
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
        const doctor = data.doctor || data;
        setDoctorData({
          name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
          specialization: doctor.specialization || 'Specialist',
          avatar: doctor.photoUrl,
          availability: doctor.availability || 'Available'
        });
      } catch (error) {
        console.error('Error fetching doctor data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Handle OAuth redirect first
    const userData = handleAuthRedirect();
    if (userData) {
      // If profile is incomplete, fetch it
      if (!userData.specialization) {
        const fetchDoctorProfile = async () => {
          try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/doctor/profile/${userData.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
              const data = await response.json();
              localStorage.setItem('user', JSON.stringify({ ...data, role: 'doctor' }));
            }
          } catch (error) {
            console.error('Error fetching doctor profile after OAuth:', error);
          } finally {
            // After attempting to fetch profile, fetch dashboard data
            fetchUserData();
          }
        };
        fetchDoctorProfile();
      } else {
        // If profile is complete, just fetch dashboard data
        fetchUserData();
      }
    } else {
      // For normal component load, fetch dashboard data
      fetchUserData();
    }
  }, [location, navigate]);

  // URL parameters are now handled in the main useEffect

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false); // Close mobile menu when changing tabs
  };

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
        return <Photos />;
      default:
        return <Profile />;
    }
  };

  const handleLogout = () => {
    // Clear the authentication token
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login page
    navigate('/');
  };

  // Define navigation items with icons
  const navItems = [
    { id: 'profile', label: 'Profile', icon: <FaUserMd /> },
    { id: 'patients', label: 'Patient Management', icon: <FaUsers /> },
    { id: 'appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
    { id: 'chat', label: 'Chat', icon: <FaComments /> },
    { id: 'todaysBookings', label: 'Today\'s Bookings', icon: <FaClipboardList /> },
    { id: 'photos', label: 'Photos', icon: <FaImages /> },
  ];

  return (
    <div className="doctor-dashboard">
      <header className="dashboard-header">
        <div className="menu-toggle-container">
          <button 
            className="menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
          <h1>Doctor Dashboard</h1>
        </div>
        
        <div className="user-info">
          <span>Welcome, {doctorData.name}</span>
          <div className="user-avatar">
            {doctorData.avatar ? (
              <img 
                src={`http://localhost:5000${doctorData.avatar}`} 
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
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboardCompo;