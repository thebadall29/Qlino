import React, { useState, useEffect } from 'react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer2/Footer2';
import PatientDashboardCompo from '../../components/PatientDashboad/PatientDashboard';

const PatientDashboard = () => {
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [isFooterLoaded, setIsFooterLoaded] = useState(false);

  useEffect(() => {
    // Trigger content animation after component mounts
    const contentTimer = setTimeout(() => {
      setIsContentLoaded(true);
    }, 100);

    // Trigger footer animation after content animation completes
    const footerTimer = setTimeout(() => {
      setIsFooterLoaded(true);
    }, 900); // 100ms delay + 800ms content animation

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(footerTimer);
    };
  }, []);

  // Animation styles for the main content
  const contentStyle = {
    transform: isContentLoaded ? 'translateY(0)' : 'translateY(30px)',
    opacity: isContentLoaded ? 1 : 0,
    transition: 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.8s ease-out'
  };

  // Animation styles for the footer - slide up from bottom
  const footerStyle = {
    transform: isFooterLoaded ? 'translateY(0)' : 'translateY(50px)',
    opacity: isFooterLoaded ? 1 : 0,
    transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.6s ease-out'
  };

  return (
    <div>
      {/* Header stays in its normal position */}
      <Header />
      
      {/* Animate the main content first */}
      <div style={contentStyle}>
        <PatientDashboardCompo />
      </div>
      
      {/* Footer slides up after content animation */}
      <div style={footerStyle}>
        <Footer />
      </div>
    </div>
  );
};

export default PatientDashboard;