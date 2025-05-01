const Doctor = require('../models/Doctor');

// Get doctor dashboard data
exports.getDashboard = async (req, res) => {
  try {
    // Get user ID from auth middleware
    const doctorId = req.user.id;
    console.log('Getting dashboard for doctorId:', doctorId);
    
    // Find doctor by ID using Doctor model
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Return doctor data
    res.json({
      doctor: {
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        specialization: doctor.specialization,
        experience: doctor.experience,
        qualification: doctor.qualification,
        mobile: doctor.mobile,
        emergency: doctor.emergency,
        address: doctor.address,
        city: doctor.city,
        state: doctor.state,
        country: doctor.country,
        about: doctor.about,
        workingDays: doctor.workingDays || {},
        treatments: doctor.treatments || []
      }
    });
  } catch (error) {
    console.error('Error in getDashboard:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update doctor profile
exports.updateProfile = async (req, res) => {
  try {
    // Get user ID from auth middleware
    const doctorId = req.user.id;
    console.log('Updating profile for doctorId:', doctorId);
    console.log('Update data received:', req.body);
    
    // Find doctor by ID using Doctor model
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Update doctor data with all fields from request
    const updateFields = [
      'firstName', 'lastName', 'email', 'specialization', 
      'experience', 'qualification', 'mobile', 'emergency',
      'address', 'city', 'state', 'country', 'about'
    ];
    
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        doctor[field] = req.body[field];
      }
    });
    
    // Update working days and treatments
    if (req.body.workingDays) {
      doctor.workingDays = req.body.workingDays;
    }
    
    if (req.body.treatments) {
      doctor.treatments = req.body.treatments;
    }
    
    // Save updated doctor
    await doctor.save();
    console.log('Doctor profile updated successfully');
    
    // Return updated doctor data
    res.json({
      message: 'Profile updated successfully',
      doctor: {
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        specialization: doctor.specialization,
        experience: doctor.experience,
        qualification: doctor.qualification,
        mobile: doctor.mobile,
        emergency: doctor.emergency,
        address: doctor.address,
        city: doctor.city,
        state: doctor.state,
        country: doctor.country,
        about: doctor.about,
        workingDays: doctor.workingDays,
        treatments: doctor.treatments
      }
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};