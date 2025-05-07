const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Send notification to a patient
router.post('/patient/:id', notificationController.sendPatientNotification);

// Get notifications for the authenticated user
router.get('/user', notificationController.getUserNotifications);

// Mark notification as read
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;