const Specialty = require('../models/Specialty');
const Doctor = require('../models/Doctor');

// Get all specialties with doctor count
exports.getAllSpecialties = async (req, res) => {
  try {
    // Get all doctors to calculate counts
    const doctors = await Doctor.find({});
    
    // Get unique specialties and count doctors for each
    const specialtyCounts = doctors.reduce((acc, doctor) => {
      acc[doctor.specialization] = (acc[doctor.specialization] || 0) + 1;
      return acc;
    }, {});


    // Format the response
    const specialties = Object.entries(specialtyCounts).map(([name, count]) => ({
      name,
      doctorCount: count
    }));

    res.status(200).json(specialties);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching specialties',
      error: error.message
    });
  }
};

// Get doctors by specialty
exports.getDoctorsBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.params;
    const doctors = await Doctor.find({ 
      specialization: new RegExp(specialty, 'i') 
    });


    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching doctors by specialty',
      error: error.message
    });
  }
};