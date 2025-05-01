import React, { useState, useEffect } from 'react';
import { mockDoctorData } from '../mockData';
import "../DoctorDashboard.scss"

const Profile = () => {
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [treatments, setTreatments] = useState([]);
  const [workingDays, setWorkingDays] = useState({});
  const [editingTreatment, setEditingTreatment] = useState(null);
  const [newTreatment, setNewTreatment] = useState({ name: '', fee: '' });
  const [editableData, setEditableData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    specialization: '',
    experience: '',
    qualification: '',
    mobile: '',
    emergency: '',
    address: '',
    city: '',
    state: '',
    country: '',
    about: ''
  });

  useEffect(() => {
    const fetchDoctorData = async () => {
      setLoading(true);
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Fetch doctor data from API
        const response = await fetch('http://localhost:5000/api/doctor/doctor-dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch doctor data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Fetched doctor data:', data);
        
        // Set doctor data
        setDoctorData(data.doctor);
        
        // Initialize editable data
        setEditableData({
          firstName: data.doctor?.firstName || '',
          lastName: data.doctor?.lastName || '',
          email: data.doctor?.email || '',
          specialization: data.doctor?.specialization || '',
          experience: data.doctor?.experience || '',
          qualification: data.doctor?.qualification || '',
          mobile: data.doctor?.mobile || '',
          emergency: data.doctor?.emergency || '',
          address: data.doctor?.address || '',
          city: data.doctor?.city || '',
          state: data.doctor?.state || '',
          country: data.doctor?.country || '',
          about: data.doctor?.about || ''
        });
        
        // Set treatments
        setTreatments(data.doctor?.treatments || []);
        
        // Set working days
        setWorkingDays(data.doctor?.workingDays || {});
        
      } catch (error) {
        console.error('Error fetching doctor data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDoctorData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  const handleTimeChange = (day, type, value) => {
    setWorkingDays(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value
      }
    }));
  };

  const handleDayToggle = (day) => {
    setWorkingDays(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        active: !prev[day].active
      }
    }));
  };

  const handleSave = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Prepare data to send
      const updateData = {
        ...editableData,
        workingDays,
        treatments
      };
      
      console.log('Sending profile update:', updateData);
      
      // Send update to API
      const response = await fetch('http://localhost:5000/api/doctor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        throw new Error(`Failed to update profile: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Update response:', data);
      
      // Update local state with response data
      if (data.doctor) {
        setDoctorData(data.doctor);
        setEditableData({
          firstName: data.doctor.firstName || '',
          lastName: data.doctor.lastName || '',
          email: data.doctor.email || '',
          specialization: data.doctor.specialization || '',
          experience: data.doctor.experience || '',
          qualification: data.doctor.qualification || '',
          mobile: data.doctor.mobile || '',
          emergency: data.doctor.emergency || '',
          address: data.doctor.address || '',
          city: data.doctor.city || '',
          state: data.doctor.state || '',
          country: data.doctor.country || '',
          about: data.doctor.about || ''
        });
        setTreatments(data.doctor.treatments || []);
        setWorkingDays(data.doctor.workingDays || {});
      }
      
      setIsEditing(false);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Error updating profile: ${error.message}`);
    }
  };

  const handleAddTreatment = () => {
    if (newTreatment.name && newTreatment.fee) {
      setTreatments([
        ...treatments,
        {
          id: treatments.length + 1,
          name: newTreatment.name,
          fee: parseFloat(newTreatment.fee)
        }
      ]);
      setNewTreatment({ name: '', fee: '' });
    }
  };

  const handleRemoveTreatment = (id) => {
    setTreatments(treatments.filter(treatment => treatment.id !== id));
  };

  const handleEditTreatment = (treatment) => {
    setEditingTreatment(treatment);
  };

  const handleUpdateTreatment = (id, newFee) => {
    setTreatments(treatments.map(treatment => 
      treatment.id === id 
        ? { ...treatment, fee: parseFloat(newFee) }
        : treatment
    ));
    setEditingTreatment(null);
  };

  // Show loading state
  if (loading) {
    return <div className="loading">Loading doctor profile...</div>;
  }

  // Show error state
  if (error && !doctorData) {
    return <div className="error">Error: {error}</div>;
  }

  // If no data is available
  if (!doctorData) {
    return <div className="error">No doctor data available</div>;
  }

  console.log('Doctor data:', doctorData);

  return (
    <div className="section-container">
      <div className="section">
        <div className="section-header">
          <h3>Personal Information</h3>
          <div className="header-buttons">
            <button 
              className="edit-button"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
            {isEditing && (
              <button 
                className="save-button"
                onClick={handleSave}
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Name</label>
            {isEditing ? (
              <div className="edit-row">
                <input
                  type="text"
                  name="firstName"
                  value={editableData.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  className="edit-input"
                />
                <input
                  type="text"
                  name="lastName"
                  value={editableData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className="edit-input"
                />
              </div>
            ) : (
              <div className="info-display">{`Dr. ${doctorData?.firstName || ''} ${doctorData?.lastName || ''}`}</div>
            )}
          </div>
          <div className="form-group">
            <label>Email</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={editableData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="edit-input"
              />
            ) : (
              <div className="info-display">{doctorData?.email || ''}</div>
            )}
          </div>
          <div className="form-group">
            <label>Specialization</label>
            {isEditing ? (
              <input
                type="text"
                name="specialization"
                value={editableData.specialization}
                onChange={handleInputChange}
                placeholder="Specialization"
                className="edit-input"
              />
            ) : (
              <div className="info-display">{doctorData?.specialization || ''}</div>
            )}
          </div>
          <div className="form-group">
            <label>Experience</label>
            {isEditing ? (
              <input
                type="text"
                name="experience"
                value={editableData.experience}
                onChange={handleInputChange}
                placeholder="Years of Experience"
                className="edit-input"
              />
            ) : (
              <div className="info-display">{doctorData?.experience || ''}</div>
            )}
          </div>
          <div className="form-group">
            <label>Qualification</label>
            {isEditing ? (
              <input
                type="text"
                name="qualification"
                value={editableData.qualification}
                onChange={handleInputChange}
                placeholder="Qualification"
                className="edit-input"
              />
            ) : (
              <div className="info-display">{doctorData?.qualification || ''}</div>
            )}
          </div>
        </div>

        <div className="contact-info">
          <h4>Contact Information</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="mobile"
                  value={editableData.mobile}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                  className="edit-input"
                />
              ) : (
                <div className="info-display">{doctorData?.mobile || ''}</div>
              )}
            </div>
            <div className="form-group">
              <label>Emergency</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="emergency"
                  value={editableData.emergency}
                  onChange={handleInputChange}
                  placeholder="Emergency Contact"
                  className="edit-input"
                />
              ) : (
                <div className="info-display">{doctorData?.emergency || ''}</div>
              )}
            </div>
            <div className="form-group">
              <label>Address</label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={editableData.address}
                  onChange={handleInputChange}
                  placeholder="Address"
                  className="edit-input"
                />
              ) : (
                <div className="info-display">{doctorData?.address || ''}</div>
              )}
            </div>
            <div className="form-group">
              <label>City</label>
              {isEditing ? (
                <input
                  type="text"
                  name="city"
                  value={editableData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className="edit-input"
                />
              ) : (
                <div className="info-display">{doctorData?.city || ''}</div>
              )}
            </div>
            <div className="form-group">
              <label>State</label>
              {isEditing ? (
                <input
                  type="text"
                  name="state"
                  value={editableData.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  className="edit-input"
                />
              ) : (
                <div className="info-display">{doctorData?.state || ''}</div>
              )}
            </div>
            <div className="form-group">
              <label>Country</label>
              {isEditing ? (
                <input
                  type="text"
                  name="country"
                  value={editableData.country}
                  onChange={handleInputChange}
                  placeholder="Country"
                  className="edit-input"
                />
              ) : (
                <div className="info-display">{doctorData?.country || ''}</div>
              )}
            </div>
          </div>
        </div>

        <div className="about-section">
          <h4>About</h4>
          {isEditing ? (
            <textarea
              name="about"
              value={editableData.about}
              onChange={handleInputChange}
              placeholder="About yourself"
              className="edit-textarea"
              rows="4"
            />
          ) : (
            <div className="info-display">{doctorData?.about || ''}</div>
          )}
        </div>

        <div className="working-hours">
          <h4>Working Hours</h4>
          <div className="hours-list horizontal">
            {Object.entries(workingDays).map(([day, schedule]) => (
              <div key={day} className="day-column">
                <div className="day-info">
                  <span className="day-name">
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </span>
                  {isEditing && (
                    <label className="day-toggle">
                      <input
                        type="checkbox"
                        checked={schedule.active}
                        onChange={() => handleDayToggle(day)}
                      />
                    </label>
                  )}
                </div>
                {schedule.active ? (
                  isEditing ? (
                    <div className="time-inputs">
                      <input
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                        className="time-input"
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                        className="time-input"
                      />
                    </div>
                  ) : (
                    <span className="time-range">
                      {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                    </span>
                  )
                ) : (
                  <span className="time-range closed">Closed</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="treatments-section">
          <h4>Treatments & Services</h4>
          <div className="treatments-list">
            {treatments.map(treatment => (
              <div key={treatment.id} className="treatment-card">
                <div className="treatment-info">
                  <span className="treatment-name">{treatment.name}</span>
                  {isEditing && editingTreatment?.id === treatment.id ? (
                    <input
                      type="number"
                      value={editingTreatment.fee}
                      onChange={(e) => setEditingTreatment({
                        ...editingTreatment,
                        fee: e.target.value
                      })}
                      onBlur={() => handleUpdateTreatment(treatment.id, editingTreatment.fee)}
                      className="treatment-fee-input"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="treatment-fee"
                      onClick={() => isEditing && handleEditTreatment(treatment)}
                    >
                      ${treatment.fee}
                    </span>
                  )}
                </div>
                {isEditing && (
                  <button 
                    className="remove-treatment"
                    onClick={() => handleRemoveTreatment(treatment.id)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {isEditing && (
            <div className="add-treatment-form">
              <input
                type="text"
                placeholder="Treatment name"
                value={newTreatment.name}
                onChange={(e) => setNewTreatment({
                  ...newTreatment,
                  name: e.target.value
                })}
                className="treatment-input"
              />
              <input
                type="number"
                placeholder="Fee"
                value={newTreatment.fee}
                onChange={(e) => setNewTreatment({
                  ...newTreatment,
                  fee: e.target.value
                })}
                className="treatment-input"
              />
              <button 
                className="add-treatment-button"
                onClick={handleAddTreatment}
              >
                Add Treatment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;