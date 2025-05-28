import React, { useState, useEffect, useRef } from 'react';
import '../DoctorDashboard.scss';

const Photos = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPhoto, setNewPhoto] = useState({
    title: '',
    description: '',
    file: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImgUrl, setModalImgUrl] = useState('');

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await fetch(`http://localhost:5000/api/doctor/photos/${userData.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch photos: ${response.status}`);
      }
      const data = await response.json();
      setPhotos(data.photos);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setError('Failed to load photos. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

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
      setNewPhoto(prev => ({
        ...prev,
        file: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const formData = new FormData();
      formData.append('title', newPhoto.title);
      formData.append('description', newPhoto.description);
      formData.append('image', newPhoto.file);

      const response = await fetch('http://localhost:5000/api/doctor/photos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Failed to add photo: ${response.status}`);
      }
      const data = await response.json();
      setPhotos(prev => [data.photo, ...prev]);
      setNewPhoto({ title: '', description: '', file: null });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error adding photo:', error);
      setError('Failed to add photo. Please try again.');
    } finally {
      setIsUploading(false);
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

  // Modal open handler
  const openModal = (imgUrl) => {
    setModalImgUrl(imgUrl);
    setModalOpen(true);
  };

  // Modal close handler
  const closeModal = () => {
    setModalOpen(false);
    setModalImgUrl('');
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
            <label htmlFor="image" className="custom-file-upload">
              {newPhoto.file ? "Change Image" : "Select Image"}
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageUpload}
              required={!newPhoto.file}
              ref={fileInputRef}
              className='custom-file-uploader'
            />
            {isUploading && <p>Uploading...</p>}
            {newPhoto.file && (
              <div className="image-preview">
                <img src={URL.createObjectURL(newPhoto.file)} alt="Preview" />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!newPhoto.title || !newPhoto.file || isUploading}
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
                <img src={`http://localhost:5000${photo.imageUrl}`} alt={photo.title} />
                <div className="photo-details">
                  <h4>{photo.title}</h4>
                  {photo.description && <p>{photo.description}</p>}
                  <p className="photo-date">
                    {new Date(photo.createdAt).toLocaleDateString()}
                  </p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(photo._id)}
                    >
                      Delete
                    </button>
                    <button
                      className="open-image-button"
                      onClick={() => openModal(`http://localhost:5000${photo.imageUrl}`)}
                    >
                      Open Image
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for full image */}
      {modalOpen && (
        <div className="image-modal" onClick={closeModal}>
          <div className="image-modal-content" onClick={e => e.stopPropagation()}>
            <button className="image-modal-close" onClick={closeModal}>&times;</button>
            <img src={modalImgUrl} alt="Full" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Photos;