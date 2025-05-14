

const Doctor = require('../models/Doctor');
const Review = require('../models/Review');
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
// Helper function to format doctor data for frontend
const formatDoctorResponse = (doctor) => {
  return {
    _id: doctor._id,
    firstName: doctor.firstName,
    lastName: doctor.lastName,
    name: `${doctor.firstName} ${doctor.lastName}`,
    username: doctor.username,
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
    verified: doctor.verified,
    workingDays: doctor.workingDays,
    treatments: doctor.treatments,
    bookingPreference: doctor.bookingPreference,
    location: doctor.city ? `${doctor.city}, ${doctor.state}` : 'Location not available',
    // Additional formatting for frontend
    consultationFee: doctor.consultationFee || '1000',
    consultationTime: doctor.consultationTime || '20 minutes',
    availableDays: formatWorkingDays(doctor.workingDays),
    timings: doctor.timings || '10:00 AM - 4:00 PM',
    registrationNumber: doctor.registrationNumber || 'MCI-12345',
    languages: doctor.languages || 'English, Hindi',
    services: doctor.treatments || []
  };
};

// Format working days object to string
const formatWorkingDays = (workingDays) => {
  if (!workingDays) return 'Not specified';
  
  const daysMap = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun'
  };
  
  const availableDays = Object.entries(workingDays)
    .filter(([_, isAvailable]) => isAvailable)
    .map(([day, _]) => daysMap[day] || day);
  
  return availableDays.length > 0 ? availableDays.join(', ') : 'Not specified';
};

// Get all doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    const formattedDoctors = doctors.map(doctor => formatDoctorResponse(doctor));
    
    res.status(200).json(formattedDoctors);
  } catch (error) {
    console.error('Error getting doctors:', error);
    res.status(500).json({ message: 'Failed to get doctors', error: error.message });
  }
};

// Get doctor by ID
exports.getDoctorById = async (req, res) => {
  try {
    const doctorId = req.params.id;
    console.log('Getting doctor details for ID:', doctorId);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctor ID format' });
    }
    
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Get reviews for this doctor
    const reviews = await Review.find({ doctorId }).sort({ createdAt: -1 });
    
    // Get appointments for this doctor
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const appointments = await Appointment.find({
      doctorId,
      date: { $gte: today }
    }).sort({ date: 1, time: 1 });
    
    // Format appointments for frontend
    const formattedAppointments = appointments.map(app => ({
      id: app._id,
      date: app.date.toISOString().split('T')[0],
      time: app.time,
      status: app.status || 'Available'
    }));
    
    // Calculate average rating
    const averageRating = reviews.length > 0 
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : 0;
    
    // Format reviews for frontend
    const formattedReviews = reviews.map(review => ({
      id: review._id,
      patientName: review.patientName || 'Anonymous',
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt.toISOString().split('T')[0]
    }));
    
    // Mock photos data since you might not have this in your database yet
    const photos = [
      { id: 201, url: 'https://via.placeholder.com/300x200?text=Doctor+Profile', caption: 'Profile Photo' },
      { id: 202, url: 'https://via.placeholder.com/300x200?text=Clinic', caption: 'Clinic Entrance' },
      { id: 203, url: 'https://via.placeholder.com/300x200?text=Certificate', caption: 'Medical Certificate' }
    ];
    
    // Combine all data
    const doctorResponse = {
      ...formatDoctorResponse(doctor),
      averageRating: averageRating,
      reviews: formattedReviews,
      appointments: formattedAppointments,
      photos: photos
    };
    
    res.status(200).json(doctorResponse);
  } catch (error) {
    console.error('Error getting doctor by ID:', error);
    res.status(500).json({ message: 'Failed to get doctor details', error: error.message });
  }
};

