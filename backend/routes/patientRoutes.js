const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for different file types
const createStorage = (uploadPath) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, `../uploads/${uploadPath}`);
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${uploadPath}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  });
};

// Configure file filters for different file types
const fileFilters = {
  profile: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  },
  report: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images and PDF files are allowed'));
  }
};


const uploadProfile = multer({
  storage: createStorage('patients'),
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: fileFilters.profile
});

// Add this route to get the patient's profile photo
router.get('/profile-photo', auth, authorize(['patient']), patientController.getProfilePhoto);

const uploadReport = multer({
  storage: createStorage('reports'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilters.report
});




router.post(
  '/upload-profile-photo',
  auth,
  authorize(['patient']),
  uploadProfile.single('photo'),
  patientController.uploadProfilePhoto
);
// Get patient dashboard data
router.get('/patient-dashboard', auth, authorize(['patient']), patientController.getPatientDashboard);

// Update patient profile
router.put('/patient-dashboard', auth, authorize(['patient']), async (req, res) => {
  try {
    const userId = req.user.id;
    const { personalInfo, medicalHistory } = req.body;
    
    // Find user by ID
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update personal info
    if (personalInfo) {
      user.firstName = personalInfo.firstName || user.firstName;
      user.lastName = personalInfo.lastName || user.lastName;
      user.age = personalInfo.age || user.age;
      user.gender = personalInfo.gender || user.gender;
      user.mobile = personalInfo.phone || user.mobile;
      user.emergencyContact = personalInfo.emergencyContact || user.emergencyContact;
      user.city = personalInfo.city || user.city;
      user.state = personalInfo.state || user.state;
      user.country = personalInfo.country || user.country;
    }
    
    // Update medical history
    if (medicalHistory) {
      user.chronicConditions = medicalHistory.chronicConditions || user.chronicConditions;
      user.pastSurgeries = medicalHistory.pastSurgeries || user.pastSurgeries;
      user.allergies = medicalHistory.allergies || user.allergies;
    }
    
    await user.save();
    
    res.json({
      message: 'Profile updated successfully',
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
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check if a patient is registered
router.get('/doctor/check-patient/:email', auth, authorize(['doctor']), async (req, res) => {
  try {
    const { email } = req.params;
    
    // Find the user by email
    const user = await User.findOne({ email });
    
    // Return whether the user exists and is verified
    res.status(200).json({
      success: true,
      isRegistered: !!user && user.verified
    });
  } catch (err) {
    console.error('Error checking patient registration:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



// Add a reminder for a patient
router.post('/doctor/patient/:email/reminders', auth, authorize(['doctor']), async (req, res) => {
  try {
    const { email } = req.params;
    const reminderData = req.body;
    
    // Find the patient by email
    const patient = await User.findOne({ email });
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    // Create reminder object with a unique ID
    const reminder = {
      ...reminderData,
      id: new mongoose.Types.ObjectId().toString(), // Generate a unique ID
      createdBy: req.user.id,
      createdAt: new Date()
    };
    
    // Add reminder to patient's reminders array
    patient.reminders.push(reminder);
    
    await patient.save();
    
    res.status(201).json({
      success: true,
      message: 'Reminder added successfully',
      reminder
    });
  } catch (err) {
    console.error('Error adding reminder:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all reminders for a patient
router.get('/doctor/patient/:email/reminders', auth, authorize(['doctor']), async (req, res) => {
  try {
    const { email } = req.params;
    
    // Find the patient by email
    const patient = await User.findOne({ email });
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    // Return reminders or empty array if none exist
    const reminders = patient.reminders || [];
    
    res.status(200).json({
      success: true,
      reminders
    });
  } catch (err) {
    console.error('Error fetching reminders:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update a reminder status
router.patch('/doctor/patient/:email/reminders/:id', auth, authorize(['doctor']), async (req, res) => {
  try {
    const { email, id } = req.params;
    const { status } = req.body;
    
    // Find the patient by email
    const patient = await User.findOne({ email });
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    // Find the reminder in the patient's reminders array
    const reminderIndex = patient.reminders.findIndex(r => r.id === id);
    
    if (reminderIndex === -1) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }
    
    // Update the reminder status
    patient.reminders[reminderIndex].status = status;
    
    await patient.save();
    
    res.status(200).json({
      success: true,
      message: 'Reminder status updated successfully',
      reminder: patient.reminders[reminderIndex]
    });
  } catch (err) {
    console.error('Error updating reminder status:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add a report for a patient
router.post('/doctor/patient/:email/reports', auth, authorize(['doctor']), uploadReport.single('file'), async (req, res) => {
  try {
    const { email } = req.params;
    const reportData = req.body;
    
    // Find the patient by email
    const patient = await User.findOne({ email });
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    // Create report object
    const report = {
      title: reportData.title,
      type: reportData.type,
      date: reportData.date,
      description: reportData.description,
      results: reportData.results,
      recommendations: reportData.recommendations,
      createdBy: req.user.id,
      createdAt: new Date()
    };
    
    // Add file path if a file was uploaded
    if (req.file) {
      report.fileUrl = `/uploads/reports/${req.file.filename}`;
    }
    
    // Add report to patient's medicalReports array
    patient.medicalReports.push(report);
    
    await patient.save();
    
    res.status(201).json({
      success: true,
      message: 'Report added successfully',
      report
    });
  } catch (err) {
    console.error('Error adding report:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all reports for a patient
router.get('/doctor/patient/:email/reports', auth, authorize(['doctor']), async (req, res) => {
  try {
    const { email } = req.params;
    
    // Find the patient by email
    const patient = await User.findOne({ email });
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    // Return reports or empty array if none exist
    const reports = patient.medicalReports || [];
    
    res.status(200).json({
      success: true,
      reports
    });
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add a prescription for a patient
router.post('/doctor/patient/:email/prescriptions', auth, authorize(['doctor']), async (req, res) => {
  try {
    const { email } = req.params;
    const prescriptionData = req.body;
    
    // Find the patient by email
    const patient = await User.findOne({ email });
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    // Create prescription object
    const prescription = {
      medications: prescriptionData.medications || [],
      instructions: prescriptionData.instructions || '',
      followUpDate: prescriptionData.followUpDate || '',
      doctorId: req.user.id,
      doctorName: prescriptionData.doctorName || '',
      createdAt: new Date()
    };
    
    // Add prescription to patient's prescriptions array
    patient.prescriptions.push(prescription);
    
    await patient.save();
    
    res.status(201).json({
      success: true,
      message: 'Prescription added successfully',
      prescription
    });
  } catch (err) {
    console.error('Error adding prescription:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all prescriptions for a patient
router.get('/doctor/patient/:email/prescriptions', auth, authorize(['doctor','patient']), async (req, res) => {
  try {
    const { email } = req.params;
    
    // Find the patient by email
    const patient = await User.findOne({ email });
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    // Return prescriptions or empty array if none exist
    const prescriptions = patient.prescriptions || [];
    
    res.status(200).json({
      success: true,
      prescriptions
    });
  } catch (err) {
    console.error('Error fetching prescriptions:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ... existing code ...

// Delete a prescription for a patient
router.delete('/doctor/patient/:email/prescriptions/:id', auth, authorize(['doctor']), async (req, res) => {
  try {
    const { email, id } = req.params;
    
    // Find the patient by email
    const patient = await User.findOne({ email });
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    // Find the prescription index
    const prescriptionIndex = patient.prescriptions.findIndex(p => p._id.toString() === id);
    
    if (prescriptionIndex === -1) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }
    
    // Remove the prescription
    patient.prescriptions.splice(prescriptionIndex, 1);
    
    await patient.save();
    
    res.status(200).json({
      success: true,
      message: 'Prescription deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting prescription:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update a prescription for a patient
router.put('/doctor/patient/:email/prescriptions/:id', auth, authorize(['doctor']), async (req, res) => {
  try {
    const { email, id } = req.params;
    const updatedPrescription = req.body;
    
    // Find the patient by email
    const patient = await User.findOne({ email });
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    // Find the prescription index
    const prescriptionIndex = patient.prescriptions.findIndex(p => p._id.toString() === id);
    
    if (prescriptionIndex === -1) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }
    
    // Update the prescription
    patient.prescriptions[prescriptionIndex] = {
      ...patient.prescriptions[prescriptionIndex].toObject(),
      medications: updatedPrescription.medications || patient.prescriptions[prescriptionIndex].medications,
      instructions: updatedPrescription.instructions || patient.prescriptions[prescriptionIndex].instructions,
      followUpDate: updatedPrescription.followUpDate || patient.prescriptions[prescriptionIndex].followUpDate,
      updatedAt: new Date()
    };
    
    await patient.save();
    
    res.status(200).json({
      success: true,
      message: 'Prescription updated successfully',
      prescription: patient.prescriptions[prescriptionIndex]
    });
  } catch (err) {
    console.error('Error updating prescription:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ... existing code ...

// Update patient data by doctor (unified endpoint)
router.put('/doctor/patient/:email/update', auth, async (req, res) => {
  try {
    const { email } = req.params;
    const { personalInfo, medicalHistory, prescriptions, reports, reminders } = req.body;
    
    // Find the patient by email
    const patient = await User.findOne({ email });
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    // Check if the requester is a doctor
    const doctor = await User.findById(req.user.id);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Only doctors can update patient data' });
    }
    
    // Update personal info if provided
    if (personalInfo) {
      if (personalInfo.firstName) patient.firstName = personalInfo.firstName;
      if (personalInfo.lastName) patient.lastName = personalInfo.lastName;
      if (personalInfo.age) patient.age = personalInfo.age;
      if (personalInfo.gender) patient.gender = personalInfo.gender;
      if (personalInfo.mobile) patient.mobile = personalInfo.mobile;
      if (personalInfo.phone) patient.phone = personalInfo.phone;
      if (personalInfo.city) patient.city = personalInfo.city;
      if (personalInfo.state) patient.state = personalInfo.state;
      if (personalInfo.country) patient.country = personalInfo.country;
      if (personalInfo.emergencyContact) patient.emergencyContact = personalInfo.emergencyContact;
    }
    
    // Update medical history if provided
    if (medicalHistory) {
      if (medicalHistory.chronicConditions) patient.chronicConditions = medicalHistory.chronicConditions;
      if (medicalHistory.pastSurgeries) patient.pastSurgeries = medicalHistory.pastSurgeries;
      if (medicalHistory.allergies) patient.allergies = medicalHistory.allergies;
    }
    
    // Add new prescription if provided
    if (prescriptions && prescriptions.length > 0) {
      const newPrescription = {
        medications: prescriptions[0].medications || [],
        instructions: prescriptions[0].instructions || '',
        followUpDate: prescriptions[0].followUpDate || '',
        doctorId: req.user.id,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        createdAt: new Date()
      };
      
      patient.prescriptions.push(newPrescription);
    }
    
    // Add new medical report if provided
    if (reports && reports.length > 0) {
      const newReport = {
        title: reports[0].title || '',
        type: reports[0].type || '',
        date: reports[0].date || new Date(),
        description: reports[0].description || '',
        results: reports[0].results || '',
        recommendations: reports[0].recommendations || '',
        fileUrl: reports[0].fileUrl || '',
        createdBy: req.user.id,
        createdAt: new Date()
      };
      
      patient.medicalReports.push(newReport);
    }
    
    // Add new reminders if provided
    if (reminders && reminders.length > 0) {
      const newReminder = {
        ...reminders[0],
        id: new mongoose.Types.ObjectId().toString(),
        createdBy: req.user.id,
        createdAt: new Date()
      };
      
      patient.reminders.push(newReminder);
    }
    
    // Save the updated patient record
    await patient.save();
    
    res.status(200).json({
      success: true,
      message: 'Patient data updated successfully',
      patient: {
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        prescriptions: patient.prescriptions,
        medicalReports: patient.medicalReports,
        reminders: patient.reminders
      }
    });
  } catch (err) {
    console.error('Error updating patient data:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;