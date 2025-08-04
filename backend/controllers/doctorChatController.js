const Chat = require('../models/Chat');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor')
const Patient = require('../models/User');

exports.getPatientsList = async (req, res) => {
  try {
    console.log("req.user:", req.user);
    // Use req.user.id instead of req.doctor.id
    const doctorId = req.user.id;
    console.log("doctorId:", doctorId);
    
    if (!doctorId) {
      return res.status(401).json({
        success: false,
        message: 'Doctor ID not found. Authentication required.'
      });
    }

    console.log("doctorId type:", typeof doctorId, "value:", doctorId);

    // Find all patients who have had appointments with this doctor
    const appointments = await Appointment.find({ 
      doctorId: doctorId,
      status: { $in: ['completed', 'scheduled', 'Completed','Waiting'] } // Add capital C version
    }).distinct('patientEmail'); // Use patientEmail instead of patientId
    
    console.log("appointments:", appointments);

    if (!appointments.length) {
      return res.status(200).json({ 
        success: true, 
        patients: [] 
      });
    }

    // Get patient details - query by email instead of _id
    const patients = await Patient.find({ 
      email: { $in: appointments } 
    }).select('firstName lastName email profileImage _id');

    // Get the last message for each patient
    const chats = await Chat.find({ 
      doctor: doctorId, 
      patient: { $in: patients.map(p => p._id) } // Use the actual patient IDs here
    }).select('patient messages lastMessage');

    // Combine patient info with chat info
    const patientsList = patients.map(patient => {
      const chat = chats.find(c => c.patient.toString() === patient._id.toString());
      return {
        _id: patient._id,
        name: `${patient.firstName} ${patient.lastName}`,
        email: patient.email,
        profileImage: patient.profileImage,
        lastMessage: chat ? chat.messages[chat.messages.length - 1]?.content : null,
        lastMessageTime: chat ? chat.lastMessage : null,
        unreadCount: chat ? chat.messages.filter(m => !m.read && m.senderModel === 'Patient').length : 0
      };
    });

    // Sort by last message time (most recent first)
    patientsList.sort((a, b) => {
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });

    return res.status(200).json({
      success: true,
      patients: patientsList
    });
  } catch (error) {
    console.error('Error getting patients list:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get patients list',
      error: error.message
    });
  }
};

// Get chat history with a specific patient
// Get chat history with a specific patient
exports.getChatHistory = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { patientId } = req.params;
    
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
  }}

// Send message to a patient
exports.sendMessage = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { patientId } = req.params;
    const { content } = req.body;

    console.log("req.body:", req.body);

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Get patient email first
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check if patient has had an appointment with this doctor using patientEmail
    const hasAppointment = await Appointment.exists({
      doctorId: doctorId,
      patientEmail: patient.email,
      status: { $in: ['completed', 'scheduled', 'Completed'] }
    });

    if (!hasAppointment) {
      return res.status(403).json({
        success: false,
        message: 'You can only chat with patients who have booked appointments with you'
      });
    }

    // Create a chat ID using both IDs
    const chatId = `${doctorId}_${patientId}`;
    
    // Get or create chat
    let chat = await Chat.findOne({ _id: chatId });
    
    if (!chat) {
      chat = new Chat({
        _id: chatId,  // Add this line to provide the _id
        doctor: doctorId,
        patient: patientId,
        messages: []
      });
    }

    // Add new message
    const newMessage = {
      sender: doctorId,
      senderModel: 'Doctor',
      content: content,
      timestamp: new Date(),
      read: false
    };

    chat.messages.push(newMessage);
    chat.lastMessage = new Date();
    await chat.save();

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