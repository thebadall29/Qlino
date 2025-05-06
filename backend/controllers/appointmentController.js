const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Schedule = require('../models/Schedule');
const Queue = require('../models/Queue');

// Helper function to format date to YYYY-MM-DD
const formatDate = (date) => {
  try {
    // Check if date is valid
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      // Return today's date if input is invalid
      return new Date().toISOString().split('T')[0];
    }
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    // Return today's date as fallback
    return new Date().toISOString().split('T')[0];
  }
};

// Helper function to generate time slots based on doctor's working hours
const generateTimeSlots = (workingDay) => {
  if (!workingDay || !workingDay.active) return [];
  
  const slots = [];
  const startTime = new Date(`2000/01/01 ${workingDay.startTime}`);
  const endTime = new Date(`2000/01/01 ${workingDay.endTime}`);
  
  let currentTime = startTime;
  while (currentTime < endTime) {
    slots.push({
      time: currentTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }),
      isBooked: false
    });
    currentTime = new Date(currentTime.getTime() + 30 * 60000); // Add 30 minutes
  }
  
  return slots;
};

// ... existing code ...

// Get patient appointments by email
// ... existing code ...

// Get patient appointments by email
exports.getPatientAppointmentsByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required'
      });
    }
    
    console.log('Searching for appointments with email:', email);
    
    // Find all appointments with this email - search in both fields
    const appointments = await Appointment.find({ 
      $or: [
        { patientEmail: email },  // Search in patientEmail field
        { email: email }          // Also search in email field if it exists
      ]
    }).sort({ createdAt: -1 }); // Sort by creation date, newest first

    console.log(`Found ${appointments.length} appointments for email ${email}`);
    
    // Check if any appointments were found
    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No appointments found for this email'
      });
    }
    
    // Get the most recent appointment (first in the sorted list)
    const mostRecentAppointment = appointments[0];
    
    // Calculate follow-up count
    const followUpCount = appointments.length - 1; // Subtract 1 for the initial visit
    
    return res.status(200).json({
      success: true,
      message: 'Patient appointments retrieved successfully',
      patientHistory: {
        totalVisits: appointments.length,
        followUpCount: followUpCount > 0 ? followUpCount : 0,
        isFollowUp: appointments.length > 1,
        lastVisit: mostRecentAppointment,
        allAppointments: appointments
      }
    });
  } catch (error) {
    console.error('Error retrieving patient appointments by email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve patient appointments',
      error: error.message
    });
  }
};

