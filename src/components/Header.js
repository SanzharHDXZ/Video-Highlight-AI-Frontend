import React from 'react';
import { Link, useLocation } from 'react-router-dom';


const Header = () => {
  const location = useLocation();
  
  // Function to check if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <h1>Video Highlight AI</h1>
          </Link>
        </div>
        
        <nav className="main-nav">
          <ul>
            <li>
              <Link 
                to="/" 
                className={isActive('/') ? 'active' : ''}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/upload" 
                className={isActive('/upload') ? 'active' : ''}
              >
                Upload Video
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="user-actions">
          <Link to="/upload" className="btn-primary">
            <i className="fas fa-upload"></i> Upload New
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;