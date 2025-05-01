import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Hardcoded major Indian cities with states
  const indianCities = [
    { name: "Mumbai, Maharashtra", coordinates: [72.8777, 19.0760] },
    { name: "Delhi, Delhi", coordinates: [77.1025, 28.7041] },
    { name: "Bangalore, Karnataka", coordinates: [77.5946, 12.9716] },
    { name: "Hyderabad, Telangana", coordinates: [78.4867, 17.3850] },
    { name: "Chennai, Tamil Nadu", coordinates: [80.2707, 13.0827] },
    { name: "Kolkata, West Bengal", coordinates: [88.3639, 22.5726] },
    { name: "Pune, Maharashtra", coordinates: [73.8567, 18.5204] },
    { name: "Ahmedabad, Gujarat", coordinates: [72.5714, 23.0225] },
    { name: "Jaipur, Rajasthan", coordinates: [75.7873, 26.9124] },
    { name: "Surat, Gujarat", coordinates: [72.8311, 21.1702] },
    { name: "Lucknow, Uttar Pradesh", coordinates: [80.9462, 26.8467] },
    { name: "Kanpur, Uttar Pradesh", coordinates: [80.3319, 26.4499] },
    { name: "Nagpur, Maharashtra", coordinates: [79.0882, 21.1458] },
    { name: "Indore, Madhya Pradesh", coordinates: [75.8577, 22.7196] },
    { name: "Thane, Maharashtra", coordinates: [72.9780, 19.2183] },
    { name: "Bhopal, Madhya Pradesh", coordinates: [77.4126, 23.2599] },
    { name: "Visakhapatnam, Andhra Pradesh", coordinates: [83.2185, 17.6868] },
    { name: "Patna, Bihar", coordinates: [85.1376, 25.5941] },
    { name: "Vadodara, Gujarat", coordinates: [73.1812, 22.3072] },
    { name: "Ghaziabad, Uttar Pradesh", coordinates: [77.4538, 28.6692] },
    { name: "Ludhiana, Punjab", coordinates: [75.8573, 30.9010] },
    { name: "Agra, Uttar Pradesh", coordinates: [78.0081, 27.1767] },
    { name: "Nashik, Maharashtra", coordinates: [73.7898, 19.9975] },
    { name: "Faridabad, Haryana", coordinates: [77.3178, 28.4089] },
    { name: "Meerut, Uttar Pradesh", coordinates: [77.7064, 28.9845] }
  ];

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const filteredCities = indianCities.filter(city =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setLocations(filteredCities);
    } else {
      setLocations([]);
    }
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.location-input')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="hero-container">
      <motion.div 
        className="hero-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="logo-section">
          <div className="logo-circle">
            <FaSearch className="search-icon" />
          </div>
          <h2 className="logo-text">Qlino</h2>
        </div>

        <motion.h1 
          className="hero-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Healthcare Connected. Find trusted doctors, book appointments, and manage your health securely with Qlino.
        </motion.h1>

        <motion.div 
          className="search-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="location-input">
            <FaMapMarkerAlt className="location-icon" />
            <input 
              type="text" 
              placeholder="Search location" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowDropdown(true)}
            />
            {showDropdown && searchTerm.length >= 2 && (
              <div className="location-dropdown">
                {locations.length > 0 ? (
                  locations.map((location, index) => (
                    <div 
                      key={index}
                      className="location-item"
                      onClick={() => {
                        setSearchTerm(location.name);
                        setShowDropdown(false);
                      }}
                    >
                      <FaMapMarkerAlt className="location-item-icon" />
                      <span>{location.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="location-no-results">No locations found</div>
                )}
              </div>
            )}
          </div>
          <div className="search-input search-doctor">
            <input type="text" placeholder="Search doctors, clinics, hospitals, etc." />
          </div>
          <button className="search-button">Search</button>
          <div className="search-help-link">
            <Link to="/find-specialist" className="specialist-finder-link">
              Not sure which specialist to consult? Find the right doctor for your condition
            </Link>
          </div>
        </motion.div>

        <motion.div 
          className="services-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <div className="service-card">
            <img src="https://static.vecteezy.com/system/resources/previews/003/407/087/non_2x/asian-doctor-give-consult-to-patient-via-online-video-call-photo.jpg" alt="Video consultation" />
            <h3>Instant Video Consultation</h3>
            <p>Connect within 60 secs</p>
          </div>
          <div className="service-card">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1Zgh6ihHHpvbZdQgP9oz5stMg0BzhwARmLndRSBbvctFgAPCBGxE-zU0zHFs56_4ypto&usqp=CAU" />
            <h3>Find Doctors Near You</h3>
            <p>Confirmed appointments</p>
          </div>
          <div className="service-card">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgRDEnFmz1JoV9gwwLuZPS278HM5yNuu5Lvw&s" alt="Surgeries" />
            <h3>Surgeries & Procedures</h3>
            <p>Safe and trusted providers</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}