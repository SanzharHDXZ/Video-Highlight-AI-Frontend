import React from 'react';


const HighlightCard = ({ highlight, isSelected, onClick, formatDuration }) => {
  // Calculate duration
  const duration = highlight.end_time - highlight.start_time;
  
  return (
    <div 
      className={`highlight-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="highlight-card-thumbnail">
        {highlight.thumbnail_path ? (
          <img 
            src={`${process.env.PUBLIC_URL}/${highlight.thumbnail_path}`}
            alt={highlight.title} 
          />
        ) : (
          <div className="thumbnail-placeholder">
            <i className="fas fa-film"></i>
          </div>
        )}
        
        <div className="highlight-duration-badge">
          {formatDuration(duration)}
        </div>
      </div>
      
      <div className="highlight-card-content">
        <h4>{highlight.title}</h4>
        <p className="highlight-timestamp">
          {formatDuration(highlight.start_time)} - {formatDuration(highlight.end_time)}
        </p>
        {highlight.description && (
          <p className="highlight-description">{highlight.description}</p>
        )}
      </div>
      
      {isSelected && (
        <div className="highlight-card-selected-indicator">
          <i className="fas fa-check-circle"></i>
        </div>
      )}
    </div>
  );
};

export default HighlightCard;