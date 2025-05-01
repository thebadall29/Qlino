import React, { useState, useEffect } from 'react';

const UserProfile = () => {
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    emergencyContact: '',
    city: '',
    state: '',
    country: ''
  });

  const [medicalHistory, setMedicalHistory] = useState({
    chronicConditions: '',
    pastSurgeries: '',
    allergies: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add edit mode states
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    personalInfo: { ...personalInfo },
    medicalHistory: { ...medicalHistory }
  });

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        
        const token = localStorage.getItem('token');
        console.log('Auth token:', token);
        
        let user = null;
        try {
          const userData = localStorage.getItem('user');
          if (userData) {
            user = JSON.parse(userData);
          }
        } catch (e) {
          console.error('Error parsing user data from localStorage:', e);
        }
        
        if (!token || !user) {
          throw new Error('Authentication token or user data not found. Please log in again.');
        }
        
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        if (isMounted) {
          setPersonalInfo({
            fullName: fullName || user.username || '',
            email: user.email || '',
            age: user.age || '',
            gender: user.gender || '',
            phone: user.mobile || '',
            emergencyContact: user.emergencyContact || '',
            city: user.city || '',
            state: user.state || '',
            country: user.country || ''
          });
          
          setMedicalHistory({
            chronicConditions: user.chronicConditions || '',
            pastSurgeries: user.pastSurgeries || '',
            allergies: user.allergies || ''
          });
        }
        
        // Fetch API data
        const response = await fetch('http://localhost:5000/api/patient/patient-dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!isMounted) return;
        
        const userData = data.user || data;
        const apiFirstName = userData.firstName || '';
        const apiLastName = userData.lastName || '';
        const apiFullName = `${apiFirstName} ${apiLastName}`.trim();
        
        setPersonalInfo({
          fullName: apiFullName || userData.username || '',
          age: userData.age || '',
          gender: userData.gender || '',
          phone: userData.mobile || '',
          email: userData.email || '',
          emergencyContact: userData.emergencyContact || '',
          city: userData.city || '',
          state: userData.state || '',
          country: userData.country || ''
        });
        
        setMedicalHistory({
          chronicConditions: userData.chronicConditions || '',
          pastSurgeries: userData.pastSurgeries || '',
          allergies: userData.allergies || ''
        });
        
        setUploadedFiles(userData.uploadedFiles || []);
        
        setEditData({
          personalInfo: {
            fullName: apiFullName || userData.username || '',
            age: userData.age || '',
            gender: userData.gender || '',
            phone: userData.mobile || '',
            email: userData.email || '',
            emergencyContact: userData.emergencyContact || '',
            city: userData.city || '',
            state: userData.state || '',
            country: userData.country || ''
          },
          medicalHistory: {
            chronicConditions: userData.chronicConditions || '',
            pastSurgeries: userData.pastSurgeries || '',
            allergies: userData.allergies || ''
          }
        });
      } catch (error) {
        console.error('Error in fetchUserData:', error);
        if (isMounted) {
          setError(error.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array

    const handleSave = async () => {
      try {
        // Get the auth token from localStorage - use only 'token'
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Log the data being sent to the server
        console.log('Sending profile update:', {
          personalInfo: editData.personalInfo,
          medicalHistory: editData.medicalHistory
        });
        
        const response = await fetch('http://localhost:5000/api/patient/patient-dashboard', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            personalInfo: editData.personalInfo,
            medicalHistory: editData.medicalHistory
          })
        });
        
        // Log the raw response
        console.log("Update response:", response);
        
        // Check content type before parsing JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response:', text);
          throw new Error('Server returned invalid response format');
        }
        
        const responseData = await response.json();
        console.log('Update response data:', responseData);
        
        if (!response.ok) {
          throw new Error(responseData.message || 'Failed to update profile');
        }

        // Update state with edited data
        setPersonalInfo({...editData.personalInfo});
        setMedicalHistory({...editData.medicalHistory});
        setEditMode(false);
        
        // Show success message (optional)
        alert('Profile updated successfully');
      } catch (error) {
        console.error('Error updating profile:', error);
        setError(error.message);
        alert(`Error: ${error.message}`);
      }
    };

    const handleEdit = () => {
      setEditMode(true);
      setEditData({
        personalInfo: { ...personalInfo },
        medicalHistory: { ...medicalHistory }
      });
    };

    const handleCancel = () => {
      setEditMode(false);
      setEditData({
        personalInfo: { ...personalInfo },
        medicalHistory: { ...medicalHistory }
      });
    };

    const handlePersonalInfoChange = (e) => {
      const { name, value } = e.target;
      setEditData(prev => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, [name]: value }
      }));
    };

    const handleMedicalHistoryChange = (e) => {
      const { name, value } = e.target;
      setEditData(prev => ({
        ...prev,
        medicalHistory: { ...prev.medicalHistory, [name]: value }
      }));
    };

    const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          // Create form data
          const formData = new FormData();
          formData.append('file', file);
          
          // Get the auth token from localStorage
          const token = localStorage.getItem('authToken');
          
          if (!token) {
            throw new Error('Authentication token not found');
          }
          
          // Upload file to server
          const response = await fetch('/api/patient/upload-file', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to upload file');
          }
          
          const result = await response.json();
          
          // Add file to the local state
          const newFile = {
            id: result.fileId || uploadedFiles.length + 1,
            name: file.name,
            date: new Date().toISOString().split('T')[0]
          };
          
          setUploadedFiles([...uploadedFiles, newFile]);
        } catch (error) {
          console.error('Error uploading file:', error);
          setError(error.message);
          alert(`Error uploading file: ${error.message}`);
        }
        
        // Clear the input
        e.target.value = '';
      }
    };

    const removeFile = async (id) => {
      try {
        // Get the auth token from localStorage
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Delete file from server
        const response = await fetch(`/api/patient/delete-file/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete file');
        }
        
        // Remove file from local state
        setUploadedFiles(uploadedFiles.filter(file => file.id !== id));
      } catch (error) {
        console.error('Error removing file:', error);
        setError(error.message);
        alert(`Error removing file: ${error.message}`);
      }
    };

    if (loading) {
      return <div className="loading">Loading profile data...</div>;
    }

    if (error) {
      return (
        <div className="error-container">
          <h3>Error loading profile</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      );
    }

    return (
      <div className="section-container">
        <h2>Profile</h2>

        <div className="section">
          <div className="section-header">
            <h3>Personal Information</h3>
            {!editMode ? (
              <button className="edit-button" onClick={handleEdit}>Edit Profile</button>
            ) : (
              <div className="edit-actions">
                <button className="save-button" onClick={handleSave}>Save Changes</button>
                <button className="cancel-button" onClick={handleCancel}>Cancel</button>
              </div>
            )}
          </div>
          <div className="form-grid">
            {Object.entries(editMode ? editData.personalInfo : personalInfo).map(([key, value]) => (
              <div className="form-group" key={key}>
                <label htmlFor={key}>{key.replace(/([A-Z])/g, ' $1').charAt(0).toUpperCase() + key.replace(/([A-Z])/g, ' $1').slice(1)}</label>
                {editMode ? (
                  <input
                    type={key === 'email' ? 'email' : key === 'age' ? 'number' : 'text'}
                    id={key}
                    name={key}
                    value={value}
                    onChange={handlePersonalInfoChange}
                    readOnly={key === 'email'} // Make email read-only as it's typically not changed often
                  />
                ) : (
                  <div className="info-display">{value || 'Not provided'}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <h3>Medical History</h3>
          {Object.entries(editMode ? editData.medicalHistory : medicalHistory).map(([key, value]) => (
            <div className="form-group" key={key}>
              <label htmlFor={key}>{key.replace(/([A-Z])/g, ' $1').charAt(0).toUpperCase() + key.replace(/([A-Z])/g, ' $1').slice(1)}</label>
              {editMode ? (
                <textarea
                  id={key}
                  name={key}
                  value={value}
                  onChange={handleMedicalHistoryChange}
                  rows={3}
                />
              ) : (
                <div className="info-display">{value || 'None'}</div>
              )}
            </div>
          ))}
        </div>

        <div className="section">
          <h3>Medical Documents</h3>
          {uploadedFiles.length === 0 ? (
            <p>No files uploaded yet.</p>
          ) : (
            <div className="uploaded-files">
              {uploadedFiles.map(file => (
                <div key={file.id} className="file-item">
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-date">Uploaded: {file.date}</span>
                  </div>
                  <div className="file-actions">
                    <button className="view-button" onClick={() => window.open(`/api/patient/files/${file.id}`, '_blank')}>View</button>
                    <button className="remove-button" onClick={() => removeFile(file.id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="file-upload">
            <label htmlFor="file-upload" className="custom-file-upload">
              Upload Medical Document
            </label>
            <input id="file-upload" type="file" onChange={handleFileUpload} />
            <p className="upload-help">Accepted formats: PDF, JPG, PNG (Max: 5MB)</p>
          </div>
        </div>
      </div>
    );
};

export default UserProfile;