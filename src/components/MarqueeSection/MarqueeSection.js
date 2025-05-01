import React from 'react';
import { Link } from 'react-router-dom';

const MarqueeSection = () => {
  const healthConcerns = [
    {
      icon: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=200&q=80&auto=format",
      title: "Period doubts or Pregnancy",
      link: "/consult/pregnancy"
    },
    {
      icon: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=200&q=80&auto=format",
      title: "Acne, pimple or skin issues",
      link: "/consult/skin"
    },
    {
      icon: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=200&q=80&auto=format",
      title: "Performance issues in bed",
      link: "/consult/performance"
    },
    {
      icon: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=200&q=80&auto=format",
      title: "Cold, cough or fever",
      link: "/consult/fever"
    },
    {
      icon: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=200&q=80&auto=format",
      title: "Child not feeling well",
      link: "/consult/pediatric"
    },
    {
      icon: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=200&q=80&auto=format",
      title: "Depression or anxiety",
      link: "/consult/mental-health"
    }
  ];

  return (
    <div className="health-concerns-section">
      <div className="section-header">
        <div className="header-content">
          <h2>Consult top doctors online for any health concern</h2>
          <p>Private online consultations with verified doctors in all specialists</p>
        </div>
        <Link to="/specialties" className="view-all">View All Specialities</Link>
      </div>
      <div className="concerns-grid">
        {healthConcerns.map((concern, index) => (
          <Link to={concern.link} key={index} className="concern-card">
            <div className="concern-icon">
              <img src={concern.icon} alt={concern.title} />
            </div>
            <h3>{concern.title}</h3>
            <span className="consult-now">CONSULT NOW</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default MarqueeSection;