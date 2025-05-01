const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/qlino';
    console.log('Using connection string:', connectionString);
    
    const conn = await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB connected successfully`);
    console.log('Connection Details:');
    console.log('- Host:', conn.connection.host);
    console.log('- Port:', conn.connection.port);
    console.log('- Database:', conn.connection.name);
    console.log('- Connection State:', conn.connection.readyState);
    
    // Add connection event listeners
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('connected', () => {
      console.log('MongoDB connection established');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    return conn;
  } catch (err) {
    console.error('MongoDB connection error details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    process.exit(1);
  }
};

module.exports = connectDB;