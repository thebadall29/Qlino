const User = require('../models/User');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { invalidateToken } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, mobile, role, specialization, experience } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
    }
    
    // Create new user with verified status
    const user = new User({
      username: username || `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
      firstName,
      lastName,
      mobile,
      email,
      password,
      role: role || 'patient',
      verified: true,
      // Add doctor-specific fields if role is doctor
      ...(role === 'doctor' && {
        specialization,
        experience
      })
    });
    
    await user.save();
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Error registering user' });
  }
};

// Remove verifyUser function since it's no longer needed
// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    console.log('User found:', user.username);
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    // When creating the JWT token during login
    const token = jwt.sign(
      { id: user._id, role: user.role }, // Make sure you're using _id from MongoDB
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1d' }
    );
    console.log('JWT token generated successfully');
    
    // Return user data and token
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Login error details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Logout user
exports.logout = (req, res) => {
  invalidateToken(req.token);
  res.json({ message: 'Logged out successfully' });
};

// Doctor registration
exports.registerDoctor = async (req, res) => {
  try {
    const { firstName, lastName, email, password, specialization, mobile, experience } = req.body;
    
    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ email });
    
    if (existingDoctor) {
      return res.status(400).json({ 
        message: 'Doctor with this email already exists' 
      });
    }
    
    // Generate a username based on first and last name
    const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
    
    // Check if username already exists
    const existingUsername = await Doctor.findOne({ username });
    
    // If username exists, add a random number to make it unique
    const finalUsername = existingUsername 
      ? `${username}_${Math.floor(Math.random() * 1000)}`
      : username;
    
    // Create new doctor using Doctor model
    const doctor = new Doctor({
      firstName,
      lastName,
      username: finalUsername, // Set the username explicitly
      email,
      password,
      specialization,
      mobile,
      experience,
      verified: true,
      workingDays: {
        monday: { active: true, startTime: '09:00', endTime: '17:00' },
        tuesday: { active: true, startTime: '09:00', endTime: '17:00' },
        wednesday: { active: true, startTime: '09:00', endTime: '17:00' },
        thursday: { active: true, startTime: '09:00', endTime: '17:00' },
        friday: { active: true, startTime: '09:00', endTime: '17:00' },
        saturday: { active: false, startTime: '09:00', endTime: '17:00' },
        sunday: { active: false, startTime: '09:00', endTime: '17:00' }
      },
      treatments: []
    });
    
    await doctor.save();
    
    res.status(201).json({
      message: 'Doctor registered successfully',
      doctor: {
        id: doctor._id,
        email: doctor.email,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialization: doctor.specialization
      }
    });
    
  } catch (err) {
    console.error('Doctor registration error:', err);
    res.status(500).json({ message: 'Error registering doctor', error: err.message });
  }
};

// Doctor login
exports.doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Doctor login attempt for email:', email);
    
    // Find doctor by email using Doctor model
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      console.log('Doctor not found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    console.log('Doctor found:', doctor.firstName);
    
    // Verify password
    const isMatch = await bcrypt.compare(password, doctor.password);
    console.log('Password match result:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: doctor._id, role: 'doctor' },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1d' }
    );
    console.log('JWT token generated successfully');
    
    // Return doctor data and token
    res.json({
      token,
      user: {
        id: doctor._id,
        email: doctor.email,
        role: 'doctor',
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialization: doctor.specialization
      }
    });
  } catch (error) {
    console.error('Doctor login error details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
