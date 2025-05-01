import React, { useState } from 'react';
import "../DoctorDashboard.scss"

const PatientManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Mock patient data
  const [patients] = useState([
    {
      id: 1,
      name: "John Doe",
      age: 35,
      contact: "(555) 123-4567",
      medicalHistory: "Hypertension, Diabetes",
      lastVisit: "2024-01-15"
    },
    // Add more mock patients as needed
  ]);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewProfile = (patient) => {
    setSelectedPatient(patient);
    setShowProfileModal(true);
  };

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
          Search
        </button>
      </div>

      <div className="patients-list">
        {filteredPatients.map(patient => (
          <div key={patient.id} className="patient-card">
            <div className="patient-info">
              <div className="patient-avatar">
                {patient.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="patient-details">
                <h4>{patient.name}</h4>
                <p>Age: {patient.age}</p>
                <p>Contact: {patient.contact}</p>
                <p>Last Visit: {patient.lastVisit}</p>
              </div>
            </div>
            <div className="patient-actions">
              <button className="view-profile" onClick={() => handleViewProfile(patient)}>
                View Profile
              </button>
              <button className="schedule">Schedule Appointment</button>
            </div>
          </div>
        ))}
      </div>

      {showProfileModal && selectedPatient && (
        <div className="modal">
          <div className="modal-content profile-modal">
            <div className="modal-header">
              <h3>Patient Profile</h3>
              <button className="close-button" onClick={() => setShowProfileModal(false)}>×</button>
            </div>
            <div className="patient-profile-content">
              <div className="profile-section">
                <h4>Personal Information</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Name:</label>
                    <span>{selectedPatient.name}</span>
                  </div>
                  <div className="info-item">
                    <label>Age:</label>
                    <span>{selectedPatient.age}</span>
                  </div>
                  <div className="info-item">
                    <label>Contact:</label>
                    <span>{selectedPatient.contact}</span>
                  </div>
                </div>
              </div>
              
              <div className="profile-section">
                <h4>Medical History</h4>
                <p>{selectedPatient.medicalHistory}</p>
              </div>
              
              <div className="profile-section">
                <h4>Visit History</h4>
                <p>Last Visit: {selectedPatient.lastVisit}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowProfileModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add New Patient</h3>
            <form className="add-patient-form">
              {/* Add form fields here */}
              <button type="submit">Add Patient</button>
              <button type="button" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;