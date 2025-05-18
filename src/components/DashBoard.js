import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = ({ videos, isLoading, onDeleteVideo, onRefresh }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // Filter videos based on selected filter
  const filteredVideos = videos.filter(video => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'processing') return video.processing_status === 'PROCESSING';
    if (selectedFilter === 'completed') return video.processing_status === 'COMPLETED';
    if (selectedFilter === 'error') return video.processing_status === 'ERROR';
    return true;
  });
  
  // Sort videos by upload date (most recent first)
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    return new Date(b.upload_date) - new Date(a.upload_date);
  });
  
  // Function to handle video deletion
  const handleDelete = async (videoId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      await onDeleteVideo(videoId);
    }
  };
  
  // Function to format the upload date
  const formatUploadDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };
  
  // Function to get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'status-badge-success';
      case 'PROCESSING':
        return 'status-badge-processing';
      case 'ERROR':
        return 'status-badge-error';
      default:
        return 'status-badge-default';
    }
  };
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Video Dashboard</h1>
        <div className="dashboard-actions">
          <button 
            onClick={onRefresh} 
            className="btn-refresh"
            disabled={isLoading}
          >
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
          <Link to="/upload" className="btn-primary">
            <i className="fas fa-plus"></i> New Upload
          </Link>
        </div>
      </div>
      
      <div className="filter-container">
        <div className="filter-buttons">
          <button 
            className={selectedFilter === 'all' ? 'active' : ''} 
            onClick={() => setSelectedFilter('all')}
          >
            All Videos
          </button>
          <button 
            className={selectedFilter === 'processing' ? 'active' : ''} 
            onClick={() => setSelectedFilter('processing')}
          >
            Processing
          </button>
          <button 
            className={selectedFilter === 'completed' ? 'active' : ''} 
            onClick={() => setSelectedFilter('completed')}
          >
            Completed
          </button>
          <button 
            className={selectedFilter === 'error' ? 'active' : ''} 
            onClick={() => setSelectedFilter('error')}
          >
            Error
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading videos...</p>
        </div>
      ) : sortedVideos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <i className="fas fa-film"></i>
          </div>
          <h2>No videos found</h2>
          <p>
            {selectedFilter !== 'all' ? 
              `No videos with status "${selectedFilter}" found. Try a different filter or upload a new video.` : 
              'Upload your first video to get started.'}
          </p>
          <Link to="/upload" className="btn-primary">
            Upload Video
          </Link>
        </div>
      ) : (
        <div className="video-grid">
          {sortedVideos.map((video) => (
            <Link
              to={`/videos/${video.id}`}
              className="video-card"
              key={video.id}
            >
              <div className="video-thumbnail">
                {/* Display video thumbnail or placeholder */}
                {video.thumbnail_path ? (
                  <img 
                    src={`/api/thumbnails/${video.id}`} 
                    alt={video.title} 
                  />
                ) : (
                  <div className="thumbnail-placeholder">
                    <i className="fas fa-film"></i>
                  </div>
                )}
                
                {/* Status badge */}
                <div className={`status-badge ${getStatusBadgeClass(video.processing_status)}`}>
                  {video.processing_status}
                </div>
              </div>
              
              <div className="video-info">
                <h3 className="video-title">{video.title}</h3>
                <p className="video-meta">
                  {video.duration ? `${Math.floor(video.duration / 60)}:${String(Math.floor(video.duration % 60)).padStart(2, '0')} • ` : ''}
                  {formatUploadDate(video.upload_date)}
                </p>
                
                {video.highlights_count > 0 && (
                  <div className="highlights-count">
                    <i className="fas fa-star"></i> {video.highlights_count} highlights
                  </div>
                )}
                
                <div className="video-actions">
                  <button
                    onClick={(e) => handleDelete(video.id, e)}
                    className="btn-delete"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;