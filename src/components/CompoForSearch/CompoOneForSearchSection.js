import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DoctorFilter from '../DoctorFilter/DoctorFilter';
import { Link } from "react-router-dom";
import config from '../../config/config.js';

const CompoOneForSearchSection = () => {
  const [activeDoctor, setActiveDoctor] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [doctorReviews, setDoctorReviews] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    doctorCount: 0,
    reviewCount: 0,
    patientCountThisYear: 0
  });

  // Original static doctors data (can be used as fallback)
  const doctors = [
    {
      name: "Dr Sonal Sharma",
      specialty: "Cardiologist",
      experience: "10 Years of experience",
      votes: "94% (1912 votes)",
      feedback: "582 Feedback",
      verified: "Medical registration verified",
      availability: "Available today"
    },
    {
      name: "Dr Priya Patel",
      specialty: "Dermatologist",
      experience: "8 Years of experience",
      votes: "96% (1548 votes)",
      feedback: "423 Feedback",
      verified: "Medical registration verified",
      availability: "Available tomorrow"
    },
    {
      name: "Dr Rahul Gupta",
      specialty: "Pediatrician",
      experience: "12 Years of experience",
      votes: "92% (2145 votes)",
      feedback: "678 Feedback",
      verified: "Medical registration verified",
      availability: "Available today"
    }
  ];

  const testimonials = [
    {
      rating: 5,
      text: "Very helpful. Far easier than doing same things on computer. Allows quick and easy search with speedy booking. Even maintains history of doctors visited.",
      author: "Amit Sharma",
      avatar: "A"
    },
    {
      rating: 5,
      text: "Great experience booking appointments. The interface is intuitive and the process is seamless. Highly recommended!",
      author: "Priya Verma",
      avatar: "P"
    },
    {
      rating: 5,
      text: "Excellent platform for finding the right doctor. The reviews and ratings helped me make an informed decision.",
      author: "Rajesh Kumar",
      avatar: "R"
    }
  ];

  const colors = [
  '#FF6B6B', // coral red
  '#4ECDC4', // turquoise
  '#45B7D1', // sky blue
  '#96CEB4', // sage green
  '#FFEEAD', // cream yellow
  '#D4A5A5', // dusty rose
  '#9B6B9W', // lavender
  '#77A1D3', // periwinkle
];

  const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};


  // Fetch system statistics
  const fetchSystemStats = async () => {
    try {
      // Fetch total doctor count
      const doctorsResponse = await axios.get(`${config.API_URL}/api/doctor`);
      const doctorCount = doctorsResponse.data.length;

      // Fetch all reviews to count them - adding a required parameter to avoid 400 error
      const reviewsResponse = await axios.get(`${config.API_URL}/api/doctor/search?limit=100&verified=true`);
      let totalReviews = 0;
      if (reviewsResponse.data && Array.isArray(reviewsResponse.data)) {
        reviewsResponse.data.forEach(doctor => {
          totalReviews += doctor.reviewCount || 0;
        });
      }

      // For patient count, we'll use a different approach since the endpoint doesn't exist
      // You can either create a new endpoint or use a fallback value
      let patientCountThisYear = 0;

      // Option 1: Use a fallback value
      patientCountThisYear = 100; // Replace with a reasonable estimate

      // Option 2: If you have doctor IDs, you could fetch unique patients for each doctor
      // This would require multiple API calls, one per doctor

      console.log('Fetched stats:', {
        doctorCount,
        totalReviews,
        patientCountThisYear
      });

      setStats({
        doctorCount: doctorCount || 0,
        reviewCount: totalReviews || 0,
        patientCountThisYear: patientCountThisYear || 0
      });
    } catch (error) {
      console.error('Error fetching system statistics:', error);
      // Use fallback values if fetch fails
      setStats({
        doctorCount: 0,
        reviewCount: 0,
        patientCountThisYear: 0
      });
    }
  };

  // Fetch reviews for a specific doctor
  const fetchDoctorReviews = async (doctorId) => {
    try {
      const response = await axios.get(`${config.API_URL}/api/doctor/${doctorId}/reviews`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching reviews for doctor ${doctorId}:`, error);
      return { reviews: [], averageRating: 0, totalReviews: 0 };
    }
  };

  // Handle filtered results from the DoctorFilter component
  const handleFilterResults = async (results) => {
    setIsLoading(true);
    setError(null);

    try {
      if (results && results.length > 0) {
        // Fetch reviews for each doctor
        const reviewsPromises = results.map(doctor => fetchDoctorReviews(doctor.id));
        const reviewsResults = await Promise.all(reviewsPromises);

        // Create a map of doctor ID to reviews
        const reviewsMap = {};
        results.forEach((doctor, index) => {
          reviewsMap[doctor.id] = reviewsResults[index];
        });

        console.log("results:", results);



        // Transform the API results to match the format expected by the component
        const formattedDoctors = results.map(doctor => ({
          id: doctor.id,
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          name: doctor.name,
          specialty: doctor.specialization,
          experience: `${doctor.experience} Years of experience`,
          votes: `${Math.round(doctor.averageRating * 20)}% (${doctor.reviewCount} votes)`,
          feedback: `${doctor.reviewCount} Feedback`,
          photoUrl: doctor.photoUrl,
          verified: doctor.verified ? "Medical registration verified" : "Registration pending",
          availability: "Available today"
        }));

        setFilteredDoctors(formattedDoctors);
        setDoctorReviews(reviewsMap);
      } else {
        // If no results, fall back to the static data
        setFilteredDoctors([]);
        setDoctorReviews({});
      }
    } catch (err) {
      setError('Failed to load doctor data. Please try again.');
      console.error('Error processing filter results:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Use the filtered doctors if available, otherwise use the static data
  const displayDoctors = filteredDoctors.length > 0 ? filteredDoctors : doctors;

  // Apply default filters on component mount to show best doctors and fetch stats
  useEffect(() => {
    // Fetch system statistics
    fetchSystemStats();

    // Set default filters to show best doctors (highest rated)
    const applyDefaultFilters = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${config.API_URL}/api/doctor/search?sortBy=rating_high&verified=true&limit=5`);
        await handleFilterResults(response.data);
      } catch (error) {
        console.error('Error applying default filters:', error);
        setError('Failed to load initial doctor data.');
      } finally {
        setIsLoading(false);
      }
    };

    applyDefaultFilters();
  }, []);

  useEffect(() => {
    const doctorInterval = setInterval(() => {
      setActiveDoctor((prev) => (prev + 1) % displayDoctors.length);
    }, 5000);

    const testimonialInterval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => {
      clearInterval(doctorInterval);
      clearInterval(testimonialInterval);
    };
  }, [displayDoctors]);

  // Get the longest review with highest rating for the active doctor
  const getBestReview = (doctorId) => {
    if (!doctorId || !doctorReviews[doctorId] || !doctorReviews[doctorId].reviews) {
      return null;
    }

    const reviews = doctorReviews[doctorId].reviews;
    if (reviews.length === 0) return null;

    // Sort reviews by rating (highest first) and then by comment length (longest first)
    return reviews
      .filter(review => review.comment && review.comment.length > 0) // Filter out reviews without comments
      .sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating; // Sort by rating (highest first)
        return b.comment.length - a.comment.length; // Then by comment length (longest first)
      })[0]; // Take the first one (highest rating, longest comment)
  };

  console.log('Display Doctors:', displayDoctors);

  return (
    <div className="appointment-section">
      <div className="appointment-container">
        <div className="appointment-content">
          <h2 className="appointment-title">
            Instant appointment with doctors.<span className="guaranteed">Guaranteed.</span>
          </h2>

          {/* Add the DoctorFilter component */}
          {/* <DoctorFilter onFilterResults={handleFilterResults} /> */}

          {error && <div className="error-message">{error}</div>}
          {isLoading && <div className="loading-indicator">Loading doctors...</div>}

          <div className="appointment-stats">
            <div className="stat-item">
              <i className="fas fa-check-circle check-icon"></i>
              <span>{stats.doctorCount > 0 ? `${stats.doctorCount.toLocaleString()} Verified doctors` : "100,000 Verified doctors"}</span>
            </div>
            <div className="stat-item">
              <i className="fas fa-check-circle check-icon"></i>
              <span>{stats.reviewCount > 0 ? `${stats.reviewCount.toLocaleString()} Total reviews` : "3M+ Patient recommendations"}</span>
            </div>
            <div className="stat-item">
              <i className="fas fa-check-circle check-icon"></i>
              <span>{stats.patientCountThisYear > 0 ? `${stats.patientCountThisYear.toLocaleString()} Patients this year` : "25M Patients/year"}</span>
            </div>
          </div>

          <Link to="/find-specialist" className="find-doctor-btn" >
            Find me the right doctor
          </Link>

          {/* Testimonials section */}
          <div className="testimonial-section">
            <div className="testimonial-carousel">
              {displayDoctors[activeDoctor]?.id && (
                <div className="patient-reviews-section">
                  <h4>Patient Reviews</h4>
                  {/* Display only one review based on length and rating */}
                  {(() => {
                    const bestReview = getBestReview(displayDoctors[activeDoctor].id);
                    if (bestReview) {
                      return (
                        <div className="review-item">
                          <div className="review-rating">
                            {[...Array(5)].map((_, j) => (
                              <i key={j} className={`fas fa-star ${j < bestReview.rating ? 'filled' : ''}`}></i>
                            ))}
                          </div>
                          <p className="review-comment">"{bestReview.comment}"</p>
                          <p className="review-author">- {bestReview.patientName || "Anonymous"}</p>
                        </div>
                      );
                    } else {
                      return <p className="no-reviews">No reviews available</p>;
                    }
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="app-preview">
          {/* Doctor cards section */}
          <div className="phone-mockup">
            <div className="doctor-carousel">
              {displayDoctors.map((doctor, index) => (
                <div
                  key={index}
                  className={`doctor-card ${index === activeDoctor ? 'active' : index === (activeDoctor - 1 + displayDoctors.length) % displayDoctors.length ? 'prev' : ''}`}
                >
                  <div className="doctor-info">
                    <div className="doctor-avatar">
                      {doctor.photoUrl && doctor.photoUrl !== "" ? (
                        <img
                          src={`${config.API_URL}${doctor.photoUrl}`}
                          alt={`${doctor.name}`}
                          onError={(e) => {
                            e.target.src = '/default-doctor.png';
                          }}
                        />
                      ) : (
                        <div className="name-avatar" style={{ backgroundColor: getAvatarColor(doctor.name) }}>
                          {doctor.name
                            .split(' ')
                            .map(name => name.charAt(0))
                            .join('')
                            .substring(0, 2)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="doctor-details">
                      <h4>{doctor.name}</h4>
                      <p>{doctor.specialty}</p>
                    </div>
                  </div>

                  <div className="doctor-stats">
                    {[
                      doctor.experience,
                      doctor.votes,
                      doctor.feedback,
                      doctor.verified,
                      doctor.availability
                    ].map((stat, i) => (
                      <div key={i} className="stat-row">
                        <i className="fas fa-check-circle"></i>
                        <span>{stat}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/find-specialist" className="book-appointment-btn" >
                    Book Appointment
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompoOneForSearchSection;