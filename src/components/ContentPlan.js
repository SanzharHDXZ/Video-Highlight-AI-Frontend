import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SOCIAL_PLATFORMS } from '../config';


const ContentPlan = ({ api }) => {
  const { videoId } = useParams();
  
  // State
  const [video, setVideo] = useState(null);
  const [contentPlan, setContentPlan] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState('all');
  
  // Fetch content plan and related data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch video details
        const videoResponse = await api.get(`/api/videos/${videoId}`);
        setVideo(videoResponse.data);
        
        // Fetch content plan
        const contentPlanResponse = await api.get(`/api/videos/${videoId}/content_plan`);
        setContentPlan(contentPlanResponse.data);
        
        // Fetch highlights
        const highlightsResponse = await api.get(`/api/videos/${videoId}/highlights`);
        setHighlights(highlightsResponse.data);
      } catch (err) {
        console.error('Error fetching content plan:', err);
        setError('Failed to load content plan. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [videoId, api]);
  
  // Filter posts by platform
  const filteredPosts = contentPlan?.posts.filter(post => {
    if (selectedPlatformFilter === 'all') return true;
    return post.platform.toLowerCase() === selectedPlatformFilter.toLowerCase();
  }) || [];
  
  // Get platform details by ID
  const getPlatformDetails = (platformId) => {
    const platform = SOCIAL_PLATFORMS.find(p => 
      p.id.toLowerCase() === platformId.toLowerCase()
    );
    
    return platform || {
      id: platformId.toLowerCase(),
      name: platformId,
      icon: 'share-alt',
      color: '#666666',
    };
  };
  
  // Handle publishing to social media
  const handlePublish = async (post) => {
    alert(`Publishing to ${post.platform} feature coming soon!`);
  };
  
  // Copy caption to clipboard
  const handleCopyCaption = (caption) => {
    navigator.clipboard.writeText(caption);
    alert('Caption copied to clipboard');
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get highlight by ID
  const getHighlightById = (clipId) => {
    return highlights.find(h => h.id === clipId);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="content-plan loading">
        <div className="loader"></div>
        <h2>Loading content plan...</h2>
      </div>
    );
  }
  
  // Error state
  if (error || !contentPlan) {
    return (
      <div className="content-plan error">
        <div className="error-icon">
          <i className="fas fa-exclamation-circle"></i>
        </div>
        <h2>Error Loading Content Plan</h2>
        <p>{error || 'Content plan not found'}</p>
        <Link to={`/videos/${videoId}`} className="btn-primary">
          Back to Video
        </Link>
      </div>
    );
  }
  
  return (
    <div className="content-plan">
      {/* Content plan header */}
      <div className="content-plan-header">
        <div className="content-plan-title">
          <h1>Content Plan</h1>
          <h2>{video?.title}</h2>
        </div>
        
        <div className="content-plan-actions">
          <Link to={`/videos/${videoId}`} className="btn-secondary">
            <i className="fas fa-arrow-left"></i> Back to Video
          </Link>
        </div>
      </div>
      
      {/* Content plan summary */}
      <div className="content-plan-summary">
        <div className="summary-card">
          <div className="summary-icon">
            <i className="fas fa-film"></i>
          </div>
          <div className="summary-content">
            <h3>Total Highlights</h3>
            <p>{highlights.length}</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">
            <i className="fas fa-share-alt"></i>
          </div>
          <div className="summary-content">
            <h3>Total Posts</h3>
            <p>{contentPlan.posts.length}</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div className="summary-content">
            <h3>Generated On</h3>
            <p>{formatDate(contentPlan.generated_date)}</p>
          </div>
        </div>
      </div>
      
      {/* Platform filter */}
      <div className="platform-filter">
        <h3>Filter by Platform</h3>
        <div className="filter-buttons">
          <button
            className={selectedPlatformFilter === 'all' ? 'active' : ''}
            onClick={() => setSelectedPlatformFilter('all')}
          >
            All Platforms
          </button>
          
          {Array.from(new Set(contentPlan.posts.map(post => post.platform.toLowerCase()))).map(platform => {
            const platformDetails = getPlatformDetails(platform);
            
            return (
              <button
                key={platform}
                className={selectedPlatformFilter === platform ? 'active' : ''}
                onClick={() => setSelectedPlatformFilter(platform)}
                style={{ color: platformDetails.color }}
              >
                <i className={`fab fa-${platformDetails.icon}`}></i> {platformDetails.name}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Content posts */}
      <div className="content-posts">
        <h2>Scheduled Posts</h2>
        
        {filteredPosts.length === 0 ? (
          <div className="no-posts">
            <p>No posts found for the selected platform.</p>
          </div>
        ) : (
          <div className="posts-grid">
            {filteredPosts.map((post, index) => {
              const highlight = getHighlightById(post.clip_id);
              const platformDetails = getPlatformDetails(post.platform);
              
              return (
                <div className="post-card" key={index}>
                  <div className="post-platform" style={{ backgroundColor: platformDetails.color }}>
                    <i className={`fab fa-${platformDetails.icon}`}></i> {platformDetails.name}
                  </div>
                  
                  {highlight && (
                    <div className="post-thumbnail">
                      {highlight.thumbnail_path ? (
                        <img 
                          src={`${process.env.PUBLIC_URL}/${highlight.thumbnail_path}`}
                          alt={post.title} 
                        />
                      ) : (
                        <div className="thumbnail-placeholder">
                          <i className="fas fa-image"></i>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="post-content">
                    <h3>{post.title}</h3>
                    <p className="post-date">
                      <i className="fas fa-calendar"></i> Post on {formatDate(post.suggested_posting_date)}
                    </p>
                    
                    <div className="post-caption">
                      <p>{post.caption}</p>
                      <button 
                        className="btn-copy"
                        onClick={() => handleCopyCaption(post.caption)}
                        title="Copy caption"
                      >
                        <i className="fas fa-copy"></i>
                      </button>
                    </div>
                    
                    <div className="post-hashtags">
                      {post.hashtags.map((hashtag, i) => (
                        <span key={i} className="hashtag">#{hashtag}</span>
                      ))}
                    </div>
                    
                    <div className="post-actions">
                      <Link 
                        to={`/videos/${videoId}`} 
                        className="btn-secondary"
                        title="View highlight"
                      >
                        <i className="fas fa-play"></i> View Highlight
                      </Link>
                      <button 
                        className="btn-primary"
                        onClick={() => handlePublish(post)}
                        title={`Publish to ${platformDetails.name}`}
                      >
                        <i className="fas fa-share-alt"></i> Publish
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentPlan;