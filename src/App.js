import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Components
import Header from './components/Header';
import Dashboard from './components/DashBoard';
import VideoUpload from './pages/VideoUpload';
import VideoDetail from './components/VideoDetail';
import ContentPlan from './components/ContentPlan';
import NotFound from './pages/NotFound';

// API config
import { API_BASE_URL } from './config';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
});

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [videos, setVideos] = useState([]);

  // Fetch videos on component mount
  useEffect(() => {
    fetchVideos();
  }, []);

  // Function to fetch all videos
  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/api/videos');
      setVideos(response.data);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to fetch videos. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle video upload
  const handleVideoUpload = async (formData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Add the new video to the videos list
      setVideos((prevVideos) => [...prevVideos, response.data]);
      
      return response.data;
    } catch (err) {
      console.error('Error uploading video:', err);
      setError('Failed to upload video. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to delete a video
  const handleDeleteVideo = async (videoId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await api.delete(`/api/videos/${videoId}`);
      
      // Remove the deleted video from the videos list
      setVideos((prevVideos) => prevVideos.filter((video) => video.id !== videoId));
      
      return true;
    } catch (err) {
      console.error('Error deleting video:', err);
      setError('Failed to delete video. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="app d-flex flex-column min-vh-100">
        <Header />
        
        {error && (
          <div className="alert alert-danger alert-dismissible fade show m-3" role="alert">
            {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError(null)}
              aria-label="Close">
            </button>
          </div>
        )}
        
        <main className="flex-grow-1 container py-4">
          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  videos={videos} 
                  isLoading={isLoading} 
                  onDeleteVideo={handleDeleteVideo}
                  onRefresh={fetchVideos}
                />
              } 
            />
            <Route 
              path="/upload" 
              element={
                <VideoUpload 
                  onUpload={handleVideoUpload} 
                  isLoading={isLoading}
                />
              } 
            />
            <Route 
              path="/videos/:videoId" 
              element={
                <VideoDetail 
                  api={api}
                  onDeleteVideo={handleDeleteVideo}
                />
              } 
            />
            <Route 
              path="/videos/:videoId/content-plan" 
              element={
                <ContentPlan 
                  api={api}
                />
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        <footer className="bg-dark text-white text-center py-3 mt-auto">
          <div className="container">
            <p className="mb-0">Video Highlight Automation &copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>
  );
}

export default App;