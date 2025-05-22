import React, { useState, useEffect } from 'react';
import '../MedicationPlan.scss'

const MedicationPlan = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkLocalStorage = () => {
    console.log('Checking localStorage contents:');
    
    // Check specific keys
    console.log('email:', localStorage.getItem('email'));
    console.log('userEmail:', localStorage.getItem('userEmail'));
    console.log('token:', localStorage.getItem('token'));
    console.log('user:', localStorage.getItem('user'));
    
    // List all items in localStorage
    console.log('All localStorage items:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      console.log(`${key}: ${localStorage.getItem(key)}`);
    }
  };

  // Call this in useEffect
  useEffect(() => {
    checkLocalStorage();
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get email from user object in localStorage
      let email = '';
      const userString = localStorage.getItem('user');
      
      if (userString) {
        try {
          const userData = JSON.parse(userString);
          email = userData.email || '';
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
        }
      }
      
      const token = localStorage.getItem('token') || '';
      
      if (!email) {
        throw new Error('User email not found in local storage');
      }
      
      const response = await fetch(`http://localhost:5000/api/patient/doctor/patient/${email}/prescriptions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch prescriptions: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Sort prescriptions by date (newest first)
        const sortedPrescriptions = [...data.prescriptions].sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setPrescriptions(sortedPrescriptions);
      } else {
        throw new Error(data.message || 'Failed to fetch prescriptions');
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-container">
      <h2>Medication Plan</h2>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchPrescriptions}>Retry</button>
        </div>
      )}

      <div className="section">
        <h3>Current Prescriptions</h3>
        {loading && <div className="loading-spinner">Loading...</div>}
        {!loading && prescriptions.length === 0 ? (
          <p className="no-medications">No prescriptions found.</p>
        ) : (
          <div className="prescriptions-list">
            {prescriptions.map(prescription => (
              <div key={prescription._id} className="prescription-card">
                <div className="prescription-header">
                  <div className="prescription-info">
                    <span className="doctor-name">Dr. {prescription.doctorName}</span>
                    <span className="prescription-date">
                      {new Date(prescription.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="medications-list">
                  <h4>Medications</h4>
                  <table className="medications-table">
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
                      {prescription.medications.map((med, index) => (
                        <tr key={med._id || index}>
                          <td>{med.name}</td>
                          <td>{med.dosage}</td>
                          <td>{med.frequency}</td>
                          <td>{med.duration}</td>
                          <td>{med.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {prescription.instructions && (
                  <div className="prescription-instructions">
                    <h4>Instructions</h4>
                    <p>{prescription.instructions}</p>
                  </div>
                )}
                
                {prescription.followUpDate && (
                  <div className="follow-up-date">
                    <h4>Follow-up Date</h4>
                    <p>{new Date(prescription.followUpDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationPlan;