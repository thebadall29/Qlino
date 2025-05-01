const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { auth, authorize } = require('../middleware/auth');

// Get doctor dashboard data
router.get('/doctor-dashboard', auth, authorize(['doctor']), doctorController.getDashboard);

// Update doctor profile
router.put('/profile', auth, authorize(['doctor']), doctorController.updateProfile);

module.exports = router;