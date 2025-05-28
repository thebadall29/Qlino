const mongoose = require('mongoose');

const patientPhotoSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('PatientPhoto', patientPhotoSchema);