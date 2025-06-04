import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaFilter } from 'react-icons/fa';
import './DoctorList.scss';
import DoctorProfileModel from '../DoctorProfileModel/DoctorProfileModel';
import DoctorCard from '../DoctorCard/DoctorCard'; // Import the new DoctorCard component

const DoctorList = () => {
  const { specialty } = useParams();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    city: '',
    experience: '',
    priceRange: '',
    availability: '',
    rating: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [doctorReviews, setDoctorReviews] = useState({});
  const [reviewsLoading, setReviewsLoading] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const reviewSliderRef = useRef(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        // Update the endpoint to match your backend
        const response = await axios.get(`http://localhost:5000/api/specialties/${specialty}/doctors`);
        console.log('API Response:', response.data);
        setDoctors(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Failed to fetch doctors');
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [specialty]);

  // Update the fetchDoctorReviews function
  const fetchDoctorReviews = async (doctorId) => {
    try {
      setReviewsLoading(prev => ({ ...prev, [doctorId]: true }));
      const response = await axios.get(`http://localhost:5000/api/doctor/${doctorId}/reviews`);
      setDoctorReviews(prev => ({
        ...prev,
        [doctorId]: response.data
      }));
    } catch (err) {
      console.error(`Error fetching reviews for doctor ${doctorId}:`, err);
    } finally {
      setReviewsLoading(prev => ({ ...prev, [doctorId]: false }));
    }
  };

  // Modify useEffect to fetch reviews when doctors are loaded
  useEffect(() => {
    if (doctors.length > 0) {
      doctors.forEach(doctor => {
        fetchDoctorReviews(doctor._id);
      });
    }
  }, [doctors]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredDoctors = doctors.filter(doctor => {
    if (!doctor) return false;

    const fullName = `${doctor.firstName || ''} ${doctor.lastName || ''}`.toLowerCase();
    const matchesSearch = !searchTerm || 
      fullName.includes(searchTerm.toLowerCase()) ||
      (doctor.city && doctor.city.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCity = !filters.city || doctor.city === filters.city;
    const matchesExperience = !filters.experience || 
      (doctor.experience && parseInt(doctor.experience) >= parseInt(filters.experience));
    const matchesSpecialization = !filters.specialization || 
      doctor.specialization === filters.specialization;

    return matchesSearch && matchesCity && matchesExperience && matchesSpecialization;
  });

  useEffect(() => {
    if (doctorReviews) {
      Object.keys(doctorReviews).forEach(id => {
        console.log(`Doctor ${id} average rating:`, {
          value: doctorReviews[id]?.averageRating,
          type: typeof doctorReviews[id]?.averageRating
        });
      });
    }
  }, [doctorReviews]);

  const handleViewProfile = (doctor) => {
    const enrichedDoctor = {
      id: doctor._id,  // Changed from _id to id to match SearchProfile
      name: `${doctor.firstName} ${doctor.lastName}`,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      experience: doctor.experience,
      city: doctor.city,
      state: doctor.state,
      country: doctor.country || 'India',
      location: `${doctor.city}, ${doctor.state}`, // Added location field
      address: doctor.address || `${doctor.city}, ${doctor.state}`,
      mobile: doctor.phoneNumber || doctor.mobile,
      emergency: doctor.emergency || doctor.mobile, // Added emergency contact
      email: doctor.email,
      username: doctor.username || `${doctor.firstName.toLowerCase()}_${doctor.lastName.toLowerCase()}`,
      workingDays: doctor.workingDays || {}, // Added workingDays
      bookingPreference: doctor.bookingPreference || 'queue',
      treatments: doctor.treatments || [{
        name: 'General Consultation',
        fee: doctor.consultationFee || '700'
      }],
      about: doctor.about || `Dr. ${doctor.firstName} ${doctor.lastName} is an experienced healthcare professional.`,
      photoUrl: doctor.photoUrl,
      averageRating: doctorReviews[doctor._id]?.averageRating?.toString() || "0.0", // Changed to string
      reviewCount: doctorReviews[doctor._id]?.reviews?.length || 0,
      verified: true,
      createdAt: doctor.createdAt || new Date().toISOString(),
      updatedAt: doctor.updatedAt || new Date().toISOString()
    };

    setSelectedDoctor(enrichedDoctor);
    setIsModalOpen(true);
  };

  // Update the modal rendering to remove avatarColor since we're using photoUrl
  {isModalOpen && selectedDoctor && (
    <DoctorProfileModel
      doctor={selectedDoctor}
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
        setSelectedDoctor(null);
      }}
    />
  )}

  const generateAvatarColor = () => {
    if (!selectedDoctor.name) return '#4a69bd'; // Default blue
    
    const colors = [
      '#4a69bd', '#6a89cc', '#1e3799', '#0c2461', // Blues
      '#82ccdd', '#60a3bc', '#3c6382', '#0a3d62', // Light Blues
      '#b8e994', '#78e08f', '#38ada9', '#079992', // Greens
      '#f6b93b', '#e58e26', '#fa983a', '#e58e26', // Oranges
      '#cf6a87', '#c44569', '#9b59b6', '#8e44ad'  // Purples
    ];
    
    // Use the first character of the name to select a color
    const charCode = selectedDoctor.name.charCodeAt(0);
    const colorIndex = charCode % colors.length;
    
    return colors[colorIndex];
  };
  console.log("selectedDoctor:", selectedDoctor);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading doctors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!doctors.length) {
    return (
      <div className="no-doctors-container">
        <p>No doctors found for {specialty}</p>
        <button onClick={() => navigate('/specialties')}>
          View All Specialties
        </button>
      </div>
    );
  }

  console.log("doctorReviews:", doctorReviews);

  return (
    <>
    <div className="search-filter-container">
      <div className="search-filter-section">
        <h1>Doctors in {specialty}</h1>
        
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by doctor name or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <select 
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
            >
              <option value="">All Cities</option>
              {[...new Set(doctors.map(doc => doc.city).filter(Boolean))].map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <select 
              value={filters.experience}
              onChange={(e) => handleFilterChange('experience', e.target.value)}
            >
              <option value="">Experience</option>
              <option value="5">5+ Years</option>
              <option value="10">10+ Years</option>
              <option value="15">15+ Years</option>
            </select>

            <select 
              value={filters.specialization}
              onChange={(e) => handleFilterChange('specialization', e.target.value)}
            >
              <option value="">All Specializations</option>
              {[...new Set(doctors.map(doc => doc.specialization).filter(Boolean))].map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>

    <div className="doctor-list-container">
      <div className="doctors-list">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor, index) => (
            <DoctorCard
              key={doctor._id}
              doctor={doctor}
              index={index}
              doctorReviews={doctorReviews}
              reviewsLoading={reviewsLoading}
              onViewProfile={handleViewProfile}
              reviewSliderRef={reviewSliderRef}
            />
          ))
        ) : (
          <div className="no-results">
            <p>No doctors found matching your criteria</p>
          </div>
        )}
      </div>

      {isModalOpen && selectedDoctor && (
        <DoctorProfileModel
          doctor={selectedDoctor}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDoctor(null);
          }}
        />
      )}
    </div>
    </>
  );
};

export default DoctorList;