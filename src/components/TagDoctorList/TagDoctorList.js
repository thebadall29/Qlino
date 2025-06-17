import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaFilter } from 'react-icons/fa';
import DoctorProfileModel from '../DoctorProfileModel/DoctorProfileModel';
import DoctorCard from '../DoctorCard/DoctorCard';

const TagDoctorList = () => {
  const { tag } = useParams();
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
    const fetchDoctorsByTag = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/tags/doctors`, {
          params: {
            tag: decodeURIComponent(tag) // Changed from query to tag
          }
        });
        
        if (response.data.success) {
          setDoctors(response.data.doctors);
        } else {
          setError('No doctors found');
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setError(error.response?.data?.message || 'Failed to fetch doctors');
      } finally {
        setLoading(false);
      }
    };

    if (tag) {
      fetchDoctorsByTag();
    }
  }, [tag]);

  // Fetch doctor reviews
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

    return matchesSearch && matchesCity && matchesExperience;
  });

  const handleViewProfile = (doctor) => {
    const enrichedDoctor = {
      id: doctor._id,
      name: `${doctor.firstName} ${doctor.lastName}`,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      experience: doctor.experience,
      city: doctor.city,
      state: doctor.state,
      country: doctor.country || 'India',
      location: `${doctor.city}, ${doctor.state}`,
      address: doctor.address || `${doctor.city}, ${doctor.state}`,
      mobile: doctor.phoneNumber || doctor.mobile,
      emergency: doctor.emergency || doctor.mobile,
      email: doctor.email,
      username: doctor.username || `${doctor.firstName.toLowerCase()}_${doctor.lastName.toLowerCase()}`,
      workingDays: doctor.workingDays || {},
      bookingPreference: doctor.bookingPreference || 'queue',
      treatments: doctor.treatments || [{
        name: 'General Consultation',
        fee: doctor.consultationFee || '700'
      }],
      about: doctor.about || `Dr. ${doctor.firstName} ${doctor.lastName} is an experienced healthcare professional.`,
      photoUrl: doctor.photoUrl,
      averageRating: doctorReviews[doctor._id]?.averageRating?.toString() || "0.0",
      reviewCount: doctorReviews[doctor._id]?.reviews?.length || 0,
      verified: true,
      tags: doctor.tags || [],
      createdAt: doctor.createdAt || new Date().toISOString(),
      updatedAt: doctor.updatedAt || new Date().toISOString()
    };

    setSelectedDoctor(enrichedDoctor);
    setIsModalOpen(true);
  };

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

  return (
    <>
      <div className="search-filter-container">
        <div className="search-filter-section">
          <h1>Doctors for {decodeURIComponent(tag)}</h1>
          
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
            </div>
          )}
        </div>
      </div>

      <div className="doctor-list-container">
        {filteredDoctors.length > 0 ? (
          <div className="doctors-list">
            {filteredDoctors.map((doctor, index) => (
              <DoctorCard
                key={doctor._id}
                doctor={doctor}
                index={index}
                doctorReviews={doctorReviews}
                reviewsLoading={reviewsLoading}
                onViewProfile={handleViewProfile}
                reviewSliderRef={reviewSliderRef}
              />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No doctors found for {decodeURIComponent(tag)}</p>
            <button onClick={() => navigate('/search-problem')}>
              View All Health Concerns
            </button>
          </div>
        )}

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

export default TagDoctorList;