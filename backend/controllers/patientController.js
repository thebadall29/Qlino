// Import the User model
const User = require('../models/User');
const PatientPhoto = require('../models/PatientPhotoSchema');


exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const patientId = req.user.id;
    
    // Find the user and update their photo URL
    const user = await User.findById(patientId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create or update photo record
    const photoUrl = `/uploads/patients/${req.file.filename}`;
    console.log('Saving photo URL:', photoUrl);
    console.log('Actual file path:', req.file.path);
    
    await PatientPhoto.findOneAndUpdate(
      { patientId },
      { imageUrl: photoUrl },
      { upsert: true, new: true }
    );

    // Update user's photoUrl
    user.photoUrl = photoUrl;
    await user.save();

    res.json({ 
      success: true,
      message: 'Profile photo uploaded successfully',
      photoUrl: photoUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading profile photo'
    });
  }
};

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

// Add this function to get the patient's profile photo
exports.getProfilePhoto = async (req, res) => {
  try {
    const patientId = req.user.id;
    
    // Find the photo record for this patient
    const photoRecord = await PatientPhoto.findOne({ patientId });
    
    if (!photoRecord) {
      return res.status(404).json({
        success: false,
        message: 'No profile photo found for this patient'
      });
    }
    
    res.json({
      success: true,
      photoUrl: photoRecord.imageUrl
    });
  } catch (error) {
    console.error('Error fetching profile photo:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile photo'
    });
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