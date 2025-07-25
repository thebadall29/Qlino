const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');

// Initialize passport
require('../config/passport');

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Logout route
router.post('/logout', authController.logout);

// Doctor routes
router.post('/doctor-register', authController.registerDoctor);
router.post('/doctor-login', authController.doctorLogin);

// Google OAuth routes
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);

// Google OAuth for doctors
router.get('/google/doctor', authController.googleDoctorAuth);

// Google OAuth for patients
router.get('/google/patient', authController.googlePatientAuth);

module.exports = router;