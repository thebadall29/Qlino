import React, { useState, useEffect } from 'react';
// import './CompoOneForSearchSection.css'; 
const CompoOneForSearchSection = () => {
  const [activeDoctor, setActiveDoctor] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
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

  useEffect(() => {
    const doctorInterval = setInterval(() => {
      setActiveDoctor((prev) => (prev + 1) % doctors.length);
    }, 5000);

    const testimonialInterval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => {
      clearInterval(doctorInterval);
      clearInterval(testimonialInterval);
    };
  }, []);

  return (
    <div className="appointment-section">
      <div className="appointment-container">
        <div className="appointment-content">
          <h2 className="appointment-title">
            Instant appointment with doctors.<span className="guaranteed">Guaranteed.</span>
          </h2>
          
          <div className="appointment-stats">
            <div className="stat-item">
              <i className="fas fa-check-circle check-icon"></i>
              <span>100,000 Verified doctors</span>
            </div>
            <div className="stat-item">
              <i className="fas fa-check-circle check-icon"></i>
              <span>3M+ Patient recommendations</span>
            </div>
            <div className="stat-item">
              <i className="fas fa-check-circle check-icon"></i>
              <span>25M Patients/year</span>
            </div>
          </div>
          
          <button className="find-doctor-btn">Find me the right doctor</button>
          
          <div className="testimonial-section">
            <div className="testimonial-carousel">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index} 
                  className={`testimonial-item ${
                    index === activeTestimonial ? 'active' : 
                    index === (activeTestimonial - 1 + testimonials.length) % testimonials.length ? 'prev' : ''
                  }`}
                >
                  <div className="rating">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <i key={i} className="fas fa-star"></i>
                    ))}
                  </div>
                  <p className="testimonial-text">{testimonial.text}</p>
                  <div className="testimonial-author">
                    <div className="author-avatar">{testimonial.avatar}</div>
                    <span className="author-name">{testimonial.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="app-preview">
          <div className="phone-mockup">
            <div className="doctor-carousel">
              {doctors.map((doctor, index) => (
                <div 
                  key={index} 
                  className={`doctor-card ${
                    index === activeDoctor ? 'active' : 
                    index === (activeDoctor - 1 + doctors.length) % doctors.length ? 'prev' : ''
                  }`}
                >
                  <div className="doctor-info">
                    <div className="doctor-avatar"></div>
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
                  
                  <div className="location-map"></div>
                  
                  <button className="book-appointment-btn">Book Appointment</button>
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