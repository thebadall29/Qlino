const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const DoctorSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    default: ''
  },
  qualification: {
    type: String,
    default: ''
  },
  mobile: {
    type: String,
    default: ''
  },
  emergency: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  about: {
    type: String,
    default: ''
  },
  verified: {
    type: Boolean,
    default: false
  },
  workingDays: {
    type: Object,
    default: {
      monday: { active: true, startTime: '09:00', endTime: '17:00' },
      tuesday: { active: true, startTime: '09:00', endTime: '17:00' },
      wednesday: { active: true, startTime: '09:00', endTime: '17:00' },
      thursday: { active: true, startTime: '09:00', endTime: '17:00' },
      friday: { active: true, startTime: '09:00', endTime: '17:00' },
      saturday: { active: false, startTime: '09:00', endTime: '17:00' },
      sunday: { active: false, startTime: '09:00', endTime: '17:00' }
    }
  },
  treatments: {
    type: Array,
    default: []
  },
  bookingPreference:{
    type: String,
    default: 'slot'
  }
}, {
  timestamps: true
});

// Generate username before saving if not provided
DoctorSchema.pre('save', async function(next) {
  // Generate username if not provided
  if (!this.username) {
    this.username = `${this.firstName.toLowerCase()}_${this.lastName.toLowerCase()}`;
  }
  next();
});

// Hash password before saving
DoctorSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Doctor', DoctorSchema);