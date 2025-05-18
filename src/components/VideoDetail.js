import React, { useState, useEffect,  } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import HighlightCard from '../pages/HighlightCard';

const VideoDetail = ({ api, onDeleteVideo }) => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [video, setVideo] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHighlight, setSelectedHighlight] = useState(null);
  
  // Fetch video and highlights
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch video details
        const videoResponse = await api.get(`/api/videos/${videoId}`);
        setVideo(videoResponse.data);
        
        // If video is completed, fetch highlights
        if (videoResponse.data.processing_status === 'COMPLETED') {
          const highlightsResponse = await api.get(`/api/videos/${videoId}/highlights`);
          setHighlights(highlightsResponse.data);
          
          // Select the first highlight by default
          if (highlightsResponse.data.length > 0) {
            setSelectedHighlight(highlightsResponse.data[0]);
          }
        } else {
          // If video is still processing, poll for status updates
          pollProcessingStatus();
        }
      } catch (err) {
        console.error('Error fetching video details:', err);
        setError('Failed to load video details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [videoId, api]);
  
  // Poll for processing status updates
  const pollProcessingStatus = async () => {
    const statusInterval = setInterval(async () => {
      try {
        const statusResponse = await api.get(`/api/status/${videoId}`);
        setProcessingStatus(statusResponse.data);
        
        // If processing is complete, fetch video details and highlights
        if (statusResponse.data.status === 'COMPLETED') {
          clearInterval(statusInterval);
          
          const videoResponse = await api.get(`/api/videos/${videoId}`);
          setVideo(videoResponse.data);
          
          const highlightsResponse = await api.get(`/api/videos/${videoId}/highlights`);
          setHighlights(highlightsResponse.data);
          
          // Select the first highlight by default
          if (highlightsResponse.data.length > 0) {
            setSelectedHighlight(highlightsResponse.data[0]);
          }
        } else if (statusResponse.data.status === 'ERROR') {
          clearInterval(statusInterval);
          setError('An error occurred while processing the video.');
        }
      } catch (err) {
        console.error('Error polling status:', err);
        clearInterval(statusInterval);
      }
    }, 5000); // Poll every 5 seconds
    
    // Clean up interval on component unmount
    return () => clearInterval(statusInterval);
  };
  
  // Handle video deletion
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      const success = await onDeleteVideo(videoId);
      
      if (success) {
        navigate('/');
      }
    }
  };
  
  // Handle highlight selection
  const handleHighlightSelect = (highlight) => {
    setSelectedHighlight(highlight);
  };
  
  // Format duration (seconds to MM:SS)
  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get processing status text
  const getProcessingStatusText = () => {
    if (!processingStatus) return 'Processing video...';
    
    switch (processingStatus.status) {
      case 'PROCESSING':
        return 'Processing video...';
      case 'ANALYZING':
        return 'Analyzing video content...';
      case 'EXTRACTING_HIGHLIGHTS':
        return 'Extracting highlights...';
      case 'GENERATING_CONTENT_PLAN':
        return 'Generating content plan...';
      case 'ERROR':
        return 'Error processing video';
      default:
        return 'Processing video...';
    }
  };
  
  // Get processing progress percentage
  const getProcessingProgress = () => {
    if (!processingStatus) return 0;
    
    switch (processingStatus.status) {
      case 'PROCESSING':
        return 25;
      case 'ANALYZING':
        return 50;
      case 'EXTRACTING_HIGHLIGHTS':
        return 75;
      case 'GENERATING_CONTENT_PLAN':
        return 90;
      case 'COMPLETED':
        return 100;
      default:
        return 0;
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="video-detail loading">
        <div className="loader"></div>
        <h2>Loading video details...</h2>
      </div>
    );
  }
  
  // Error state
  if (error || !video) {
    return (
      <div className="video-detail error">
        <div className="error-icon">
          <i className="fas fa-exclamation-circle"></i>
        </div>
        <h2>Error Loading Video</h2>
        <p>{error || 'Video not found'}</p>
        <Link to="/" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }
  
  return (
    <div className="video-detail">
      {/* Video header */}
      <div className="video-header">
        <div className="video-header-content">
          <h1>{video.title}</h1>
          <div className="video-meta">
            <span className="video-duration">
              <i className="far fa-clock"></i> {formatDuration(video.duration)}
            </span>
            <span className="video-upload-date">
              <i className="far fa-calendar-alt"></i> Uploaded on {new Date(video.upload_date).toLocaleDateString()}
            </span>
            <span className={`video-status status-${video.processing_status.toLowerCase()}`}>
              {video.processing_status}
            </span>
          </div>
          {video.description && (
            <p className="video-description">{video.description}</p>
          )}
        </div>
        
        <div className="video-actions">
          {video.processing_status === 'COMPLETED' && (
            <Link to={`/videos/${videoId}/content-plan`} className="btn-secondary">
              <i className="fas fa-calendar-alt"></i> View Content Plan
            </Link>
          )}
          <button onClick={handleDelete} className="btn-danger">
            <i className="fas fa-trash"></i> Delete Video
          </button>
        </div>
      </div>
      
      {/* Processing state */}
      {video.processing_status === 'PROCESSING' && (
        <div className="processing-container">
          <h2>{getProcessingStatusText()}</h2>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${getProcessingProgress()}%` }}
            ></div>
          </div>
          <p>This may take a few minutes. You can close this page and come back later.</p>
        </div>
      )}
      
      {/* Error state */}
      {video.processing_status === 'ERROR' && (
        <div className="error-container">
          <div className="error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2>Processing Error</h2>
          <p>{video.error_message || 'An error occurred while processing the video.'}</p>
          <button onClick={handleDelete} className="btn-danger">
            Delete Video
          </button>
        </div>
      )}
      
      {/* Highlights section (only if processing is complete) */}
      {video.processing_status === 'COMPLETED' && (
        <div className="highlights-container">
          <h2>Highlights</h2>
          
          {highlights.length === 0 ? (
            <div className="no-highlights">
              <p>No highlights were found in this video.</p>
            </div>
          ) : (
            <div className="highlights-content">
              {/* Selected highlight player */}
              <div className="highlight-player">
                {selectedHighlight && (
                  <>
                    <video
                      src={`${process.env.PUBLIC_URL}/${selectedHighlight.clip_path}`}
                      controls
                      autoPlay
                      className="highlight-video"
                    ></video>
                    <div className="highlight-info">
                      <h3>{selectedHighlight.title}</h3>
                      <p>{selectedHighlight.description}</p>
                      <div className="highlight-time">
                        <span>
                          <i className="fas fa-play"></i> 
                          {formatDuration(selectedHighlight.start_time)}
                        </span>
                        <span className="highlight-duration">
                          <i className="fas fa-clock"></i>
                          {formatDuration(selectedHighlight.end_time - selectedHighlight.start_time)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Highlights list */}
              <div className="highlights-list">
                <h3>All Highlights</h3>
                {highlights.map((highlight) => (
                  <HighlightCard
                    key={highlight.id}
                    highlight={highlight}
                    isSelected={selectedHighlight && selectedHighlight.id === highlight.id}
                    onClick={() => handleHighlightSelect(highlight)}
                    formatDuration={formatDuration}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoDetail;