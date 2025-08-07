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
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://qlyno-frontend.onrender.com',
    'http://localhost:3000',
    'http://localhost:3001'
  ];
  
  const origin = req.headers.origin;
  
  // Allow requests from allowed origins or no origin (for direct server requests)
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-File-Name');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`OPTIONS request for ${req.path} from origin: ${origin}`);
    return res.status(200).end();
  }
  
  // Log all requests for debugging
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${origin}`);
  next();
});
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

app.get('/api/test-cors', (req, res) => {
  res.json({
    message: 'CORS is working!',
    origin: req.headers.origin,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});
// Initialize socket.io

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const chatSocket = require('./chatSocket')(server);
