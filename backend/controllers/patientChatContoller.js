const Chat = require('../models/Chat');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/User');

// Get all doctors the patient has had appointments with
exports.getDoctorsList = async (req, res) => {
  try {
    const patientId = req.user.id;
    console.log("req.user:", req.user);

    // First, get the patient's email from the User model
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const patientEmail = patient.email;
    console.log("Patient email:", patientEmail);
    const appointments = await Appointment.find({
      patientEmail: patientEmail,
      status: { $in: ['Completed', 'scheduled'] }
    }).distinct('doctorId');

    console.log("appointments:", appointments);

    if (!appointments.length) {
      return res.status(200).json({
        success: true,
        doctors: []
      });
    }

    // Get doctor details
    const doctors = await Doctor.find({
      _id: { $in: appointments }
    }).select('firstName lastName email specialization profileImage');

    // Get the last message for each doctor
    const chats = await Chat.find({
      patient: patientId,
      doctor: { $in: appointments }
    }).select('doctor messages lastMessage');

    // Combine doctor info with chat info
    const doctorsList = doctors.map(doctor => {
      const chat = chats.find(c => c.doctor.toString() === doctor._id.toString());
      return {
        _id: doctor._id,
        name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        email: doctor.email,
        specialization: doctor.specialization,
        profileImage: doctor.profileImage,
        lastMessage: chat ? chat.messages[chat.messages.length - 1]?.content : null,
        lastMessageTime: chat ? chat.lastMessage : null,
        unreadCount: chat ? chat.messages.filter(m => !m.read && m.senderModel === 'Doctor').length : 0
      };
    });

    // Sort by last message time (most recent first)
    doctorsList.sort((a, b) => {
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });

    return res.status(200).json({
      success: true,
      doctors: doctorsList
    });
  } catch (error) {
    console.error('Error getting doctors list:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get doctors list',
      error: error.message
    });
  }
};

// Get chat history with a specific doctor
exports.getChatHistory = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { doctorId } = req.params;
    
    // Create a chat ID using both IDs
    const chatId = `${doctorId}_${patientId}`;
    
    // Try to find existing chat
    let chat = await Chat.findOne({ _id: chatId });
    
    // If chat doesn't exist, return empty chat structure
    if (!chat) {
      return res.json({
        success: true,
        chat: {
          _id: chatId,
          doctor: doctorId,
          patient: patientId,
          messages: [],
          lastMessage: new Date()
        }
      });
    }
    
    return res.json({
      success: true,
      chat
    });
  } catch (error) {
    console.error('Error getting chat history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get chat history',
      error: error.message
    });
  }
};

// Send message to a doctor
exports.sendMessage = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { doctorId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Get patient email
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check if patient has had an appointment with this doctor
    const hasAppointment = await Appointment.exists({
      doctorId: doctorId,
      patientEmail: patient.email,
      status: { $in: ['Completed', 'scheduled'] }
    });

    if (!hasAppointment) {
      return res.status(403).json({
        success: false,
        message: 'You can only chat with doctors you have booked appointments with'
      });
    }

    // Create a chat ID using both IDs
    const chatId = `${doctorId}_${patientId}`;

    // Use findOneAndUpdate with upsert to create if not exists
    const newMessage = {
      sender: patientId,
      senderModel: 'Patient',
      content: content,
      timestamp: new Date(),
      read: false
    };

    // Use findOneAndUpdate with upsert to create if not exists
    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId },  // Use _id for the query
      { 
        $push: { messages: newMessage },
        $set: { 
          lastMessage: new Date(),
          doctor: doctorId,
          patient: patientId
        }
      },
      { 
        new: true, 
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};