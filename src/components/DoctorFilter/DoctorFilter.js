import React, { useState } from 'react';
import axios from 'axios';
import './DoctorFilter.scss';

const DoctorFilter = ({ onFilterResults }) => {
  const [filters, setFilters] = useState({
    query: '',
    location: '',
    specialization: '',
    experience: '',
    rating: '',
    verified: false,
    sortBy: 'experience_high'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const applyFilters = async () => {
    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Only add parameters that have values
      if (filters.query) params.append('query', filters.query);
      if (filters.location) params.append('location', filters.location);
      if (filters.specialization) params.append('specialization', filters.specialization);
      if (filters.experience) params.append('experience', filters.experience);
      if (filters.rating) params.append('rating', filters.rating);
      if (filters.verified) params.append('verified', 'true');
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      
      const url = `http://localhost:5000/api/doctor/search?${params.toString()}`;
      const response = await axios.get(url);
      
      // Pass the filtered results to the parent component
      onFilterResults(response.data);
    } catch (error) {
      console.error('Error applying filters:', error);
      onFilterResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetFilters = () => {
    setFilters({
      query: '',
      location: '',
      specialization: '',
      experience: '',
      rating: '',
      verified: false,
      sortBy: 'experience_high'
    });
    
    // Apply the reset filters
    applyFilters();
  };
  
  return (
    <div className="doctor-filter-container">
      <h3>Filter Doctors</h3>
      
      <div className="filter-group">
        <label>Search</label>
        <input 
          type="text" 
          name="query" 
          value={filters.query} 
          onChange={handleInputChange} 
          placeholder="Doctor name, specialization..."
        />
      </div>
      
      <div className="filter-group">
        <label>Location</label>
        <input 
          type="text" 
          name="location" 
          value={filters.location} 
          onChange={handleInputChange} 
          placeholder="City, State"
        />
      </div>
      
      <div className="filter-group">
        <label>Specialization</label>
        <select name="specialization" value={filters.specialization} onChange={handleInputChange}>
          <option value="">All Specializations</option>
          <option value="Cardiologist">Cardiologist</option>
          <option value="Dermatologist">Dermatologist</option>
          <option value="Pediatrician">Pediatrician</option>
          <option value="Neurologist">Neurologist</option>
          <option value="Orthopedic">Orthopedic</option>
          <option value="Gynecologist">Gynecologist</option>
          <option value="Psychiatrist">Psychiatrist</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label>Minimum Experience (Years)</label>
        <select name="experience" value={filters.experience} onChange={handleInputChange}>
          <option value="">Any Experience</option>
          <option value="1">1+ Years</option>
          <option value="3">3+ Years</option>
          <option value="5">5+ Years</option>
          <option value="10">10+ Years</option>
          <option value="15">15+ Years</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label>Sort By</label>
        <select name="sortBy" value={filters.sortBy} onChange={handleInputChange}>
          <option value="experience_high">Experience (High to Low)</option>
          <option value="experience_low">Experience (Low to High)</option>
          <option value="rating_high">Rating (High to Low)</option>
          <option value="rating_low">Rating (Low to High)</option>
        </select>
      </div>
      
      <div className="filter-group checkbox">
        <label>
          <input 
            type="checkbox" 
            name="verified" 
            checked={filters.verified} 
            onChange={handleInputChange} 
          />
          Verified Doctors Only
        </label>
      </div>
      
      <div className="filter-actions">
        <button 
          className="apply-filter-btn" 
          onClick={applyFilters} 
          disabled={isLoading}
        >
          {isLoading ? 'Filtering...' : 'Apply Filters'}
        </button>
        
        <button 
          className="reset-filter-btn" 
          onClick={resetFilters} 
          disabled={isLoading}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default DoctorFilter;