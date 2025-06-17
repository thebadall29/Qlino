import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaMapMarkerAlt, FaUser, FaStethoscope } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SearchBox.scss';

const SearchBox = () => {
  const [locations, setLocations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchResults, setSearchResults] = useState({
    doctors: [],
    specializations: [],
    problems: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchContext, setSearchContext] = useState('all'); // 'all', 'doctor', 'specialization', 'problem'
  const [locationTerm, setLocationTerm] = useState('');
  const [doctorTerm, setDoctorTerm] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const navigate = useNavigate();
  
  const locationDebounceRef = useRef(null);
  const doctorDebounceRef = useRef(null);
  const searchTimeout = useRef(null);

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
      
      let url = `http://localhost:5000/api/doctor/search`;
      const params = new URLSearchParams();
      
      if (query) params.append('query', query);
      if (location) params.append('location', location);
      params.append('page', 1);
      params.append('limit', 100);
      
      url += `?${params.toString()}`;
      
      const response = await axios.get(url);
      
      if (response.data.success) {
        // Categorize the results
        const categorizedResults = {
          doctors: [],
          specializations: [],
          problems: []
        };

        // Create a map to count specialists by specialization
        const specializationCount = new Map();

        response.data.doctors.forEach(item => {
          // Handle doctors
          if (item.firstName && item.lastName) {
            categorizedResults.doctors.push({
              type: 'doctor',
              id: item.id,
              name: `${item.firstName} ${item.lastName}`,
              specialization: item.specialization,
              location: item.location
            });
            
            // Count specialists
            if (item.specialization) {
              const count = specializationCount.get(item.specialization) || 0;
              specializationCount.set(item.specialization, count + 1);
            }
          }
          
          // Handle problems/tags
          if (item.tags) {
            item.tags.forEach(tag => {
              const existingProblem = categorizedResults.problems.find(p => p.name === tag);
              if (!existingProblem) {
                categorizedResults.problems.push({
                  type: 'problem',
                  name: tag,
                  count: 1
                });
              } else {
                existingProblem.count += 1;
              }
            });
          }
        });

        // Add specializations with correct counts
        specializationCount.forEach((count, specialization) => {
          categorizedResults.specializations.push({
            type: 'specialization',
            name: specialization,
            count: count
          });
        });

        // Apply context-based filtering
        const filteredResults = filterSearchResults(categorizedResults, searchContext, query);
        setSearchResults(filteredResults);
      } else {
        setSearchResults({
          doctors: [],
          specializations: [],
          problems: []
        });
      }
      
      setIsLoadingDoctors(false);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setSearchResults({
        doctors: [],
        specializations: [],
        problems: []
      });
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

  const handleLocationSelect = (location) => {
    setLocationTerm(location.location);
    setShowLocationDropdown(false);
    
    // Update doctor results when location changes
    if (doctorTerm.length >= 2) {
      fetchDoctors(doctorTerm, location.location);
    }
  };

  const detectSearchContext = (term) => {
  // Common doctor prefixes and keywords
  const doctorPrefixes = ['dr', 'dr.', 'doctor'];
  const specializationKeywords = [
    'specialist', 'surgeon', 'ologist', 
    'cardio', 'neuro', 'pediatric', 'ortho'
  ];
  
  // Check for doctor names
  if (doctorPrefixes.some(prefix => 
    term.toLowerCase().startsWith(prefix)
  )) {
    return 'doctor';
  }
  
  // Check for specializations
  if (specializationKeywords.some(keyword => 
    term.toLowerCase().includes(keyword)
  )) {
    return 'specialization';
  }
  
  // Check if the term matches any specialization in the results
  const isSpecialization = searchResults.specializations.some(
    spec => spec.name.toLowerCase().includes(term.toLowerCase())
  );
  if (isSpecialization) {
    return 'specialization';
  }
  
  // If term is in problems list, set as problem search
  const isProblem = searchResults.problems.some(
    problem => problem.name.toLowerCase().includes(term.toLowerCase())
  );
  if (isProblem) {
    return 'problem';
  }

  return 'all';
};

  // Update search term change handler
  const handleDoctorTermChange = (e) => {
    const term = e.target.value;
    setDoctorTerm(term);
    
    // Only update context if term length is sufficient
    if (term.length >= 2) {
      const newContext = detectSearchContext(term);
      setSearchContext(newContext);
      
      // Re-filter existing results if we have them
      if (Object.values(searchResults).some(arr => arr.length > 0)) {
        const filteredResults = filterSearchResults(searchResults, newContext, term);
        setSearchResults(filteredResults);
      }
    } else {
      setSearchContext('all');
    }
  };

  const handleSearchRequest = async (query) => {
    try {
      setLoading(true);
      // Trim the query to handle spaces properly
      const trimmedQuery = query.trim();
      
      if (trimmedQuery.length === 0) {
        setSearchResults({
          doctors: [],
          specializations: [],
          problems: []
        });
        return;
      }

      const response = await fetch(`http://localhost:5000/api/doctors/search?q=${encodeURIComponent(trimmedQuery)}`);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.doctors);
      } else {
        setSearchResults({
          doctors: [],
          specializations: [],
          problems: []
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({
        doctors: [],
        specializations: [],
        problems: []
      });
    } finally {
      setLoading(false);
    }
  };

  const renderDoctorResults = (item) => {
    switch (item.type) {
      case 'doctor':
        return (
          <div className="doctor-item-info">
            <span className="doctor-name">{item.name}</span>
            <span className="doctor-details">
              {item.specialization} {item.location && ` • ${item.location}`}
            </span>
          </div>
        );

      case 'specialization':
        return (
          <div className="doctor-item-info">
            <span className="doctor-name">{item.name}</span>
            <span className="doctor-details">
              {item.count} {item.count === 1 ? 'specialist' : 'specialists'} available
            </span>
          </div>
        );

      case 'problem':
        return (
          <div className="doctor-item-info">
            <span className="doctor-name">{item.name}</span>
            <span className="doctor-details">
              {item.count} {item.count === 1 ? 'doctor treats' : 'doctors treat'} this condition
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  const filterSearchResults = (results, context, term) => {
    const termLower = term.toLowerCase();
    
    switch (context) {
      case 'doctor':
        return {
          ...results,
          specializations: [],
          problems: [],
          doctors: results.doctors.filter(doc => 
            doc.name.toLowerCase().includes(termLower)
          )
        };
        
      case 'specialization':
        return {
          ...results,
          doctors: [],
          problems: [],
          specializations: results.specializations.filter(spec => 
            spec.name.toLowerCase().includes(termLower)
          )
        };
        
      case 'problem':
        return {
          ...results,
          doctors: [],
          specializations: [],
          problems: results.problems.filter(prob => 
            prob.name.toLowerCase().includes(termLower)
          )
        };
        
      default:
        return results;
    }
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
                  onClick={() => handleLocationSelect(location)}
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
          placeholder="Search doctors, specializations, health issues..." 
          value={doctorTerm}
          onChange={handleDoctorTermChange}
          onFocus={() => setShowDoctorDropdown(true)}
        />
        {showDoctorDropdown && doctorTerm.length >= 2 && (
          <div className="doctor-dropdown">
            {isLoadingDoctors ? (
              <div className="doctor-loading">Loading results...</div>
            ) : (
              <>
                {searchContext === 'all' && (
                  <>
                    {searchResults.doctors.length > 0 && (
                      <div className="result-category">
                        <div className="category-header">
                          <FaUser className="category-icon" />
                          <span>Doctors</span>
                        </div>
                        {searchResults.doctors.slice(0, 3).map((doctor, index) => (
                          <div 
                            key={index}
                            className="doctor-item"
                            onClick={() => {
                              setDoctorTerm(doctor.name);
                              setShowDoctorDropdown(false);
                            }}
                          >
                            <FaUser className="icon-small" />
                            {renderDoctorResults({ ...doctor, type: 'doctor' })}
                          </div>
                        ))}
                      </div>
                    )}

                    {searchResults.specializations.length > 0 && (
                      <div className="result-category">
                        <div className="category-header">
                          <FaStethoscope className="category-icon" />
                          <span>Specializations</span>
                        </div>
                        {searchResults.specializations.slice(0, 3).map((spec, index) => (
                          <div 
                            key={index}
                            className="doctor-item"
                            onClick={() => {
                              setDoctorTerm(spec.name);
                              setShowDoctorDropdown(false);
                            }}
                          >
                            <FaStethoscope className="icon-small" />
                            {renderDoctorResults({ ...spec, type: 'specialization' })}
                          </div>
                        ))}
                      </div>
                    )}

                    {searchResults.problems.length > 0 && (
                      <div className="result-category">
                        <div className="category-header">
                          <FaSearch className="category-icon" />
                          <span>Health Issues</span>
                        </div>
                        {searchResults.problems.slice(0, 3).map((problem, index) => (
                          <div 
                            key={index}
                            className="doctor-item"
                            onClick={() => {
                              setDoctorTerm(problem.name);
                              setShowDoctorDropdown(false);
                            }}
                          >
                            <FaSearch className="icon-small" />
                            {renderDoctorResults({ ...problem, type: 'problem' })}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {searchContext !== 'all' && (
                  <div className="result-category">
                    {searchContext === 'doctor' && searchResults.doctors.map((doctor, index) => (
                      <div 
                        key={index}
                        className="doctor-item"
                        onClick={() => {
                          setDoctorTerm(doctor.name);
                          setShowDoctorDropdown(false);
                        }}
                      >
                        <FaUser className="icon-small" />
                        {renderDoctorResults({ ...doctor, type: 'doctor' })}
                      </div>
                    ))}

                    {searchContext === 'specialization' && searchResults.specializations.map((spec, index) => (
                      <div 
                        key={index}
                        className="doctor-item"
                        onClick={() => {
                          setDoctorTerm(spec.name);
                          setShowDoctorDropdown(false);
                        }}
                      >
                        <FaStethoscope className="icon-small" />
                        {renderDoctorResults({ ...spec, type: 'specialization' })}
                      </div>
                    ))}

                    {searchContext === 'problem' && searchResults.problems.map((problem, index) => (
                      <div 
                        key={index}
                        className="doctor-item"
                        onClick={() => {
                          setDoctorTerm(problem.name);
                          setShowDoctorDropdown(false);
                        }}
                      >
                        <FaSearch className="icon-small" />
                        {renderDoctorResults({ ...problem, type: 'problem' })}
                      </div>
                    ))}
                  </div>
                )}

                {!searchResults.doctors.length && 
                 !searchResults.specializations.length && 
                 !searchResults.problems.length && (
                  <div className="doctor-no-results">No results found</div>
                )}
              </>
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