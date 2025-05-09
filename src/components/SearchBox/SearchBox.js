import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaMapMarkerAlt, FaUser, FaStethoscope } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
// import './SearchBox.css';

const SearchBox = () => {
  const [locations, setLocations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [locationTerm, setLocationTerm] = useState('');
  const [doctorTerm, setDoctorTerm] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const navigate = useNavigate();
  
  const locationDebounceRef = useRef(null);
  const doctorDebounceRef = useRef(null);

  // Function to fetch locations from API
  const fetchLocations = async (query) => {
    try {
      setIsLoadingLocations(true);
      const response = await axios.get(`http://localhost:5000/api/doctor/locations?query=${encodeURIComponent(query)}`);
      
      // Group locations by name and count doctors
      const locationMap = {};
      response.data.forEach(loc => {
        const locationKey = loc.location || 'Unknown';
        if (!locationMap[locationKey]) {
          locationMap[locationKey] = {
            location: locationKey,
            count: loc.count || 0
          };
        } else {
          locationMap[locationKey].count += loc.count || 0;
        }
      });
      
      // Convert map to array
      const uniqueLocations = Object.values(locationMap);
      
      setLocations(uniqueLocations);
      setIsLoadingLocations(false);
      console.log('Unique locations:', uniqueLocations);
    } catch (error) {
      console.error('Error fetching locations:', error);
      // Fallback to hardcoded cities if API fails
      const indianCities = [
        { name: "Mumbai, Maharashtra" },
        { name: "Bhopal, Madhya Pradesh" },
        { name: "Bangalore, Karnataka" },
        { name: "Hyderabad, Telangana" },
        { name: "Chennai, Tamil Nadu" },
        { name: "Kolkata, West Bengal" },
        { name: "Pune, Maharashtra" },
        { name: "Ahmedabad, Gujarat" }
      ];
      
      const filteredCities = indianCities.filter(city =>
        city.name.toLowerCase().includes(query.toLowerCase())
      );
      
      setLocations(filteredCities);
      setIsLoadingLocations(false);
    }
  };

  // Function to fetch doctors from API
  const fetchDoctors = async (query, location) => {
    try {
      setIsLoadingDoctors(true);
      
      let url = `http://localhost:5000/api/doctor/search?query=${encodeURIComponent(query)}`;
      if (location) {
        url += `&location=${encodeURIComponent(location)}`;
      }
      
      const response = await axios.get(url);
      setDoctors(response.data);
      setIsLoadingDoctors(false);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
      setIsLoadingDoctors(false);
    }
  };

  // Location search effect with debounce
  useEffect(() => {
    if (locationTerm.length >= 2) {
      // Clear previous timeout
      if (locationDebounceRef.current) {
        clearTimeout(locationDebounceRef.current);
      }
      
      // Set new timeout
      locationDebounceRef.current = setTimeout(() => {
        fetchLocations(locationTerm);
      }, 300);
    } else {
      setLocations([]);
    }
    
    // Cleanup function
    return () => {
      if (locationDebounceRef.current) {
        clearTimeout(locationDebounceRef.current);
      }
    };
  }, [locationTerm]);

  // Doctor search effect with debounce
  useEffect(() => {
    if (doctorTerm.length >= 2) {
      // Clear previous timeout
      if (doctorDebounceRef.current) {
        clearTimeout(doctorDebounceRef.current);
      }
      
      // Set new timeout
      doctorDebounceRef.current = setTimeout(() => {
        fetchDoctors(doctorTerm, locationTerm);
      }, 300);
    } else {
      setDoctors([]);
    }
    
    // Cleanup function
    return () => {
      if (doctorDebounceRef.current) {
        clearTimeout(doctorDebounceRef.current);
      }
    };
  }, [doctorTerm, locationTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.location-input')) {
        setShowLocationDropdown(false);
      }
      if (!event.target.closest('.search-doctor')) {
        setShowDoctorDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Handle search button click
  const handleSearch = () => {
    // Navigate to search results page with query parameters
    navigate(`/find-your-doctor?location=${encodeURIComponent(locationTerm)}&query=${encodeURIComponent(doctorTerm)}`);
  };

  return (
    <div className="search-section">
      <div className="location-input">
        <FaMapMarkerAlt className="location-icon" />
        <input 
          type="text" 
          placeholder="Search location" 
          value={locationTerm}
          onChange={(e) => setLocationTerm(e.target.value)}
          onFocus={() => setShowLocationDropdown(true)}
        />
        {showLocationDropdown && locationTerm.length >= 2 && (
          <div className="location-dropdown">
            {isLoadingLocations ? (
              <div className="location-loading">Loading locations...</div>
            ) : locations.length > 0 ? (
              locations.map((location, index) => (
                <div 
                  key={index}
                  className="location-item"
                  onClick={() => {
                    setLocationTerm(location.location);
                    setShowLocationDropdown(false);
                    // Update doctor results when location changes
                    if (doctorTerm.length >= 2) {
                      fetchDoctors(doctorTerm, location.location);
                    }
                  }}
                >
                  <FaMapMarkerAlt className="location-item-icon" />
                  <span>{location.location}</span>
                  {location.count > 0 && <span className="doctor-count">({location.count} {location.count === 1 ? 'doctor' : 'doctors'})</span>}
                </div>
              ))
            ) : (
              <div className="location-no-results">No locations found</div>
            )}
          </div>
        )}
      </div>
      <div className="search-input search-doctor">
        <FaStethoscope className="doctor-icon" />
        <input 
          type="text" 
          placeholder="Search doctors, clinics, hospitals, etc." 
          value={doctorTerm}
          onChange={(e) => setDoctorTerm(e.target.value)}
          onFocus={() => setShowDoctorDropdown(true)}
        />
        {showDoctorDropdown && doctorTerm.length >= 2 && (
          <div className="doctor-dropdown">
            {isLoadingDoctors ? (
              <div className="doctor-loading">Loading doctors...</div>
            ) : doctors.length > 0 ? (
              doctors.map((doctor, index) => (
                <div 
                  key={index}
                  className="doctor-item"
                  onClick={() => {
                    setDoctorTerm(doctor.name);
                    setShowDoctorDropdown(false);
                    // Optionally navigate to doctor profile
                    // navigate(`/doctor/${doctor.id}`);
                  }}
                >
                  <FaUser className="doctor-item-icon" />
                  <div className="doctor-item-info">
                    <span className="doctor-name">{doctor.name}</span>
                    <span className="doctor-details">
                      {doctor.specialization} {doctor.qualification && `| ${doctor.qualification}`}
                      {doctor.location && ` | ${doctor.location}`}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="doctor-no-results">No doctors found</div>
            )}
          </div>
        )}
      </div>
      <button className="search-button" onClick={handleSearch}>Search</button>
      <div className="search-help-link">
        <Link to="/find-specialist" className="specialist-finder-link">
          Not sure which specialist to consult? Find the right doctor for your condition
        </Link>
      </div>
    </div>
  );
};

export default SearchBox;