const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const Doctor = require('../models/Doctor');

// You'll need to create a project in Google Cloud Console and get these credentials
// https://console.cloud.google.com/
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your-client-id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your-client-secret';

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Get userType from state parameter
        const userType = req.query.state || 'patient';
        console.log('Processing OAuth callback with userType:', userType);
        
        // Extract profile information with safety checks
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
        const firstName = profile.name && profile.name.givenName ? profile.name.givenName : '';
        const lastName = profile.name && profile.name.familyName ? profile.name.familyName : '';
        const googleId = profile.id;

        // Validate required fields
        if (!email) {
          return done(new Error('Email is required from Google profile'));
        }
        
        let user;
        
        if (userType === 'doctor') {
          // Check if doctor exists
          user = await Doctor.findOne({ email });
          
          if (!user) {
            // Create a new doctor
            user = new Doctor({
              firstName,
              lastName,
              email,
              googleId,
              username: email.split('@')[0], // Use email prefix as username instead of potentially empty names
              verified: true,
              // Default values for required fields
              specialization: 'Not specified',
              experience: '0',
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
            
            await user.save();
          } else if (!user.googleId) {
            // If user exists but doesn't have googleId, update it
            user.googleId = googleId;
            await user.save();
          }
        } else {
          // Check if patient exists
          user = await User.findOne({ email });
          
          if (!user) {
            // Create a new patient
            user = new User({
              firstName,
              lastName,
              email,
              googleId,
              username: `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
              role: 'patient',
              verified: true
            });
            
            await user.save();
          } else if (!user.googleId) {
            // If user exists but doesn't have googleId, update it
            user.googleId = googleId;
            await user.save();
          }
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, { id: user._id, role: user.role || 'doctor' });
});

// Deserialize user from the session
passport.deserializeUser(async (data, done) => {
  try {
    let user;
    
    if (data.role === 'doctor') {
      user = await Doctor.findById(data.id);
    } else {
      user = await User.findById(data.id);
    }
    
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;