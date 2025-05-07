import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../DoctorDashboard.scss";
import { FaFilePdf, FaPrint, FaPlus } from 'react-icons/fa';

const PatientManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [visits, setVisits] = useState([]);
  const [reports, setReports] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [newVisit, setNewVisit] = useState({
    date: new Date().toISOString().split('T')[0],
    findings: '',
    diagnosis: '',
    treatment: '',
    followUp: ''
  });

  const [newReport, setNewReport] = useState({
    title: '',
    type: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    results: '',
    recommendations: '',
    file: null
  });

  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'medication',
    recurring: false,
    recurringPattern: 'daily',
    notificationTime: 30
  });

  const handleReminderChange = (field, value) => {
    setNewReminder({
      ...newReminder,
      [field]: value
    });
  };

  const handleAddReminder = async () => {
    try {
      // Validate required fields
      if (!newReminder.title || !newReminder.date) {
        alert('Please fill in all required fields');
        return;
      }

      // Create a new reminder object
      const reminderToAdd = {
        ...newReminder,
        status: 'pending',
        createdBy: JSON.parse(localStorage.getItem('user'))._id,
        createdAt: new Date().toISOString()
      };

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/patient/doctor/patient/${selectedPatient.email}/reminders`,
        reminderToAdd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Add the new reminder to the local state
        setReminders([...reminders, response.data.reminder]);

        // Reset the form
        setNewReminder({
          title: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          time: '09:00',
          type: 'medication',
          recurring: false,
          recurringPattern: 'daily',
          notificationTime: 30
        });

        // Show success message
        alert('Reminder added successfully');
      } else {
        alert('Failed to add reminder: ' + response.data.message);
      }
    } catch (err) {
      console.error('Error adding reminder:', err);
      alert('Failed to add reminder: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateReminderStatus = async (id, newStatus) => {
    try {
      // Update in local state first
      const updatedReminders = reminders.map(reminder =>
        reminder.id === id ? { ...reminder, status: newStatus } : reminder
      );
      setReminders(updatedReminders);

      // Update in the database
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:5000/api/patient/doctor/patient/${selectedPatient.email}/reminders/${id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success) {
        alert('Failed to update reminder status: ' + response.data.message);
        // Revert the local state if the server update failed
        setReminders(reminders);
      }
    } catch (err) {
      console.error('Error updating reminder status:', err);
      alert('Failed to update reminder status: ' + (err.response?.data?.message || err.message));
      // Revert the local state if there was an error
      setReminders(reminders);
    }
  };

  const [newPatient, setNewPatient] = useState({
    username: '',
    email: '',
    password: '123456', // Default password
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    mobile: '',
    phone: '',
    city: '',
    state: '',
    country: '',
    emergencyContact: '',
    chronicConditions: '',
    pastSurgeries: '',
    allergies: ''
  });
  const [prescription, setPrescription] = useState({
    medications: [{ name: '', dosage: '', frequency: '', duration: '', notes: '' }],
    instructions: '',
    followUpDate: ''
  });
  const [allPrescriptions, setAllPrescriptions] = useState([]);

  useEffect(() => {
    // Fetch patients data when component mounts
    const fetchPatients = async () => {
      try {
        setLoading(true);
        // Get the token from localStorage
        const token = localStorage.getItem('token');

        const response = await axios.get('http://localhost:5000/api/doctor/unique-patients', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setPatients(response.data.patients);
        } else {
          setError('Failed to fetch patients data');
        }
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Error connecting to server. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const checkPatientRegistration = async (email) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/patient/doctor/check-patient/${email}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Check patient registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error checking patient registration:', error);
      return { exists: false, error: error.message };
    }
  };



  const handleViewProfile = async (patient) => {
    console.log("Opening profile for patient:", patient);

    // Make sure patient object is valid before proceeding
    if (!patient || !patient.email) {
      console.error("Invalid patient data:", patient);
      return; // Exit if patient data is invalid
    }

    try {
      // Check if patient is registered in the system
      const registrationCheck = await checkPatientRegistration(patient.email);
      console.log("Registration check result:", registrationCheck);

      // Create a new patient object with the isRegistered flag
      const patientWithRegistrationStatus = {
        ...patient,
        isRegistered: registrationCheck.isRegistered
      };

      console.log("Patient with registration status:", patientWithRegistrationStatus);

      // Set the selected patient and show the modal
      setSelectedPatient(patientWithRegistrationStatus);
      setShowProfileModal(true);
      setActiveTab('profile'); // Reset to profile tab when opening

      const token = localStorage.getItem('token');

      // Fetch patient visits
      try {
        const response = await axios.get(`http://localhost:5000/api/patient/appointment/${patient.email}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          // Map the appointments to the visits format your component expects
          const formattedVisits = response.data.patientHistory.allAppointments.map(appointment => ({
            date: appointment.date,
            findings: appointment.findings || 'Not recorded',
            diagnosis: appointment.diagnosis || 'Not recorded',
            treatment: appointment.treatment || 'Not recorded',
            followUp: appointment.followUp || 'Not scheduled',
            time: appointment.time || 'N/A',
            reason: appointment.reason || 'Not specified',
            status: appointment.status || 'Completed',
            type: appointment.type || 'In-person'
          }));

          setVisits(formattedVisits);
        }
      } catch (err) {
        console.error('Error fetching patient visits:', err);
        setVisits([]); // Set empty array in case of error
      }

      // Fetch patient reminders
      try {
        const remindersResponse = await axios.get(`http://localhost:5000/api/patient/doctor/patient/${patient.email}/reminders`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (remindersResponse.data.success) {
          setReminders(remindersResponse.data.reminders || []);
        }
      } catch (err) {
        console.error('Error fetching patient reminders:', err);
        setReminders([]); // Set empty array in case of error
      }

      // Fetch patient reports
      try {
        const reportsResponse = await axios.get(`http://localhost:5000/api/patient/doctor/patient/${patient.email}/reports`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (reportsResponse.data.success) {
          setReports(reportsResponse.data.reports || []);
        }
      } catch (err) {
        console.error('Error fetching patient reports:', err);
        setReports([]); // Set empty array in case of error
      }

      // Fetch patient prescriptions
      try {
        const prescriptionsResponse = await axios.get(`http://localhost:5000/api/patient/doctor/patient/${patient.email}/prescriptions`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (prescriptionsResponse.data.success) {
          // Store all prescriptions in state
          setAllPrescriptions(prescriptionsResponse.data.prescriptions || []);

          // Set the form to empty for new prescription
          setPrescription({
            medications: [{ name: '', dosage: '', frequency: '', duration: '', notes: '' }],
            instructions: '',
            followUpDate: ''
          });
        } else {
          // Reset to default empty prescription if none found
          setPrescription({
            medications: [{ name: '', dosage: '', frequency: '', duration: '', notes: '' }],
            instructions: '',
            followUpDate: ''
          });
          setAllPrescriptions([]);
        }
      } catch (err) {
        console.error('Error fetching patient prescriptions:', err);
        // Keep the default empty prescription
        setAllPrescriptions([]);
      }
    } catch (err) {
      console.error('Error in handleViewProfile:', err);
      alert('Error loading patient profile: ' + err.message);
    }
  };

  // ... existing code ...
  const handleReportChange = (field, value) => {
    setNewReport({
      ...newReport,
      [field]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit. Please choose a smaller file.');
        // Reset the file input
        const fileInput = document.getElementById('report-file');
        if (fileInput) fileInput.value = '';
        return;
      }

      // Check file type
      const acceptedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!acceptedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload PDF, JPG, or PNG files only.');
        // Reset the file input
        const fileInput = document.getElementById('report-file');
        if (fileInput) fileInput.value = '';
        return;
      }

      setNewReport({
        ...newReport,
        file: file
      });
    }
  };

  const handleAddReport = async () => {
    try {
      // Validate required fields
      if (!newReport.title || !newReport.type) {
        alert('Please fill in all required fields');
        return;
      }

      // Create a new report object
      const reportData = new FormData();

      // Add all report fields to the FormData
      Object.keys(newReport).forEach(key => {
        if (key === 'file' && newReport[key]) {
          reportData.append('file', newReport[key]);
        } else if (key !== 'file') {
          reportData.append(key, newReport[key]);
        }
      });

      // Add doctor information
      reportData.append('createdBy', JSON.parse(localStorage.getItem('user'))._id);
      reportData.append('createdAt', new Date().toISOString());

      const token = localStorage.getItem('token');

      // Show loading indicator
      const saveButton = document.querySelector('button[onclick="handleAddReport"]');
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = 'Uploading...';
      }

      const response = await axios.post(
        `http://localhost:5000/api/patient/doctor/patient/${selectedPatient.email}/reports`,
        reportData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${percentCompleted}%`);
            // You could update a progress bar here if you had one
          }
        }
      );

      if (response.data.success) {
        // Add the new report to the local state
        setReports([...reports, response.data.report]);

        // Reset the form
        setNewReport({
          title: '',
          type: 'Lab Test',
          date: new Date().toISOString().split('T')[0],
          description: '',
          results: '',
          recommendations: '',
          file: null
        });

        // Show success message
        alert('Report added successfully');

        // Reset file input
        const fileInput = document.getElementById('report-file');
        if (fileInput) fileInput.value = '';

        // Hide the add report form
        document.getElementById('add-report-form').style.display = 'none';
      } else {
        alert('Failed to add report: ' + response.data.message);
      }

      // Reset button state
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = 'Save Report';
      }
    } catch (err) {
      console.error('Error adding report:', err);
      alert('Failed to add report: ' + (err.response?.data?.message || err.message));

      // Reset button state on error
      const saveButton = document.querySelector('button[onclick="handleAddReport"]');
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = 'Save Report';
      }
    }
  };
  // ... existing code ...

  // Format date to a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleAddMedication = () => {
    setPrescription({
      ...prescription,
      medications: [...prescription.medications, { name: '', dosage: '', frequency: '', duration: '', notes: '' }]
    });
  };

  const handleRemoveMedication = (index) => {
    const updatedMedications = [...prescription.medications];
    updatedMedications.splice(index, 1);
    setPrescription({
      ...prescription,
      medications: updatedMedications
    });
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...prescription.medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value
    };
    setPrescription({
      ...prescription,
      medications: updatedMedications
    });
  };

  const handlePrescriptionChange = (field, value) => {
    setPrescription({
      ...prescription,
      [field]: value
    });
  };

  const handleNewVisitChange = (field, value) => {
    setNewVisit({
      ...newVisit,
      [field]: value
    });
  };

  const handleAddVisit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/doctor/patient/${selectedPatient.id}/visits`,
        newVisit,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setVisits([...visits, response.data.visit]);
        setNewVisit({
          date: new Date().toISOString().split('T')[0],
          findings: '',
          diagnosis: '',
          treatment: '',
          followUp: ''
        });
      }
    } catch (err) {
      console.error('Error adding visit:', err);
    }
  };

  const handleSavePatientData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Prepare the data object based on what's been modified
      const updateData = {};

      // Add prescription data if it exists
      if (prescription && prescription.medications && prescription.medications.length > 0 &&
        prescription.medications[0].name && prescription.medications[0].dosage) {
        updateData.prescriptions = [{
          ...prescription,
          patientEmail: selectedPatient.email,
          patientName: selectedPatient.name,
          doctorId: JSON.parse(localStorage.getItem('user'))._id,
          doctorName: `${JSON.parse(localStorage.getItem('user')).firstName} ${JSON.parse(localStorage.getItem('user')).lastName}`,
          createdAt: new Date().toISOString()
        }];
      }

      // Add report data if it exists
      if (newReport && newReport.title) {
        updateData.reports = [{
          ...newReport,
          createdBy: JSON.parse(localStorage.getItem('user'))._id,
          createdAt: new Date().toISOString()
        }];
      }

      // Add reminder data if it exists
      if (newReminder && newReminder.title && newReminder.date) {
        updateData.reminders = [{
          ...newReminder,
          status: 'pending',
          createdBy: JSON.parse(localStorage.getItem('user'))._id,
          createdAt: new Date().toISOString()
        }];
      }

      // Only proceed if there's data to update
      if (Object.keys(updateData).length === 0) {
        alert('No changes to save');
        return;
      }

      // Make the API call to update patient data
      const response = await axios.put(
        `http://localhost:5000/api/patient/doctor/patient/${selectedPatient.email}/update`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        alert('Patient data updated successfully');

        // Reset forms after successful save
        if (updateData.prescriptions) {
          setPrescription({
            medications: [{ name: '', dosage: '', frequency: '', duration: '', notes: '' }],
            instructions: '',
            followUpDate: ''
          });
        }

        if (updateData.reports) {
          setNewReport({
            title: '',
            type: 'Lab Test',
            date: new Date().toISOString().split('T')[0],
            description: '',
            results: '',
            recommendations: '',
            file: null
          });

          // Reset file input
          const fileInput = document.getElementById('report-file');
          if (fileInput) fileInput.value = '';
        }

        if (updateData.reminders) {
          setNewReminder({
            title: '',
            description: '',
            date: new Date().toISOString().split('T')[0],
            time: '09:00',
            type: 'medication',
            recurring: false,
            recurringPattern: 'daily',
            notificationTime: 30
          });
        }

        // Refresh data
        handleViewProfile(selectedPatient);
      } else {
        alert('Failed to update patient data: ' + response.data.message);
      }
    } catch (err) {
      console.error('Error updating patient data:', err);
      alert(`Error updating patient data: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleSavePrescription = async () => {
    try {
      // Validate required fields
      if (!prescription.medications[0].name || !prescription.medications[0].dosage) {
        alert('Please fill in at least medication name and dosage');
        return;
      }

      const token = localStorage.getItem('token');
      let response;

      // Prepare prescription data                                                                                                                                  
      const prescriptionData = {
        ...prescription,
        patientEmail: selectedPatient.email,
        patientName: selectedPatient.name,
        doctorId: JSON.parse(localStorage.getItem('user'))._id,
        doctorName: `${JSON.parse(localStorage.getItem('user')).firstName} ${JSON.parse(localStorage.getItem('user')).lastName}`,
        createdAt: new Date().toISOString()
      };

      if (prescription._id) {
        // Update existing prescription
        response = await axios.put(
          `http://localhost:5000/api/patient/doctor/patient/${selectedPatient.email}/prescriptions/${prescription._id}`,
          prescriptionData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          // Update in local state
          setAllPrescriptions(allPrescriptions.map(p =>
            p._id === prescription._id ? response.data.prescription : p
          ));
          alert('Prescription updated successfully');
        }
      } else {
        // Add new prescription
        response = await axios.post(
          `http://localhost:5000/api/patient/doctor/patient/${selectedPatient.email}/prescriptions`,
          prescriptionData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          // Add to local state
          setAllPrescriptions([response.data.prescription, ...allPrescriptions]);
          alert('Prescription added successfully');
        }
      }

      // Reset form
      setPrescription({
        medications: [{ name: '', dosage: '', frequency: '', duration: '', notes: '' }],
        instructions: '',
        followUpDate: ''
      });
    } catch (err) {
      console.error('Error saving prescription:', err);
      alert(`Error saving prescription: ${err.response?.data?.message || err.message}`);
    }
  };

  const handlePrintPrescription = (prescriptionData) => {
    console.log(' prescriptions data:', prescriptionData);
    if (!prescriptionData || !prescriptionData.medications || prescriptionData.medications.length === 0) {
      alert('Invalid prescription data');
      return;
    }
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
      <html>
        <head>
          <title>Medical Prescription</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .doctor-info { text-align: center; margin-bottom: 30px; }
            .patient-info { margin-bottom: 20px; }
            .prescription { margin-bottom: 30px; }
            .medication { margin-bottom: 10px; }
            .instructions { margin-bottom: 20px; }
            .signature { margin-top: 50px; text-align: right; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Medical Prescription</h2>
          </div>
          <div class="doctor-info">
            <h3>Dr. ${JSON.parse(localStorage.getItem('user')).firstName} ${JSON.parse(localStorage.getItem('user')).lastName}</h3>
            <p>${JSON.parse(localStorage.getItem('user')).specialization || 'Specialist'}</p>
          </div>
          <div class="patient-info">
            <p><strong>Patient:</strong> ${selectedPatient.name}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="prescription">
            <h3>Medications</h3>
            <table>
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${prescriptionData.medications.map(med => `
                  <tr>
                    <td>${med.name}</td>
                    <td>${med.dosage}</td>
                    <td>${med.frequency}</td>
                    <td>${med.duration}</td>
                    <td>${med.notes}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="instructions">
            <h3>Instructions</h3>
            <p>${prescriptionData.instructions}</p>
          </div>
          <div class="follow-up">
            <h3>Follow-up</h3>
            <p>Please return for follow-up on: ${prescriptionData.followUpDate}</p>
          </div>
          <div class="signature">
            <p>Doctor's Signature: ____________________</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleNewPatientChange = (field, value) => {
    setNewPatient({
      ...newPatient,
      [field]: value
    });
  };

  const handleRegisterPatient = async () => {
    try {
      // Create patient registration data from the selected patient
      const patientData = {
        username: selectedPatient.email.split('@')[0],
        email: selectedPatient.email,
        password: selectedPatient.email, // Use email as password
        firstName: selectedPatient.name.split(' ')[0] || '',
        lastName: selectedPatient.name.split(' ').slice(1).join(' ') || '',
        mobile: selectedPatient.contactNumber || '',
        // Add these additional fields with default values
        gender: 'Not specified',
        age: '0',
        role: 'patient',
        verified: true // Set verified to true so they can log in immediately
      };

      console.log("patientData", patientData);

      const token = localStorage.getItem('token');
      // Use the correct endpoint for patient registration
      const response = await axios.post(
        'http://localhost:5000/api/auth/register',
        patientData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("response data", response);

      if (response.data) {
        // Update the selected patient to show they're registered
        setSelectedPatient({
          ...selectedPatient,
          isRegistered: true
        });

        alert('Patient registered successfully! Their password is their email address.');

        // Refresh patient list
        const patientsResponse = await axios.get('http://localhost:5000/api/doctor/unique-patients', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (patientsResponse.data.success) {
          setPatients(patientsResponse.data.patients);
        }
      }
    } catch (err) {
      console.error('Error registering patient:', err);
      // Log more detailed error information
      if (err.response && err.response.data) {
        console.error('Server error details:', err.response.data);
      }
      alert(`Error registering patient: ${err.response?.data?.message || err.message}`);
    }
  };
  const handleAddPatient = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/doctor/patients',
        newPatient,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        alert('Patient added successfully');
        setShowAddForm(false);
        // Refresh patient list
        const patientsResponse = await axios.get('http://localhost:5000/api/doctor/unique-patients', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });



        if (patientsResponse.data.success) {
          setPatients(patientsResponse.data.patients);
        }

        console.log("patientsResponse", patientsResponse);
      }
    } catch (err) {
      console.error('Error adding patient:', err);
      alert(`Error adding patient: ${err.response?.data?.message || err.message}`);
    }
  };


  const sortedPrescriptions = [...allPrescriptions].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="section-container">
      <div className="section-header">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="add-patient" onClick={() => setShowAddForm(true)}>
          Add Patient
        </button>
      </div>

      {loading ? (
        <div className="loading-message">Loading patients data...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="patients-list">
          {filteredPatients.length === 0 ? (
            <div className="no-results">No patients found</div>
          ) : (
            filteredPatients.map((patient, index) => (
              <div key={index} className="patient-card">
                <div className="patient-info">
                  <div className="patient-avatar">
                    {patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="patient-details">
                    <h4>{patient.name}</h4>
                    <p>Email: {patient.email}</p>
                    <p>Contact: {patient.contactNumber || 'Not provided'}</p>
                    <p>Last Visit: {formatDate(patient.lastAppointment)}</p>
                    <p>Total Visits: {patient.appointmentCount}</p>
                  </div>
                </div>
                <div className="patient-actions">
                  <button className="view-profile" onClick={() => handleViewProfile(patient)}>
                    View Profile
                  </button>
                  <button className="schedule">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && selectedPatient && (
        <div className="modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
            width: '90%',
            height: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <div className="modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px 20px',
              borderBottom: '1px solid #eee'
            }}>
              <h3 style={{ margin: 0 }}>Patient Profile: {selectedPatient.name}</h3>

              <button
                onClick={() => setShowProfileModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>

            </div>

            <div className="modal-tabs" style={{
              display: 'flex',
              borderBottom: '1px solid #eee'
            }}>
              <button
                style={{
                  padding: '12px 20px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'profile' ? '3px solid #4a90e2' : '3px solid transparent',
                  cursor: 'pointer',
                  color: activeTab === 'profile' ? '#4a90e2' : '#666',
                  fontWeight: activeTab === 'profile' ? 'bold' : 'normal'
                }}
                onClick={() => setActiveTab('profile')}
              >
                Profile
              </button>
              <button
                style={{
                  padding: '12px 20px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'visits' ? '3px solid #4a90e2' : '3px solid transparent',
                  cursor: 'pointer',
                  color: activeTab === 'visits' ? '#4a90e2' : '#666',
                  fontWeight: activeTab === 'visits' ? 'bold' : 'normal'
                }}
                onClick={() => setActiveTab('visits')}
              >
                Visits
              </button>
              <button
                style={{
                  padding: '12px 20px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'prescription' ? '3px solid #4a90e2' : '3px solid transparent',
                  cursor: 'pointer',
                  color: activeTab === 'prescription' ? '#4a90e2' : '#666',
                  fontWeight: activeTab === 'prescription' ? 'bold' : 'normal'
                }}
                onClick={() => setActiveTab('prescription')}
              >
                Prescription
              </button>
              <button
                style={{
                  padding: '12px 20px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'reports' ? '3px solid #4a90e2' : '3px solid transparent',
                  cursor: 'pointer',
                  color: activeTab === 'reports' ? '#4a90e2' : '#666',
                  fontWeight: activeTab === 'reports' ? 'bold' : 'normal'
                }}
                onClick={() => setActiveTab('reports')}
              >
                Reports
              </button>

              <button
                style={{
                  padding: '12px 20px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'reminders' ? '3px solid #4a90e2' : '3px solid transparent',
                  cursor: 'pointer',
                  color: activeTab === 'reminders' ? '#4a90e2' : '#666',
                  fontWeight: activeTab === 'reminders' ? 'bold' : 'normal'
                }}
                onClick={() => setActiveTab('reminders')}
              >
                Reminders
              </button>
            </div>

            <div className="modal-body" style={{ padding: '20px' }}>

              {activeTab === 'profile' && (
                <div className="profile-tab" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>
                    <h4 style={{ margin: 0 }}>Personal Information</h4>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      backgroundColor: '#4a90e2',
                      color: 'white',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: '2.5rem',
                      fontWeight: 'bold'
                    }}>
                      {selectedPatient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                  </div>

                  <div style={{
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '15px'
                  }}>
                    <h4 style={{
                      margin: '0 0 15px 0',
                      borderBottom: '1px solid #eee',
                      paddingBottom: '10px'
                    }}>Personal Information</h4>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '15px'
                    }}>
                      <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Name:</label>
                        <span>{selectedPatient.name}</span>
                      </div>
                      <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Email:</label>
                        <span>{selectedPatient.email}</span>
                      </div>
                      <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Contact:</label>
                        <span>{selectedPatient.contactNumber || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Only show Register button if patient is not registered */}
                  {selectedPatient && selectedPatient.isRegistered === false && (
                    <div style={{
                      border: '1px solid #e6f7e6',
                      borderRadius: '8px',
                      padding: '15px',
                      marginBottom: '15px',
                      backgroundColor: '#f0fff0'
                    }}>
                      <p style={{ margin: '0 0 10px 0' }}>This patient is not registered in the system. Register them to enable online access.</p>
                      <button
                        style={{
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '8px 15px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                        onClick={handleRegisterPatient}
                      >
                        <FaPlus /> Register Patient
                      </button>
                    </div>
                  )}

                  {/* Show registered status if patient is registered */}
                  {selectedPatient && selectedPatient.isRegistered === true && (
                    <div style={{
                      border: '1px solid #e6f7e6',
                      borderRadius: '8px',
                      padding: '15px',
                      marginBottom: '15px',
                      backgroundColor: '#f0fff0'
                    }}>
                      <p style={{ margin: '0', color: '#2e7d32' }}>✓ This patient is registered in the system and can access their account online.</p>
                    </div>
                  )}

                  <div style={{
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    padding: '15px'
                  }}>
                    <h4 style={{
                      margin: '0 0 15px 0',
                      borderBottom: '1px solid #eee',
                      paddingBottom: '10px'
                    }}>Visit Information</h4>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '15px'
                    }}>
                      <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Total Visits:</label>
                        <span>{selectedPatient.appointmentCount}</span>
                      </div>
                      <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Last Visit:</label>
                        <span>{formatDate(selectedPatient.lastAppointment)}</span>
                      </div>
                      <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Last Reason:</label>
                        <span>{selectedPatient.lastReason || 'Not provided'}</span>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {activeTab === 'visits' && (
                <div>
                  <h4 style={{ marginTop: 0 }}>Visit History</h4>
                  {visits.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left', padding: '12px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>Date</th>
                            <th style={{ textAlign: 'left', padding: '12px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>Time</th>
                            <th style={{ textAlign: 'left', padding: '12px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>Reason</th>
                            <th style={{ textAlign: 'left', padding: '12px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>Status</th>
                            <th style={{ textAlign: 'left', padding: '12px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visits.map((visit, index) => (
                            <tr key={index}>
                              <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{formatDate(visit.date)}</td>
                              <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{visit.time || 'N/A'}</td>
                              <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{visit.reason}</td>
                              <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  backgroundColor: visit.status === 'scheduled' ? '#e3f2fd' : '#e8f5e9',
                                  color: visit.status === 'scheduled' ? '#1976d2' : '#388e3c'
                                }}>
                                  {visit.status}
                                </span>
                              </td>
                              <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{visit.type}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>No visit history available</p>
                  )}
                </div>
              )}

              {activeTab === 'prescription' && (
                <div style={{ padding: '20px' }}>

                  {/* New/Edit Prescription Form */}
                  <div id="new-prescription-form" style={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '15px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}>
                    <h4 style={{ marginTop: '0', marginBottom: '15px', color: '#333' }}>
                      {prescription._id ? 'Edit Prescription' : 'New Prescription'}
                    </h4>

                    {/* Medications section from second code snippet */}
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ marginTop: 0 }}>Medications</h4>
                      {prescription.medications.map((medication, index) => (
                        <div key={index} style={{
                          backgroundColor: '#f9f9f9',
                          borderRadius: '8px',
                          padding: '15px',
                          marginBottom: '15px',
                          position: 'relative'
                        }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Medication Name</label>
                              <input
                                type="text"
                                value={medication.name}
                                onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                                placeholder="Medication name"
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Dosage</label>
                              <input
                                type="text"
                                value={medication.dosage}
                                onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                                placeholder="e.g., 500mg"
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                              />
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Frequency</label>
                              <input
                                type="text"
                                value={medication.frequency}
                                onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                                placeholder="e.g., Twice daily"
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Duration</label>
                              <input
                                type="text"
                                value={medication.duration}
                                onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                                placeholder="e.g., 7 days"
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                              />
                            </div>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Notes</label>
                            <textarea
                              value={medication.notes}
                              onChange={(e) => handleMedicationChange(index, 'notes', e.target.value)}
                              placeholder="Additional instructions"
                              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '80px' }}
                            />
                          </div>
                          {prescription.medications.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMedication(index)}
                              style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                backgroundColor: '#ffebee',
                                color: '#d32f2f',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '5px 10px',
                                cursor: 'pointer'
                              }}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Instructions</label>
                      <textarea
                        value={prescription.instructions}
                        onChange={(e) => handlePrescriptionChange('instructions', e.target.value)}
                        placeholder="General instructions for the patient"
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '100px' }}
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Follow-up Date</label>
                      <input
                        type="date"
                        value={prescription.followUpDate}
                        onChange={(e) => handlePrescriptionChange('followUpDate', e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                      <button
                        type="button"
                        onClick={handleAddMedication}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#ecfdf5',
                          color: '#10b981',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <FaPlus /> Add Medication
                      </button>
                      <button
                        type="button"
                        onClick={handleSavePrescription}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#4285f4',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        {prescription._id ? 'Update Prescription' : 'Save Prescription'}
                      </button>
                      {prescription._id && (
                        <button
                          type="button"
                          onClick={() => {
                            setPrescription({
                              medications: [{ name: '', dosage: '', frequency: '', duration: '', notes: '' }],
                              instructions: '',
                              followUpDate: ''
                            });
                          }}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#f3f4f6',
                            color: '#4b5563',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          Cancel Edit
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handlePrintPrescription}
                        style={{
                          backgroundColor: '#f5f5f5',
                          color: '#333',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '8px 16px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <FaPrint /> Print
                      </button>
                    </div>
                  </div>
                  {/* Display all prescriptions */}
                  <div style={{ marginBottom: '30px' }}>
                    <h4 style={{ marginTop: '0', marginBottom: '15px', color: '#333' }}>Previous Prescriptions</h4>
                    {allPrescriptions.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {sortedPrescriptions.map((prescriptionItem, index) => (
                          <div key={prescriptionItem._id || index} style={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '15px',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                          }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '15px'
                            }}>
                              <div>
                                <span style={{ fontWeight: '500', color: '#1f2937', marginRight: '10px' }}>
                                  {new Date(prescriptionItem.createdAt).toLocaleDateString()}
                                </span>
                                <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                                  Dr. {prescriptionItem.doctorName || 'Unknown'}
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  style={{
                                    padding: '6px 12px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    backgroundColor: '#eff6ff',
                                    color: '#3b82f6'
                                  }}
                                  onClick={() => {
                                    setPrescription(prescriptionItem);
                                    document.getElementById('new-prescription-form').scrollIntoView({ behavior: 'smooth' });
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  style={{
                                    padding: '6px 12px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    backgroundColor: '#fee2e2',
                                    color: '#ef4444'
                                  }}
                                  onClick={async () => {
                                    if (window.confirm('Are you sure you want to delete this prescription?')) {
                                      try {
                                        const token = localStorage.getItem('token');
                                        const response = await axios.delete(
                                          `http://localhost:5000/api/patient/doctor/patient/${selectedPatient.email}/prescriptions/${prescriptionItem._id}`,
                                          {
                                            headers: {
                                              Authorization: `Bearer ${token}`
                                            }
                                          }
                                        );

                                        if (response.data.success) {
                                          alert('Prescription deleted successfully');
                                          // Remove from local state
                                          setAllPrescriptions(allPrescriptions.filter(p => p._id !== prescriptionItem._id));
                                        } else {
                                          alert('Failed to delete prescription: ' + response.data.message);
                                        }
                                      } catch (err) {
                                        console.error('Error deleting prescription:', err);
                                        alert(`Error deleting prescription: ${err.response?.data?.message || err.message}`);
                                      }
                                    }
                                  }}
                                >
                                  Delete
                                </button>

                                <button
                                  className="print"
                                  style={{
                                    backgroundColor: '#cce5ff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '6px 12px',
                                    cursor: 'pointer',
                                    color: '#004085',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  onClick={() => handlePrintPrescription(prescriptionItem)}
                                >
                                  <FaPrint /> Print
                                </button>
                              </div>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                  <tr>
                                    <th style={{
                                      padding: '8px 12px',
                                      textAlign: 'left',
                                      borderBottom: '1px solid #e5e7eb',
                                      backgroundColor: '#f9fafb',
                                      fontWeight: '500',
                                      color: '#4b5563'
                                    }}>Medication</th>
                                    <th style={{
                                      padding: '8px 12px',
                                      textAlign: 'left',
                                      borderBottom: '1px solid #e5e7eb',
                                      backgroundColor: '#f9fafb',
                                      fontWeight: '500',
                                      color: '#4b5563'
                                    }}>Dosage</th>
                                    <th style={{
                                      padding: '8px 12px',
                                      textAlign: 'left',
                                      borderBottom: '1px solid #e5e7eb',
                                      backgroundColor: '#f9fafb',
                                      fontWeight: '500',
                                      color: '#4b5563'
                                    }}>Frequency</th>
                                    <th style={{
                                      padding: '8px 12px',
                                      textAlign: 'left',
                                      borderBottom: '1px solid #e5e7eb',
                                      backgroundColor: '#f9fafb',
                                      fontWeight: '500',
                                      color: '#4b5563'
                                    }}>Duration</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {prescriptionItem.medications.map((med, medIndex) => (
                                    <tr key={medIndex}>
                                      <td style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>{med.name}</td>
                                      <td style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>{med.dosage}</td>
                                      <td style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>{med.frequency}</td>
                                      <td style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>{med.duration}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            {prescriptionItem.instructions && (
                              <div style={{ marginTop: '10px', color: '#4b5563', fontSize: '0.95rem' }}>
                                <strong style={{ color: '#1f2937' }}>Instructions:</strong> {prescriptionItem.instructions}
                              </div>
                            )}
                            {prescriptionItem.followUpDate && (
                              <div style={{ marginTop: '10px', color: '#4b5563', fontSize: '0.95rem' }}>
                                <strong style={{ color: '#1f2937' }}>Follow-up:</strong> {prescriptionItem.followUpDate}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No prescriptions available for this patient.</p>
                    )}
                  </div>


                </div>
              )}
              {activeTab === 'reports' && (
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>
                    <h4 style={{ margin: 0 }}>Medical Reports</h4>
                    <button
                      style={{
                        backgroundColor: '#4a90e2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px 15px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                      onClick={() => document.getElementById('add-report-form').style.display = 'block'}
                    >
                      <FaPlus /> Add New Report
                    </button>
                  </div>

                  {/* Reports List */}
                  {reports.length > 0 ? (
                    <div style={{ marginBottom: '30px' }}>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              <th style={{ textAlign: 'left', padding: '12px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>Title</th>
                              <th style={{ textAlign: 'left', padding: '12px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>Type</th>
                              <th style={{ textAlign: 'left', padding: '12px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>Date</th>
                              <th style={{ textAlign: 'left', padding: '12px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reports.map((report, index) => (
                              <tr key={index}>
                                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{report.title}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{report.type}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{formatDate(report.date)}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                                  <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                      style={{
                                        backgroundColor: '#e3f2fd',
                                        color: '#1976d2',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '5px 10px',
                                        cursor: 'pointer'
                                      }}
                                      onClick={() => {
                                        // View report details
                                        const reportDetails = document.getElementById(`report-details-${index}`);
                                        if (reportDetails.style.display === 'none') {
                                          reportDetails.style.display = 'block';
                                        } else {
                                          reportDetails.style.display = 'none';
                                        }
                                      }}
                                    >
                                      View
                                    </button>
                                    {report.fileUrl && (
                                      <a
                                        href={`http://localhost:5000${report.fileUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          backgroundColor: '#e8f5e9',
                                          color: '#2e7d32',
                                          border: 'none',
                                          borderRadius: '4px',
                                          padding: '5px 10px',
                                          cursor: 'pointer',
                                          textDecoration: 'none',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '5px',
                                          fontSize: '14px'
                                        }}
                                      >
                                        <FaFilePdf /> Open File
                                      </a>
                                    )}
                                    <button
                                      style={{
                                        backgroundColor: '#f5f5f5',
                                        color: '#333',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '5px 10px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                      }}
                                      onClick={() => {
                                        // Print report
                                        const printWindow = window.open('', '_blank');
                                        printWindow.document.write(`
                              <html>
                                <head>
                                  <title>Medical Report - ${report.title}</title>
                                  <style>
                                    body { font-family: Arial, sans-serif; margin: 20px; }
                                    .header { text-align: center; margin-bottom: 20px; }
                                    .doctor-info { text-align: center; margin-bottom: 30px; }
                                    .patient-info { margin-bottom: 20px; }
                                    .report-details { margin-bottom: 30px; }
                                    .signature { margin-top: 50px; text-align: right; }
                                  </style>
                                </head>
                                <body>
                                  <div class="header">
                                    <h2>Medical Report</h2>
                                  </div>
                                  <div class="doctor-info">
                                    <h3>Dr. ${JSON.parse(localStorage.getItem('user')).firstName} ${JSON.parse(localStorage.getItem('user')).lastName}</h3>
                                    <p>${JSON.parse(localStorage.getItem('user')).specialization || 'Specialist'}</p>
                                  </div>
                                  <div class="patient-info">
                                    <p><strong>Patient:</strong> ${selectedPatient.name}</p>
                                    <p><strong>Report Date:</strong> ${formatDate(report.date)}</p>
                                    <p><strong>Report Type:</strong> ${report.type}</p>
                                  </div>
                                  <div class="report-details">
                                    <h3>${report.title}</h3>
                                    <p><strong>Description:</strong> ${report.description}</p>
                                    <p><strong>Results:</strong> ${report.results}</p>
                                    <p><strong>Recommendations:</strong> ${report.recommendations}</p>
                                  </div>
                                  <div class="signature">
                                    <p>Doctor's Signature: ____________________</p>
                                  </div>
                                </body>
                              </html>
                            `);
                                        printWindow.document.close();
                                        printWindow.focus();
                                        printWindow.print();
                                      }}
                                    >
                                      <FaPrint /> Print
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Report Details (Hidden by default) */}
                      {reports.map((report, index) => (
                        <div
                          key={index}
                          id={`report-details-${index}`}
                          style={{
                            display: 'none',
                            marginTop: '20px',
                            padding: '15px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '8px',
                            border: '1px solid #eee'
                          }}
                        >
                          <h4 style={{ marginTop: 0 }}>{report.title}</h4>
                          <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Description:</label>
                            <p style={{ margin: 0 }}>{report.description}</p>
                          </div>
                          <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Results:</label>
                            <p style={{ margin: 0 }}>{report.results}</p>
                          </div>
                          <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Recommendations:</label>
                            <p style={{ margin: 0 }}>{report.recommendations}</p>
                          </div>
                          {report.fileUrl && (
                            <div>
                              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Attached File:</label>
                              <a
                                href={`http://localhost:5000${report.fileUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  color: '#1976d2',
                                  textDecoration: 'none'
                                }}
                              >
                                <FaFilePdf /> {report.fileName || 'View Document'}
                              </a>
                            </div>
                          )}
                          <button
                            style={{
                              marginTop: '15px',
                              backgroundColor: '#f5f5f5',
                              color: '#333',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '8px 15px',
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              document.getElementById(`report-details-${index}`).style.display = 'none';
                            }}
                          >
                            Close Details
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No reports available for this patient.</p>
                  )}

                  {/* Add Report Form */}
                  <div id="add-report-form" style={{
                    display: 'none',
                    marginTop: '20px',
                    padding: '20px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px',
                    border: '1px solid #eee'
                  }}>
                    <h4 style={{ marginTop: 0 }}>Add New Report</h4>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Report Title:</label>
                      <input
                        type="text"
                        value={newReport.title}
                        onChange={(e) => handleReportChange('title', e.target.value)}
                        placeholder="Enter report title"
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                      <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Report Type:</label>
                        <select
                          value={newReport.type}
                          onChange={(e) => handleReportChange('type', e.target.value)}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                          <option value="Lab Test">Lab Test</option>
                          <option value="X-Ray">X-Ray</option>
                          <option value="MRI">MRI</option>
                          <option value="CT Scan">CT Scan</option>
                          <option value="Ultrasound">Ultrasound</option>
                          <option value="Pathology">Pathology</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Report Date:</label>
                        <input
                          type="date"
                          value={newReport.date}
                          onChange={(e) => handleReportChange('date', e.target.value)}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Description:</label>
                      <textarea
                        value={newReport.description}
                        onChange={(e) => handleReportChange('description', e.target.value)}
                        placeholder="Enter report description"
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '80px' }}
                      />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Results:</label>
                      <textarea
                        value={newReport.results}
                        onChange={(e) => handleReportChange('results', e.target.value)}
                        placeholder="Enter test results"
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '80px' }}
                      />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Recommendations:</label>
                      <textarea
                        value={newReport.recommendations}
                        onChange={(e) => handleReportChange('recommendations', e.target.value)}
                        placeholder="Enter recommendations based on results"
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '80px' }}
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Attach File:</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="file"
                          id="report-file"
                          onChange={handleFileChange}
                          accept=".pdf,.jpg,.jpeg,.png"
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="report-file" style={{
                          display: 'inline-block',
                          padding: '8px 16px',
                          backgroundColor: '#f0f0f0',
                          color: '#333',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'normal'
                        }}>
                          Choose File
                        </label>
                        <span style={{ color: '#666' }}>
                          {newReport.file ? newReport.file.name : 'No file chosen'}
                        </span>
                      </div>
                      <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                        Upload report documents, images, or scans (PDF, JPG, PNG - Max: 10MB)
                      </small>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={handleAddReport}
                        style={{
                          backgroundColor: '#4a90e2',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '10px 20px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Save Report
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          document.getElementById('add-report-form').style.display = 'none';
                          // Reset form
                          setNewReport({
                            title: '',
                            type: 'Lab Test',
                            date: new Date().toISOString().split('T')[0],
                            description: '',
                            results: '',
                            recommendations: '',
                            file: null
                          });
                        }}
                        style={{
                          backgroundColor: '#f5f5f5',
                          color: '#333',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '10px 20px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'reminders' && (
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>
                    <h4 style={{ margin: 0 }}>Patient Reminders</h4>
                    <button
                      style={{
                        backgroundColor: '#4a90e2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px 15px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                      onClick={() => document.getElementById('add-reminder-form').style.display = 'block'}
                    >
                      <FaPlus /> Add New Reminder
                    </button>
                  </div>

                  {/* Reminders List */}
                  {reminders.length > 0 ? (
                    <div style={{ marginBottom: '30px' }}>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              <th style={{ textAlign: 'left', padding: '12px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>Title</th>
                              <th style={{ textAlign: 'left', padding: '12px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>Type</th>
                              <th style={{ textAlign: 'left', padding: '12px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>Date & Time</th>
                              <th style={{ textAlign: 'left', padding: '12px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>Status</th>
                              <th style={{ textAlign: 'left', padding: '12px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reminders.map((reminder, index) => (
                              <tr key={index}>
                                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{reminder.title}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                                  {reminder.type.charAt(0).toUpperCase() + reminder.type.slice(1)}
                                  {reminder.recurring && <span style={{ marginLeft: '5px', fontSize: '0.8em', color: '#666' }}>
                                    (Recurring: {reminder.recurringPattern})
                                  </span>}
                                </td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                                  {formatDate(reminder.date)} at {reminder.time}
                                </td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                                  <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.85em',
                                    backgroundColor:
                                      reminder.status === 'completed' ? '#e6f7e6' :
                                        reminder.status === 'missed' ? '#ffebee' : '#e3f2fd',
                                    color:
                                      reminder.status === 'completed' ? '#2e7d32' :
                                        reminder.status === 'missed' ? '#c62828' : '#1565c0'
                                  }}>
                                    {reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
                                  </span>
                                </td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                                  <div style={{ display: 'flex', gap: '5px' }}>
                                    <button
                                      style={{
                                        backgroundColor: '#e8f5e9',
                                        color: '#2e7d32',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '5px 10px',
                                        cursor: 'pointer',
                                        fontSize: '0.85em'
                                      }}
                                      onClick={() => handleUpdateReminderStatus(reminder.id, 'completed')}
                                      disabled={reminder.status === 'completed'}
                                    >
                                      Complete
                                    </button>
                                    <button
                                      style={{
                                        backgroundColor: '#ffebee',
                                        color: '#c62828',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '5px 10px',
                                        cursor: 'pointer',
                                        fontSize: '0.85em'
                                      }}
                                      onClick={() => handleUpdateReminderStatus(reminder.id, 'missed')}
                                      disabled={reminder.status === 'missed'}
                                    >
                                      Missed
                                    </button>
                                    <button
                                      style={{
                                        backgroundColor: '#f5f5f5',
                                        color: '#333',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '5px 10px',
                                        cursor: 'pointer',
                                        fontSize: '0.85em'
                                      }}
                                      onClick={() => {
                                        // View reminder details
                                        const reminderDetails = document.getElementById(`reminder-details-${index}`);
                                        if (reminderDetails.style.display === 'none') {
                                          reminderDetails.style.display = 'block';
                                        } else {
                                          reminderDetails.style.display = 'none';
                                        }
                                      }}
                                    >
                                      Details
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Reminder Details (Hidden by default) */}
                      {reminders.map((reminder, index) => (
                        <div
                          key={index}
                          id={`reminder-details-${index}`}
                          style={{
                            display: 'none',
                            marginTop: '20px',
                            padding: '15px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '8px',
                            border: '1px solid #eee'
                          }}
                        >
                          <h4 style={{ marginTop: 0 }}>{reminder.title}</h4>
                          <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Description:</label>
                            <p style={{ margin: 0 }}>{reminder.description || 'No description provided'}</p>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Date:</label>
                              <p style={{ margin: 0 }}>{formatDate(reminder.date)}</p>
                            </div>
                            <div>
                              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Time:</label>
                              <p style={{ margin: 0 }}>{reminder.time}</p>
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Type:</label>
                              <p style={{ margin: 0 }}>{reminder.type.charAt(0).toUpperCase() + reminder.type.slice(1)}</p>
                            </div>
                            <div>
                              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Status:</label>
                              <p style={{ margin: 0 }}>{reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}</p>
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Recurring:</label>
                              <p style={{ margin: 0 }}>{reminder.recurring ? 'Yes' : 'No'}</p>
                            </div>
                            {reminder.recurring && (
                              <div>
                                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Pattern:</label>
                                <p style={{ margin: 0 }}>{reminder.recurringPattern.charAt(0).toUpperCase() + reminder.recurringPattern.slice(1)}</p>
                              </div>
                            )}
                          </div>
                          <div>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Notification:</label>
                            <p style={{ margin: 0 }}>{reminder.notificationTime} minutes before</p>
                          </div>
                          <button
                            style={{
                              marginTop: '15px',
                              backgroundColor: '#f5f5f5',
                              color: '#333',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '8px 15px',
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              document.getElementById(`reminder-details-${index}`).style.display = 'none';
                            }}
                          >
                            Close Details
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No reminders set for this patient.</p>
                  )}

                  {/* Add Reminder Form */}
                  <div id="add-reminder-form" style={{
                    display: 'none',
                    marginTop: '20px',
                    padding: '20px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px',
                    border: '1px solid #eee'
                  }}>
                    <h4 style={{ marginTop: 0 }}>Add New Reminder</h4>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Reminder Title:</label>
                      <input
                        type="text"
                        value={newReminder.title}
                        onChange={(e) => handleReminderChange('title', e.target.value)}
                        placeholder="Enter reminder title"
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                      />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Description:</label>
                      <textarea
                        value={newReminder.description}
                        onChange={(e) => handleReminderChange('description', e.target.value)}
                        placeholder="Enter reminder description"
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '80px' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                      <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Date:</label>
                        <input
                          type="date"
                          value={newReminder.date}
                          onChange={(e) => handleReminderChange('date', e.target.value)}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Time:</label>
                        <input
                          type="time"
                          value={newReminder.time}
                          onChange={(e) => handleReminderChange('time', e.target.value)}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Reminder Type:</label>
                      <select
                        value={newReminder.type}
                        onChange={(e) => handleReminderChange('type', e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                      >
                        <option value="medication">Medication</option>
                        <option value="appointment">Appointment</option>
                        <option value="test">Medical Test</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={newReminder.recurring}
                          onChange={(e) => handleReminderChange('recurring', e.target.checked)}
                        />
                        <span style={{ fontWeight: 'bold' }}>Recurring Reminder</span>
                      </label>
                    </div>

                    {newReminder.recurring && (
                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Recurring Pattern:</label>
                        <select
                          value={newReminder.recurringPattern}
                          onChange={(e) => handleReminderChange('recurringPattern', e.target.value)}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                    )}

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Notification Time (minutes before):</label>
                      <select
                        value={newReminder.notificationTime}
                        onChange={(e) => handleReminderChange('notificationTime', parseInt(e.target.value))}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                      >
                        <option value="5">5 minutes before</option>
                        <option value="15">15 minutes before</option>
                        <option value="30">30 minutes before</option>
                        <option value="60">1 hour before</option>
                        <option value="120">2 hours before</option>
                        <option value="1440">1 day before</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={handleAddReminder}
                        style={{
                          backgroundColor: '#4a90e2',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '10px 20px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Save Reminder
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          document.getElementById('add-reminder-form').style.display = 'none';
                          // Reset form
                          setNewReminder({
                            title: '',
                            description: '',
                            date: new Date().toISOString().split('T')[0],
                            time: '09:00',
                            type: 'medication',
                            recurring: false,
                            recurringPattern: 'daily',
                            notificationTime: 30
                          });
                        }}
                        style={{
                          backgroundColor: '#f5f5f5',
                          color: '#333',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '10px 20px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {showAddForm && (
        <div className="modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <div className="modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px 20px',
              borderBottom: '1px solid #eee'
            }}>
              <h3 style={{ margin: 0 }}>
                {newPatient.email ? `Register Patient: ${newPatient.email}` : 'Add New Patient'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  // Reset form
                  setNewPatient({
                    username: '',
                    email: '',
                    password: '123456', // Default password
                    firstName: '',
                    lastName: '',
                    age: '',
                    gender: '',
                    mobile: '',
                    phone: '',
                    city: '',
                    state: '',
                    country: '',
                    emergencyContact: '',
                    chronicConditions: '',
                    pastSurgeries: '',
                    allergies: ''
                  });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            <div className="add-patient-form">
              <div className="form-section">
                <h4>Personal Information</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      value={newPatient.firstName}
                      onChange={(e) => handleNewPatientChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      value={newPatient.lastName}
                      onChange={(e) => handleNewPatientChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={newPatient.email}
                      onChange={(e) => handleNewPatientChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                      type="text"
                      id="username"
                      value={newPatient.username}
                      onChange={(e) => handleNewPatientChange('username', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="age">Age</label>
                    <input
                      type="number"
                      id="age"
                      value={newPatient.age}
                      onChange={(e) => handleNewPatientChange('age', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="gender">Gender</label>
                    <select
                      id="gender"
                      value={newPatient.gender}
                      onChange={(e) => handleNewPatientChange('gender', e.target.value)}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="mobile">Mobile</label>
                    <input
                      type="tel"
                      id="mobile"
                      value={newPatient.mobile}
                      onChange={(e) => handleNewPatientChange('mobile', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone (Optional)</label>
                    <input
                      type="tel"
                      id="phone"
                      value={newPatient.phone}
                      onChange={(e) => handleNewPatientChange('phone', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Address Information</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      value={newPatient.city}
                      onChange={(e) => handleNewPatientChange('city', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="state">State</label>
                    <input
                      type="text"
                      id="state"
                      value={newPatient.state}
                      onChange={(e) => handleNewPatientChange('state', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <input
                      type="text"
                      id="country"
                      value={newPatient.country}
                      onChange={(e) => handleNewPatientChange('country', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Medical Information</h4>
                <div className="form-group">
                  <label htmlFor="emergencyContact">Emergency Contact</label>
                  <input
                    type="text"
                    id="emergencyContact"
                    value={newPatient.emergencyContact}
                    onChange={(e) => handleNewPatientChange('emergencyContact', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="chronicConditions">Chronic Conditions</label>
                  <textarea
                    id="chronicConditions"
                    value={newPatient.chronicConditions}
                    onChange={(e) => handleNewPatientChange('chronicConditions', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="pastSurgeries">Past Surgeries</label>
                  <textarea
                    id="pastSurgeries"
                    value={newPatient.pastSurgeries}
                    onChange={(e) => handleNewPatientChange('pastSurgeries', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="allergies">Allergies</label>
                  <textarea
                    id="allergies"
                    value={newPatient.allergies}
                    onChange={(e) => handleNewPatientChange('allergies', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="submit-btn" onClick={handleAddPatient}>
                  Add Patient
                </button>
                <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;
