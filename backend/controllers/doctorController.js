const Doctor = require('../models/Doctor');
const Review = require('../models/Review');
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const DoctorPhoto = require('../models/DoctorPhoto');
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
    consultationFee: doctor.consultationFee || '1000',
    consultationTime: doctor.consultationTime || '20 minutes',
    availableDays: formatWorkingDays(doctor.workingDays),
    timings: doctor.timings || '10:00 AM - 4:00 PM',
    registrationNumber: doctor.registrationNumber || 'MCI-12345',
    languages: doctor.languages || 'English, Hindi',
    services: doctor.treatments || [],
    photoUrl: doctor.photoUrl || '',
    tags:doctor.tags || [],
    fees: doctor.fees || []
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
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid doctor ID format' 
      });
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
    
    // Return the complete doctor document along with formatted data
    const doctorResponse = {
      // Include the complete doctor document
      doctor: doctor.toObject(), // Convert to plain object to include all fields
      // Include the formatted data
      formattedDoctor: formatDoctorResponse(doctor),
      averageRating: averageRating,
      reviews: formattedReviews,
      appointments: formattedAppointments,
      photos: photos
    };
    
    res.status(200).json(doctorResponse);
  } catch (error) {
    console.error('Error getting doctor by ID:', error);
   
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
      return res.status(400).json({ message: '' });
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
    
    // if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    //   return res.status(400).json({ message: 'Invalid doctor ID format' });
    // }
    
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
    
    // if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    //   return res.status(400).json({ message: 'Invalid doctor ID format' });
    // }
    
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

// Add photo
exports.addPhoto = async (req, res) => {
  try {
    const { title, description } = req.body;
    const doctorId = req.user.id;
    if (!title || !req.file) {
      return res.status(400).json({ message: 'Title and image are required' });
    }
    const imageUrl = `/uploads/photos/${req.file.filename}`;
    const newPhoto = new DoctorPhoto({
      doctorId,
      title,
      description,
      imageUrl
    });
    await newPhoto.save();
    res.status(201).json({ success: true, photo: newPhoto });
  } catch (error) {
    console.error('Error adding photo:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get photos by doctor ID
exports.getPhotosByDoctorId = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;

    const photos = await DoctorPhoto.find({ doctorId }).sort({ createdAt: -1 });
    res.json({ success: true, photos });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all photos for a doctor
exports.getPhotos = async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    const photos = await DoctorPhoto.find({ doctorId }).sort({ createdAt: -1 });

    
    res.json({ success: true, photos });
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a photo
exports.deletePhoto = async (req, res) => {
  try {
    const photoId = req.params.id;
    const doctorId = req.user.id; // Changed from req.doctor.id to req.user.id

    const photo = await DoctorPhoto.findById(photoId);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Ensure the photo belongs to the doctor
    if (photo.doctorId.toString() !== doctorId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await DoctorPhoto.findByIdAndDelete(photoId);
    res.json({ success: true, message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUniquePatients = async (req, res) => {
   try {
    const doctorId = req.user.id; // Get the doctor ID from the authenticated user
    
    // Find all appointments for this doctor
    const appointments = await Appointment.find({ doctorId })
      .sort({ createdAt: -1 }); // Sort by creation date, newest first
    // Create a map to store unique patients by email
    const uniquePatientsMap = new Map();
    
    // Process each appointment to extract unique patients
    appointments.forEach(appointment => {
      const patientEmail = appointment.patientEmail;
      
      // Only add this patient if we haven't seen this email before
      if (!uniquePatientsMap.has(patientEmail)) {
        uniquePatientsMap.set(patientEmail, {
          id: appointment._id,
          name: appointment.patientName,
          email: patientEmail,
          contactNumber: appointment.contact,
          lastAppointment: appointment.date,
          appointmentCount: 1,
          lastReason: appointment.reason
        });
      } else {
        // If we've seen this patient before, increment their appointment count
        const patient = uniquePatientsMap.get(patientEmail);
        patient.appointmentCount += 1;
        
        // Update last appointment date if this one is more recent
        if (new Date(appointment.date) > new Date(patient.lastAppointment)) {
          patient.lastAppointment = appointment.date;
          patient.lastReason = appointment.reason;
        }
      }
    });
    
    // Convert the map to an array of unique patients
    const uniquePatients = Array.from(uniquePatientsMap.values());

    
    return res.status(200).json({
      success: true,
      message: 'Unique patients retrieved successfully',
      count: uniquePatients.length,
      patients: uniquePatients
    });
  } catch (error) {
    console.error('Error retrieving unique patients:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve unique patients',
      error: error.message
    });
  }
};

exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Change req.doctor.id to req.user.id
    const doctor = await Doctor.findById(req.user.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Update doctor's photo URL in database - add /photos/ to the path
    doctor.photoUrl = `/uploads/photos/${req.file.filename}`;
    await doctor.save();

    res.json({ 
      message: 'Photo uploaded successfully',
      photoUrl: doctor.photoUrl 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading photo' });
  }
};

// Get doctor's booking preference
exports.getDoctorPreference = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const doctor = await Doctor.findById(doctorId).select('bookingPreference');

    
    
    if (!doctor) {
      return res.status(404).json({ 
        success: false,
        message: 'Doctor not found' 
      });
    }
    
    return res.status(200).json({
      success: true,
      preference: doctor.bookingPreference || 'slot' // Default to 'slot' if not set
    });
  } catch (error) {
    console.error('Error getting doctor preference:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching doctor preference',
      error: error.message
    });
  }
};

// Get doctor dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json({
      success: true,
      doctor:formatDoctorResponse(doctor)
    });
  } catch (error) {
    console.error('Error getting dashboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update doctor profile
exports.updateProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const updateFields = [
      'username', 'firstName', 'lastName', 'email', 'specialization', 
      'experience', 'qualification', 'mobile', 'emergency',
      'address', 'city', 'state', 'country', 'about', 'bookingPreference',
      'tags', 'consultationFee', // Added consultationFee here
      'photoUrl' // Add this field
    ];
    
    console.log("tags",req.body.tags); // Debug log to check tags
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        // Convert consultationFee to number
        if (field === 'consultationFee') {
          doctor[field] = Number(req.body[field]);
        } else {
          doctor[field] = req.body[field];
        }
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
        bookingPreference: doctor.bookingPreference,
        tags:doctor.tags,
        consultationFee: doctor.consultationFee // Include consultationFee in response
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
    const { query, location, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let searchQuery = {};

    // Handle location search
    if (location && location.trim()) {
      const locationParts = location.trim().split(',').map(part => part.trim());
      const city = locationParts[0];
      const state = locationParts[1];

      if (state) {
        searchQuery = {
          $and: [
            { city: new RegExp(`^${city}`, 'i') },
            { state: new RegExp(`^${state}`, 'i') }
          ]
        };
      } else {
        searchQuery = {
          $or: [
            { city: new RegExp(`^${city}`, 'i') },
            { state: new RegExp(`^${city}`, 'i') }
          ]
        };
      }
    }

    // Handle query search (name, specialization, tags)
    if (query && query.trim()) {
      const queryTerms = query.trim().split(/\s+/);
      
      const queryConditions = [
        // Full name match
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ["$firstName", " ", "$lastName"] },
              regex: new RegExp(query.trim(), 'i')
            }
          }
        },
        // Individual term matches for names
        ...queryTerms.map(term => ({
          $or: [
            { firstName: new RegExp(`^${term}`, 'i') },
            { lastName: new RegExp(`^${term}`, 'i') }
          ]
        })),
        // Other fields
        { specialization: new RegExp(query.trim(), 'i') },
        { tags: new RegExp(query.trim(), 'i') },
        { 'treatments.name': new RegExp(query.trim(), 'i') }
      ];

      // Combine location and query conditions
      if (Object.keys(searchQuery).length > 0) {
        searchQuery = {
          $and: [
            searchQuery,
            { $or: queryConditions }
          ]
        };
      } else {
        searchQuery = { $or: queryConditions };
      }
    }


    // Get total count with improved performance
    const [total, doctors] = await Promise.all([
      Doctor.countDocuments(searchQuery),
      Doctor
        .find(searchQuery)
        .select('firstName lastName specialization city state experience treatments tags photoUrl')
        .sort({ firstName: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean()
    ]);

    // Format the response with improved name handling
    const formattedDoctors = doctors.map(doctor => ({
      id: doctor._id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      name: `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim(),
      specialization: doctor.specialization,
      city: doctor.city,
      state: doctor.state,
      location: doctor.city && doctor.state 
        ? `${doctor.city}, ${doctor.state}`
        : doctor.city || doctor.state || 'Location not available',
      experience: doctor.experience,
      treatments: doctor.treatments || [],
      tags: doctor.tags || [],
      photoUrl: doctor.photoUrl
    }));
    res.json({
      success: true,
      doctors: formattedDoctors,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      resultsPerPage: parseInt(limit),
      query: query || '',
      location: location || ''
    });

  } catch (error) {
    console.error('Error in searchDoctors:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error searching doctors', 
      error: error.message 
    });
  }
};

// Helper function to get synonyms and related terms
const getSynonymsAndRelatedTerms = (term) => {
  // Add common medical term variations and synonyms
  const medicalTermsMap = {
    'pain': ['ache', 'discomfort', 'soreness'],
    'chest': ['thoracic', 'cardiac', 'heart'],
    'stomach': ['abdominal', 'digestive', 'gastric'],
    'head': ['cranial', 'migraine', 'headache'],
    // Add more medical terms and their variations
  };

  return medicalTermsMap[term.toLowerCase()] || [];
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

// Add these methods to the doctor controller
exports.updateTags = async (req, res) => {
  try {
    const { tags } = req.body;
    const doctorId = req.user.id;

    console.log('Received tags:', tags); // Debug log

    // Validate tags
    if (!Array.isArray(tags)) {
      return res.status(400).json({ message: 'Tags must be an array' });
    }

    if (tags.length > 10) {
      return res.status(400).json({ message: 'Maximum 10 tags allowed' });
    }

    // Clean and validate each tag
    const cleanedTags = tags.map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    const totalLength = cleanedTags.reduce((sum, tag) => sum + tag.length, 0);
    if (totalLength > 500) {
      return res.status(400).json({ message: 'Total tags length exceeds 500 characters' });
    }

    // Update doctor tags using findOneAndUpdate
    const doctor = await Doctor.findOneAndUpdate(
      { _id: doctorId },
      { $set: { tags: cleanedTags } },
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    console.log('Updated doctor:', doctor); // Debug log

    res.json({ 
      success: true,
      message: 'Tags updated successfully',
      tags: doctor.tags 
    });
  } catch (error) {
    console.error('Error updating tags:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating tags',
      error: error.message 
    });
  }
};

exports.getTags = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json({ tags: doctor.tags || [] });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ message: 'Error fetching tags' });
  }
};

// Add these new methods

// Get doctor fees
exports.getFees = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not found' 
      });
    }

    res.json({
      success: true,
      fees: doctor.fees || []
    });
  } catch (error) {
    console.error('Error getting fees:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching fees',
      error: error.message 
    });
  }
};

// Update doctor fees
exports.updateFees = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { fees } = req.body;

    // Validate fees array
    if (!Array.isArray(fees)) {
      return res.status(400).json({
        success: false,
        message: 'Fees must be an array'
      });
    }

    // Validate each fee object
    for (const fee of fees) {
      if (!fee.type || !fee.amount) {
        return res.status(400).json({
          success: false,
          message: 'Each fee must have a type and amount'
        });
      }
      if (fee.amount < 0) {
        return res.status(400).json({
          success: false,
          message: 'Fee amount cannot be negative'
        });
      }
    }

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { $set: { fees: fees } },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Fees updated successfully',
      fees: doctor.fees
    });
  } catch (error) {
    console.error('Error updating fees:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating fees',
      error: error.message
    });
  }
};

// Add single fee
exports.addFee = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { type, amount } = req.body;

    // Validate input
    if (!type || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Fee type and amount are required'
      });
    }

    if (amount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Fee amount cannot be negative'
      });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { $push: { fees: { type, amount } } },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Fee added successfully',
      fees: doctor.fees
    });
  } catch (error) {
    console.error('Error adding fee:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding fee',
      error: error.message
    });
  }
};

// Delete fee
exports.deleteFee = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { feeId } = req.params;

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { $pull: { fees: { _id: feeId } } },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Fee deleted successfully',
      fees: doctor.fees
    });
  } catch (error) {
    console.error('Error deleting fee:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting fee',
      error: error.message
    });
  }
};
