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

module.exports = router;