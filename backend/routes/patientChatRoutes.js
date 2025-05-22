const express = require('express');
const router = express.Router();
const patientChatController = require('../controllers/patientChatContoller');
const { auth, authorize } = require('../middleware/auth');

// Apply patient authentication middleware to all routes
router.use(auth);
router.use(authorize(['patient']));

// Get all doctors the patient has had appointments with
router.get('/doctors', patientChatController.getDoctorsList);

// Get chat history with a specific doctor
router.get('/history/:doctorId', patientChatController.getChatHistory);

// Send message to a doctor
router.post('/send/:doctorId/messages', patientChatController.sendMessage);

module.exports = router;