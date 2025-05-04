const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Optional for unregistered patients
  },
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  patientEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  contactNumber: {
    type: String,
    // required: true,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit contact number']
  },
  date: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v >= new Date(new Date().setHours(0, 0, 0, 0));
      },
      message: 'Appointment date cannot be in the past'
    }
  },
  time: {
    type: String,
    // required: true,
    match: [/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/, 'Please enter time in format: HH:MM AM/PM']
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  queueNumber: {
    type: Number,
    // Optional for slot-based appointments
  },
  type: {
    type: String,
    enum: ['slot', 'queue'],
    default: 'slot'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for common queries
AppointmentSchema.index({ doctorId: 1, date: 1 });
AppointmentSchema.index({ patientEmail: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);