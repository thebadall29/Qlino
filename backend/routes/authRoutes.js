const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Logout route
router.post('/logout', authController.logout);

// Doctor routes
router.post('/doctor-register', authController.registerDoctor);
router.post('/doctor-login', authController.doctorLogin);

module.exports = router;