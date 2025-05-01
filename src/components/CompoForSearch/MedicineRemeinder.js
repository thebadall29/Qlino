import React from 'react';

const MedicineReminder = () => {
  return (
    <div className="medicine-reminder-section">
      <div className="reminder-container">
        <div className="reminder-intro">
          <div className="intro-content">
            <h1>Take Your Medicines<br />On Time, Every Time</h1>
            <p>Stay healthy with our smart medicine reminder system</p>
            
            <div className="feature-list">
              <div className="feature-item">
                <i className="fas fa-bell"></i>
                <span>Smart Reminders</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-history"></i>
                <span>Track Medicine History</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-calendar-check"></i>
                <span>Daily Schedule</span>
              </div>
            </div>

            <button className="add-medicine-btn">
              Add Your Medicines
            </button>
          </div>
          
          <div className="intro-illustration">
            <div className="medicine-box-graphic">
              <img 
                src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2830&auto=format&fit=crop" 
                alt="Medicine Reminder" 
                className="medicine-image"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineReminder;