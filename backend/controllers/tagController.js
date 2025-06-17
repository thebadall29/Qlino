const Doctor = require('../models/Doctor');

exports.getAllTags = async (req, res) => {
  try {
    // Aggregate tags from doctors collection
    const tags = await Doctor.aggregate([
      // Unwind tags array
      { $unwind: '$tags' },
      // Group by tag name and count doctors
      {
        $group: {
          _id: '$tags',
          doctorCount: { $sum: 1 }
        }
      },
      // Format output
      {
        $project: {
          _id: 0,
          name: '$_id',
          doctorCount: 1
        }
      },
      // Sort by doctor count
      { $sort: { doctorCount: -1 } }
    ]);

    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching tags' 
    });
  }
};

exports.searchDoctorsByTag = async (req, res) => {
  try {
    const { tag } = req.query;

    if (!tag) {
      return res.status(400).json({
        success: false,
        message: 'Tag parameter is required'
      });
    }

    const tagRegex = new RegExp(tag, 'i');
    
    const doctors = await Doctor.find({
      tags: { $regex: tagRegex }
    })
    .select('firstName lastName specialization city state experience treatments tags photoUrl')
    .sort({ firstName: 1 })
    .lean();

    const formattedDoctors = doctors.map(doctor => ({
      _id: doctor._id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      name: `${doctor.firstName} ${doctor.lastName}`,
      specialization: doctor.specialization,
      city: doctor.city,
      state: doctor.state,
      experience: doctor.experience,
      treatments: doctor.treatments || [],
      tags: doctor.tags || [],
      photoUrl: doctor.photoUrl
    }));

    res.json({
      success: true,
      doctors: formattedDoctors
    });

  } catch (error) {
    console.error('Error in searchDoctorsByTag:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching doctors by tag'
    });
  }
};