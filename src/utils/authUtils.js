// Utility functions for authentication

/**
 * Extracts token and user data from URL query parameters and stores them in localStorage
 * @returns {Object|null} User data if token is found, null otherwise
 */
export const handleAuthRedirect = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const token = queryParams.get('token');
  const encodedUserData = queryParams.get('userData');
  
  if (token) {
    // Store the token
    localStorage.setItem('token', token);
    
    // If we have encoded user data, decode and store it
    if (encodedUserData) {
      try {
        const userData = JSON.parse(decodeURIComponent(encodedUserData));
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userType', userData.role);
        
        // Clean up the URL by removing the query parameters
        const url = new URL(window.location.href);
        url.search = '';
        window.history.replaceState({}, document.title, url.toString());
        
        return userData;
      } catch (error) {
        console.error('Error decoding user data:', error);
      }
    }
    
    // If no encoded user data, decode the token to get basic user information
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const { id, role } = JSON.parse(jsonPayload);
      
      // Clean up the URL by removing the query parameters
      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({}, document.title, url.toString());
      
      return { id, role };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
  
  return null;
};

/**
 * Checks if user is authenticated
 * @returns {Boolean} True if user is authenticated, false otherwise
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Gets user role from localStorage
 * @returns {String|null} User role if found, null otherwise
 */
export const getUserRole = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? user.role : null;
};

/**
 * Logs out user by removing token and user data from localStorage
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userType');
};