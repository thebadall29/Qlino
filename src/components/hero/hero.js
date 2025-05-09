import React from 'react';
import { motion } from "framer-motion";
import { FaSearch } from 'react-icons/fa';
import SearchBox from '../SearchBox/SearchBox';

export default function HeroSection() {
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <SearchBox />
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