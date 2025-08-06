require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const passport = require('passport');
const app = express();
const path = require('path'); 
const patientRoutes = require('./routes/patientRoutes');
// const userRoutes = require('./routes/userRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const symptomRoutes = require('./routes/symptomRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const doctorChatRoutes = require('./routes/doctorChatRoutes');
const patientChatRoutes = require('./routes/patientChatRoutes');
const PORT = process.env.PORT || 5000;
const authRoutes = require('./routes/authRoutes');
const specialtyRoutes = require('./routes/specialtyRoutes');
const tagRoutes = require('./routes/tagRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');

// Connect to MongoDB
connectDB();

// Middleware
// Update your CORS configuration
app.use(cors({
  origin: [
    'https://qlyno-frontend.onrender.com',  // Your frontend URL
    'http://localhost:3000',                // For local development
    'http://localhost:3001'                 // If using different local ports
  ],
  credentials: true,  // Important for cookies/sessions
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

app.use(express.json({ limit: '100mb' })); // Adjust limit as needed, e.g., '10mb', '50mb', '100mb'
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Initialize Passport
app.use(passport.initialize());
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: err.message
  });
});
app.use('/api/doctor', doctorRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api', appointmentRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/doctor/chat', doctorChatRoutes);
app.use('/api/patient/chat', patientChatRoutes);
app.use('/api/specialties', specialtyRoutes);


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/patients', express.static(path.join(__dirname, 'uploads/patients')));
app.use('/uploads/reports', express.static(path.join(__dirname, 'uploads/reports')));


// Initialize socket.io

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const chatSocket = require('./chatSocket')(server);
