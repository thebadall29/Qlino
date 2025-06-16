const mongoose = require('mongoose');

const doctorPreferenceSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  bookingPreference: {
    type: String,
    enum: ['slot', 'queue'],
    default: 'slot'
  },
  slotDuration: {
    type: Number,
    default: 30 // minutes
  },
  maxPatientsPerDay: {
    type: Number,
    default: 20
  },
  breakTime: {
    start: {
      type: String,
      default: '13:00'
    },
    end: {
      type: String,
      default: '14:00'
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('DoctorPreference', doctorPreferenceSchema);