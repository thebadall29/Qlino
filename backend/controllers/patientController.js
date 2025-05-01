// Import the User model
const User = require('../models/User');

// Updated patientController.js
exports.getDashboard = async (req, res) => {
  try {
    // console.log('User ID from token:', req.user.id);
    
    // Find user by ID
    const user = await User.findById(req.user.id);
    
    // Debug: Log if user was found
    // console.log('User found?', !!user);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user data
    res.json({
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        age: user.age,
        gender: user.gender,
        city: user.city,
        state: user.state,
        country: user.country,
        emergencyContact: user.emergencyContact,
        chronicConditions: user.chronicConditions,
        pastSurgeries: user.pastSurgeries,
        allergies: user.allergies
      }
    });
  } catch (error) {
    console.error('Error in getDashboard:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Add or update the getPatientDashboard function
exports.getPatientDashboard = async (req, res) => {
  try {
    // Get user ID from the authenticated request
    const userId = req.user.id;
    
    // Find the user by ID
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user data
    res.status(200).json({
      success: true,
      user: {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        age: user.age,
        gender: user.gender,
        emergencyContact: user.emergencyContact,
        city: user.city,
        state: user.state,
        country: user.country,
        chronicConditions: user.chronicConditions,
        pastSurgeries: user.pastSurgeries,
        allergies: user.allergies,
        uploadedFiles: user.uploadedFiles || []
      }
    });
  } catch (error) {
    console.error('Error in getPatientDashboard:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};