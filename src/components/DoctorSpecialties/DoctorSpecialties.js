import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DoctorSpecialties.scss';
import { Link } from 'react-router-dom';
import { FaSearch, FaAngleRight } from 'react-icons/fa';
import config from '../../config/config';

const Specialties = () => {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${config.API_URL}/api/specialties`);
        setSpecialties(response.data);
        setLoading(false);
        setTimeout(() => setIsVisible(true), 100);
      } catch (err) {
        setError('Failed to fetch specialties');
        setLoading(false);
      }
    };

    fetchSpecialties();
  }, []);

  console.log('Specialties:', specialties);

  const filteredSpecialties = specialties.filter(specialty =>
    specialty.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Loading specialties...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="specialties-container">
      <div className={`specialties-header ${isVisible ? 'slide-up' : ''}`}>
        <h1>Our Medical Specialties</h1>
        <p>Find the right specialist for your health concern</p>
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search specialties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="specialties-list">
        {filteredSpecialties.map((specialty, index) => (
          <div 
            key={index}
            className={`specialty-item ${isVisible ? 'slide-up' : ''}`}
            style={{ '--animation-delay': `${index * 0.1}s` }}
          >
            <div className="specialty-info">
              <h3>{specialty.name}</h3>
              <span className="doctor-count">{specialty.doctorCount} Doctors</span>
            </div>
            <Link 
              to={`/${specialty.name.toLowerCase()}/doctors`}
              className="view-doctors-btn"
            >
              View Doctors <FaAngleRight />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Specialties;