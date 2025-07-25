import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const userData = params.get('userData');

      console.log('Auth Callback - Received params:', {
        hasToken: !!token,
        hasUserData: !!userData
      });

      try {
        if (token) {
          localStorage.setItem('token', token);
        }

        if (userData) {
          const user = JSON.parse(decodeURIComponent(userData));
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('userType', user.role || 'doctor');

          console.log('Auth Callback - Stored data:', {
            token: token ? token.substring(0, 20) + '...' : null,
            user: user,
            userType: user.role
          });

          // Redirect based on user role
          if (user.role === 'doctor') {
            navigate('/doctor-dashboard');
          } else if (user.role === 'patient') {
            navigate('/patient-dashboard');
          } else {
            navigate('/');
          }
        } else {
          console.error('No user data received in callback');
          navigate('/doctor-login');
        }
      } catch (error) {
        console.error('Error processing auth callback:', error);
        navigate('/doctor-login');
      }
    };

    handleCallback();
  }, [navigate, location]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      Processing authentication...
    </div>
  );
};

export default AuthCallback;
