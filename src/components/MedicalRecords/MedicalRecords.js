import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import './MedicalRecords.scss';
import { FaFilePdf, FaDownload, FaEye } from 'react-icons/fa';
import ReactDOM from 'react-dom';

const MedicalRecordsCompo = () => {
    const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingFile, setViewingFile] = useState(null);

  // Add a modal component for viewing files
  const FileViewerModal = ({ file, onClose }) => {
    if (!file) return null;

    // Create portal to render modal at root level
    return ReactDOM.createPortal(
      <div className="file-viewer-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3>{file.title}</h3>
            <button 
              onClick={onClose} 
              className="close-btn"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="modal-body">
            <iframe
              src={file.url}
              title="File Viewer"
              width="100%"
              height="100%"
            />
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const handleViewFile = async (fileUrl, fileName) => {
    try {
      const token = localStorage.getItem('token');
       if (!token) {
        // If no token, redirect to login
        navigate('/patient-dashboard', { 
          state: { 
            from: window.location.pathname,
            message: 'Please login to add medicines' 
          } 
        });
      } else {
        // If logged in, go to medicines page
        navigate('/patient-login');
      }

      // Extract filename from fileUrl
      const filename = fileUrl.split('/').pop();
      
      // Create the full URL for viewing
      const fullUrl = `http://localhost:5000/api/patient/download-report/${filename}`;

      // Fetch the file with authentication
      const response = await axios({
        url: fullUrl,
        method: 'GET',
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Create a blob URL for the file
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] 
      });
      const blobUrl = window.URL.createObjectURL(blob);

      // Set the viewing file with the blob URL
      setViewingFile({
        url: blobUrl,
        title: fileName || filename
      });
    } catch (error) {
      console.error('Error viewing file:', error);
      alert('Error viewing file. Please try again.');
    }
  };

  const handleDownloadFile = async (fileUrl, fileName) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const filename = fileUrl.split('/').pop();
      const fullUrl = `http://localhost:5000/api/patient/download-report/${filename}`;

      const response = await axios({
        url: fullUrl,
        method: 'GET',
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || filename;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await axios.get('http://localhost:5000/api/patient/reports', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setReports(response.data.reports || []);
        } else {
          throw new Error(response.data.message || 'Failed to fetch reports');
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <div className="loading">Loading your medical records...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="medical-records-container">
        <div className="medical-records-header">
      <h1>Your Medical Records</h1>
      
      {reports.length === 0 ? (
        <div className="no-records">
          <p>No medical records found. Your doctor will add records during your visits.</p>
        </div>
      ) : (
        <div className="records-grid">
          {reports.map((report, index) => (
            <div key={report._id || index} className="record-card">
              <div className="record-header">
                <h3>{report.title}</h3>
                <span className="record-date">
                  {new Date(report.date).toLocaleDateString()}
                </span>
              </div>
              
              <div className="record-details">
                <p><strong>Type:</strong> {report.type}</p>
                <p><strong>Description:</strong> {report.description}</p>
                {report.results && (
                  <p><strong>Results:</strong> {report.results}</p>
                )}
                {report.recommendations && (
                  <p><strong>Recommendations:</strong> {report.recommendations}</p>
                )}
              </div>

              {report.fileUrl && (
                <div className="record-actions">
                  <button 
                    onClick={() => handleViewFile(report.fileUrl, report.title)}
                    className="view-file-btn"
                  >
                    <FaEye /> View File
                  </button>
                  <button 
                    onClick={() => handleDownloadFile(report.fileUrl, report.title)}
                    className="download-file-btn"
                  >
                    <FaDownload /> Download
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* File Viewer Modal */}
      {viewingFile && (
        <FileViewerModal
          file={viewingFile}
          onClose={() => {
            window.URL.revokeObjectURL(viewingFile.url);
            setViewingFile(null);
          }}
        />
      )}
      </div>
    </div>
  );
};

const PatientProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('patientToken');
  const location = useLocation();

  if (!token) {
    // Redirect to patient login with return path
    return <Navigate to="/patient-login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default MedicalRecordsCompo;