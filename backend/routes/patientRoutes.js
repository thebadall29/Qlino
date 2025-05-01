const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const patientController = require('../controllers/patientController');

// Add or update the route for patient dashboard
router.get('/patient-dashboard', auth, authorize(['patient']), patientController.getDashboard);

router.put('/patient-dashboard', auth, authorize(['patient']), async (req, res) => {
  try {
    const { personalInfo, medicalHistory } = req.body;
    
    // Add more detailed debugging
    console.log('Request user object:', req.user);
    console.log('Updating user profile:', {
      userId: req.user.id, // Use optional chaining
      personalInfo,
      medicalHistory
    });
    
    // Check if req.user exists
    if (!req.user || !req.user.id) {
      console.error('User not found in request object');
      return res.status(401).json({ message: 'Authentication failed - user not found in token' });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        firstName: personalInfo.fullName.split(' ')[0],
        lastName: personalInfo.fullName.split(' ').slice(1).join(' '),
        age: personalInfo.age,
        gender: personalInfo.gender,
        mobile: personalInfo.phone,
        city: personalInfo.city,
        state: personalInfo.state,
        country: personalInfo.country,
        emergencyContact: personalInfo.emergencyContact,
        chronicConditions: medicalHistory.chronicConditions,
        pastSurgeries: medicalHistory.pastSurgeries,
        allergies: medicalHistory.allergies
      },
      { new: true, runValidators: true }
    );
    
    // Add more detailed error handling
    if (!updatedUser) {
      console.error('User not found for ID:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Log successful update
    console.log('Profile updated successfully:', updatedUser);
    
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      message: 'Error updating profile',
      error: error.message 
    });
  }
});

module.exports = router;