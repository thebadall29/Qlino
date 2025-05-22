const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { auth, authorize } = require('../middleware/auth');

// Doctor routes
router.get('/doctor/appointments/:date', auth, authorize(['doctor']), appointmentController.getDoctorAppointments);
router.get('/doctor/slots/:date', auth, authorize(['doctor']), appointmentController.getAvailableSlots);
router.post('/doctor/appointments', auth, authorize(['doctor']), appointmentController.bookAppointmentByDoctor);
router.post('/doctor/queue', auth, authorize(['doctor']), appointmentController.addToQueue);
router.get('/doctor/queue/:date', auth, authorize(['doctor']), appointmentController.getQueue);
router.get('/doctor/slot/:date', auth, authorize(['doctor']), appointmentController.getSlotDataByDoctor);
router.patch('/doctor/queue/:id/status', auth, authorize(['doctor']), appointmentController.updateQueueStatus);
router.patch('/doctor/appointments/:id', auth, authorize(['doctor']), appointmentController.updateAppointmentStatus);
router.get('/patient/appointment/:email', auth, authorize(['doctor', 'patient']), appointmentController.getPatientAppointmentsByEmail);
router.get('/doctor/unique-patients', auth, authorize(['doctor']), appointmentController.getUniquePatientsByDoctor);
router.get('/doctor/unique-patients', auth, authorize(['patient','doctor']), appointmentController.checkPatientExists);
// In your routes file (e.g., appointmentRoutes.js)
router.put('/patient/appointment/cancel/:id', auth, authorize(['patient','doctor']), appointmentController.cancelAppointment);
// Patient routes
router.get('/patient/appointments', auth, authorize(['patient']), appointmentController.getPatientAppointments);
router.post('/appointments', appointmentController.bookAppointmentForUnregisteredPatient);
router.patch('/doctor/queue/:id/requeue', auth, authorize(['doctor']), appointmentController.readdToQueue);
// Add the new route for doctor preference
router.get('/doctor/preference', auth, authorize(['doctor']), appointmentController.getDoctorPreference);


// public appointment routes 
// Public appointment routes
router.get('/doctor/public/appointments/:date', appointmentController.getPublicDoctorAppointments);
router.get('/doctor/public/queue/:date', appointmentController.getPublicQueue);
router.post('/doctor/public/queue', appointmentController.addToPublicQueue);
router.post('/doctor/public/appointments', appointmentController.bookPublicAppointment);

// stutus routes 
module.exports = router;