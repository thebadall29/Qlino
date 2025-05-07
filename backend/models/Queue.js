const mongoose = require('mongoose');

const QueueSchema = new mongoose.Schema({
  queueNumber: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  reason: {
    type: String
  },
  status: {
    type: String,
    enum: ['Waiting', 'Ready', 'In Process', 'Completed', 'scheduled'],
    default: 'scheduled'
  },
  type: {
    type: String,
    default: 'queue'
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Queue', QueueSchema);