const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { auth, authorize } = require('../middleware/auth');


// Get doctor dashboard data
router.get('/doctor-dashboard', auth, authorize(['doctor']), doctorController.getDashboard);

// Update doctor profile
router.put('/profile', auth, authorize(['doctor']), doctorController.updateProfile);

// Search routes - these are public routes that don't require authentication
router.get('/search', doctorController.searchDoctors);
router.get('/locations', doctorController.getLocations);

// Get all doctors
router.get('/', doctorController.getAllDoctors);

// Get doctor by ID
router.get('/:id/data', doctorController.getDoctorById);




// Delete doctor
router.delete('/:id', doctorController.deleteDoctor);


// Get doctor's reviews
router.get('/:id/reviews', doctorController.getDoctorReviews);

// Add review to doctor
router.post('/:id/reviews', doctorController.addDoctorReview);

// public doctor routes 
// public doctor routes 
router.get('/public/doctor-dashboard', doctorController.getPublicDashboard);

module.exports = router;