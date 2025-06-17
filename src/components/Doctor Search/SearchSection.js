import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import SearchProfile from '../SearchProfile/SearchProfile';
import Pagination from '../Pagination/Pagination'; // Import the Pagination component

const SearchSection = () => {
  const location = useLocation();
  // Add this with other state declarations at the top
const [searchContext, setSearchContext] = useState('all'); // 'all', 'doctor', 'specialization', 'problem'
  const navigate = useNavigate();
  const resultsContainerRef = useRef(null);

  // Extract query parameters from URL
  const getQueryParams = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      locationParam: searchParams.get('location') || '',
      queryParam: searchParams.get('query') || '',
    };
  };

  const { locationParam, queryParam, doctorId } = getQueryParams();

  const [locations, setLocations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [locationTerm, setLocationTerm] = useState(locationParam);
  const [doctorTerm, setDoctorTerm] = useState(queryParam);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const RESULTS_PER_PAGE = 10;

  const locationDebounceRef = useRef(null);
  const doctorDebounceRef = useRef(null);

  // Function to fetch locations from API
  const fetchLocations = async (query) => {
    try {
      setIsLoadingLocations(true);
      const response = await axios.get(`http://localhost:5000/api/doctor/locations?query=${encodeURIComponent(query)}`);
      setLocations(response.data);
      setIsLoadingLocations(false);
    } catch (error) {
      console.error('Error fetching locations:', error);
      // Fallback to hardcoded cities if API fails
      const indianCities = [
        { location: "Mumbai, Maharashtra", count: 5 },
        { location: "Bhopal, Madhya Pradesh", count: 2 },
        { location: "Bangalore, Karnataka", count: 8 },
        { location: "Hyderabad, Telangana", count: 4 },
        { location: "Chennai, Tamil Nadu", count: 3 },
        { location: "Kolkata, West Bengal", count: 6 },
        { location: "Pune, Maharashtra", count: 4 },
        { location: "Ahmedabad, Gujarat", count: 2 }
      ];

      const filteredCities = indianCities.filter(city =>
        city.location.toLowerCase().includes(query.toLowerCase())
      );

      setLocations(filteredCities);
      setIsLoadingLocations(false);
    }
  };

  // Function to fetch doctors from API
  const fetchDoctors = async (query, location, page = 1) => {
    try {
      setIsLoadingDoctors(true);
      const trimmedQuery = query.trim();
      let searchQuery = trimmedQuery;
      
      const parts = trimmedQuery.split(' ');
      if (parts.length > 1 && parts[parts.length - 1].length < 2) {
        searchQuery = parts[0];
      }
      
      let url = `http://localhost:5000/api/doctor/search?query=${encodeURIComponent(searchQuery)}&page=${page}&limit=${RESULTS_PER_PAGE}`;
      if (location) {
        url += `&location=${encodeURIComponent(location)}`;
      }

      const response = await axios.get(url);
      
      // Update search context based on response
      if (response.data.matchType) {
        setSearchContext(response.data.matchType);
      }

      // Update pagination states
      setTotalResults(response.data.total); // This should be the total count of all results
      setTotalPages(Math.ceil(response.data.total / RESULTS_PER_PAGE));
      setCurrentPage(page);

      const doctorsData = response.data.doctors.map(doc => ({
        ...doc,
        photoUrl: doc.photoUrl,
        _id: doc.id || doc._id,
        context: response.data.matchType
      }));

      setDoctors(doctorsData);
      setIsLoadingDoctors(false);
      return doctorsData;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
      setIsLoadingDoctors(false);
      return [];
    }
  };

  // Function to fetch a specific doctor by ID
  const fetchDoctorById = async (id) => {
    try {
      setIsSearching(true);
      const response = await axios.get(`http://localhost:5000/api/doctor/${id}`);
      console.log('Doctor fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor by ID:', error);
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  // Effect for dropdown suggestions while typing
  useEffect(() => {
    if (locationTerm.length >= 2) {
      if (locationDebounceRef.current) {
        clearTimeout(locationDebounceRef.current);
      }

      locationDebounceRef.current = setTimeout(() => {
        fetchLocations(locationTerm);
      }, 300);
    } else {
      setLocations([]);
    }

    return () => {
      if (locationDebounceRef.current) {
        clearTimeout(locationDebounceRef.current);
      }
    };
  }, [locationTerm]);

  // Effect for doctor dropdown suggestions while typing
  useEffect(() => {
    if (doctorTerm.length >= 2) {
      if (doctorDebounceRef.current) {
        clearTimeout(doctorDebounceRef.current);
      }

      doctorDebounceRef.current = setTimeout(() => {
        fetchDoctors(doctorTerm, locationTerm);
      }, 300);
    } else {
      setDoctors([]);
    }

    return () => {
      if (doctorDebounceRef.current) {
        clearTimeout(doctorDebounceRef.current);
      }
    };
  }, [doctorTerm]);

  // Add a useEffect to scroll when hasSearched changes to true
  useEffect(() => {
    if (hasSearched && !isSearching && searchResults.length > 0) {
      setTimeout(() => {
        if (resultsContainerRef.current) {
          // Use a more gentle scroll with offset to control how far it scrolls
          resultsContainerRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' // Change from 'start' to 'center' for less aggressive scroll
          });
        }
      }, 100);
    }
  }, [hasSearched, isSearching, searchResults]);

  // Initial fetch based on URL parameters
  useEffect(() => {
    const performInitialSearch = async () => {
      setIsSearching(true);
      setHasSearched(true);
      
      // First check if we have a direct doctorId
      if (doctorId) {
        const doctor = await fetchDoctorById(doctorId);
        console.log('Doctor fetched successfully:', doctor); // Log the fetched doctor data
        if (doctor) {
          setSearchResults([doctor]);
          setSelectedDoctor(doctor);
          // Update the search term with the doctor's name if available
          if (doctor.name) {
            setDoctorTerm(doctor.name);
          }
        } else {
          setSearchResults([]);
          setSelectedDoctor(null);
        }
      }
      // Otherwise search by query parameter
      else if (queryParam && queryParam.length >= 2) {
        const results = await fetchDoctors(queryParam, locationParam);

        setSearchResults(results);
        
        // Normalize strings for comparison
        const normalizedQueryParam = queryParam.trim().toLowerCase();
        
        // Try to find an exact match first
        const exactMatch = results.find(doc => 
          doc.name && doc.name.toLowerCase() === normalizedQueryParam
        );
        
        // If no exact match, try to find a match that contains all parts of the search term
        const partialMatch = !exactMatch ? results.find(doc => {
          if (!doc.name) return false;
          
          // Split the search term into parts (for handling first name, last name)
          const searchParts = normalizedQueryParam.split(' ').filter(part => part.length > 0);
          
          // Check if all parts of the search term are in the doctor's name
          return searchParts.every(part => doc.name.toLowerCase().includes(part));
        }) : null;
        
        if (exactMatch) {
          setSelectedDoctor(exactMatch);
        } else if (partialMatch) {
          setSelectedDoctor(partialMatch);
        } else if (results.length === 1) {
          setSelectedDoctor(results[0]);
        } else {
          setSelectedDoctor(null);
        }
        
        // Scroll to results after a short delay to ensure rendering is complete
        setTimeout(() => {
          const resultsContainer = document.querySelector('.doctor-profiles-container');
          if (resultsContainer) {
            resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      } else {
        setSearchResults([]);
        setSelectedDoctor(null);
      }
      
      setIsSearching(false);
    };

    if (locationParam && locationParam.length >= 2) {
      fetchLocations(locationParam);
    }

    // Only perform search if we have either a doctorId or a queryParam
    if (doctorId || (queryParam && queryParam.length >= 2)) {
      performInitialSearch();
    }
  }, [locationParam, queryParam, doctorId]);
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.select-wrapper')) {
        setShowLocationDropdown(false);
      }
      if (!event.target.closest('.search-input-wrapper')) {
        setShowDoctorDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Handle search button click
  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const results = await fetchDoctors(doctorTerm, locationTerm);
      console.log('Search results in function:', results); 
      setSearchResults(results);
      
      // Check if there's an exact match with the search term (case insensitive)
      if (results && results.length > 0) {
        // Normalize strings for comparison by trimming and converting to lowercase
        const normalizedSearchTerm = doctorTerm.trim().toLowerCase();
        
        // Try to find an exact match first
        const exactMatch = results.find(doc => 
          doc.name && doc.name.toLowerCase() === normalizedSearchTerm
        );
        
        // If no exact match, try to find a match that contains all parts of the search term
        const partialMatch = !exactMatch ? results.find(doc => {
          if (!doc.name) return false;
          
          // Split the search term into parts (for handling first name, last name)
          const searchParts = normalizedSearchTerm.split(' ').filter(part => part.length > 0);
          
          // Check if all parts of the search term are in the doctor's name
          return searchParts.every(part => doc.name.toLowerCase().includes(part));
        }) : null;
        
        if (exactMatch) {
          setSelectedDoctor(exactMatch);
        } else if (partialMatch) {
          setSelectedDoctor(partialMatch);
        } else if (results.length === 1) {
          // If there's only one result, set it as the selected doctor
          setSelectedDoctor(results[0]);
        } else {
          // Multiple results but no match
          setSelectedDoctor(null);
        }
        
        // Scroll to results after a short delay to ensure rendering is complete
        setTimeout(() => {
          const resultsContainer = document.querySelector('.doctor-profiles-container');
          if (resultsContainer) {
            resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      } else {
        setSelectedDoctor(null);
      }
    } catch (error) {
      console.error("Error during search:", error);
      setSearchResults([]);
      setSelectedDoctor(null);
    } finally {
      setIsSearching(false);
    }
  };


  // Handle doctor selection from dropdown
  const handleDoctorSelect = (doctor) => {
    setDoctorTerm(doctor.name);
    setSelectedDoctor(doctor); // Store the selected doctor
    setShowDoctorDropdown(false);
    
    // Immediately set search results to prevent disappearing on double-click
    setSearchResults([doctor]);
    // Do NOT reset selected doctor after setting search results
  };

  // Add this new function to handle double-click events
  const handleDoubleClick = (e) => {
    // Prevent default behavior
    e.preventDefault();
    // Stop propagation to prevent other handlers from firing
    e.stopPropagation();
    
    
    // Ensure search results remain visible
    if (searchResults.length === 0 && selectedDoctor) {
      setSearchResults([selectedDoctor]);
    }
    
    return false;
  };

  // Handle popular search tag clicks
  const handleTagClick = (tag) => {
    setDoctorTerm(tag);
    setSelectedDoctor(null); // Clear any selected doctor when clicking on tags
  };

  // Add handlePageChange function
  const handlePageChange = async (page) => {
    setIsSearching(true);
    const results = await fetchDoctors(doctorTerm, locationTerm, page);
    setSearchResults(results);
    setIsSearching(false);
  };

  console.log("Selected Doctor:", selectedDoctor);
  console.log("Search Results:", searchResults);

  return (
    <div className="search-page-container">
      <div className="custom-search-section">
        <div className="search-content-wrapper">
          <div className="search-header">
            <h1>Your home for health</h1>
            <h2>Find and Book</h2>
          </div>

          <div className="search-container">
            <div className="custom-search-bar">
              <div className="select-wrapper">
                <input
                  type="text"
                  placeholder="Search location"
                  className="custom-location-select"
                  value={locationTerm}
                  onChange={(e) => setLocationTerm(e.target.value)}
                  onFocus={() => setShowLocationDropdown(true)}
                />
                <i className="fas fa-chevron-down"></i>

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
                          }}
                        >
                          <i className="fas fa-map-marker-alt location-item-icon"></i>
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
              <div className="search-input-wrapper">
                <i className="fas fa-search search-icon"></i>
                <input
                  type="text"
                  placeholder="Search doctors, clinics, hospitals, etc."
                  className="custom-search-input"
                  value={doctorTerm}
                  onChange={(e) => {
                    setDoctorTerm(e.target.value);
                    setSelectedDoctor(null); // Clear selected doctor when typing
                  }}
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
                          onClick={() => handleDoctorSelect(doctor)}
                        >
                          <i className="fas fa-user doctor-item-icon"></i>
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
              <button className="custom-search-button" onClick={handleSearch}>
                <span>Search</span>
              </button>
            </div>
          </div>

          <div className="custom-popular-searches">
            <span className="popular-searches-label">Popular searches:</span>
            <div className="custom-search-tags-container">
              <button className="custom-search-tag" onClick={() => handleTagClick("Dermatologist")}>
                <i className="fas fa-user-md tag-icon"></i>
                Dermatologist
              </button>
              <button className="custom-search-tag" onClick={() => handleTagClick("Pediatrician")}>
                <i className="fas fa-baby tag-icon"></i>
                Pediatrician
              </button>
              <button className="custom-search-tag" onClick={() => handleTagClick("Gynecologist")}>
                <i className="fas fa-female tag-icon"></i>
                Gynecologist
              </button>
              <button className="custom-search-tag" onClick={() => handleTagClick("Other")}>
                <i className="fas fa-plus-circle tag-icon"></i>
                Other
              </button>
            </div>
          </div>

          <a href="#" className="all-specialties-link">
            View all specialties
            <i className="fas fa-arrow-right"></i>
          </a>

          <div className="custom-action-section">
            <div className="action-item">
              <div className="action-icon">
                <i className="fas fa-comments"></i>
              </div>
              <span>Consult with a doctor</span>
            </div>

            <div className="action-item">
              <div className="action-icon">
                <i className="fas fa-file-medical"></i>
              </div>
              <span>View medical records</span>
            </div>
            <div className="action-item">
              <div className="action-icon">
                <i className="fas fa-vial"></i>
              </div>
              <span>Book test</span>
            </div>
            <div className="action-item">
              <div className="action-icon">
                <i className="fas fa-book-open"></i>
              </div>
              <span>Read articles</span>
            </div>
            <div className="action-item">
              <div className="action-icon">
                <i className="fas fa-briefcase-medical"></i>
              </div>
              <span>For healthcare providers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Doctor profiles section - displayed only after search */}
      {isSearching ? (
        <div className="loading-results">Loading search results...</div>
      ) : (
        <div 
          className="doctor-profiles-container"
          onDoubleClick={handleDoubleClick}
          ref={resultsContainerRef}
        >
          {hasSearched && (
            searchResults && searchResults.length > 0 ? (
              searchResults.map((doctor, index) => (
                <SearchProfile
                  key={`search-result-${doctor.id || index}`}
                  doctor={{
                    ...doctor,
                    photoUrl: doctor.photoUrl ,
                    _id: doctor.id || doctor._id // Ensure _id is present for consistency
                  }}
                  resultCount={totalResults} // Changed from searchResults.length to totalResults
                  totalResults={totalResults} // Add this new prop
                  index={index}
                  onDoubleClick={handleDoubleClick}
                />
              ))
            ) : (
              <div className="no-results-message">No doctors found matching your search criteria.</div>
            )
          )}

          {hasSearched && searchResults.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SearchSection;