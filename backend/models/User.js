// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  googleId: { type: String },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function() { return !this.googleId; } },
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
  photoUrl: { type: String },
  
  // Medical Reports
  medicalReports: [
    {
      title: { type: String },
      type: { type: String },
      date: { type: Date, default: Date.now },
      description: { type: String },
      results: { type: String },
      recommendations: { type: String },
      fileUrl: { type: String },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    }
  ],

  prescriptions: [
    {
      medications: [
        {
          name: { type: String },
          dosage: { type: String },
          frequency: { type: String },
          duration: { type: String },
          notes: { type: String }
        }
      ],
      instructions: { type: String },
      followUpDate: { type: String },
      doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      doctorName: { type: String },
      createdAt: { type: Date, default: Date.now }
    }
  ],


  
  // Reminders
  reminders: [
    {
      title: { type: String, required: true },
      description: { type: String },
      date: { type: Date, required: true },
      time: { type: String },
      type: { 
        type: String, 
        enum: ['medication', 'appointment', 'test', 'other'],
        default: 'other'
      },
      status: { 
        type: String, 
        enum: ['pending', 'completed', 'missed'],
        default: 'pending'
      },
      recurring: { type: Boolean, default: false },
      recurringPattern: { 
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'custom'],
        default: 'daily'
      },
      notificationTime: { type: Number, default: 30 }, // minutes before reminder
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
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