import React, { useState } from 'react';

const EducationalResources = () => {
  const [resourceType, setResourceType] = useState('articles');

  const articles = [
    { id: 1, title: 'Understanding Diabetes Management', type: 'Article', description: 'A comprehensive guide to managing diabetes through diet, exercise, and medication.', author: 'Dr. Maria Chen', date: '2023-09-15' },
    { id: 2, title: 'Heart Health Basics', type: 'Article', description: 'Learn about heart disease prevention and management strategies.', author: 'American Heart Association', date: '2023-08-22' },
    { id: 3, title: 'The Importance of Vaccination', type: 'Video', description: 'Educational video explaining how vaccines work and their importance for public health.', duration: '12 minutes', presenter: 'Dr. James Wilson' },
  ];

  const webinars = [
    { id: 1, title: 'Stress Management Techniques', date: '2023-11-20', time: '6:00 PM EST', presenter: 'Dr. Sarah Johnson, Psychologist', description: 'Learn effective techniques to manage stress and improve mental well-being.' },
    { id: 2, title: 'Nutrition for Chronic Disease Management', date: '2023-12-05', time: '7:00 PM EST', presenter: 'Lisa Martinez, Registered Dietitian', description: 'Discover how nutrition can help manage chronic conditions like diabetes and heart disease.' }
  ];

  const forumPosts = [
    { id: 1, title: 'Tips for Managing Medication Side Effects', author: 'HealthAdvocate', date: '2023-10-28', replies: 15, excerpt: "I've been experiencing some side effects from my blood pressure medication. Has anyone found effective ways to manage them?" },
    { id: 2, title: 'Exercise Recommendations for Arthritis', author: 'ActiveLiving', date: '2023-11-02', replies: 8, excerpt: "Looking for gentle exercise recommendations that won't aggravate my arthritis but will help maintain mobility." },
    { id: 3, title: 'Sleep Improvement Strategies', author: 'RestWell', date: '2023-11-10', replies: 12, excerpt: "I've been struggling with insomnia lately. What strategies have worked for you to improve sleep quality?" }
  ];

  return (
    <div className="section-container">
      <h2>Educational Resources</h2>

      <div className="resource-tabs">
        <button className={resourceType === 'articles' ? 'active' : ''} onClick={() => setResourceType('articles')}>Articles & Videos</button>
        <button className={resourceType === 'webinars' ? 'active' : ''} onClick={() => setResourceType('webinars')}>Upcoming Webinars</button>
        <button className={resourceType === 'forum' ? 'active' : ''} onClick={() => setResourceType('forum')}>Community Forum</button>
      </div>

      {resourceType === 'articles' && (
        <div className="section">
          <h3>Articles & Videos</h3>
          <div className="resources-list">
            {articles.map(article => (
              <div key={article.id} className="resource-card">
                <div className="resource-icon">{article.type === 'Article' ? '📄' : '🎥'}</div>
                <div className="resource-info">
                  <h4>{article.title}</h4>
                  <span className="resource-type">{article.type}</span>
                  <p>{article.description}</p>
                  {article.author && <p className="resource-meta">By: {article.author}</p>}
                  {article.presenter && <p className="resource-meta">Presenter: {article.presenter}</p>}
                  {article.date && <p className="resource-meta">Published: {article.date}</p>}
                  {article.duration && <p className="resource-meta">Duration: {article.duration}</p>}
                </div>
                <button className="view-resource">View</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {resourceType === 'webinars' && (
        <div className="section">
          <h3>Upcoming Webinars & Workshops</h3>
          <div className="webinars-list">
            {webinars.map(webinar => (
              <div key={webinar.id} className="webinar-card">
                <div className="webinar-header">
                  <h4>{webinar.title}</h4>
                  <span className="webinar-date">{webinar.date} at {webinar.time}</span>
                </div>
                <p className="webinar-presenter">Presenter: {webinar.presenter}</p>
                <p className="webinar-description">{webinar.description}</p>
                <div className="webinar-actions">
                  <button className="register-button">Register</button>
                  <button className="remind-button">Set Reminder</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {resourceType === 'forum' && (
        <div className="section">
          <h3>Community Forum</h3>
          <div className="forum-posts">
            {forumPosts.map(post => (
              <div key={post.id} className="forum-post">
                <div className="post-header">
                  <h4>{post.title}</h4>
                  <span className="post-replies">{post.replies} replies</span>
                </div>
                <p className="post-meta">Posted by <span className="post-author">{post.author}</span> on {post.date}</p>
                <p className="post-excerpt">{post.excerpt}</p>
                <button className="view-thread">View Thread</button>
              </div>
            ))}
          </div>
          <button className="new-post-button">Create New Post</button>
        </div>
      )}
    </div>
  );
};

export default EducationalResources;
