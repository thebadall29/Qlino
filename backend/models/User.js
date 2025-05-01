// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient'
  },
  verified: { type: Boolean, default: false },
  
  // Personal Information
  firstName: { type: String },
  lastName: { type: String },
  fullName: { type: String },
  age: { type: String },
  gender: { type: String },
  mobile: { type: String },
  phone: { type: String },
  
  // Address Information
  city: { type: String },
  state: { type: String },
  country: { type: String },
  
  // Medical Information
  emergencyContact: { type: String },
  chronicConditions: { type: String },
  pastSurgeries: { type: String },
  allergies: { type: String },
  
  // Files
  uploadedFiles: [
    {
      id: { type: String },
      name: { type: String },
      date: { type: Date, default: Date.now },
      path: { type: String }
    }
  ],
  
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);