import React, { useState } from 'react';

const SymptomChecker = () => {
  const [symptom, setSymptom] = useState('');
  const [severity, setSeverity] = useState('mild');
  const [duration, setDuration] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [conditions, setConditions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowAnalysis(false);
    
    try {
      console.log('Submitting symptoms:', { symptom, severity, duration });
      
      const response = await fetch('http://localhost:5000/api/symptoms/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptom,
          severity,
          duration
        }),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to analyze symptoms');
      }
      
      const data = await response.json();
      console.log('Analysis data:', data);
      
      setConditions(data.conditions || []);
      setDoctors(data.doctors || []);
      setShowAnalysis(true);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Remove the hardcoded specialist mapping function since we'll use AI-provided data
  // Instead, we'll use the specialist field directly from the API response

  return (
    <div className="section-container">
      <h2>Symptom Checker</h2>
      <div className="section">
        <form onSubmit={handleSubmit} className="symptom-form">
          <div className="form-group">
            <label htmlFor="symptom">Symptom</label>
            <input
              type="text"
              id="symptom"
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder="Enter your symptom"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="severity">Severity</label>
            <select
              id="severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="duration">Duration</label>
            <input
              type="text"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 3 days, 2 weeks"
              required
            />
          </div>

          <button type="submit" className="check-button">Check Symptoms</button>
        </form>
      </div>

      {loading && (
        <div className="loading-indicator">
          <p>Analyzing your symptoms...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {showAnalysis && !loading && (
        <>
          <div className="section">
            <h3>AI Condition Analysis</h3>
            <div className="analysis-results">
              {conditions.map((item, index) => (
                <div key={index} className="condition-card">
                  <div className="condition-header">
                    <h4>{item.condition}</h4>
                    <span className={`urgency-badge ${item.urgency.toLowerCase()}`}>
                      {item.urgency} Urgency
                    </span>
                  </div>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h3>Doctor Suggestions</h3>
            
            {/* Specialist recommendation section using AI-provided data */}
            <div className="specialist-recommendation">
              <h4>Recommended Specialists</h4>
              <p>Based on your symptoms, we recommend consulting with:</p>
              <ul className="specialist-list">
                {conditions.map((condition, index) => (
                  <li key={`spec-${index}`}>
                    <span className="specialist-type">
                      {condition.specialist || 'General Practitioner'}
                    </span> 
                    <span className="specialist-reason">
                      for {condition.condition}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="doctor-suggestions">
              <h4>Available Doctors</h4>
              {doctors.map((doctor, index) => (
                <div key={index} className="doctor-card">
                  <h4>{doctor.name}</h4>
                  <p><strong>Specialty:</strong> {doctor.specialty}</p>
                  <p><strong>Location:</strong> {doctor.location}</p>
                  <button className="book-button">Book Appointment</button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SymptomChecker;