// Public version of getDashboard
exports.getPublicDashboard = async (req, res) => {
  try {
    // Get doctorId from query parameters instead of auth token
    const { doctorId } = req.query;
    
    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID is required for public access'
      });
    }
    
    // Find the doctor by ID
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Get today's date
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    // Get appointments for today
    const appointments = await Appointment.find({
      doctorId,
      date: {
        $gte: new Date(`${formattedDate}T00:00:00.000Z`),
        $lt: new Date(`${formattedDate}T23:59:59.999Z`)
      }
    }).sort({ time: 1 });
    
    // Get queue for today
    const queue = await Appointment.find({
      doctorId,
      type: 'queue',
      date: {
        $gte: new Date(`${formattedDate}T00:00:00.000Z`),
        $lt: new Date(`${formattedDate}T23:59:59.999Z`)
      }
    }).sort({ queueNumber: 1 });
    
    // Get total patients count
    const totalPatients = await Appointment.countDocuments({
      doctorId,
      status: { $in: ['completed', 'no-show'] }
    });
    
    // Get total appointments count
    const totalAppointments = await Appointment.countDocuments({
      doctorId
    });
    
    // Return public dashboard data (excluding sensitive information)
    return res.status(200).json({
      success: true,
      doctor: {
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialization: doctor.specialization,
        experience: doctor.experience,
        qualification: doctor.qualification,
        city: doctor.city,
        state: doctor.state,
        country: doctor.country,
        about: doctor.about,
        workingDays: doctor.workingDays,
        treatments: doctor.treatments,
        bookingPreference: doctor.bookingPreference
      },
      todayAppointments: appointments.length,
      todayQueue: queue.length,
      totalPatients,
      totalAppointments
    });
  } catch (error) {
    console.error('Error getting public doctor dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete doctor
exports.deleteDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctor ID format' });
    }
    
    const deletedDoctor = await Doctor.findByIdAndDelete(doctorId);
    
    if (!deletedDoctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.status(200).json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ message: 'Failed to delete doctor', error: error.message });
  }
};


// Get doctor's reviews
exports.getDoctorReviews = async (req, res) => {
  try {
    const doctorId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctor ID format' });
    }
    
    const reviews = await Review.find({ doctorId })
      .sort({ createdAt: -1 })
      .populate('patientId', 'firstName lastName');
    
    const formattedReviews = reviews.map(review => ({
      id: review._id,
      patientName: review.patientId ? `${review.patientId.firstName} ${review.patientId.lastName}` : 'Anonymous',
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt.toISOString().split('T')[0]
    }));
    
    const averageRating = reviews.length > 0 
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : 0;
    
    res.status(200).json({
      reviews: formattedReviews,
      averageRating,
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error('Error getting doctor reviews:', error);
    res.status(500).json({ message: 'Failed to get reviews', error: error.message });
  }
};

// Add review to doctor
exports.addDoctorReview = async (req, res) => {
  try {
    const doctorId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctor ID format' });
    }
    
    const { patientId, rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating is required and must be between 1 and 5' });
    }
    
    const review = new Review({
      doctorId,
      patientId,
      rating,
      comment,
      createdAt: new Date()
    });
    
    const savedReview = await review.save();
    
    // If you want to populate patient data
    await savedReview.populate('patientId', 'firstName lastName');
    
    const formattedReview = {
      id: savedReview._id,
      patientName: savedReview.patientId ? `${savedReview.patientId.firstName} ${savedReview.patientId.lastName}` : 'Anonymous',
      rating: savedReview.rating,
      comment: savedReview.comment,
      date: savedReview.createdAt.toISOString().split('T')[0]
    };
    
    res.status(201).json(formattedReview);
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Failed to add review', error: error.message });
  }
};

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
        username: doctor.username, // Include username in the response
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
        treatments: doctor.treatments || [],
        bookingPreference: doctor.bookingPreference
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
      'username', 'firstName', 'lastName', 'email', 'specialization', 
      'experience', 'qualification', 'mobile', 'emergency',
      'address', 'city', 'state', 'country', 'about', 'bookingPreference'
    ];
    
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        doctor[field] = req.body[field];
      }
    });
    
    // If username is not provided in the request, use email as username
    if (!doctor.username && doctor.email) {
      doctor.username = doctor.email.split('@')[0];
    }
    
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
        username: doctor.username,
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
        treatments: doctor.treatments,
        bookingPreference: doctor.bookingPreference
      }
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search for doctors based on name, specialization and location
exports.searchDoctors = async (req, res) => {
  try {
    const { query, location } = req.query;

    console.log('Search query:', query);
    console.log('Location:', location);
    
    if (!query && !location) {
      return res.status(400).json({ message: 'Search query or location is required' });
    }

    let searchConditions = { verified: true };
    
    // Add query search condition if provided
    if (query) {
      const queryRegex = new RegExp(query, 'i');
      searchConditions['$or'] = [
        { firstName: queryRegex },
        { lastName: queryRegex },
        { specialization: queryRegex },
        { treatments: queryRegex }
      ];
    }
    
    // Add location search condition if provided
    if (location) {
      const locationParts = location.split(',').map(part => part.trim());
      
      // Create a more specific location filter
      const locationFilter = [];
      
      if (locationParts.length > 1) {
        // If format is "City, State"
        locationFilter.push(
          { city: new RegExp('^' + locationParts[0] + '$', 'i') },
          { city: new RegExp(locationParts[0], 'i'), state: new RegExp(locationParts[1], 'i') }
        );
      } else {
        // If only city is provided
        locationFilter.push(
          { city: new RegExp('^' + location + '$', 'i') },
          { state: new RegExp('^' + location + '$', 'i') }
        );
      }
      
      // If we have both query and location, we need to structure the conditions differently
      if (query) {
        // If query is also provided, we need doctors that match BOTH the query AND location
        const queryConditions = searchConditions['$or'];
        delete searchConditions['$or'];
        
        searchConditions['$and'] = [
          { '$or': queryConditions },
          { '$or': locationFilter }
        ];
      } else {
        // If only location is provided
        searchConditions['$or'] = locationFilter;
      }
    }
    
    console.log('Search conditions:', JSON.stringify(searchConditions, null, 2));
    
    // Find doctors that match the search conditions
    const doctors = await Doctor.find(searchConditions)
      .select('firstName lastName specialization city state qualification experience')
      .limit(10);
    
    // Format the response
    const formattedDoctors = doctors.map(doc => ({
      id: doc._id,
      name: `${doc.firstName} ${doc.lastName}`,
      specialization: doc.specialization,
      location: doc.city ? `${doc.city}, ${doc.state}` : doc.state || '',
      qualification: doc.qualification,
      experience: doc.experience
    }));
    
    res.json(formattedDoctors);
  } catch (error) {
    console.error('Error in searchDoctors:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all locations from doctors database
exports.getLocations = async (req, res) => {
  try {
    const { query } = req.query;
    
    // Use aggregation to get unique city-state combinations
    let locationQuery = [];
    
    if (query) {
      // If search query is provided
      const queryRegex = new RegExp(query, 'i');
      locationQuery = [
        { $match: { 
          $or: [
            { city: queryRegex },
            { state: queryRegex }
          ],
          city: { $exists: true, $ne: '' } // Ensure city exists and is not empty
        }}
      ];
    } else {
      // If no query, just filter for non-empty cities
      locationQuery = [
        { $match: { 
          city: { $exists: true, $ne: '' } // Ensure city exists and is not empty
        }}
      ];
    }
    
    // Complete the aggregation pipeline
    const pipeline = [
      ...locationQuery,
      { $group: { 
        _id: { city: '$city', state: '$state' },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.city': 1, '_id.state': 1 }},
      { $project: {
        _id: 0,
        city: '$_id.city',
        state: '$_id.state',
        location: { 
          $concat: [
            '$_id.city', 
            { $cond: [{ $eq: ['$_id.state', ''] }, '', { $concat: [', ', '$_id.state'] }] }
          ]
        },
        count: 1
      }}
    ];
    
    const locations = await Doctor.aggregate(pipeline);
    
    res.json(locations);
  } catch (error) {
    console.error('Error in getLocations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};