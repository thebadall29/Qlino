const User = require('../models/User');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { invalidateToken } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, mobile, role, specialization, experience } = req.body;
    
    // Check if email exists in either User or Doctor collection
    const existingUser = await User.findOne({ email });
    const existingDoctor = await Doctor.findOne({ email });
    
    if (existingUser || existingDoctor) {
      return res.status(400).json({ 
        message: 'This email is already registered. Please use a different email address.' 
      });
    }
    
    // Check if username exists (if provided)
    if (username) {
      const userWithUsername = await User.findOne({ username });
      const doctorWithUsername = await Doctor.findOne({ username });
      
      if (userWithUsername || doctorWithUsername) {
        return res.status(400).json({ 
          message: 'This username is already taken. Please choose a different username.' 
        });
      }
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
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
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
    
    // Check if email exists in either Doctor or User collection
    const existingDoctor = await Doctor.findOne({ email });
    const existingUser = await User.findOne({ email });
    
    if (existingDoctor || existingUser) {
      return res.status(400).json({ 
        message: 'This email is already registered. Please use a different email address.' 
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
    
    // Find doctor by email using Doctor model
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: doctor._id, role: 'doctor' },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1d' }
    );
    
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

// Google OAuth routes
exports.googleAuth = (req, res, next) => {

  const userType = req.userType || 'patient';
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: userType
  })(req, res, next);
};

exports.googleCallback = (req, res, next) => {
  // Get the userType from the state parameter
  const userType = req.query.state || 'patient';
  
  console.log('Google callback received with state:', userType);
  
  passport.authenticate('google', { session: false }, async (err, user) => {
    try {
      if (err) {
        console.error('Google authentication error:', err); // Debug log
        return res.redirect(`/doctor-login?error=${encodeURIComponent('Authentication failed')}`);
      }
      
      if (!user) {
        return res.redirect(`doctor/login?error=${encodeURIComponent('User not found')}`);
      }
      
      // Ensure the role matches the intended userType from the OAuth flow
      const role = userType;
      
      // Check if the email is already registered in the other role
      const email = user.email;
      const existingDoctor = await Doctor.findOne({ email });
      const existingUser = await User.findOne({ email });
    
      const frontendURL = 'http://localhost:3000';

      if (role === 'doctor' && existingUser) {
        return res.redirect(`${frontendURL}/doctor-login?error=${encodeURIComponent('This email is already registered as a patient. Please use a different email.')}`);
      }
      
      if (role === 'patient' && existingDoctor) {
        return res.redirect(`${frontendURL}/patient-login?error=${encodeURIComponent('This email is already registered as a doctor. Please use a different email.')}`);
      }
      
      console.log('User authenticated as:', role); // Debug log
      
      // Generate JWT token with the role from state parameter
      const token = jwt.sign(
        { id: user._id, role },
        process.env.JWT_SECRET || 'your_jwt_secret_key',
        { expiresIn: '1d' }
      );
      
      // Store user data in a format that can be retrieved by the frontend
      const userData = {
        id: user._id,
        email: user.email,
        role: role,
        firstName: user.firstName,
        lastName: user.lastName,
        ...(role === 'doctor' && { specialization: user.specialization })
      };
      
      // Encode user data for URL
      const encodedUserData = encodeURIComponent(JSON.stringify(userData));
      
      // Redirect to frontend with token and user data
      const redirectPath = role === 'patient' ? 'patient-dashboard' : 'doctor-dashboard';
      res.redirect(`${frontendURL}/${redirectPath}?token=${token}&userData=${encodedUserData}&role=${role}`);
    } catch (error) {
      console.error('Error in Google OAuth callback:', error);
      return res.redirect(`${frontendURL}/doctor-login?error=${encodeURIComponent('Authentication failed: ' + error.message)}`);
    }
  })(req, res, next);
};

// Handle Google login for doctor
exports.googleDoctorAuth = (req, res, next) => {
  // Set userType directly on the request object
  req.userType = 'doctor';
  console.log('Setting up Google OAuth for doctor');
  exports.googleAuth(req, res, next);
};

// Handle Google login for patient
exports.googlePatientAuth = (req, res, next) => {
  // Set userType directly on the request object
  req.userType = 'patient';
  console.log('Setting up Google OAuth for patient');
  exports.googleAuth(req, res, next);
};
