const express = require('express');
const router = express.Router();
const specialtyController = require('../controllers/specialtyController');
const { auth } = require('../middleware/auth');

// Get all specialties with doctor count
router.get('/', specialtyController.getAllSpecialties);

// Get doctors by specialty
router.get('/:specialty/doctors', specialtyController.getDoctorsBySpecialty);

module.exports = router;