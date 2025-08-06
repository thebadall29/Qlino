import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TagsSearch.scss';
import { Link } from 'react-router-dom';
import { FaSearch, FaAngleRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config';

const TagSearch = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${config.API_URL}/api/tags`);
        setTags(response.data);
        setLoading(false);
        setTimeout(() => setIsVisible(true), 100);
      } catch (err) {
        setError('Failed to fetch tags');
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

    const handleViewDoctors = (tag) => {
    navigate(`/search-problem/${encodeURIComponent(tag)}`);
  };
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Loading health concerns...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="tags-container">
      <div className={`tags-header ${isVisible ? 'slide-up' : ''}`}>
        <h1>Common Health Concerns</h1>
        <p>Find doctors by your health concern</p>
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search health concerns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="tags-list">
        {filteredTags.map((tag, index) => (
          <div 
            key={index}
            className={`tag-item ${isVisible ? 'slide-up' : ''}`}
            style={{ '--animation-delay': `${index * 0.1}s` }}
          >
            <div className="tag-info">
              <h3>{tag.name}</h3>
              <span className="doctor-count">{tag.doctorCount} Doctors</span>
            </div>
            <button
               onClick={() => handleViewDoctors(tag.name)}
              className="view-doctors-btn"
            >
              View Doctors <FaAngleRight />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagSearch;