const express = require('express');
const router = express.Router();
const doctorChatController = require('../controllers/doctorChatController');
const { auth, authorize } = require('../middleware/auth');

// Apply doctor authentication middleware to all routes
router.use(auth);
router.use(authorize(['doctor']));

// Get all patients who have had appointments with this doctor
router.get('/patients', doctorChatController.getPatientsList);

// Get chat history with a specific patient
router.get('/history/:patientId', doctorChatController.getChatHistory);

// Send message to a patient
router.post('/send/:patientId/messages', doctorChatController.sendMessage);

module.exports = router;