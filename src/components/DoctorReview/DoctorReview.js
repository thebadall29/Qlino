import React, { useState, useEffect } from 'react';
import './DoctorReview.scss';
import config from '../../config/config';

const DoctorReview = ({ doctorId, reviews, setReviews }) => {
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    if (doctorId) {
      fetchDoctorReviews(doctorId);
    }
  }, [doctorId]);

  const fetchDoctorReviews = async (doctorId) => {
    try {
      setReviewsLoading(true);
      const response = await fetch(`${config.API_URL}/api/doctor/${doctorId}/reviews`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch doctor reviews');
      }
      
      const data = await response.json();
      setReviews(data.reviews || []);
      
      // Set the average rating
      if (data.averageRating) {
        setAverageRating(data.averageRating);
      }
    } catch (error) {
      console.error('Error fetching doctor reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (userRating === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      // Get user data from localStorage if available
      const userData = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
      
      if (!userData) {
        alert('Please log in to submit a review');
        return;
      }
      
      // Prepare review data
      const reviewData = {
        patientId: userData.id,  // Assuming user ID is stored in _id
        patientName: userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : userData.username || 'Anonymous',
        rating: userRating,
        comment: userReview
      };
      
      // Make API call to add review
      const response = await fetch(`${config.API_URL}/api/doctor/${doctorId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(reviewData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit review');
      }
      
      // Get the newly added review from response
      const newReview = await response.json();
      
      // Add the new review to the list and update UI
      setReviews([newReview, ...reviews]);
      
      // Update average rating
      const newTotalRating = reviews.reduce((sum, review) => sum + review.rating, 0) + userRating;
      const newAverageRating = (newTotalRating / (reviews.length + 1)).toFixed(1);
      
      setAverageRating(newAverageRating);
      
      // Reset form
      setUserRating(0);
      setUserReview('');
      
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  const handleRatingClick = (rating) => {
    setUserRating(rating);
  };

  return (
    <div className="review-component">
      <div className="reviews-header">
        <h3>Patient Reviews</h3>
        <div className="overall-rating">
          <div className="rating-stars">
            {Array.from({ length: 5 }).map((_, index) => {
              const starValue = index + 0.5;
              return (
                <i
                  key={index}
                  className={`${averageRating >= index + 1
                    ? 'fas fa-star'
                    : averageRating >= starValue
                      ? 'fas fa-star-half-alt'
                      : 'far fa-star'
                    }`}
                ></i>
              );
            })}
          </div>
          <span className="rating-value">{averageRating || '0.0'}</span>
          <span className="review-count">({reviews.length} reviews)</span>
        </div>
      </div>

      <div className="add-review">
        <h4>Write a Review</h4>
        <form onSubmit={handleSubmitReview}>
          <div className="rating-selector">
            <span>Your Rating:</span>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <i
                  key={star}
                  className={`${userRating >= star ? 'fas fa-star' : 'far fa-star'}`}
                  onClick={() => handleRatingClick(star)}
                ></i>
              ))}
            </div>
          </div>
          <div className="review-input">
            <textarea
              placeholder="Write your review here..."
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
              required
            ></textarea>
          </div>
          <button type="submit" className="submit-review-button">
            Submit Review
          </button>
        </form>
      </div>

      {reviewsLoading ? (
        <div className="loading">
          <p>Loading reviews...</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div key={index} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <span className="reviewer-name">{review.patientName || 'Anonymous'}</span>
                    <span className="review-date">{new Date(review.date || review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="review-rating">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <i
                        key={i}
                        className={`${review.rating > i ? 'fas fa-star' : 'far fa-star'}`}
                      ></i>
                    ))}
                  </div>
                </div>
                <div className="review-content">
                  <p>{review.comment}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="no-reviews">No reviews yet. Be the first to review!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorReview;