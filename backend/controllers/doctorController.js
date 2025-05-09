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