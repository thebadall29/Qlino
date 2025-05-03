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
router.patch('/doctor/appointments/:id', auth, authorize(['doctor']), appointmentController.updateAppointmentStatus);

// Patient routes
router.get('/patient/appointments', auth, authorize(['patient']), appointmentController.getPatientAppointments);
router.post('/appointments', appointmentController.bookAppointmentForUnregisteredPatient);

module.exports = router;