import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VIDEO_CONFIG } from '../config';


const VideoUpload = ({ onUpload, isLoading }) => {
  const navigate = useNavigate();
  
  // State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadProgress] = useState(0);
  const [error, setError] = useState(null);
  
  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Check file type
    if (!VIDEO_CONFIG.allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload MP4, MOV, or AVI files only.');
      return;
    }
    
    // Check file size
    if (file.size > VIDEO_CONFIG.maxFileSize) {
      setError(`File is too large. Maximum size is ${VIDEO_CONFIG.maxFileSize / (1024 * 1024)}MB.`);
      return;
    }
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    
    setSelectedFile(file);
    setPreviewUrl(url);
    setError(null);
    
    // Extract filename as default title
    if (!title) {
      const filename = file.name.split('.').slice(0, -1).join('.');
      setTitle(filename);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a video file to upload.');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title || selectedFile.name);
      formData.append('description', description);
      
      const videoData = await onUpload(formData);
      
      // Navigate to the video detail page
      navigate(`/videos/${videoData.id}`);
    } catch (err) {
      setError('Failed to upload video. Please try again.');
      console.error('Upload error:', err);
    }
  };
  
  return (
    <div className="video-upload">
      <h1>Upload Video</h1>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="file-upload-container">
          <label className="file-upload-label">
            {previewUrl ? (
              <div className="video-preview-container">
                <video
                  className="video-preview"
                  src={previewUrl}
                  controls
                ></video>
              </div>
            ) : (
              <div className="upload-placeholder">
                <div className="upload-icon">
                  <i className="fas fa-cloud-upload-alt"></i>
                </div>
                <p>Drag & drop your video here or click to browse</p>
                <p className="file-types">
                  Supported formats: MP4, MOV, AVI (max {VIDEO_CONFIG.maxFileSize / (1024 * 1024)}MB)
                </p>
              </div>
            )}
            <input 
              type="file" 
              accept="video/mp4,video/quicktime,video/x-msvideo"
              onChange={handleFileChange}
              className="file-input" 
            />
          </label>
        </div>
        
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your video"
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a description for your video (optional)"
            rows={4}
            disabled={isLoading}
          ></textarea>
        </div>
        
        {isLoading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p>{uploadProgress}% Uploaded</p>
          </div>
        )}
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/')}
            className="btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={!selectedFile || isLoading}
          >
            {isLoading ? 'Uploading...' : 'Upload Video'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VideoUpload;