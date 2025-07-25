import React, { useState, useEffect } from 'react';
import { mockDoctorData } from '../mockData';
import "../DoctorDashboard.scss"
import axios from 'axios';
import { toast } from 'react-toastify';

const Profile = () => {
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [consultationFee, setConsultationFee] = useState('');
  const [treatments, setTreatments] = useState([]);
  const [newTreatment, setNewTreatment] = useState({ name: '', fee: '' });
  const [isEditingFees, setIsEditingFees] = useState(false);
  const [workingDays, setWorkingDays] = useState({});
  const [editingTreatment, setEditingTreatment] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
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
    about: '',
    bookingPreference: ''
  });
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  // Add photoUrl to state
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    const fetchDoctorData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('Authentication token not found');
        }

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

        setDoctorData(data.doctor);

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
          about: data.doctor?.about || '',
          bookingPreference: data.doctor?.bookingPreference || ''
        });

        setTreatments(data.doctor?.treatments || []);

        setWorkingDays(data.doctor?.workingDays || {});

        if (data.doctor && data.doctor.email) {
          setIsEditing(false);
        }

        setTags(data.doctor?.tags || []);

        // Set consultation fee
        setConsultationFee(data.doctor?.consultationFee || '');

        // Set photo URL
        setPhotoUrl(data.doctor?.photoUrl || '');

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
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Authentication token not found');
      }

      // First upload photo if one is selected
      let photoUrl = doctorData?.photoUrl;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('photo', selectedFile);

        const photoResponse = await fetch('http://localhost:5000/api/doctor/upload-photo', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!photoResponse.ok) {
          throw new Error('Failed to upload photo');
        }

        const photoData = await photoResponse.json();
        photoUrl = photoData.photoUrl;
      }

      const updateData = {
        ...editableData,
        workingDays,
        treatments,
        tags,
        consultationFee: Number(consultationFee),
        photoUrl: photoUrl
      };

      console.log('Sending profile update:', updateData);

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

      if (data.doctor) {
        setDoctorData({
          ...data.doctor,
          photoUrl: data.doctor.photoUrl || photoUrl // Preserve existing photo if new one isn't provided
        });
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
          about: data.doctor.about || '',
          bookingPreference: data.doctor.bookingPreference || '',
          tags: data.doctor.tags || []
        });
        setTreatments(data.doctor.treatments || []);
        setWorkingDays(data.doctor.workingDays || {});
        setConsultationFee(data.doctor.consultationFee || ''); // Add this line
      }

      setIsEditing(false);
      toast.success('Profile updated successfully'); // Changed alert to toast
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(`Error updating profile: ${error.message}`); // Changed alert to toast
    }
  };

  const [selectedFile, setSelectedFile] = useState(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setPhotoPreview(URL.createObjectURL(file));
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

  const handleAddTag = () => {
    if (tagInput && tags.length < 10 && getTotalTagsLength() + tagInput.length <= 500) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const getTotalTagsLength = () => {
    return tags.reduce((total, tag) => total + tag.length, 0);
  };

  const handleConsultationFeeChange = (value) => {
    // Validate input to allow only numbers
    if (!isNaN(value) && value >= 0) {
      setConsultationFee(value);
    }
  };

  const handleTreatmentChange = (index, field, value) => {
    const updatedTreatments = [...treatments];
    if (field === 'fee' && (!isNaN(value) && value >= 0)) {
      updatedTreatments[index][field] = value;
    } else if (field === 'name') {
      updatedTreatments[index][field] = value;
    }
    setTreatments(updatedTreatments);
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

  // Add this before the return statement
  console.log('Image URL:', doctorData?.photoUrl ? `http://localhost:5000${doctorData.photoUrl}` : 'No photo URL');


  // Add safe access to fee property with default values
  const feeDetails = doctorData?.fee || [];

  return (
    <div className="section-container">
      <div className="section">
        <div className="profile-header">
          <div className="profile-layout">
            <div className="profile-photo-container">
              <div className="profile-photo-circle">
                {(photoPreview || doctorData?.photoUrl) ? (
                  <img
                    src={photoPreview || (doctorData?.photoUrl ? `http://localhost:5000${doctorData.photoUrl}` : '')}
                    alt="Profile"
                    className="profile-image"
                  />
                ) : (
                  <div className="photo-placeholder">
                    <i className="fas fa-user"></i>
                  </div>
                )}
              </div>
              <div className="profile-arrow">
                <div className="arrow-line"></div>
              </div>
            </div>
            <div className="profile-name-box">
              <h2>{`Dr. ${doctorData?.firstName || ''} ${doctorData?.lastName || ''}`}</h2>
              {isEditing && (
                <div className="upload-controls">
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="photo-upload" className="upload-button">
                    {doctorData?.photoUrl ? 'Change Photo' : 'Upload Photo'}
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
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

        <div className="booking-preference-section">
          <h4>Booking Preference</h4>
          {isEditing ? (
            <div className="booking-preference-options">
              <label className={`preference-card ${editableData.bookingPreference === 'slot' ? 'selected' : ''}`}>
                <div className="preference-radio">
                  <input
                    type="radio"
                    name="bookingPreference"
                    value="slot"
                    checked={editableData.bookingPreference === 'slot'}
                    onChange={(e) => setEditableData({
                      ...editableData,
                      bookingPreference: e.target.value
                    })}
                  />
                  <div className="radio-circle"></div>
                </div>
                <div className="preference-content">
                  <span className="preference-title">Slot Based Booking</span>
                  <span className="preference-description">
                    Patients can book specific time slots from your schedule
                  </span>
                </div>
              </label>

              <label className={`preference-card ${editableData.bookingPreference === 'queue' ? 'selected' : ''}`}>
                <div className="preference-radio">
                  <input
                    type="radio"
                    name="bookingPreference"
                    value="queue"
                    checked={editableData.bookingPreference === 'queue'}
                    onChange={(e) => setEditableData({
                      ...editableData,
                      bookingPreference: e.target.value
                    })}
                  />
                  <div className="radio-circle"></div>
                </div>
                <div className="preference-content">
                  <span className="preference-title">Queue Based Booking</span>
                  <span className="preference-description">
                    Patients join a queue and are served on a first-come, first-served basis
                  </span>
                </div>
              </label>
            </div>
          ) : (
            <div className="preference-card view-mode">
              <div className="preference-content">
                <span className="preference-title">
                  {editableData.bookingPreference === 'queue' ? 'Queue Based Booking' : 'Slot Based Booking'}
                </span>
                <span className="preference-description">
                  {editableData.bookingPreference === 'queue'
                    ? 'Patients join a queue and are served on a first-come, first-served basis'
                    : 'Patients can book specific time slots from your schedule'}
                </span>
              </div>
            </div>
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
                      ₹{treatment.fee}
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

        <div className="tags-section">
          <h4>Profile Tags</h4>
          <div className="tags-container">
            {tags.map((tag, index) => (
              <div key={index} className="tag">
                <span>{tag}</span>
                {isEditing && (
                  <button 
                    className="remove-tag"
                    onClick={() => handleRemoveTag(index)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {isEditing && (
            <div className="add-tag-form">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a service tag"
                maxLength={50}
                className="tag-input"
              />
              <button
                className="add-tag-button"
                onClick={handleAddTag}
                disabled={!tagInput || tags.length >= 10 || getTotalTagsLength() + tagInput.length > 500}
              >
                Add Tag
              </button>
              <div className="tag-limits">
                <small>{`${tags.length}/10 tags used (${getTotalTagsLength()}/500 characters)`}</small>
              </div>
            </div>
          )}
        </div>

        <div className="consultation-fees-section">
          <div className="section-header">
            <h3>Consultation Fees</h3>
          </div>

          <div className="fee-container">
            <div className="general-consultation-box">
              <h4>General Consultation Fee</h4>
              {isEditing ? (
                <div className="fee-input-group">
                  <span className="currency-symbol">₹</span>
                  <input
                    type="number"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    placeholder="Enter consultation fee"
                    className="fee-input"
                    min="0"
                  />
                </div>
              ) : (
                <div className="fee-display">
                 ₹{consultationFee || '0'}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;