exports.checkPatientExists = async (req, res) => {
  try {
    const { email } = req.params;
    
    // Check if a user with this email exists and has role 'patient'
    const user = await User.findOne({ email, role: 'patient' });
    
    return res.json({
      success: true,
      isRegistered: !!user // Convert to boolean
    });
  } catch (err) {
    console.error('Error checking patient registration:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get unique patients who have made appointments with a specific doctor
exports.getUniquePatientsByDoctor = async (req, res) => {
  try {
    const doctorId = req.user.id; // Get the doctor ID from the authenticated user
    
    // Find all appointments for this doctor
    const appointments = await Appointment.find({ doctorId })
      .sort({ createdAt: -1 }); // Sort by creation date, newest first
    
    // Create a map to store unique patients by email
    const uniquePatientsMap = new Map();
    
    // Process each appointment to extract unique patients
    appointments.forEach(appointment => {
      const patientEmail = appointment.patientEmail;
      
      // Only add this patient if we haven't seen this email before
      if (!uniquePatientsMap.has(patientEmail)) {
        uniquePatientsMap.set(patientEmail, {
          name: appointment.patientName,
          email: patientEmail,
          contactNumber: appointment.contactNumber,
          lastAppointment: appointment.date,
          appointmentCount: 1,
          lastReason: appointment.reason
        });
      } else {
        // If we've seen this patient before, increment their appointment count
        const patient = uniquePatientsMap.get(patientEmail);
        patient.appointmentCount += 1;
        
        // Update last appointment date if this one is more recent
        if (new Date(appointment.date) > new Date(patient.lastAppointment)) {
          patient.lastAppointment = appointment.date;
          patient.lastReason = appointment.reason;
        }
      }
    });
    
    // Convert the map to an array of unique patients
    const uniquePatients = Array.from(uniquePatientsMap.values());
    
    return res.status(200).json({
      success: true,
      message: 'Unique patients retrieved successfully',
      count: uniquePatients.length,
      patients: uniquePatients
    });
  } catch (error) {
    console.error('Error retrieving unique patients:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve unique patients',
      error: error.message
    });
  }
};

// ... existing code ...

// Get doctor's appointments for a specific date
exports.getDoctorAppointments = async (req, res) => {
  try {
    const { date } = req.params;
    const doctorId = req.user.id;  // Changed from req.doctor._id to req.user.id
    console.log("doctorid from appointment", doctorId);
    console.log("Requested date:", date);
    
    // Ensure we're using the correct date format for database queries
    const requestedDate = new Date(date);
    const formattedDate = formatDate(requestedDate);
    console.log("Formatted date for query:", formattedDate);
    
    // Find appointments for this doctor on this date
    const appointments = await Appointment.find({
      doctorId,
      date: {
        $gte: new Date(`${formattedDate}T00:00:00.000Z`),
        $lt: new Date(`${formattedDate}T23:59:59.999Z`)
      }
    }).populate('patientId', 'firstName lastName fullName mobile');
    
    console.log(`Found ${appointments.length} appointments for ${formattedDate}`);
    
    // Format appointments for response
    const formattedAppointments = appointments.map(appointment => {
      // Check if appointment has patientId populated or uses direct patient info
      let patient, contact;
      
      if (appointment.patientId) {
        // Case 1: Appointment has a patientId reference
        patient = appointment.patientId.fullName || 
                 `${appointment.patientId.firstName || ''} ${appointment.patientId.lastName || ''}`.trim();
        contact = appointment.patientId.mobile;
      } else {
        // Case 2: Appointment has direct patient information
        patient = appointment.patientName;
        contact = appointment.contact || appointment.contactNumber;
      }
      
      return {
        id: appointment._id,
        time: appointment.time,
        patient: patient,
        contact: contact,
        reason: appointment.reason,
        status: appointment.status,
        type: appointment.type,
        queueNumber: appointment.queueNumber
      };
    });
    
    // Get doctor data to check working days
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Check if doctor works on this day
    const dayOfWeek = requestedDate.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    
    // Generate all possible time slots for this day if doctor is available
    let allSlots = [];
    if (doctor.workingDays[dayName] && doctor.workingDays[dayName].active) {
      const workingDay = doctor.workingDays[dayName];
      const timeSlots = generateTimeSlots(workingDay);
      
      // Create a map of booked times for quick lookup
      const bookedTimes = new Set(formattedAppointments.map(app => app.time));
      
      // Create a complete list of slots (both available and booked)
      allSlots = timeSlots.map(slot => {
        const time = slot.time;
        const existingAppointment = formattedAppointments.find(app => app.time === time);
        
        if (existingAppointment) {
          return existingAppointment; // Return the booked appointment
        } else {
          return {
            time: time,
            available: true
          };
        }
      });
    }
    
    res.status(200).json({
      success: true,
      appointments: allSlots.length > 0 ? allSlots : formattedAppointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
};

// Get available slots for a specific date
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.params;
    const doctorId = req.doctor._id;
    
    // Get doctor data to check working days
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Check if doctor works on this day
    const dayOfWeek = new Date(date).getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    
    if (!doctor.workingDays[dayName] || !doctor.workingDays[dayName].active) {
      return res.status(200).json({
        success: true,
        available: false,
        message: 'Doctor is not available on this day',
        slots: []
      });
    }
    
    // Check if there's already a schedule for this date
    let schedule = await Schedule.findOne({ doctorId, date: new Date(date) });
    
    // If no schedule exists, create one based on doctor's working hours
    if (!schedule) {
      const workingDay = doctor.workingDays[dayName];
      const slots = generateTimeSlots(workingDay).map(slot => ({
        time: slot.time,
        isBooked: false
      }));
      
      schedule = new Schedule({
        doctorId,
        date: new Date(date),
        slots
      });
      
      await schedule.save();
    }
    
    // Get booked appointments for this date
    const appointments = await Appointment.find({
      doctorId,
      date: {
        $gte: new Date(`${date}T00:00:00.000Z`),
        $lt: new Date(`${date}T23:59:59.999Z`)
      },
      status: { $ne: 'cancelled' }
    });
    
    // Mark booked slots
    const bookedTimes = appointments.map(app => app.time);
    const availableSlots = schedule.slots.map(slot => ({
      time: slot.time,
      available: !bookedTimes.includes(slot.time) && !slot.isBooked
    }));
    
    res.status(200).json({
      success: true,
      available: true,
      slots: availableSlots
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available slots',
      error: error.message
    });
  }
};

// Book appointment for doctor (creating appointment for a patient)
exports.bookAppointmentByDoctor = async (req, res) => {
  try {
    const { doctorId, date, time, patientName, reason,patientEmail,contactNumber } = req.body;
    
    console.log("data",req.body)
    // Validate required fields
    if (!doctorId || !date || !time || !patientName|| !reason || !patientEmail || !contactNumber ) {
      return res.status(400).json({
        success: false,
        message: 'required fields is missing'
      });
    }
    
    // Get doctor data
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Check if doctor works on this day
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    
    if (!doctor.workingDays[dayName] || !doctor.workingDays[dayName].active) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not available on this day'
      });
    }
    
    // Check if slot is available (for slot-based booking)
    if (doctor.bookingPreference === 'slot') {
      // Format date to YYYY-MM-DD
      const formattedDate = formatDate(date);
      
      // Check if there's already an appointment at this time
      const existingAppointment = await Appointment.findOne({
        doctorId,
        date: {
          $gte: new Date(`${formattedDate}T00:00:00.000Z`),
          $lt: new Date(`${formattedDate}T23:59:59.999Z`)
        },
        time,
        status: { $ne: 'cancelled' }
      });
      
      if (existingAppointment) {
        return res.status(400).json({
          success: false,
          message: 'This time slot is already booked'
        });
      }
    }
    
    // For queue-based booking, get the next queue number
    let queueNumber;
    if (doctor.bookingPreference === 'queue') {
      const formattedDate = formatDate(date);
      
      // Find the highest queue number for this doctor and date
      const highestQueue = await Appointment.findOne({
        doctorId,
        date: {
          $gte: new Date(`${formattedDate}T00:00:00.000Z`),
          $lt: new Date(`${formattedDate}T23:59:59.999Z`)
        },
        type: 'queue'
      }).sort({ queueNumber: -1 });
      
      queueNumber = highestQueue ? highestQueue.queueNumber + 1 : 1;
    }
    
    // Create the appointment without requiring a patient ID
    const appointment = new Appointment({
      doctorId,
      patientName,
      patientEmail: patientEmail, // FIXED
      contactNumber: contactNumber,     // FIXED
      reason,
      date: appointmentDate,
      time,
      status: 'scheduled',
      type: doctor.bookingPreference,
      queueNumber: queueNumber
    });
    await appointment.save();
    
    // If slot-based, update the schedule to mark the slot as booked
    if (doctor.bookingPreference === 'slot') {
      const formattedDate = formatDate(date);
      await Schedule.updateOne(
        { 
          doctorId,
          date: new Date(formattedDate),
          'slots.time': time
        },
        {
          $set: { 'slots.$.isBooked': true }
        }
      );
    }
    
    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: {
        id: appointment._id,
        date: appointment.date,
        time: appointment.time,
        doctor: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        type: appointment.type,
        queueNumber: appointment.queueNumber
      }
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment',
      error: error.message
    });
  }
};

