import React, { useState, useEffect } from 'react';
import './PatientProfileModal.scss';
import axios from 'axios';

const PatientProfileModal = ({ isOpen, onClose, patient }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState([]);
  const [reports, setReports] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [newVisit, setNewVisit] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Regular Checkup',
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
  const [newPrescription, setNewPrescription] = useState({
    date: new Date().toISOString().split('T')[0],
    medications: [{ name: '', dosage: '', frequency: '', duration: '', notes: '' }],
    instructions: '',
    followUpDate: ''
  });
  const [showAddVisitForm, setShowAddVisitForm] = useState(false);
  const [showAddReportForm, setShowAddReportForm] = useState(false);
  const [showAddPrescriptionForm, setShowAddPrescriptionForm] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && patient && patient.id) {
      fetchPatientData(patient.id);
    } else if (isOpen && patient) {
      // If we already have the patient data
      setPatientData(patient);
      setVisits(patient.visits || []);
      setReports(patient.reports || []);
      setPrescriptions(patient.prescriptions || []);
      setLoading(false);
    }
  }, [isOpen, patient]);

  const fetchPatientData = async (patientId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(
        `http://localhost:5000/api/doctor/patient/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setPatientData(response.data.patient);
        setVisits(response.data.patient.visits || []);
        setReports(response.data.patient.reports || []);
        setPrescriptions(response.data.patient.prescriptions || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch patient data');
      }
    } catch (err) {
      console.error('Error fetching patient data:', err);
      setError(err.message || 'Failed to fetch patient data');
    } finally {
      setLoading(false);
    }
  };

  const handleVisitChange = (e) => {
    const { name, value } = e.target;
    setNewVisit(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReportChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setNewReport(prev => ({
        ...prev,
        file: files[0]
      }));
    } else {
      setNewReport(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePrescriptionChange = (e) => {
    const { name, value } = e.target;
    setNewPrescription(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...newPrescription.medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value
    };
    setNewPrescription(prev => ({
      ...prev,
      medications: updatedMedications
    }));
  };

  const addMedication = () => {
    setNewPrescription(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        { name: '', dosage: '', frequency: '', duration: '', notes: '' }
      ]
    }));
  };

  const removeMedication = (index) => {
    const updatedMedications = [...newPrescription.medications];
    updatedMedications.splice(index, 1);
    setNewPrescription(prev => ({
      ...prev,
      medications: updatedMedications
    }));
  };

  const handleAddVisit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post(
        `http://localhost:5000/api/doctor/patient/${patient.id}/visits`,
        newVisit,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setVisits(prev => [...prev, response.data.visit]);
        setShowAddVisitForm(false);
        setNewVisit({
          date: new Date().toISOString().split('T')[0],
          type: 'Regular Checkup',
          findings: '',
          diagnosis: '',
          treatment: '',
          followUp: ''
        });
      } else {
        throw new Error(response.data.message || 'Failed to add visit');
      }
    } catch (err) {
      console.error('Error adding visit:', err);
      setError(err.message || 'Failed to add visit');
    }
  };

  const handleAddReport = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const formData = new FormData();
      Object.keys(newReport).forEach(key => {
        if (key === 'file') {
          if (newReport.file) {
            formData.append('file', newReport.file);
          }
        } else {
          formData.append(key, newReport[key]);
        }
      });

      const response = await axios.post(
        `http://localhost:5000/api/doctor/patient/${patient.id}/reports`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setReports(prev => [...prev, response.data.report]);
        setShowAddReportForm(false);
        setNewReport({
          title: '',
          type: '',
          date: new Date().toISOString().split('T')[0],
          description: '',
          results: '',
          recommendations: '',
          file: null
        });
      } else {
        throw new Error(response.data.message || 'Failed to add report');
      }
    } catch (err) {
      console.error('Error adding report:', err);
      setError(err.message || 'Failed to add report');
    }
  };

  const handleAddPrescription = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post(
        `http://localhost:5000/api/doctor/patient/${patient.id}/prescriptions`,
        newPrescription,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setPrescriptions(prev => [...prev, response.data.prescription]);
        setShowAddPrescriptionForm(false);
        setNewPrescription({
          date: new Date().toISOString().split('T')[0],
          medications: [{ name: '', dosage: '', frequency: '', duration: '', notes: '' }],
          instructions: '',
          followUpDate: ''
        });
      } else {
        throw new Error(response.data.message || 'Failed to add prescription');
      }
    } catch (err) {
      console.error('Error adding prescription:', err);
      setError(err.message || 'Failed to add prescription');
    }
  };

  const printPrescription = (prescription) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .patient-info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .footer { margin-top: 40px; }
            .doctor-signature { text-align: right; margin-top: 60px; }
          </style>
        </head>
        <body>
          <h1>Medical Prescription</h1>
          <div class="header">
            <div>Date: ${prescription.date}</div>
          </div>
          <div class="patient-info">
            <p><strong>Patient:</strong> ${patientData.firstName} ${patientData.lastName}</p>
            <p><strong>Age:</strong> ${patientData.age || 'N/A'}</p>
            <p><strong>Gender:</strong> ${patientData.gender || 'N/A'}</p>
          </div>
          <h2>Medications</h2>
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
              ${prescription.medications.map(med => `
                <tr>
                  <td>${med.name}</td>
                  <td>${med.dosage}</td>
                  <td>${med.frequency}</td>
                  <td>${med.duration}</td>
                  <td>${med.notes || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div>
            <h3>Instructions</h3>
            <p>${prescription.instructions || 'No specific instructions'}</p>
          </div>
          <div>
            <h3>Follow-up</h3>
            <p>${prescription.followUpDate ? `Please follow up on ${prescription.followUpDate}` : 'No follow-up scheduled'}</p>
          </div>
          <div class="doctor-signature">
            <p>Doctor's Signature</p>
            <p>_______________________</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="patient-profile-modal">
        <div className="modal-overlay" onClick={onClose}></div>
        <div className="modal-content">
          <div className="modal-header">
            <h2>Patient Profile</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="loading">Loading patient data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patient-profile-modal">
        <div className="modal-overlay" onClick={onClose}></div>
        <div className="modal-content">
          <div className="modal-header">
            <h2>Patient Profile</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  const displayPatient = patientData || patient;

  return (
    <div className="patient-profile-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Patient Profile</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="patient-info">
          <div className="patient-avatar">
            {displayPatient.firstName && displayPatient.lastName 
              ? `${displayPatient.firstName[0]}${displayPatient.lastName[0]}`
              : displayPatient.name 
                ? displayPatient.name.split(' ').map(n => n[0]).join('')
                : 'P'}
          </div>
          <div className="patient-details">
            <h3>{displayPatient.firstName && displayPatient.lastName 
                ? `${displayPatient.firstName} ${displayPatient.lastName}` 
                : displayPatient.name || 'Unknown Patient'}</h3>
            <p><strong>Email:</strong> {displayPatient.email || 'N/A'}</p>
            <p><strong>Contact:</strong> {displayPatient.mobile || displayPatient.contact || 'N/A'}</p>
            <p><strong>Last Visit:</strong> {displayPatient.lastVisit || visits[0]?.date || 'N/A'}</p>
            <p><strong>Total Visits:</strong> {displayPatient.totalVisits || visits.length || 0}</p>
          </div>
        </div>

        <div className="modal-tabs">
          <button 
            className={activeTab === 'profile' ? 'active' : ''} 
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={activeTab === 'visits' ? 'active' : ''} 
            onClick={() => setActiveTab('visits')}
          >
            Visits
          </button>
          <button 
            className={activeTab === 'reports' ? 'active' : ''} 
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </button>
          <button 
            className={activeTab === 'prescriptions' ? 'active' : ''} 
            onClick={() => setActiveTab('prescriptions')}
          >
            Prescriptions
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'profile' && (
            <div className="profile-tab">
              <h4>Personal Information</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Age:</span>
                  <span className="value">{displayPatient.age || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Gender:</span>
                  <span className="value">{displayPatient.gender || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">City:</span>
                  <span className="value">{displayPatient.city || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">State:</span>
                  <span className="value">{displayPatient.state || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Country:</span>
                  <span className="value">{displayPatient.country || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Emergency Contact:</span>
                  <span className="value">{displayPatient.emergencyContact || 'N/A'}</span>
                </div>
              </div>

              <h4>Medical History</h4>
              <div className="medical-history">
                <div className="history-item">
                  <h5>Chronic Conditions</h5>
                  <p>{displayPatient.chronicConditions || 'None reported'}</p>
                </div>
                <div className="history-item">
                  <h5>Past Surgeries</h5>
                  <p>{displayPatient.pastSurgeries || 'None reported'}</p>
                </div>
                <div className="history-item">
                  <h5>Allergies</h5>
                  <p>{displayPatient.allergies || 'None reported'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'visits' && (
            <div className="visits-tab">
              <div className="tab-header">
                <h4>Visit History</h4>
                <button 
                  className="add-button"
                  onClick={() => setShowAddVisitForm(!showAddVisitForm)}
                >
                  {showAddVisitForm ? 'Cancel' : 'Add Visit'}
                </button>
              </div>

              {showAddVisitForm && (
                <form className="add-form" onSubmit={handleAddVisit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="date">Date</label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={newVisit.date}
                        onChange={handleVisitChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="type">Visit Type</label>
                      <select
                        id="type"
                        name="type"
                        value={newVisit.type}
                        onChange={handleVisitChange}
                        required
                      >
                        <option value="Regular Checkup">Regular Checkup</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Emergency">Emergency</option>
                        <option value="Consultation">Consultation</option>
                        <option value="Procedure">Procedure</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="findings">Findings</label>
                    <textarea
                      id="findings"
                      name="findings"
                      value={newVisit.findings}
                      onChange={handleVisitChange}
                      required
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label htmlFor="diagnosis">Diagnosis</label>
                    <textarea
                      id="diagnosis"
                      name="diagnosis"
                      value={newVisit.diagnosis}
                      onChange={handleVisitChange}
                      required
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label htmlFor="treatment">Treatment</label>
                    <textarea
                      id="treatment"
                      name="treatment"
                      value={newVisit.treatment}
                      onChange={handleVisitChange}
                      required
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label htmlFor="followUp">Follow-up</label>
                    <input
                      type="text"
                      id="followUp"
                      name="followUp"
                      value={newVisit.followUp}
                      onChange={handleVisitChange}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="submit-button">Add Visit</button>
                    <button 
                      type="button" 
                      className="cancel-button"
                      onClick={() => setShowAddVisitForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {visits && visits.length > 0 ? (
                <div className="visits-list">
                  {visits.map((visit, index) => (
                    <div key={index} className="visit-card">
                      <div className="visit-header">
                        <span className="visit-date">{visit.date}</span>
                        <span className="visit-type">{visit.type || 'Regular Checkup'}</span>
                      </div>
                      <div className="visit-details">
                        <p><strong>Findings:</strong> {visit.findings}</p>
                        <p><strong>Diagnosis:</strong> {visit.diagnosis}</p>
                        <p><strong>Treatment:</strong> {visit.treatment}</p>
                        {visit.followUp && <p><strong>Follow-up:</strong> {visit.followUp}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No visit history available</p>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="reports-tab">
              <div className="tab-header">
                <h4>Medical Reports</h4>
                <button 
                  className="add-button"
                  onClick={() => setShowAddReportForm(!showAddReportForm)}
                >
                  {showAddReportForm ? 'Cancel' : 'Add Report'}
                </button>
              </div>

              {showAddReportForm && (
                <form className="add-form" onSubmit={handleAddReport}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="title">Report Title</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={newReport.title}
                        onChange={handleReportChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="type">Report Type</label>
                      <select
                        id="type"
                        name="type"
                        value={newReport.type}
                        onChange={handleReportChange}
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="Blood Test">Blood Test</option>
                        <option value="X-Ray">X-Ray</option>
                        <option value="MRI">MRI</option>
                        <option value="CT Scan">CT Scan</option>
                        <option value="Ultrasound">Ultrasound</option>
                        <option value="Pathology">Pathology</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="date">Report Date</label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={newReport.date}
                        onChange={handleReportChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="file">Upload Report File</label>
                      <input
                        type="file"
                        id="file"
                        name="file"
                        onChange={handleReportChange}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={newReport.description}
                      onChange={handleReportChange}
                      required
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label htmlFor="results">Results</label>
                    <textarea
                      id="results"
                      name="results"
                      value={newReport.results}
                      onChange={handleReportChange}
                      required
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label htmlFor="recommendations">Recommendations</label>
                    <textarea
                      id="recommendations"
                      name="recommendations"
                      value={newReport.recommendations}
                      onChange={handleReportChange}
                    ></textarea>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="submit-button">Add Report</button>
                    <button 
                      type="button" 
                      className="cancel-button"
                      onClick={() => setShowAddReportForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {reports && reports.length > 0 ? (
                <div className="reports-list">
                  {reports.map((report, index) => (
                    <div key={index} className="report-card">
                      <div className="report-header">
                        <span className="report-title">{report.title}</span>
                        <span className="report-date">{report.date}</span>
                      </div>
                      <div className="report-details">
                        <p><strong>Type:</strong> {report.type}</p>
                        <p><strong>Description:</strong> {report.description}</p>
                        <p><strong>Results:</strong> {report.results}</p>
                        {report.recommendations && (
                          <p><strong>Recommendations:</strong> {report.recommendations}</p>
                        )}
                      </div>
                      {report.fileUrl && (
                        <a href={report.fileUrl} className="view-report-btn" target="_blank" rel="noopener noreferrer">
                          View Report
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No reports available</p>
              )}
            </div>
          )}


          {activeTab === 'prescriptions' && (
            <div className="prescriptions-tab">
              <div className="tab-header">
                <h4>Prescriptions</h4>
                <button 
                  className="add-button"
                  onClick={() => setShowAddPrescriptionForm(!showAddPrescriptionForm)}
                >
                  {showAddPrescriptionForm ? 'Cancel' : 'Add Prescription'}
                </button>
              </div>

              {showAddPrescriptionForm && (
                <form className="add-form" onSubmit={handleAddPrescription}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="prescriptionDate">Prescription Date</label>
                      <input
                        type="date"
                        id="prescriptionDate"
                        name="date"
                        value={newPrescription.date}
                        onChange={handlePrescriptionChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="followUpDate">Follow-up Date</label>
                      <input
                        type="date"
                        id="followUpDate"
                        name="followUpDate"
                        value={newPrescription.followUpDate}
                        onChange={handlePrescriptionChange}
                      />
                    </div>
                  </div>
                  
                  <div className="medications-section">
                    <div className="section-header">
                      <h5>Medications</h5>
                      <button 
                        type="button" 
                        className="add-medication-btn"
                        onClick={addMedication}
                      >
                        + Add Medication
                      </button>
                    </div>
                    
                    {newPrescription.medications.map((medication, index) => (
                      <div key={index} className="medication-item">
                        <div className="medication-header">
                          <h6>Medication #{index + 1}</h6>
                          {index > 0 && (
                            <button 
                              type="button" 
                              className="remove-btn"
                              onClick={() => removeMedication(index)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor={`med-name-${index}`}>Name</label>
                            <input
                              type="text"
                              id={`med-name-${index}`}
                              value={medication.name}
                              onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor={`med-dosage-${index}`}>Dosage</label>
                            <input
                              type="text"
                              id={`med-dosage-${index}`}
                              value={medication.dosage}
                              onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor={`med-frequency-${index}`}>Frequency</label>
                            <input
                              type="text"
                              id={`med-frequency-${index}`}
                              value={medication.frequency}
                              onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor={`med-duration-${index}`}>Duration</label>
                            <input
                              type="text"
                              id={`med-duration-${index}`}
                              value={medication.duration}
                              onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label htmlFor={`med-notes-${index}`}>Notes</label>
                          <textarea
                            id={`med-notes-${index}`}
                            value={medication.notes}
                            onChange={(e) => handleMedicationChange(index, 'notes', e.target.value)}
                          ></textarea>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="instructions">Instructions</label>
                    <textarea
                      id="instructions"
                      name="instructions"
                      value={newPrescription.instructions}
                      onChange={handlePrescriptionChange}
                    ></textarea>
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="submit-button">Add Prescription</button>
                    <button 
                      type="button" 
                      className="cancel-button"
                      onClick={() => setShowAddPrescriptionForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {prescriptions && prescriptions.length > 0 ? (
                <div className="prescriptions-list">
                  {prescriptions.map((prescription, index) => (
                    <div key={index} className="prescription-card">
                      <div className="prescription-header">
                        <span className="prescription-date">{prescription.date}</span>
                        <div className="prescription-actions">
                          <button 
                            className="print-btn"
                            onClick={() => printPrescription(prescription)}
                          >
                            Print
                          </button>
                        </div>
                      </div>
                      <div className="medications-list">
                        <h5>Medications</h5>
                        <table>
                          <thead>
                            <tr>
                              <th>Medication</th>
                              <th>Dosage</th>
                              <th>Frequency</th>
                              <th>Duration</th>
                            </tr>
                          </thead>
                          <tbody>
                            {prescription.medications.map((med, idx) => (
                              <tr key={idx}>
                                <td>{med.name}</td>
                                <td>{med.dosage}</td>
                                <td>{med.frequency}</td>
                                <td>{med.duration}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {prescription.instructions && (
                        <div className="prescription-instructions">
                          <h5>Instructions</h5>
                          <p>{prescription.instructions}</p>
                        </div>
                      )}
                      {prescription.followUpDate && (
                        <div className="follow-up">
                          <h5>Follow-up Date</h5>
                          <p>{prescription.followUpDate}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No prescriptions available</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientProfileModal;          