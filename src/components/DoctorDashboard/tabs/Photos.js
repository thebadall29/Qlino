import React, { useState, useEffect } from 'react';
import '../DoctorDashboard.scss';

const Photos = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPhoto, setNewPhoto] = useState({
    title: '',
    description: '',
    imageUrl: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  // Fetch photos when component mounts
  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
      console.log("userData",userData)
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5000/api/doctor/photos/${userData.id}`)
      .then(response => response.json())
      .then(data => setPhotos(data.photos));


      if (!response.ok) {
        throw new Error(`Failed to fetch photos: ${response.status}`);
      }


    } catch (error) {
      console.error('Error fetching photos:', error);
      setError('Failed to load photos. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  console.log("photos",photos)

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPhoto(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      
      // Convert file to base64 string
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhoto(prev => ({
          ...prev,
          imageUrl: reader.result // This will be a base64 string
        }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/api/doctor/photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPhoto)
      });

      if (!response.ok) {
        throw new Error(`Failed to add photo: ${response.status}`);
      }

      const data = await response.json();
      setPhotos(prev => [data.photo, ...prev]);
      setNewPhoto({
        title: '',
        description: '',
        imageUrl: ''
      });
    } catch (error) {
      console.error('Error adding photo:', error);
      setError('Failed to add photo. Please try again.');
    }
  };

  const handleDelete = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5000/api/doctor/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete photo: ${response.status}`);
      }

      setPhotos(prev => prev.filter(photo => photo._id !== photoId));
    } catch (error) {
      console.error('Error deleting photo:', error);
      setError('Failed to delete photo. Please try again.');
    }
  };

  return (
    <div className="photos-tab">
      <h2>Photo Gallery</h2>
      
      
      <div className="photo-upload-form">
        <h3>Add New Photo</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={newPhoto.title}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              name="description"
              value={newPhoto.description}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="image">Upload Image</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageUpload}
              required={!newPhoto.imageUrl}
            />
            {isUploading && <p>Uploading...</p>}
            {newPhoto.imageUrl && (
              <div className="image-preview">
                <img src={newPhoto.imageUrl} alt="Preview" />
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            disabled={!newPhoto.title || !newPhoto.imageUrl || isUploading}
          >
            Add Photo
          </button>
        </form>
      </div>
      
      <div className="photo-gallery">
        <h3>Your Photos</h3>
        {loading ? (
          <p>Loading photos...</p>
        ) : photos.length === 0 ? (
          <p>No photos yet. Add your first photo above!</p>
        ) : (
          <div className="photo-grid">
            {photos.map(photo => (
              <div key={photo._id} className="photo-card">
                <img src={photo.imageUrl} alt={photo.title} />
                <div className="photo-details">
                  <h4>{photo.title}</h4>
                  {photo.description && <p>{photo.description}</p>}
                  <p className="photo-date">
                    {new Date(photo.createdAt).toLocaleDateString()}
                  </p>
                  <button 
                    className="delete-button" 
                    onClick={() => handleDelete(photo._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Photos;