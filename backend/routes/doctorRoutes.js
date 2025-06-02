const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { auth, authorize } = require('../middleware/auth');

const multer = require('multer');
const path = require('path');
const upload = multer({
  dest: 'uploads/photos/', // or use diskStorage for custom filename
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB, adjust as needed
});





// Get doctor dashboard data
router.get('/doctor-dashboard', auth, authorize(['doctor']), doctorController.getDashboard);

// Update doctor profile
router.put('/profile', auth, authorize(['doctor']), doctorController.updateProfile);
router.post('/upload-photo', auth, authorize(['doctor']), upload.single('photo'), doctorController.uploadPhoto);

// Search routes - these are public routes that don't require authentication
router.get('/search', doctorController.searchDoctors);
router.get('/locations', doctorController.getLocations);
// Add this route with your other doctor routes
router.get('/unique-patient', auth, authorize(['doctor']), doctorController.getUniquePatients);

// Get all doctors
router.get('/', doctorController.getAllDoctors);

// Get doctor by ID
router.get('/:id', doctorController.getDoctorById);


router.delete('/:id', doctorController.deleteDoctor);

// Get doctor's reviews
router.get('/:id/reviews', doctorController.getDoctorReviews);

// Add review to doctor
router.post('/:id/reviews', doctorController.addDoctorReview);

router.get('/public/doctor-dashboard', doctorController.getPublicDashboard);

// Photo management routes
router.post('/photos', auth, authorize(['doctor']), upload.single('image'), doctorController.addPhoto);
router.get('/photos', doctorController.getPhotos);
router.get('/photos/:doctorId', doctorController.getPhotosByDoctorId);
router.delete('/photos/:id', auth,authorize(['doctor']), doctorController.deletePhoto);

module.exports = router;