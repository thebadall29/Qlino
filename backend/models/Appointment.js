// Update Appointment model schema to include wasOnHold field
const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  patientName: {
    type: String,
    required: true
  },
  patientEmail: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String
  },
  contact: {
    type: String
  },
  reason: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'cancelled', 'completed', 'Waiting', 'Ready', 'In Process', 'Completed', 'Hold'],
    default: 'scheduled'
  },
  type: {
    type: String,
    enum: ['slot', 'queue'],
    default: 'slot'
  },
  queueNumber: {
    type: Number
  },
  wasOnHold: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', AppointmentSchema);