// Book appointment for unregistered patient
exports.bookAppointmentForUnregisteredPatient = async (req, res) => {
  try {
    const { doctorId, date, time, patientName, contact, email, reason } = req.body;
    
    // Validate required fields
    if (!doctorId || !date || !time || !patientName || !contact || !email || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Get doctor data
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Check if doctor works on this day
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    
    if (!doctor.workingDays[dayName] || !doctor.workingDays[dayName].active) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not available on this day'
      });
    }
    
    // Check if slot is available (for slot-based booking)
    if (doctor.bookingPreference === 'slot') {
      // Format date to YYYY-MM-DD
      const formattedDate = formatDate(date);
      
      // Check if there's already an appointment at this time
      const existingAppointment = await Appointment.findOne({
        doctorId,
        date: {
          $gte: new Date(`${formattedDate}T00:00:00.000Z`),
          $lt: new Date(`${formattedDate}T23:59:59.999Z`)
        },
        time,
        status: { $ne: 'cancelled' }
      });
      
      if (existingAppointment) {
        return res.status(400).json({
          success: false,
          message: 'This time slot is already booked'
        });
      }
    }
    
    // For queue-based booking, get the next queue number
    let queueNumber;
    if (doctor.bookingPreference === 'queue') {
      const formattedDate = formatDate(date);
      
      // Find the highest queue number for this doctor and date
      const highestQueue = await Appointment.findOne({
        doctorId,
        date: {
          $gte: new Date(`${formattedDate}T00:00:00.000Z`),
          $lt: new Date(`${formattedDate}T23:59:59.999Z`)
        },
        type: 'queue'
      }).sort({ queueNumber: -1 });
      
      queueNumber = highestQueue ? highestQueue.queueNumber + 1 : 1;
    }
    
    // Create the appointment without requiring a patient ID
    const appointment = new Appointment({
      doctorId,
      patientName,
      patientEmail: email,
      contact,
      reason,
      date: appointmentDate,
      time,
      status: 'scheduled',
      type: doctor.bookingPreference,
      queueNumber: queueNumber
    });
    
    await appointment.save();
    
    // If slot-based, update the schedule to mark the slot as booked
    if (doctor.bookingPreference === 'slot') {
      const formattedDate = formatDate(date);
      await Schedule.updateOne(
        { 
          doctorId,
          date: new Date(formattedDate),
          'slots.time': time
        },
        {
          $set: { 'slots.$.isBooked': true }
        }
      );
    }
    
    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: {
        id: appointment._id,
        date: appointment.date,
        time: appointment.time,
        doctor: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        type: appointment.type,
        queueNumber: appointment.queueNumber
      }
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment',
      error: error.message
    });
  }
};

