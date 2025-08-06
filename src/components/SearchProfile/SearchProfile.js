import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DoctorCard from '../DoctorCard/DoctorCard';
import DoctorProfileModel from '../DoctorProfileModel/DoctorProfileModel';
import './SearchProfile.scss';
import config from '../../config/config';

const SearchProfile = ({ doctor, resultCount, index, totalResults }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorReviews, setDoctorReviews] = useState({});
  const [reviewsLoading, setReviewsLoading] = useState({});
  const reviewSliderRef = useRef(null);

  useEffect(() => {
    if (doctor) {
      // Convert id to _id for consistency
      const doctorId = doctor.id || doctor._id;
      fetchDoctorReviews(doctorId);
    }
  }, [doctor]);

  console.log("Doctor data:", doctor);

  const fetchDoctorReviews = async (doctorId) => {
    try {
      setReviewsLoading(prev => ({ ...prev, [doctorId]: true }));
      const response = await axios.get(`${config.API_URL}/api/doctor/${doctorId}/reviews`);
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

  // Add this helper function at the top of your file
const getAvatarUrl = (firstName = '', lastName = '') => {
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  const color = stringToColor(`${firstName} ${lastName}`);
  return `https://ui-avatars.com/api/?name=${initials}&background=${color.slice(1)}&color=fff`;
};

// Add this helper function for generating consistent colors
const stringToColor = (string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};
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

  return (
    <div className="search-profile-container">
      {index === 0 && ( // Only show header for first card
        <div className="search-results-header">
          <div className="header-content">
            <h1>Search Results</h1>
            <span className="result-count">({totalResults} doctors found)</span> {/* Changed from resultCount to totalResults */}
          </div>
        </div>
      )}

      <div className="doctor-list-container">
        <div className="doctors-list">
          {doctor ? (
            <DoctorCard
              key={doctor.id || doctor._id}
              doctor={{
                ...doctor,
                _id: doctor.id || doctor._id,
                photoUrl: doctor.photoUrl || null,
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
                location: doctor.location || `${doctor.city}, ${doctor.state}`,
                experience: `${doctor.experience} Years`,
                specialization: doctor.specialization,
                qualification: doctor.qualification
              }}
              index={index}
              doctorReviews={doctorReviews}
              reviewsLoading={reviewsLoading}
              onViewProfile={handleViewProfile}
              reviewSliderRef={reviewSliderRef}
            />
          ) : (
            <div className="no-results">
              <p>No doctors found</p>
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
    </div>
  );
};



export default SearchProfile;