// Add patient to queue
exports.addToQueue = async (req, res) => {
  try {
    const { doctorId, date, patientName, contact, email, reason } = req.body;
    
    // Validate required fields
    if (!doctorId || !date || !patientName || !contact || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Get doctor data to check availability
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Check if the date is in the correct format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    // Get the day of the week
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    
    // Check if doctor works on this day
    if (!doctor.workingDays[dayName] || !doctor.workingDays[dayName].active) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not available on this day'
      });
    }
    
    // Find the highest queue number for this doctor and date
    const highestQueue = await Appointment.findOne({
      doctorId,
      date: {
        $gte: new Date(`${date}T00:00:00.000Z`),
        $lt: new Date(`${date}T23:59:59.999Z`)
      },
      type: 'queue'
    }).sort({ queueNumber: -1 });
    
    const queueNumber = highestQueue ? highestQueue.queueNumber + 1 : 1;
    
    // Create a new appointment in the queue
    const appointment = new Appointment({
      doctorId,
      patientName,
      patientEmail: email,
      contact,
      reason,
      date: appointmentDate,
      type: 'queue',
      queueNumber,
      status: 'scheduled'
    });
    
    await appointment.save();
    
    res.status(201).json({
      success: true,
      message: 'Patient added to queue successfully',
      data: {
        queueNumber,
        patientName,
        date: appointmentDate
      }
    });
  } catch (error) {
    console.error('Error adding patient to queue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add patient to queue',
      error: error.message
    });
  }
};

// Get queue for a specific date
// Get queue for a specific date
exports.getQueue = async (req, res) => {
  try {
    const { date } = req.params;
    
    if (!req.user || !req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID not found in request'
      });
    }
    
    const doctorId = req.user.id;
    const formattedDate = formatDate(date);

    // Get all appointments for the date, sorted by creation time
    const appointments = await Appointment.find({
      doctorId,
      date: {
        $gte: new Date(`${formattedDate}T00:00:00.000Z`),
        $lt: new Date(`${formattedDate}T23:59:59.999Z`)
      }
    })
    .sort({ createdAt: 1 }) // Sort by creation date (oldest first)
    .populate('patientId', 'firstName lastName fullName mobile');

    // Map appointments to queue format
    const queueItems = appointments.map((appt, index) => ({
      queueNumber: index + 1,
      id: appt._id,
      name: appt.patientName || appt.patientId?.fullName,
      contact: appt.contactNumber || appt.patientId?.mobile,
      email: appt.patientEmail,
      reason: appt.reason,
      status: appt.status,
      type: appt.type,
      createdAt: appt.createdAt,
      time: appt.time
    }));

    res.status(200).json({
      success: true,
      queue: queueItems
    });
  } catch (error) {
    console.error('Error fetching queue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch queue',
      error: error.message
    });
  }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const doctorId = req.doctor._id;
    
    // Find appointment
    const appointment = await Appointment.findOne({ _id: id, doctorId });
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Update status
    appointment.status = status;
    await appointment.save();
    
    // If this is a queue appointment, update queue status too
    if (appointment.type === 'queue') {
      await Queue.updateOne(
        {
          doctorId,
          date: appointment.date,
          'items.appointmentId': appointment._id
        },
        {
          $set: {
            'items.$.status': status === 'completed' ? 'completed' : 
                             status === 'cancelled' ? 'cancelled' : 
                             status === 'in-progress' ? 'in-progress' : 'waiting'
          }
        }
      );
    }
    
    res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment status',
      error: error.message
    });
  }
};

// Get patient's appointments
exports.getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.user._id;
    
    // Find all appointments for this patient
    const appointments = await Appointment.find({ patientId })
      .populate('doctorId', 'firstName lastName specialization')
      .sort({ date: -1 });
    
    // Format appointments for response
    const formattedAppointments = appointments.map(appointment => ({
      id: appointment._id,
      doctor: `Dr. ${appointment.doctorId.firstName} ${appointment.doctorId.lastName}`,
      specialization: appointment.doctorId.specialization,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      type: appointment.type,
      queueNumber: appointment.queueNumber,
      reason: appointment.reason
    }));
    
    res.status(200).json({
      success: true,
      appointments: formattedAppointments
    });
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
};